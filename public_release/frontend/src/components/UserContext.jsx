import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useCookies } from 'react-cookie';

export const UserContext = createContext({});

export function UserContextProvider({children}){

    const [user,setUser] = useState(null);
    const [ready,setReady] = useState(false);
    const [cookies] = useCookies(['token']);
    //console.log(cookies)
    // console.log(cookies.token) cookies.token && cookies.token!='' &&
    useEffect(() => {
        if(!user && cookies.token){
            console.log('Sending profile request')
            try {
                axios.get('/profile', { headers: { Authorization: `Bearer ${cookies.token}` } }).then(({ data }) => {
                    setUser(data);
                    setReady(true);
                  });
            }
            catch(e){
                if(e.response)
                    alert('Cookie Authentication Failed: ' + e.response.data.error);
                else
                    alert('Cookie Authentication Failed')
            }
            
        }
    }, [user]);

    return(<UserContext.Provider value={{user,setUser,ready}}>{children}</UserContext.Provider>);
}