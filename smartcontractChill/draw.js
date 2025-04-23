import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Keypair,
} from "@solana/web3.js";

const LOTTERY = new PublicKey("5fdaHXpiaQJ1XfHNzYninmcp7f278ccJDPykhmtaL5bd");

async function main() {
  try {
    const vrfKeypair = new PublicKey("6ASf5EcmmEHTgDJ4X4ZT5vT6iHVJBXPg5AN5YoTCpGWt");
  
    const authority = Keypair.fromSecretKey(new Uint8Array( [34, 70, 94, 49, 90, 65, 41, 4, 5, 90, 83, 123, 121, 200, 165, 95, 22, 34, 73, 49, 199, 33, 198, 81, 250, 241, 88, 170, 18, 164, 98, 129, 244, 214, 100, 178, 94, 247, 38, 181, 246, 140, 21, 99, 110, 112, 10, 194, 235, 150, 218, 237, 154, 109, 28, 5, 245, 60, 221, 221, 33, 174, 185, 32]));
    const lotteryAccount = await pg.program.account.lottery.fetch(LOTTERY);
    console.log("Current tickets:", lotteryAccount.ticketBuyers.length);

    await pg.program.methods
      .updateBypass(true)
      .accounts({
        lottery: LOTTERY,
        authority: pg.wallet.publicKey,
      })
      .signers([authority])
      .rpc();
    console.log("Bypass enabled");

    await pg.program.methods
      .requestRandomness()
      .accounts({
        lottery: LOTTERY,
      })
      .rpc();
    console.log("Randomness requested");

    const drawTx = await pg.program.methods
      .processRandomness()
      .accounts({
        lottery: LOTTERY,
        treasury: lotteryAccount.treasury,
        winner: vrfKeypair,
        authority: pg.wallet.publicKey,
      })
      .rpc();
    console.log("Draw completed:", drawTx);

    const winner = new PublicKey(lotteryAccount.winner);

    await pg.program.methods
      .sendPrize()
      .accounts({
        lottery: LOTTERY,
        winner: winner,
        treasury: lotteryAccount.treasury,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
  } catch (err) {
    console.error("Error:", err);
    if (err.errorLogs) console.error("Details:", err.errorLogs);
  }
}

main();
