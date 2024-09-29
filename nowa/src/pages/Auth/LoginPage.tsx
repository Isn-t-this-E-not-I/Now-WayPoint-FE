import React, { useState, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { login, sendLoginInfo } from '../../api/userApi'
import TextInput from '../../components/TextInput/textInput'
import { useNavigate } from 'react-router-dom'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import { NowaIcon } from '@/components/icons/icons'
import image from '@/assets/loginImage.png'

const LoginPage: React.FC = () => {
  const [loginId, setLoginId] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [, setNickname] = useState('')
  const [rememberMe, setRememberMe] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const location = import.meta.env.VITE_APP_API
  const [cookies, setCookie, removeCookie] = useCookies(['rememberedLoginId'])
  const [hidePassword, setHidePassword] = useState(true)

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

  const onToggleHide = () => {
    setHidePassword(!hidePassword)
  }

  const goToRegister = () => navigate('/register')
  const goToFindId = () => navigate('/find-id')
  const goToFindPassword = () => navigate('/find-password')

  return (
    <div
      className="flex flex-col items-end pr-80 justify-center min-h-screen bg-white"
      style={{
        overflow: 'hidden',
        backgroundImage: `url('https://media.discordapp.net/attachments/1255337590106619946/1272606721541541940/Locationbackground.png?ex=66bb96de&is=66ba455e&hm=e4b1b7c514db33aef891cc51702113dae6cb1cae9b6786b14ed16f3f5e7a4327&=&format=webp&quality=lossless&width=1870&height=1138')`,
        backgroundSize: 'cover', // 이미지가 요소를 덮도록 설정
        backgroundRepeat: 'no-repeat', // 이미지 반복 방지
        backgroundPosition: 'center', // 이미지가 중앙에 위치
        height: '100%', // 부모 요소에 맞게 높이 설정
        width: '100%', // 부모 요소에 맞게 너비 설정
      }}
    >
      <div
        className="card absolute shadow-xl p-5 bg-gray-50"
        style={{
          width: '81.25rem',
          height: '46.875rem',
          border: '2px solid #ccc',
          right: '18.75rem',
        }}
      >
        <div
          className="flex flex-col pr-80 absolute ml-10 justify-center min-h-96 bg-gray-50"
          style={{
            overflow: 'hidden',
            backgroundImage: `url(${image})`,
            backgroundSize: 'contain', // 이미지가 요소의 크기에 맞게 조정됨
            backgroundRepeat: 'no-repeat', // 이미지 반복 방지
            backgroundPosition: 'center', // 이미지가 중앙에 위치
            height: '600px', // 높이를 500px로 조정
            width: '700px', // 너비를 500px로 조정
          }}
        ></div>
        <div
          className="card w-96 shadow-xl p-5 bg-gray-50 mt-20"
          style={{ border: '2px solid #ccc', zIndex: 1000, right: '-800px' }}
        >
          <h2 className="text-lg font-bold mb-4">로그인</h2>
          <TextInput
            type="email"
            placeholder="이메일"
            onChange={(e) => setLoginId(e.target.value)}
            value={loginId}
            className="mb-4"
          />
          <div className="relative w-full mb-2">
            <TextInput
              type={hidePassword ? 'password' : 'text'}
              placeholder="비밀번호"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="mb-4"
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
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          <button className="btn btn-primary mt-4" onClick={handleLogin}>
            로그인
          </button>
          <button className="btn btn-warning mt-2" onClick={handleKakaoLogin}>
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
        </div>
        <div
          className="absolute bottom-10 left-10 flex flex-col items-start"
          style={{ zIndex: 1 }}
        >
          <div className="flex items-center text-black font-bold text-4xl">
            <NowaIcon theme={'light'} />
          </div>
          <div className="text-black text-xl mb-20 ml-4">
            모르는 사이에 내 주변에 생겨나는 이야기를 주워보자!
          </div>
        </div>
      </div>
      <div
        className="card absolute shadow-xl p-5 bg-gray-50"
        style={{
          width: '400px',
          height: '600px',
          border: '2px solid #ccc',
          zIndex: 2,
          right: '350px',
        }}
      ></div>
    </div>
  )
}

export default LoginPage
