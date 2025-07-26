import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Fracta.city contracts to Base Testnet...");

  // Deploy ComplianceManager first
  console.log("\n📋 Deploying ComplianceManager...");
  const ComplianceManager = await ethers.getContractFactory("ComplianceManager");
  const complianceManager = await ComplianceManager.deploy();
  await complianceManager.waitForDeployment();
  console.log("✅ ComplianceManager deployed to:", complianceManager.target);

  // Deploy PropertyToken for Duna Residences Studio
  console.log("\n🏠 Deploying Duna Residences Studio PropertyToken...");
  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const dunaStudioToken = await PropertyToken.deploy(
    "Duna Residences Studio",
    "Roatán, Prospera ZEDE", 
    "prospera",
    ethers.parseEther("119000"), // 119,000 USD worth in ETH
    1190, // 1,190 tokens
    ethers.parseEther("100"), // 100 USD per token in ETH
    complianceManager.target
  );
  await dunaStudioToken.waitForDeployment();
  console.log("✅ Duna Studio Token deployed to:", dunaStudioToken.target);

  console.log("\n🎉 Deployment Summary:");
  console.log("📋 ComplianceManager:", complianceManager.target);
  console.log("🏠 Duna Studio Token:", dunaStudioToken.target);
  console.log("\n💎 Property Details:");
  console.log("- Property: Duna Residences Studio");
  console.log("- Location: Roatán, Prospera ZEDE");
  console.log("- Total Tokens: 1,190");
  console.log("- Price per Token: ~$100 USD");
  console.log("- Total Property Value: ~$119,000 USD");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 