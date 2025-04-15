# Blockchain Voting System with IPFS

This project is a distributed blockchain voting application that uses IPFS for storing candidate images and voter lists.

## System Architecture

The system consists of multiple components:

1. **Blockchain Nodes**: Multiple Ethereum nodes running in a private network
   - Mining nodes: Responsible for processing transactions and mining blocks
   - Consensus nodes: Participate in the network but don't mine

2. **IPFS Nodes**: Store distributed content like candidate images and voter lists

3. **Frontend Application**: Web interface for interacting with the blockchain and IPFS

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14+)
- IPFS Desktop or CLI (see https://docs.ipfs.tech/install/)
- Git

## Setup Instructions

### 1. Setting up the Blockchain Network

#### Main Mining Node

1. Navigate to the test-blockchain directory:
   ```
   cd test-blockchain
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the main mining node:
   ```
   node scripts/start-mining-node.js
   ```

4. Deploy the voting contract:
   ```
   npx hardhat run --network mining_node scripts/deploy.js
   ```

#### Additional Consensus Nodes (on other computers)

1. Clone the repository
2. Navigate to the test-blockchain directory
3. Install dependencies:
   ```
   npm install
   ```
4. Start a consensus node:
   ```
   node scripts/start-consensus-node.js
   ```
5. When prompted, enter the IP address of the main mining node

### 2. Setting up IPFS

#### Main IPFS Node

1. Start the IPFS daemon:
   ```
   node scripts/start-ipfs-node.js
   ```
2. When prompted, select "yes" to set up as the main node
3. Note the multiaddress shown in the output

#### Additional IPFS Nodes (on other computers)

1. Start the IPFS daemon:
   ```
   node scripts/start-ipfs-node.js
   ```
2. When prompted, select "no" to set up as a peer node
3. Enter the multiaddress of the main IPFS node when prompted

### 3. Setting up the Frontend

#### Configure Frontend to Connect to Blockchain

1. Navigate to the test-blockchain directory
2. Run the frontend configuration script:
   ```
   node scripts/configure-frontend.js
   ```
3. When prompted, enter the IP address of the blockchain node you want to connect to
4. Enter the contract address (this should be automatically populated if you deployed on the same machine)

#### Start the Frontend Application

1. Navigate to the voting-dapp directory:
   ```
   cd ../voting-dapp
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the application:
   ```
   npm run dev
   ```
4. Access the application in your browser at the URL displayed in the console
   (e.g., http://localhost:3000)

## Usage Instructions

### Administrator Actions

1. Connect your wallet using the Connect button
2. Navigate to the Admin panel
3. Add candidates (with images that will be uploaded to IPFS)
4. Register voters by adding their wallet addresses
5. Start the election when ready (this will generate a voter list on IPFS)

### Voter Actions

1. Connect your wallet using the Connect button
2. If your address is registered, you'll see the voting interface
3. Select a candidate and submit your vote
4. Your vote is recorded on the blockchain

### Viewing Results

1. Navigate to the Results page
2. See the real-time vote counts for each candidate
3. After the election is ended by the admin, the winner is highlighted

## Testing IPFS Functionality

To test IPFS functionality separately:
```
node scripts/test-ipfs-upload.js
```

This will:
1. Upload a test text string to IPFS
2. Upload a test JSON object to IPFS
3. Optionally upload a file of your choice to IPFS

## Connecting from Mobile Devices

You can access the voting application from mobile devices within the same network:

1. Make sure your frontend app is configured to connect to the correct blockchain node
   (use the `configure-frontend.js` script)
2. Start the frontend application
3. On your mobile device, open a browser and navigate to:
   `http://<your-computer-ip>:3000`
4. If your mobile device has a Web3-enabled browser like Metamask Mobile,
   you can connect your wallet and interact with the application

## Troubleshooting

- If the blockchain connection fails, make sure:
  1. The blockchain node is running
  2. The frontend is configured with the correct IP and port
  3. The contract is deployed to the network

- If IPFS content doesn't load, make sure:
  1. The IPFS daemon is running
  2. The IPFS nodes are connected in a network
  3. The content has been properly uploaded with a valid CID
  
- If you cannot connect from other devices:
  1. Check that your firewall allows incoming connections
  2. Ensure all devices are on the same network
  3. Verify the IP addresses in your configuration files are correct