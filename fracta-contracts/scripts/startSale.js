const { ethers } = require("hardhat");

async function main() {
  console.log("Starting sale on PropertyToken contract...");

  // Contract address from deployment
  const PROPERTY_TOKEN_ADDRESS = "0xd312662Bd68743469dbFC9B819EA7c4Ba50aCB9b";
  
  // Get the contract
  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const propertyToken = PropertyToken.attach(PROPERTY_TOKEN_ADDRESS);

  try {
    // Start the sale for 30 days (30 * 24 * 60 * 60 = 2592000 seconds)
    const duration = 30 * 24 * 60 * 60; // 30 days in seconds
    console.log(`Starting sale for ${duration} seconds (30 days)...`);
    
    const tx = await propertyToken.startSale(duration);
    console.log("Transaction hash:", tx.hash);
    
    await tx.wait();
    console.log("✅ Sale started successfully!");
    
    // Check if sale is active
    const saleActive = await propertyToken.saleActive();
    console.log("Sale active:", saleActive);
    
  } catch (error) {
    console.error("❌ Error starting sale:", error.message);
    
    // Check if already active
    try {
      const saleActive = await propertyToken.saleActive();
      console.log("Current sale status:", saleActive);
    } catch (checkError) {
      console.error("Could not check sale status:", checkError.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 