import getData from '@/pages/firebase/firestore/getData';
import queryData from '@/pages/firebase/firestore/queryData';
import { DocumentData, getFirestore } from 'firebase/firestore';
import {motion, useAnimation} from 'framer-motion';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/navigation'
import app from '@/pages/firebase/config';
import { User, getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import{merch, isMerchArray, isMerchItem} from '@/types/merch';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { Trash2Icon, ChevronUp, ChevronDown } from 'lucide-react';
import addData from '@/pages/firebase/firestore/addData';
import { userAgent } from 'next/server';
import { useMediaQuery } from 'react-responsive';
import UAParser from 'ua-parser-js';

const collectionName = "users";
const db = getFirestore(app);
const auth = getAuth(app);
const storage1 = getStorage(app);


// issue since authstate is defined by client side but we try to render on server side. 
// in order to statically pre-render pages we could have to store cart documents in firebase in a different manner. 
const inventoryDict: {[key: string]: number} = {};
interface cartProps{
  review?: boolean,
}
export const isMobile = () => {
  const parser = new UAParser();
  const result = parser.getResult();
  return result.device.type === 'mobile';
};

export default function cart(props: cartProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [cart, setCart] = useState<merch[]>([]);
    const controls = useAnimation()
    const controlText = useAnimation()
    const controlTitleText = useAnimation()
    const nav = useAnimation()
    const menuicon = useAnimation()
    const router = useRouter();
    const loadElements = useAnimation();
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<DocumentData>();
    const [loader, setLoader] = useState<boolean>(false);
    const [sum, setSum] = useState<number>(0.00);

    const updateQuantity = async (cart: merch[], index: number, quantity: number) => {
      if (Number(quantity) <= 0){
        return;
      } else{
      console.log(Number(quantity), cart[index].quantity);
      let temp = cart[index].quantity 
      if (Number(quantity) <= inventoryDict[cart[index].name]){
      setSum(sum => sum -(temp * cart[index].price)*2 + (cart[index].price * quantity)*2);
      cart[index].quantity = Number(quantity);
      if (userData && user){
        let temp = userData;
        temp.cart = cart;
        await addData(db, "users", user.uid, temp).catch((error) => {
          alert(error);
        }).then(() => {
          console.log("updated");
          setLoader(!loader);
        });
      }
    } else {
      alert('Quanitity Exceeds Stock');
    }
    }
  }
   
      useEffect(() => {
       async function getDownloadLinks(c: merch[] ){
        for (const item of c){
          console.log(item.price);
          setSum(sum => sum + item.price*item.quantity);
          const imageRef = ref(storage1, item.coverImagePath);
          const url = await getDownloadURL(imageRef).catch((error) => {
            console.log("Image download URL error:", error);
          });
          if (url) {
            item.coverImagePath = url;
          } else {
            console.log("Download URL error");
          }
          const res = await getData(db, 'inventory', item.name).catch((error) => {
            console.log(error);
            return null
          })

          inventoryDict[item.name] = Number(res?.result?.data()?.inventory);
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
        }
        return c; 
      }
        async function loadData(person: User | null) {
          setLoading(true);
          if (person != null && person!= undefined){
          await getData(db, collectionName, person.uid)
          .then( async (ret) => {
            if (ret.result){
              let object = ret.result.data()
              if (object){
                setUserData(object);
               if (isMerchArray(object.cart)){
                const downloadLinks = await getDownloadLinks(object.cart);
                setCart(downloadLinks);
                setLoading(false);
               }
               
              }
             }else {
              console.log("cart error");
             }
          }).catch((error) => {
            console.log(error);
          })
        } else {
          setCart([]);
          setLoading(false);
        }
      }

      onAuthStateChanged(auth, (user) => {
            setUser(user);
            loadData(user);
      }
      )
      }, []);

      const removeItem = async (item:merch) =>{
        let temp = cart.filter(obj => {return obj !== item});
        if (userData){
          console.log("here");
          userData.cart = temp;
          let price = 0;
          for (let i = 0; i < temp.length; i++){
            price += temp[i].price *temp[i].quantity;
          }
          setSum(price*2);
         
          console.log(userData);
          if (user){
          await addData(db, "users", user.uid, userData).catch((error) => {
            alert(error);
          }).then(() => {
            console.log("uploaded");
            setCart(temp);
          });
          }
        } else {
        alert ("Error Removing Item");
        }
      }

const showMore = () => {
    nav.start({
      opacity: 0,
      transition:{
      }
    })
    controls.start({
      height: '100vh',
      width: isMobile()? '100vw' : '30vw',
      transition: { duration: 0.2, delay: 0.2},
      display: 'flex',
    })
    controlText.start({
      opacity: 1,
      display: 'block',
      transition: {delay:0.3}
    })
    controlTitleText.start({
      opacity: 1,
      transition: {delay:0.3}
    })
   
    menuicon.start({
        opacity: 1,
        transition:{
          duration: 0.2, delay: 0.4
        }
     
    })

  }

  const showLess = () => {
    controls.start({
      height: '0px',
      width: '0px', 
      transition: { duration: 0.1},
      display: 'none',
    })

    controlText.start({
      opacity: 0,
      display: 'none',
    })

    controlTitleText.start({
      opacity: 0,
    })

    nav.start({
      opacity:1,
      transition:{
        duration: .2, delay: .2
      }
    })

    menuicon.start({
        opacity: 0,
        transition: {duration: .1}
    })

  }


const emptyCart = async () => {
  let temp:merch[] = [];
 if (window.confirm("are you sure you want to empty your cart?")){
  if (userData){
    userData.cart = temp;
    if (user){
    await addData(db, "users", user.uid, userData).catch((error) => {
      alert(error);
    }).then(() => {
      console.log("uploaded");
      setCart(temp);
    });
    }
  } else {
  alert ("Error Removing Item");
  }
}
}

const navigate = (str: string) =>{
    showLess();
    setTimeout(() => {
        router.push(str); }
    , 500);  
    }
    if (loading || props.review){
      return (<svg  onClick={showMore} className="basis-1/2" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.96749 4.21268L8.10253 4.5H8.42H38C38.3978 4.5 38.7794 4.65804 39.0607 4.93934C39.342 5.22064 39.5 5.60217 39.5 6C39.5 6.23923 39.4305 6.50081 39.3109 6.77896L32.1633 19.6966C32.1632 19.6967 32.1631 19.6969 32.163 19.6971C31.5672 20.7656 30.4104 21.5 29.1 21.5H14.2H13.9049L13.7623 21.7583L11.9623 25.0183L11.9308 25.0754L11.9149 25.1387L11.8549 25.3787L11.84 25.4384V25.5C11.84 25.7652 11.9454 26.0196 12.1329 26.2071C12.3204 26.3946 12.5748 26.5 12.84 26.5H35.5V29.5H12C11.0717 29.5 10.1815 29.1313 9.52513 28.4749C8.86875 27.8185 8.5 26.9283 8.5 26C8.5 25.3868 8.65747 24.8088 8.91903 24.3193L11.6372 19.4227L11.7619 19.198L11.6518 18.9657L4.45176 3.78573L4.31624 3.5H4H0.5V0.5H6.22253L7.96749 4.21268ZM30 18.5H30.2941L30.437 18.243L35.997 8.24297L36.4101 7.5H35.56H10.28H9.4911L9.82784 8.21342L14.5478 18.2134L14.6831 18.5H15H30ZM32 32.5C32.9283 32.5 33.8185 32.8688 34.4749 33.5251C35.1312 34.1815 35.5 35.0717 35.5 36C35.5 36.9283 35.1312 37.8185 34.4749 38.4749C33.8185 39.1312 32.9283 39.5 32 39.5C31.0717 39.5 30.1815 39.1312 29.5251 38.4749C28.8687 37.8185 28.5 36.9283 28.5 36C28.5 34.0561 30.0561 32.5 32 32.5ZM12 32.5C12.9283 32.5 13.8185 32.8688 14.4749 33.5251C15.1313 34.1815 15.5 35.0717 15.5 36C15.5 36.9283 15.1313 37.8185 14.4749 38.4749C13.8185 39.1312 12.9283 39.5 12 39.5C11.0717 39.5 10.1815 39.1312 9.52513 38.4749C8.86875 37.8185 8.5 36.9283 8.5 36C8.5 34.0561 10.0561 32.5 12 32.5Z" fill="#b6ccce" stroke="#b6ccce"/>
    </svg>)
    } else{
    return ( 
    <div key={user?.email} className='relative'>
      {cart[0] && <div onClick={showMore} className='rounded-full h-5 w-4 flex items-center bg-red-600 absolute -top-1 -left-1 text-white font-serif justify-center' >
    {cart.length}
      </div>}
      <div onClick={showMore}>
      <svg  onClick={showMore} className="basis-1/2 z-50" width="40" height="40" viewBox="0 0 40 40" fill="#b6ccce" stroke="#b6ccce" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.96749 4.21268L8.10253 4.5H8.42H38C38.3978 4.5 38.7794 4.65804 39.0607 4.93934C39.342 5.22064 39.5 5.60217 39.5 6C39.5 6.23923 39.4305 6.50081 39.3109 6.77896L32.1633 19.6966C32.1632 19.6967 32.1631 19.6969 32.163 19.6971C31.5672 20.7656 30.4104 21.5 29.1 21.5H14.2H13.9049L13.7623 21.7583L11.9623 25.0183L11.9308 25.0754L11.9149 25.1387L11.8549 25.3787L11.84 25.4384V25.5C11.84 25.7652 11.9454 26.0196 12.1329 26.2071C12.3204 26.3946 12.5748 26.5 12.84 26.5H35.5V29.5H12C11.0717 29.5 10.1815 29.1313 9.52513 28.4749C8.86875 27.8185 8.5 26.9283 8.5 26C8.5 25.3868 8.65747 24.8088 8.91903 24.3193L11.6372 19.4227L11.7619 19.198L11.6518 18.9657L4.45176 3.78573L4.31624 3.5H4H0.5V0.5H6.22253L7.96749 4.21268ZM30 18.5H30.2941L30.437 18.243L35.997 8.24297L36.4101 7.5H35.56H10.28H9.4911L9.82784 8.21342L14.5478 18.2134L14.6831 18.5H15H30ZM32 32.5C32.9283 32.5 33.8185 32.8688 34.4749 33.5251C35.1312 34.1815 35.5 35.0717 35.5 36C35.5 36.9283 35.1312 37.8185 34.4749 38.4749C33.8185 39.1312 32.9283 39.5 32 39.5C31.0717 39.5 30.1815 39.1312 29.5251 38.4749C28.8687 37.8185 28.5 36.9283 28.5 36C28.5 34.0561 30.0561 32.5 32 32.5ZM12 32.5C12.9283 32.5 13.8185 32.8688 14.4749 33.5251C15.1313 34.1815 15.5 35.0717 15.5 36C15.5 36.9283 15.1313 37.8185 14.4749 38.4749C13.8185 39.1312 12.9283 39.5 12 39.5C11.0717 39.5 10.1815 39.1312 9.52513 38.4749C8.86875 37.8185 8.5 36.9283 8.5 36C8.5 34.0561 10.0561 32.5 12 32.5Z" />
      </svg>
      </div>
      
      <motion.div animate={controls} className='animate duration-300 bg-[#6a6a6a] fixed flex-col max-h-screen top-0 right-0 z-40  w-0 h-0 drop-shadow-xl hidden' onMouseLeave={showLess}>
        <motion.div className='grow opacity-0 h-full w-full flex flex-col items-center' animate={menuicon} >
            <div className='border-2 border-[#606060] basis-3/4 w-10/12 mt-8 border-opacity-30 rounded-lg flex flex-col items-center'>
               {cart[0] ? cart.map((item, index) => (<div className="flex w-full flex-row items-center h-[15vh] gap-4" key={index}>
                <div className='basis-1/4'>
               <img src={ (item.coverImagePath)} className="aspect-square w-full h-auto rounded-md"/>
               </div>
               <div className='basis-1/12'> </div>
               <div className='flex flex-col items-start basis-1/4'>
                <h1 className=' text-xl'>{item.name}</h1>
                <div className='flex flex-row items-center -mt-2'>
                <p className='text-black' id={String(loader)}>Quantity: {item.quantity}</p>
                <div className='flex flex-col items-center'>
                <ChevronUp className="-mb-1 h-1/6 w-auto" onClick={() => { updateQuantity(cart, index, item.quantity + 1)}}></ChevronUp>
                <ChevronDown className="-mt-1 h-1/6 w-auto" onClick={() => updateQuantity(cart, index, item.quantity - 1)}></ChevronDown>
              </div>
                </div>
                </div>
              <div className='basis-1/4 items-center flex flex-col '>
              <p className='text-black text-2xl font-bold'>${(item.price).toFixed(2)}</p>
              </div>
              <Trash2Icon className=" w-auto h-1/5 basis-1/6" size={7} onClick={() => removeItem(item)}></Trash2Icon>
                </div>
                )) : <div className='flex flex-col items-center mt-6'> <h1 className='mb-6 text-3xl text-center'>There's Nothing in your Cart</h1>
                <button className="invertedColors" onClick={()=> navigate('/merch')}> add items here </button></div>
                }
               {cart[0] && <button className='invertedColors' onClick={emptyCart}> empty cart </button>}
               {cart[0] && <h1 className='' id={String(loader)}>Total: ${(sum/2).toFixed(2)}</h1>}

                </div>
            <div className='flex flex-row items-center w-full basis-1/4'>
            <div className='basis-[5%]'></div>
            <button onClick = {showLess} className='basis-[40%] invertedColors'>Close</button>
            <div className='basis-[10%]'></div>
            <button onClick={() =>{ if(!cart[0]){
              alert('add items to cart to checkout')
              navigate('/merch')
            }else {navigate("/reviewCart")}}}className='basis-[40%] invertedColors'>Checkout</button>
            <div className='basis-[5%]'></div>
            </div>
          </motion.div>
        </motion.div>
        </div>);
}
}

