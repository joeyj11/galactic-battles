import { GetStaticProps, InferGetStaticPropsType } from "next";
import NavBar from "../components/navbar";
import {video, isVideoItem } from "@/types/video";
import queryData from "@/pages/firebase/firestore/queryData";
import { getFirestore } from "firebase/firestore";
import app from "@/pages/firebase/config";
import { listAll, ref, getDownloadURL, ListResult, getStorage } from "firebase/storage";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/router";
import getData from "./firebase/firestore/getData";
import { merch } from "@/types/merch";
import addData from "./firebase/firestore/addData";
import updateData from "./firebase/firestore/updateData";
import axios from "axios";
import { FileLock } from "lucide-react";
import checkout from "../components/checkout.js";
import Loading from "@/components/loading";
const db = getFirestore(app);
const storage1 = getStorage(app);
const auth = getAuth(app);
const seasonsPurchased: {[key: string]: boolean} = {}; 
const urlMap : {[key: string] : string} = {}
const priceMap: {[key: string] : number} = {}
interface season {
  id: string, 
  episodes: video[], 
  show: string,
}
// Function to say if season is purchased given object id
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

function isSeasonItem (obj: any): obj is season {
  return (typeof obj.id === "string" && typeof obj.episodes === "object" && typeof obj.show === "string")
} 

interface show  {
  live: boolean,
  seasons: season[],
  name: string
}
function isShowItem (obj: any): obj is show {
  return (typeof obj.live === "boolean" && typeof obj.seasons === "object" && typeof obj.name === 'string')
} 

const collectionName ='shows'
export default function media(){
  const [showsDisplay, setShows] = useState<show[]>([]);
  const router = useRouter();

  // here is where we will handle the logic for the stripe purchase of videos. 
  async function purchaseVideo(item: season, index: number){
    if (auth.currentUser){
    let temp = [{
      price: {
          curreny: 'usd',
          unit_amount: item.episodes[0].price / 100,
      },
      quantity: 1,
      id: item.id,
      metadata: {
          name: item.episodes[0].name,
          coverImagePath: item.episodes[0].coverImagePath,
      }
      }]
      checkout(temp);
    } else {
      alert("You Must Login to Purchase the Season");
    }
  
    /*
    let temp = {
      name: item.show + ", Season " + String(index),
      coverImagePath: urlMap[item.episodes[0].coverImagePath], 
      imagePaths:  [urlMap[item.episodes[0].coverImagePath]], 
      live: true, 
      price: item.episodes[0].price,
      description: item.episodes[0].description,
      quantity: 1,
      id: item.id,
    }
    if (auth.currentUser){
         if (auth.currentUser){
           let get = await getData(db, "users", auth.currentUser.uid)
           if (get.result){
           if(get.result.data() == undefined){
             let set = await addData(db, "users", auth.currentUser.uid, {cart: [temp]}).catch((error) => {
               alert(error);
             }).then (() => {
              router.reload();
               alert("item added");
             });
           } else {
             await updateData(db, "users", auth.currentUser.uid, "cart",  temp).catch((error) => {
               alert(error);
             }).then ((result) => {
              router.reload();
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
    else {
      alert('you must login to purchase video items');
      router.push('/signIn');
    }
    */
  }
      useEffect(() => {
        const fetchData = async () => {
          setLoading(true);
          try {
            const result = await queryData(db, collectionName, "live", "!=", false);
            const shows = await Promise.all(result.map(async (item) => {
              let temp: show[] = [];
              if (!isShowItem(item)) {
                console.log("query error");
                return null;
              }else {
                const name = item.name
                item.seasons = await Promise.all(item.seasons.map(async (item) =>{
                  let ret = await getData(db, 'seasons', name + String(item))
                if (ret.result){
                  let seasonData = ret.result.data()
                 if (isSeasonItem(seasonData)){
                  item = seasonData;
                 }
                }
                  if (!isSeasonItem(item)){
                    console.log('query error');
                    return item;
                  } else {
                    if(await seasonPurchased(item.id)){
                      seasonsPurchased[item.id] = true;
                    }else {
                      seasonsPurchased[item.id] = false;
                    }
                    let id = item.id
                    item.episodes = await Promise.all(item.episodes.map(async (item) => {
                      let ret = await getData(db, 'videoItems', item.name);
                      if (ret.result){
                        let episodeData = ret.result.data()
                       if (isVideoItem(episodeData)){
                        item = episodeData;
                        priceMap[id] = item.price;
                       }

                      const imageRef = ref(storage1, item.coverImagePath);
                      const videoRef = ref(storage1, item.videoPath);
                      const trailerRef = ref(storage1, item.trailerPath);
          
                      const [imageUrl, videoUrl, trailerUrl] = await Promise.all([
                        getDownloadURL(imageRef).catch((error) => {
                          console.log("Image download URL error:", error);
                          return null;
                        }),
                        getDownloadURL(videoRef).catch((error) => {
                          console.log("Video download URL error:", error);
                          return null;
                        }),
                        getDownloadURL(trailerRef).catch((error) => {
                          console.log("Trailer download URL error:", error);
                          return null;
                        }),
                      ]);

                      if (imageUrl && videoUrl && trailerUrl) {
                        urlMap[imageUrl] = item.coverImagePath;
                        item.coverImagePath = imageUrl;
                        item.videoPath = videoUrl;
                        item.trailerPath = trailerUrl;
                        return item;
                      } else {
                        console.log("Download URL error");
                        return item;
                      }
                    }
                    return item;
                    }
                  ));
                  return item
                  }
                }
                  ));
                  }
                  return item;
                } ) );
            setShows(shows.filter(Boolean) as show[]);
            setLoading(false);
      } catch (error) {
        console.error("Client-side error:", error);
      }
            // Filter out null values and set the state with the updated data
        };
    
        fetchData();
      }, []);

      const navigate = (item: video) => {
        const url = `/individualMedia?name=${item.name}`;
        router.push(url);
      };

      const [hovered, setHovered] = useState<string | null>(null);
      const [loading, setLoading] = useState<boolean>(true);
      const handleHover = (id : string) => {
        {setHovered(id)}
        
      };
  
      const handleMouseLeave = () => {
        setHovered(null);
      };

      if (loading){
        return (<NavBar><Loading></Loading> </NavBar>)
      }
    return (
        <NavBar>
        <h1>Shows: </h1>
         <div>{ showsDisplay[0] &&
            showsDisplay.map((item, index) => (
              <div className="mt-4" key={index}>
                <h1>{item.name}</h1>
                <div className="">
                {item.seasons[0] && item.seasons.map((season, index1) => (
                  <div className=" mx-2" key={index1}>
                    <p>season {index1 + 1}</p>
                    {!seasonsPurchased[season.id] && <div><p> ${priceMap[season.id]}</p> </div>}
                    <div className="flex flex-row items-center gap-2">
                  {season.episodes && season.episodes.map((episode, index2) => (
                    <div className="w-1/3 md:w-1/5" key={index2}>
                      <p>Chapter {index2 + 1}:</p>
                    <p>{episode.name}</p>
                    {hovered == episode.name? <video autoPlay controls controlsList="nodownload" className="aspect-video w-full" src={episode.trailerPath}  onMouseLeave={handleMouseLeave}></video>:<img onMouseEnter={() => handleHover(episode.name)} onMouseLeave={handleMouseLeave} className="aspect-video w-full" onClick={() => purchaseVideo(season, index1 + 1)} src={episode.coverImagePath}/>
} {hovered == episode.description && !seasonsPurchased[season.id] ?  <button onMouseLeave={handleMouseLeave} onClick={() => purchaseVideo(season, index1 + 1)}><FileLock className="h-[17.1429px] mx-[3.2px]"></FileLock> </button>: <button onMouseEnter={ () => handleHover(episode.description)} onMouseLeave={handleMouseLeave} onClick={() => navigate(episode)}>watch</button>}
</div> 
                  ))} 
                  </div>
                  </div>         
                ))}
                </div>
              </div>
            ))
          }
          </div>
       </NavBar>
    );
}