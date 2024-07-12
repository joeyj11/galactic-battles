import { Firestore, collection, updateDoc, getDoc, getDocs, query, where, doc, arrayUnion, FieldValue } from "firebase/firestore";

// Adds the string 'argument' to the array 'arrayName" in the document specified by id and collection specified by collection. 
export default async function (db: Firestore, collection: string, id: string, arrayName: string, argument: any) {
    let result = null;
    let error = null;
    try {

      result =  await updateDoc(doc(db, collection, id), {
      cart: arrayUnion(argument),
    });
    } catch (e) {
     error = e;
    }
    return { result, error };
  }