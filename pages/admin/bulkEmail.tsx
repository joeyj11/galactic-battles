import {useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { User, onAuthStateChanged, getAuth, getIdToken } from "firebase/auth";
import app from "../firebase/config"
import { addDoc, getFirestore}  from 'firebase/firestore'
import { getStorage, ref, listAll, uploadBytes, getDownloadURL, StorageReference, ListResult } from "firebase/storage";
import NavBar from "@/components/navbar";
import { email } from "@/types/email";
import queryData from "@/pages/firebase/firestore/queryData";
import { error } from "console";
import getData from "@/pages/firebase/firestore/getData";
import { admin } from "./admin";
// Get the default bucket from a custom firebase.app.App
const storage1 = getStorage(app);
const listRef = ref(storage1, 'merch/');
const db = getFirestore(app);
export const collectionName = "merchItems";
// Get a non-default bucket from a custom firebase.app.App
// const storage2 = getStorage(app, "gs://my-custom-bucket");


const auth = getAuth(app);
export default function Page() {
const [user, setUser] = useState<User | null>(null);
useEffect( () => {
  onAuthStateChanged(auth, async (user) => {
    if (user){
      const token = await getIdToken(user);
      if (await admin(token)){
        setUser(user);
      }
    }else {
        setUser(null);
        router.push('/')
    }
  }
  )
},[]
)
    const router = useRouter()
    const [images, setImages] = useState<null | File[]>(null);
    const [coverImage, setCoverImage] = useState<null | File>(null);
    const [loading, setLoading] = useState<boolean> (false);
    const [emailItem, setEmailItem] = useState<email> ({source: "",
    destination:"",
      subject: "", 
      body: "",
  });
  const [all, setAll] = useState<boolean> (false)
  const [sending, setSending] = useState<boolean>(false);

  
    const updateEmail = (source?: string, subject?: string, body?: string) => {
      let tempEmail:  email = emailItem;
      if (source){
        tempEmail.source = source;
      }
      if (subject){
        tempEmail.subject =subject;
      }
      if (body){
        tempEmail.body = body;
      }
    setEmailItem(tempEmail);
    }
    // right now email can only originate from verified sources and send to verified soucres. How can we fix this?
    // also when Rourke's keys were plugged in I think it was just the region that was wrong but there was an issue with even attempting to use AWS SES.
      const upload = async () => {
        setSending(true);
        console.log("here");
        if (all){
          queryData(db, "users", "optIn", "==", false).then((response) => {
            console.log(response);
            for (let i = 0; i < response.length; i++){
              let temp = emailItem;
              temp.destination = response[i].email;
              fetch('/api/mail', {
                method: 'post',
                body: JSON.stringify(temp),
              }).then(function(response) {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response;
            }).then(async function(response) {
              const res = await response.json();
              console.log(res)
            }).catch(async function(error) {
              const err = await error.json();
                console.log(err);
            }).finally(() => {
              setSending(false);
              router.refresh();
            });
            }
           }).catch((error) => {
            alert(error);
           });
        } 
       queryData(db, "users", "optIn", "==", true).then((response) => {
        console.log(response);
        for (let i = 0; i < response.length; i++){
          let temp = emailItem;
          temp.destination = response[i].email;
          fetch('/api/mail', {
            method: 'post',
            body: JSON.stringify(temp),
          }).then(function(response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response;
        }).then(async function(response) {
          const res = response
          console.log(res)
        }).catch(async function(error) {
          const err = error
            console.log(err);
        }).finally(() => {
          setSending(false);
          router.refresh();
        });
        }
       }).catch((error) => {
        alert(error);
       });
     
      } 


    if (user && !sending){
    return (
      <NavBar>
        <div className="flex flex-col items-center">
        <div className="flex flex-row items-center">
      <form className="flex flex-col items-center gap-6 px-10" onSubmit={(e) => {e.preventDefault()}}>
      <label htmlFor="merchItemName flex flex-col items-center">
        <h1 className="text-center">Source Email: </h1>
      <input required className="w-full px-2" type="text" id="merchItemName" placeholder="source" onChange={(e) => {
     updateEmail(e.target.value);
      }} />
      </label>
      <label htmlFor="price flex flex-col items-center">
        <h1 className="text-center"> Subject of Email </h1>
      <input required className="w-full px-2" id="price" placeholder="subject" type="text" min=".01" step=".01"  onChange={(e) => {
        updateEmail(undefined, e.target.value);
      }} />
      </label>
      <label className="w-full" htmlFor="description">
        <h1> Email Body </h1>
      <textarea className="w-full h-24" required onChange={(e) => {
              updateEmail(undefined, undefined, e.target.value);
          }} />
          </label>
          <label htmlFor="mail" className="flex flex-row items-center">
                    <input className="rounded-md my-4 mr-5" onChange={(e) => setAll(Boolean(e.target.value))} required type="checkbox" name="mail" id="mail"/>
                    <p> Email All Users </p>
               </label>
          <button  onClick={upload}>Upload</button>
          </form>
          <div className="flex flex-col items-center py-2 gap-2">
        </div>
        </div>
        </div>
     </NavBar>
    );}
    else {
      return (<NavBar><div className="w-screen flex flex-col items-center"> <div
      className=" h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] bg-inherit"
      role="status">
      <span
        className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
    </div>
    </div>
    </NavBar>);
    }
        }