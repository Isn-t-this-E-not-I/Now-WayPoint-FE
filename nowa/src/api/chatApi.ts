export const fetchChatRooms = async () => {
  const response = await fetch('/api/chat/list', {
    method: 'GET',
  })
  return response.json()
}
