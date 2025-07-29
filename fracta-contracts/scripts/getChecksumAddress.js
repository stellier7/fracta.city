const { ethers } = require("hardhat");

async function main() {
    const address = "0xd312662Bd68743469dbFC9b819EA7c4Ba50aCB9b";
    const checksummed = ethers.getAddress(address);
    console.log("Original:", address);
    console.log("Checksummed:", checksummed);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 