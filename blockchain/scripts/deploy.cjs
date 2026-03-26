const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment of AgriChainTrace...");
  console.log("Network:", hre.network.name);
  
  // Get the deployer's address for logging
  const [deployer] = await hre.ethers.getSigners();
  console.log("📡 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  // Deploy the contract
  console.log("\n📝 Deploying AgriChainTrace contract...");
  const AgriChainTrace = await hre.ethers.getContractFactory("AgriChainTrace");
  const contract = await AgriChainTrace.deploy();
  
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log("\n✅ AgriChainTrace deployed to:", contractAddress);
  
  // Save deployment info to file
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    transactionHash: contract.deploymentTransaction().hash
  };
  
  // Save to deployments folder
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📁 Deployment info saved to: ${deploymentFile}`);
  
  // Update backend .env file
  const backendEnvPath = path.join(__dirname, "../../backend/.env");
  if (fs.existsSync(backendEnvPath)) {
    let envContent = fs.readFileSync(backendEnvPath, "utf8");
    
    // Update or add CONTRACT_ADDRESS
    if (envContent.includes("CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${contractAddress}`);
    } else {
      envContent += `\nCONTRACT_ADDRESS=${contractAddress}\n`;
    }
    
    fs.writeFileSync(backendEnvPath, envContent);
    console.log(`📝 Backend .env updated with CONTRACT_ADDRESS=${contractAddress}`);
  } else {
    console.log("⚠️ Backend .env file not found. Please manually add CONTRACT_ADDRESS to backend/.env");
  }
  
  // Update frontend .env if it exists
  const frontendEnvPath = path.join(__dirname, "../../agrichain-ui/.env");
  if (fs.existsSync(frontendEnvPath)) {
    let envContent = fs.readFileSync(frontendEnvPath, "utf8");
    
    // Update or add VITE_CONTRACT_ADDRESS
    if (envContent.includes("VITE_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(/VITE_CONTRACT_ADDRESS=.*/g, `VITE_CONTRACT_ADDRESS=${contractAddress}`);
    } else {
      envContent += `\nVITE_CONTRACT_ADDRESS=${contractAddress}\n`;
    }
    
    fs.writeFileSync(frontendEnvPath, envContent);
    console.log(`📝 Frontend .env updated with VITE_CONTRACT_ADDRESS=${contractAddress}`);
  }
  
  // Verify contract on Etherscan if not on localhost
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Waiting for block confirmations...");
    // Wait for 5 confirmations
    await contract.deploymentTransaction().wait(5);
    
    console.log("🔄 Attempting to verify contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan!");
    } catch (verifyError) {
      console.log("⚠️ Contract verification failed. You can verify manually:");
      console.log(`   npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
    }
  }
  
  // Print deployment summary
  console.log("\n" + "=".repeat(50));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(50));
  console.log(`Network:        ${hre.network.name}`);
  console.log(`Contract:       AgriChainTrace`);
  console.log(`Address:        ${contractAddress}`);
  console.log(`Deployer:       ${deployer.address}`);
  console.log(`Deployed at:    ${deploymentInfo.deployedAt}`);
  console.log(`Transaction:    ${deploymentInfo.transactionHash}`);
  console.log("=".repeat(50));
  
  // Print next steps
  console.log("\n🚀 NEXT STEPS:");
  console.log("1. Restart your backend server:");
  console.log("   cd backend && npm run dev");
  console.log("\n2. Register a farmer on the blockchain:");
  console.log("   Use the farmer registration endpoint with wallet address");
  console.log("\n3. Register a retailer on the blockchain:");
  console.log("   Use the retailer registration endpoint with wallet address");
  console.log("\n4. Test the supply chain flow:");
  console.log("   Farmer registers produce → Transfers to retailer → Retailer lists → Consumer purchases");
  
  // Optional: Create a test retailer registration transaction
  console.log("\n💡 TIP: You can test the contract directly using:");
  console.log(`   npx hardhat console --network ${hre.network.name}`);
  console.log(`   > const contract = await ethers.getContractAt("AgriChainTrace", "${contractAddress}")`);
  console.log(`   > await contract.registerRetailer("Test Retailer", "LIC123", "GST123")`);
}

// Execute deployment with error handling
main().catch((error) => {
  console.error("\n❌ Deployment failed!");
  console.error(error);
  process.exitCode = 1;
});