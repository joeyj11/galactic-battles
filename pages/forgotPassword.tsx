import React from "react";
import signIn from "./firebase/auth/signIn";
import { useRouter } from 'next/router'
import NavBar from "@/components/navbar";
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult, sendPasswordResetEmail, } from "firebase/auth";
import GoogleButton from 'react-google-button'
import { resolveSoa } from "dns";
import getData from "./firebase/firestore/getData";
import app from "./firebase/config";
import { getFirestore } from "firebase/firestore";
import addData from "./firebase/firestore/addData";
import { error } from "console";
import {navigate} from '@/functions/navigate'
import Loading from "@/components/loading";

const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const auth = getAuth(app);


function Page() {
    const [email, setEmail] = React.useState('')
    const [loading, setLoading] = React.useState(false);
    const [prompt, setPrompt] = React.useState(false);
    const router = useRouter()

      const handleForm = async (event: any) => {
        event.preventDefault()
        sendPasswordResetEmail(auth, email)
  .then(() => {
    setPrompt(true);
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorCode);
    // ..
  });
    }

    if (prompt){
        return(<NavBar>
            <h1>Passord Reset Email Sent</h1>
        </NavBar>)
    }

    return (<NavBar>{loading? <Loading></Loading> : <div className="wrapper">
  <form  className="w-screen flex flex-col items-center" >
                <label htmlFor="email" className="w-1/2">
                    <p>Account Email:</p>
                    <input className="rounded-md my-4 w-full p-2" onChange={(e) => setEmail(e.target.value)} required type="email" name="email" id="email" placeholder="example@mail.com" />
                </label>
                <p>Send Password Reset Email?</p>
                <button className="my-8" onClick={handleForm}>Send</button>
                </form>
       </div>}</NavBar>);
}

export default Page;