import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import SockJS from 'sockjs-client'
import { Client, IMessage } from '@stomp/stompjs'

const NotificationWrapper = styled.div`
  text-align: left;
`

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
  border: 1px solid black;
  padding: 10px;
  border-radius: 5px;
  width: 17.5rem;
  font-size: 15px;
  position: relative;
`

const ProfilePic = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`

const NotificationContent = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-right: auto;
  position: relative;
  padding-bottom: 20px;
`

const TimeAgo = styled.span`
  color: #129fe1;
  position: absolute;
  bottom: 0;
  right: 5;
  font-size: 12px;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 15px;
  cursor: pointer;
  position: absolute;
  top: -3px;
  right: 6px;
`

const NotificationPage: React.FC<{ token: string; userNickname: string }> = ({
  token,
  userNickname,
}) => {
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (token && userNickname) {
      const sock = new SockJS(
        'https://subdomain.now-waypoint.store:8080/notification'
      )
      const client = new Client({
        webSocketFactory: () => sock,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        onConnect: (frame) => {
          console.log('Connected to notification socket')
          client.subscribe(`/user/queue/notify`, (message: IMessage) => {
            console.log('Notification received:', message.body)
            setNotifications((prevNotifications) => [
              JSON.parse(message.body),
              ...prevNotifications,
            ])
          })
        },
        onStompError: (frame) => {
          console.error('Broker reported error: ' + frame.headers['message'])
          console.error('Additional details: ' + frame.body)
        },
      })
      client.activate()

      return () => {
        client.deactivate()
      }
    }
  }, [token, userNickname])

  const handleDelete = (id: number) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    )
  }

  return (
    <>
      <NotificationWrapper>
        {notifications.map((notification) => (
          <NotificationItem key={notification.id}>
            <ProfilePic src={notification.profilePic} alt="Profile" />
            <NotificationContent>
              <span>{notification.content}</span>
              <TimeAgo>{notification.timeAgo}</TimeAgo>
            </NotificationContent>
            <CloseButton onClick={() => handleDelete(notification.id)}>
              x
            </CloseButton>
          </NotificationItem>
        ))}
      </NotificationWrapper>
    </>
  )
}

export default NotificationPage
