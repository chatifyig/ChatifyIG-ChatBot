import React, { useState } from 'react';
import {Link, Navigate} from 'react-router-dom'
import axios from 'axios'

export default function RegisterPage() {
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [firstname,setFirstName] = useState('');
    const [lastname,setLastName] = useState('');
    const [redirect,setRedirect] = useState(false);

    async function registerUser(ev) {
        ev.preventDefault();
        try {
            await axios.post('/register', {
                'firstName':firstname,
                'lastName':lastname,
                'email':email,
                'password':password
            },{
                withCredentials: true
            }); //bc baseURL is set on main page
            alert('Registration Successful. Now please login.');
            //setRedirect(true);
        }
        catch(e) {
            console.log(e)
            if (e.response) {
                // The request was made and the server responded with a status code
                // Display the error message from the server response
                alert('Registration failed because: ' + e.response.data.error);
            } else {
                // The request was made but no response was received
                alert('Registration failed');
            } 
        }
        
    }

    if(redirect) {
        return <Navigate to={'/login'} />
    }

    return (
        <div className="mt-4 grow flex items-center justify-around">
            <div className="mb-50">
                <h1 className="text-4xl">Register</h1>

                <div className="my-3">Get access today!</div>

                <form className="max-w-md mx-auto" onSubmit={registerUser}>
                    <input type="text" placeholder='First Name' required={true} value={firstname} onChange={(e) => setFirstName(e.target.value)}/>
                    <input type="text" placeholder='Last Name' required={true} value={lastname} onChange={(e) => setLastName(e.target.value)}/>
                    <input type="email" placeholder='your@email.com' required={true} value={email} onChange={(e) => setEmail(e.target.value)}/>
                    <input type="password" placeholder='password' required={true} value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button className="primary bg-button hover:bg-boldtext">Create Your Account</button>
                    <div className="text-center py-2 text-gray-500">
                        Already have an account? <Link className="underline text-black" to={'/login'}>Login now</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
