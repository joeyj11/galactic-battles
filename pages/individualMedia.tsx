import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import app from './firebase/config';
import { isVideoItem, video } from '@/types/video';
import Loading from '@/components/loading';
import updateData from './firebase/firestore/updateData';
import addData from './firebase/firestore/addData';
import getData from './firebase/firestore/getData';
import { getAuth } from 'firebase/auth';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import NavBar from '@/components/navbar';
import axios from 'axios';
const db = getFirestore(app);
const auth = getAuth(app);
const storage1 = getStorage(app);

const dict: { [key: string]: string } = {};
export default function IndividualVideoPage() {
  const router = useRouter();
  const { name } = router.query;
  const [loading, setLoading] = useState<boolean> (true);


  const [videoItem, setvideoItem] = useState< video| null>(null);
  const mutate =async (videoItem:video) => {
    videoItem.coverImagePath=dict[videoItem.coverImagePath]; 
    return videoItem;
  }

  const addToCart =  async (videoItem: video) =>{
    let video = await mutate(videoItem);
     if (auth.currentUser){
       let get = await getData(db, "users", auth.currentUser.uid)
       if (get.result){
       if(get.result.data() == undefined){
         let set = await addData(db, "users", auth.currentUser.uid, {cart: [video]}).catch((error) => {
           alert(error.code);
         }).then (() => {
          router.push('/media');
           alert("item added");
         });
       } else {
         await updateData(db, "users", auth.currentUser.uid, "cart",  video).catch((error) => {
           alert(error.code);
         }).then ((result) => {
          router.push('/media');
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

   async function seasonPurchased(season_stripe_id: string){
    if (auth.currentUser && auth.currentUser.uid){
      var customerID = "";
      await getData(db, "users", auth.currentUser.uid).then( async (ret) => {
          if (ret.result){
          let object = ret.result.data()
          if (object){
              customerID = object.customer_id;
          }
          }
      });
  
      const response = await axios.post('/api/getOrderHistory', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: {
              customer_id: customerID,
          }
      });
      if (response.data){
          let products = response.data.data[1];
          let orders = response.data.data[0];
          console.log(orders);
          console.log(products);
          for (let i = 0; i < products.length; i++){
            for (let j = 0; j < products[i].length; j++){
              if (products[i][j].prod_id == season_stripe_id && orders[i].payment_status == "paid"){
                return true; // product in purchased products
              }
            }
          }
          return false; // product not in purchased products
      }
      return false; // no response data 
    }
    return false; // user not authenticated
  }
  
  useEffect(() => {
    setLoading(true);
    const getLinks =async (item:video) => {
      if (!isVideoItem(item)) {
        console.log("query error");
        return null;
      }
      const season = await getData(db, 'seasons', item.show + String(item.season));
      if (! (await seasonPurchased(season.result?.data()?.id))){
        alert("please purchase the season to watch")
        router.push('/media');
      }
      const imageRef = ref(storage1, item.videoPath);
      const url = await getDownloadURL(imageRef).catch((error) => {
        console.log("Image download URL error:", error);
        return null;
      });
      console.log(url);
      if (url) {
        dict[url] = item.videoPath;
        item.videoPath= url;
      } else {
        console.log("Download URL error");
      }
      return item;
    }
    const fetchvideoItem = async (name: string) => {
      try {
        const docRef = doc(db, 'videoItems', name);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as video;
        const item = await getLinks(data); 
          setvideoItem(item); // Update the state with the fetched item
          setLoading(false);
        } else {
          console.error('Item not found');
        }
      } catch (error) {
        console.error('Error fetching video item:', error);
      }
    };
    if (name) {
      fetchvideoItem(name as string);
    }
  }, [router.isReady]);

  if (!videoItem || loading) {
    return <NavBar> <Loading/></NavBar>
  }

  return (
    <NavBar>
<div className= "h-screen mx-10 mb-10 ">
          <div className = "flex">
              <div>
                <h1 className = "mx-10 mb-5">
                  {videoItem.name}
                </h1>
                <video controls autoPlay controlsList="nodownload" src={videoItem.videoPath}></video>
              </div>
          </div>
        </div>
        </NavBar>

  );
}