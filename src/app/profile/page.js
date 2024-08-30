import { useAccount } from 'wagmi'
import {Profile} from '../../components/Profile'

export default function ProfilePage() {
    return(
        <main className="flex flex-col py-6 items-center gap-5">
            <h1 className="text-5xl font-bold">Profile</h1>
            <Profile/>
            
        </main>
    )

}