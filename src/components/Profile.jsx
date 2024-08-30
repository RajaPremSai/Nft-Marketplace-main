"use client"
import React from 'react'
import {UserNfts} from './UserNfts'
import {OwnerdListings} from './OwnedListings'
export function Profile() {
  return (
    <div > 
      <UserNfts/>
      <OwnerdListings/>
    </div>
  )
}
