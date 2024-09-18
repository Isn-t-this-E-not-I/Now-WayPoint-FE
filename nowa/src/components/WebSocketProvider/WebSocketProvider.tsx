import React, {
  useEffect,
  useRef,
  createContext,
  useContext,
  ReactNode,
  useState,
} from 'react'
import SockJS from 'sockjs-client'
import { Client, IMessage } from '@stomp/stompjs'

// Define Notification type
export interface Notification {
  id: number
  nickname: string
  profileImageUrl: string
  message: string
  createDate: string
  postId: number
  mediaUrl: string
  comment: string
}

export interface FollowContent {
  id: number // 게시물 ID
  content: string // 게시물 내용
  hashtags: string[] // 해시태그 배열
  category: string // 카테고리
  createdAt: string // 생성 날짜 및 시간 (문자열 표현)
  likeCount: number // 좋아요 수 (숫자)
  mediaUrls: string[] // 미디어 URL 배열
  username: string // 사용자 이름
  profileImageUrl: string // 사용자 프로필 이미지 URL
}

export interface selectContent {
  id: number // 게시물 ID
  content: string // 게시물 내용
  hashtags: string[] // 해시태그 배열
  category: string // 카테고리
  createdAt: string // 생성 날짜 및 시간 (문자열 표현)
  likeCount: number // 좋아요 수 (숫자)
  mediaUrls: string[] // 미디어 URL 배열
  username: string // 사용자 이름
  profileImageUrl: string // 사용자 프로필 이미지 URL
  distance: number
  locationTag: string
}

export interface loginActive {
  nickname : string,
  active : string
}

interface WebSocketContextProps {
  client: Client | null
  notifications: Notification[]
  followContents: FollowContent[]
  selectContents: selectContent[]
  loginActive : loginActive[]
  isLoading: boolean
  notifyCount: number
  getStompClient: () => Client | null
  resetNotifyCount: () => void
  deleteSocketNotification: (id: number) => void
  deleteNotificationAll: () => void
  setFollowList: (data: loginActive[]) => void
}

const WebSocketContext = createContext<WebSocketContextProps>({
  client: null,
  notifications: [],
  followContents: [],
  selectContents: [],
  loginActive : [],
  isLoading: true,
  notifyCount: 0,
  getStompClient: () => null,
  resetNotifyCount: () => {},
  deleteSocketNotification: () => {},
  deleteNotificationAll: () => {},
  setFollowList: () => {},
})

export const useWebSocket = () => useContext(WebSocketContext)

interface WebSocketProviderProps {
  children: ReactNode
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const [client, setClient] = useState<Client | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [followContents, setFollowContents] = useState<FollowContent[]>([])
  const [selectContents, setSelectContents] = useState<selectContent[]>([])
  const [loginActive, setLoginActive] = useState<loginActive[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const clientRef = useRef<Client | null>(null)
  const location = import.meta.env.VITE_APP_API
  const getStompClient = () => clientRef.current
  const [currentCategory, setCurrentCategory] = useState('ALL')
  const locate = localStorage.getItem('locate')
  let currentDistance: number
  const [notifyCount, setNotifyCount] = useState<number>(0)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token found')

        const response = await fetch(`${location}/notify`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) throw new Error('Network response was not ok')

        const data: Notification[] = await response.json()
        setNotifications(data.sort((a, b) => b.id - a.id))
        // setNotifyCount(0)
        console.log(data)

        const responseNotifyCount = await fetch(`${location}/notify/read`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        if (!responseNotifyCount.ok) throw new Error('Network response was not ok')
    
        const notifyCountData = await responseNotifyCount.json()
        setNotifyCount(notifyCountData)  // 여기에 응답 데이터에 맞춰서 notifyCount 업데이트
        console.log('notifyCount:', notifyCountData)

        const responseFollowContent = await fetch(`${location}/follow/list`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!responseFollowContent.ok)
          throw new Error('Network response was not ok')

        // responseFollowContent를 사용하여 JSON 데이터 가져오기
        const dataContent: FollowContent[] = await responseFollowContent.json()

        // 날짜를 기반으로 정렬 (문자열을 Date 객체로 변환하여 비교)
        setFollowContents(
          dataContent.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        )

        const socket = new SockJS(
          'https://subdomain.now-waypoint.store:8080/main'
        )
        const stompClient = new Client({
          webSocketFactory: () => socket,
          connectHeaders: { Authorization: `Bearer ${token}` },
          onConnect: () => {
            console.log('WebSocket connected!')
            clientRef.current = stompClient
            setClient(stompClient)

            stompClient.subscribe(
              `/queue/notify/${localStorage.getItem('nickname') || ''}`,
              (messageOutput: IMessage) => {
                console.log(messageOutput.body)
                const data = JSON.parse(messageOutput.body)
                const newNotification: Notification = {
                  id: data.id,
                  nickname: data.nickname,
                  profileImageUrl: data.profileImageUrl,
                  message: data.message,
                  createDate: data.createDate,
                  postId: data.postId,
                  mediaUrl: data.mediaUrl,
                  comment: data.comment,
                }

                setNotifyCount((prev) => prev + 1)
                setNotifications((prev) =>
                  !prev.some((f) => f.id === newNotification.id)
                    ? [newNotification, ...prev]
                    : prev
                )
              }
            )

            stompClient.subscribe(
              `/queue/posts/${localStorage.getItem('nickname') || ''}`,
              (messageOutput: IMessage) => {
                const data = JSON.parse(messageOutput.body)
                const newFollowContent: FollowContent = {
                  id: data.id,
                  content: data.content,
                  hashtags: data.hashtags,
                  category: data.category,
                  createdAt: data.createdAt,
                  likeCount: data.likeCount || 0,
                  mediaUrls: data.mediaUrls,
                  username: data.username,
                  profileImageUrl: data.profileImageUrl,
                }

                setFollowContents((prev) =>
                  !prev.some((f) => f.id === newFollowContent.id)
                    ? [newFollowContent, ...prev]
                    : prev
                )
              }
            )

            stompClient.subscribe(
              `/queue/category/${localStorage.getItem('nickname') || ''}`,
              (messageOutput: IMessage) => {
                // JSON 파싱 및 배열 형태로 변환
                const data: selectContent[] = JSON.parse(messageOutput.body)

                // 각 항목을 newSelectContent로 변환하고 상태 업데이트
                const newSelectContents = data.map((item) => ({
                  id: item.id,
                  content: item.content,
                  hashtags: item.hashtags,
                  category: item.category,
                  createdAt: item.createdAt,
                  likeCount: item.likeCount || 0,
                  mediaUrls: item.mediaUrls,
                  username: item.username,
                  profileImageUrl: item.profileImageUrl,
                  distance: item.distance,
                  locationTag: item.locationTag,
                }))
                setSelectContents([])

                setCurrentCategory(newSelectContents[0].category)
                currentDistance = newSelectContents[0].distance

                setSelectContents(newSelectContents)
              }
            )

            stompClient.subscribe(
              `/queue/loginInfo/${localStorage.getItem('nickname') || ''}`,
              (messageOutput: IMessage) => {
                const data: loginActive = JSON.parse(messageOutput.body);
          
                setLoginActive((prevUsers) => {
                  return prevUsers.map((user) => {
                    if (user.nickname === data.nickname) {
                      return { ...user, active: data.active };
                    }
                    return user;// 변경 없는 사용자
                  });
                });
              }
            );

            stompClient.subscribe(
              '/topic/category',
              (messageOutput: IMessage) => {
                const data = JSON.parse(messageOutput.body)

                // 각 항목을 newSelectContent로 변환하고 상태 업데이트
                const newSelectContents: selectContent = {
                  id: data.id,
                  content: data.content,
                  hashtags: data.hashtags,
                  category: data.category,
                  createdAt: data.createdAt,
                  likeCount: data.likeCount || 0,
                  mediaUrls: data.mediaUrls,
                  username: data.username,
                  profileImageUrl: data.profileImageUrl,
                  distance: data.distance,
                  locationTag: data.locationTag,
                }

                const haversineDistance = (
                  lat1: number,
                  lon1: number,
                  lat2: number,
                  lon2: number
                ) => {
                  const R = 6371 // Earth's radius in km
                  const dLat = ((lat2 - lat1) * Math.PI) / 180
                  const dLon = ((lon2 - lon1) * Math.PI) / 180
                  const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos((lat1 * Math.PI) / 180) *
                      Math.cos((lat2 * Math.PI) / 180) *
                      Math.sin(dLon / 2) *
                      Math.sin(dLon / 2)
                  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                  const distance = R * c // Distance in km
                  return distance
                }

                let calculatedDistance = NaN

                // Extract user location
                if (locate != null) {
                  const [userLongitude, userLatitude] = locate
                    .split(',')
                    .map((coord) => parseFloat(coord.trim()))

                  // Extract post location
                  const [postLongitude, postLatitude] =
                    newSelectContents.locationTag
                      .split(',')
                      .map((coord) => parseFloat(coord.trim()))
                  // Calculate distance between user and post
                  calculatedDistance = haversineDistance(
                    userLatitude,
                    userLongitude,
                    postLatitude,
                    postLongitude
                  )
                }

                if (calculatedDistance <= currentDistance) {
                  if (
                    currentCategory === newSelectContents.category ||
                    currentCategory === 'ALL'
                  ) {
                    setSelectContents((prev) =>
                      !prev.some((f) => f.id === newSelectContents.id)
                        ? [newSelectContents, ...prev]
                        : prev
                    )
                  }
                }
              }
            )

            setIsLoading(false)
          },
          onDisconnect: () => {
            console.log('WebSocket disconnected!')
            setIsLoading(false)
          },
          onStompError: (frame) => {
            console.error('Broker reported error:', frame.headers['message'])
            console.error('Additional details:', frame.body)
            setIsLoading(false)
          },
          debug: (str) => {
            console.log('STOMP Debug:', str)
          },
        })

        stompClient.activate()
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    }

    fetchNotifications()

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate()
      }
      console.log('WebSocket connection closed')
    }
  }, [])

  const resetNotifyCount = () => {
    setNotifyCount(0)
  }

  const deleteSocketNotification = (id: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    )
  }

  const deleteNotificationAll = () => {
    setNotifications([])
  }

  const setFollowList = (data: React.SetStateAction<loginActive[]>) => {
    setLoginActive(data)
  }

  return (
    <WebSocketContext.Provider
      value={{
        client,
        notifications,
        followContents,
        selectContents,
        loginActive,
        isLoading,
        notifyCount,
        getStompClient,
        resetNotifyCount,
        deleteSocketNotification,
        deleteNotificationAll,
        setFollowList,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}
