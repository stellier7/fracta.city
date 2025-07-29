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
    
    console.log("=== Testing Exact PropertyToken Call ===");
    console.log("User address:", userAddress);
    console.log("PropertyToken address:", propertyTokenAddress);
    console.log("ComplianceManager address:", complianceManagerAddress);
    
    // Test the exact call that PropertyToken.purchaseTokens() makes:
    // complianceManager.canInvest(msg.sender, address(this), _tokenAmount)
    // where msg.sender = userAddress, address(this) = propertyTokenAddress, _tokenAmount = 1
    
    const tokenAmount = 1;
    
    console.log("\nTesting exact PropertyToken call:");
    console.log("complianceManager.canInvest(userAddress, propertyTokenAddress, tokenAmount)");
    console.log("- userAddress:", userAddress);
    console.log("- propertyTokenAddress:", propertyTokenAddress);
    console.log("- tokenAmount:", tokenAmount);
    
    try {
        // This is the exact call that PropertyToken.purchaseTokens() makes
        const canInvest = await complianceManager.canInvest(userAddress, propertyTokenAddress, tokenAmount);
        console.log("\ncanInvest result:", canInvest);
        
        if (canInvest[0]) {
            console.log("✅ canInvest returned true - KYC should work!");
        } else {
            console.log("❌ canInvest returned false with reason:", canInvest[1]);
        }
        
    } catch (error) {
        console.log("❌ Error testing canInvest:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 