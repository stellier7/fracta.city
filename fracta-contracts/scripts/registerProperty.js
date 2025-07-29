const { ethers } = require("hardhat");

async function main() {
    // Contract addresses
    const complianceManagerAddress = "0x9E7C50EBc62f7A0C97BF8b1D3f274b58dB11aB8F";
    const propertyTokenAddress = "0xd312662Bd68743469dbFC9B819EA7c4Ba50aCB9b";
    
    // Get the ComplianceManager contract
    const ComplianceManager = await ethers.getContractFactory("ComplianceManager");
    const complianceManager = ComplianceManager.attach(complianceManagerAddress);
    
    console.log("=== Registering Property in ComplianceManager ===");
    console.log("ComplianceManager address:", complianceManagerAddress);
    console.log("PropertyToken address:", propertyTokenAddress);
    
    // Register the property as a Prospera property (since jurisdiction is "prospera")
    const requiresProspera = true;
    const allowsInternational = false;
    
    console.log("\nRegistering property with:");
    console.log("- requiresProspera:", requiresProspera);
    console.log("- allowsInternational:", allowsInternational);
    
    try {
        const tx = await complianceManager.setPropertyJurisdiction(
            propertyTokenAddress,
            requiresProspera,
            allowsInternational
        );
        
        console.log("Transaction hash:", tx.hash);
        
        // Wait for transaction to be mined
        await tx.wait();
        
        console.log("✅ Property registered successfully!");
        
        // Verify registration
        const prosperaProperty = await complianceManager.prosperaProperties(propertyTokenAddress);
        const internationalProperty = await complianceManager.internationalProperties(propertyTokenAddress);
        
        console.log("\nVerification:");
        console.log("- prosperaProperty:", prosperaProperty);
        console.log("- internationalProperty:", internationalProperty);
        
    } catch (error) {
        console.log("❌ Failed to register property:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 