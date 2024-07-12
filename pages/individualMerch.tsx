import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import app from './firebase/config';
import { isMerchArray, isMerchItem, merch } from '@/types/merch';
import Loading from '@/components/loading';
import updateData from './firebase/firestore/updateData';
import addData from './firebase/firestore/addData';
import getData from './firebase/firestore/getData';
import { getAuth } from 'firebase/auth';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import NavBar from '@/components/navbar';
const db = getFirestore(app);
const auth = getAuth(app);
const storage1 = getStorage(app);

const dict: { [key: string]: string } = {};
export default function IndividualMerchPage() {
  const router = useRouter();
  const [hover, setHovered] = useState(-1);
  const { name } = router.query;


  const [merchItem, setMerchItem] = useState< merch| null>(null);
  const mutate =async (merchItem:merch) => {
    merchItem.coverImagePath=dict[merchItem.coverImagePath]; 
    for (let i = 0; i < merchItem.imagePaths.length; i++){
      merchItem.imagePaths[i] = dict[merchItem.imagePaths[i]];
    }
    return merchItem;
  }
const cartIncludes = async (cart: merch[], item: merch) => {
  for(let i = 0; i < cart.length; i++){
    if (cart[i].name == item.name){
      return true;
    }
  } 
    return false
}
  const addToCart =  async (merchItem: merch) =>{
    let merch = await mutate(merchItem);
     if (auth.currentUser){
       let get = await getData(db, "users", auth.currentUser.uid)
       if (get.result){
        let ret = get.result.data();
       if(ret == undefined){
         let set = await addData(db, "users", auth.currentUser.uid, {cart: [merch]}).catch((error) => {
           alert(error.code);
         }).then (() => {
          router.push('/merch');
           alert("item added");
         });
       } else {
          if (isMerchArray(ret.cart)){
            console.log(ret.cart);
            if ( await cartIncludes(ret.cart, merch) ){
              alert("item already in cart");
          }else{
            await updateData(db, "users", auth.currentUser.uid, "cart",  merch).catch((error) => {
              alert(error.code);
            }).then ((result) => {
             
              alert("item added");
            });
          }
          router.push('/merch');
        }} 
      }
       }
     else {
       alert('you must login to add items to your cart');
       router.push('/signIn');
     }
   }

  useEffect(() => {
    const getLinks =async (item:merch) => {
      if (!isMerchItem(item)) {
        console.log("query error");
        return null;
      }
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
    }

    const fetchMerchItem = async (name: string) => {
      try {
        console.log(name);
        const docSnapshot = await getData(db, 'merchItems', name);
        let res = docSnapshot.result 
        console.log(res);
        if (res?.exists()) {
          const data = res.data() as merch;
        const item = await getLinks(data); 
          setMerchItem(item); // Update the state with the fetched item
        } else {
          alert('Item not found');
        }
      } catch (error) {
        alert('Error fetching merch item');
      }
    };
    if (name) {
      fetchMerchItem(name as string);
    }
  }, [router.isReady]);

  if (!merchItem) {
    return <NavBar> <Loading/></NavBar>
  }
  return (
    <NavBar>

<div className= "h-screen mx-10 my-20 ">
          <div className = "flex">
            <img
                src={ hover=== -1 ? merchItem.coverImagePath : merchItem.imagePaths[hover]} alt={`Image for ${merchItem.name}`}
                className= "rounded-md border-slate-200 border drop-shadow aspect-square w-1/3"
              />
              <div>
                <h1 className = "mx-10 mb-5">
                  {merchItem.name}
                </h1>
                <h1 className = "mx-10 ">
                  ${merchItem.price.toFixed(2)}
                </h1> 
                <p className='mx-10'>{merchItem.description} </p>
                <button onClick={() => addToCart(merchItem)} className = "mx-10">
                  add to cart
                </button>
              </div>
          </div>
            {merchItem.imagePaths[0] && merchItem.imagePaths.map((item, index) => (
              <div key={index} className="flex">
                <img
                src={item} alt={`Image for ${merchItem.name}`}
                className= "rounded-md border-slate-200 border drop-shadow aspect-square w-24 h-24 m-2"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(-1)}
            />
                 </div>
            ))}
        </div>
        </NavBar>

  );
}