// This script sets up an IPFS cluster service for coordinated content pinning across nodes
const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setupIpfsCluster() {
  console.log('Setting up IPFS Cluster...');
  
  // Check if IPFS is installed
  try {
    execSync('ipfs --version');
  } catch (error) {
    console.error('IPFS is not installed. Please install it first.');
    console.log('Installation guide: https://docs.ipfs.tech/install/command-line/');
    rl.close();
    return;
  }

  // Check if IPFS Cluster is installed
  try {
    execSync('ipfs-cluster-service --version');
    execSync('ipfs-cluster-ctl --version');
  } catch (error) {
    console.error('IPFS Cluster tools are not installed. Please install them first.');
    console.log('Installation guide: https://ipfscluster.io/documentation/installation/');
    rl.close();
    return;
  }
  
  // Create IPFS data directory
  const ipfsDir = path.join(__dirname, '../ipfs_data');
  if (!fs.existsSync(ipfsDir)) {
    fs.mkdirSync(ipfsDir, { recursive: true });
  }
  
  // Create IPFS Cluster data directory
  const clusterDir = path.join(__dirname, '../ipfs_cluster_data');
  if (!fs.existsSync(clusterDir)) {
    fs.mkdirSync(clusterDir, { recursive: true });
  }

  // Initialize IPFS if not already initialized
  try {
    execSync('ipfs init');
    console.log('IPFS initialized successfully');
  } catch (error) {
    console.log('IPFS already initialized or error occurred');
  }

  // Ask if this is the main cluster node or a peer
  rl.question('Is this the bootstrap (main) cluster node? (yes/no): ', async (isMain) => {
    const isMainNode = isMain.toLowerCase() === 'yes';
    
    // Start IPFS daemon first
    console.log('Starting IPFS daemon...');
    await startIpfsDaemon();
    
    if (isMainNode) {
      // Initialize and start as bootstrap node
      await initBootstrapClusterNode();
    } else {
      // Connect to existing cluster as a peer
      await joinExistingCluster();
    }
  });
}

async function startIpfsDaemon() {
  return new Promise((resolve) => {
    // Check if IPFS daemon is already running
    exec('ipfs id', (error) => {
      if (!error) {
        console.log('IPFS daemon is already running');
        resolve();
        return;
      }
      
      console.log('Starting IPFS daemon in the background...');
      
      // Start IPFS daemon in the background
      const ipfsProcess = exec('ipfs daemon', (error) => {
        if (error) {
          console.error(`IPFS daemon error: ${error}`);
          // Still continue as the daemon might be running in the background
        }
      });
      
      // Set a timeout to give the daemon time to start
      setTimeout(() => {
        console.log('IPFS daemon should be running now');
        resolve();
      }, 5000); // Wait 5 seconds
    });
  });
}

async function initBootstrapClusterNode() {
  console.log('Initializing bootstrap cluster node...');
  
  try {
    // Initialize the cluster configuration
    execSync('ipfs-cluster-service init');
    console.log('Cluster service initialized');
    
    // Get the peer ID for sharing
    const peerInfo = execSync('ipfs-cluster-service --version').toString();
    console.log('Cluster peer information:');
    console.log(peerInfo);
    
    // Start the cluster service
    console.log('Starting IPFS Cluster service...');
    const clusterProcess = exec('ipfs-cluster-service daemon', (error) => {
      if (error) {
        console.error(`Cluster service error: ${error}`);
      }
    });
    
    // Listen for output to extract peer ID and addresses
    clusterProcess.stdout.on('data', (data) => {
      console.log(data);
      
      // When cluster is ready, show the peer ID and addresses
      if (data.includes('IPFS Cluster is ready')) {
        exec('ipfs-cluster-ctl id', (err, stdout) => {
          if (!err) {
            console.log('\n=====================================================');
            console.log('IPFS Cluster bootstrap node is ready!');
            console.log('Share this information with peers:');
            console.log(stdout);
            console.log('=====================================================\n');
          }
        });
      }
    });
    
    clusterProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    
    console.log('Bootstrap node setup complete. Keep this terminal open.');
    console.log('Other nodes can now join this cluster.');
  } catch (error) {
    console.error(`Error setting up bootstrap node: ${error}`);
    rl.close();
  }
}

async function joinExistingCluster() {
  rl.question('Enter the bootstrap peer multiaddress to connect to: ', async (bootstrapAddr) => {
    if (!bootstrapAddr) {
      console.error('Bootstrap peer multiaddress is required');
      rl.close();
      return;
    }
    
    try {
      console.log('Initializing cluster configuration...');
      execSync('ipfs-cluster-service init');
      
      // Update the cluster configuration to use the bootstrap node
      console.log('Updating cluster configuration to use bootstrap node...');
      const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.ipfs-cluster', 'service.json');
      
      if (fs.existsSync(configPath)) {
        let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // Set bootstrap peer addresses
        config.bootstrap = [bootstrapAddr];
        
        // Write updated config back
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log('Configuration updated with bootstrap peer');
        
        // Start the cluster service
        console.log('Starting IPFS Cluster service to join cluster...');
        const clusterProcess = exec('ipfs-cluster-service daemon', (error) => {
          if (error) {
            console.error(`Cluster service error: ${error}`);
          }
        });
        
        // Listen for ready message
        clusterProcess.stdout.on('data', (data) => {
          console.log(data);
          
          if (data.includes('IPFS Cluster is ready')) {
            console.log('\n=====================================================');
            console.log('Successfully joined the IPFS Cluster!');
            console.log('=====================================================\n');
          }
        });
        
        clusterProcess.stderr.on('data', (data) => {
          console.error(`stderr: ${data}`);
        });
        
        console.log('Peer node setup complete. Keep this terminal open.');
      } else {
        console.error(`Configuration file not found at ${configPath}`);
        rl.close();
      }
    } catch (error) {
      console.error(`Error joining cluster: ${error}`);
      rl.close();
    }
  });
}

setupIpfsCluster().catch(console.error);
