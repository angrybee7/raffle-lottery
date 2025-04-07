import { PublicKey } from "@solana/web3.js";

const LOTTERY = new PublicKey("3Mn91FYEzJeEHyQNAuUdc6QhCPQzdCx3wUfXB2yN3rJQ");

async function main() {
    try {
        const lotteryAccount = await pg.program.account.lottery.fetch(LOTTERY);
        console.log("Current tickets:", lotteryAccount.ticketBuyers.length);

        await pg.program.methods.updateBypass(true)
        .accounts({
            lottery: LOTTERY,
            authority: pg.wallet.publicKey,
        })
        .rpc();
        console.log("Bypass enabled");

        await pg.program.methods.requestRandomness()
        .accounts({
            lottery: LOTTERY,
        })
        .rpc();
        console.log("Randomness requested");

        const drawTx = await pg.program.methods.processRandomness()
        .accounts({
            lottery: LOTTERY,
            treasury: lotteryAccount.treasury,
            winner: lotteryAccount.ticketBuyers[0],
            authority: pg.wallet.publicKey,
            systemProgram: PublicKey.default,
        })
        .rpc();
        console.log("Draw completed:", drawTx);
    } catch (err) {
        console.error("Error:", err);
        if (err.errorLogs) console.error("Details:", err.errorLogs);
    }
}

main();