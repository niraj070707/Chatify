import React, { useContext, useRef } from 'react'
import { useState } from 'react';
import { useEffect } from 'react'
import Avatar from './Avatar';
import Logo from './Logo';
import { UserContext } from './UserContext';

const Chat = () => {
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [selectedUser, setSelectedUser] = useState('');
    const [newMessageText, setnewMessageText] = useState('');
    const [messages, setMessages] = useState([]);
    const { username, id } = useContext(UserContext);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:4000');
        setWs(ws);
        ws.addEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' , block: 'end'});
    }

    function showOnlinePeople(peopleArray) {
        const people = {};
        peopleArray.forEach(({ userId, username }) => {
            people[userId] = username;
        });
        setOnlinePeople(people);
        // console.log(people);
    }

    function handleMessage(ev) {
        const messageData = JSON.parse(ev.data);
        if ('online' in messageData) {
            showOnlinePeople(messageData.online);
        } else {
            // console.log('k '+ selectedUser);
            // console.log(messageData.sender);
            // if(selectedUser===messageData.sender){
            setMessages(prev => ([...prev, { ...messageData }]))
            console.log({ messageData });
            // }
        }
    }
    // console.log('i ' + selectedUser);

    function sendMessage(ev) {
        ev.preventDefault();
        if (newMessageText.trim() !== '') {
            const message = {
                to: selectedUser,
                text: newMessageText.trim(),
            };
            try {
                ws.send(JSON.stringify(message));
            } catch (error) {
                console.error('Error while sending message:', error.message);
            }
        }
        setMessages(prev => [...prev, {
            text: newMessageText,
            sender: id,
            recipient: selectedUser,
            _id: Date.now(),
        }])
        setnewMessageText('');
    }

    // console.log(newMessageText);
    const onlineUserExcludinOurUser = { ...onlinePeople };
    delete onlineUserExcludinOurUser[id];

    function findUniqueObjectsById(arr) {
        const uniqueObjects = [];
        const idSet = new Set();

        for (const obj of arr) {
            if (!idSet.has(obj._id)) {
                // If the id is not in the set, add the object to the result array
                uniqueObjects.push(obj);
                idSet.add(obj._id);
            }
        }

        return uniqueObjects;
    }

    const uniqueMessage = findUniqueObjectsById(messages);
    console.log(uniqueMessage);

    return (
        <div className='flex h-screen'>
            <div className='w-1/3'>
                <Logo />
                {Object.keys(onlineUserExcludinOurUser).map((userId) => (
                    <div key={userId} onClick={() => { setSelectedUser(userId) }}
                        className={' border-b border-gray-300  flex items-center gap-2 cursor-pointer ' + (userId === selectedUser ? 'bg-gray-200' : '')}>

                        {userId === selectedUser && (
                            <div className='w-1 h-12 bg-blue-500 rounded-r-md'></div>
                        )}
                        <div className='flex gap-2 py-2 pl-2'>
                            <Avatar userId={userId} username={onlinePeople[userId]} />
                            <span className='text-gray-800'>{onlinePeople[userId]}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className='bg-blue-200 w-2/3 flex flex-col'>
                <div className='flex-grow overflow-y-scroll '>
                    {selectedUser === '' && (
                        <div className='text-gray-400 flex h-full justify-center items-center'>
                            <div>&larr; Select a person from the sidebar</div>
                        </div>
                    )}
                    {!!selectedUser && (
                        <div>
                            {uniqueMessage.map(message => (
                                <div className={(message.sender === id ? ' text-right' : ' text-left')}>
                                    <div className={"text-left inline-block p-2 m-3 my-4 text-sm rounded-md " + (message.sender === id ? ' text-white bg-blue-400' : ' text-gray-700 bg-white')}>
                                        sender : {message.sender} <br />
                                        my id : {id} <br />
                                        {message.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef}></div>
                        </div>
                    )}

                </div>

                {!!selectedUser && (
                    <form className='flex p-2 gap-2' onSubmit={sendMessage}>
                        <input type="text"
                            value={newMessageText}
                            onChange={ev => setnewMessageText(ev.target.value)}
                            placeholder='Enter the message'
                            className='flex-grow p-2 rounded-sm border bg-white' />
                        <button type='submit'
                            className='bg-blue-500 p-2 rounded-sm text-white'>
                            Send
                        </button>
                    </form>
                )}

            </div>
        </div>
    )
}

export default Chat