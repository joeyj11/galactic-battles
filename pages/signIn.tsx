import React from "react";
import signIn from "@/pages/firebase/auth/signIn";
import { useRouter } from 'next/router'
import NavBar from "@/components/navbar";
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult, UserCredential, sendEmailVerification, signOut } from "firebase/auth";
import GoogleButton from 'react-google-button'
import { resolveSoa } from "dns";
import getData from "@/pages/firebase/firestore/getData";
import app from "@/pages/firebase/config"
import { getFirestore } from "firebase/firestore";
import addData from "@/pages/firebase/firestore/addData";
import updateData from "@/pages/firebase/firestore/updateData";
import { error } from "console";
import axios from "axios";
import { doc, updateDoc } from "firebase/firestore"
import Loading from "@/components/loading";
import { Eye, EyeOff } from "lucide-react";

const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const auth = getAuth(app);


function Page() {
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [loading, setLoading] = React.useState(false);
    const [prompt, setPrompt] = React.useState(false);
    const [promtMail, setPromptMail] = React.useState(false);
    const [uid, setUid] = React.useState("");
    const [visible, setVisible] = React.useState(false);
    const router = useRouter()
    React.useEffect(() => {
    setLoading(true);
    getRedirectResult(auth)
  .then( async (result) => {
    console.log(result);
    // This gives you a Google Access Token. You can use it to access Google APIs.
    if (result != null){
      console.log("aqui")
    const credential = GoogleAuthProvider.credentialFromResult(result);
    let ret = await getData(db, "users", result.user.uid);
    console.log(ret);
    if (ret.result){
      console.log('here')
      if (ret.result.exists()){
        navigate("/");
      } else {
        setPrompt(true);
        setUid(result.user.uid);
        if(result.user.email){
          setEmail(result.user.email);
        }
      }
    }
    // The signed-in user info.
    const user = result.user;
    // IdP data available using getAdditionalUserInfo(result)
    // ...
    }
    console.log('no result');

  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  }).finally(() => {
    setLoading(false);
  });
    },[])
    function googleSignIn (){
        signInWithRedirect(auth, provider).catch((error)=> {
          if (error) {
            alert(JSON.parse(JSON.stringify(error)).code);
            return;
        }
        });
    }

    const navigate = (str: string) =>{
        if (router.pathname == str){
          return;
        }

          router.push(str);
      }
      const createCustomer = async (email: string | null) => {
        const response = await axios.post('/api/createCustomer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body:{
            email: email,
          }
        });
  
        if (response.data.id){
          let temp = {
            customer_id: response.data.id,
          }
          let result = await addData(db, "users", uid, temp).catch((error) => {
            alert(error);
           });
           console.log(result)
           console.log(response.data.id, "customer id", uid, "uid")
        }
        else{
          console.log("Error creating customer")
        }
      }


      const handleForm = async (event: any) => {
        event.preventDefault()
        await signIn(email, password).catch((error) => {
          alert(error.code);
        }).then((result) => {
          if (result){
            if (result.result){
              if (result.result.user.emailVerified == true){
                navigate('/');
              } else {
                sendEmailVerification(result.result.user);
                alert('please verify email');
                signOut(auth);
              }
            }
            if (result.error){
            alert(result.error);
            }
          }
        
        });

    }
    const processPrompt = async (event: any) => {
      if (auth.currentUser){ console.log(auth.currentUser.uid); createCustomer(auth.currentUser.email); }
      let temp = {
        optIn: promtMail,
        email: email,
        cart: [],
    }
     addData(db, "users", uid, temp).catch((error) => {
      alert(error.code);
     });
      router.push('/');
    }

    if (prompt){
      return (<div className="w-screen flex flex-col items-center">
                       <label htmlFor="mail" className="flex flex-row items-center">
                    <input className="rounded-md my-4 mr-5" onChange={(e) => setPromptMail(Boolean(e.target.value))} required type="checkbox" name="mail" id="mail"/>
                    <p> I Would like to receive Special Offers From Rourke.com </p>
               </label>
               <button className="my-8" onClick={processPrompt}> Continue </button>
      </div>);
    }
    return (<NavBar>{loading? <Loading></Loading> : <div className="wrapper">
        <div className="form-wrapper flex flex-col items-center">
            <form  className="w-screen flex flex-col items-center" >
                <label htmlFor="email" className="w-1/2">
                    <p>Email</p>
                    <input className="rounded-md my-4 w-full p-2" onChange={(e) => setEmail(e.target.value)} required type="email" name="email" id="email" placeholder="example@mail.com" maxLength={50} />
                </label>
                <label htmlFor="password" className="w-1/2">
                  <div className="flex flex-col relative">
                    <p>Password</p>
                    <input className="rounded-md my-4 w-full p-2" onChange={(e) => setPassword(e.target.value)} required type={visible ? 'text' : 'password'} name="password" id="password" placeholder="password" maxLength={50} />
                    {visible ? <EyeOff className="self-end absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer stroke-[#151514] h-7" onClick={() => setVisible(!visible)} /> : <Eye  className="self-end absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer stroke-[#151514] h-7" onClick={() => setVisible(!visible)} />}
                    <a className="self-end text-lg" onClick={() => navigate('/forgotPassword')}> Forgot Password?</a>
                    </div>
               
                </label>
                <button className="my-8"  onClick={handleForm}>Sign In</button>
                <GoogleButton className="mb-4" onClick={() => googleSignIn()  }/>
            </form>
            <p >Don't Have An Account?</p>
            <h1 className=" hover:underline text-lg  hover:cursor-pointer" onClick={() => navigate('/signUp')}>Sign Up</h1>
       
       
  </div></div>}</NavBar>);
}

export default Page;