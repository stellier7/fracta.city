const { ethers } = require("hardhat");

async function main() {
    // Your wallet address
    const userAddress = "0xDF7dC773d20827E4796cbAeFf5113b4F9514BE34";
    
    // Contract addresses
    const complianceManagerAddress = "0x9E7C50EBc62f7A0C97BF8b1D3f274b58dB11aB8F";
    const propertyTokenAddress = "0xd312662Bd68743469dbFC9B819EA7c4Ba50aCB9b";
    
    // Get the ComplianceManager contract
    const ComplianceManager = await ethers.getContractFactory("ComplianceManager");
    const complianceManager = ComplianceManager.attach(complianceManagerAddress);
    
    // Get the PropertyToken contract
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    const propertyToken = PropertyToken.attach(propertyTokenAddress);
    
    console.log("=== Testing canInvest Function ===");
    console.log("User address:", userAddress);
    console.log("PropertyToken address:", propertyTokenAddress);
    console.log("ComplianceManager address:", complianceManagerAddress);
    
    // Test with 1 token (the amount from your transaction)
    const tokenAmount = 1;
    
    console.log("\nTesting canInvest with parameters:");
    console.log("- User:", userAddress);
    console.log("- Property:", propertyTokenAddress);
    console.log("- Amount:", tokenAmount);
    
    try {
        // Test canInvest function
        const canInvest = await complianceManager.canInvest(userAddress, propertyTokenAddress, tokenAmount);
        console.log("\ncanInvest result:", canInvest);
        
        // Test getUserComplianceStatus
        const kycStatus = await complianceManager.getUserComplianceStatus(userAddress);
        console.log("\nKYC Status for canInvest check:", {
            kycValid: kycStatus[0],
            jurisdiction: kycStatus[1],
            expiry: new Date(Number(kycStatus[2]) * 1000),
            hasProspectsPermit: kycStatus[3],
            permitId: kycStatus[4]
        });
        
        // Check if property is registered
        const prosperaProperty = await complianceManager.prosperaProperties(propertyTokenAddress);
        const internationalProperty = await complianceManager.internationalProperties(propertyTokenAddress);
        console.log("\nProperty registration:", {
            prosperaProperty: prosperaProperty,
            internationalProperty: internationalProperty
        });
        
    } catch (error) {
        console.log("Error testing canInvest:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 