export const IDL = {
  "version": "0.1.0",
  "name": "solana_lottery",
  "instructions": [
    {
      "name": "updateBypass",
      "accounts": [
        {
          "name": "lottery",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "bypassValue",
          "type": "bool"
        }
      ]
    },
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
          "name": "treasury",
          "isMut": false,
          "isSigner": false
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
        },
        {
          "name": "treasury",
          "type": "publicKey"
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
      "args": [
        {
          "name": "numTickets",
          "type": "u64"
        }
      ]
    },
    {
      "name": "requestRandomness",
      "accounts": [
        {
          "name": "lottery",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "processRandomness",
      "accounts": [
        {
          "name": "lottery",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "winner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
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
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Lottery",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
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
          },
          {
            "name": "treasury",
            "type": "publicKey"
          },
          {
            "name": "randomnessRequested",
            "type": "bool"
          },
          {
            "name": "prizePool",
            "type": "u64"
          },
          {
            "name": "ticketBuyers",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "bypass",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "LotteryCreated",
      "fields": [
        {
          "name": "lottery",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "ticketPrice",
          "type": "u64",
          "index": false
        },
        {
          "name": "winnerPercentage",
          "type": "u8",
          "index": false
        },
        {
          "name": "threshold",
          "type": "u64",
          "index": false
        },
        {
          "name": "treasury",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "TicketsPurchased",
      "fields": [
        {
          "name": "lottery",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "buyer",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "numTickets",
          "type": "u64",
          "index": false
        },
        {
          "name": "totalCost",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "RandomnessRequested",
      "fields": [
        {
          "name": "lottery",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "RandomnessProcessed",
      "fields": [
        {
          "name": "lottery",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "winner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "prize",
          "type": "u64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "RandomnessAlreadyRequested",
      "msg": "Randomness has already been requested."
    },
    {
      "code": 6001,
      "name": "RandomnessNotRequested",
      "msg": "Randomness has not been requested yet."
    },
    {
      "code": 6002,
      "name": "ThresholdNotMet",
      "msg": "Prize pool does not meet the required threshold."
    },
    {
      "code": 6003,
      "name": "NumericalOverflow",
      "msg": "Numerical overflow occurred."
    },
    {
      "code": 6004,
      "name": "NoTicketsSold",
      "msg": "No tickets sold."
    },
    {
      "code": 6005,
      "name": "InvalidWinnerPercentage",
      "msg": "Invalid winner percentage."
    }
  ]
}; 