import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const NaverCallback = () => {
  const navigate = useNavigate()
  const location = window.location
  const locate = import.meta.env.VITE_APP_API
  const params = new URLSearchParams(location.search)
  const code = params.get('code')
  const state = params.get('state')

  useEffect(() => {
    const fetchFromBackend = async () => {
      try {
        const response = await fetch(`${locate}/user/login/naver`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        })

        const data = await response.json()

        if (data.success) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('nickname', data.nickname)

          navigate('/main')
        } else {
          console.error('백엔드 처리 실패:', data.message)
        }
      } catch (error) {
        console.error('백엔드 요청 실패:', error)
      }
    }

    if (code && state) {
      fetchFromBackend()
    }
  }, [code, state, navigate])

  return <div>네이버 로그인 중...</div>
}

export default NaverCallback
