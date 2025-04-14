const { create } = require('ipfs-http-client');

// Configure IPFS client - using Infura as the IPFS node provider
// You'll need to add your Infura project ID and secret to .env file
const projectId = process.env.INFURA_IPFS_PROJECT_ID;
const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET;
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

// Create an IPFS client
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth
  }
});

/**
 * Upload content to IPFS
 * @param {Buffer} content - The content to upload
 * @returns {Promise<string>} The CID of the uploaded content
 */
async function uploadToIPFS(content) {
  try {
    const added = await ipfs.add(content);
    console.log('Content uploaded to IPFS with CID:', added.path);
    return added.path;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}

/**
 * Get public URL for IPFS content
 * @param {string} cid - The CID of the content
 * @returns {string} The public gateway URL
 */
function getIPFSUrl(cid) {
  return `https://ipfs.io/ipfs/${cid}`;
}

module.exports = {
  uploadToIPFS,
  getIPFSUrl
};
