import React, { useState } from 'react';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';

const Chat = () => {
    const [activeChat, setActiveChat] = useState(null);

    return (
        <div className="chat-root-container chat-app-container">
            <ChatSidebar
                activeChatId={activeChat?.id}
                onSelectChat={setActiveChat}
            />
            <ChatWindow activeChat={activeChat} />
        </div>
    );
};

export default Chat;
