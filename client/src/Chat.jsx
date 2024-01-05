import React, { useContext, useRef } from 'react';
import { useState, useEffect } from 'react';
import Avatar from './Avatar';
import Logo from './Logo';
import { UserContext } from './UserContext';
import axios from 'axios';

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const selectedUserRef = useRef('');
  const [newMessageText, setNewMessageText] = useState('');
  const [messages, setMessages] = useState([]);
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
      // Reconnect after a delay (e.g., 5 seconds)
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
  console.log(uniqueMessage);

  return (
    <div className="flex h-screen">
      <div className="w-1/3">
        <Logo />
        {Object.keys(onlineUserExcludingOurUser).map((userId) => (
          <div
            key={userId}
            onClick={() => {
              selectedUserRef.current = userId;
              setMessages([]); // Clear previous messages when selecting a new user
            }}
            className={
              ' border-b border-gray-300  flex items-center gap-2 cursor-pointer ' +
              (userId === selectedUserRef.current ? 'bg-gray-200' : '')
            }
          >
            {userId === selectedUserRef.current && (
              <div className="w-1 h-12 bg-blue-500 rounded-r-md"></div>
            )}
            <div className="flex gap-2 py-2 pl-2">
              <Avatar online={true} userId={userId} username={onlinePeople[userId]} />
              <span className="text-gray-800">{onlinePeople[userId]}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gray-700 w-2/3 flex flex-col">
        <div className="flex-grow bg-gray-800 overflow-y-scroll">
          {selectedUserRef.current === '' && (
            <div className="text-gray-400 flex h-full justify-center items-center">
              <div>&larr; Select a person from the sidebar</div>
            </div>
          )}
          {!!selectedUserRef.current && (
            <div>
                {uniqueMessage.map((message) => (
                <div
                  key={message._id}
                  className={
                    message.sender === id ? 'text-right' : 'text-left'
                  }
                >
                  <div
                    className={
                      'text-left inline-block p-2 m-3 my-4 text-sm rounded-lg ' +
                      (message.sender === id
                        ? 'text-white font-medium bg-blue-400'
                        : 'text-gray-700 font-medium bg-white')
                    }
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef}></div>
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