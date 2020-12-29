## Design pattern decisions

1. Withdrawal pattern - this design pattern was selected primarily to avoid a Denial of Service with Failed Call (SWC-113). Although it is better to have the smart contract automatically distribute the earnings from the game fees to the respective earners, a malicious hacker can use a contract account to register as a player and utilize a fallback function to run malicious code or essentially stop the distribution function from completing.

2. Restricting access pattern - modifiers are introduced to ensure that only the owner is allowed to call certain functions. In this smart contract, only the owner is allowed to call the emergency() function.

3. Circuit breaker design pattern - the emergency() function is used to stop the players from continuing to play the game or withdraw funds. This can be used if the game needs to be upgraded or fixed.
