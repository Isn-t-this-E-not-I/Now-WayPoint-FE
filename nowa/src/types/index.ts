export interface UserInfo {
  userNickname: string
  profileImageUrl?: string
}

export interface ChatRoom {
  chatRoomId: number
  chatRoomName: string
  userResponses: UserInfo[]
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