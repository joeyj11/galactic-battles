export interface merch {
    name: string,
    coverImagePath: string, 
    imagePaths: string[],
    live: boolean, 
    price: number,
    description: string,
    quantity: number,
    id: string,
  }
  export function isMerchItem (obj: any): obj is merch {
    return (typeof obj.id === "string" && typeof obj.name === "string" && typeof obj.coverImagePath === "string" && typeof obj.imagePaths === "object" && typeof obj.live === "boolean"  && typeof obj.price === "number" && typeof obj.description=== "string" && typeof obj.quantity === "number")
} 

export function isMerchArray(obj: any[]): obj is merch[] {
    for (let i = 0; i < obj.length; i ++){
      if(typeof obj[i].id != "string" || typeof obj[i].name != "string" || typeof obj[i].coverImagePath != "string" || typeof obj[i].imagePaths != "object" || typeof obj[i].live != "boolean"  || typeof obj[i].price != "number" || typeof obj[i].description != "string"  && typeof obj[i].quantity === "number"){
        return false 
      }
    }
    return true;
  }

