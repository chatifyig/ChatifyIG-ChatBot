import {useEffect, useState} from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function IndexPage() {
    const nav = useNavigate();

    function redirectFunc() {
        nav('/chat');
    }

    return (
        <div className='flex flex-col items-center justify-center grow  min-h-screen bg-gradient-to-br from-blue-200 via-sky-100 to-white backdrop-filter backdrop-blur-lg'>
            <div className='grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-3 mt-10'>
                <div className='flex gap-2 border text-center items-center justify-center border-gray-200 bg-slate-50 shadow-md rounded-lg py-2 px-28 text-lg'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <div>Time Efficiency</div>
                </div>
                <div className='flex w-full gap-2 border text-center items-center justify-center  border-gray-200 bg-slate-50 shadow-md rounded-lg p-2 text-lg'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                    </svg>
                    <div>Instant Guidance</div>
                </div>
                <div className='flex w-full gap-2 border text-center items-center justify-center  border-gray-200 bg-slate-50 shadow-md rounded-lg p-2 text-lg'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    <div>Error Reduction</div>
                </div>
                <div className='flex w-full gap-2 border text-center items-center justify-center border-gray-200 bg-slate-50 shadow-md rounded-lg p-2 text-lg'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>

                    <div>Knowledge Boost</div>
                </div>
            </div>
            <div className='mt-5 border border-gray-200 bg-white-200 shadow-md rounded-lg p-2 text-sm'>ChatifyIG is now available in <span className='text-boldtext'>beta!</span></div>
            <div className="text-5xl text-center font-bold mt-4">Your Ultimate <span className='text-boldtext'> CDISC Chatbot</span></div>
            
            <div className="text-md text-subtext text-center my-4">Answer any questions regarding the CDISC IG's and TAUG's</div>

            <button className='p-5 rounded-md bg-button text-white hover:bg-boldtext' onClick={redirectFunc}>Get Started</button>

            <div className="flex flex-col md:flex-row gap-3 items-stretch mt-12 px-24">
                <div className="block p-4 text-center justify-center items-center">
                    <div className='font-bold text-xl mb-2 md:text-2xl'>Step 1</div>
                    <div className='font-bold md:text-lg'>Sign up for an account</div>
                    <div className='text-sm md:text-base text-center'>Easy to sign up for your account with just a few simple steps<p>  </p></div>
                </div>
                <div className="block p-4 text-center justify-center items-center">
                    <div className='font-bold text-xl mb-2 md:text-2xl'>Step 2</div>
                    <div className='font-bold md:text-lg'>Start asking questions</div>
                    <div className='text-sm md:text-base text-center'>It's that simple. Try out ChatifyIG today - it really takes less than a minute.</div>
                </div>
                <div className="block p-4 text-center justify-center items-center">
                    <div className='font-bold text-xl mb-2 md:text-2xl'>Step 3</div>
                    <div className='font-bold md:text-lg'>Increase efficiency</div>
                    <div className='text-sm md:text-base text-center'>Reduce the amount of time spent reading through multiple IG's and TAUG's</div>
                </div>
            </div>



            <div className="mt-10 flex justify-center rounded-lg">
                    {/*<img className="w-1/2 rounded-lg" src="/assets/sample.png"></img>*/}
                    <div className='sm:px-20 md:px-40 lg:px-60'>
                        <h1 className='text-4xl text-center font-bold mt-4'>FAQs</h1>
                        
                        <div className="grid gap-5 grid-cols-2">
                            <div className='bg-slate-100 rounded-3xl p-5 mt-4'>
                                <div className='text-boldtext mb-2'>Is ChatifyIG free to use?</div>
                                <div className='text-subtext'>Yes, Its as simple as signing up for ChatifyIG and using the chatbot.</div>
                            </div>

                            <div className='bg-slate-100 rounded-3xl p-5 mt-4'>
                                <div className='text-boldtext mb-2'>Where are the IG's and TAUG's stored?</div>
                                <div className='text-subtext'>We store all files in encrypted cloud storage to ensure their security. Our strict security protocols guarantee the utmost safety for the information and protect it from potential threats.</div>
                            </div>

                            <div className='bg-slate-100 rounded-3xl p-5 mt-4'>
                                <div className='text-boldtext mb-2'>Can I search across multiple IG's and TAUG's?</div>
                                <div className='text-subtext'>Yes, of course! Uploaded within our chatbot are all IG's and TAUG's and you can chat with them all at once. Get summarized answers from multiple files, and easily receive summarized responses to your questions.</div>
                            </div>

                            <div className='bg-slate-100 rounded-3xl p-5 mt-4'>
                                <div className='text-boldtext mb-2'>What new features are coming?</div>
                                <div className='text-subtext'>We are working on many features, such as citations, keeping documents updated on a regular basis and many more.</div>
                            </div>
                        </div>

                        <div className="text-center mt-8 mb-4">If you have any other suggestions, please email us at <Link to={"mailto:chatifyIG@gmail.com"}><span className='text-gray-600'>ChatifyIG@gmail.com</span></Link></div>

                       
                    </div>
                </div>
        </div>
    )


}