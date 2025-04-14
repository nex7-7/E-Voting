const fs = require('fs');
const path = require('path');
const { uploadToIPFS, getIPFSUrl, getFromIPFS, stopIPFS } = require('./js-ipfs-config');
const { toString: uint8ArrayToString } = require('uint8arrays/to-string');

async function main() {
  try {
    console.log('Starting IPFS test...');
    
    // Create test directory if it doesn't exist
    const testDir = path.join(__dirname, '../test-images');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }
    
    // Create test content
    const testContent = 'Hello, this is a test content from js-ipfs: ' + new Date().toISOString();
    console.log('Test content:', testContent);
    
    // Upload to IPFS
    console.log('Uploading content to IPFS...');
    const cid = await uploadToIPFS(Buffer.from(testContent));
    
    console.log('Content uploaded successfully!');
    console.log('CID:', cid);
    console.log('Gateway URL:', getIPFSUrl(cid));
    
    // Get content back from IPFS to verify
    console.log('\nRetrieving content from IPFS to verify...');
    const retrievedContent = await getFromIPFS(cid);
    const contentString = uint8ArrayToString(retrievedContent);
    
    console.log('Retrieved content:', contentString);
    console.log('Content verification:', contentString === testContent ? 'SUCCESS' : 'FAILED');
    
    // Save CID to file for later use
    fs.writeFileSync(path.join(testDir, 'last-upload-cid.txt'), cid);
    
    // Clean up
    await stopIPFS();
    
    console.log('\nIPFS test completed successfully. You can use the CID in your contracts.');
  } catch (error) {
    console.error('Error running IPFS test:', error);
    // Try to clean up even if there was an error
    try {
      await stopIPFS();
    } catch (e) {
      console.error('Failed to stop IPFS node:', e);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
