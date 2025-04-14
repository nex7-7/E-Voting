const { create } = require('ipfs-http-client');

// Connect to the local IPFS node
// Default port is 5001 for the API
const ipfs = create({ host: 'localhost', port: 5001, protocol: 'http' });

/**
 * Upload content to IPFS
 * @param {Buffer|String} content - The content to upload
 * @returns {Promise<string>} - IPFS CID
 */
async function uploadToIPFS(content) {
  try {
    const result = await ipfs.add(content);
    console.log('Content uploaded to IPFS with CID:', result.path);
    return result.path;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}

/**
 * Get content from IPFS
 * @param {string} cid - Content identifier
 * @returns {Promise<Buffer>} - Content data
 */
async function getFromIPFS(cid) {
  try {
    const chunks = [];
    for await (const chunk of ipfs.cat(cid)) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Error getting from IPFS:', error);
    throw error;
  }
}

/**
 * Get local IPFS gateway URL
 * @param {string} cid - Content identifier
 * @returns {string} - Local gateway URL
 */
function getIPFSUrl(cid) {
  return `http://localhost:8080/ipfs/${cid}`;
}

module.exports = {
  ipfs,
  uploadToIPFS,
  getFromIPFS,
  getIPFSUrl
};
