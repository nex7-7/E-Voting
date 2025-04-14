const fs = require('fs');
const path = require('path');
const { uploadToIPFS, getIPFSUrl } = require('../utils/ipfsHelper');

// Load environment variables
require('dotenv').config();

async function main() {
  try {
    // Path to image file
    const filePath = path.join(__dirname, '../test-images/candidate.jpg');
    
    // Read the file
    const fileContent = fs.readFileSync(filePath);
    
    console.log('Uploading image to IPFS...');
    
    // Upload to IPFS
    const cid = await uploadToIPFS(fileContent);
    
    console.log('Upload successful!');
    console.log('IPFS CID:', cid);
    console.log('IPFS URL:', getIPFSUrl(cid));
    
    console.log('\nYou can use this CID in the addCandidate function of the Voting contract.');
  } catch (error) {
    console.error('Error:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
