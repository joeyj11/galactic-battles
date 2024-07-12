import { useEffect, useState } from "react";
import NavBar from "../components/navbar";
import { User, getAuth, onAuthStateChanged, sendEmailVerification, updateEmail, updateProfile } from "firebase/auth";
import  { useRouter } from "next/router";
import db from "./firebase/config"
import Loading from "@/components/loading";
import { signOut } from "firebase/auth";
import { sign } from "crypto";
import signIn from "./firebase/auth/signIn";
import { LucideEdit } from "lucide-react";
import { error } from "console";

const auth = getAuth(db);

export default function profile() {
    // this code does not work at the moment there is some undefined behavior I have no idea why.
    // for some reason the user gets set to null probably bc of a re-render
   async function updateUserInfo() {
    setLoading(true);
    if (user){
        if (displayName != user.displayName){
    await updateProfile(user, {
        displayName: displayName,
      }).then(() => {
        
        router.reload();
      }).catch((error) => {
        // An error occurred
        // ...
        alert(error.code)
      });
    }
    if (email != user.email){
        if (email){
          let err:boolean = false
        await updateEmail(user, email).catch((error) => {
          err = true;
          alert(error.code);
        });
        if (!err){
        await sendEmailVerification(user);
       setVerify(true);
        } else {
          setLoading(false);
        }
        }
    }
}
   }
   const [loading, setLoading] = useState<boolean>(false);
   const router = useRouter();
   const [verify, setVerify] = useState<boolean>(false);
    const [user, setUser] = useState<User | null> (null);
    const [editing, setEditing] = useState<boolean>(false);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    useEffect( () => {
        onAuthStateChanged(auth, async (user) => {
          if (user){
            setEmail(user.email);
            setDisplayName(displayName);
            setUser(user);
          }
        }
        )
      },[]
      )
      if (verify){
        return (<div className="w-screen flex flex-col items-center">
     <h1> Please Verify Your Email To Login </h1>
    <button className="my-8" onClick={() => router.push('/signIn')}> Continue </button>
    </div>);
    } else{
      if ( loading){
        return(<NavBar><Loading></Loading></NavBar>);
      } else { if( user){
        if (editing){
            return (
                <NavBar>
                  <div className='flex flex-col place-items-center'>
                    {user.email &&  <input type="text"  maxLength={50}  className="w-1/2 rounded-md my-4 p-2" placeholder={user.email} onChange={(e) => setEmail(e.target.value)} />}
                  <button onClick={() => updateUserInfo()}> Update </button>
                </div>
               </NavBar>
            );
        } else{
            return (
                <NavBar>
                  <div className='flex flex-col items-center w-screen'>
                    <h1 className='mb-4'>Account Information</h1>
                    <svg className="w-1/6 h-auto mb-4 pointer-events-none" stroke="#151514" strokeWidth='1' xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 16 16"><path fill="#b6ccce" fillRule="evenodd" d="M8 14.5a6.47 6.47 0 0 0 3.25-.87V11.5A2.25 2.25 0 0 0 9 9.25H7a2.25 2.25 0 0 0-2.25 2.25v2.13A6.47 6.47 0 0 0 8 14.5Zm4.75-3v.937a6.5 6.5 0 1 0-9.5 0V11.5a3.752 3.752 0 0 1 2.486-3.532a3 3 0 1 1 4.528 0A3.752 3.752 0 0 1 12.75 11.5ZM8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16ZM9.5 6a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0Z" clipRule="evenodd" className="hover:fill-current hover:stroke-current"/> </svg>
                    <div className='flex flex-row place-items-center gap-4 mb-9'>
                      <p className="text-3xl">{user.email}</p>
                      <LucideEdit color="#b6ccce" className="h-8" onClick={() => setEditing(true)}></LucideEdit>
                    </div>
                    <div className=' flex flex-row items-center gap-4 lg:gap-20 w-2/3'>
                      <button className='basis-1/3' onClick={() => router.push('/forgotPassword')}>Change Password</button>
                      <button className='basis-1/3 ' onClick={() => router.push("/orderHistory")}> Show Order History </button>
                      <button className='basis-1/3' onClick={() => signOut(auth)}>Logout</button>
                    </div>
                  </div>
               </NavBar>
            );
      }
}
    }
}
}
