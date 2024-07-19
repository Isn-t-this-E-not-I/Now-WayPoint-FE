import React, { useState } from 'react';
import { findPasswordByEmail } from '../api/userApi';
import TextInput from '../components/TextInput/TextInput';
import { useNavigate } from 'react-router-dom';

const FindPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleFindPassword = async () => {
    try {
      const data = await findPasswordByEmail(email);
      setMessage(data.message); // 예상 응답 필드
    } catch (error) {
      setMessage('비밀번호 찾기에 실패했습니다.');
      console.error('비밀번호 찾기 실패:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="card w-96 shadow-xl p-5 bg-gray-50">
        <h2 className="text-lg font-bold mb-4">비밀번호 찾기</h2>
        <TextInput type="email" placeholder="이메일 입력" onChange={e => setEmail(e.target.value)} value={email} className="mb-4" />
        <button className="btn btn-primary mt-4 mb-2" onClick={handleFindPassword}>찾기</button>
        {message && <div className="text-green-500 text-sm mt-2">{message}</div>}
        <button className="btn btn-outline mt-4" onClick={() => navigate('/login')}>로그인 페이지로</button>
      </div>
    </div>
  );
};

export default FindPasswordPage;
