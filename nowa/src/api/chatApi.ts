export const fetchChatRooms = async (token: string) => {
  const response = await fetch('/api/chat/list', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.json()
}
