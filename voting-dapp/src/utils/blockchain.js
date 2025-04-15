import { ethers } from 'ethers';

// Function to connect to blockchain with user-specified endpoint
export async function connectToBlockchain(rpcUrl = null) {
  try {
    let provider;
    
    if (rpcUrl) {
      // Use custom RPC URL provided by the user
      provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    } else if (window.ethereum) {
      // Use MetaMask if available
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
    } else {
      // Fallback to localhost - only works when frontend and blockchain are on same machine
      provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    }
    
    return provider;
  } catch (error) {
    console.error("Failed to connect to blockchain:", error);
    throw error;
  }
}
