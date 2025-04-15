// Test script to verify IPFS functionality
const { uploadToIPFS, getIPFSUrl, uploadJsonToIPFS } = require('./ipfs-config');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log('Testing IPFS connection and functionality...');
  
  try {
    // Test basic text upload
    const testText = `Hello from IPFS test! Timestamp: ${new Date().toISOString()}`;
    console.log(`Uploading test string: "${testText}"`);
    
    const textCid = await uploadToIPFS(Buffer.from(testText));
    console.log(`Text uploaded successfully! CID: ${textCid}`);
    console.log(`You can view it at: ${getIPFSUrl(textCid)}`);
    
    // Test JSON upload
    const testJson = {
      name: "Test Election",
      timestamp: new Date().toISOString(),
      message: "This is a test of IPFS JSON storage",
      nested: {
        data: [1, 2, 3],
        boolean: true
      }
    };
    
    console.log('\nUploading test JSON:');
    console.log(JSON.stringify(testJson, null, 2));
    
    const jsonCid = await uploadJsonToIPFS(testJson);
    console.log(`JSON uploaded successfully! CID: ${jsonCid}`);
    console.log(`You can view it at: ${getIPFSUrl(jsonCid)}`);
    
    // Ask user if they want to test file upload
    rl.question('\nWould you like to test uploading an image file? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        rl.question('Enter the path to an image file: ', async (filePath) => {
          try {
            console.log(`Uploading file: ${filePath}`);
            
            if (!fs.existsSync(filePath)) {
              console.error(`File not found: ${filePath}`);
              rl.close();
              return;
            }
            
            const fileBuffer = fs.readFileSync(filePath);
            const fileCid = await uploadToIPFS(fileBuffer);
            
            console.log(`File uploaded successfully! CID: ${fileCid}`);
            console.log(`You can view it at: ${getIPFSUrl(fileCid)}`);
            rl.close();
          } catch (error) {
            console.error(`Error uploading file: ${error.message}`);
            rl.close();
          }
        });
      } else {
        console.log('Skipping file upload test.');
        rl.close();
      }
    });
  } catch (error) {
    console.error(`IPFS test failed: ${error.message}`);
    console.log('\nPlease make sure:');
    console.log('1. IPFS daemon is running (start with "ipfs daemon")');
    console.log('2. IPFS HTTP API is accessible at http://localhost:5001');
    console.log('3. You have ipfs-http-client installed (npm install ipfs-http-client)');
    rl.close();
  }
}

main().catch(console.error);
