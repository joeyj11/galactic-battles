import NavBar from "../components/navbar";
import { Inter, Underdog } from 'next/font/google'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

import { addDoc, getFirestore}  from 'firebase/firestore'
import signIn from "@/pages/firebase/auth/signIn";

const inter = Inter({ subsets: ['latin'] })

import { getStorage, ref, listAll, uploadBytes, getDownloadURL, StorageReference, ListResult } from "firebase/storage";
import app from "./firebase/config";
import addData from "@/pages/firebase/firestore/addData";
import path from "path";
import { error } from "console";
import { useForceUpdate } from "framer-motion";
console.log(String(new Date()));
    export default function Home() {
  return (
    <NavBar>
    <div className="h-screen w-screen">
      <img className="mt-28 ml-28 w-24 h-24" src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.pngarts.com%2Ffiles%2F2%2FLetter-R-PNG-Image-Background.png&f=1&nofb=1&ipt=117e33daa54d1d9b1df6a3e9d5d361223fd824e0bccd9232281a75700a0a5336&ipo=images" alt="wtf"/>
      <h1 className="ml-28 text-lg text-[#606060]"> is for Rourke </h1>
      <p className="ml-28 font-[300] lg:font-[400] mt-8 text-[#606060]">When I first wrote galactic battles,  I knew it was</p>
      <p className="ml-28 font-[300] lg:font-[400] text-[#606060]">unlike any other book of our generation, and I</p>
      <p className="ml-28 font-[300] lg:font-[400] text-[#606060]">never intended for that to change.</p>
      <h1 className="ml-28 font-[300] lg:font-[400] mt-8">Rourke Palmer, 2023</h1>
      <img className="absolute opacity-80 -z-10 top-40 right-0 ml-28 w-[1600px] h-[800px]" src="https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.pngall.com%2Fwp-content%2Fuploads%2F2016%2F07%2FGalaxy-Transparent.png&f=1&nofb=1&ipt=02e592a695c5d102b06311e7d4b4af48b82f69008b692180f2bba40cc357eadc&ipo=images" alt="wtf"/> 
    </div>
   
   </NavBar>
  )
}

