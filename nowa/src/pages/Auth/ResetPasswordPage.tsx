import { useState } from 'react'
// import { resetPassword } from '../../api/userApi'
import TextInput from '../../components/TextInput/textInput'
import { useNavigate } from 'react-router-dom'

const ResetPasswordPage = () => {
  const [userId, setUserId] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleResetPassword = async () => {
    try {
      setMessage('비밀번호가 성공적으로 재설정되었습니다.')
      setTimeout(() => navigate('/auth'), 2000) // 재설정 후 로그인 페이지로 리다이렉트
    } catch (error) {
      setMessage('비밀번호 재설정에 실패했습니다.')
      console.error('비밀번호 재설정 실패:', error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="card w-96 shadow-xl p-5 bg-gray-50">
        <h2 className="text-lg font-bold mb-4">비밀번호 재설정</h2>
        <TextInput
          type="text"
          placeholder="사용자 ID"
          onChange={(e) => setUserId(e.target.value)}
          value={userId}
          className="mb-4"
        />
        <TextInput
          type="password"
          placeholder="새로운 비밀번호"
          onChange={(e) => setNewPassword(e.target.value)}
          value={newPassword}
          className="mb-4"
        />
        <button
          className="btn btn-primary mt-4 mb-2"
          onClick={handleResetPassword}
        >
          재설정
        </button>
        {message && (
          <div className="text-green-500 text-sm mt-2">{message}</div>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordPage
//  마이페이지 하위 기능으로 병합 예정
