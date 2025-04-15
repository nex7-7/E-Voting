// This script starts a consensus node that connects to the main mining node with CORS enabled
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { networkInterfaces } = require('os');

// Get local IP address
function getLocalIpAddress() {
  const nets = networkInterfaces();
  const results = {};

  // First, collect all network interfaces
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal addresses
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  // Prioritize proper local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  for (const name in results) {
    for (const ip of results[name]) {
      // Check for common private network ranges
      if (ip.startsWith('192.168.') || 
          ip.startsWith('10.') || 
          /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) {
        return ip;
      }
    }
  }

  // Fall back to any non-link-local address
  for (const name in results) {
    for (const ip of results[name]) {
      if (!ip.startsWith('169.254.')) {
        return ip;
      }
    }
  }

  // Last resort: just return the first IP we found
  for (const name in results) {
    if (results[name].length > 0) {
      return results[name][0];
    }
  }

  return '127.0.0.1';
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function startConsensusNode() {
  const localIp = getLocalIpAddress();
  
  console.log('Starting consensus node setup with CORS enabled...');
  
  // Ask for the mining node IP
  rl.question('Enter the IP address of the mining node to connect to: ', (miningNodeIp) => {
    if (!miningNodeIp) {
      console.error('Mining node IP is required');
      rl.close();
      return;
    }
    
    console.log(`Starting consensus node on IP: ${localIp}`);
    console.log(`Connecting to mining node at: ${miningNodeIp}`);
    
    // Create a data directory for the node
    const dataDir = path.join(__dirname, '../node_data/consensus_node');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Start the consensus node - CORS is configured in hardhat.config.js
    const port = 8546; 
    const command = `npx hardhat node --hostname ${localIp} --port ${port}`;
    
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
    console.log(`Consensus node started at http://${localIp}:${port}`);
    console.log(`CORS has been enabled through Hardhat config`);
    console.log(`Connected to mining node at ${miningNodeIp}:8545`);
    console.log(`=====================================================\n`);
    
    nodeProcess.stdout.on('data', (data) => {
      console.log(data);
    });

    nodeProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    nodeProcess.on('close', (code) => {
      console.log(`Consensus node process exited with code ${code}`);
      rl.close();
    });
  });
}

startConsensusNode().catch(console.error);