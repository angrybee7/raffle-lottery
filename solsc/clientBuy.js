import { PublicKey } from "@solana/web3.js";

const LOTTERY = new PublicKey("3Mn91FYEzJeEHyQNAuUdc6QhCPQzdCx3wUfXB2yN3rJQ");

async function main() {
    try {
        const tx = await pg.program.methods.buyTicket(
            new anchor.BN(2)
        )
        .accounts({
            lottery: LOTTERY,
            buyer: pg.wallet.publicKey,
            systemProgram: PublicKey.default,
        })
        .rpc();

        const lotteryAccount = await pg.program.account.lottery.fetch(LOTTERY);
        console.log("🎫 Tickets bought:", tx);
        console.log("💰 Prize pool:", lotteryAccount.prizePool.toString());
        console.log("🎟️ Total tickets:", lotteryAccount.ticketBuyers.length);
    } catch (err) {
        console.error("Error:", err);
        if (err.errorLogs) console.error("Details:", err.errorLogs);
    }
}

main();