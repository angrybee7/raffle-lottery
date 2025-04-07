// Wen mainnet? Not yet fam, we're staying on devnet for now 🚀
const IS_MAINNET = false; // WAGMI on devnet first

// The good stuff - where we're gonna deploy our galaxy brain code 🌌
const NETWORKS = {
  // Testing grounds (devnet) - where we ape in safely 🦍
  DEVNET: {
    NETWORK: 'devnet',
    PROGRAM_ID: '2NKe5gPUWQBvNqJ3SHKofxB85KsXy7yAFDewpSZYG9uy',    // Our lottery's brain address (smart contract) 🧠
    LOTTERY_ADDRESS: 'FCtmHc8pE2hi9aHSJe1QzuWuwPP24G4aDdGBQMRBjbJ', // The actual lottery - where the magic happens ✨
    TREASURY_ADDRESS: 'DsVW3LGHi8FHRhy3yPzjX6WbgZvfFSZ7Dn4oKquHC8ok', // Treasury wallet for fees and stuff 💰
    RPC_ENDPOINT: 'https://api.devnet.solana.com',                    // How we talk to Solana (devnet edition) 🗣️
  },
  // The promised land (mainnet) - where we'll be rolling with the whales 🐋
  MAINNET: {
    NETWORK: 'mainnet-beta',
    PROGRAM_ID: 'production_program_id_here',      // TODO: Drop the real deal here wen launch 🚀
    LOTTERY_ADDRESS: 'production_lottery_address_here', // Future home of our lottery (wen moon?) 🌕
    TREASURY_ADDRESS: 'production_treasury_here',   // Future treasury address
    RPC_ENDPOINT: 'https://api.mainnet-beta.solana.com',
  }
};

// IYKYK - picking which network we're aping into 🦧
const SELECTED_NETWORK = IS_MAINNET ? NETWORKS.MAINNET : NETWORKS.DEVNET;

// The master config - all the sauce in one place 🔥
export const CONFIG = {
  // Yoink all the network settings
  ...SELECTED_NETWORK,
  
  // What we're calling this bad boy
  APP_TITLE: 'Chill and Win',
  
  // How sure we wanna be about our transactions going through
  // 'processed' = trust me bro
  // 'confirmed' = pretty sure
  // 'finalized' = ultra mega sure
  COMMITMENT: 'processed',
  
  // For checking if we're playing with real money or magic internet money
  isMainnet: () => IS_MAINNET,
  isDev: () => (!IS_MAINNET)  // Added parentheses to make precedence explicit 🔍
}; 
