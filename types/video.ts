export interface video {
    name: string,
    coverImagePath: string, 
    trailerPath: string,
    videoPath:string,
    live: boolean, 
    price: number,
    description: string,
    show: string,
    season: number, 
    episode: number,
  }
  export function isVideoItem (obj: any): obj is video {
    return (typeof obj.episode === "number" && typeof obj.season === "number" && typeof obj.show === "string" && typeof obj.name === "string" && typeof obj.coverImagePath === "string" && typeof obj.trailerPath === "string" && typeof obj.live === "boolean"  && typeof obj.videoPath === "string" && typeof obj.price === "number" && typeof obj.description=== "string")
} 

export function isVideoArray(obj: any[]): obj is video[] {
    for (let i = 0; i < obj.length; i ++){
      if(typeof obj[i].episode != "number" || typeof obj[i].season != "number" || typeof obj[i].show != "string" || typeof obj[i].name != "string" || typeof obj[i].coverImagePath != "string" || typeof obj[i].trailerPath != "object" || typeof obj[i].live != "boolean"  || typeof obj[i].videoPath != "string" || typeof obj[i].price != "number" || typeof obj[i].description != "string"){
        return false 
      }
    }
    return true;
  }
