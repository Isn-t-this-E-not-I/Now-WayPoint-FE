import React, { useState, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import {
  login,
  register,
  sendVerificationCode,
  verifyCode,
  checkLoginId,
  sendLoginInfo,
} from '../../api/userApi'
import TextInput from '../../components/TextInput/textInput'
import { useNavigate } from 'react-router-dom'
import {
  AiFillEye,
  AiFillEyeInvisible,
  AiFillCaretDown,
  AiFillCaretUp,
} from 'react-icons/ai'
import { GoogleOAuthProvider } from '@react-oauth/google'
import CustomGoogleLoginButton from '../../hooks/useGoogleLoginHook'
import './styles.css'

const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [loginId, setLoginId] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [, setNickname] = useState('')
  const [rememberMe, setRememberMe] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const location = import.meta.env.VITE_APP_API
  const [cookies, setCookie, removeCookie] = useCookies(['rememberedLoginId'])
  const [hidePassword, setHidePassword] = useState(true)
  const google_Client_Id = import.meta.env.VITE_APP_GOOGLE_KEY

  const navigate = useNavigate()

  useEffect(() => {
    if (cookies.rememberedLoginId) {
      setLoginId(cookies.rememberedLoginId)
      setRememberMe(true)
    }
  }, [cookies])

  useEffect(() => {
    const handleEnterPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleLogin()
      }
    }

    window.addEventListener('keydown', handleEnterPress)
    return () => {
      window.removeEventListener('keydown', handleEnterPress)
    }
  }, [loginId, password])

  const handleLogin = async () => {
    try {
      const data = await login({ loginId, password })
      await sendLoginInfo(loginId)
      navigate('/main', { replace: true })
      localStorage.setItem('token', data.token)
      localStorage.setItem('nickname', data.nickname)
      setNickname(data.nickname)

      if (rememberMe) {
        setCookie('rememberedLoginId', loginId, {
          path: '/',
          maxAge: 30 * 24 * 60 * 60,
        })
      } else {
        removeCookie('rememberedLoginId')
      }
    } catch (error) {
      console.error('로그인 실패:', error)
      setError('로그인에 실패하였습니다. 아이디 또는 비밀번호를 확인하세요.')
    }
  }

  const handleKakaoLogin = async () => {
    try {
      localStorage.setItem('token', 'zzz')
      window.location.href = `${location}/user/login/kakao`
    } catch (error) {
      console.error('Kakao login failed:', error)
    }
  }
  const handleNaverLogin = async () => {
    try {
      localStorage.setItem('token', 'zzz')
      window.location.href = `${location}/user/login/naver`
    } catch (error) {
      console.error('Kakao login failed:', error)
    }
  }

  const onToggleHide = () => {
    setHidePassword(!hidePassword)
  }

  return (
    <GoogleOAuthProvider clientId={google_Client_Id}>
      <div className="flex flex-col items-center justify-center min-h-screen bg-image">
        <div
          className="flex justify-end w-full"
          style={{ marginTop: '0.1rem', marginRight: '42rem' }}
        >
          <a
            href="#"
            className="mr-8"
            style={{
              color: '#1778F2',
              fontWeight: '900',
              fontSize: '15px',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/find-id')}
          >
            아이디 찾기
          </a>
          <a
            href="#"
            style={{
              color: '#1778F2',
              fontWeight: '900',
              fontSize: '15px',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/find-password')}
          >
            비밀번호 찾기
          </a>
        </div>

        <div
          className="card w-96 p-5"
          style={{ marginTop: '3rem', marginLeft: '40rem', minHeight: '590px' }}
        >
          <div className="flex justify-center mb-4">
            <button
              className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              로그인
            </button>
            <button
              className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              회원가입
            </button>
          </div>

          {activeTab === 'login' && (
            <>
              <TextInput
                type="email"
                placeholder="아이디"
                onChange={(e) => setLoginId(e.target.value)}
                value={loginId}
                className="mb-4"
                style={{
                  color: 'black',
                  backgroundColor: '#EAF0F7',
                  border: 'none',
                }}
              />
              <div className="relative w-full mb-2">
                <TextInput
                  type={hidePassword ? 'password' : 'text'}
                  placeholder="비밀번호"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className="mb-4"
                  style={{
                    color: 'black',
                    backgroundColor: '#EAF0F7',
                    border: 'none',
                  }}
                />
                <div
                  className="absolute inset-y-0 right-0 mb-4 mr-2 pr-3 flex items-center cursor-pointer"
                  onClick={onToggleHide}
                >
                  {hidePassword ? <AiFillEye /> : <AiFillEyeInvisible />}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                />
                <label className="block text-gray-700">아이디 저장</label>
              </div>
              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}
              <button
                className="btn mt-4"
                style={{
                  backgroundColor: '#1778F2',
                  color: 'white',
                  borderColor: '#1778F2',
                  borderWidth: '0px',
                  fontWeight: '900',
                  fontSize: '15px',
                }}
                onClick={handleLogin}
              >
                로그인
              </button>
              <button
                className="btn mt-2"
                style={{
                  backgroundColor: '#ffeb3b',
                  color: 'black',
                  border: 'none',
                  fontWeight: '900',
                  fontSize: '15px',
                }}
                onClick={handleKakaoLogin}
              >
                카카오 로그인
              </button>

              <button
                className="btn mt-2"
                style={{
                  backgroundColor: '#1ec800',
                  color: 'white',
                  border: 'none',
                  fontWeight: '900',
                  fontSize: '15px',
                }}
                onClick={handleNaverLogin}
              >
                네이버 로그인
              </button>

              <CustomGoogleLoginButton />
            </>
          )}

          {activeTab === 'register' && (
            <RegisterForm setActiveTab={setActiveTab} />
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}

interface RegisterFormProps {
  setActiveTab: (tab: 'login' | 'register') => void
}

const RegisterForm: React.FC<RegisterFormProps> = ({}) => {
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

  const isNicknameValid = (nickname: string) =>
    /^[ㄱ-ㅎ가-힣a-zA-Z0-9]+$/.test(nickname)
  const isLoginIdValid = (loginId: string) =>
    /^[a-zA-Z0-9]{6,12}$/.test(loginId)
  const isPasswordValid = (password: string) =>
    /^[\w!@#$%^&*]{8,12}$/.test(password)
  const isEmailValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSendCode = async () => {
    const email = `${emailUser}@${emailDomain}`
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
          )
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
    const email = `${emailUser}@${emailDomain}`
    try {
      const response = await verifyCode(authNumber, email)
      if (response.message === 'authorized') {
        alert('인증에 성공했습니다')
      } else {
        alert('인증에 실패했습니다')
      }
    } catch (error) {
      alert('서버 에러가 발생했습니다.')
    }
  }

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
          navigate('/onboarding/location-permission')
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
    <>
      <div className="flex items-center mb-4">
        <TextInput
          type="text"
          placeholder="아이디 (6~12자의 영문/숫자 조합)"
          onChange={(e) => {
            setLoginId(e.target.value)
            setLoginMessage('')
          }}
          value={loginId}
          className="flex-grow mr-10"
          style={{ color: 'black', backgroundColor: '#EAF0F7', border: 'none' }}
        />
        <button
          onClick={handleCheckLoginId}
          className="btn ml-3 flex-grow"
          style={{
            backgroundColor: '#1778F2',
            color: 'white',
            fontWeight: '900',
            fontSize: '14px',
            border: 'none',
          }}
        >
          중복확인
        </button>
      </div>
      {loginMessage && (
        <div
          className={`text-sm mb-2 ${loginMessage.includes('사용 가능한') ? 'text-green-500' : 'text-red-500'}`}
        >
          {loginMessage}
        </div>
      )}
      <div className="relative w-full mb-2">
        <TextInput
          type={hidePassword ? 'password' : 'text'}
          placeholder="비밀번호 (문자/숫자/기호, 8~12자)"
          onChange={(e) => {
            setPassword(e.target.value)
            setPasswordMessage('')
          }}
          value={password}
          className="mb-4"
          style={{
            color: 'black',
            backgroundColor: '#EAF0F7',
            border: 'none',
            paddingRight: '2.5rem',
          }}
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
      <div className="flex items-center mb-4">
        <TextInput
          type="text"
          placeholder="이메일"
          onChange={(e) => setEmailUser(e.target.value)}
          value={emailUser}
          className="flex-grow"
          style={{ color: 'black', backgroundColor: '#EAF0F7', border: 'none' }}
        />
        <span className="mx-2 mt-3 mb-2">@</span>
        <div className="relative w-40">
          <div
            className="input input-bordered flex items-center justify-between cursor-pointer"
            style={{
              backgroundColor: '#EAF0F7',
              border: 'none',
              padding: '0.5rem 1rem',
            }}
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
        className="mb-4"
        style={{ color: 'black', backgroundColor: '#EAF0F7', border: 'none' }}
      />
      <TextInput
        type="text"
        placeholder="닉네임"
        onChange={handleNicknameChange}
        value={nickname}
        className="mb-4"
        style={{ color: 'black', backgroundColor: '#EAF0F7', border: 'none' }}
      />
      {nicknameMessage && (
        <div
          className={`text-sm mb-4 ${nicknameMessage.includes('닉네임에는') ? 'text-red-500' : 'text-green-500'}`}
        >
          {nicknameMessage}
        </div>
      )}
      <button
        className="btn mt-4"
        style={{
          backgroundColor: '#1778F2',
          color: 'white',
          borderColor: '#1778F2',
          borderWidth: '0px',
          fontWeight: '900',
          fontSize: '15px',
        }}
        onClick={handleSendCode}
      >
        인증 코드 받기
      </button>
      {codeSentMessage && (
        <div className="text-sm text-green-500 mt-2 mb-2">
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
            className="mb-4"
            style={{
              color: 'black',
              backgroundColor: '#EAF0F7',
              border: 'none',
            }}
          />
          <button
            className="btn mt-2"
            style={{
              backgroundColor: '#1778F2',
              color: 'white',
              borderColor: '#1778F2',
              borderWidth: '0px',
              fontWeight: '900',
              fontSize: '15px',
            }}
            onClick={handleVerifyCode}
          >
            인증 코드 검증
          </button>
          <button
            className="btn mt-2"
            style={{
              backgroundColor: '#1778F2',
              color: 'white',
              borderColor: '#1778F2',
              borderWidth: '0px',
              fontWeight: '900',
              fontSize: '15px',
            }}
            onClick={handleRegister}
          >
            회원가입
          </button>
        </>
      )}
      {/* <button
        className="btn btn-outline mt-4"
        style={{ color: '#1778F2', borderColor: '#1778F2', borderWidth: '1px', fontWeight: '900', fontSize: '15px'}}
        onClick={() => setActiveTab('login')}
      >
        로그인 페이지로
      </button> */}
    </>
  )
}

export default AuthPage
