const assert = require("assert");

const ProofOfSnake = artifacts.require("ProofOfSnake");

let address;
let owner;
let highScore;
let currentLeader;
let proofOfSnakeInstance;

contract("ProofOfSnake", (accounts) => {
  beforeEach(async () => {
    const newProofOfSnakeInstance = await ProofOfSnake.new();
    /* proofOfSnakeInstance = await newProofOfSnake.deployed(); */
    proofOfSnakeInstance = newProofOfSnakeInstance;
    owner = await proofOfSnakeInstance.owner.call();
  });

  it("...should be deployed, has an address and owner is the account that deployed it", async () => {
    const address = await proofOfSnakeInstance.address;
    assert.notStrictEqual(address, 0x0);
    assert.notStrictEqual(address, null);
    assert.notStrictEqual(address, undefined);
    assert.notStrictEqual(address, "");
    assert.strictEqual(owner, accounts[0]);

    console.log("Contract's address is : " + address.toString());
    console.log("Contract's owner is : " + accounts[0].toString());
  });
  it("...should only allow the game to be played if minimum game fee is met.", async () => {
    //Pay insufficient fee of 0.01 ETH instead of 0.1 ETH.
    await proofOfSnakeInstance
      .playGame({ from: accounts[1], value: "10000000000000000" })
      .then((res) => {
        assert(false);
      })
      .catch((err) => {
        assert(err);
      });

    //Pay minimum reuqired game fee 0.1 ETH.
    await proofOfSnakeInstance
      .playGame({ from: accounts[1], value: "100000000000000000" })
      .then((res) => {
        assert(res);
      })
      .catch((err) => {
        assert(false);
      });
  });

  it("...should split the game fee between the current leader and contract owner", async () => {
    //A player pays correct game fee.
    await proofOfSnakeInstance
      .playGame({ from: accounts[1], value: "100000000000000000" })
      .then((res) => {
        assert(res);
      })
      .catch((err) => {
        assert(false);
      });

    //Set a new high scorer.
    await proofOfSnakeInstance.newLeader(3, {
      from: accounts[1],
    });

    const checkNewLeader = await proofOfSnakeInstance.currentLeader.call();

    //Pay correct game fee, gets split to current high scorer and owner.
    await proofOfSnakeInstance
      .playGame({ from: accounts[1], value: "100000000000000000" })
      .then((res) => {
        assert(res);
      })
      .catch((err) => {
        assert(false);
      });
    //Check balance of game owner and current leader.
    const ownerBalance = await proofOfSnakeInstance.potBalance(owner);
    const leaderBalance = await proofOfSnakeInstance.potBalance(accounts[1]);
    console.log(leaderBalance.toString());
    console.log(ownerBalance.toString());

    assert.strictEqual(checkNewLeader, accounts[1]);
    assert.strictEqual(ownerBalance.toString(), "150000000000000000");
    assert.strictEqual(leaderBalance.toString(), "50000000000000000");
  });
  it("...should only allow high scorer to withdraw earnings and when his score is beaten.", async () => {
    //Pay correct game fee.
    await proofOfSnakeInstance
      .playGame({ from: accounts[1], value: "100000000000000000" })
      .then((res) => {
        assert(res);
      })
      .catch((err) => {
        assert(false);
      });

    //Set a new high scorer.
    await proofOfSnakeInstance.newLeader(3, {
      from: accounts[1],
    });

    //Leader tries to withdraw.
    await proofOfSnakeInstance
      .withdrawEarnings({ from: accounts[1] })
      .then((res) => {
        assert(false);
      })
      .catch((err) => {
        assert(err);
      });

    //Another player pays to play.
    await proofOfSnakeInstance
      .playGame({ from: accounts[2], value: "100000000000000000" })
      .then((res) => {
        assert(res);
      })
      .catch((err) => {
        assert(false);
      });

    //Player achieves a new high score.
    await proofOfSnakeInstance.newLeader(4, {
      from: accounts[2],
    });

    //Previous leader tries to withdraw.
    await proofOfSnakeInstance
      .withdrawEarnings({ from: accounts[1] })
      .then((res) => {
        assert(res);
      })
      .catch((err) => {
        assert(false);
      });
  });
  it("...should only allow owner to call emergency", async () => {
    //Not owner tries to call emergency function.
    await proofOfSnakeInstance
      .emergency({ from: accounts[1] })
      .then((res) => assert(false))
      .catch((err) => assert(err));

    //Owner calls emergency function.
    await proofOfSnakeInstance
      .emergency({ from: accounts[0] })
      .then((res) => assert(res))
      .catch((err) => assert(false));
  });
  it("...should not allow players to play or withdraw earnings when game is in stopped in emergency", async () => {
    //Owner calls emergency function.
    await proofOfSnakeInstance
      .emergency({ from: accounts[0] })
      .then((res) => assert(res))
      .catch((err) => assert(false));

    //Player tries to play game.
    await proofOfSnakeInstance
      .playGame({ from: accounts[1] })
      .then((res) => assert(false))
      .catch((err) => assert(err));

    //Player tries to withdraw.
    await proofOfSnakeInstance
      .withdrawEarnings({ from: accounts[1] })
      .then((res) => assert(false))
      .catch((err) => assert(err));
  });
  it("...should mint a new token when high score is met.", async () => {
    //Pay correct game fee.
    await proofOfSnakeInstance
      .playGame({ from: accounts[1], value: "100000000000000000" })
      .then((res) => {
        assert(res);
      })
      .catch((err) => {
        assert(false);
      });
    //Set a new high scorer.
    await proofOfSnakeInstance.newLeader(3, {
      from: accounts[1],
    });

    //Check total supply
    const totalSupply = await proofOfSnakeInstance.totalSupply.call();

    assert.strictEqual(totalSupply.toString(), "1");

    const tokenOwner = await proofOfSnakeInstance.balanceOf(accounts[1]);

    assert.strictEqual(tokenOwner.toString(), "1");
  });
});
