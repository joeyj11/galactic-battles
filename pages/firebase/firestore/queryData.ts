import { collection, FieldPath, Firestore, getDocs, query, where, WhereFilterOp, QuerySnapshot, DocumentData} from "firebase/firestore";
//returns a query snapshot object. Takes the database, collection, field to query on, a filter operation, and the value to compare stored value to
export default async function queryData(db: Firestore, col: string,  documentValue: string, operator: WhereFilterOp, comparisonValue: any ) {
    let result: Array<any> = [];
    const q = query(collection(db, col), where( documentValue, operator,  comparisonValue));
    try{const querySnapshot= await getDocs(q);
      querySnapshot.forEach((item:DocumentData) =>{
        let temp = item.data();
        result.push(temp);
      });
    } catch(e) {
        console.log(e);
    }
    return result;
}
