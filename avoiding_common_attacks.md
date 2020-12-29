## Avoiding common attacks

Security steps/measures taken to ensure contracts are not susceptible to common attacks:

1. SafeMath - this library is used to mitigate Integer Overflow and Underflow (SWC-101). If the high scorer of the game remains undefeated for a long period of time, his balance may potentially overflow. Division of the fees paid is also managed accurately by the functions.

2. Withdrawal pattern - this security measure is used to mitigate Denial of Service with Failed Call (SWC-113). - if the contract distributes the earned fees to the winner and owner, a malicious attacker could play the game through a contract address instead of an externally owned account. If the contract does not hvae a payable function, it's fallback function is triggered and the contract's distribute function will fail to complete and not be able to distribute the funds. The fallback function could also contain other malicious code that can be run.

Note: This project's proof of concept smart contract currently has a function to set the high score of the leader. A malicious attacker may create a fake front-end to interact with the Proof-of-Snake smart contract, pay the minumum fee to be registered as a player and then call the newLeader function to set a new high score freely and break the game. In production, authentication would need to be implemented. The gameplay can be validated on a backend server to ensure that the player did score the highscore from the official Proof-of-Snake site. An intermediary referee contract can also be created and assigned as the only address allowed to update the high score of the Proof-of-Snake contract.
