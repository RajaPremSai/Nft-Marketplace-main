import React from 'react'
import { Market } from '../../components/Market'

export default function page() {
  return (
    <main className="flex flex-col py-6 items-center gap-5">
            <h1 className="text-5xl font-bold">Market</h1>
            <Market/>
            
        </main>
  )
}
