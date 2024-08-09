import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ChatRoom, ChatRoomInfo, ChatMessage } from '@/types';

interface ChatState {
    chatRooms: ChatRoom[]
    chatRoomsInfo: ChatRoomInfo[]
    messages: ChatMessage[]
    setChatRooms: React.Dispatch<React.SetStateAction<ChatRoom[]>>;
    setChatRoomsInfo: React.Dispatch<React.SetStateAction<ChatRoomInfo[]>>;
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
}

const defaultChatState: ChatState = {
    chatRooms: [],
    chatRoomsInfo: [],
    messages: [],
    setChatRooms: () => { },
    setChatRoomsInfo: () => { },
    setMessages: () => { },
};

const ChatContext = createContext<ChatState>(defaultChatState)

export const useChat = () => useContext(ChatContext)

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
    const [chatRoomsInfo, setChatRoomsInfo] = useState<ChatRoomInfo[]>([])
    const [messages, setMessages] = useState<ChatMessage[]>([])

    return (
        <ChatContext.Provider value={{ chatRooms, setChatRooms, chatRoomsInfo, setChatRoomsInfo, messages, setMessages }}>
            {children}
        </ChatContext.Provider>
    );
};