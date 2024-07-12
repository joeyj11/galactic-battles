import { User, getAuth, onAuthStateChanged, sendEmailVerification, signOut } from "firebase/auth";
import router from "next/router";
import { useEffect, useState } from "react";
import app from "./firebase/config";
import Loading from "@/components/loading";
import getData from "./firebase/firestore/getData";
import { DocumentData, getFirestore } from "firebase/firestore";
import { isMerchArray } from "@/types/merch";
import addData from "./firebase/firestore/addData";
const auth = getAuth(app);
const db = getFirestore(app);
const collectionName = 'users'
export default function verify() {

    useEffect( () => {
        
        async function loadData(person: User | null) {
            if (person != null && person!= undefined){
            await getData(db, collectionName, person.uid)
            .then( async (ret) => {
              if (ret.result){
                let object = ret.result.data()
                if (object){
                 if (isMerchArray(object.cart)){
                    Promise.all(object.cart.map(async (item) => {
                       ret = await getData(db, 'inventory', item.name);
                       let temp = ret?.result?.data()?.inventory;
                       temp -= item.quantity;
                       addData(db, 'inventory', item.name, {inventory: temp});
                    }))
                 }
                 
                }
               }else {
                console.log("cart error");
               }
            }).catch((error) => {
              console.log(error);
            })
          }
        }

        onAuthStateChanged(auth, (user) => {
            loadData(user);
      }
      )
      },[]
      )
return (<Loading/>);
}