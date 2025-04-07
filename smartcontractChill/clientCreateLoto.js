import { PublicKey, Keypair } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("ybtr8sZyNTJREkcr6yzfNmLy9fZdVtTPz9d5QHJ4HaA");
const TREASURY = new PublicKey("Cqn7JWx3uCB8iyv5iYbS2L278ZqczGnxnmf6wk7Up38p");
const LAMPORTS_PER_SOL = 1000000000;

async function main() {
    const lottery = Keypair.generate();

    try {
        const tx = await pg.program.methods.createLottery(
            new anchor.BN(0.001 * LAMPORTS_PER_SOL),
            90,
            new anchor.BN(10 * LAMPORTS_PER_SOL),
            TREASURY
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