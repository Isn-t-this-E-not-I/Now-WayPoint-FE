import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TextInput from '../../components/TextInput/textInput'
import {
  register,
  login,
  sendVerificationCode,
  verifyCode,
  checkLoginId,
} from '../../api/userApi'
import Button from '../../components/Button/button'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import { AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai'

const RegisterPage: React.FC = () => {
  const [loginId, setLoginId] = useState('')
  const [emailUser, setEmailUser] = useState('')
  const [emailDomain, setEmailDomain] = useState('gmail.com')
  const emailDomains = [
    'gmail.com',
    'naver.com',
    'hanmail.net',
    'nate.com',
    'kakao.com',
    'msn.com',
  ]
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [authNumber, setAuthNumber] = useState('')
  const [receivedCode, setReceivedCode] = useState('')
  const [, setVerificationVisible] = useState(false)
  const [loginMessage, setLoginMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [nicknameMessage, setNicknameMessage] = useState('')
  const [codeSentMessage, setCodeSentMessage] = useState('')
  const [hidePassword, setHidePassword] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const navigate = useNavigate()

  const isNicknameValid = (nickname: string) => {
    const regex = /^[ㄱ-ㅎ가-힣a-zA-Z0-9]+$/
    return regex.test(nickname)
  }

  const isLoginIdValid = (loginId: string) => {
    const regex = /^[a-zA-Z0-9]{6,12}$/
    return regex.test(loginId)
  }

  const isPasswordValid = (password: string) => {
    const regex = /^[\w!@#$%^&*]{8,12}$/
    return regex.test(password)
  }

  const isEmailValid = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleSendCode = async () => {
    const email = `${emailUser}@${emailDomain}` //*
    if (loginId && email && password && name && nickname) {
      if (!isLoginIdValid(loginId)) {
        setLoginMessage('아이디는 6~12자의 영문/숫자 조합이어야 합니다.')
        return
      }
      if (!isPasswordValid(password)) {
        setPasswordMessage(
          '비밀번호는 8~12자의 문자/숫자/기호 조합이어야 합니다.'
        )
        return
      }
      if (!isEmailValid(email)) {
        setLoginMessage('이메일 형식이 올바르지 않습니다.')
        return
      }
      if (!isNicknameValid(nickname)) {
        setNicknameMessage(
          '닉네임에는 공백이나 특수 문자를 포함할 수 없습니다.'
        )
        return
      }
      try {
        const verificationResponse = await sendVerificationCode(
          email,
          '회원가입',
          ''
        )
        if (verificationResponse.message) {
          setReceivedCode(verificationResponse.message)
          setCodeSentMessage(
            '인증 코드가 이메일로 발송되었습니다. 코드를 확인해주세요.'
          ) // 인증 코드 발송 메시지 설정
          setVerificationVisible(true)
        } else {
          setLoginMessage('인증 코드 발송에 실패했습니다.')
        }
      } catch (error) {
        console.error('인증 코드 발송 에러:', error)
        setLoginMessage('서버 에러가 발생했습니다.')
      }
    } else {
      setLoginMessage('모든 필드를 채워주세요.')
    }
  }

  const handleVerifyCode = async () => {
    const email = `${emailUser}@${emailDomain}` //*
    try {
      const response = await verifyCode(authNumber, email)
      if (response.message === 'authorized') {
        alert('인증에 성공했습니다')
      } else {
        alert('인증에 실패했습니다')
      }
    } catch (error) {
      console.error('Verification error:', (error as any).message || error)
      alert('서버 에러가 발생했습니다.')
    }
  }

  // src/pages/RegisterPage.tsx (update handleRegister function)

  const handleRegister = async () => {
    const email = `${emailUser}@${emailDomain}`
    try {
      const response = await register({
        loginId,
        email,
        password,
        name,
        nickname,
      })
      if (response.data === 'ok') {
        try {
          alert('회원가입에 성공했습니다')
          const loginResponse = await login({ loginId, password })
          localStorage.setItem('token', loginResponse.token)
          localStorage.setItem('nickname', loginResponse.nickname)
          navigate('/onboarding/location-permission') // Redirect to location permission page
        } catch (loginError) {
          console.error('자동 로그인 실패:', loginError)
          alert('자동 로그인에 실패했습니다. 로그인 페이지로 이동합니다.')
          navigate('/auth')
        }
      } else {
        alert('회원가입 실패: ' + response)
      }
    } catch (error) {
      console.error('Registration error:', (error as any).message || error)
      alert('서버 에러가 발생했습니다.')
    }
  }

  const handleCheckLoginId = async () => {
    if (!isLoginIdValid(loginId)) {
      setLoginMessage('아이디는 6~12자의 영문/숫자 조합이어야 합니다.')
      return
    }

    try {
      const response = await checkLoginId(loginId)
      if (response === '가능한 아이디입니다.') {
        setLoginMessage('사용 가능한 아이디입니다.')
      } else {
        setLoginMessage('이미 사용 중인 아이디입니다.')
      }
    } catch (error) {
      console.error('아이디 중복 확인 에러:', error)
      setLoginMessage('서버 에러가 발생했습니다.')
    }
  }

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNickname = e.target.value
    setNickname(newNickname)
    if (!isNicknameValid(newNickname)) {
      setNicknameMessage('닉네임에는 공백이나 특수 문자를 포함할 수 없습니다.')
    } else {
      setNicknameMessage('')
    }
  }

  const onToggleHide = () => {
    setHidePassword(!hidePassword)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="card w-96 shadow-xl p-5">
        <h2 className="text-lg font-bold mb-4">회원가입</h2>
        <div className="flex items-center mb-2 w-full">
          <div className="flex-grow mr-2">
            <TextInput
              type="text"
              placeholder="아이디 (6~12자의 영문/숫자 조합)"
              onChange={(e) => {
                setLoginId(e.target.value)
                setLoginMessage('') //  입력이 변경될 때마다 메시지 초기화
              }}
              value={loginId}
              className="w-full"
            />
          </div>
          <Button
            onClick={handleCheckLoginId}
            className="btn btn-secondary flex-shrink-0"
          >
            중복확인
          </Button>
        </div>
        {loginMessage && (
          <div
            className={`text-sm mb-2 ${loginMessage.includes('사용 가능한') ? 'text-green-500' : 'text-red-500'}`}
          >
            {loginMessage}
          </div>
        )}
        <div className="relative w-full mt-2 mb-2">
          <TextInput
            type={hidePassword ? 'password' : 'text'}
            placeholder="비밀번호 (문자/숫자/기호, 8~12자)"
            onChange={(e) => {
              setPassword(e.target.value)
              setPasswordMessage('') // 입력이 변경될 때마다 메시지 초기화
            }}
            value={password}
            className="w-full pr-10"
          />
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={onToggleHide}
          >
            {hidePassword ? <AiFillEye /> : <AiFillEyeInvisible />}
          </div>
        </div>
        {passwordMessage && (
          <div
            className={`text-sm mb-2 ${passwordMessage.includes('비밀번호는') ? 'text-red-500' : 'text-green-500'}`}
          >
            {passwordMessage}
          </div>
        )}
        <div className="flex w-full mt-2 mb-4 items-center">
          <TextInput
            type="text"
            placeholder="이메일"
            onChange={(e) => setEmailUser(e.target.value)}
            value={emailUser}
            className="w-full"
          />
          <span className="mx-2 mt-3 mb-2">@</span>
          <div className="relative w-40">
            <div
              className="input input-bordered flex items-center justify-between cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {emailDomain}
              {isDropdownOpen ? <AiFillCaretUp /> : <AiFillCaretDown />}
            </div>
            {isDropdownOpen && (
              <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded-md shadow-lg">
                {emailDomains.map((domain) => (
                  <li
                    key={domain}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setEmailDomain(domain)
                      setIsDropdownOpen(false)
                    }}
                  >
                    {domain}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <TextInput
          type="text"
          placeholder="이름"
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full mb-4"
        />
        <TextInput
          type="text"
          placeholder="닉네임"
          onChange={handleNicknameChange}
          value={nickname}
          className="w-full mb-2"
        />
        {nicknameMessage && (
          <div
            className={`text-sm mb-4 ${nicknameMessage.includes('닉네임에는') ? 'text-red-500' : 'text-green-500'}`}
          >
            {nicknameMessage}
          </div>
        )}
        <button
          className="btn btn-primary w-full mt-4"
          onClick={handleSendCode}
        >
          인증 코드 받기
        </button>
        {codeSentMessage && (
          <div className="text-sm text-green-500 mt-2 mb-2 w-full">
            {codeSentMessage}
          </div>
        )}
        {receivedCode && (
          <>
            <TextInput
              type="text"
              placeholder="인증 코드 입력"
              onChange={(e) => setAuthNumber(e.target.value)}
              value={authNumber}
              className="w-full mt-2 mb-4"
            />
            <button
              className="btn btn-secondary w-full mt-4"
              onClick={handleVerifyCode}
            >
              인증 코드 검증
            </button>
            <button
              className="btn btn-primary w-full mt-4"
              onClick={handleRegister}
            >
              회원가입
            </button>
          </>
        )}
        <button
          className="btn btn-outline w-full mt-4"
          onClick={() => navigate('/auth')}
        >
          로그인 페이지로
        </button>
      </div>
    </div>
  )
}

export default RegisterPage
