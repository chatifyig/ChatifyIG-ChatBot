import React, { useState, useContext, useEffect } from 'react';
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { UserContext } from '../components/UserContext';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
  Avatar,
  TypingIndicator
} from "@chatscope/chat-ui-kit-react";

import axios from 'axios'
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function ChatPage() {

    const [chat,setChat] = useState([]);
    const [sessionID,setSessionID] = useState(null);
    const [showTyping,setShowTyping] = useState(false);
    const {user, ready} = useContext(UserContext);
    const [thinking,setThinking] = useState(false);
    const [questions,setQuestions] = useState(0);

    const nav = useNavigate();

    //Page timer
    const [startTime, setStartTime] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0);

    //UseEffect to get sessionID
    useEffect(() => {
        //Get session id

        const fetchData = async () => {
            try {
              // On page load, try to get a session id
              const response = await axios.get('/get_session_id');
              // Handle the response here
              setSessionID(response.data.sessionid);
            } catch (error) {
              // Handle errors if the request fails
              console.error('Error fetching session ID:', error);
            }
          };
          
          // Call the async function
          fetchData();
    }, []);

    async function sendChatMessage(prompt,sessionID) {
        try {
            
            const response = await axios.post('/send_chat_message',{
                prompt: prompt
            }, {headers: {
                'Content-Type': 'application/json',
                'Session-Id': sessionID,
            }});
            return response.data;
        } catch (error) {
            console.error('Error sending chat message:', error);
            throw error;
        }
    }

    //Gets triggered after user sends message
    async function sendMessage(e) {
        //Allow msgs only to be sent when not already responding.
        if(!showTyping) {

            
            //Add user's message to chat
            // 1 is outgoing
            const userMessage = {
                    message: e,
                    sender: user.firstName,
                    direction: 1
                }
            setChat(chat => [...chat, userMessage]);
            setQuestions(questions => questions + 1)
            // //Send message to server
            // let rez = sendChatMessage(e,sessionID)
            
            // //Get response & create chat message
            // const sysMessage = {
            //     message: rez.body,
            //     sender: 'CDISC Bot',
            //     direction: 0
            // }


            // //Put response in chat state
            // setChat(chat => [...chat, sysMessage]);


            try {
                //Show typing indicator
                setShowTyping(true);
                // Send message to server
                const rez = await sendChatMessage(e, sessionID);
                //console.log(rez);
                // Get response & create chat message
                const sysMessage = {
                message: rez.body,
                sender: 'CDISC Bot',
                direction: 0
                };
            
                // Put response in chat state
                setChat(chat => [...chat, sysMessage]);
                setShowTyping(false);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
        else {
            alert('The bot is currently getting an answer. Please wait a moment to ask the next question.')
        }
    }

    async function endSession() {
        //Log time spent
        try {
            if(questions > 0){
                const response = await axios.post('/delete_session',{
                    timeSpent: timeElapsed,
                    questionsAsked: questions
                },{headers: {
                    'Content-Type': 'application/json',
                    'Session-Id': sessionID,
                }},{
                    withCredentials: true
                })

                if(response.status === 200){
                    alert('Successfully closed session. To start a new chat press the white box with your name.');
                    nav('/');
                }
                else {
                    alert('Unable to closed session. Please close the tab to exit.');
                }
            }
            else{
                alert('Successfully closed session. To start a new chat press the white box with your name.');
                nav('/');
            }
            
        } catch (e) {
            console.error('Error sending chat message:', error);
            throw error;
        }
    }
    
    //Timer Use Effect
    useEffect(() => {
        const initialStartTime = window.performance.timing.navigationStart;

        setStartTime(initialStartTime);

        const interval = setInterval(() => {
        const elapsed = Date.now() - initialStartTime;
        setTimeElapsed(elapsed);
        
        }, 1000); // Update time every second

        return () => clearInterval(interval); // Clear interval on component unmount

    }, []);


    return (
        <>
        {ready ? 
        (sessionID ? (<div className="">
            <div>
                <div className='flex justify-end w-full mt-2 px-10'>
                    <button className='p-2 bg-blue-600 text-white rounded-md' onClick={endSession}>End Session</button>
                </div>
            </div>
            <div className="h-screen grow p-10">
                <MainContainer className='rounded-xl'>
                    <ChatContainer>
                        <ConversationHeader>
                            <Avatar src='/assets/bot.png' />
                            <ConversationHeader.Content userName='CDISC Chatbot' info={showTyping ? ('Retrieving answer...') : ('Available')}></ConversationHeader.Content>
                        </ConversationHeader>
                        <MessageList>
                            <Message model={{
                                message: 'Hi, I am a chatbot trained on the CDISC documentation. Feel free to ask me any questions.',
                                sender: 'CDISC Bot',
                                direction: 0
                                }} />
                            {
                                chat.map((msg, index) => {
                                    return (
                                        <Message key={index} model={msg} />
                                    )
                                })
                            }
                            {/* {
                                showTyping && <TypingIndicator className='absolute bottom-0' content="I am retrieving the answer.." />
                                
                            } */}
                        </MessageList>
                        
                        <MessageInput attachButton={false} placeholder='Type your question here' onSend={sendMessage}></MessageInput>
                    </ChatContainer>
                </MainContainer>
            </div>
        </div>) : (<div>Hold on a sec.. Connecting to the server.</div>)) : (<div className='text-3xl text-center'><Link to={'/login'}>Please login in to access the chat.</Link></div>)}

        
        </>
    )


}