const { ethers } = require("hardhat");

async function main() {
  console.log("Updating PropertyToken contract price...");

  // Contract address from deployment
  const PROPERTY_TOKEN_ADDRESS = "0xd312662Bd68743469dbFC9B819EA7c4Ba50aCB9b";
  
  // Get the contract
  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const propertyToken = PropertyToken.attach(PROPERTY_TOKEN_ADDRESS);

  try {
    // Calculate $119 worth of ETH (assuming $3770/ETH)
    const ethPriceUSD = 3770; // Current ETH price
    const tokenPriceUSD = 119; // Token price in USD
    const tokenPriceETH = tokenPriceUSD / ethPriceUSD; // Convert to ETH
    const tokenPriceWei = ethers.parseEther(tokenPriceETH.toString());
    
    console.log("💰 Current token price (wei):", (await propertyToken.tokenPrice()).toString());
    console.log("💰 New token price (USD):", `$${tokenPriceUSD}`);
    console.log("💰 New token price (ETH):", tokenPriceETH);
    console.log("💰 New token price (wei):", tokenPriceWei.toString());
    
    // Update the token price
    console.log("🔄 Updating token price...");
    const tx = await propertyToken.updateTokenPrice(tokenPriceWei);
    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    console.log("✅ Token price updated successfully!");
    
    // Verify the new price
    const newPrice = await propertyToken.tokenPrice();
    console.log("✅ New token price (wei):", newPrice.toString());
    console.log("✅ New token price (ETH):", ethers.formatEther(newPrice));
    
  } catch (error) {
    console.error("❌ Error updating token price:", error.message);
    
    // Check if the function exists
    try {
      const functions = await propertyToken.interface.fragments;
      console.log("Available functions:", functions.map(f => f.name));
    } catch (checkError) {
      console.error("Could not check available functions:", checkError.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 