import { NextRouter, useRouter } from 'next/router'


export const navigate = (str: string, router:NextRouter) =>{
        if (router.pathname == str){
          return;
        }
          router.push(str);
    }