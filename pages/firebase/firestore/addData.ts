
import { Firestore, doc, setDoc } from "firebase/firestore";

export default async function addData(db: Firestore, colllection: string, id: string, data: any) {
  let result = null;
  let error = null;

  try {
    result = await setDoc(doc(db, colllection, id), data, {
      merge: true,
    });
  } catch (e) {
    error = e;
  }

  return { result, error };
}