import { UserContext } from '../components/UserContext';
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios'
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {

    const {user, ready} = useContext(UserContext);
    const [verified,setVerified] = useState(false);
    const [avgs,setAvgs] = useState({'questions':0,'time':'0 seconds'});
    const [tableData,setTableData] = useState([]);

    useEffect(() => {
        const fetchdata = async () => {
            try{
                const response = await axios.get('/get_avgs')
                if (response.status == 200) {
                    setVerified(true);
                    setAvgs(response.data)
                }
            }
            catch(e){
                if(e.response)
                    alert('Cookie Authentication Failed: ' + e.response.data.error);
                else
                    alert('Cookie Authentication Failed')
            }
        }
        fetchdata();
        
    }, []);

    async function getTableData(ev) {
        ev.preventDefault();
        const date_start = ev.target['0'].value
        const date_end = ev.target['1'].value
        
        try{
            const response = await axios.post('/get_date_data',{
                'startDate': date_start,
                'endDate': date_end
            },{
                withCredentials: true
            })
            if (response.status == 200) {

                setTableData(JSON.parse(response.data.body))


            }
        }
        catch(e){
            if(e.response)
                alert('Cookie Authentication Failed: ' + e.response.data.error);
            else
                alert('Cookie Authentication Failed')
        }

        
    }


    return (
        ready ? 
            (verified ? (

        <div className="">
            <div className="p-10">
                <div className="bg-gray-200 rounded-md p-5 mt-4">
                    <div className="">Avg Questions Asked Per User:</div>
                    <div className="text-bold text-2xl">{avgs.questions} questions</div>
                </div>

                <div className="bg-gray-200 rounded-md p-5 mt-4">
                    <div className="">Avg Time Spent Per User:</div>
                    <div className="text-bold text-2xl">{avgs.time}</div>
                </div>

                <div className="bg-gray-200 rounded-md p-5 mt-4">
                    <div className="">Get Data By Month:</div>
                    <div className="border border-black rounded-md p-4 inline-block gap-5">
                        <form onSubmit={getTableData}>
                        <label htmlFor="">Date From: </label>
                        <input required={true} type='date'></input>
                        <label htmlFor="">Date To: </label>
                        <input required={true} type='date'></input>
                        <button className='bg-button text-white p-5 rounded-2xl mx-4'>Get Data</button>
                        </form>

                        <table className="table-auto w-full">
                        <thead>
                            <tr>
                            <th className="px-4 py-2 bg-gray-200">Session ID</th>
                            <th className="px-4 py-2 bg-gray-200">Questions Asked</th>
                            <th className="px-4 py-2 bg-gray-200">Time Spent in Minutes</th>
                            <th className="px-4 py-2 bg-gray-200">Date</th>
                            </tr>
                        </thead>
                        <tbody id="data-table-body">
                            {tableData?.map((obj, index) => (
                                <tr key={index} className="border-b border-gray-200">
                                    <td className="px-4 py-2">{obj.session_id}</td>
                                    <td className="px-4 py-2">{obj.questions_asked}</td>
                                    <td className="px-4 py-2">{Math.round(obj.time_spent / 1000 / 60)}</td>
                                    <td className="px-4 py-2">{obj.date}</td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="">

            </div>
        </div>) : (<div>Sir you aint verified</div>)) : (<div className='text-3xl text-center'><Link to={'/login'}>Please login in to access the chat.</Link></div>)
    )
}