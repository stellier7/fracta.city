const { ethers } = require("hardhat");

async function main() {
  console.log("Checking PropertyToken contract state...");

  // Contract address from deployment
  const PROPERTY_TOKEN_ADDRESS = "0xd312662Bd68743469dbFC9B819EA7c4Ba50aCB9b";
  
  // Get the contract
  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const propertyToken = PropertyToken.attach(PROPERTY_TOKEN_ADDRESS);

  try {
    // Check sale status
    const saleActive = await propertyToken.saleActive();
    console.log("✅ Sale active:", saleActive);
    
    // Check token price
    const tokenPrice = await propertyToken.tokenPrice();
    console.log("💰 Token price (wei):", tokenPrice.toString());
    console.log("💰 Token price (ETH):", ethers.formatEther(tokenPrice));
    console.log("💰 Token price (USD at $3770/ETH):", "$" + (parseFloat(ethers.formatEther(tokenPrice)) * 3770).toFixed(2));
    
    // Check tokens sold
    const tokensSold = await propertyToken.tokensSold();
    console.log("🎯 Tokens sold:", tokensSold.toString());
    
    // Check total tokens
    const totalTokens = await propertyToken.balanceOf(PROPERTY_TOKEN_ADDRESS);
    console.log("📦 Tokens remaining in contract:", totalTokens.toString());
    
    // Check sale times
    const saleStartTime = await propertyToken.saleStartTime();
    const saleEndTime = await propertyToken.saleEndTime();
    console.log("⏰ Sale start time:", new Date(saleStartTime * 1000).toLocaleString());
    console.log("⏰ Sale end time:", new Date(saleEndTime * 1000).toLocaleString());
    
  } catch (error) {
    console.error("❌ Error checking contract:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 