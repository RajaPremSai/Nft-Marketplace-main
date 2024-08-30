const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const {ethers} = require('hardhat')

describe('WhiteList', () => {
  let collection;
  let marketPlace;
  beforeEach(async()=>{
     
    const collectionContract = await ethers.getContractFactory("NftCollection")
    collection = await collectionContract.deploy()
    console.log(`NFT Collection deployed at : ${collection.target}`);
    const marketPlaceContract = await ethers.getContractFactory("NFTMarketplace")
    marketPlace = await marketPlaceContract.deploy(collection.target)
    console.log(`NFT MarketPlace deployed at : ${marketPlace.target}`);

    })
    describe('Deployment', () => {

      it('reqEthPrice',async()=>{
        const value = await marketPlace.reqEthPrice()
      })
      it('reqEthPrice',async()=>{
        const value = await marketPlace.reqEthPrice()
      })
      
   
  })

  describe('Deployment', () => {

      // it('Sets maximum number of whitelistings',async()=>{
      //     expect(await deploedContract.maxWhitelistings()).to.equal(10);
      // })
      // it('Initializes the whitelist to 0',async()=>{
      //     expect(await deploedContract.numOfWhitelistedAddresses()).to.equal(0)
      // })
   
  })

  describe('Whitelisting', () => {
  //     it('check address through mapping', async()=>{
  //         // will give false, initially no one is in Whitelist
  //         expect(await deploedContract.whitelistedAddress('0x271a475513Fc38Bf44981a874Fbec7b3Fc61c471')).to.equal(false)
  //     })
  //     it('Add the address to the Whitelist ', async()=>{
  //         // add the signer to Whitelist 
  //         const tx = await deploedContract.addAddressToWhitelist();
  //         // wait for the transaction to complete
  //         await tx.wait()
  //         // now check the number of whitelisted addresses through the state variable it should be 1 now..!
  //         expect(await deploedContract.numOfWhitelistedAddresses()).to.equal(1)
  //     })
  // })
})

})