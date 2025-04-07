import { PublicKey } from "@solana/web3.js";

const LOTTERY = new PublicKey("4MrReFCTQzRDMSHLZjJcx5tz6GJzVSNPF3KJAJEZ311u");
const VRF_ACCOUNT = new PublicKey("5xrhQ1AzsReqs8G5p5P827N8dZKFvLguX1XkobtQTJCu");

async function main() {
    try {
        const lotteryAccount = await pg.program.account.lottery.fetch(LOTTERY);
        console.log("Current tickets:", lotteryAccount.ticketBuyers.length);

        // Enable bypass if necessary
        await pg.program.methods.updateBypass(true)
        .accounts({
            lottery: LOTTERY,
            authority: pg.wallet.publicKey,
        })
        .rpc();
        console.log("Bypass enabled");

        // Request randomness
        await pg.program.methods.requestRandomness()
        .accounts({
            lottery: LOTTERY,
            vrfAccount: VRF_ACCOUNT,
        })
        .rpc();
        console.log("Randomness requested");

        // After requesting randomness, we can now process it to select a winner.
        // This assumes randomness has been successfully requested and is available.

        // Fetch the lottery account to see if randomness has been processed
        const lotteryAccountWithRandomness = await pg.program.account.lottery.fetch(LOTTERY);
        console.log("Randomness requested:", lotteryAccountWithRandomness.randomness_requested);

        if (!lotteryAccountWithRandomness.randomness_requested) {
            throw new Error("Randomness has not been requested or processed yet");
        }

        // Calculate winner index using randomness - ensure it's within the ticketBuyers array
        const winnerIndex = lotteryAccountWithRandomness.randomness % lotteryAccountWithRandomness.ticketBuyers.length;
        const winner = lotteryAccountWithRandomness.ticketBuyers[winnerIndex];
        console.log("Winner selected:", winner);

        // Process the winner and complete the lottery draw
        const drawTx = await pg.program.methods.processRandomness()
        .accounts({
            lottery: LOTTERY,
            treasury: lotteryAccountWithRandomness.treasury,
            winner: winner, // Use the winner calculated from randomness
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

