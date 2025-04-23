const HDWalletProvider = require('@truffle/hdwallet-provider');

// ⚠️ Replace these with your own details
const mnemonic = "guess ecology better maple liquid sauce series agent survey tube expand ask";
const sepoliaRPC = "https://eth-sepolia.g.alchemy.com/v2/hjE1kGpOuGJz3OC-UfknmUhVv8O3nDkQ";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    sepolia: {
      provider: () => new HDWalletProvider(mnemonic, sepoliaRPC),
      network_id: 11155111,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },

  compilers: {
    solc: {
      version: "0.8.17"
    }
  }
};
