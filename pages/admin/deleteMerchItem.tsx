import {useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { User, onAuthStateChanged, getAuth, getIdToken } from "firebase/auth";
import app from "../firebase/config"
import { doc, getFirestore, updateDoc}  from 'firebase/firestore'
import { getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";
import addData from "@/pages/firebase/firestore/addData";
import NavBar from "@/components/navbar";
import { isMerchItem, merch } from "@/types/merch";
import deleteData from "@/pages/firebase/firestore/deleteData";
import { Result } from "postcss";
import Loading from "@/components/loading";
import getData from "@/pages/firebase/firestore/getData";
import queryData from "@/pages/firebase/firestore/queryData";
import updateData from "@/pages/firebase/firestore/updateData";
import { Trash2Icon } from "lucide-react";
import { admin } from "./admin";
import axios from "axios";

const storage1 = getStorage(app);
const listRef = ref(storage1, 'merch/');
const db = getFirestore(app);
export const collectionName = "merchItems";
const auth = getAuth(app);
const inventoryDict: {[key: string]: number} = {};
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

const removeStripeItem = async (item: string) => {
  const response = await axios.post('/api/removeMerchItem', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body:{
      id: item,
    },
  });

  if (response.data.id){
    return response.data.id
  }
  else{
    console.log("Error creating stripe item")
  }
};

const deleteItem =  async (merchItem: merch) =>{
    console.log("delete");
  
  if (  window.confirm("are you sure")){
    await removeStripeItem(merchItem.id).then((r) => {
      if (typeof r === 'string'){
        console.log("Successfuly deleted ", r, " from stripe.")
      }
    });
   await deleteData(db, "merchItems", merchItem.name).then((result) => {
        alert("deleted");
    }).catch((e) => {
        alert(e);
    })
    router.refresh();
  } else {
    return;
  }

  }

const changeLive = async (merchItem: merch) => {
    console.log("here");
    await updateDoc(doc(db, "merchItems", merchItem.name), {
        live: !merchItem.live,
      }).catch((error) => {
        alert(error);
      }).then ((result) => {
        alert("item updates");
       router.refresh()
      });
} 
   
   
       const [merchItems, setMerchItems] = useState<merch[]>([]);
       const [cart, setCart] = useState<merch>();
       useEffect(() => {
           const fetchData = async () => {
             try {
               const result = await queryData(db, collectionName, "name", "!=", "");
               const merchData = await Promise.all(
                 result.map(async (item) => {
                   if (!isMerchItem(item)) {
                     console.log("query error");
                     return null;
                   }
                   const res = await getData(db, 'inventory', item.name).catch((error) => {
                    console.log(error);
                    return null
                  })
                  console.log(res?.result?.data()?.inventory);
                  inventoryDict[item.name] = Number(res?.result?.data()?.inventory);
                  console.log(inventoryDict[item.name]);

                   const imageRef = ref(storage1, item.coverImagePath);
                   const url = await getDownloadURL(imageRef).catch((error) => {
                     console.log("Image download URL error:", error);
                     return null;
                   });
                   if (url) {
                     item.coverImagePath = url;
                   } else {
                     console.log("Download URL error");
                   }
       
                   for (let j = 0; j < item.imagePaths.length; j++) {
                     const imageRef = ref(storage1, item.imagePaths[j]);
                     const url2 = await getDownloadURL(imageRef).catch((error) => {
                       console.log("Image download URL error:", error);
                       return null;
                     });
                     if (url2) {
                       item.imagePaths[j] = url2;
                     } else {
                       console.log("Download URL error");
                     }
                   }
       
                   return item;
                 })
               );
               setMerchItems(merchData.filter(Boolean) as merch[]);
             } catch (error) {
               console.error("Client-side error:", error);
             }
           };
       
           fetchData();
         }, []); 
    const router = useRouter()
        // try to make the display of merch item name and price more responsive. 
   if (user){ return (<NavBar>
    <div>{ merchItems[0] &&
        merchItems.map((item, index) => (
          <div className="my-5" key={index}>
            <p>{item.name}</p>
            <label htmlFor="stock" className=" flex flex-col items-start">
        <h1 className="text-xl"> Stock: </h1>
      <input required className=" w-1/12 px-2" id="price" placeholder={String(inventoryDict[item.name])} type="number" min="0" step="1"  onBlur={(e) => {
        addData(db, 'inventory', item.name, {inventory: Number(e.target.value)} )
      }} />
      </label>
            <p>${item.price}</p>
            <p>{item.description}</p>
          <img src={ (item.coverImagePath)} className="h-10 w-10"/>
          {item.imagePaths && item.imagePaths.map((source, index) => (
            <div key = {index}>
              <img className="h-10 w-10" src={source}/>
            </div>
          ))}
          <Trash2Icon size={10} onClick={() => deleteItem(item)}></Trash2Icon>
          <button onClick={() => changeLive(item)}> {item.live?   "hide" : "display"} </button>
          <div className="w-full h-1 border-4 mt-5"></div>
          </div>
        ))
      }
      </div>
      </NavBar>
    );}
    else {
      return (<Loading></Loading>);
    }
}
