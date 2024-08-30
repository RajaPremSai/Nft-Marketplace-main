const hre = require('hardhat')

async function sleep(ms){
    return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main(){
    // const collection = await hre.ethers.deployContract("NftCollection")
    // collection.waitForDeployment()
    // console.log(`NFT Collection deployed at : ${collection.target}`);
    // const marketPlace = await hre.ethers.deployContract("NFTMarketplace",[collection.target])
    // marketPlace.waitForDeployment()
    // console.log(`NFT MarketPlace deployed at : ${marketPlace.target}`);
    const collection = await hre.ethers.deployContract("Migrations")
    collection.waitForDeployment()
    console.log(`Migrations deployed at : ${collection.target}`);
    const marketPlace = await hre.ethers.deployContract("storeHash")
    marketPlace.waitForDeployment()
    console.log(`StoreHash deployed at : ${marketPlace.target}`);

    await sleep(30 * 1000)

    await hre.run('verify:verify',{
        address : collection.target,
        constructorArguments : []
    })

    await hre.run('verify:verify',{
        address : marketPlace.target,
        constructorArguments : [collection.target]
    })
}

main().catch((err)=>{
    console.error(err);
    process.exitCode(1);
})