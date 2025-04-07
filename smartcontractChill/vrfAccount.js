// Import required modules
import { Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";

// Constants
const SWITCHBOARD_PROGRAM_ID = new PublicKey("SW1TCH7qEPTdLsDHRgPuMQjbQxKdH2aBStViMFnt64f"); // Switchboard Devnet Program ID
const ON_DEMAND_ORACLE_QUEUE = new PublicKey("8tM5UuZcADP1sh3j9XSfq6mCbA8i4rXnhtMvkzySgzYR"); // On-Demand Oracle Queue (Devnet)

// Use Solana Playground's wallet and connection
const wallet = pg.wallet; // Provided by Solana Playground
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

async function createVrfAccount() {
    try {
        // Step 1: Generate a new keypair for the VRF account
        const vrfKeypair = Keypair.generate();
        console.log("New VRF Account Public Key:", vrfKeypair.publicKey.toBase58());

        // Step 2: Derive the lease account public key
        const [leaseAccountPublicKey] = await PublicKey.findProgramAddress(
            [Buffer.from("LeaseAccountData"), ON_DEMAND_ORACLE_QUEUE.toBytes(), vrfKeypair.publicKey.toBytes()],
            SWITCHBOARD_PROGRAM_ID
        );
        console.log("Lease Account Public Key:", leaseAccountPublicKey.toBase58());

        // Step 3: Calculate the rent-exempt balance for the VRF account
        const space = 1000; // Space for VRF account (adjust as needed)
        const rentExemptBalance = await connection.getMinimumBalanceForRentExemption(space);
        console.log("Rent-Exempt Balance for VRF Account:", rentExemptBalance);

        // Step 4: Create the VRF account
        const createVrfTransaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: vrfKeypair.publicKey,
                lamports: rentExemptBalance, // Use the calculated rent-exempt balance
                space: space, // Space for VRF account
                programId: SWITCHBOARD_PROGRAM_ID,
            })
        );

        // Sign and send the transaction using sendAndConfirmTransaction
        const txSignature = await sendAndConfirmTransaction(connection, createVrfTransaction, [wallet.keypair, vrfKeypair]);
        console.log("VRF Account Created! Transaction Signature:", txSignature);

        // Step 5: Fund the lease account
        const fundTransaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: leaseAccountPublicKey,
                lamports: 1 * LAMPORTS_PER_SOL, // Fund with 1 SOL
            })
        );

        const fundTxSignature = await sendAndConfirmTransaction(connection, fundTransaction, [wallet.keypair]);
        console.log("Lease Account Funded! Transaction Signature:", fundTxSignature);

        console.log("VRF Account and Lease Account Setup Complete!");
    } catch (err) {
        console.error("Error creating VRF account:", err.message || err);
        throw err;
    }
}

(async () => {
    try {
        await createVrfAccount();
    } catch (err) {
        console.error("Error details:", err.message || err);
    }
})();