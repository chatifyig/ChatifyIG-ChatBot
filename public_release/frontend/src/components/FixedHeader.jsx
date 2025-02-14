import {React, useContext, useState} from 'react'
import {Link, Navigate, useNavigate} from "react-router-dom"
import { UserContext } from './UserContext'
import axios from 'axios';
import { useCookies } from 'react-cookie';


export default function FixedHeader() {
    //const {user} = useContext(UserContext);
    const {user, ready} = useContext(UserContext);
    const {setUser} = useContext(UserContext);
    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies(['token']);
    
    
    async function triggerLogout(ev) {
        ev.preventDefault(); //Stops auto-refresh
        try{
            axios.post('/logout').then((data) => {
                setUser(null);
                setCookie('token', '', { secure: true, sameSite: 'None' });
                alert('Logout Successful');
            })
            // const respone = await axios.post('/logout');
            // setUser(null);
            // alert('Log Out Successful')


        }
        catch(e){
            if(e.response)
                    alert('Logout Failed: ' + e.response.data.error);
            else
                alert('Logout Failed')
        }

    }

    function triggerSignUp() {
        navigate('/register');
    }

    return (
        <header className='flex justify-between px-2 py-4 '>
            <Link to={'/'} className="flex items-center gap-1">
                    <img className="w-16 h-16 rounded-md object-cover" src="/assets/bot.png"></img>
                    <span className="font-bold text-xl">CDISC Chatbot</span>
            </Link>

            
            <div className='py-2 px-4 font-bold'>Chat with implementation guides and TAUGs</div>

            <div className="flex gap-4">
                <Link to={!!user ? "/chat" : "/login"} className='flex items-center gap-2 border border-gray-200 rounded-full py-2 px-4 shadow-md'>
                    {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg> */}
                    
                    {!!user && user.firstName ? ( //double exclamation to check bool
                        <div>
                            {user.firstName}
                        </div>
                    ) : (<div>Login</div>)}

                    

                </Link>
                {
                    !!user ? (<button className='p-2 rounded-md bg-button text-white hover:bg-boldtext' onClick={triggerLogout}>Logout</button>) : (<button className='p-2 rounded-md bg-button text-white hover:bg-boldtext' onClick={triggerSignUp}>Get Started</button>)
                }
                
            </div>
            

            
            
            
            
        </header>
    )
}
