// This script configures the frontend to connect to a specific blockchain node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function configureFrontend() {
  console.log('Configuring frontend connection settings...');
  
  const configPath = path.resolve(__dirname, '../../voting-dapp/lib/blockchain/config.ts');
  
  // Check if config file exists
  if (!fs.existsSync(configPath)) {
    console.error(`Config file not found at ${configPath}`);
    rl.close();
    return;
  }
  
  // Read current config
  const currentConfig = fs.readFileSync(configPath, 'utf8');
  console.log('Current configuration:');
  console.log(currentConfig);
  
  rl.question('Enter the blockchain node IP address: ', (nodeIp) => {
    if (!nodeIp) {
      console.error('Node IP is required');
      rl.close();
      return;
    }
    
    rl.question('Enter the blockchain node port (default: 8545): ', (nodePort) => {
      const port = nodePort || '8545';
      
      rl.question('Enter the contract address (leave empty to keep current): ', (contractAddress) => {
        // Create new config content
        const newConfig = `// Blockchain connection configuration
export const networkConfig = {
  rpcUrl: 'http://${nodeIp}:${port}',
  chainId: 1337, // Custom chain ID for our voting network
  contractAddress: '${contractAddress || getCurrentContractAddress(currentConfig)}' // Contract address from deployment
};
`;
        
        // Write new config
        fs.writeFileSync(configPath, newConfig);
        console.log('\nConfiguration updated successfully!');
        console.log('New configuration:');
        console.log(newConfig);
        rl.close();
      });
    });
  });
}

function getCurrentContractAddress(config) {
  // Extract the current contract address from the config file
  const matches = config.match(/contractAddress:\s*['"]([^'"]+)['"]/);
  return matches && matches[1] ? matches[1] : '0x5FbDB2315678afecb367f032d93F642f64180aa3';
}

configureFrontend().catch(console.error);