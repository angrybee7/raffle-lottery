import { PublicKey, Keypair } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("2NKe5gPUWQBvNqJ3SHKofxB85KsXy7yAFDewpSZYG9uy");
const TREASURY = new PublicKey("DsVW3LGHi8FHRhy3yPzjX6WbgZvfFSZ7Dn4oKquHC8ok");
const LAMPORTS_PER_SOL = 1000000000;
const VRF_ACCOUNT = new PublicKey("5xrhQ1AzsReqs8G5p5P827N8dZKFvLguX1XkobtQTJCu")

async function main() {
    const lottery = Keypair.generate();

    try {
        const tx = await pg.program.methods.createLottery(
            new anchor.BN(0.1 * LAMPORTS_PER_SOL),
            70,
            new anchor.BN(10 * LAMPORTS_PER_SOL),
            TREASURY,
        )
        .accounts({
            lottery: lottery.publicKey,
            authority: pg.wallet.publicKey,
            treasury: TREASURY,
            systemProgram: PublicKey.default,
        })
        .signers([lottery])
        .rpc();

        console.log("🎲 Lottery:", lottery.publicKey.toString());
        console.log("📜 Signature:", tx);
    } catch (err) {
        console.error("Error:", err);
        if (err.errorLogs) console.error("Details:", err.errorLogs);
    }
}

main();