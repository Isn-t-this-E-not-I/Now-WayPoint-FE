import { ReactNode } from 'react'

export interface ChatRoom {
  chatRoomId: number
  chatRoomName: string
  userCount: number
  profilePic: string
  lastMessage: string
  messages: {
    avatarSrc: string
    header: string
    time: string
    message: string
  }[]
}

export interface ChatRoomInfo {
  chatRoomId: number
  unreadMessagesCount: number
  lastMessageContent: string
  lastMessageTimestamp: string
}

export interface ChatMessage {
  sender: string
  content: string
  timestamp: string
}