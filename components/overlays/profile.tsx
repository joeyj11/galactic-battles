import {motion, useAnimation} from 'framer-motion';
import { useRouter } from 'next/router'
import {getAuth, signOut, User, onAuthStateChanged}  from 'firebase/auth'
import app from "../../pages/firebase/config"
import { useState, useEffect, useRef } from 'react';

const AdminEmail = "wheeler.lucas2002@gmail.com";
const auth = getAuth(app);
export default function profile() {

/**
 * Hook that alerts clicks outside of the passed ref
 */
function useOutsideAlerter(ref: any) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        showLess();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

    const controls = useAnimation()
const controlText = useAnimation()
const controlTitleText = useAnimation()
const nav = useAnimation()
const menuicon = useAnimation()
const router = useRouter();
const loadElements = useAnimation()
const [user, setUser] = useState<User | null>(null);
const divRef = useRef(null);
useOutsideAlerter(divRef);

useEffect( () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
        setUser(user);
    } else {
        setUser(null);
    }
  }
  )
},[]
)

let animationHeight = '20vh';

const showMore = () => {
    nav.start({
      opacity: 0,
      transition:{
      }
    })
    controls.start({
      height: animationHeight,
      transition: { delay: 0.2, duration: 0.2 },
      display:'flex'
    })
    controlText.start({
      opacity: 1,
      display: 'block',
      transition: {delay:0.3}
    })
    controlTitleText.start({
      opacity: 1,
      transition: {delay:0.3}
    })
   
    menuicon.start({
        opacity: 1,
        transition:{
          duration: 0.1, delay: 0.4
        },
        display:'block' 
     
    })

  }

  const showLess = () => {
    controls.start({
      height: '0px',
      transition: { duration: 0.1, delay: 0.1},
      display: 'none'
    })

    controlText.start({
      opacity: 0,
      display: 'none',
    })

    controlTitleText.start({
      opacity: 0,
    })

    nav.start({
      opacity:1,
      transition:{
        duration: .2, delay: .2
      }
    })

    menuicon.start({
        opacity: 0,
        transition: {duration: .1},
        display: 'none'
    })

  }
  const navigate = (str: string) =>{
    console.log("here");
    showLess();
    if (router.pathname == str){
        return;
    }  
    setTimeout(() => {
        router.push(str); }
    , 500);  
    }
  const logout = (e:React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    signOut(auth);
    showLess();
  } 
    return (<div>
           {user ? (<div className='relative ' > <div className='flex flex-col items-center ' ><svg onClick={showMore} ref={divRef} className="basis-1/2" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 16 16"><path fill="#b6ccce"  fillRule="evenodd" d="M8 14.5a6.47 6.47 0 0 0 3.25-.87V11.5A2.25 2.25 0 0 0 9 9.25H7a2.25 2.25 0 0 0-2.25 2.25v2.13A6.47 6.47 0 0 0 8 14.5Zm4.75-3v.937a6.5 6.5 0 1 0-9.5 0V11.5a3.752 3.752 0 0 1 2.486-3.532a3 3 0 1 1 4.528 0A3.752 3.752 0 0 1 12.75 11.5ZM8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16ZM9.5 6a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0Z" clipRule="evenodd"/> </svg>
      <motion.div animate = {menuicon} className="w-0 h-0 opacity-0 hidden absolute -bottom-[14px]
  border-l-[10px] border-l-transparent
  border-b-[15px] border-b-[#6a6a6a]
  border-r-[10px] border-r-transparent ">
</motion.div></div>
        <motion.div animate={controls}  className='animate duration-300 bg-[#6a6a6a] hidden flex-col z-40 w-[10vw] min-w-[200px] h-0 drop-shadow-xl absolute right-3 mt-[14px]'>

         <motion.div className='grow opacity-0 ml-1'  onMouseLeave={showLess} animate={menuicon}>
          <a>
<h1 className='p-2 mt-4  xl:text-xl ' onPointerDown={(e) => { e.stopPropagation(); navigate("/profile")}}> profile information </h1>
</a>
<a>
   <h1  className='p-2 mt-4   xl:text-xl ' onPointerDown={(e) => { e.stopPropagation(); navigate("/orderHistory")}}> order history </h1>
   </a>
   <a>
   <h1  className=' p-2 mt-4  xl:text-xl ' onPointerDown={logout}> logout </h1> 
   </a>
</motion.div>
        </motion.div></div>) : <button className='basis-1/2 w-2/3  flex items-center justify-center' onClick={()=> navigate('/signIn')}>  Login </button>}
</div>);
}
