const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");

const mnemonic = "";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // match any network
      websockets: true,
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(
          mnemonic,
          "https://rinkeby.infura.io/v3/YOUR_PROJECT_ID"
        );
      },
      network_id: 4,
    },
  },
  compilers: {
    solc: {
      version: "^0.6.0", // A version or constraint - Ex. "^0.5.0"
      // Can also be set to "native" to use a native solc

      parser: "solcjs", // Leverages solc-js purely for speedy parsing
    },
  },
};
