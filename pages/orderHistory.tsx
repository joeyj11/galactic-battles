import NavBar from "../components/navbar";
import axios from "axios";
import getData from "./firebase/firestore/getData";
import { getFirestore } from "firebase/firestore";
import app from "@/pages/firebase/config";
import { getAuth } from "firebase/auth";
import { useState, useEffect } from "react";
import Loading from "@/components/loading";
import { useRouter } from 'next/router';
import { ref, getDownloadURL, getStorage, } from "firebase/storage";

const db = getFirestore(app);
const auth = getAuth(app);
const storage1 = getStorage(app);

function formatDateObject(date:any) { 
    
    const year = date.getFullYear(); const month = date.getMonth(); const day = date.getDate(); const hour = date.getHours(); const minute = date.getMinutes(); const second = date.getSeconds();

 // Add any other components you need // Create a new Date object with the formatted components 
    const formattedDateObject = new Date(year, month, day, hour, minute, second); 
    return formattedDateObject; 
} 

export default function orderHistory() {
    const [orders, setOrders] = useState<any>([]);
    const [products, setProducts] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter()

    // useEffect to fetch data from the API
    useEffect(() => {
        const fetchData = async () => {
        try {
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
                    let res1 = response.data.data[0];
                    let res2 = response.data.data[1];
                    console.log(res1)
                    console.log('r', res2)
                    let orders = [];
                    let products = [];
                    for(let i = 0; i < res1.length; i++){
                        if(res1[i].payment_status == "paid"){
                            // remove current index from orders and products
                            for(let j = 0; j < res2[i].length; j++){
                                let temp = res2[i][j].prod_id;
                                let response = await axios.post('/api/retrieveItem', {
                                    method: 'POST',
                                    headers: {
                                    'Content-Type': 'application/json',
                                    },
                                    body: {
                                        id: temp,
                                    }
                                });
                                if (response.data){
                                    res2[i][j].name = response.data.product.name;
                                    console.log(response.data.product.images[0])
                                    res2[i][j].coverImage = response.data.product.images[0];
                                    console.log(response.data)
                                }
                            }
                            orders.push(res1[i]);
                            products.push(res2[i]);
                        }
                    }
                    setOrders(orders);
                    setProducts(products);
                }
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            router.push("/")
        }
    };

    // Call the fetchData function when the component mounts
    fetchData();
    }, []);
    console.log(products)
    return (
    <NavBar>
      {loading ? (<Loading></Loading>) : (
        // Render the API data once it's available
        <div>
          <h1 className='text-center'>Past Orders:</h1>
          <div>
          {orders.map((item:any, index:any) => {
                    return(
                        <div key={index}>
                            <div className='border-gray-700 mb-10 border-2 mx-10'/>
                            <div className='flex flex-col gap-10'>
                                <div className=''>
                                    {products[index].map((item:any) => {
                                        return (
                                            <div key={item.prod_id}>
                                                <div className='flex flex-row mx-32 gap-8 mt-10'>
                                                    <div className='basis-1/6'>
                                                        <img className='aspect-square w-4 h-auto sm:w-32' src={item.coverImage}/>
                                                    </div>
                                                    <p className='place-self-center justify-self-center basis-1/4 text-slate-400 font-extrabold'>{item.name}</p>
                                                    <p className='place-self-center justify-self-center basis-1/4 text-slate-400 font-extrabold'>${item.price}</p>
                                                    <p className='place-self-center justify-self-center basis-1/4 text-slate-400 font-extrabold'>Quantity: {item.quantity}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className='flex flex-row mx-32 gap-8 mb-10'> 
                                    <h1 className='basis-1/4'>Order Summary</h1>
                                    <p className="flex basis-1/3 place-self-end justify-self-center text-slate-400 font-extrabold">Order Total: ${item.amount_total / 100}</p>
                                    <p className='flex basis-1/3 place-self-end justify-self-center text-slate-400 font-extrabold'>Date Ordered: {new Date(item.metadata.date).toDateString()}</p>
                                </div>
                            </div>
                        </div>
                    )})}
          </div>
        </div>
      )}
    </NavBar>
    );
};
