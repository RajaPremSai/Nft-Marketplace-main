"use client"
import React, { useEffect, useState } from 'react'
import Button from './button'
import {NftCollection,CollectionABI,MarketABI,NftMarketPlace} from '../constants/index'
import {readContract,waitForTransaction, writeContract} from "wagmi/actions"
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
export  function CreateNft() {
  const {address,isConnected} = useAccount()
  const [title,setTitle] = useState(null)
  const [description,setDescription] = useState(null)
  const [media,setMedia] = useState(null)
  const [loading,setLoading] = useState(false)

  const handleSubmit = async()=>{
    setLoading(true)
    try {
        const provider =  new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const collectionContract = new ethers.Contract(
            NftCollection,
            CollectionABI,
            signer
        )
        const tx = await collectionContract.mint(address,title,description,media,{
          value : ethers.parseEther("0.01")
        })
        await tx.wait()
        
    } catch (error) {
        console.error('Listing NFT failed:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        window.alert(error)
    }
     setLoading(false)

}
useEffect(()=>{
  console.log(title,description,media,address);
},[title,description,media,address])
return (
  <main className='flex flex-col gap-25 max-w-sm w-full text-black'>
      {/* <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 "> */}
       <div className="flex flex-col items-center gap-4 "> 
       <input
          type="text"
          className="rounded-lg p-2 w-full"
          placeholder="Crazy Token"
          onChange={(e)=>
              setTitle(e.target.value)
          }
        />
          <input
          type="text"
          className="rounded-lg p-2 w-full"
          placeholder="This NFTee makes you crazieee..!"
          onChange={(e)=>
              setDescription(e.target.value)
          }
        />
          <input
          type="text"
          className="rounded-lg p-2 w-full "
          placeholder="preferably decentralized like ipfs"
          onChange={
              (e)=>setMedia(e.target.value)
          }
        />
          <div className="flex items-center justify-between">
              <button className='bg-blue-600 p-2 hover:bg-blue-500 rounded-lg' onClick={handleSubmit}>MINT</button>
          </div>
       </div>
      {/* </form> */}
  </main >
)
}
