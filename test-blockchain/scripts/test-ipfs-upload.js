const fs = require('fs');
const path = require('path');
const { uploadToIPFS, getIPFSUrl } = require('./ipfs-config');

async function main() {
  try {
    // Check if IPFS node is running
    console.log('Testing connection to local IPFS node...');
    
    // Create a test directory if it doesn't exist
    const testDir = path.join(__dirname, '../test-images');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }
    
    // Create a test image path (assuming you have an image there)
    // If not, this will create a text file instead
    const testFilePath = path.join(testDir, 'test-image.jpg');
    
    let content;
    if (fs.existsSync(testFilePath)) {
      console.log('Reading existing image file...');
      content = fs.readFileSync(testFilePath);
    } else {
      console.log('Creating a test text file instead...');
      content = Buffer.from('This is a test file for IPFS upload from Hardhat');
      fs.writeFileSync(path.join(testDir, 'test.txt'), content);
    }
    
    // Upload to IPFS
    console.log('Uploading to IPFS...');
    const cid = await uploadToIPFS(content);
    
    console.log('✅ Successfully uploaded to IPFS!');
    console.log(`CID: ${cid}`);
    console.log(`URL: ${getIPFSUrl(cid)}`);
    console.log('\nYou can use this CID in your Voting contract\'s addCandidate method');
    
    // Write the CID to a file for later use
    fs.writeFileSync(path.join(testDir, 'last-upload-cid.txt'), cid);
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('Make sure your local IPFS node is running!');
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
