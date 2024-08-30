import "./globals.css";
import {NavBar} from '../components/NavBar'
import { UserNfts } from "../components/UserNfts";
import { OwnerdListings } from "../components/OwnedListings";

export default function Home() {
  return (
    <main className="flex flex-col py-6 items-center gap-5">
      <UserNfts/>
      <OwnerdListings/>
    </main>
  );
}
