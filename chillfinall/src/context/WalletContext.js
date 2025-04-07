// Loading up the essentials for our wallet magic ✨
import React, { createContext, useContext, useState } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { IDL } from '../constants/idl';
import { CONFIG } from '../config/constants';

// Creating the secret sauce that makes our wallet work everywhere 🌍
const WalletContext = createContext();

// The hook that lets us tap into the wallet goodness 🪝
export function useWallet() {
  return useContext(WalletContext);
}

// The big daddy component that shares wallet data with everyone 🎯
export function WalletProvider({ children }) {
  // Setting up our wallet state - gotta track those gainz 📈
  const [publicKey, setPublicKey] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Establishing our connection to the Solana mothership 🚀
  const connection = new Connection(
    CONFIG.RPC_ENDPOINT || clusterApiUrl(CONFIG.NETWORK), 
    CONFIG.COMMITMENT
  );
  // Getting our program's address ready for action 🏠
  const programId = new PublicKey(CONFIG.PROGRAM_ID);

  // The function that gets us connected to the promised land 🌈
  const connectWallet = async () => {
    try {
      // Making sure Phantom is in the house 👻
      if (!window.solana || !window.solana.isPhantom) {
        alert('Phantom wallet is not installed!');
        window.open('https://phantom.app/', '_blank');
        return;
      }

      // Time to link up with Phantom 🔗
      const resp = await window.solana.connect();
      setPublicKey(resp.publicKey);
      await updateWalletInfo(resp.publicKey);
    } catch (err) {
      // Something went wrong in the matrix 😅
      console.error('Error connecting wallet:', err);
      alert('Failed to connect wallet');
    }
  };

  // When it's time to say goodbye (for now) 👋
  const disconnectWallet = async () => {
    try {
      await window.solana.disconnect();
      setPublicKey(null);
      setBalance(null);
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    }
  };

  // Checking how much SOL we're working with 💰
  const updateWalletInfo = async (pubKey) => {
    try {
      const balance = await connection.getBalance(pubKey);
      setBalance((balance / LAMPORTS_PER_SOL).toFixed(4));
    } catch (err) {
      console.error('Error updating wallet info:', err);
    }
  };

  // Packaging up all our wallet goodies to share 🎁
  const value = {
    publicKey,
    balance,
    isLoading,
    setIsLoading,
    connectWallet,
    disconnectWallet,
    connection,
    programId
  };

  // Spreading the wallet love to all our components 💝
  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
} 