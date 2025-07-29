const { ethers } = require("hardhat");

async function main() {
    const addresses = [
        "0xd312662Bd68743469dbFC9b819EA7c4Ba50aCB9b",
        "0xd312662bd68743469dbfc9b819ea7c4ba50acb9b",
        "0xD312662Bd68743469dbFC9b819EA7c4Ba50aCB9b"
    ];
    
    console.log("Testing different address formats:");
    for (let i = 0; i < addresses.length; i++) {
        try {
            const checksummed = ethers.getAddress(addresses[i]);
            console.log(`Format ${i + 1}: ${addresses[i]} -> ${checksummed}`);
        } catch (error) {
            console.log(`Format ${i + 1}: ${addresses[i]} -> INVALID`);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 