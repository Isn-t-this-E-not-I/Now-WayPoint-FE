// src/components/Logout/Logout.ts
import axios from 'axios'

export const handleLogout = async (
  setLogoutModalOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const token = localStorage.getItem('token')
  const nickname = localStorage.getItem('nickname')
  try {
    await axios.post(
      'https://subdomain.now-waypoint.store:8080/api/user/logout',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    await axios.post(
      'https://subdomain.now-waypoint.store:8080/api/follow/logoutInfo',
      {
        nickname: nickname
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    localStorage.removeItem('token')
    localStorage.removeItem('nickname')
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
    })

    // 카카오 로그아웃
    if (window.kakao && window.kakao.Auth) {
      window.kakao.Auth.logout(() => {})
    }
    setLogoutModalOpen(false)
    window.location.href = '/auth' // 로그아웃 후 로그인 페이지로 이동
  } catch (error) {
    console.error('로그아웃에 실패했습니다:', error)
    localStorage.removeItem('token') // 오류가 발생해도 토큰과 닉네임 제거
    localStorage.removeItem('nickname')
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
    })
    if (window.kakao && window.kakao.Auth) {
      window.kakao.Auth.logout(() => {
        console.log('카카오 로그아웃 완료')
      })
    }
    window.location.href = '/auth'
  }
}
