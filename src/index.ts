import { initializeKeypair } from "./initializeKeypair";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import bs58 from 'bs58';
// Initialize new mint
async function createNewMint(
    connection: web3.Connection,
    payer: web3.Keypair,
    mintAuthority: web3.PublicKey,
    freezeAuthority: web3.PublicKey,
    decimals: number,
): Promise<web3.PublicKey> {
    const mint = await token.createMint(
        connection,
        payer,
        mintAuthority,
        freezeAuthority,
        decimals,
    );

    console.log(`The token mint account address is ${mint}`);
    console.log(`Token Mint: https://explorer.solana.com/address/${mint}?cluster=devnet`);

    return mint;
}

// Create mint account
async function tokenTokenAccount(
    connection: web3.Connection,
    payer: web3.Keypair,
    mint: web3.PublicKey,
    owner: web3.PublicKey,
): Promise<token.Account> {
    const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        owner,
    );

    return tokenAccount;
}

// Mint token
async function mintToken(
    connection: web3.Connection,
    payer: web3.Keypair,
    mint: web3.PublicKey,
    destination: web3.PublicKey,
    authority: web3.Keypair,
    amount: number,
) {
    const mintInfo = await token.getMint(connection, mint);
    console.log("amount => ", amount * 10 ** mintInfo.decimals);

    const tnxSignature = await token.mintTo(
        connection,
        payer,
        mint,
        destination,
        authority,
        // whatever the amount of decimal is x that with 10^2
        /*
          so if we have 
          amount = 1, decimals = 2  
          then amount will be 100 and recipient will recieve 100 * 0.01 = 1 token
        */
        amount * 10 ** mintInfo.decimals,
    );

    console.log(
        `Mint Token Transaction: https://explorer.solana.com/tx/${tnxSignature}?cluster=devnet`,
    );
}

// transfer token
async function transferTokens(
    connection: web3.Connection,
    payer: web3.Keypair,
    source: web3.PublicKey,
    destination: web3.PublicKey,
    owner: web3.PublicKey,
    amount: number,
    mint: web3.PublicKey,
) {
    const mintInfo = await token.getMint(connection, mint);

    const tnxSignature = await token.transfer(
        connection,
        payer,
        source,
        destination,
        owner,
        amount * 10 ** mintInfo.decimals,
    );

    console.log(
        `Transfer Transaction: https://explorer.solana.com/tx/${tnxSignature}?cluster=devnet`,
    );
}

async function burnTokens(
    connection: web3.Connection,
    payer: web3.Keypair,
    account: web3.PublicKey,
    mint: web3.PublicKey,
    owner: web3.Keypair,
    amount: number,
) {
    const mintInfo = await token.getMint(connection, mint);

    const transactionSignature = await token.burn(
        connection,
        payer,
        account,
        mint,
        owner,
        amount * 10 ** mintInfo.decimals,
    );

    console.log(
        `Burn Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`,
    );
}

async function main() {
    const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
    const user = await initializeKeypair(connection);
    
    const reciever = web3.Keypair.generate();
    // const localWallet = bs58.decode('');
    // const reciever = web3.Keypair.fromSecretKey(localWallet)
    // console.log({newKeypair: newKeypair.publicKey.toBase58() ,localWallet});
    

    // decimals set to 2 = 0.01
    // decimals set to 3 = 0.001
    const mint = await createNewMint(connection, user, user.publicKey, user.publicKey, 2);

    const tokenAccount = await tokenTokenAccount(connection, user, mint, user.publicKey);
    const recieverTokenAccount = await tokenTokenAccount(
        connection,
        user,
        mint,
        reciever.publicKey,
    );

    await mintToken(connection, user, mint, tokenAccount.address, user, 100);
    await transferTokens(
        connection,
        user,
        tokenAccount.address,
        recieverTokenAccount.address,
        user.publicKey,
        50,
        mint,
    );

    await burnTokens(connection, user, tokenAccount.address, mint, user, 25);
}

main()
    .then(() => {
        console.log("Finished successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
