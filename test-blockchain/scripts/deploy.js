// Script to deploy the contract and set up initial IPFS data
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');
const { uploadToIPFS } = require('./ipfs-config');

async function main() {
  // Get the IP from command line args or use default
  const targetIp = process.argv[2] || "10.125.28.235";
  console.log(`Deploying to node at: ${targetIp}:8545`);
  
  // Use a custom provider pointing to the running node
  const provider = new ethers.JsonRpcProvider(`http://${targetIp}:8545`);
  
  // Get the first account as signer
  const accounts = await provider.listAccounts();
  if (accounts.length === 0) {
    console.error("No accounts found. Make sure the node is running.");
    process.exit(1);
  }
  
  const signer = accounts[0];
  console.log(`Using account: ${signer.address}`);

  // Check if IPFS is running
  try {
    console.log("Checking IPFS connection...");
    const testCid = await uploadToIPFS(Buffer.from("Test IPFS connection"));
    console.log(`IPFS connection successful. Test CID: ${testCid}`);
  } catch (error) {
    console.error("WARNING: IPFS connection failed:", error.message);
    console.log("Continuing without IPFS verification...");
  }

  // Deploy the Voting contract
  console.log("Deploying Voting contract...");
  const Voting = await ethers.getContractFactory("Voting", signer);
  const voting = await Voting.deploy();
  await voting.waitForDeployment();

  const votingAddress = await voting.getAddress();
  console.log(`Voting contract deployed to: ${votingAddress}`);

  // Update the contract address in the frontend configuration
  updateContractAddress(votingAddress, targetIp);

  console.log("Deployment complete!");
}

function updateContractAddress(address, nodeIp) {
  const configPath = path.resolve(__dirname, '../../voting-dapp/lib/blockchain/config.ts');
  
  try {
    // Create new config content
    const configContent = `// Blockchain connection configuration
export const networkConfig = {
  rpcUrl: 'http://${nodeIp}:8545',
  chainId: 1337, // Custom chain ID for our voting network
  contractAddress: '${address}' // Contract address from deployment
};
`;
    
    // Write the updated config
    fs.writeFileSync(configPath, configContent);
    console.log(`Contract address updated in frontend configuration: ${address}`);
    console.log(`Node IP updated in frontend configuration: ${nodeIp}`);
  } catch (error) {
    console.warn("Warning: Could not update the contract address in the frontend configuration.");
    console.warn("Please update it manually in voting-dapp/lib/blockchain/config.ts");
    console.warn(`Contract address: ${address}`);
    console.warn(`Node IP: ${nodeIp}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
