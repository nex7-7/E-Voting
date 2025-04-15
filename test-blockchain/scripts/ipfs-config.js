// ipfs-config.js - IPFS utility functions for Hardhat scripts
const fs = require('fs');
const path = require('path');
const { create } = require('ipfs-http-client');

// Create IPFS client connected to local node
const ipfs = create({
  host: 'localhost',
  port: 5001,
  protocol: 'http'
});

/**
 * Upload content to IPFS
 * @param {Buffer|string} content - Content to upload
 * @returns {Promise<string>} CID of uploaded content
 */
async function uploadToIPFS(content) {
  try {
    const result = await ipfs.add(content);
    return result.path;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}

/**
 * Get URL for IPFS resource
 * @param {string} cid - IPFS CID
 * @returns {string} URL to access the resource
 */
function getIPFSUrl(cid) {
  return `http://localhost:8080/ipfs/${cid}`;
}

/**
 * Read a file and upload it to IPFS
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} CID of uploaded file
 */
async function uploadFileToIPFS(filePath) {
  const content = fs.readFileSync(filePath);
  return await uploadToIPFS(content);
}

/**
 * Upload JSON data to IPFS
 * @param {object} jsonData - JSON data to upload
 * @returns {Promise<string>} CID of uploaded JSON
 */
async function uploadJsonToIPFS(jsonData) {
  const jsonContent = JSON.stringify(jsonData, null, 2);
  return await uploadToIPFS(Buffer.from(jsonContent));
}

module.exports = {
  uploadToIPFS,
  getIPFSUrl,
  uploadFileToIPFS,
  uploadJsonToIPFS
};
