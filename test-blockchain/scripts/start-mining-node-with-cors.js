// This script starts the main mining node with CORS enabled for cross-origin requests
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { networkInterfaces } = require('os');
const readline = require('readline');

// Function to get all available IP addresses
function getAllIpAddresses() {
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal addresses
      if (net.family === 'IPv4' && !net.internal) {
        results.push({
          name: name,
          address: net.address
        });
      }
    }
  }

  return results;
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function startMiningNode() {
  const ipAddresses = getAllIpAddresses();
  
  console.log('Starting mining node setup with CORS enabled...');
  console.log('Available IP addresses:');
  
  ipAddresses.forEach((ip, index) => {
    console.log(`[${index + 1}] ${ip.address} (${ip.name})`);
  });
  console.log(`[${ipAddresses.length + 1}] Custom IP address`);
  
  rl.question('Please select an IP address option (enter number): ', (option) => {
    const optionNum = parseInt(option);
    
    if (isNaN(optionNum) || optionNum < 1 || optionNum > ipAddresses.length + 1) {
      console.error('Invalid option');
      rl.close();
      return;
    }
    
    if (optionNum === ipAddresses.length + 1) {
      // User wants to enter a custom IP
      rl.question('Enter custom IP address: ', (customIp) => {
        startNodeWithIp(customIp);
      });
    } else {
      // User selected from the list
      const selectedIp = ipAddresses[optionNum - 1].address;
      startNodeWithIp(selectedIp);
    }
  });
}

function startNodeWithIp(localIp) {
  console.log(`Using IP address: ${localIp}`);
  
  // Create a data directory for the node
  const dataDir = path.join(__dirname, '../node_data/mining_node');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Start the mining node with hardhat network and enable CORS
  // The --cors flag allows any domain to access the JSON-RPC server
  const command = `npx hardhat node --hostname ${localIp} --port 8545 --cors "*"`;
  
  console.log(`Running command: ${command}`);
  
  const nodeProcess = exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
    console.log(`Stdout: ${stdout}`);
  });
  
  // Display instructions
  console.log(`\n=====================================================`);
  console.log(`Mining node started at http://${localIp}:8545`);
  console.log(`CORS has been enabled to allow requests from any origin`);
  console.log(`\nThis is the main mining node. Other nodes can connect to this.`);
  console.log(`\nTo deploy the voting contract, run:`);
  console.log(`npx hardhat run --network local scripts/deploy.js`);
  console.log(`\nShare your IP address (${localIp}) with others so they can connect their nodes.`);
  console.log(`=====================================================\n`);
  
  nodeProcess.stdout.on('data', (data) => {
    console.log(data);
  });

  nodeProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  nodeProcess.on('close', (code) => {
    console.log(`Mining node process exited with code ${code}`);
    rl.close();
  });
}

startMiningNode().catch(console.error);