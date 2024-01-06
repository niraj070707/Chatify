import React, { useContext, useRef } from 'react';
import { useState, useEffect } from 'react';
import Avatar from './Avatar';
import Logo from './Logo';
import { UserContext } from './UserContext';
import axios from 'axios';
import Contacts from '../Contacts';

const Chat = () => {
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const selectedUserRef = useRef('');
    const [newMessageText, setNewMessageText] = useState('');
    const [messages, setMessages] = useState([]);
    const [offlineUser, setOfflineUser] = useState({});
    const { id } = useContext(UserContext);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        connectWebSocket();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (selectedUserRef.current) {
            axios.get('/messages/' + selectedUserRef.current).then((res) => {
                setMessages(res.data);
            });
        }
    }, [selectedUserRef.current]);

    useEffect(() => {
        axios.get('/user').then((res) => {
            const users = res.data;
            const idsToRemove = Object.keys(onlinePeople);
            const offlineUserArr = users.filter((user) => user._id != id).filter((user) => !idsToRemove.includes(user._id));
            const offlineUserObj = {};

            offlineUserArr.forEach(user=>{
                offlineUserObj[user._id] = user.username;
            })

            setOfflineUser(offlineUserObj)
        })
    }, [onlinePeople])

    const connectWebSocket = () => {
        const newWs = new WebSocket('ws://localhost:4000');

        newWs.addEventListener('open', () => {
            console.log('WebSocket connected');
            setWs(newWs);
        });

        newWs.addEventListener('message', handleMessage);

        newWs.addEventListener('close', () => {
            console.log('WebSocket closed');
            setWs(null);
            // Reconnect after a delay (e.g., 1 seconds)
            setTimeout(connectWebSocket, 1000);
        });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };

    const showOnlinePeople = (peopleArray) => {
        const people = {};
        peopleArray.forEach(({ userId, username }) => {
            people[userId] = username;
        });
        setOnlinePeople(people);
        console.log(people);
    };

    const handleMessage = (ev) => {
        const messageData = JSON.parse(ev.data);
        if ('online' in messageData) {
            showOnlinePeople(messageData.online);
        } else {
            if (selectedUserRef.current === messageData.sender) {
                setMessages((prev) => [...prev, { ...messageData }]);
                console.log({ messageData });
            }
        }
    };

    const sendMessage = (ev) => {
        ev.preventDefault();
        if (newMessageText.trim() !== '') {
            const message = {
                to: selectedUserRef.current,
                text: newMessageText.trim(),
            };
            try {
                ws.send(JSON.stringify(message));
            } catch (error) {
                console.error('Error while sending message:', error.message);
            }
        }
        setMessages((prev) => [
            ...prev,
            {
                text: newMessageText,
                sender: id,
                recipient: selectedUserRef.current,
                _id: Date.now(),
            },
        ]);
        setNewMessageText('');
    };


    const onlineUserExcludingOurUser = { ...onlinePeople };
    delete onlineUserExcludingOurUser[id];

    const findUniqueObjectsById = (arr) => {
        const uniqueObjects = [];
        const idSet = new Set();

        for (const obj of arr) {
            if (!idSet.has(obj._id)) {
                uniqueObjects.push(obj);
                idSet.add(obj._id);
            }
        }

        return uniqueObjects;
    };

    const uniqueMessage = findUniqueObjectsById(messages);
    console.log(onlineUserExcludingOurUser);
    console.log(offlineUser);
    
    return (
        <div className="flex h-screen">
            <div className="w-1/3">
                <Logo />
                {Object.keys(onlineUserExcludingOurUser).map((userId) => (
                    <Contacts 
                        key={userId}
                        id={userId}
                        selected={selectedUserRef.current===userId}
                        online={true}
                        username={onlineUserExcludingOurUser[userId]}
                        onClick={()=>{
                            selectedUserRef.current = userId;
                            setMessages([]);
                        }}
                    />
                ))}
                {Object.keys(offlineUser).map((userId) => (
                    <Contacts 
                        key={userId}
                        id={userId}
                        selected={selectedUserRef.current===userId}
                        online={false}
                        username={offlineUser[userId]}
                        onClick={()=>{
                            selectedUserRef.current = userId;
                            setMessages([]);
                        }}
                    />
                ))}
            </div>
            <div className="bg-gray-700 w-2/3 flex flex-col">
                <div className="flex-grow bg-gray-800">
                    {selectedUserRef.current === '' && (
                        <div className="text-gray-400 flex h-full justify-center items-center">
                            <div>&larr; Select a person from the sidebar</div>
                        </div>
                    )}
                    {!!selectedUserRef.current && (
                        <div className="relative h-full ">
                            <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2 text-white">
                                {uniqueMessage.map(message => (
                                    <div key={message._id} className={(message.sender === id ? 'text-right' : 'text-left')}>
                                        <div className={"text-left whitespace-normal inline-block p-2 m-2 rounded-md text-sm " + (message.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-500')}>
                                            {message.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef}></div>
                            </div>
                        </div>
                    )}
                </div>


                {!!selectedUserRef.current && (
                    <form className="flex p-2 gap-2" onSubmit={sendMessage}>
                        <input
                            type="text"
                            value={newMessageText}
                            onChange={(ev) => setNewMessageText(ev.target.value)}
                            placeholder="Enter the message"
                            className="flex-grow p-2 rounded-sm border bg-white"
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 p-2 rounded-sm text-white"
                        >
                            Send
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Chat;