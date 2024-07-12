import { Firestore, doc, deleteDoc  } from "firebase/firestore";

// Adds the string 'argument' to the array 'arrayName" in the document specified by id and collection specified by collection. 
export default async function (db: Firestore, collection: string, id: string) {
    let result = null;
    let error = null;
    try {

      result =  await deleteDoc(doc(db, collection, id));
    }catch (e) {
     error = e;
    }
    return { result, error };
  }