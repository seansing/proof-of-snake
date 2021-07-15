# Proof-of-Snake

Don't have time to read about the project? No problems!

Connect to the Rinkeby Testnet and visit the game [here](https://proof-of-snake.vercel.app/)!

## Overview

The Proof-of-Snake game is based off the classic snake game that we all know and love with a twist; the high scorer earns Ethereum from every courageous attempt to beat his high score. You earn by being the best! In addition, a ERC-721 token is rewarded whenever a player beats the current high score.

This is made possible by tracking the high scoreand token ownership the with smart contracts that run on the Ethereum blockchain. The Proof-of-Snake project currently lives on the Rinkeby blockchain. In order to try it, you will need to have test ether on the Rinkeby network that you can request from a faucet.

## How does Proof-of-Snake work?

Every time a player pays the game fee to play the game, the fee is split between the game creator (to support his development works) and the current high scorer. The game only starts once the payment fee has been succesfully transacted.

The smart contract has a mapping that keeps track of the balance that the current high scorer owns and continues to increase this balance for every attempt that does not beat the high score. This is represented as the 'Proof-of-Snake Pot'. The high scorer is only allowed to empty out the pot (his earnings) when his high score is beaten.

Once the high score is beaten, the smart contract assigns a new leader and the contract now allows the previous high scorer to withdraw his funds. From here on, every fee from new play attempts goes to the new leader and game creator.

## Directory structure

- client folder - Front end code for Proof-of-Snake that was built with React.js.

- contracts folder - Proof-of-Snake smart contract and its respective libraries/migration contracts.

- migrations - Files used for truffle's migration steps.

- test - Folder containing test for the smart contract written in JavaScript.

## Building and running the project locally

1. Clone this repo to your local environment.
2. run `cd proof-of-snake`
3. run `cd client`
4. run `npm install`
5. Once installation is complete, run `npm run start` to launch the front-end.
