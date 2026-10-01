/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/cat_code.json`.
 */
export type CatCode = {
  "address": "5NcZtR9fHHPQDDe4V9F1LV3c9D8mcEaL9383FERjriJN",
  "metadata": {
    "name": "catCode",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Cat Code cipher-puzzle reward program (first draft, unaudited)"
  },
  "instructions": [
    {
      "name": "acceptOwner",
      "discriminator": [
        176,
        23,
        41,
        28,
        23,
        111,
        8,
        4
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "newOwner",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "addExcluded",
      "discriminator": [
        78,
        206,
        68,
        166,
        123,
        236,
        225,
        160
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "config"
          ]
        }
      ],
      "args": [
        {
          "name": "wallet",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "cancelRound",
      "docs": [
        "Emergency cancel of an Open round (not Revealing: once a valid answer",
        "is on-chain the solver must be paid). Funds stay in the vault."
      ],
      "discriminator": [
        82,
        70,
        134,
        54,
        46,
        96,
        148,
        8
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round.id",
                "account": "round"
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "config"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "claimHolderReward",
      "docs": [
        "Permissionless claim (holder or crank pays the fee); funds go to the",
        "wallet in the leaf. Excluded wallets cannot claim."
      ],
      "discriminator": [
        51,
        163,
        15,
        252,
        248,
        154,
        190,
        46
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "holderPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "distribution",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  105,
                  115,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "distribution.id",
                "account": "distribution"
              }
            ]
          }
        },
        {
          "name": "claimant",
          "writable": true
        },
        {
          "name": "payer",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u32"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "proof",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        }
      ]
    },
    {
      "name": "closeDistribution",
      "docs": [
        "Permissionless, after the claim deadline: releases unclaimed funds back",
        "to the pool (for later distributions) and refunds rent to whoever paid."
      ],
      "discriminator": [
        238,
        70,
        219,
        176,
        69,
        243,
        141,
        230
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "holderPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "distribution",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  105,
                  115,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "distribution.id",
                "account": "distribution"
              }
            ]
          }
        },
        {
          "name": "rentPayer",
          "writable": true,
          "relations": [
            "distribution"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "closeGuess",
      "docs": [
        "Reclaim rent of a guess account once its round is finished."
      ],
      "discriminator": [
        68,
        146,
        22,
        96,
        3,
        94,
        107,
        154
      ],
      "accounts": [
        {
          "name": "round",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round.id",
                "account": "round"
              }
            ]
          },
          "relations": [
            "guess"
          ]
        },
        {
          "name": "guess",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  117,
                  101,
                  115,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "round"
              },
              {
                "kind": "account",
                "path": "solver"
              }
            ]
          }
        },
        {
          "name": "solver",
          "writable": true,
          "signer": true,
          "relations": [
            "guess"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "commitGuess",
      "docs": [
        "Phase 1: seal a guess.",
        "commitment = sha256(salt || canonical(answer) || solver_pubkey || nonce)",
        "Charges `guess_fee_lamports` into the vault; enforces per-wallet cooldown",
        "and max commits. Re-committing overwrites the previous guess and",
        "restarts the reveal delay."
      ],
      "discriminator": [
        116,
        86,
        218,
        54,
        77,
        153,
        60,
        230
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round.id",
                "account": "round"
              }
            ]
          }
        },
        {
          "name": "guess",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  117,
                  101,
                  115,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "round"
              },
              {
                "kind": "account",
                "path": "solver"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "solver",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "commitment",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "deposit",
      "docs": [
        "Anyone (fee wallet, operator, crank, donor) can add SOL to the vault.",
        "Allowed even while paused."
      ],
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "depositor",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "expireRound",
      "docs": [
        "Permissionless, after the deadline of an Open round (nobody revealed a",
        "valid answer). Funds never left the vault, so they simply roll over.",
        "The operator must then `publish_answer` before the next round."
      ],
      "discriminator": [
        238,
        222,
        71,
        141,
        104,
        222,
        76,
        248
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round.id",
                "account": "round"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "finalizeRound",
      "docs": [
        "Permissionless, after the reveal window: pays the candidate 70%, moves",
        "20% to the holder pool, leaves 10% (and anything above rent) in the vault."
      ],
      "discriminator": [
        239,
        160,
        254,
        11,
        254,
        144,
        53,
        148
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round.id",
                "account": "round"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "holderPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "winner",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "docs": [
        "One-time setup. Must be signed by the program's upgrade authority (so",
        "nobody can front-run initialization after deploy). Applies default",
        "params (20-slot reveal delay, etc.); the owner can change them later."
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "holderPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "program",
          "address": "5NcZtR9fHHPQDDe4V9F1LV3c9D8mcEaL9383FERjriJN"
        },
        {
          "name": "programData"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "owner",
          "type": "pubkey"
        },
        {
          "name": "operator",
          "type": "pubkey"
        },
        {
          "name": "feeWallet",
          "type": "pubkey"
        },
        {
          "name": "tokenMint",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "postHolderDistribution",
      "docs": [
        "Operator posts the indexer's Merkle root for a SOLVED round (one",
        "distribution per round). Caps: total <= owner cap and <= unreserved",
        "pool balance; every claim <= owner per-claim cap."
      ],
      "discriminator": [
        94,
        107,
        79,
        163,
        167,
        85,
        174,
        24
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round.id",
                "account": "round"
              }
            ]
          }
        },
        {
          "name": "holderPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  111,
                  108,
                  100,
                  101,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "distribution",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  105,
                  115,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "config.distribution_count",
                "account": "config"
              }
            ]
          }
        },
        {
          "name": "operator",
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "numLeaves",
          "type": "u32"
        },
        {
          "name": "merkleRoot",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "totalAmount",
          "type": "u64"
        },
        {
          "name": "claimDeadline",
          "type": "i64"
        },
        {
          "name": "snapshotHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "proposeOwner",
      "discriminator": [
        90,
        57,
        141,
        110,
        196,
        241,
        172,
        39
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "config"
          ]
        }
      ],
      "args": [
        {
          "name": "newOwner",
          "type": {
            "option": "pubkey"
          }
        }
      ]
    },
    {
      "name": "publishAnswer",
      "docs": [
        "Publish the salt + answer of an Expired or Cancelled round. Anyone may",
        "call it (normally the operator); it only succeeds with the true",
        "preimage, so it doubles as an on-chain proof the puzzle was solvable."
      ],
      "discriminator": [
        213,
        15,
        77,
        252,
        132,
        223,
        85,
        71
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round.id",
                "account": "round"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "salt",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "answer",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "removeExcluded",
      "discriminator": [
        228,
        2,
        99,
        32,
        226,
        165,
        42,
        234
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "config"
          ]
        }
      ],
      "args": [
        {
          "name": "wallet",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "reveal",
      "docs": [
        "Phase 2 (\"submit answer\"): reveal salt + answer + nonce.",
        "",
        "Earliest-commit-wins: the first valid reveal moves the round to",
        "`Revealing` and opens a window of `reveal_window_slots`. During the",
        "window, any other valid reveal whose commit slot is STRICTLY EARLIER",
        "replaces the candidate. After the window, `finalize_round` pays the",
        "candidate. A sniper who copies a revealed answer can only commit",
        "afterwards (and commits are closed once Revealing), so they always lose."
      ],
      "discriminator": [
        9,
        35,
        59,
        190,
        167,
        249,
        76,
        115
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round.id",
                "account": "round"
              }
            ]
          },
          "relations": [
            "guess"
          ]
        },
        {
          "name": "guess",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  117,
                  101,
                  115,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "round"
              },
              {
                "kind": "account",
                "path": "solver"
              }
            ]
          }
        },
        {
          "name": "solver",
          "writable": true,
          "signer": true,
          "relations": [
            "guess"
          ]
        }
      ],
      "args": [
        {
          "name": "salt",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "answer",
          "type": "bytes"
        },
        {
          "name": "nonce",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "setOperator",
      "docs": [
        "Rotate the operator (AI bot) key. The old operator is automatically",
        "added to the exclusion list (if there is room) so a retired or",
        "compromised bot key can never win or claim."
      ],
      "discriminator": [
        238,
        153,
        101,
        169,
        243,
        131,
        36,
        1
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "config"
          ]
        }
      ],
      "args": [
        {
          "name": "newOperator",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "setPaused",
      "discriminator": [
        91,
        60,
        125,
        192,
        176,
        225,
        166,
        218
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "config"
          ]
        }
      ],
      "args": [
        {
          "name": "paused",
          "type": "bool"
        }
      ]
    },
    {
      "name": "startRound",
      "docs": [
        "Operator opens a round. `answer_commitment` = sha256(salt || canonical(answer))",
        "where `salt` is a fresh 32-byte secret. Neither the answer nor the salt",
        "is ever written on-chain before a reveal/publish."
      ],
      "discriminator": [
        144,
        144,
        43,
        7,
        193,
        42,
        217,
        215
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config.round_count",
                "account": "config"
              }
            ]
          }
        },
        {
          "name": "operator",
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "answerCommitment",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "unlockTs",
          "type": "i64"
        },
        {
          "name": "deadlineTs",
          "type": "i64"
        }
      ]
    },
    {
      "name": "updateParams",
      "discriminator": [
        108,
        178,
        190,
        95,
        94,
        203,
        116,
        20
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "config"
          ]
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "gameParams"
            }
          }
        }
      ]
    },
    {
      "name": "verifyAnswer",
      "docs": [
        "Read-only verification for finished rounds: succeeds iff",
        "sha256(salt || canonical(answer)) equals the round commitment. Use via",
        "simulateTransaction (free) or send it to leave a public record.",
        "Disabled while a round is live so nobody leaks a plaintext by accident."
      ],
      "discriminator": [
        104,
        185,
        176,
        10,
        235,
        163,
        173,
        18
      ],
      "accounts": [
        {
          "name": "round",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round.id",
                "account": "round"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "salt",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "answer",
          "type": "bytes"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    },
    {
      "name": "distribution",
      "discriminator": [
        176,
        85,
        17,
        11,
        13,
        194,
        18,
        1
      ]
    },
    {
      "name": "guessCommitment",
      "discriminator": [
        221,
        158,
        68,
        108,
        59,
        218,
        167,
        226
      ]
    },
    {
      "name": "holderPool",
      "discriminator": [
        145,
        79,
        18,
        222,
        226,
        163,
        196,
        46
      ]
    },
    {
      "name": "round",
      "discriminator": [
        87,
        127,
        165,
        51,
        73,
        78,
        116,
        174
      ]
    },
    {
      "name": "vault",
      "discriminator": [
        211,
        8,
        232,
        43,
        2,
        152,
        117,
        119
      ]
    }
  ],
  "events": [
    {
      "name": "answerPublished",
      "discriminator": [
        65,
        138,
        113,
        208,
        207,
        241,
        194,
        199
      ]
    },
    {
      "name": "answerRevealed",
      "discriminator": [
        108,
        185,
        191,
        223,
        25,
        20,
        238,
        193
      ]
    },
    {
      "name": "answerVerified",
      "discriminator": [
        172,
        95,
        221,
        76,
        247,
        249,
        97,
        232
      ]
    },
    {
      "name": "deposited",
      "discriminator": [
        111,
        141,
        26,
        45,
        161,
        35,
        100,
        57
      ]
    },
    {
      "name": "distributionClosed",
      "discriminator": [
        153,
        191,
        189,
        253,
        61,
        165,
        69,
        0
      ]
    },
    {
      "name": "exclusionChanged",
      "discriminator": [
        134,
        61,
        151,
        35,
        46,
        140,
        176,
        85
      ]
    },
    {
      "name": "guessCommitted",
      "discriminator": [
        174,
        25,
        105,
        114,
        240,
        123,
        51,
        187
      ]
    },
    {
      "name": "holderDistributionPosted",
      "discriminator": [
        167,
        239,
        215,
        47,
        74,
        45,
        190,
        82
      ]
    },
    {
      "name": "holderRewardClaimed",
      "discriminator": [
        38,
        51,
        8,
        24,
        30,
        110,
        96,
        202
      ]
    },
    {
      "name": "initialized",
      "discriminator": [
        208,
        213,
        115,
        98,
        115,
        82,
        201,
        209
      ]
    },
    {
      "name": "operatorChanged",
      "discriminator": [
        231,
        79,
        62,
        226,
        190,
        139,
        176,
        51
      ]
    },
    {
      "name": "ownerTransferProposed",
      "discriminator": [
        119,
        170,
        252,
        170,
        114,
        87,
        148,
        79
      ]
    },
    {
      "name": "ownerTransferred",
      "discriminator": [
        89,
        151,
        211,
        37,
        242,
        213,
        63,
        105
      ]
    },
    {
      "name": "paramsUpdated",
      "discriminator": [
        2,
        163,
        138,
        99,
        135,
        11,
        136,
        169
      ]
    },
    {
      "name": "pauseChanged",
      "discriminator": [
        238,
        188,
        213,
        78,
        134,
        209,
        178,
        218
      ]
    },
    {
      "name": "roundCancelled",
      "discriminator": [
        238,
        141,
        105,
        175,
        182,
        158,
        15,
        7
      ]
    },
    {
      "name": "roundExpired",
      "discriminator": [
        93,
        120,
        89,
        173,
        92,
        124,
        70,
        38
      ]
    },
    {
      "name": "roundSolved",
      "discriminator": [
        75,
        4,
        231,
        105,
        202,
        154,
        148,
        249
      ]
    },
    {
      "name": "roundStarted",
      "discriminator": [
        180,
        209,
        2,
        244,
        238,
        48,
        170,
        120
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "notOwner",
      "msg": "Signer is not the owner"
    },
    {
      "code": 6001,
      "name": "notOperator",
      "msg": "Signer is not the operator"
    },
    {
      "code": 6002,
      "name": "notPendingOwner",
      "msg": "No pending owner, or signer is not the pending owner"
    },
    {
      "code": 6003,
      "name": "notUpgradeAuthority",
      "msg": "Initializer must be the program's upgrade authority"
    },
    {
      "code": 6004,
      "name": "paused",
      "msg": "Program is paused"
    },
    {
      "code": 6005,
      "name": "roundAlreadyActive",
      "msg": "A round is already active"
    },
    {
      "code": 6006,
      "name": "publishRequired",
      "msg": "Previous round's answer must be published first"
    },
    {
      "code": 6007,
      "name": "badRoundState",
      "msg": "Round is not accepting this action in its current state"
    },
    {
      "code": 6008,
      "name": "roundStillActive",
      "msg": "Round is still active"
    },
    {
      "code": 6009,
      "name": "roundLocked",
      "msg": "Round is not unlocked yet"
    },
    {
      "code": 6010,
      "name": "roundExpired",
      "msg": "Round deadline has passed"
    },
    {
      "code": 6011,
      "name": "deadlineNotReached",
      "msg": "Round deadline has not passed yet"
    },
    {
      "code": 6012,
      "name": "revealWindowClosed",
      "msg": "Reveal window has closed"
    },
    {
      "code": 6013,
      "name": "revealWindowOpen",
      "msg": "Reveal window is still open"
    },
    {
      "code": 6014,
      "name": "notEarlierCommit",
      "msg": "Another valid reveal with an earlier or equal commit is already the candidate"
    },
    {
      "code": 6015,
      "name": "revealTooEarly",
      "msg": "Reveal is too early; wait for the minimum slot delay after committing"
    },
    {
      "code": 6016,
      "name": "guessCooldown",
      "msg": "Guess cooldown has not elapsed"
    },
    {
      "code": 6017,
      "name": "tooManyCommits",
      "msg": "Max commits per wallet reached for this round"
    },
    {
      "code": 6018,
      "name": "commitmentMismatch",
      "msg": "Revealed values do not match the stored guess commitment"
    },
    {
      "code": 6019,
      "name": "wrongAnswer",
      "msg": "Answer is incorrect"
    },
    {
      "code": 6020,
      "name": "invalidAnswer",
      "msg": "Answer is empty, too long, or contains non-ASCII/control characters"
    },
    {
      "code": 6021,
      "name": "excluded",
      "msg": "Wallet is excluded from winning or claiming"
    },
    {
      "code": 6022,
      "name": "exclusionListFull",
      "msg": "Exclusion list is full"
    },
    {
      "code": 6023,
      "name": "invalidParameter",
      "msg": "Invalid parameter"
    },
    {
      "code": 6024,
      "name": "mathOverflow",
      "msg": "Arithmetic overflow/underflow"
    },
    {
      "code": 6025,
      "name": "capExceeded",
      "msg": "Amount exceeds the configured cap"
    },
    {
      "code": 6026,
      "name": "insufficientHolderPool",
      "msg": "Insufficient unreserved funds in the holder pool"
    },
    {
      "code": 6027,
      "name": "distributionAlreadyPosted",
      "msg": "A distribution was already posted for this round"
    },
    {
      "code": 6028,
      "name": "tooManyLeaves",
      "msg": "Too many leaves for one distribution"
    },
    {
      "code": 6029,
      "name": "indexOutOfRange",
      "msg": "Leaf index out of range"
    },
    {
      "code": 6030,
      "name": "alreadyClaimed",
      "msg": "Reward already claimed"
    },
    {
      "code": 6031,
      "name": "invalidProof",
      "msg": "Invalid Merkle proof"
    },
    {
      "code": 6032,
      "name": "claimDeadlinePassed",
      "msg": "Claim deadline has passed"
    },
    {
      "code": 6033,
      "name": "claimDeadlineNotReached",
      "msg": "Claim deadline has not passed yet"
    },
    {
      "code": 6034,
      "name": "rentExemptionViolation",
      "msg": "Payout would leave the account below rent-exemption"
    },
    {
      "code": 6035,
      "name": "zeroAmount",
      "msg": "Amount must be greater than zero"
    }
  ],
  "types": [
    {
      "name": "answerPublished",
      "docs": [
        "Emitted when the answer of an expired/cancelled round is published."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "salt",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "answer",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "answerRevealed",
      "docs": [
        "Emitted on every valid reveal (first or displacing). Contains the salt and",
        "canonical answer, so anyone can verify sha256(salt || answer)."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "candidate",
            "type": "pubkey"
          },
          {
            "name": "candidateCommitSlot",
            "type": "u64"
          },
          {
            "name": "revealWindowEndSlot",
            "type": "u64"
          },
          {
            "name": "salt",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "answer",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "answerVerified",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "answerCommitment",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "config",
      "docs": [
        "Global configuration (singleton PDA: [\"config\"])."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "docs": [
              "Owner (intended: a Squads multisig vault). Config, pause, operator",
              "rotation, exclusion list, emergency cancel."
            ],
            "type": "pubkey"
          },
          {
            "name": "pendingOwner",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "operator",
            "docs": [
              "Operator (the AI bot hot key). Can only start rounds and post holder",
              "roots (and deposit, which anyone can do)."
            ],
            "type": "pubkey"
          },
          {
            "name": "feeWallet",
            "docs": [
              "Creator / fee wallet that receives pump.fun creator fees."
            ],
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "docs": [
              "The pump.fun token mint (informational; read by the off-chain indexer)."
            ],
            "type": "pubkey"
          },
          {
            "name": "paused",
            "docs": [
              "Global emergency pause (owner only)."
            ],
            "type": "bool"
          },
          {
            "name": "roundCount",
            "type": "u64"
          },
          {
            "name": "distributionCount",
            "type": "u64"
          },
          {
            "name": "roundActive",
            "docs": [
              "True while a round is Open or Revealing."
            ],
            "type": "bool"
          },
          {
            "name": "pendingPublishRound",
            "docs": [
              "Set when a round expires without a solver; the answer + salt must be",
              "published (`publish_answer`) before the next round can start."
            ],
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "params",
            "type": {
              "defined": {
                "name": "gameParams"
              }
            }
          },
          {
            "name": "excluded",
            "docs": [
              "Extra wallets barred from winning rounds or claiming holder rewards",
              "(e.g. former operators, team wallets, exchange wallets)."
            ],
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          },
          {
            "name": "holderPoolBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "deposited",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "depositor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "vaultBalance",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "distribution",
      "docs": [
        "Merkle-root holder distribution (PDA: [\"distribution\", id u64 LE])."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "roundId",
            "docs": [
              "The solved round whose 20% this distribution pays out."
            ],
            "type": "u64"
          },
          {
            "name": "merkleRoot",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "totalAmount",
            "type": "u64"
          },
          {
            "name": "claimedAmount",
            "type": "u64"
          },
          {
            "name": "maxClaim",
            "type": "u64"
          },
          {
            "name": "numLeaves",
            "type": "u32"
          },
          {
            "name": "numClaimed",
            "type": "u32"
          },
          {
            "name": "claimDeadline",
            "type": "i64"
          },
          {
            "name": "snapshotHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "rentPayer",
            "docs": [
              "Who paid rent for this account (gets it back on close)."
            ],
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "claimedBitmap",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "distributionClosed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "distributionId",
            "type": "u64"
          },
          {
            "name": "releasedUnclaimed",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "exclusionChanged",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "excluded",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "gameParams",
      "docs": [
        "Tunable game parameters. Only the owner can change them."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "minRevealDelaySlots",
            "docs": [
              "Minimum slots between `commit_guess` and `reveal` (>= 1)."
            ],
            "type": "u64"
          },
          {
            "name": "revealWindowSlots",
            "docs": [
              "After the first valid reveal, how many slots other valid reveals have",
              "to displace the candidate with an EARLIER commit (>= 1)."
            ],
            "type": "u64"
          },
          {
            "name": "guessFeeLamports",
            "docs": [
              "Lamports charged per `commit_guess`, paid into the vault (0 = free)."
            ],
            "type": "u64"
          },
          {
            "name": "guessCooldownSlots",
            "docs": [
              "Minimum slots between two commits by the same wallet in a round."
            ],
            "type": "u64"
          },
          {
            "name": "maxCommitsPerWallet",
            "docs": [
              "Max commits per wallet per round (0 = unlimited)."
            ],
            "type": "u32"
          },
          {
            "name": "maxRoundDurationSecs",
            "docs": [
              "Max allowed (deadline_ts - unlock_ts) for a round."
            ],
            "type": "i64"
          },
          {
            "name": "maxDistributionLamports",
            "docs": [
              "Cap on `total_amount` of any single holder distribution."
            ],
            "type": "u64"
          },
          {
            "name": "maxClaimLamports",
            "docs": [
              "Cap on any single holder's claim."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "guessCommitment",
      "docs": [
        "A player's sealed guess (PDA: [\"guess\", round, solver])."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "round",
            "type": "pubkey"
          },
          {
            "name": "solver",
            "type": "pubkey"
          },
          {
            "name": "commitment",
            "docs": [
              "sha256(salt || canonical(answer) || solver || nonce)"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "commitSlot",
            "type": "u64"
          },
          {
            "name": "attempts",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "guessCommitted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "solver",
            "type": "pubkey"
          },
          {
            "name": "commitSlot",
            "type": "u64"
          },
          {
            "name": "attempts",
            "type": "u32"
          },
          {
            "name": "feePaid",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "holderDistributionPosted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "distributionId",
            "type": "u64"
          },
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "merkleRoot",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "totalAmount",
            "type": "u64"
          },
          {
            "name": "maxClaim",
            "type": "u64"
          },
          {
            "name": "numLeaves",
            "type": "u32"
          },
          {
            "name": "claimDeadline",
            "type": "i64"
          },
          {
            "name": "snapshotHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "holderPool",
      "docs": [
        "Holder-reward pool (PDA: [\"holder_pool\"]), program-owned."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "reserved",
            "docs": [
              "Lamports promised to open distributions (not yet claimed/closed)."
            ],
            "type": "u64"
          },
          {
            "name": "totalReceived",
            "type": "u64"
          },
          {
            "name": "totalClaimed",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "holderRewardClaimed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "distributionId",
            "type": "u64"
          },
          {
            "name": "index",
            "type": "u32"
          },
          {
            "name": "claimant",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "initialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "operator",
            "type": "pubkey"
          },
          {
            "name": "feeWallet",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "params",
            "type": {
              "defined": {
                "name": "gameParams"
              }
            }
          }
        ]
      }
    },
    {
      "name": "operatorChanged",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldOperator",
            "type": "pubkey"
          },
          {
            "name": "newOperator",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "ownerTransferProposed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "currentOwner",
            "type": "pubkey"
          },
          {
            "name": "proposedOwner",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "ownerTransferred",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldOwner",
            "type": "pubkey"
          },
          {
            "name": "newOwner",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "paramsUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "params",
            "type": {
              "defined": {
                "name": "gameParams"
              }
            }
          }
        ]
      }
    },
    {
      "name": "pauseChanged",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "paused",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "round",
      "docs": [
        "One puzzle round (PDA: [\"round\", id u64 LE])."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "answerCommitment",
            "docs": [
              "sha256(salt || canonical(answer)); salt is a 32-byte secret revealed",
              "only at reveal / publish time."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "unlockTs",
            "type": "i64"
          },
          {
            "name": "deadlineTs",
            "type": "i64"
          },
          {
            "name": "startedAt",
            "type": "i64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "roundStatus"
              }
            }
          },
          {
            "name": "totalCommits",
            "type": "u32"
          },
          {
            "name": "candidate",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "candidateCommitSlot",
            "type": "u64"
          },
          {
            "name": "firstRevealSlot",
            "type": "u64"
          },
          {
            "name": "revealWindowEndSlot",
            "type": "u64"
          },
          {
            "name": "solver",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "solvedAt",
            "type": "i64"
          },
          {
            "name": "solverPayout",
            "type": "u64"
          },
          {
            "name": "holderPayout",
            "type": "u64"
          },
          {
            "name": "holderDistributionPosted",
            "type": "bool"
          },
          {
            "name": "answerPublished",
            "type": "bool"
          },
          {
            "name": "revealedSalt",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "revealedAnswer",
            "type": "bytes"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "roundCancelled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "roundExpired",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "roundSolved",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "solver",
            "type": "pubkey"
          },
          {
            "name": "solverPayout",
            "type": "u64"
          },
          {
            "name": "holderPayout",
            "type": "u64"
          },
          {
            "name": "vaultRemaining",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "roundStarted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "answerCommitment",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "unlockTs",
            "type": "i64"
          },
          {
            "name": "deadlineTs",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "roundStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "open"
          },
          {
            "name": "revealing"
          },
          {
            "name": "solved"
          },
          {
            "name": "expired"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    },
    {
      "name": "vault",
      "docs": [
        "SOL reward vault (PDA: [\"vault\"]), program-owned."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalDeposited",
            "type": "u64"
          },
          {
            "name": "totalGuessFees",
            "type": "u64"
          },
          {
            "name": "totalPaidToSolvers",
            "type": "u64"
          },
          {
            "name": "totalSentToHolderPool",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
