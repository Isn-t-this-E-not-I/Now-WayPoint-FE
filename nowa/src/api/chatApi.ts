export const fetchChatRooms = async (token: string) => {
  // 서버에 GET 요청을 보내서 채팅방 목록을 가져옴
  const response = await fetch(
    'https://subdomain.now-waypoint.store:8080/api/chat/list',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Authorization 헤더에 Bearer 토큰을 포함
      },
    }
  )
  return response.json()
}
