import { initializeKeypair } from "./initializeKeypair";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";

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

async function tokenMintAccount(
    connection: web3.Connection,
    payer: web3.Keypair,
    mint: web3.PublicKey,
    owner: web3.PublicKey,
): Promise<web3.PublicKey> {
    const tokenAccount = await token.createAccount(connection, payer, mint, owner);

    return tokenAccount;
}

async function main() {
    const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
    const user = await initializeKeypair(connection);

    console.log("PublicKey:", user.publicKey.toBase58());
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
