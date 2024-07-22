import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextInput from '../components/TextInput/TextInput';
import { register, sendVerificationCode } from '../api/userApi';
// import { RegistrationErrorResponse } from '../api/userApi';

const RegisterPage: React.FC = () => {
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [authNumber, setAuthNumber] = useState('');
  const [receivedCode, setReceivedCode] = useState('');
  const [receivedAuthNumber, setReceivedAuthNumber] = useState('');
  const [verificationVisible, setVerificationVisible] = useState(false);  // 인증코드 숨김처리
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSendCode = async () => {
    if (loginId && email && password && name && nickname) {
      try {
        const verificationResponse = await sendVerificationCode(loginId, email, '회원가입');
        if (verificationResponse.message) {
          setReceivedCode(verificationResponse.message);
          setMessage('인증 코드가 이메일로 발송되었습니다. 코드를 확인해주세요.');
          setVerificationVisible(true);
        } else {
          setMessage('인증 코드 발송에 실패했습니다.');
        }
      } catch (error) {
        console.error('인증 코드 발송 에러:', error);
        setMessage('서버 에러가 발생했습니다.');
      }
    } else {
      setMessage('모든 필드를 채워주세요.');
    }
  };

  const handleVerifyCode = async () => {
      try {
        const response = await register({ loginId, email, password, name, nickname, authNumber });
        if (response.data === "ok") {
          navigate('/login');
        } else {
          alert('회원가입 실패: ' + response.data);
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('서버 에러가 발생했습니다.');
      }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="card w-96 shadow-xl p-5">
        <h2 className="text-lg font-bold mb-4">회원가입</h2>
        <TextInput type="text" placeholder="아이디" onChange={e => setLoginId(e.target.value)} value={loginId} className="mb-4" />
        <TextInput type="password" placeholder="비밀번호" onChange={e => setPassword(e.target.value)} value={password} className="mb-4" />
        <TextInput type="email" placeholder="이메일" onChange={e => setEmail(e.target.value)} value={email} className="mb-4" />
        <TextInput type="text" placeholder="이름" onChange={e => setName(e.target.value)} value={name} className="mb-4" />
        <TextInput type="text" placeholder="닉네임" onChange={e => setNickname(e.target.value)} value={nickname} className="mb-4" />
        {receivedCode && <TextInput type="text" placeholder="인증 코드 입력" onChange={e => setAuthNumber(e.target.value)} value={authNumber} className="mb-4" />}
        <button className="btn btn-primary w-full mt-4 mb-2" onClick={handleSendCode}>인증 코드 받기</button>
        {receivedCode && <button className="btn btn-secondary w-full mt-4 mb-2" onClick={handleVerifyCode}>인증 코드 검증</button>}
        {message && <div className="text-green-500 text-sm mt-2">{message}</div>}
        <button className="btn btn-outline w-full mt-4" onClick={() => navigate('/login')}>로그인 페이지로</button>
      </div>
    </div>
  );
};

export default RegisterPage;