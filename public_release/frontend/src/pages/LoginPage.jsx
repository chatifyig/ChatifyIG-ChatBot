import React, { useState,useContext } from 'react';
import {Link, Navigate, useNavigate} from 'react-router-dom'
import axios from 'axios'
import { UserContext } from '../components/UserContext';
import { useCookies } from 'react-cookie';

export default function LoginPage() {

    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [redirect,setRedirect] = useState(false);
    const {setUser} = useContext(UserContext);
    const [btn,setBtn] = useState(false);
    const [cookies, setCookie] = useCookies(['token']);

    async function handleLoginSubmit(ev) {
        ev.preventDefault(); //Stops auto-refresh
        try{
            const response = await axios.post('/login', {email,password}, {withCredentials:true}); //withCred for cookies
            // setUser(data);
            // alert('Login Successful');
            //setBtn(true);
            const { data } = response;
            if (data) {
                
                const receivedToken = data.token;
                //console.log(receivedToken)
                console.log(data.token)
                setCookie('token', receivedToken, { secure: true, sameSite: 'None' });
                alert('Login Successful. Please refresh page if your not logged in automatically.');

                setTimeout(() => {
                    window.location.href = '#/chat';
                    window.location.reload();
                }, 500);
            } else {
                alert('Login Failed: No data received');
            }
        }
        catch (e) {
            if(e.response)
                alert('Login Failed Because: ' + e.response.data.error);
            else
                alert('Login Failed')
        }
        
    };

    if(redirect) {
        return <Navigate to={'/chat'} />
    }


    return (
        <>
        {false ? (<div><button className='primary'>Go To Chat</button></div>) : (
        <div className="mt-4 grow flex items-center justify-around ">
            <div className="mb-50">
            <h1 className="text-4xl">Login</h1>

            <div className="">Use your account to login</div>

            <form className="max-w-md mx-auto" onSubmit={handleLoginSubmit}>
                <input type="email" required={true} placeholder='your@email.com' value={email} onChange={(e) => setEmail(e.target.value)}/>
                <input type="password" required={true} placeholder='password' value={password} onChange={(e) => setPassword(e.target.value)} />
                <button className="primary bg-button hover:bg-boldtext">Login</button>
                <div className="text-center py-2 text-gray-500">
                    Don't have an account let? <Link className="underline text-black" to={'/register'}>Register now</Link>
                </div>
            </form>
            </div>
        </div>)}
        </>

    )


}