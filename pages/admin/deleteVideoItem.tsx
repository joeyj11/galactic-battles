import {useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { User, onAuthStateChanged, getAuth, getIdToken } from "firebase/auth";
import app from "../firebase/config"
import { doc, getFirestore, updateDoc}  from 'firebase/firestore'
import { getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";
import addData from "@/pages/firebase/firestore/addData";
import NavBar from "@/components/navbar";
import { isVideoItem, video } from "@/types/video";
import { merch } from "@/types/merch";
import deleteData from "@/pages/firebase/firestore/deleteData";
import { Result } from "postcss";
import Loading from "@/components/loading";
import getData from "@/pages/firebase/firestore/getData";
import queryData from "@/pages/firebase/firestore/queryData";
import updateData from "@/pages/firebase/firestore/updateData";
import { Trash2Icon } from "lucide-react";
import { admin } from "./admin";
const storage1 = getStorage(app);
const listRef = ref(storage1, 'merch/');
const db = getFirestore(app);
export const collectionName = "videoItems";
const auth = getAuth(app);
export default function Page() {
const [user, setUser] = useState<User | null>(null);
const router = useRouter();

const deleteItem =  async (videoItem: video) =>{
    if (window.confirm('are you sure')){
    await deleteData(db, collectionName, videoItem.name).then((result) => {
        alert("deleted");
    }).catch((e) => {
        alert(e);
    })
    router.refresh();
   } else {
    return;
   }
  }

const changeLive = async (videoItem: video ) => {
    console.log("here");
    await updateDoc(doc(db, collectionName, videoItem.name), {
        live: !videoItem.live,
      }).catch((error) => {
        alert(error);
      }).then ((result) => {
        alert("item updates");
       router.refresh()
      });
}
      const [videoItems, setVideoItems] = useState<video[]>([]);

      useEffect(() => {
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
        const fetchData = async () => {
          try {
            const result = await queryData(db, collectionName, "name", "!=", "");
            const videos = await Promise.all(result.map(async (item) => {
              if (!isVideoItem(item)) {
                console.log("query error");
                return null;
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
                item.coverImagePath = imageUrl;
                item.videoPath = videoUrl;
                item.trailerPath = trailerUrl;
                return item;
              } else {
                console.log("Download URL error");
                return null;
              }
            }));
            setVideoItems(videos.filter(Boolean) as video[]);
      } catch (error) {
        console.error("Client-side error:", error);
      }
            // Filter out null values and set the state with the updated data
        };
    
        fetchData();
      }, []);
    return (
        <NavBar>
        <h1>media</h1>
         <div>{ videoItems[0] &&
            videoItems.map((item, index) => (
              <div key={index}>
                <p>{item.name}</p>
                <video controls src={item.trailerPath}></video>
                <Trash2Icon size={10} onClick={() => deleteItem(item)}></Trash2Icon>
          <button onClick={() => changeLive(item)}> {item.live?   "hide" : "display"} </button>

                <p>${item.price}</p>
                <p>{item.description}</p>
                <div className="w-full h-1 border-4 my-10"></div>
              </div>
            ))
          }
          </div>
       </NavBar>
    );
}