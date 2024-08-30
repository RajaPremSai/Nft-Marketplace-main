"use client"
import React, { useEffect, useState } from 'react'
import { useAccount, useContractRead, useContractWrite } from 'wagmi'
import { NftCollection, CollectionABI, NftMarketPlace, MarketABI } from '../constants'
import { readContract, waitForTransaction, writeContract } from 'wagmi/actions'
import {HiMenu} from 'react-icons/hi'
import { MdOutlineSell } from "react-icons/md";
import { BiTransfer } from "react-icons/bi";
import { MdOutlineBackspace } from "react-icons/md";
import { ethers,getDefaultProvider } from 'ethers'


export function Market() {
  const { address } = useAccount()
  const [tokenIds, setTokenIds] = useState([])
  const [metadataList, setMetadataList] = useState([])
  const [menuOpen, setMenuOpen] = useState(null); 
  const [tokenId,setTokenId] = useState(null)
  const [listedNftees, setListedNftees] = useState([])
  
  
  const toggleMenu = (index) => {
    setMenuOpen(menuOpen === index ? null : index);
  };

  const {data : isApproved} = useContractRead({
    address : NftCollection,
    abi : CollectionABI,
    functionName : "getApproved",
    args : []
  })

  const {data : listedNfts} = useContractRead({
    address : NftMarketPlace,
    abi : MarketABI,
    functionName : "getNftListigs",
    onSuccess(data){
        const tokenIDs = data.map(token=>token.tokenId.toString())
        setTokenIds(tokenIDs)
        setListedNftees(data)
    }
  })
    
  const {data : name} = useContractRead({
    address : NftCollection,
    abi : CollectionABI,
    functionName : "name",
  })
  const {data : symbol} = useContractRead({
    address : NftCollection,
    abi : CollectionABI,
    functionName : "symbol",
  })
  const { data: listingFee } = useContractRead({
    address: NftMarketPlace,
    abi: MarketABI,
    functionName: "listingFee",
  });

  
  async function buyNft(tokenId){

    try {
        const provider =  new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        console.log(provider);
        console.log(signer);
        const marketPlaceContract = new ethers.Contract(
            NftMarketPlace,
            MarketABI,
            signer
        )
        const listing = listedNftees.find(token => token.tokenId.toString() === tokenId)
        if (!listing) {
          throw new Error('Listing not found')
        }
        const price = listing.price.toString()/10**18;
        console.log(price);
        const tx = await marketPlaceContract.buyNFT(tokenId,{
            value : ethers.parseEther(`${price}`)
        })
        await tx.wait()
        
    } catch (error) {
        console.error('Listing NFT failed:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        window.alert(error)
    }
  }
  async function revertListing(tokenId){

    try {
        const provider =  new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        console.log(provider);
        console.log(signer);
        const marketPlaceContract = new ethers.Contract(
            NftMarketPlace,
            MarketABI,
            signer
        )
        const tx = await marketPlaceContract.revertListing(tokenId)
        await tx.wait()
        
    } catch (error) {
        console.error('Listing NFT failed:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        window.alert(error)
    }
  }
  async function dispute(tokenId){

    try {
        const provider =  new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const marketContract = new ethers.Contract(
            NftMarketPlace,
            MarketABI,
            signer
        )
        const tx = await marketContract.disputeSale(tokenId)
        await tx.wait()
        
    } catch (error) {
        console.error('Dispute of NFT failed:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        window.alert(error)
    }
  }



  // Fetch metadata for a given token ID
  const fetchTokenMetadata = async (tokenId) => {
    const  tokenMetadata  = await readContract({
      address: NftCollection,
      abi: CollectionABI,
      functionName: 'tokenMetadata',
      args: [tokenId],
    })
    return {tokenId,...tokenMetadata}
  }

  useEffect(() => {
    if (tokenIds.length > 0) {
      const fetchMetadata = async () => {
        const metadataPromises = tokenIds.map((tokenId) => fetchTokenMetadata(tokenId))
        const metadataArray = await Promise.all(metadataPromises)
        const combinedData = metadataArray.map((metadata) => {
          const listedNft = listedNftees.find((listed) => listed.tokenId.toString() === metadata.tokenId.toString())
          return { ...metadata, ...listedNft };
        });
        setMetadataList(combinedData)
        console.log(tokenIds);
        console.log(metadataArray);
      }
      fetchMetadata()
    }
  }, [listedNftees,tokenIds,address])

  return (
    <div>
        {console.log(listedNfts)}
        {console.log(tokenIds)}
        {console.log(metadataList)}
        {/* {console.log(provider)} */}
      <h1>All Listed NFTees</h1>
      <div className='container p-5'>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6'>
            {metadataList.map((metadata, index) => (
                <div key={index} className='bg-white shadow-lg rounded-lg overflow-hidden'>
                <div className="cursor-pointer flex flex-col h-full shadow bg-gray-950 text-white overflow-hidden rounded-lg group" >
                        <div className='relative h-6/7 h-full overflow-hidden'>
                            {metadata.image && (
                                <img src={metadata.image} alt='null' className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-110" />
                            )}
                            <div className="absolute top-2 right-2 flex space-x-2">
                                {metadata.seller != address && 
                                <button onClick={()=>buyNft(`${metadata.tokenId}`)}  className="bg-gray-950 text-white px-2 py-1 rounded hover:bg-gray-900">
                                    Buy
                                </button>}
                                <button onClick={(e) => {e.stopPropagation();  toggleMenu(index) }} className="bg-gray-950 text-white px-2 py-1 rounded hover:bg-gray-900">
                                    <HiMenu />
                                {menuOpen === index && (
                                    <div className="absolute right-0 mt-4 bg-gray-900  w-40 shadow-lg sm:w-38 md:w-30 lg:w-40 z-10">
                                    <div className="py-2 text-white">
                                        {metadata.seller != address &&
                                        <button onClick={()=>buyNft(`${metadata.tokenId}`)} className="flex items-center justify-start gap-2 w-full px-2 py-2 hover:bg-gray-700 transition-colors duration-300"><MdOutlineSell/> Buy</button>}
                                        {metadata.seller == address &&                                           
                                        <button onClick={()=>revertListing(`${metadata.tokenId}`)} className="flex items-center justify-start gap-2 w-full px-2 py-2 hover:bg-gray-700 transition-colors duration-300"><MdOutlineBackspace/> Remove Listing</button>}
                                        {metadata.arbiter == address && 
                                        <button onClick={()=>dispute(`${metadata.tokenId}`)} className="flex items-center justify-start gap-2 w-full px-2 py-2 hover:bg-gray-700 transition-colors duration-300"><MdOutlineBackspace/>Dispute</button>
                                                                              }
                                    </div>
                                    </div>
                                )}
                                </button>
                            </div>
                        </div>
                        <footer className='h-1/7 p-4 flex flex-col justify-between bg-gray-900 transition-colors duration-300 group-hover:bg-gray-800'>
                            <div className="text-lg font-bold text-truncate">{typeof metadata.title === 'string' ? metadata.title : 'No title available'}</div>
                            <div className="text-md font-semibold text-truncate">{name}</div>
                            {metadata.seller == address && <div className="text-sm text-gray-400 text-truncate">Listed And Owned</div>}
                            {/* <div className="text-sm  text-gray-500 text-truncate">{token.approved_account_ids[MarketplaceContract]  ? "Listed" : "Not Listed" }</div> */}
                        </footer>
                    </div>
                </div>
            ))}
            </div>
      </div>
    </div>
  )
}
