// Bringing in the crew for our degen lottery app 🎰
import React from 'react';
import { WalletProvider } from './context/WalletContext';
import LotteryApp from './components/LotteryApp';
import './App.css';

// The main app - where the magic begins 🌟
function App() {
  return (
    // Wrapping everything in our wallet provider - gotta keep those funds safe 🔒
    <WalletProvider>
      {/* The container for all our lottery degenery 🎲 */}
      <div className="App">
        <LotteryApp />
      </div>
    </WalletProvider>
  );
}

export default App; 