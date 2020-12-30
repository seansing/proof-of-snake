import React, { Component } from "react";
import ProofOfSnakeContract from "./contracts/ProofOfSnake.json";
import Snake from "./snake";
import Target from "./target";
import getWeb3 from "./getWeb3";

import "./App.css";

//Get random coordinates for snake's target.
const getRandomCoordinates = () => {
  let min = 1;
  let max = 98;
  let x = Math.floor((Math.random() * (max - min + 1) + min) / 4) * 4;
  let y = Math.floor((Math.random() * (max - min + 1) + min) / 4) * 4;
  return [x, y];
};

class App extends Component {
  state = {
    currentLeader: 0,
    posPot: 0,
    potBalance: 0,
    owner: null,
    web3: null,
    accounts: null,
    contractAddress: null,
    contract: null,
    direction: "RIGHT",
    speed: 80,
    snakeDots: [
      [0, 0],
      [4, 0],
    ],
    intervalId: 0,
    target: getRandomCoordinates(),
    highScore: 0,
    errorMessage: "",
    playErrorMessage: "",
    stopped: false,
    tokenBalance: 0,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = ProofOfSnakeContract.networks[networkId];
      const contractAddress = deployedNetwork.address;
      const instance = new web3.eth.Contract(
        ProofOfSnakeContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState(
        { web3, accounts, contract: instance, contractAddress },
        this.getStats
      );

      //Detect movement of game
      document.onkeydown = this.onKeyDown;
      //SetInterval of snake movement
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  //Conditions to check on every snake movement.
  componentDidUpdate() {
    this.checkIfOutOfBorders();
    this.checkIfCollapsed();
    this.checkIfTargetTouched();
  }

  //Getting results from the ProofOfSnake smart contract instance.
  getStats = async () => {
    // Get currentLeader
    const currentLeader = await this.state.contract.methods
      .currentLeader()
      .call();

    // Update currentLeader state so subsequent calls can use it.
    this.setState({ currentLeader });

    //Get balance of current high score.
    const highScore = await this.state.contract.methods.highScore().call();

    //Get balance of Proof-of-Snake pot.
    const posPotRes = await this.state.contract.methods
      .potBalance(this.state.currentLeader)
      .call();
    const posPot = this.state.web3.utils.fromWei(posPotRes.toString(), "ether");

    //Get balance of current connected account.
    const potBalanceCall = await this.state.contract.methods
      .potBalance(this.state.accounts[0])
      .call();

    const potBalance = this.state.web3.utils.fromWei(
      potBalanceCall.toString(),
      "ether"
    );

    const owner = await this.state.contract.methods.owner().call();
    const stopped = await this.state.contract.methods.stopped().call();

    const tokenBalance = await this.state.contract.methods
      .balanceOf(this.state.accounts[0])
      .call();

    this.setState({
      highScore,
      posPot,
      potBalance,
      owner,
      stopped,
      tokenBalance,
    });
  };

  //SMART CONTRACT FUNCTION : Pay game fees to the contract to initiate the game.
  startGame = async () => {
    if (this.state.stopped === true) {
      this.setState({
        playErrorMessage:
          "Oops! The snake is lazy at the moment. Please try again later.",
      });
    } else {
      //Clear any error messages under withdraw button.
      this.setState({ playErrorMessage: "", errorMessage: "" });

      await this.state.contract.methods
        .playGame()
        .send({
          from: this.state.accounts[0],
          value: this.state.web3.utils.toWei("0.1", "ether"),
        })
        .then(async (res) => {
          this.intervalId = await setInterval(this.moveSnake, 80);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  //GAME FUNCTION : Change direction of snake based on keystrokes.
  onKeyDown = (e) => {
    e = e || window.event;
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        this.setState({ direction: "UP" });
        break;
      case "ArrowDown":
        e.preventDefault();
        this.setState({ direction: "DOWN" });
        break;
      case "ArrowLeft":
        e.preventDefault();
        this.setState({ direction: "LEFT" });
        break;
      case "ArrowRight":
        e.preventDefault();
        this.setState({ direction: "RIGHT" });
        break;
      case " ":
        e.preventDefault();
        break;
    }
  };

  //GAME FUNCTION : Moves the snake.
  moveSnake = () => {
    let dots = [...this.state.snakeDots];
    let head = dots[dots.length - 1];

    switch (this.state.direction) {
      case "RIGHT":
        head = [head[0] + 4, head[1]];
        break;
      case "LEFT":
        head = [head[0] - 4, head[1]];
        break;
      case "UP":
        head = [head[0], head[1] - 4];
        break;
      case "DOWN":
        head = [head[0], head[1] + 4];
        break;
    }
    //add new head to snake
    dots.push(head);
    //remove tail of snake
    dots.shift();

    this.setState({ snakeDots: dots });
  };

  //GAME FUNCTION : Check if snake goes out of border.
  checkIfOutOfBorders() {
    let head = this.state.snakeDots[this.state.snakeDots.length - 1];
    if (head[0] >= 100 || head[1] >= 100 || head[0] < 0 || head[1] < 0) {
      this.onGameOver();
    }
  }

  //GAME FUNCTION : Check if snake collides with its own body.
  checkIfCollapsed() {
    let snake = [...this.state.snakeDots];
    let head = snake[snake.length - 1];
    //remove head of snake as it will always be true
    snake.pop();
    snake.forEach((dot) => {
      if (head[0] === dot[0] && head[1] === dot[1]) {
        this.onGameOver();
      }
    });
  }

  //GAME FUNCTION : Check snake head touches target.
  checkIfTargetTouched() {
    let head = this.state.snakeDots[this.state.snakeDots.length - 1];
    let target = this.state.target;
    if (head[0] === target[0] && head[1] === target[1]) {
      console.log("current speed" + this.state.speed.toString());
      this.setState({ target: getRandomCoordinates() });
      this.elongateSnake();
      this.increaseSpeed();
    }
  }

  //GAME FUNCTION : Increase snake length.
  elongateSnake() {
    let newsnake = [...this.state.snakeDots];
    newsnake.unshift([]);
    this.setState({
      snakeDots: newsnake,
    });
  }

  //GAME FUNCTION : Increase snake speed.
  increaseSpeed() {
    if (this.state.speed > 10) {
      clearInterval(this.intervalId);
      this.intervalId = setInterval(this.moveSnake, this.state.speed - 5);
      this.setState({ speed: this.state.speed - 5 });
    }
  }

  //GAME FUNCTION : End the game
  //If high score is not beaten, reset states
  //If high score is beaten, resets states, awards token to msg.sender
  onGameOver = async () => {
    clearInterval(this.intervalId);
    this.setState({
      direction: "RIGHT",
      speed: 80,
      snakeDots: [
        [0, 0],
        [4, 0],
      ],
      target: getRandomCoordinates(),
    });
    if (this.state.snakeDots.length > this.state.highScore) {
      alert(
        `Congratulations! You have set a new record snake length of ${this.state.snakeDots.length}! Please proceed to authorize the transaction to get your token.`
      );

      await this.state.contract.methods
        .newLeader(this.state.snakeDots.length)
        .send({
          from: this.state.accounts[0],
        })
        .then(async (res) => {})
        .catch((err) => {
          console.log(err);
        });
      console.log("successfully minted token");
      await this.getStats();
      await this.renderWithdraw();
    } else {
      alert(
        `Game Over. Snake length is ${this.state.snakeDots.length}. Try again to beat the high score of ${this.state.highScore}!`
      );
      const posPotRes = await this.state.contract.methods
        .potBalance(this.state.currentLeader)
        .call();
      const posPot = this.state.web3.utils.fromWei(
        posPotRes.toString(),
        "ether"
      );
      const potBalanceRes = await this.state.contract.methods
        .potBalance(this.state.accounts[0])
        .call();
      const potBalance = this.state.web3.utils.fromWei(
        potBalanceRes.toString(),
        "ether"
      );

      this.setState({ posPot, potBalance });
      this.renderWithdraw();
    }
  };
  withdrawEarnings = async () => {
    if (this.state.stopped === true) {
      this.setState({
        errorMessage:
          "Oops! Proof-of-Snake's contract is currently paused. Please try again later.",
      });
    } else {
      if (this.state.accounts[0] === this.state.currentLeader) {
        this.setState({
          errorMessage: "Oops! Your high score has not been beaten yet ;)",
        });
      } else if (this.state.potBalance === 0) {
        this.setState({ errorMessage: "Oops! No earnings found." });
      } else {
        await this.state.contract.methods
          .withdrawEarnings()
          .send({
            from: this.state.accounts[0],
          })
          .then((res) => {
            return res;
          })
          .catch((err) => {
            "Oops! Transaction failed. Please check your account balance.";
          });
      }
    }
    const potBalanceCall = await this.state.contract.methods
      .potBalance(this.state.accounts[0])
      .call();
    const potBalance = this.state.web3.utils.fromWei(
      potBalanceCall.toString(),
      "ether"
    );
    this.setState({ potBalance });
  };

  emergency = async () => {
    await this.state.contract.methods
      .emergency()
      .send({
        from: this.state.accounts[0],
      })
      .then((res) => {
        return res;
      })
      .catch((err) => {});

    const stopped = await this.state.contract.methods.stopped().call();

    this.setState({ stopped, errorMessage: "", playErrorMessage: "" });
  };
  renderEmergency() {
    if (
      this.state.accounts[0] === this.state.owner &&
      this.state.stopped === false
    ) {
      return (
        <button
          onClick={this.emergency}
          className="user-button emergency-button"
        >
          <h3 className="button-text">STOP GAME</h3>
        </button>
      );
    } else if (
      this.state.accounts[0] === this.state.owner &&
      this.state.stopped === true
    ) {
      return (
        <button
          onClick={this.emergency}
          className="user-button emergency-button"
        >
          <h3 className="button-text">RESUME GAME</h3>
        </button>
      );
    }
  }

  renderWithdraw() {
    if (this.state.potBalance >= 0) {
      return (
        <div>
          <h4>Your earnings: {this.state.potBalance} ETH</h4>
          <button className="user-button" onClick={this.withdrawEarnings}>
            <h4 className="button-text">Withdraw Earnings</h4>
          </button>
          <h5 className="error-message">{this.state.errorMessage}</h5>
        </div>
      );
    }
  }
  renderToken() {
    if (this.state.tokenBalance > 0) {
      return (
        <div className="header-token">
          <img className="snake-logo" src="/poshscoingold.png" />
          <h4 className="token-number">x {this.state.tokenBalance}</h4>
        </div>
      );
    } else {
      return <img className="snake-logo" src="/snakelogo.png" />;
    }
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div className="container">
          <div className="header">
            <div className="title-with-logo">
              <h1>Proof-of-Snake</h1>
              {this.renderToken()}
            </div>
            {this.renderEmergency()}
            <div className="header-right">
              <ul>
                <li>
                  <div className="header-stats">
                    <h4 className="header-title">Connected to account : </h4>
                    <h5 className="header-value">{this.state.accounts[0]}</h5>
                  </div>
                </li>

                <li>
                  <div className="header-stats">
                    <h4 className="header-title">Contract's address : </h4>
                    <h5 className="header-value">
                      {this.state.contractAddress}
                    </h5>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="cards">
            <div className="game-card card">
              <span className="header-stats">
                <h3 className="header-title">Score :</h3>
                <h3 className="header-value">{this.state.snakeDots.length}</h3>
              </span>

              <div className="game-area">
                <Snake snakeDots={this.state.snakeDots} />
                <Target dot={this.state.target} />
              </div>

              <button className="user-button" onClick={this.startGame}>
                <h4 className="button-text">Play</h4>
              </button>

              <h5 className="error-message">{this.state.playErrorMessage}</h5>
            </div>
            <div className="rightCards">
              <div className="stats card">
                <div>
                  <h3 className="title">High Score</h3>
                  <h3 className="value"> {this.state.highScore}</h3>
                </div>
                <div>
                  <h3 className="title">Leader</h3>
                  <h6>{this.state.currentLeader}</h6>
                </div>
              </div>
              <div className="pot card">
                <h3 className="title">Proof-of-Snake Pot</h3>
                <h3 className="value"> {this.state.posPot} ETH</h3>
                {this.renderWithdraw()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
