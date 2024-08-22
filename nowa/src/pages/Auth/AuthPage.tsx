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
import Button from '../../components/Button/button'
import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from '@react-oauth/google'
import CustomGoogleLoginButton from '../../hooks/useGoogleLoginHook'
import './styles.css'

const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [loginId, setLoginId] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [nickname, setNickname] = useState('')
  const [rememberMe, setRememberMe] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const location = import.meta.env.VITE_APP_API
  const [cookies, setCookie, removeCookie] = useCookies(['rememberedLoginId'])
  const [hidePassword, setHidePassword] = useState(true)
  const google_Client_Id = import.meta.env.VITE_APP_GOOGLE_KEY
  const naver_Client_Id = import.meta.env.VITE_APP_NAVER_KEY
  const naver_Callback_URL = import.meta.env.VITE_APP_NAVER_CALLBACK_URL

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

  const handleGoogleLoginSuccess = async () => {
    try {
      localStorage.setItem('token', 'zzz')
      window.location.href = `${location}/user/login/google`
    } catch (error) {
      console.error('google login failed:', error)
    }
  }

  const handleNaverLogin = () => {
    const state = Math.random().toString(36).substr(2, 11)
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naver_Client_Id}&redirect_uri=${encodeURI(naver_Callback_URL)}&state=${state}`
    window.location.href = naverAuthUrl
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
                {/* <img
                  style={{ width: 20, height: 20 }}
                  src="data:image/jpeg;base64,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"
                ></img> */}
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

const RegisterForm: React.FC<RegisterFormProps> = ({ setActiveTab }) => {
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
  const [verificationVisible, setVerificationVisible] = useState(false)
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
