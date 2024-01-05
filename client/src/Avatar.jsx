import React from 'react'


const Avatar = ({userId, username, online}) => {
    const colors = ['bg-red-200', 'bg-green-200', 'bg-purple-200', 'bg-yellow-200', 'bg-teal-200', 'bg-blue-200'];
    const base10 = parseInt(userId, 16);
    const colorIndex = base10%colors.length;
    const color = colors[colorIndex];

    return (
        <div className={'w-8 h-8 rounded-full flex relative items-center ' + color}>
            <div className='w-full text-center  opacity-70'>
                {username[0]}
            </div>
            <div className={'w-3 h-3 border-yellow-400  border-2 absolute rounded-full bottom-0 right-0 '+ (online ? 'bg-green-800' : 'bg-gray-500')}></div>
        </div>
    )
}

export default Avatar