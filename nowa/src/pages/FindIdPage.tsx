import React, { useState } from 'react';
import { findIdByNickname } from '../api/userApi';
import TextInput from '../components/TextInput/TextInput';
import { useNavigate } from 'react-router-dom';

const FindIdPage = () => {
  const [nickname, setNickname] = useState('');
  const [foundId, setFoundId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFindId = async () => {
    try {
      const data = await findIdByNickname(nickname);
      setFoundId(data.id); // 예상. 테스트하고 수정
      console.log(data);
      // (이메일) 아이디 반환
      setError('');
    } catch (error) {
      setError('아이디 찾기 실패. 다시 시도해주세요.');
      console.error('ID 찾기 실패:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="card w-96 shadow-xl p-5 bg-gray-50">
        <h2 className="text-lg font-bold mb-4">아이디 찾기</h2>
        <TextInput type="text" placeholder="닉네임 입력" onChange={e => setNickname(e.target.value)} value={nickname} className="mb-4" />
        <button className="btn btn-primary mt-4 mb-2" onClick={handleFindId}>찾기</button>
        {foundId && <div className="text-green-500 text-sm mt-2">당신의 아이디: {foundId}</div>}
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        <button className="btn btn-outline mt-4" onClick={() => navigate('/login')}>로그인 페이지로</button>
      </div>
    </div>
  );
};

export default FindIdPage;
