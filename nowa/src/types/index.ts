export interface ChatRoom {
  id: number
  profilePic: string
  name: string
  lastMessage: string
  memberCount: number
  messages: {
    avatarSrc: string
    header: string
    time: string
    message: string
    footer: string
    alignment: 'start' | 'end'
  }[]
}
