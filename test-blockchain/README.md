# Hardhat Voting Smart Contract

This project demonstrates how to set up, deploy, and interact with a simple voting smart contract using Hardhat.

## **Installation**

Ensure you have **npm** installed, then install dependencies:
```sh
npm install
```

## **Running a Local Blockchain**
Start a local Hardhat blockchain:
```sh
npx hardhat node
```

## **Deploying the Smart Contract**
In a new terminal, deploy the contract to the local blockchain:
```sh
npx hardhat run scripts/deploy.js --network localhost
```
After deployment, note the contract address displayed in the terminal.

## **Interacting with the Contract**
Start the Hardhat console:
```sh
npx hardhat console --network localhost
```

### **Cast a Vote**
```js
const Voting = await ethers.getContractFactory("Voting");
const voting = await Voting.attach("0xYourContractAddress"); // Replace with actual contract address

// Cast a vote
await voting.vote("Alice");
```

### **Check Votes**
```js
(await voting.getVotes("Alice")).toString();
```

## **Next Steps**
- Modify the smart contract to add more features.
- Integrate with a frontend using Web3.js or Ethers.js.
- Deploy the contract to a testnet like Goerli or Sepolia.

For more Hardhat commands:
```sh
npx hardhat help
```