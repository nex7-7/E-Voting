import { create } from 'ipfs-http-client';

// Configure auth for Infura IPFS
const projectId = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID;
const projectSecret = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET;
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

// Create IPFS client
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth
  }
});

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
    
    // Upload to IPFS
    const result = await ipfs.add(fileBuffer);
    return result.path;
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
  return `https://ipfs.io/ipfs/${cid}`;
};
