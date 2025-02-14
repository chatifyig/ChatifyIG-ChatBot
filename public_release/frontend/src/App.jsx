import { useState } from 'react'
import './App.css'
import {Route, Routes, BrowserRouter} from "react-router-dom"
import Layout from './Layout'
import ChatPage from './pages/ChatPage'
import LoginPage from './pages/LoginPage'
import IndexPage from './pages/IndexPage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'
import axios from 'axios'
import { UserContextProvider } from './components/UserContext'

axios.defaults.baseURL = "INSERT_BASE_URL_HERE";
axios.defaults.withCredentials = true;


function App() {
  
  return (
   <UserContextProvider>
    <Routes>
        <Route path="/" element={<Layout/>}>
          <Route index element={<IndexPage/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/chat" element={<ChatPage/>} />
          <Route path="/register" element={<RegisterPage/>} />
          <Route path="/admin" element={<AdminPage/>}/>
        </Route>
    </Routes>
   </UserContextProvider>
  )
}

export default App
