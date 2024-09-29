import { useState } from 'react'
import { findId, sendVerificationCode } from '../../api/userApi'
import TextInput from '../../components/TextInput/textInput'
import { useNavigate } from 'react-router-dom'
import { IoIosArrowBack } from 'react-icons/io'
import './styles.css'

const FindIdPage = () => {
  const [email, setEmail] = useState('')
  const [foundId, setFoundId] = useState('')
  const [authNumber, setAuthNumber] = useState('')
  const [receivedCode, setReceivedCode] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRequestAuthNumber = async () => {
    try {
      setFoundId('')
      const response = await sendVerificationCode(email, '아이디찾기', '')
      if (response.message) {
        setReceivedCode(response.message)
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
        <h2 className="text-base text-center font-bold mb-10">아이디 찾기</h2>
        <TextInput
          type="email"
          placeholder="이메일 입력"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className="mb-4"
          style={{ color: 'black', backgroundColor: '#EAF0F7', border: 'none' }}
        />
        <button
          className="btn btn-primary mt-2 mb-2"
          style={{
            backgroundColor: '#1778F2',
            color: 'white',
            borderColor: '#1778F2',
            borderWidth: '0px',
            fontWeight: '900',
            fontSize: '15px',
          }}
          onClick={handleRequestAuthNumber}
        >
          인증 코드 받기
        </button>
        {receivedCode && (
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
        )}
        {receivedCode && (
          <button
            className="btn btn-primary mt-2"
            onClick={handleVerifyAuthNumber}
            style={{
              backgroundColor: '#1778F2',
              color: 'white',
              borderColor: '#1778F2',
              borderWidth: '0px',
              fontWeight: '900',
              fontSize: '15px',
            }}
          >
            인증 확인
          </button>
        )}
        {foundId && (
          <div className="text-green-500 text-sm mt-2">아이디: {foundId}</div>
        )}
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {/* <button
          className="btn btn-outline mt-4"
          onClick={() => navigate('/login')}
        >
          로그인 페이지로
        </button> */}
      </div>
    </div>
  )
}

export default FindIdPage
