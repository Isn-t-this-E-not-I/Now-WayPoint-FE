export const fetchChatRooms = async (_token?: string) => {
  const response = await fetch('/api/chat/list', {
    method: 'GET',
  })
  return response.json()
}
