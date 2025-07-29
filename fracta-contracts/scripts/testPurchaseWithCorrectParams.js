const { ethers } = require("hardhat");

async function main() {
    // Your wallet address
    const userAddress = "0xDF7dC773d20827E4796cbAeFf5113b4F9514BE34";
    
    // PropertyToken contract address
    const propertyTokenAddress = "0xd312662Bd68743469dbFC9B819EA7c4Ba50aCB9b";
    
    // Get the PropertyToken contract
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    const propertyToken = PropertyToken.attach(propertyTokenAddress);
    
    console.log("=== Testing Purchase with Correct Parameters ===");
    console.log("User address:", userAddress);
    console.log("PropertyToken address:", propertyTokenAddress);
    
    // Get sale info
    const saleInfo = await propertyToken.getSaleInfo();
    const tokenPrice = saleInfo[0];
    const tokenAmount = 1; // This should be 1 token
    const totalCost = BigInt(tokenAmount) * tokenPrice;
    
    console.log("\nPurchase parameters:");
    console.log("- Token amount:", tokenAmount);
    console.log("- Token price:", ethers.formatEther(tokenPrice), "ETH");
    console.log("- Total cost:", ethers.formatEther(totalCost), "ETH");
    
    // Test the purchase function with correct parameters
    try {
        console.log("\nTesting purchaseTokens(1) with correct parameters...");
        
        // This should work since canInvest returns true
        const tx = await propertyToken.purchaseTokens(tokenAmount, {
            value: totalCost
        });
        
        console.log("✅ Purchase successful! Transaction hash:", tx.hash);
        
    } catch (error) {
        console.log("❌ Purchase failed with error:", error.message);
        
        // Check if it's a KYC error
        if (error.message.includes("KYC not approved")) {
            console.log("This confirms the KYC issue");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 