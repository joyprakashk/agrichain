const hre = require("hardhat");

async function main() {
  const AgriChainTrace = await hre.ethers.getContractFactory("AgriChainTrace");
  const contract = await AgriChainTrace.deploy();
  
  await contract.waitForDeployment();
  
  console.log("AgriChainTrace deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});