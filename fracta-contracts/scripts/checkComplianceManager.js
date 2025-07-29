const { ethers } = require("hardhat");

async function main() {
    // PropertyToken contract address
    const propertyTokenAddress = "0xd312662Bd68743469dbFC9B819EA7c4Ba50aCB9b";
    
    // Get the PropertyToken contract
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    const propertyToken = PropertyToken.attach(propertyTokenAddress);
    
    console.log("Checking PropertyToken contract...");
    console.log("PropertyToken address:", propertyTokenAddress);
    
    // Get the ComplianceManager address
    const complianceManagerAddress = await propertyToken.complianceManager();
    console.log("ComplianceManager address:", complianceManagerAddress);
    
    // Get property info
    const propertyInfo = await propertyToken.getPropertyInfo();
    console.log("Property info:", {
        name: propertyInfo.propertyName,
        jurisdiction: propertyInfo.jurisdiction,
        totalTokens: propertyInfo.totalTokens.toString()
    });
    
    // Get sale info
    const saleInfo = await propertyToken.getSaleInfo();
    console.log("Sale info:", {
        tokenPrice: ethers.formatEther(saleInfo[0]),
        tokensSold: saleInfo[1].toString(),
        tokensRemaining: saleInfo[2].toString(),
        saleActive: saleInfo[5]
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 