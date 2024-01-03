import React, { useContext } from 'react'
import { useState } from 'react';
import { useEffect } from 'react'
import Avatar from './Avatar';
import Logo from './Logo';
import { UserContext } from './UserContext';

const Chat = () => {
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [selectedUser, setSelectedUser] = useState('');

    const {username, id} = useContext(UserContext);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:4000');
        setWs(ws);
        ws.addEventListener('message', handleMessage);
    }, []);

    function showOnlinePeople(peopleArray) {
        const people = {};
        peopleArray.forEach(({ userId, username }) => {
            people[userId] = username;
        });
        setOnlinePeople(people);
        // console.log(people);
    }
    function handleMessage(ev) {
        const messagedata = JSON.parse(ev.data);
        // console.log(messagedata);
        if ('online' in messagedata) {
            showOnlinePeople(messagedata.online);
        }
    }

    console.log(selectedUser);

    const onlineUserExcludinOurUser= {...onlinePeople};
    delete onlineUserExcludinOurUser[id];

    return (
        <div className='flex h-screen'>
            <div className='w-1/3'>
                <Logo/>
                {Object.keys(onlineUserExcludinOurUser).map((userId) => (
                    <div key={userId} onClick={()=>{setSelectedUser(userId)}} 
                         className={' border-b border-gray-300  flex items-center gap-2 cursor-pointer ' + (userId===selectedUser ? 'bg-gray-200' : '')}>

                        {userId===selectedUser && (
                            <div className='w-1 h-12 bg-blue-500 rounded-r-md'></div>
                        )}
                        <div className='flex gap-2 py-2 pl-2'>
                            <Avatar userId={userId} username={onlinePeople[userId]}/>
                            <span className='text-gray-800'>{onlinePeople[userId]}</span>
                        </div>    
                    </div>
                ))}
            </div>
            <div className='bg-blue-200 w-2/3 flex flex-col'>
                <div className='flex-grow'>
                    {selectedUser==='' && (
                        <div className='text-gray-400 flex h-full justify-center items-center'>
                            <div>&larr; Select a person from the sidebar</div>
                        </div>
                    )}
                </div>
                <div className='flex p-2 gap-2'>
                    <input type="text" placeholder='Enter the message' className='flex-grow p-1' />
                    <button className='bg-blue-500 p-2 rounded-sm text-white'>
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Chat