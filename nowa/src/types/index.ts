import { ReactNode } from 'react'

export interface ChatRoom {
  chatRoomId: any
  chatRoomName: ReactNode
  userCount: ReactNode
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
  chatRoomId: any
  unreadMessagesCount: number
  lastMessageContent: string
  lastMessageTimestamp: string
}
