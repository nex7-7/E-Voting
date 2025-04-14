const hre = require("hardhat");
const fs = require('fs');
const path = require('path');
const { uploadToIPFS } = require('./ipfs-config');

async function main() {
  // Check if a default image exists to upload
  const testImgPath = path.join(__dirname, '../test-images/default-candidate.jpg');
  let defaultCid = '';
  
  try {
    if (fs.existsSync(testImgPath)) {
      console.log('Uploading default candidate image to IPFS...');
      const imgContent = fs.readFileSync(testImgPath);
      defaultCid = await uploadToIPFS(imgContent);
      console.log(`Image uploaded with CID: ${defaultCid}`);
    } else {
      console.log('No default image found, using placeholder CID');
      defaultCid = 'QmdefaultPlaceholderCIDfornowReplaceThis';
    }
  } catch (error) {
    console.warn('IPFS upload failed, using placeholder CID:', error.message);
    defaultCid = 'QmdefaultPlaceholderCIDfornowReplaceThis';
  }
  
  // Deploy the Voting contract
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  
  // Wait for deployment to complete
  await voting.waitForDeployment();

  console.log("Voting contract deployed to:", voting.target);

  // Add sample candidates
  console.log("Adding candidates...");
  await voting.addCandidate("Candidate 1", "First candidate description", defaultCid);
  await voting.addCandidate("Candidate 2", "Second candidate description", defaultCid);
  console.log("Candidates added successfully");
  
  // Save the deployment info
  const deploymentInfo = {
    votingContract: voting.target,
    defaultCid: defaultCid,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(__dirname, '../deployment-info.json'), 
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log('Deployment info saved to deployment-info.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
