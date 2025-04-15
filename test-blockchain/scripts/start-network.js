const { execSync } = require('child_process');
const os = require('os');

// Get the local IP address to display to the user
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const interfaceName of Object.keys(interfaces)) {
    const networkInterface = interfaces[interfaceName];
    
    for (const iface of networkInterface) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        // You can add more checks here if you want to be more specific about the network
        return iface.address;
      }
    }
  }
  
  return '127.0.0.1'; // Default to localhost if no external IP found
}

const localIp = getLocalIpAddress();

console.log('Starting Hardhat network on local network interface only...');
console.log('\nYour local IP address is:', localIp);
console.log('\nSharing this address with frontend users on the same local network will allow them to connect.');
console.log('\nRPC URL for frontend configuration:');
console.log(`http://${localIp}:8545`);
console.log('\nStarting network...\n');

// Start Hardhat node on specific network interface
try {
  execSync(`npx hardhat node --hostname ${localIp} --network local_network`, { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to start Hardhat network:', error);
}
