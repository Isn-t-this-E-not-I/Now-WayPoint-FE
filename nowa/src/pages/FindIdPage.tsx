import React, { useState } from 'react'
import { findId, sendVerificationCode, verifyUserCode } from '../api/userApi'
import TextInput from '../components/TextInput/textInput'
import { useNavigate } from 'react-router-dom'

const FindIdPage = () => {
  //   const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('')
  const [loginId, setLoginId] = useState('')
  const [foundId, setFoundId] = useState('')
  const [authNumber, setAuthNumber] = useState('')
  const [receivedCode, setReceivedCode] = useState('')
  const [userInputAuthNumber, setUserInputAuthNumber] = useState('') // 인증코드 입력
  //   const [userInputCode, setUserInputCode] = useState('');
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRequestAuthNumber = async () => {
    try {
      setLoginId('')
      console.log(email)
      console.log(loginId)
      const response = await sendVerificationCode(loginId, email, '아이디찾기')
      if (response.message) {
        setReceivedCode(response.message) // 서버로부터 받은 인증코드 저장
        setError('')
      } else {
        setError('인증 코드 발송에 실패했습니다.')
      }
    } catch (error) {
      setError('인증 코드 발송에 실패했습니다.')
      console.error('Code send error:', error)
    }
  }

  const handleVerifyAuthNumber = async () => {
    try {
      const response = await findId(email, authNumber)
      if (response.id) {
        setFoundId(response.id)
        console.log(response.id)
        setError('')
      } else {
        setError('등록된 정보가 없습니다.')
      }
    } catch (error) {
      setError('아이디 찾기에 실패했습니다.')
      console.error('ID find error:', error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="card w-96 shadow-xl p-5 bg-gray-50">
        <h2 className="text-lg font-bold mb-4">아이디 찾기</h2>
        <TextInput
          type="email"
          placeholder="이메일 입력"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className="mb-4"
        />
        <button
          className="btn btn-primary mt-4 mb-2"
          onClick={handleRequestAuthNumber}
        >
          인증 코드 받기
        </button>
        {receivedCode && (
          <TextInput
            type="text"
            placeholder="인증 코드 입력"
            onChange={(e) => setAuthNumber(e.target.value)}
            className="mb-4"
          />
        )}
        {receivedCode && (
          <button
            className="btn btn-primary mt-2"
            onClick={handleVerifyAuthNumber}
          >
            인증 확인
          </button>
        )}
        {foundId && (
          <div className="text-green-500 text-sm mt-2">아이디: {foundId}</div>
        )}
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        <button
          className="btn btn-outline mt-4"
          onClick={() => navigate('/login')}
        >
          로그인 페이지로
        </button>
      </div>
    </div>
  )
}

export default FindIdPage
