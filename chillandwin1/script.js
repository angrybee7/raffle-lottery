class SolanaWallet {
  constructor() {
    this.connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
    this.programId = new solanaWeb3.PublicKey('HZ6Qw6n5CjnXSkvaBJ4wRT2yY9SaThACvnTDvS86uwvw');
    this.initializeElements();
    this.addEventListeners();
    this.isLoading = false;
  }

  initializeElements() {
    this.connectButton = document.getElementById('connectButton');
    this.disconnectButton = document.getElementById('disconnectButton');
    this.walletInfo = document.getElementById('walletInfo');
    this.walletAddress = document.getElementById('walletAddress');
    this.walletBalance = document.getElementById('walletBalance');
    this.lotteryControls = document.getElementById('lotteryControls');
    
    // Lottery elements
    this.createLotteryButton = document.getElementById('createLottery');
    this.buyTicketButton = document.getElementById('buyTicket');
    this.drawWinnerButton = document.getElementById('drawWinner');
  }

  addEventListeners() {
    this.connectButton.addEventListener('click', () => this.connectWallet());
    this.disconnectButton.addEventListener('click', () => this.disconnectWallet());
    this.createLotteryButton.addEventListener('click', () => this.createLottery());
    this.buyTicketButton.addEventListener('click', () => this.buyTicket());
    this.drawWinnerButton.addEventListener('click', () => this.drawWinner());
  }

  async connectWallet() {
    try {
      if (!window.solana || !window.solana.isPhantom) {
        alert('Phantom wallet is not installed!');
        window.open('https://phantom.app/', '_blank');
        return;
      }

      const resp = await window.solana.connect();
      this.publicKey = resp.publicKey;
      await this.updateWalletInfo();
      this.lotteryControls.style.display = 'block';
    } catch (err) {
      console.error('Error connecting wallet:', err);
      alert('Failed to connect wallet');
    }
  }

  async disconnectWallet() {
    try {
      await window.solana.disconnect();
      this.walletInfo.style.display = 'none';
      this.lotteryControls.style.display = 'none';
      this.connectButton.style.display = 'block';
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    }
  }

  async updateWalletInfo() {
    try {
      const balance = await this.connection.getBalance(this.publicKey);
      this.walletAddress.textContent = this.publicKey.toString();
      this.walletBalance.textContent = (balance / solanaWeb3.LAMPORTS_PER_SOL).toFixed(4);
      this.walletInfo.style.display = 'block';
      this.connectButton.style.display = 'none';
    } catch (err) {
      console.error('Error updating wallet info:', err);
    }
  }

  setLoading(loading) {
    this.isLoading = loading;
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.disabled = loading;
      button.style.opacity = loading ? '0.5' : '1';
    });
  }

  validateLotteryInputs() {
    const ticketPrice = parseFloat(document.getElementById('ticketPrice').value);
    const winnerPercentage = parseInt(document.getElementById('winnerPercentage').value);
    const threshold = parseFloat(document.getElementById('threshold').value);

    if (isNaN(ticketPrice) || ticketPrice <= 0) {
      throw new Error('Invalid ticket price');
    }
    if (isNaN(winnerPercentage) || winnerPercentage < 1 || winnerPercentage > 100) {
      throw new Error('Winner percentage must be between 1 and 100');
    }
    if (isNaN(threshold) || threshold <= 0) {
      throw new Error('Invalid threshold');
    }
  }

  async createLottery() {
    try {
      this.setLoading(true);
      this.validateLotteryInputs();
      const ticketPrice = parseFloat(document.getElementById('ticketPrice').value) * solanaWeb3.LAMPORTS_PER_SOL;
      const winnerPercentage = parseInt(document.getElementById('winnerPercentage').value);
      const threshold = parseFloat(document.getElementById('threshold').value) * solanaWeb3.LAMPORTS_PER_SOL;

      const lottery = anchor.web3.Keypair.generate();
      
      const provider = anchor.AnchorProvider.env();
      anchor.setProvider(provider);

      const program = new anchor.Program(IDL, this.programId, provider);
      
      const tx = await program.methods
        .createLottery(
          new anchor.BN(ticketPrice),
          winnerPercentage,
          new anchor.BN(threshold)
        )
        .accounts({
          lottery: lottery.publicKey,
          authority: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([lottery])
        .rpc();

      alert(`Lottery created! Address: ${lottery.publicKey.toString()}`);
      console.log("Transaction signature:", tx);
    } catch (err) {
      console.error("Error creating lottery:", err);
      alert("Failed to create lottery: " + err.message);
    } finally {
      this.setLoading(false);
    }
  }

  async buyTicket() {
    try {
      this.setLoading(true);
      const lotteryAddress = new solanaWeb3.PublicKey(document.getElementById('lotteryAddress').value);
      
      const provider = anchor.AnchorProvider.env();
      anchor.setProvider(provider);

      const program = new anchor.Program(IDL, this.programId, provider);

      const tx = await program.methods
        .buyTicket()
        .accounts({
          lottery: lotteryAddress,
          buyer: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      alert("Ticket purchased successfully!");
      console.log("Transaction signature:", tx);
    } catch (err) {
      console.error("Error buying ticket:", err);
      alert("Failed to buy ticket");
    } finally {
      this.setLoading(false);
    }
  }

  async drawWinner() {
    try {
      this.setLoading(true);
      const lotteryAddress = new solanaWeb3.PublicKey(document.getElementById('lotteryAddress').value);
      
      const provider = anchor.AnchorProvider.env();
      anchor.setProvider(provider);

      const program = new anchor.Program(IDL, this.programId, provider);

      const tx = await program.methods
        .drawWinner()
        .accounts({
          lottery: lotteryAddress,
          authority: provider.wallet.publicKey,
        })
        .rpc();

      alert("Winner drawn successfully!");
      console.log("Transaction signature:", tx);
    } catch (err) {
      console.error("Error drawing winner:", err);
      alert("Failed to draw winner");
    } finally {
      this.setLoading(false);
    }
  }
}

// IDL definition
const IDL = {
  "version": "0.1.0",
  "name": "solana_lottery",
  "instructions": [
    {
      "name": "createLottery",
      "accounts": [
        {
          "name": "lottery",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ticketPrice",
          "type": "u64"
        },
        {
          "name": "winnerPercentage",
          "type": "u8"
        },
        {
          "name": "threshold",
          "type": "u64"
        }
      ]
    },
    {
      "name": "buyTicket",
      "accounts": [
        {
          "name": "lottery",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ]
};

window.addEventListener('load', () => {
  new SolanaWallet();
});
