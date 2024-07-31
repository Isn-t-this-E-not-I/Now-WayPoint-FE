import React, { createContext, useState, useContext, ReactNode } from 'react';
import { ChatRoom, ChatRoomInfo, ChatMessage } from '@/types'; // ChatMessage 추가

interface ChatState {
    chatRooms: ChatRoom[];
    chatRoomsInfo: ChatRoomInfo[];
    messages: ChatMessage[]; // 추가
    setChatRooms: React.Dispatch<React.SetStateAction<ChatRoom[]>>;
    setChatRoomsInfo: React.Dispatch<React.SetStateAction<ChatRoomInfo[]>>;
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>; // 추가
}

const defaultChatState: ChatState = {
    chatRooms: [],
    chatRoomsInfo: [],
    messages: [], // 추가
    setChatRooms: () => { },
    setChatRoomsInfo: () => { },
    setMessages: () => { } // 추가
};

const ChatContext = createContext<ChatState>(defaultChatState);

export const useChat = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [chatRoomsInfo, setChatRoomsInfo] = useState<ChatRoomInfo[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]); // 추가

    return (
        <ChatContext.Provider value={{ chatRooms, setChatRooms, chatRoomsInfo, setChatRoomsInfo, messages, setMessages }}>
            {children}
        </ChatContext.Provider>
    );
};