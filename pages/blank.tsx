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

    export default function Home() {
  return (
    <NavBar>
   </NavBar>
  )
}

