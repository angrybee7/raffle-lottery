// Importing the good stuff we need to make this thing work 🛠️
import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { IDL } from '../constants/idl';
import { CONFIG } from '../config/constants';

import { Buffer } from 'buffer';

if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

// Pop-up that shows up when we hit a transaction W 🎯
const TransactionModal = ({ isOpen, onClose, tx }) => {
  if (!isOpen) return null;
  
  // Building that sweet Solscan link to flex our transactions 💪
  const solscanUrl = `https://${CONFIG.isDev() ? 'solscan.io/tx/' : 'solscan.io/tx/'}${tx}?cluster=${CONFIG.isDev() ? 'devnet' : 'mainnet'}`;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Transaction Successful!</h3>
        <p>Transaction: <span className="tx-hash">{tx}</span></p>
        <p><a href={solscanUrl} target="_blank" rel="noopener noreferrer">View on Solscan</a></p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

// The main show - where all the lottery magic happens ✨
function LotteryApp() {
  // Grabbing all our wallet goodies from context 🎒
  const { publicKey, balance, isLoading, setIsLoading, connectWallet, disconnectWallet, connection, programId } = useWallet();
  // Where our lottery lives on-chain 🏠
  const lotteryAddress = CONFIG.LOTTERY_ADDRESS;
  // State for our transaction flex modal 💅
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTx, setCurrentTx] = useState(null);

  // Function to ape into a lottery ticket 🎫
  const buyTicket = async () => {
    try {
      // Let everyone know we're cooking 👨‍🍳
      setIsLoading(true);
      
      // Setting up our connection to the Solana kitchen 🔌
      const provider = new anchor.AnchorProvider(
        connection,
        window.solana,
        { preflightCommitment: 'processed' }
      );
      anchor.setProvider(provider);
      
      // Getting our lottery program ready to cook 🧑‍🍳
      const program = new anchor.Program(IDL, programId, provider);

      // // Sending it! 🚀
      // const tx = await program.methods
      //   .buyTicket(new anchor.BN(1)) // Buying 1 ticket
      //   .accounts({
      //     lottery: new PublicKey(lotteryAddress),
      //     buyer: provider.wallet.publicKey,
      //     systemProgram: anchor.web3.SystemProgram.programId,
      //   })
      //   .rpc();

      let tempLottery = new PublicKey(lotteryAddress);
console.log(tempLottery);

let tempBuy = provider.wallet.publicKey;
console.log(tempBuy)

let tempProgram = anchor.web3.SystemProgram.programId;
console.log(tempProgram);

const tx = await program.methods
        .buyTicket(new anchor.BN(1)) // Buying 1 ticket
        .accounts({
          lottery: tempLottery,
          buyer: tempBuy,
          systemProgram: tempProgram,
        })
        .rpc();

      // Transaction went through? Time to flex 💪
      console.log("Transaction signature:", tx);
      setCurrentTx(tx);
      setModalOpen(true);
    } catch (err) {
      // Oof, something went wrong 😅
      console.error("Error buying ticket:", err);
      alert("Failed to buy ticket: " + err.message);
    } finally {
      // Back to chill mode 😎
      setIsLoading(false);
    }
  };

  // The UI - making it look pretty for the degens 🎨
  return (
    <div className="container">
      <h1>{CONFIG.APP_TITLE}</h1>
      {/* Letting the plebs know we're on devnet 😉 */}
      {CONFIG.isDev() && (
        <div className="network-badge">
          DEVNET MODE
        </div>
      )}
      
      {/* No wallet? No problem! Connect that bad boy 🔌 */}
      {!publicKey ? (
        <button onClick={connectWallet} disabled={isLoading}>Connect Wallet</button>
      ) : (
        <>
          {/* Showing off them wallet stats 💰 */}
          <div id="walletInfo">
            <p>Wallet Address: <span>{publicKey.toString()}</span></p>
            <p>Balance: <span>{balance}</span> SOL</p>
            <button onClick={disconnectWallet} disabled={isLoading}>Disconnect</button>
          </div>

          {/* The lottery control center - where dreams come true 🎰 */}
          <div id="lotteryControls">
            <h2>Lottery Pool</h2>
            <p>Pool Address: <code>{lotteryAddress}</code></p>
            <div className="lottery-actions">
              <button onClick={buyTicket} disabled={isLoading}>Buy Ticket</button>
            </div>
          </div>
        </>
      )}
      
      {/* Our victory modal - for when we hit those sweet Ws 🏆 */}
      <TransactionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        tx={currentTx} 
      />
    </div>
  );
}

export default LotteryApp; 