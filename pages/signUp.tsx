import {ChangeEvent, useState} from "react";
import signUp from "@/pages/firebase/auth/signUp";
import { useRouter } from 'next/navigation'
import NavBar from "@/components/navbar";
import addData from "@/pages/firebase/firestore/addData";
import { getFirestore } from "firebase/firestore";
import app from "@/pages/firebase/config";
import { error } from "console";
import { getAuth, sendEmailVerification, signOut } from "firebase/auth";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

const db = getFirestore(app);
const auth = getAuth(app);
export default function signup() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')
    const [promtMail, setPromptMail] = useState<boolean>(false);
    const [verify, setVerify] = useState<boolean>(false);
    const [visible, setVisible] = useState<boolean>(false);
    const [visible2, setVisible2] = useState<boolean>(false);
    const router = useRouter()
    const emailRegex =  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    const passwordRegex = /^[a-zA-Z0-9!#$%^&*()"/.<>]{8,}$/;

    const createCustomer = async (email: string | null, uid: string) => {
        const response = await axios.post('/api/createCustomer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body:{
            email: email,
          },
        });

        if (response.data.id){
          let temp = {
            customer_id: response.data.id,
          }
          let result = await addData(db, "users", uid, temp).catch((error) => {
            alert(error.code);
           });
           console.log(result)
           console.log(response.data.id, "customer id", uid, "uid")
        }
        else{
          console.log("Error creating customer")
        }
      }

    const handleForm = async (event : any) => {
        event.preventDefault()
        if ( !emailRegex.test(email)){
            alert("invalid email");
            return;
        }
        if (password != password2){
            alert("passwords must match")
            return;
        }
        await signUp(email, password).catch((error) => {
            alert(JSON.parse(JSON.stringify(error)).code);
        }).then(async (result) => {
            if (result){
            let temp = {
                optIn: promtMail,
                email: email,
                cart: [],
            }
            if (result.result){
            await addData(db, "users", result.result.user.uid, temp).catch((error) => {
                alert(error.code);
            });
            await createCustomer(result.result.user.email, result.result.user.uid); 
            signOut(auth);
            sendEmailVerification(result.result.user).then(() => {
                setVerify(true);
              }).catch((error) =>{
                alert(error.code);
              });
            }
            if (result.error){
                alert(result.error);
            }
        }
        });
        return
    }
    const validateLength = (e:ChangeEvent<HTMLInputElement>) => {
        if(e.target.value.length == 50){ alert('max input size 50 chars')
                    }
                }
   const passwordString = " Invalid Password: must be at least 8 characters in length containing only letters, numbers, and special characters including !#$%^&*()\"/\.<>"

   if (verify){
    return (<div className="w-screen flex flex-col items-center">
 <h1> Please Verify Your Email To Login </h1>
<button className="my-8" onClick={() => router.push('/signIn')}> Continue </button>
</div>);
}
    return (<NavBar><div className="wrapper">
              <div className="form-wrapper flex flex-col items-center">
            <form className="w-screen flex flex-col items-center" >
                <label htmlFor="email" className="w-1/2">
                    {(emailRegex.test(email) || email== '')? <p>Email</p>  : <p className="text-red-700">Email Invalid</p>  }
                    <input className="rounded-md my-4 w-full p-2" onBlur ={(e) => {  setEmail(e.target.value)}}  onChange={ (e) => validateLength(e)} required type="email" name="email" id="email" placeholder="example@mail.com" maxLength={50}/>
                </label>
                <label htmlFor="password" className="w-1/2">
                    <p>Password</p> {(password != "" && !passwordRegex.test(password)) && <p className="text-red-700"> {passwordString} </p>}
                    <div className="relative">
                    <input className="rounded-md my-4 w-full p-2" onBlur={(e) => setPassword(e.target.value)} onChange={ (e) => validateLength(e)} required type={ visible? "text" : "password"} name="password" id="password" maxLength={50} placeholder="password" />
                    {visible ? <EyeOff className="self-end absolute cursor-pointer stroke-[#151514] h-7 top-1/2 right-2 transform -translate-y-1/2 " onClick={() => setVisible(!visible)} /> : <Eye  className="self-end absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer stroke-[#151514] h-7" onClick={() => setVisible(!visible)} />}
                    </div>
                </label>
                <label htmlFor="password2" className="w-1/2">
                    <p>Re-Enter Password</p>  {((password != password2) && password2 != "")&& <p className="text-red-700">passwords must match</p>}
                    <div className="relative">
                    <input className="rounded-md my-4 w-full p-2" onBlur={(e) => setPassword2(e.target.value)}  onChange={ (e) => validateLength(e)} required type={ visible2? "text" : "password"} name="password" id="password2" maxLength={50} placeholder="password" />
                    {visible2 ? <EyeOff className="self-end absolute cursor-pointer stroke-[#151514] h-7 top-1/2 right-2 transform -translate-y-1/2 " onClick={() => setVisible2(!visible2)} /> : <Eye  className="self-end absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer stroke-[#151514] h-7" onClick={() => setVisible2(!visible2)} />}
                    </div>
                </label>
               
                <label htmlFor="mail" className="flex flex-row items-center">
                    <input className="rounded-md my-4 mr-5" onChange={(e) => setPromptMail(Boolean(e.target.value))} required type="checkbox" name="mail" id="mail"/>
                    <p> I Would like to receive Special Offers From Rourke.com </p>
               </label>
                <button className="my-8" onClick={handleForm}>Sign Up</button>
                </form>
  </div>
    </div></NavBar>);
}
