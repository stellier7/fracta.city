const { ethers } = require("hardhat");

async function main() {
    // Your wallet address
    const userAddress = "0xDF7dC773d20827E4796cbAeFf5113b4F9514BE34";
    
    // PropertyToken contract address
    const propertyTokenAddress = "0xd312662Bd68743469dbFC9B819EA7c4Ba50aCB9b";
    
    // Get the PropertyToken contract
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    const propertyToken = PropertyToken.attach(propertyTokenAddress);
    
    console.log("=== Checking Token Balance ===");
    console.log("User address:", userAddress);
    console.log("PropertyToken address:", propertyTokenAddress);
    
    // Get your token balance
    const balance = await propertyToken.balanceOf(userAddress);
    console.log("\nYour token balance:", balance.toString());
    
    // Get total supply
    const totalSupply = await propertyToken.totalSupply();
    console.log("Total supply:", totalSupply.toString());
    
    // Get tokens sold
    const tokensSold = await propertyToken.tokensSold();
    console.log("Tokens sold:", tokensSold.toString());
    
    // Get tokens remaining in contract
    const tokensInContract = await propertyToken.balanceOf(propertyTokenAddress);
    console.log("Tokens in contract:", tokensInContract.toString());
    
    // Get property info
    const propertyInfo = await propertyToken.getPropertyInfo();
    console.log("\nProperty info:", {
        name: propertyInfo.propertyName,
        totalTokens: propertyInfo.totalTokens.toString(),
        jurisdiction: propertyInfo.jurisdiction
    });
    
    // Get sale info
    const saleInfo = await propertyToken.getSaleInfo();
    console.log("Sale info:", {
        tokenPrice: ethers.formatEther(saleInfo[0]),
        tokensSold: saleInfo[1].toString(),
        tokensRemaining: saleInfo[2].toString(),
        saleActive: saleInfo[5]
    });
    
    // Check if you have tokens
    if (balance > 0) {
        console.log("\n✅ You own", balance.toString(), "tokens!");
    } else {
        console.log("\n❌ You don't own any tokens yet.");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 