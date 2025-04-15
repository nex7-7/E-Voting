require("@nomicfoundation/hardhat-toolbox");
const { uploadToIPFS, getIPFSUrl } = require('./scripts/ipfs-config');

// IPFS task to test connection
task("ipfs-test", "Tests connection to IPFS using local node")
  .setAction(async () => {
    try {
      const content = "Hello, IPFS from Hardhat task! " + new Date().toISOString();
      console.log("Uploading test content to IPFS...");
      const cid = await uploadToIPFS(Buffer.from(content));
      console.log(`Content uploaded! CID: ${cid}`);
      console.log(`You can view it at: ${getIPFSUrl(cid)}`);
    } catch (error) {
      console.error("IPFS connection failed:", error.message);
    }
  });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
      },
      {
        version: "0.8.28",
      }
    ]
  },
  defaultNetwork: "local",
  networks: {
    local: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk"
      }
    },
    // Define a custom local network that can be joined by other nodes
    voting_network: {
      url: "http://127.0.0.1:8545",
      chainId: 1337, // Custom chain ID
      gasPrice: 20000000000,
      accounts: {
        mnemonic: "voting voting voting voting voting voting voting voting voting voting voting junk"
      }
    },
    // Configuration for nodes that join the network (not mining)
    consensus_node: {
      url: "http://0.0.0.0:8545",
      chainId: 1337,
      gasPrice: 20000000000,
      accounts: {
        mnemonic: "voting voting voting voting voting voting voting voting voting voting voting junk"
      },
      mining: {
        auto: false
      }
    },
    // Configuration for mining nodes
    mining_node: {
      url: "http://0.0.0.0:8546",
      chainId: 1337,
      gasPrice: 20000000000,
      accounts: {
        mnemonic: "voting voting voting voting voting voting voting voting voting voting voting junk"
      },
      mining: {
        auto: true,
        interval: 5000 // Mining interval in milliseconds
      }
    },
    hardhat: {
      chainId: 1337,
      mining: {
        auto: true,
        interval: 5000
      }
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    // Add this network configuration to allow external connections
    local_network: {
      url: "http://0.0.0.0:8545",  // Listen on all interfaces
      chainId: 1337
    }
  }
};
