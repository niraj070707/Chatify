import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react'

const Chat = () => {
    const [ws, setWs] = useState(null);
    useEffect(()=>{
        const ws = new WebSocket('ws://localhost:4000');
        setWs(ws);
    },[]);

    return (
    <div className='flex h-screen'>
        <div className='bg-blue-100 w-1/3'>Contacts</div>
        <div className='bg-blue-200 w-2/3 flex flex-col'>
            <div className='flex-grow'>
                chats
            </div>
            <div className='flex p-2 gap-2'>
                <input type="text" placeholder='Enter the message' className='flex-grow p-1'/>
                <button className='bg-blue-500 p-2 rounded-sm text-white'>
                    Send
                </button>
            </div>
        </div>
    </div>
  )
}

export default Chat