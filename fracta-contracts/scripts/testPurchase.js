const { ethers } = require("hardhat");

async function main() {
    // Your wallet address
    const userAddress = "0xdf7dc773d20827e4796cbeaff5113b4f9514be34";
    
    // PropertyToken contract address
    const propertyTokenAddress = "0xd312662Bd68743469dbFC9b819EA7c4Ba50aCB9b";
    
    // Get the PropertyToken contract
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    const propertyToken = PropertyToken.attach(propertyTokenAddress);
    
    console.log("Testing purchase function...");
    console.log("User address:", userAddress);
    console.log("PropertyToken address:", propertyTokenAddress);
    
    // Get sale info
    const saleInfo = await propertyToken.getSaleInfo();
    console.log("Sale info:", {
        tokenPrice: ethers.formatEther(saleInfo[0]),
        tokensSold: saleInfo[1].toString(),
        tokensRemaining: saleInfo[2].toString(),
        saleActive: saleInfo[5]
    });
    
    // Calculate cost for 1 token
    const tokenAmount = 1;
    const tokenPrice = saleInfo[0];
    const totalCost = tokenAmount * tokenPrice;
    
    console.log("Cost for 1 token:", ethers.formatEther(totalCost), "ETH");
    
    // Test the purchase function (this will fail but show us the exact error)
    try {
        const tx = await propertyToken.purchaseTokens(tokenAmount, {
            value: totalCost
        });
        console.log("Purchase successful!");
    } catch (error) {
        console.log("Purchase failed with error:", error.message);
        
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