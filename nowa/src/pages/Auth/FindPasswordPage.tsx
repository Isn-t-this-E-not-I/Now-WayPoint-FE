import { useState } from 'react'
import { findPassword, sendVerificationCode } from '../../api/userApi'
import TextInput from '../../components/TextInput/textInput'
import { useNavigate } from 'react-router-dom'
import { IoIosArrowBack } from 'react-icons/io'
import './styles.css'

const FindPasswordPage = () => {
  const [loginId, setLoginId] = useState('')
  const [email, setEmail] = useState('')
  const [authNumber, setAuthNumber] = useState('')
  const [receivedCode, setReceivedCode] = useState('')
  const [message, setMessage] = useState('')
  const [, setTempPassword] = useState('')
  const navigate = useNavigate()

  const handleFindPassword = async () => {
    try {
      const verificationResponse = await sendVerificationCode(
        email,
        '비밀번호찾기',
        loginId
      )
      if (verificationResponse.message === '메일 전송 성공') {
        setReceivedCode(verificationResponse.message)
        setMessage('인증 코드가 이메일로 발송되었습니다. 코드를 입력해주세요.')
      } else {
        setMessage('인증 코드 발송에 실패했습니다.')
      }
    } catch (error) {
      setMessage('비밀번호 찾기에 실패했습니다.')
      console.error('비밀번호 찾기 실패:', error)
    }
  }

  const handleVerifyCode = async () => {
    try {
      const resetResponse = await findPassword(loginId, email, authNumber)
      if (resetResponse.password) {
        setTempPassword(resetResponse.password)
        setMessage(`임시 비밀번호가 발급되었습니다: ${resetResponse.password}`)
      } else {
        setMessage('임시 비밀번호 발급에 실패했습니다.')
      }
    } catch (error) {
      setMessage('비밀번호 재설정에 실패했습니다.')
      console.error('비밀번호 재설정 실패:', error)
    }
  }

  // const handleResetPassword = async () => {
  //   try {
  //     const resetResponse = await resetPassword(email, authNumber, tempPassword)
  //     if (resetResponse.message === '비밀번호 재설정 성공') {
  //       setMessage('비밀번호가 성공적으로 재설정되었습니다.')
  //     } else {
  //       setMessage('비밀번호 재설정에 실패했습니다.')
  //     }
  //   } catch (error) {
  //     setMessage('비밀번호 재설정에 실패했습니다.')
  //     console.error('비밀번호 재설정 실패:', error)
  //   }
  // }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-image">
      <div
        className="flex justify-end w-full"
        style={{ marginTop: '4rem', marginRight: '42rem' }}
      >
        <a
          href="#"
          className="flex items-center mr-8"
          style={{
            color: '#1778F2',
            fontWeight: '900',
            fontSize: '20px',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/auth')}
        >
          <IoIosArrowBack style={{ marginRight: '4px' }} />
        </a>
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
        style={{ marginTop: '8rem', marginLeft: '40rem', minHeight: '590px' }}
      >
        <h2 className="text-base text-center font-bold mb-10">비밀번호 찾기</h2>
        <TextInput
          type="text"
          placeholder="아이디 입력"
          onChange={(e) => setLoginId(e.target.value)}
          value={loginId}
          className="mb-4"
          style={{ color: 'black', backgroundColor: '#EAF0F7', border: 'none' }}
        />
        <TextInput
          type="email"
          placeholder="이메일 입력"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className="mb-4"
          style={{ color: 'black', backgroundColor: '#EAF0F7', border: 'none' }}
        />
        <button
          className="btn btn-primary mt-4 mb-2"
          style={{
            backgroundColor: '#1778F2',
            color: 'white',
            borderColor: '#1778F2',
            borderWidth: '0px',
            fontWeight: '900',
            fontSize: '15px',
          }}
          onClick={handleFindPassword}
        >
          인증 코드 받기
        </button>
        {receivedCode && (
          <>
            <TextInput
              type="text"
              placeholder="인증 코드 입력"
              onChange={(e) => setAuthNumber(e.target.value)}
              value={authNumber}
              className="mt-2 mb-4"
              style={{
                color: 'black',
                backgroundColor: '#EAF0F7',
                border: 'none',
              }}
            />
            <button
              className="btn btn-secondary mt-4 mb-2"
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
              인증 확인
            </button>
          </>
        )}
        {/* {tempPassword && (
          <button
            className="btn btn-primary mt-4 mb-2"
            style={{ backgroundColor: '#1778F2', color: 'white', borderColor: '#1778F2', borderWidth: '0px', fontWeight: '900', fontSize: '15px'}}
            onClick={handleResetPassword}
          >
            비밀번호 재설정
          </button>
        )} */}
        {message && (
          <div className="text-green-500 text-sm mt-2">{message}</div>
        )}
        {/* <button
          className="btn btn-outline mt-2"
          style={{ backgroundColor: '#1778F2', color: 'white', borderColor: '#1778F2', borderWidth: '0px', fontWeight: '900', fontSize: '15px'}}
          onClick={() => navigate('/login')}
        >
          로그인 페이지로
        </button> */}
      </div>
    </div>
  )
}

export default FindPasswordPage
