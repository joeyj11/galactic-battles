import {useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { User, onAuthStateChanged, getAuth, getIdToken } from "firebase/auth";
import app from "../firebase/config"
import { getFirestore}  from 'firebase/firestore'
import { getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";
import addData from "@/pages/firebase/firestore/addData";
import NavBar from "@/components/navbar";
import { merch } from "@/types/merch";
import getData from "@/pages/firebase/firestore/getData";
import { Result } from "postcss";
import { admin } from "./admin";
import axios from "axios";
// Get the default bucket from a custom firebase.app.App
const storage1 = getStorage(app);
const listRef = ref(storage1, 'merch/');
const db = getFirestore(app);
export const collectionName = "merchItems";
// Get a non-default bucket from a custom firebase.app.App
// const storage2 = getStorage(app, "gs://my-custom-bucket");

// Example client-side code (e.g., a component or page)



const auth = getAuth(app);
export default function Page() {
const [user, setUser] = useState<User | null>(null);
useEffect( () => {
  onAuthStateChanged(auth, async (user) => {
    if (user){
    const token = await getIdToken(user);
    if (await admin(token)){
      setUser(user);
    }else {
      setUser(null);
        router.push('/')
    }
    }
     else {
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
    const [stock, setStock] = useState<number> (0);
    const [merchItem, setMerchItem] = useState<merch> ({name: "",
      coverImagePath: "", 
      imagePaths: [""],
      live: false, 
      price: 0,
      description: "", 
      quantity: 1,
      id: "",
  });
    const data: string[] = [];
  
    const data2 : object = {
      hey: "there",
    }
  
    const addStripeItem = async (item: merch, image: string) => {
      const response = await axios.post('/api/createMerchItem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body:{
          merchItem: item,
          image: image
        },
      });

      if (response.data.product_id){
        return response.data.product_id
      }
      else{
        console.log("Error creating stripe item")
      }
    };
  
    const updateMerchItem = (name?: string, coverImagePath?: string, imagePaths?: string[],  live?: boolean, price?: number, description?: string, stocks?: number) => {
      let tempMerch: merch  = merchItem;
      if (name){
        tempMerch.name = name.trim();
      }
      if (coverImagePath){
        tempMerch.coverImagePath =coverImagePath;
      }
      if (imagePaths){
        tempMerch.imagePaths = imagePaths;
      }
      if (live){
        tempMerch.live = live;
      }
      if (price){
        tempMerch.price = Number(price.toFixed(2));
      }
      if (description){
        tempMerch.description = description;
      }
      if (stocks){
      setStock(stocks);
      }
      tempMerch.quantity = 1; 
    setMerchItem(tempMerch);
    }
      const upload = () => {
       if (images != null){
          images.forEach(image => {
            const addRef = ref(storage1, 'images/' + image.name);
            uploadBytes(addRef, image).then((snapshot) => {
              console.log("successfully uploaded other images")
              if (coverImage != null){
                const addRef = ref(storage1, 'images/' + coverImage.name);
                uploadBytes(addRef, coverImage).then(async (snapshot) => {
                  let path = await getDownloadURL(addRef);
                  // Add stripe item using api routing
                  console.log(path);
                  await addStripeItem(merchItem, path ).then((r) => {
                    if (typeof r === 'string'){
                      merchItem.id = r
                      console.log("product id:", r)
                    }
                  });
                  addData(db, 'inventory', merchItem.name, {inventory: stock});
                  addData(db, collectionName , merchItem.name, merchItem).then((snapshot) => {
                    console.log("sucessfully updated \"inode\"")
                    alert("Succesfully Uploaded!");
                    router.refresh();
                  }).catch((error) =>{
                    alert(error);
                  })
                }).catch((error) =>{
                  alert(error);
                });
              }
            }).catch((error) =>{
              alert(error);
            });
          })
        }


      } 
        // try to make the display of merch item name and price more responsive. 
   if (user){ return (
      <NavBar>
        <div className="flex flex-col items-center">
        <div className="flex flex-row items-center">
      <form className="flex flex-col items-center gap-6 px-10" onSubmit={(e) => {e.preventDefault()}}>
      <label htmlFor="merchItemName" className=" flex flex-col items-center">
        <h1 className="text-center">Merchandise Item Display Name: </h1>
      <input required className="w-full px-2" type="text" id="merchItemName" placeholder="item name" onChange={(e) => {
     updateMerchItem(e.target.value);
      }} />
      </label>
      <label htmlFor="price" className="flex flex-col items-center">
        <h1 className="text-center"> Price in Dollars: </h1>
      <input required className="w-full px-2" id="price" placeholder="0.00" type="number" min=".01" step=".01"  onChange={(e) => {
        updateMerchItem(undefined, undefined,undefined, undefined ,Number(e.target.value));
      }} />
      </label>
      <label htmlFor="stock" className="flex flex-col items-center">
        <h1 className="text-center"> Stock </h1>
      <input required className="w-full px-2" id="price" placeholder="1" type="number" min="1" step="1"  onChange={(e) => {
        updateMerchItem(undefined, undefined,undefined, undefined ,undefined, undefined, Number(e.target.value));
      }} />
      </label>
    
      <label className="w-full" htmlFor="description">
        <h1> Product Description: </h1>
      <textarea className="w-full h-24" required onChange={(e) => {
              updateMerchItem(undefined, undefined, undefined, undefined, undefined, e.target.value);
          }} />
          </label>
      <label htmlFor="coverIamge">
        <h1> Cover Image: </h1>
      <input required  type="file" onChange={(e) => {
        let f: File | null = null;
            if (e.target.files != null){
              f = e.target.files[0] 
              updateMerchItem(undefined, "images/" + f.name);
            }
            setCoverImage(f);
            
          }} />
          </label>
      <label>
        <h1> Other Images: </h1>
      <input type="file" multiple onChange={(e) => {
            if (e.target.files != null){
              let files : File[] = [];
              let paths: string[] = [];
           for( let i = 0; i < e.target.files.length; i++){
            files.push(e.target.files[i]);
            paths.push("images/" + e.target.files[i].name);
           }  
           updateMerchItem(undefined, undefined, paths, undefined);
           setImages(files);
            }
          }} />
      </label>
  
      <label htmlFor="live">
        <h1>Make Product Live?</h1>
      <input required  type="checkbox" id="live" onChange={(e) => {
       updateMerchItem(undefined, undefined, undefined, e.target.checked);
      }}/> 
      </label>
          <button  onClick={upload}>Upload</button>
          </form>
          <div className="flex flex-col items-center py-2 gap-2">
        {coverImage && <div className="flex flex-col items-center" ><img className=" h-36 w-36" src={URL.createObjectURL(coverImage)}/></div>}
        {merchItem.price != 0 &&  <><h1> {merchItem.name} </h1>
        <h1>${merchItem.price}</h1> <p>{merchItem.description}</p></>}
        <div className="flex flex-row items-center gap-2">
        {images && images.map((file, index) => (
            <img key={index}src={URL.createObjectURL(file)} className="h-24 w-24"></img>
        ))}
        </div>
        </div>
        </div>
        </div>
  
     </NavBar>
    );}
    else {
      return (<div className="w-screen flex flex-col items-center"> <div
      className=" h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] bg-inherit"
      role="status">
      <span
        className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
    </div>
    </div>);
    }
        }
