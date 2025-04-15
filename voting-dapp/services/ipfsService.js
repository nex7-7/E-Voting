import { unixfs } from '@helia/unixfs';
import { createHeliaHTTP } from '@helia/http';

/**
 * Create a connection to local IPFS node
 * @returns {Promise<{client: Helia, fs: UnixFS}>} Helia client and UnixFS interface
 */
const createHeliaClient = async () => {
  try {
    // Connect to local IPFS node using createHeliaHTTP
    const heliaClient = await createHeliaHTTP();
    const fs = unixfs(heliaClient);

    return { client: heliaClient, fs };
  } catch (error) {
    console.error('Error creating Helia client:', error);
    throw error;
  }
};

/**
 * Upload a file to IPFS
 * @param {File} file - The file to upload
 * @returns {Promise<string>} The CID of the uploaded file
 */
export const uploadFileToIPFS = async (file) => {
  try {
    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);
    
    // Create Helia client and upload file
    const { client, fs } = await createHeliaClient();
    const cid = await fs.addBytes(fileBuffer);
    
    return cid.toString();
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

/**
 * Get the URL for an IPFS resource
 * @param {string} cid - The IPFS CID
 * @returns {string} The URL to access the resource
 */
export const getIPFSUrl = (cid) => {
  if (!cid) return '';
  return `http://localhost:8080/ipfs/${cid}`;
};

/**
 * Upload JSON data to IPFS
 * @param {object} jsonData - JSON data to upload
 * @returns {Promise<string>} The CID of the uploaded JSON
 */
export const uploadJsonToIPFS = async (jsonData) => {
  try {
    const jsonContent = JSON.stringify(jsonData, null, 2);
    const jsonBuffer = Buffer.from(jsonContent);
    
    // Create Helia client and upload JSON
    const { client, fs } = await createHeliaClient();
    const cid = await fs.addBytes(jsonBuffer);
    
    return cid.toString();
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw error;
  }
};
