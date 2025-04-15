// This script starts a local IPFS node and connects it to the network
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function startLocalIpfsNode() {
  console.log('Starting IPFS node setup...');
  
  // Check if IPFS is installed
  exec('ipfs --version', (error) => {
    if (error) {
      console.error('IPFS is not installed. Please install it first.');
      console.log('Installation guide: https://docs.ipfs.tech/install/command-line/');
      rl.close();
      return;
    }
    
    // Create IPFS data directory
    const ipfsDir = path.join(__dirname, '../ipfs_data');
    if (!fs.existsSync(ipfsDir)) {
      fs.mkdirSync(ipfsDir, { recursive: true });
    }

    // Initialize IPFS if not already initialized
    exec('ipfs init', (initError) => {
      // It's okay if it's already initialized
      console.log('Initializing IPFS (if not already initialized)...');
      
      // Ask if this is the main IPFS node or a peer
      rl.question('Is this the main IPFS node? (yes/no): ', (isMain) => {
        const isMainNode = isMain.toLowerCase() === 'yes';
        
        if (isMainNode) {
          // Configure as main IPFS node
          console.log('Configuring as main IPFS node...');
          startIpfsDaemon();
        } else {
          // Connect to existing network
          rl.question('Enter the multiaddr of the main IPFS node to connect to: ', (multiaddr) => {
            startIpfsDaemon();
            if (!multiaddr) {
              console.error('Main node multiaddr is required');
              rl.close();
              return;
            }
            
            console.log(`Connecting to main IPFS node at: ${multiaddr}`);
            connectToMainNode(multiaddr);
          });
        }
      });
    });
  });
}

function startIpfsDaemon() {
  console.log('Starting IPFS daemon...');
  
  // Start IPFS daemon with API and Gateway access from other machines
  const command = 'ipfs daemon --enable-pubsub-experiment --enable-namesys-pubsub';
  
  console.log(`Running command: ${command}`);
  
  const ipfsProcess = exec(command, (error, stdout, stderr) => {
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
  
  ipfsProcess.stdout.on('data', (data) => {
    console.log(data);
    
    // When we see the "Daemon is ready" message, show the connection info
    if (data.includes('Daemon is ready')) {
      exec('ipfs id', (err, stdout) => {
        if (!err) {
          try {
            const idInfo = JSON.parse(stdout);
            console.log('\n=====================================================');
            console.log('IPFS node is ready!');
            console.log('Your node ID:', idInfo.ID);
            console.log('\nShareable addresses for other nodes to connect to:');
            idInfo.Addresses.forEach(addr => {
              console.log(addr);
            });
            console.log('=====================================================\n');
          } catch (e) {
            console.error('Could not parse IPFS ID information');
          }
        }
      });
    }
  });

  ipfsProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  ipfsProcess.on('close', (code) => {
    console.log(`IPFS daemon process exited with code ${code}`);
    rl.close();
  });
}

function connectToMainNode(multiaddr) {
  // Connect to the main IPFS node
  exec(`ipfs swarm connect ${multiaddr}`, (error, stdout) => {
    if (error) {
      console.error(`Error connecting to main node: ${error.message}`);
      rl.close();
      return;
    }
    
    console.log(`Connected to main node: ${stdout.trim()}`);
  });
}

startLocalIpfsNode().catch(console.error);