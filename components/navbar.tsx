
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from "react";
import classNames from "classnames"
import {motion, useAnimation} from 'framer-motion';
import Footer from "./footer"
import Profile from "./overlays/profile"
import Cart from "./overlays/cart"


const name = 'Rourke'
export const siteTitle = 'Rourke'
interface NavBarProps{
    children?: React.ReactNode,
    reRender?: boolean,
    review?: boolean,
  }

export default function NavBar (props: NavBarProps){
    const router = useRouter();
    const navigate = (str: string) =>{
          if (router.pathname == str){
            return;
          }
            router.push(str);
        }
    return(
    <>
            <Head>
                <link rel="icon" className="rounded-full" href="/images/profile.jpg" />
                <meta
                    name="description"
                    content="Rourke Palmer's website" />
                <meta
                    property="og:image"
                    content={`https://og-image.vercel.app/${encodeURI(
                        siteTitle
                    )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`} />
                <meta name="og:title" content={siteTitle} />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>
            <div className='flex flex-row items-center w-full mt-5 mb-10 pl-2' > 
            <div className='flex flex-row items-center basis-1/12'>
            <svg className='hover:cursor-pointer' onClick={() => navigate("/")} width="41" height="40" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M36.5588 20C36.5588 30.3992 29.1586 38.5 20.4118 38.5C11.6649 38.5 4.26471 30.3992 4.26471 20C4.26471 9.60079 11.6649 1.5 20.4118 1.5C29.1586 1.5 36.5588 9.60079 36.5588 20Z" stroke="#b6ccce" strokeWidth="3"/>
<path d="M16 5.33331L16.5943 7.40626H18.5175L16.9616 8.68742L17.5559 10.7604L16 9.47921L14.4441 10.7604L15.0384 8.68742L13.4825 7.40626H15.4057L16 5.33331Z" fill="#F2C56D"/>
<path d="M8.94119 11.3333L9.53549 13.4063H11.4587L9.90279 14.6874L10.4971 16.7604L8.94119 15.4792L7.38529 16.7604L7.97959 14.6874L6.42368 13.4063H8.34689L8.94119 11.3333Z" fill="#F2C56D"/>
<path d="M16 14L16.5943 16.0729H18.5175L16.9616 17.3541L17.5559 19.4271L16 18.1459L14.4441 19.4271L15.0384 17.3541L13.4825 16.0729H15.4057L16 14Z" fill="#F2C56D"/>
<ellipse cx="26.2941" cy="26.3334" rx="4.11765" ry="5" fill="#983232"/>
<line y1="-0.5" x2="53.8145" y2="-0.5" transform="matrix(0.743294 -0.668965 0.573843 0.818966 1 38)" stroke="#b6ccce"/>
</svg>
            </div>
           
            <div className='basis-2/12'></div>
            <div className='flex flex-row items-center basis-1/2'>
            <a className="basis-1/3 flex flex-col items-center" onClick={() => navigate("/")}> <h1 className={classNames({"bg-[#b6ccce] px-3 rounded-[3px] text-[#151514]": router.asPath == '/'})}>Home</h1></a>
            <a className="basis-1/3 flex flex-col items-center" onClick={() => navigate("/media")}><h1 className={classNames({"bg-[#b6ccce] px-3 rounded-[3px] text-[#151514]": router.asPath == '/media'})}>Media</h1></a>
            <a className="basis-1/3 flex flex-col items-center" onClick={() => navigate("/merch")}><h1 className={classNames({"bg-[#b6ccce] px-3 rounded-[3px] text-[#151514]": router.asPath == '/merch'})}>Store</h1></a>
            </div>
            <div className='basis-1/12'></div>
            <div className='flex flex-row items-center basis-1/6'>
                <div  key={String(props.reRender)} className='hover:cursor-pointer basis-1/2'>
                <Cart review={props.review} />
                </div>
                <div className='hover:cursor-pointer basis-1/2'>
                <Profile/>
                </div>
            </div>
            </div>
           <motion.div className='min-h-screen'
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
            }}
        >
                {props.children}
            </motion.div>
       

         <Footer/></>);
}