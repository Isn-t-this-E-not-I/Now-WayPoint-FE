import React, { useState } from 'react'
import { findId, sendVerificationCode } from '../api/userApi'
import TextInput from '../components/TextInput/textInput'
import { useNavigate } from 'react-router-dom'

const FindIdPage = () => {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [foundId, setFoundId] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [userInputCode, setUserInputCode] = useState('')
  const [verificationStatus, setVerificationStatus] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleFindId = async () => {
    try {
      const response = await findId(nickname, email)
      if (response.exists) {
        const sendCodeResponse = await sendVerificationCode(email, '아이디찾기')
        if (sendCodeResponse.codeSent) {
          setFoundId(response.id)
          setVerificationCode(sendCodeResponse.code)
          setError('')
        } else {
          setError('인증 코드 발송에 실패했습니다.')
        }
      } else {
        setError('등록된 정보가 없습니다.')
      }
    } catch (error) {
      setError('아이디 찾기에 실패했습니다.')
      console.error('Find ID error:', error)
    }
  }

  const handleVerifyCode = () => {
    if (verificationCode === userInputCode) {
      setVerificationStatus(true)
      setError('')
    } else {
      setError('인증 코드가 일치하지 않습니다.')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="card w-96 shadow-xl p-5 bg-gray-50">
        <h2 className="text-lg font-bold mb-4">아이디 찾기</h2>
        <TextInput
          type="text"
          placeholder="닉네임 입력"
          onChange={(e) => setNickname(e.target.value)}
          value={nickname}
          className="mb-4"
        />
        <TextInput
          type="email"
          placeholder="이메일 입력"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className="mb-4"
        />
        <button className="btn btn-primary mt-4 mb-2" onClick={handleFindId}>
          찾기
        </button>
        {foundId && (
          <TextInput
            type="text"
            placeholder="인증 코드 입력"
            onChange={(e) => setUserInputCode(e.target.value)}
            className="mb-4"
          />
        )}
        {foundId && (
          <button className="btn btn-primary mt-2" onClick={handleVerifyCode}>
            인증 확인
          </button>
        )}
        {verificationStatus && (
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
