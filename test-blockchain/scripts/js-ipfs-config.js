const { create } = require('ipfs-core');
const all = require('it-all');
const { concat: uint8ArrayConcat } = require('uint8arrays/concat');
const { toString: uint8ArrayToString } = require('uint8arrays/to-string');
const fs = require('fs');
const path = require('path');

// We'll create and store the IPFS node as a singleton
let ipfsNode = null;

/**
 * Initialize or get the IPFS node
 * @returns {Promise<Object>} - IPFS node instance
 */
async function getIPFSNode() {
  if (!ipfsNode) {
    console.log('Creating IPFS node...');
    ipfsNode = await create({
      repo: path.join(__dirname, '../.ipfs-repo'),
      start: true,
      EXPERIMENTAL: {
        ipnsPubsub: true
      }
    });
    console.log('IPFS node created!');
  }
  return ipfsNode;
}

/**
 * Upload content to IPFS
 * @param {Buffer|String} content - The content to upload
 * @returns {Promise<string>} - IPFS CID
 */
async function uploadToIPFS(content) {
  try {
    const node = await getIPFSNode();
    const result = await node.add(content);
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
    const node = await getIPFSNode();
    const data = await all(node.cat(cid));
    return uint8ArrayConcat(data);
  } catch (error) {
    console.error('Error getting from IPFS:', error);
    throw error;
  }
}

/**
 * Get IPFS gateway URL (default to public gateway for retrieving content)
 * @param {string} cid - Content identifier
 * @returns {string} - URL to access the content
 */
function getIPFSUrl(cid) {
  return `https://ipfs.io/ipfs/${cid}`;
}

/**
 * Close the IPFS node gracefully
 */
async function stopIPFS() {
  if (ipfsNode) {
    console.log('Stopping IPFS node...');
    await ipfsNode.stop();
    ipfsNode = null;
    console.log('IPFS node stopped.');
  }
}

module.exports = {
  getIPFSNode,
  uploadToIPFS,
  getFromIPFS,
  getIPFSUrl,
  stopIPFS
};
