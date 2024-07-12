import NavBar from "../components/navbar";
import { ref, getDownloadURL, getStorage, } from "firebase/storage";
import { getAuth  } from "firebase/auth";
import app from "../pages/firebase/config";
import { getFirestore } from "firebase/firestore";
import { useRouter } from 'next/router';
import checkout from "../components/checkout.js";
import getData from "../pages/firebase/firestore/getData";
import { useState } from "react";
import { useEffect } from "react";
import Loading from "@/components/loading";
import addData from "./firebase/firestore/addData";

const db = getFirestore(app);
const storage1 = getStorage(app);
const auth = getAuth(app);

const getCart = async () => {
    if (auth.currentUser){
        var cart:any = [];
        await getData(db, "users", auth.currentUser.uid).then( async (ret) => {
            if (ret.result){
            let object = ret.result.data()
            if (object){
                
                for (let i = 0; i < object.cart.length; i++){
                    let item = object.cart[i];
                    const imageRef = ref(storage1, item.coverImagePath);
                    let image = await getDownloadURL(imageRef);
                    let temp = {
                        price: {
                            curreny: 'usd',
                            unit_amount: item.price / 100,
                        },
                        quantity: item.quantity,
                        id: item.id,
                        metadata: {
                            name: item.name,
                            coverImagePath: image,
                        }
                        }
                    cart.push(temp);
                    }
                }
            }
        });
        return cart;
    }
    return [];
}

function subTotal(lineItems:any){
    let subTotal = 0
    for(let i = 0; i < lineItems.length; i++){
        subTotal += (lineItems[i].price.unit_amount * 100) * lineItems[i].quantity;
    }
    return subTotal;
}

export default function reviewCart() {
    const router = useRouter();
    const [lineItems, setLineItems] = useState<any>([]);
    const [sub, setSet] = useState<any>(0);
    const [tax, setTax] = useState<any>(0);
    const [loading, setLoading] = useState<boolean>(true);
    function displayCart(lineItems:any){
        const removeItem = async (item_id:string) =>{
            let temp:any = [];
            for(let i = 0; i < lineItems.length; i++){
                if (lineItems[i].id == item_id){
                    continue
                }
                else{
                    temp.push(lineItems[i]);
                }
            }
            if (auth.currentUser){
              await getData(db, "users", auth.currentUser.uid).then( async (ret) => {
                if (ret.result){
                let object = ret.result.data()
                if (object){
                    let temp2:any = []
                    for (let i = 0; i < object.cart.length; i++){
                        let item = object.cart[i];
                        if (item.id == item_id){
                            continue
                        }
                        else{
                            temp2.push(item);
                        }
                    }
                    object.cart = temp2;
                if (auth.currentUser){
                    await addData(db, "users", auth.currentUser.uid, object).catch((error) => {
                    alert(error.code);
                    }).then(() => {
                console.log("uploaded");
                setLineItems(temp);

                if (temp.length == 0){
                    alert("Cart is empty");
                    router.push('/');
                }
              });
              }
                } else {
                alert("Error Removing Item");
                }
                }
            })};
        }
        return(
            <div className='flex flex-col mb-20'>
                <div className='flex flex-row ml-20 place-items-center'>
                    <p className='pl-20 basis-1/2 text-white text-xl flex justify-left'>Item</p>
                    <p className='basis-1/6 text-white text-xl flex justify-center'>Price</p>
                    <p className='basis-1/6 text-white text-xl flex justify-center'>Qty</p>
                    <p className="basis-1/6 text-white text-xl flex justify-center">Subtotal</p>
                    <p className='basis-1/12'/>
                </div>
                <div className='flex flex-col ml-20 gap-12 shrink'>
                    {lineItems.map((item:any) => {
                        return(
                            <div key={item.id}>
                            <div className='border-gray-700 mb-10 border-2'/>
                            <div className='items-center justify-center place-items-center flex flex-row'>
                                <div className='justify-center flex w-1/12 h-1/12 basis-1/2'>
                                    <img className='justify-self-center flex w-1/4 h-1/4 aspect-square' src={item.metadata.coverImagePath} alt={item.metadata.name}/>
                                    <div className='ml-5 mt-1 flex flex-col gap-3'>
                                        <p className="justify-center flex basis-1/12 text-slate-400 font-extrabold whitespace-pre">Name: <text className='font-normal'>{item.metadata.name}</text></p>
                                        <p className="justify-center flex basis-1/12 text-slate-400 font-extrabold whitespace-pre">Made In: <text className='font-normal'>USA</text></p>
                                    </div>
                                </div>
                                <p className="text-slate-400 justify-center flex basis-1/6">${item.price.unit_amount * 100}</p>
                                <p className="text-slate-400 justify-center flex basis-1/6">{item.quantity}</p>
                                <p className="text-slate-400 justify-center flex basis-1/6">${(item.price.unit_amount * 100) * item.quantity}</p>
                                <div className='basis-1/12'>
                                    <svg onClick={() => removeItem(item.id)} className='justify-self-center place-self-center w-7 h-7 mb-1 hover:cursor-pointer' fill="#ffffff" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41.336 41.336" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M36.335,5.668h-8.167V1.5c0-0.828-0.672-1.5-1.5-1.5h-12c-0.828,0-1.5,0.672-1.5,1.5v4.168H5.001c-1.104,0-2,0.896-2,2 s0.896,2,2,2h2.001v29.168c0,1.381,1.119,2.5,2.5,2.5h22.332c1.381,0,2.5-1.119,2.5-2.5V9.668h2.001c1.104,0,2-0.896,2-2 S37.438,5.668,36.335,5.668z M14.168,35.67c0,0.828-0.672,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-21c0-0.828,0.672-1.5,1.5-1.5 s1.5,0.672,1.5,1.5V35.67z M22.168,35.67c0,0.828-0.672,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-21c0-0.828,0.672-1.5,1.5-1.5 s1.5,0.672,1.5,1.5V35.67z M25.168,5.668h-9V3h9V5.668z M30.168,35.67c0,0.828-0.672,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-21 c0-0.828,0.672-1.5,1.5-1.5s1.5,0.672,1.5,1.5V35.67z"></path> </g> </g></svg>                            
                                </div>
                            </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    }

    if (auth.currentUser){
        useEffect(() => {
            const fetchData = async () => {
            try {
                let lineItems = await getCart();
                if (lineItems.length == 0){
                    router.push('/');
                }
                let sub = (Math.round(subTotal(lineItems) * 100) / 100).toFixed(2);
                let tax = (Math.round((+sub) * .08 * 100)/ 100).toFixed(2);
                for (let i = 0; i < lineItems.length; i++){
                    lineItems[i].metadata.coverImagePath = await getDownloadURL(ref(storage1, lineItems[i].metadata.coverImagePath));
                }
                setSet(sub);
                setTax(tax);
                setLineItems(lineItems);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                router.push("/")
            }
        };

        // Call the fetchData function when the component mounts
        fetchData();
        }, []);

        return (
            <NavBar review={true}>
            {loading ? <Loading></Loading> : (
            <div>
                <div className='mt-16'/>
                <h1 className='pl-20 mb-10'>Review Your Cart</h1>
                <div className="flex flex-row gap-28">
                    <div className='w-7/12'>{displayCart(lineItems)}</div>
                    <div className='h-fit w-1/4 bg-zinc-800'>
                        <p className='px-4 pt-4 text-4xl pb-2 text-white'>Summary</p>
                        <div className='mx-4 border-2 border-gray-400'/>
                        <div className='flex flex-col gap-5'>
                            <p className='flex px-8 pt-6 text-2xl text-white'>Subtotal: ${sub}</p>
                            <p className='flex px-8 text-2xl text-white'>Shipping: Variable</p>
                            <p className='flex px-8 pb-6 text-2xl text-white'>Estimated Tax: ${tax}</p>
                        </div>
                        <div className='mx-4 border-2 border-gray-400'/>
                        <p className='px-8 pt-6 pb-12 text-2xl text-white'>Estimated Total: ${(Math.round(((+sub) + (+tax)) * 100) / 100).toFixed(2)}</p>
                        <div className='flex flex-row mb-6 justify-center'>
                            <button onClick={() => checkout(lineItems)}>Proceed to Checkout</button>
                        </div>
                    </div>  
                </div>
            </div> 
            )}
            </NavBar>
        );
    }
    else {
        return (
            <NavBar>
                <h1> You must be logged in to review the cart. </h1>
            </NavBar>           
        );
    }
}
