import {useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import { User, onAuthStateChanged, getAuth, getIdToken } from "firebase/auth";
import app from "../firebase/config"
import {  arrayUnion, doc, getFirestore, updateDoc}  from 'firebase/firestore'
import { getStorage, ref,uploadBytes} from "firebase/storage";
import addData from "@/pages/firebase/firestore/addData";
import NavBar from "@/components/navbar";
import { video } from "@/types/video";
import getData from "@/pages/firebase/firestore/getData";
// Get the default bucket from a custom firebase.app.App
const storage1 = getStorage(app);
const listRef = ref(storage1, 'merch/');
const db = getFirestore(app);
export const collectionName = "videoItems";
import {admin} from "./admin";
import { Result } from "postcss";
import updateData from "../firebase/firestore/updateData";
import { error } from "console";
import axios from "axios";
import { merch } from "@/types/merch";
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
    const [trailer, setTrailer] = useState<null | File>(null);
    const [realVideo, setRealVideo] = useState<null | File>(null);
    const [coverImage, setCoverImage] = useState<null | File>(null);
    const [loading, setLoading] = useState<boolean> (false);
    const [videoItem, setVideoItem] = useState<video> ({name: "",
      coverImagePath: "",
      trailerPath: "",
      videoPath: "",
      live: false, 
      price: 0,
    description: "", 
    season: 0,
    episode: 0, 
    show: "",
  });
    const data: string[] = [];
  
    const data2 : object = {
      hey: "there",
    }
  
    const updateVideoItem = (name?: string, coverImagePath?: string, trailerPath?: string, videoPath?: string,  live?: boolean, price?: number, description?: string, episode?: number, season?: number, show?: string ) => {
      let tempMerch: video  = videoItem;
      if (name){
        tempMerch.name = name;
      }
      if (coverImagePath){
        tempMerch.coverImagePath =coverImagePath;
      }
      if (trailerPath){
        tempMerch.trailerPath = trailerPath;
      }
      if (videoPath){
        tempMerch.videoPath = videoPath;
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
      if (show){
        tempMerch.show = show;
      }
      if (episode){
        tempMerch.episode = episode;
      }
      if (description){
        tempMerch.description = description;
      }
      if (season){
        tempMerch.season = season;
      }

    setVideoItem(tempMerch);
    }
    const addStripeItem = async (item: merch) => {
      const response = await axios.post('/api/createMerchItem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body:{
          merchItem: item,
        },
      });

      if (response.data.product_id){
        return response.data.product_id
      }
      else{
        console.log("Error creating stripe item")
      }
    };
    
      const upload = async () => {
        setLoading(true);


       if (realVideo != null){
        const addRef = ref(storage1, 'videos/' + realVideo.name);
        uploadBytes(addRef, realVideo).then((snapshot) => {
          console.log("successfully uploaded video");
          console.log(trailer);
          if (trailer != null){
            const addRef = ref(storage1, 'videos/' + trailer.name);
            uploadBytes(addRef, trailer).then((snapshot) => {
              console.log("successfully uploaded trailer");
              if (coverImage != null){
                const addRef = ref(storage1, 'images/' + coverImage.name);
                uploadBytes(addRef, coverImage).then((snapshot) => {
                  console.log("successfully uploaded cover image");
                  addData(db, collectionName , videoItem.name, videoItem).then(async (snapshot) => {
                    console.log("sucessfully updated \"inode\"");
                    let ret = await getData(db, 'seasons', videoItem.show + String(videoItem.season))
                    if (ret.result?.exists()){
                      await updateDoc(doc(db, 'seasons', videoItem.show + String(videoItem.season)),{
                        episodes: arrayUnion({number: videoItem.episode, name: videoItem.name}),
                      }).catch((error) => {
                        alert(error);
                      });
                    } else {
                      let ret = await getData(db, 'shows', videoItem.show);
                      if (ret.result?.exists()){
                        await updateDoc(doc(db, 'shows', videoItem.show), {
                          seasons: arrayUnion(videoItem.season),
                        }).catch((error) => {
                          alert(error);
                        });
                      }else {
                        await addData(db, 'shows', videoItem.show, {seasons: [videoItem.season], live:true, name: videoItem.show});
                      }
                      let temp: merch = {name: videoItem.show + String(videoItem.season), live: true, description: videoItem.description, price: videoItem.price, coverImagePath: videoItem.coverImagePath, imagePaths: [], quantity: 1, id:""}
                      await addStripeItem(temp).then(async (r) => {
                        if (typeof r === 'string'){
                          temp.id = r
                          console.log("product id:", r)
                        }
                        await addData(db, 'seasons', videoItem.show + String(videoItem.season), {episodes: [{number: videoItem.episode, name: videoItem.name}], id: temp.id, show: videoItem.show});
                      });
                    }
                    alert("Succesful Upload");
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
          } 
          else {
            alert("Upload Error");
          }
        }).catch((error) =>{
          alert(error);
        });
      }
      } 
        // try to make the display of merch item name and price more responsive. 
        if (loading){
          return (<div className="w-screen flex flex-col items-center"> <div
      className=" h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] bg-inherit"
      role="status">
      <span
        className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
    </div>
    </div>);
        }
        if (user){
    return (
      <NavBar>
        <div className="flex flex-col items-center">
        <div className="flex flex-row items-center">
      <form className="flex flex-col items-center gap-6 px-10" onSubmit={(e) => {e.preventDefault()}}>
      <label htmlFor="show" className=" flex flex-col items-center">
      <h1 className="text-center">Show Name: </h1>
      <input required className="w-full px-2" type="text" id="videoItemName" placeholder="show name" onChange={(e) => {
     updateVideoItem(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, e.target.value);
      }} />
    </label>
      <label htmlFor="videoItemName" className="flex flex-col items-center">
        <h1 className="text-center">Episode Name: </h1>
      <input required className="w-full px-2" type="text" id="videoItemName" placeholder="episode name" onChange={(e) => {
     updateVideoItem(e.target.value);
      }} />
      </label>
      <label htmlFor="season" className=" flex flex-col items-center">
      <h1 className="text-center">Season #:  </h1>
      <input required className="w-full px-2" type="number" id="videoItemName" placeholder="1" onChange={(e) => {
     updateVideoItem(undefined, undefined, undefined, undefined, undefined, undefined, undefined,undefined, Number(e.target.value),)
      }} />
    </label>
    <label htmlFor="episode" className=" flex flex-col items-center">
      <h1 className="text-center">Episode #: </h1>
      <input required className="w-full px-2" type="number" id="videoItemName" placeholder="1" onChange={(e) => {
     updateVideoItem(undefined, undefined, undefined, undefined, undefined, undefined, undefined, Number(e.target.value));
      }} />
    </label>
      <label htmlFor="price flex flex-col items-center">
        <h1 className="text-center"> Price in Dollars: </h1>
      <input required className="w-full px-2" id="price" placeholder="0.00" type="number" min=".01" step=".01"  onChange={(e) => {
        updateVideoItem(undefined, undefined,undefined, undefined, undefined ,Number(e.target.value));
      }} />
      </label>
      <label className="w-full" htmlFor="description">
        <h1> Product Description: </h1>
      <textarea className="w-full h-24" required onChange={(e) => {
              updateVideoItem(undefined, undefined, undefined, undefined, undefined,undefined, e.target.value);
          }} />
          </label>
      <label htmlFor="coverIamge">
        <h1> Cover Image: </h1>
      <input required  type="file" onChange={(e) => {
        let f: File | null = null;
            if (e.target.files != null){
              f = e.target.files[0] 
              updateVideoItem(undefined, "images/" + f.name);
            }
            setCoverImage(f);
            
          }} />
          </label>
      <label>
        <h1> Video: </h1>
      <input type="file" onChange={(e) => {
           let f: File | null = null;
           if (e.target.files != null){
             f = e.target.files[0] 
             updateVideoItem(undefined, undefined, undefined, "videos/" + f.name);
           }
           setRealVideo(f);
            }
          } />
      </label>
      <label>
        <h1> Trailer </h1>
      <input type="file" onChange={(e) => {
           let f: File | null = null;
           if (e.target.files != null){
             f = e.target.files[0] 
             updateVideoItem(undefined, undefined, "videos/" + f.name);
           }
           setTrailer(f);
            }
          } />
      </label>
  
      <label htmlFor="live">
        <h1>Make Product Live?</h1>
      <input required  type="checkbox" id="live" onChange={(e) => {
       updateVideoItem(undefined, undefined, undefined, undefined, e.target.checked);
      }}/> 
      </label>
          <button  onClick={upload}>Upload</button>
          </form>
          <div className="flex flex-col items-center py-2 gap-2">
        {coverImage && <div className="flex flex-col items-center" ><img className=" h-36 w-36" src={URL.createObjectURL(coverImage)}/></div>}
        {videoItem.price != 0 &&  <><h1> {videoItem.name} </h1>
        <h1>${videoItem.price}</h1> <p>{videoItem.description}</p></>}
        </div>
        </div>
        </div>
  
     </NavBar>
    );
    }
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
