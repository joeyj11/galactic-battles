import Router from "next/router";
export default function footer(){
    var tikTokName = "";
    var instagramName = "";
return (
<div className='overflow-hidden mt-5 mx-8 mb-5'><div className='flex flex-row items-center pt-2'>
<div className='flex flex-col items-center basis-1/3 self-start'>
        <div className='flex flex-col items-start '>
    <h1 className='text-center  pb-6  font-roboto font-[300] lg:font-[400]' style={{fontStyle: "normal" }}>Contact</h1>
    <div className='flex flex-row items-center '>
        <a>
<p className='py-2'> Email me</p>
</a>
    </div>
    <div className='flex flex-row start py-2'>
        <a>
   <p className=''> Use This Form</p>
   </a>
    </div>
    <div className='flex flex-row start py-2'>
        <a>
   <p className=''> Say Hey on Here</p>
   </a>
    </div>
    </div>
    </div>
    <div className='flex flex-col items-center basis-1/3 self-start'>
        <div className='flex flex-col items-start '>
    <h1 className='text-center  pb-6  font-roboto font-[300] lg:font-[400]' style={{fontStyle: "normal" }}>Social Media</h1>
    <a className='flex flex-row items-center ' href="https://www.instagram.com/rourkepalmer/?igshid=MzMyNGUyNmU2YQ%3D%3D">
    <img className="h-[18px] w-[18px]" src="instagram.png"/>
<p className=' pl-2 py-2'> Instagram</p>
    </a>
    <a className='flex flex-row start py-2' href="https://twitter.com/">
<svg version="1.1" id="Logo" xmlns="http://www.w3.org/2000/svg" 
	 viewBox="0 0 248 204" height="18" width="18" className="h-[18px] w-[18px]">
<g id="Logo_1_">
	<path fill="#1D9BF0" id="white_background" d="M221.95,51.29c0.15,2.17,0.15,4.34,0.15,6.53c0,66.73-50.8,143.69-143.69,143.69v-0.04
		C50.97,201.51,24.1,193.65,1,178.83c3.99,0.48,8,0.72,12.02,0.73c22.74,0.02,44.83-7.61,62.72-21.66
		c-21.61-0.41-40.56-14.5-47.18-35.07c7.57,1.46,15.37,1.16,22.8-0.87C27.8,117.2,10.85,96.5,10.85,72.46c0-0.22,0-0.43,0-0.64
		c7.02,3.91,14.88,6.08,22.92,6.32C11.58,63.31,4.74,33.79,18.14,10.71c25.64,31.55,63.47,50.73,104.08,52.76
		c-4.07-17.54,1.49-35.92,14.61-48.25c20.34-19.12,52.33-18.14,71.45,2.19c11.31-2.23,22.15-6.38,32.07-12.26
		c-3.77,11.69-11.66,21.62-22.2,27.93c10.01-1.18,19.79-3.86,29-7.95C240.37,35.29,231.83,44.14,221.95,51.29z"/>
</g>
</svg>

   <p className=' pl-2'> Twitter</p>
    </a>
    <a className='flex flex-row start py-2' href="https://www.tiktok.com/">
        <img className="h-[18px] w-[18px]" src="tiktok.png"/>
   <p className=' pl-2' > TikTok</p>
    </a>
    </div>
    </div>
    <div className='flex flex-col items-center basis-1/3 self-start'>
        <div className='flex flex-col items-start '>
    <h1 className='text-center  pb-6  font-roboto font-[300] lg:font-[400]' style={{fontStyle: "normal" }}>Legal information</h1>
    <div className='flex flex-row items-center'>
        <a>
<p className='py-2' onClick={ () => Router.push('/blank')}> Privacy Policy </p>
</a>
    </div>
    <div className='flex flex-row start py-2'>
        <a>
   <p className=''  onClick={ () => Router.push('/blank')}> Legal </p>
   </a>
    </div>
    </div>
    </div>
    </div>
</div>)
}