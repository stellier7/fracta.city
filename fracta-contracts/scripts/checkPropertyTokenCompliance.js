const { ethers } = require("hardhat");

async function main() {
    // PropertyToken contract address
    const propertyTokenAddress = "0xd312662Bd68743469dbFC9B819EA7c4Ba50aCB9b";
    
    // Get the PropertyToken contract
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    const propertyToken = PropertyToken.attach(propertyTokenAddress);
    
    console.log("=== Checking PropertyToken ComplianceManager ===");
    console.log("PropertyToken address:", propertyTokenAddress);
    
    // Get the ComplianceManager address that PropertyToken is using
    const complianceManagerAddress = await propertyToken.complianceManager();
    console.log("PropertyToken's ComplianceManager address:", complianceManagerAddress);
    
    // Get property info
    const propertyInfo = await propertyToken.getPropertyInfo();
    console.log("Property info:", {
        name: propertyInfo.propertyName,
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
    
    // Check if the ComplianceManager address matches what we expect
    const expectedComplianceManager = "0x9E7C50EBc62f7A0C97BF8b1D3f274b58dB11aB8F";
    console.log("Expected ComplianceManager:", expectedComplianceManager);
    console.log("Addresses match:", complianceManagerAddress === expectedComplianceManager);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 