"use client"
import React, { useEffect, useState } from 'react'
import { useAccount, useContractRead, useContractWrite } from 'wagmi'
import { NftCollection, CollectionABI, NftMarketPlace, MarketABI } from '../constants'
import { readContract, waitForTransaction, writeContract } from 'wagmi/actions'
import {HiMenu} from 'react-icons/hi'
import { MdOutlineSell } from "react-icons/md";
import { BiTransfer } from "react-icons/bi";
import { MdOutlineBackspace } from "react-icons/md";
import {SellModal} from './SellModal'
import {TransferModal} from './TransferModal'
import { ethers,getDefaultProvider } from 'ethers'
import Button from './button'


export function UserNfts() {
  const { address } = useAccount()
  const [tokenIds, setTokenIds] = useState([])
  const [metadataList, setMetadataList] = useState([])
  const [menuOpen, setMenuOpen] = useState(null); 
  const [openSellModal, setOpenSellModal] = useState(false);
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const [tokenId,setTokenId] = useState(null)
  const metadataKeys = {
    title: 0,
    description: 1,
    image: 2
  };
  const handleOpenSellModal = (token) => {
    setOpenSellModal(true)
    setTokenId(token)
  };

  const handleOpenTransferModal = (token) => {
    setOpenTransferModal(true)
    setTokenId(token)
  };

  const handleClose = () => {
    setOpenSellModal(false)
    setOpenTransferModal(false)
  };
  
  const toggleMenu = (index) => {
    setMenuOpen(menuOpen === index ? null : index);
  };
    

  // Fetch the token IDs owned by the user
  const { data: tokensOwned } = useContractRead({
    address: NftCollection,
    abi: CollectionABI,
    functionName: 'tokensOwned',
    args: [address],
    onSuccess(data) {
      const tokenIdsAsNumbers = data.map(id => id.toString())
      setTokenIds(tokenIdsAsNumbers)
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
  const { data: isApproved } = useContractRead({
    address: NftCollection,
    abi: CollectionABI,
    functionName: "isApprovedForAll",
    args : [address,NftMarketPlace]
  });


  async function listNft(tokenId, price, arbitrer){

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
        const tx = await marketPlaceContract.listNFT(tokenId,price,arbitrer,{
            value : ethers.parseEther("0.01")
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
  async function trannsferNFT(address, receiver, tokenId){

    try {
        const provider =  new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const collectionContract = new ethers.Contract(
            NftCollection,
            CollectionABI,
            signer
        )
        const tx = await collectionContract.transferFrom(address,receiver,tokenId)
        await tx.wait()
        
    } catch (error) {
        console.error('Listing NFT failed:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        window.alert(error)
    }
  }
  async function approve(){

    try {
        const provider =  new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const collectionContract = new ethers.Contract(
            NftCollection,
            CollectionABI,
            signer
        )
        const tx = await collectionContract.setApprovalForAll(NftMarketPlace,true)
        await tx.wait()
        
    } catch (error) {
        console.error('Listing NFT failed:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        window.alert(error)
    }
  }



  // Fetch metadata for a given token ID
  const fetchTokenMetadata = async(tokenId) => {
    try {
      const provider =  new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const collectionContract = new ethers.Contract(
          NftCollection,
          CollectionABI,
          signer
      )
      const tx = await collectionContract.tokenMetadata(tokenId)
      const metadata = {
        tokenId,
        title: tx[metadataKeys.title],
        description: tx[metadataKeys.description],
        image: tx[metadataKeys.image]
      };
      return metadata

  } catch (error) {
      console.error('Fetching Metadata failed:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      window.alert(error)
  }
    // const  {data : tokenMetadata }  = useContractRead({
    //   address: NftCollection,
    //   abi: CollectionABI,
    //   functionName: 'tokenMetadata',
    //   args: [tokenId],
    // })
    // return {tokenId,...tokenMetadata}
  }


  useEffect(() => {
    if (tokenIds.length > 0) {
      const fetchMetadata = async () => {
        const metadataPromises = tokenIds.map((tokenId) => fetchTokenMetadata(tokenId))
        const metadataArray = await Promise.all(metadataPromises)
        setMetadataList(metadataArray)
        console.log(tokenIds);
        console.log(metadataArray);
      }
      fetchMetadata()
    }
  }, [tokenIds,address])

  return (
    <div>
        {/* {console.log(listingFee.toString()*10**(-18))} */}
        {/* {console.log(tokenIds)}
        {console.log(metadataList)} */}
        {/* {console.log(provider)} */}
      <h1>My NFTs</h1>
      {!isApproved && <div>{address} is not approved on Marketplace ..!  <button className='bg-blue-600 p-2 hover:bg-blue-500 rounded-lg' onClick={approve}>Approve</button></div>}
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
                                <button onClick={()=>handleOpenSellModal(`${metadata.tokenId}`)}  className="bg-gray-950 text-white px-2 py-1 rounded hover:bg-gray-900">
                                    Sell
                                </button>
                                <button onClick={(e) => {e.stopPropagation();  toggleMenu(index) }} className="bg-gray-950 text-white px-2 py-1 rounded hover:bg-gray-900">
                                    <HiMenu />
                                {menuOpen === index && (
                                    <div className="absolute right-0 mt-4 bg-gray-900  w-40 shadow-lg sm:w-38 md:w-30 lg:w-40 z-10">
                                    <div className="py-2 text-white">
                                        <button onClick={()=>handleOpenSellModal(`${metadata.tokenId}`)} className="flex items-center justify-start gap-2 w-full px-2 py-2 hover:bg-gray-700 transition-colors duration-300"><MdOutlineSell/> Sell</button>
                                        <button onClick={()=>handleOpenTransferModal(`${metadata.tokenId}`)}  className="flex items-center justify-start gap-2 w-full px-2 py-2 hover:bg-gray-700 transition-colors duration-300"><BiTransfer/> Transfer</button>
                                        {/* <button onClick={()=>revertListing(`${metadata.tokenId}`)} className="flex items-center justify-start gap-2 w-full px-2 py-2 hover:bg-gray-700 transition-colors duration-300"><MdOutlineBackspace/> Remove Listing</button> */}
                                    </div>
                                    </div>
                                )}
                                </button>
                            </div>
                        </div>
                        <footer className='h-1/7 p-4 flex flex-col justify-between bg-gray-900 transition-colors duration-300 group-hover:bg-gray-800'>
                            <div className="text-lg font-bold text-truncate">{typeof metadata.title === 'string' ? metadata.title : 'No title available'}</div>
                            <div className="text-md font-semibold text-truncate">{name}</div>
                            
                        </footer>
                    </div>
                </div>
            ))}
            </div>
      </div>
     <SellModal open={openSellModal} handleClose={handleClose} tokenId={tokenId} listNft={listNft} />
     <TransferModal open={openTransferModal} handleClose={handleClose} tokenId={tokenId} address={address} transferNft={trannsferNFT} />
    </div>
  )
}
