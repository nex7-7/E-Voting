require("@nomicfoundation/hardhat-toolbox");
const { uploadToIPFS, getIPFSUrl, stopIPFS } = require('./scripts/js-ipfs-config');

// IPFS task to test connection
task("ipfs-test", "Tests connection to IPFS using js-ipfs")
  .setAction(async () => {
    try {
      const content = "Hello, IPFS from Hardhat task! " + new Date().toISOString();
      console.log("Uploading test content to IPFS...");
      const cid = await uploadToIPFS(Buffer.from(content));
      console.log(`Content uploaded! CID: ${cid}`);
      console.log(`You can view it at: ${getIPFSUrl(cid)}`);
      await stopIPFS();
    } catch (error) {
      console.error("IPFS connection failed:", error.message);
      await stopIPFS();
    }
  });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.26",
  networks: {
    hardhat: {
      chainId: 1337
    }
  }
};
