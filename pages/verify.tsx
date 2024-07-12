import { getAuth, sendEmailVerification, signOut } from "firebase/auth";
import router from "next/router";
import { useEffect } from "react";
import app from "./firebase/config";
const auth = getAuth(app);
export default function verify() {
    useEffect( () => {
       signOut(auth);
      },[]
      )
return (<div className="w-screen flex flex-col items-center">
<h1> Please Verify Your Email To Login </h1>
<button className="my-8" onClick={() => router.push('/signIn')}> Continue </button>
</div>);
}