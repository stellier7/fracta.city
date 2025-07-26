import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Fracta.city Smart Contracts", function () {
  async function deployFractaCityFixture() {
    const [owner, user1, user2, platformFeeRecipient] = await ethers.getSigners();
    
    // Deploy ComplianceManager
    const ComplianceManager = await ethers.getContractFactory("ComplianceManager");
    const complianceManager = await ComplianceManager.deploy();
    
    // Deploy TokenSale
    const TokenSale = await ethers.getContractFactory("TokenSale");
    const tokenSale = await TokenSale.deploy(complianceManager.target, platformFeeRecipient.address);
    
    // Deploy RevenueDistribution
    const RevenueDistribution = await ethers.getContractFactory("RevenueDistribution");
    const revenueDistribution = await RevenueDistribution.deploy(platformFeeRecipient.address);
    
    // Deploy PropertyToken
    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    const propertyToken = await PropertyToken.deploy(
      "Duna Residences Studio",
      "Roatán, Prospera ZEDE",
      "prospera",
      ethers.parseEther("119000"), // $119,000 property value
      1190, // 1,190 tokens
      ethers.parseEther("100"), // $100 per token
      complianceManager.target
    );
    
    return {
      complianceManager,
      tokenSale,
      revenueDistribution,
      propertyToken,
      owner,
      user1,
      user2,
      platformFeeRecipient,
    };
  }
  
  describe("Contract Deployment", function () {
    it("Should deploy ComplianceManager with correct owner", async function () {
      const { complianceManager, owner } = await loadFixture(deployFractaCityFixture);
      
      expect(await complianceManager.owner()).to.equal(owner.address);
    });
    
    it("Should deploy TokenSale with correct parameters", async function () {
      const { tokenSale, complianceManager, platformFeeRecipient } = await loadFixture(deployFractaCityFixture);
      
      expect(await tokenSale.complianceManager()).to.equal(complianceManager.target);
      expect(await tokenSale.platformFeeRecipient()).to.equal(platformFeeRecipient.address);
    });
    
    it("Should deploy PropertyToken with correct parameters", async function () {
      const { propertyToken } = await loadFixture(deployFractaCityFixture);
      
      expect(await propertyToken.name()).to.equal("Fracta Duna Residences Studio");
      expect(await propertyToken.symbol()).to.equal("FPT");
      expect(await propertyToken.tokenPrice()).to.equal(ethers.parseEther("100"));
    });
    
    it("Should deploy RevenueDistribution with correct parameters", async function () {
      const { revenueDistribution, platformFeeRecipient } = await loadFixture(deployFractaCityFixture);
      
      expect(await revenueDistribution.platformFeeRecipient()).to.equal(platformFeeRecipient.address);
    });
  });
  
  describe("Basic Functionality", function () {
    it("Should approve KYC in ComplianceManager", async function () {
      const { complianceManager, user1 } = await loadFixture(deployFractaCityFixture);
      
      const expiryTime = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year from now
      
      await complianceManager.approveKYC(user1.address, "prospera", expiryTime);
      
      expect(await complianceManager.kycApproved(user1.address)).to.be.true;
      expect(await complianceManager.kycJurisdiction(user1.address)).to.equal("prospera");
    });
    
    it("Should set property jurisdiction", async function () {
      const { complianceManager, propertyToken } = await loadFixture(deployFractaCityFixture);
      
      await complianceManager.setPropertyJurisdiction(propertyToken.target, true, false);
      
      expect(await complianceManager.prosperaProperties(propertyToken.target)).to.be.true;
      expect(await complianceManager.internationalProperties(propertyToken.target)).to.be.false;
    });
    
    it("Should start and end token sale", async function () {
      const { propertyToken } = await loadFixture(deployFractaCityFixture);
      
      const saleDuration = 30 * 24 * 60 * 60; // 30 days
      await propertyToken.startSale(saleDuration);
      
      expect(await propertyToken.saleActive()).to.be.true;
      
      await propertyToken.endSale();
      expect(await propertyToken.saleActive()).to.be.false;
    });
  });
}); 