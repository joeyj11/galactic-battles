import NavBar from "../components/navbar";
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { listAll, ref, getDownloadURL, ListResult, getStorage, } from "firebase/storage";
import app from "@/pages/firebase/config";
import queryData from "@/pages/firebase/firestore/queryData";
import { FieldValue, getFirestore,} from "firebase/firestore";
import {QuerySnapshot, DocumentData} from "firebase/firestore";
import { forEachChild } from "typescript";
import { collectionName } from "./admin/addMerchItem";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { Result } from "postcss";
import updateData from "@/pages/firebase/firestore/updateData";
import { getAuth  } from "firebase/auth";
import getData from "@/pages/firebase/firestore/getData";
import addData from "@/pages/firebase/firestore/addData";
import{merch, isMerchItem} from '@/types/merch';
import { useRouter } from "next/navigation";
import {motion, AnimatePresence, delay} from 'framer-motion'
import { error } from "console";

 
const db = getFirestore(app);
const storage1 = getStorage(app);
const auth = getAuth(app);

const merchSwapDelay = 300;


// build a dictionary from the download url to the path so when you add to cart you add the path not the download URL. 

const dict: { [key: string]: string } = {};
const inventoryDict: {[key: string]: number} = {};

// we are taking all of the merch items from firebase and we have their paths, we just need to call get downloadURL on those items and then they can be displayed as desired. 
export default function tempMerch() {
const router = useRouter();
const navigate = (item: merch) => {
  if (inventoryDict[item.name] <= 0 || ! inventoryDict[item.name]){
    alert('item is sold out');
    return;
  }
  const url = `/individualMerch?name=${item.name}`;
  router.push(url);
};

const [cartDisplay, showCart] = useState(false);
const mutate =async (merchItem:merch) => {
  merchItem.coverImagePath=dict[merchItem.coverImagePath]; 
  for (let i = 0; i < merchItem.imagePaths.length; i++){
    merchItem.imagePaths[i] = dict[merchItem.imagePaths[i]];
  }
  return merchItem;
}
const addToCart =  async (merchItem: merch) =>{
  if (inventoryDict[merchItem.name] <= 0 || ! inventoryDict[merchItem.name]){
    alert('item is sold out');
    return;
  }
 let merch = await mutate(merchItem);
  if (auth.currentUser){
    let get = await getData(db, "users", auth.currentUser.uid)
    if (get.result){
    if(get.result.data() == undefined){
      let set = await addData(db, "users", auth.currentUser.uid, {cart: [merch]}).catch((error) => {
        alert(error.code);
      }).then (() => {
       router.refresh();
        alert("item added");
      });
    } else {
      await updateData(db, "users", auth.currentUser.uid, "cart",  merch).catch((error) => {
        alert(error.code);
      }).then ((result) => {
        router.refresh();
        alert("item added");
      });
    }
    }
  }
  else {
    alert('you must login to add items to your cart');
    router.push('/signIn');
  }
}

    const [hovered, setHovered] = useState<string | null>(null);
    const handleHover = (id : string) => {
      setTimeout(() => {setHovered(id)}, merchSwapDelay );
      
    };

    const handleMouseLeave = () => {
      setHovered(null);
    };

    const [merchItems, setMerchItems] = useState<merch[]>([]);
    const [cart, setCart] = useState<merch>();
    const [reRender, setReRender] = useState<boolean> (false);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const result = await queryData(db, collectionName, "live", "!=", false);
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
                inventoryDict[item.name] = Number(res?.result?.data()?.inventory);
                const imageRef = ref(storage1, item.coverImagePath);
                const url = await getDownloadURL(imageRef).catch((error) => {
                  console.log("Image download URL error:", error);
                  return null;
                });
    
                if (url) {
                  dict[url] = item.coverImagePath;
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
                    dict[url2] = item.imagePaths[j];
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
      }, []); // Empty dependency array to run once on component mount

      const isSoldOut = (item: merch) => {
        if (inventoryDict[item.name] && inventoryDict[item.name] > 0){
        return true;
        } else {
          return false; 
        }
      }
       return( 
           <NavBar>
      <div className="h-fit mx-5 mb-10">
        <ul className="flex flex-wrap -mx-1">
          {merchItems[0] && merchItems.map((item) => (
            <li key={item.id} className="w-1/2 md:w-1/3 lg:w-1/4 px-1">
              <a  className="cursor-pointer">
                {hovered == item.id? 
                  <AnimatePresence>
                <motion.div initial={{ opacity: 0 }}
                animate={{ opacity: 1 , transition: {duration: 0.3}  }}
                exit={{ opacity: 0 }}  className="w-full rounded-2xl  aspect-square bg-contain flex-col flex items-center" onClick={() => navigate(item)} onMouseLeave={handleMouseLeave} style={{ backgroundImage: `url(${item.imagePaths[0]})` }}> </motion.div> </AnimatePresence>:
                <AnimatePresence>
                <motion.img 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: {duration: 0.3} }}
                exit={{ opacity: 0 }}
                onClick={() => navigate(item)}
                  src={ item.coverImagePath}
                  alt={`Image for ${item.name}`}
                  className="w-full rounded-2xl aspect-square "
                  onMouseEnter={() => handleHover(item.id)}
                  onMouseLeave={handleMouseLeave}
                />
                </AnimatePresence>
              }
                 </a>
                <div className="pl-3 pb-6 pt-3 flex flex-row items-center">
                  <p  className=" justify-center" onClick={() => navigate(item)}>{item.name}</p>
                 {isSoldOut(item) ? <p className="ml-auto text-white"> ${item.price.toFixed(2)}</p>  : <p>sold out</p>}
                </div>
              
            </li>
          ))}
        </ul>
      </div>
    </NavBar>
    );
}
