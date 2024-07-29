import React, { useState } from 'react'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import { login, loginWithKakao } from '../api/userApi'
import TextInput from '../components/TextInput/textInput'
import { useNavigate } from 'react-router-dom'

const LoginPage: React.FC = () => {
  const [loginId, setLoginId] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [nickname, setNickname] = useState('')
  const [rememberMe, setRememberMe] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const navigate = useNavigate()
  const location = import.meta.env.VITE_APP_API

  const handleLogin = async () => {
    try {
      const data = await login({ loginId, password })
      // console.log('API 응답 전체:', data);
      console.log('로그인 성공:', data.token)
      navigate('/main', { replace: true }) // *
      localStorage.setItem('token', data.token)
      localStorage.setItem('nickname', data.nickname)
      setNickname(data.nickname)
      // navigate('/main', { replace: true, state: { token: data.token } });
    } catch (error) {
      console.error('로그인 실패:', error)
      setError('로그인에 실패하였습니다. 아이디 또는 비밀번호를 확인하세요.')
    }
  }

  const handleKakaoLogin = async () => {
    try {
      window.location.href = `${location}/user/login/kakao`
    } catch (error) {
      console.error('Kakao login failed:', error)
    }
  }

  const goToRegister = () => navigate('/register')
  const goToFindId = () => navigate('/find-id')
  const goToFindPassword = () => navigate('/find-password')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="card w-96 shadow-xl p-5 bg-gray-50">
        <h2 className="text-lg font-bold mb-4">로그인</h2>
        <TextInput
          type="email"
          placeholder="이메일"
          onChange={(e) => setLoginId(e.target.value)}
          value={loginId}
          className="mb-4"
        />
        <TextInput
          type="password"
          placeholder="비밀번호"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          className="mb-4"
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className="checkbox checkbox-primary"
          />
          <span className="label-text">아이디 저장</span>
        </label>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        <button className="btn btn-primary mt-4 mb-2" onClick={handleLogin}>
          로그인
        </button>
        <button className="btn btn-warning mt-4" onClick={handleKakaoLogin}>
          카카오 간편 로그인
        </button>
        <button className="btn btn-outline mt-4" onClick={goToRegister}>
          회원가입
        </button>
        <button className="btn btn-outline mt-2" onClick={goToFindId}>
          아이디 찾기
        </button>
        <button className="btn btn-outline mt-2" onClick={goToFindPassword}>
          비밀번호 찾기
        </button>
        {/* <button className="btn btn-outline mt-2" onClick={goToResetPassword}>비밀번호 재설정</button> */}
      </div>
    </div>
  )
}

export default LoginPage
