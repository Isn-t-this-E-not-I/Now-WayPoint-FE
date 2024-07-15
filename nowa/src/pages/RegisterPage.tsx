import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TextInput from '../components/TextInput/textInput' // 올바른 경로로 수정
import { register } from '../api/userApi'

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const navigate = useNavigate()

  const handleRegister = async () => {
    try {
      const response = await register({ email, password, name, nickname })
      if (response.success) {
        navigate('/login') // 회원가입 성공 시 로그인 페이지로 리디렉션
      } else {
        alert('회원가입 실패: ' + response.message)
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('서버 에러가 발생했습니다.')
    }
  }

  const goToLogin = () => {
    // 로그인 페이지로 이동하는 함수
    navigate('/login')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="card w-96 shadow-xl p-5">
        <h2 className="text-lg font-bold mb-4">회원가입</h2>
        <TextInput
          type="email"
          placeholder="이메일"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className="mb-4"
        />
        <TextInput
          type="password"
          placeholder="비밀번호"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          className="mb-4"
        />
        <TextInput
          type="text"
          placeholder="이름"
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="mb-4"
        />
        <TextInput
          type="text"
          placeholder="닉네임"
          onChange={(e) => setNickname(e.target.value)}
          value={nickname}
          className="mb-4"
        />
        <button
          className="btn btn-primary w-full mt-4 mb-2"
          onClick={handleRegister}
        >
          회원가입
        </button>
        <button className="btn btn-outline w-full mt-4" onClick={goToLogin}>
          로그인 페이지로
        </button>
      </div>
    </div>
  )
}

export default RegisterPage
