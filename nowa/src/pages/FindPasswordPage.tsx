import React, { useState } from 'react';
import { findPassword, sendVerificationCode, resetPassword } from '../api/userApi';
import TextInput from '../components/TextInput/textInput';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const FindPasswordPage = () => {
  const [userId, setUserId] = useState('');
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [authNumber, setAuthNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [receivedCode, setReceivedCode] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleFindPassword = async () => {
    try {
      // const userValid = await findPassword(userId, email);
      // if (userValid.exists) {
        console.log(email);
        console.log(loginId);
        const verificationResponse = await sendVerificationCode(loginId, email, '비밀번호찾기');
        console.log(verificationResponse.message);
        if (verificationResponse.message == '메일 전송 성공') { // 메일전송성공
          setReceivedCode(verificationResponse.message);  // .message를 넣었어요. ㅇㅋ 넘어가줌
          console.log(verificationResponse.data);
          setMessage("인증 코드가 이메일로 발송되었습니다. 코드를 입력해주세요.");
        } else {
          setMessage("인증 코드 발송에 실패했습니다.");
        }
      //  else {
      //   setMessage('일치하는 계정을 찾을 수 없습니다.');
      // }
      } catch (error) {
      setMessage('비밀번호 찾기에 실패했습니다.');
      console.error('비밀번호 찾기 실패:', error);
      }
    };

  const handleVerifyCode = async () => {
      const tempPassword = uuidv4();  // 임시 비밀번호 생성
      console.log(email, loginId, authNumber);
      const resetResponse = await resetPassword(email, loginId, authNumber);
      console.log(resetResponse.password);
      if (resetResponse.password) {
        setMessage(`임시 비밀번호 : ${tempPassword}`);
      } else {
        setMessage('임시 비밀번호 발급에 실패했습니다.');
      }
    // } else {
    //   setMessage('인증 코드가 일치하지 않습니다.');
    // }
  };  // 서버에 넘기면 알아서 임시비번 넘겨줌 넵 이걸 뜯어고쳐야한다

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="card w-96 shadow-xl p-5 bg-gray-50">
        <h2 className="text-lg font-bold mb-4">비밀번호 찾기</h2>
        <TextInput type="text" placeholder="아이디 입력" onChange={e => setLoginId(e.target.value)} value={loginId} className="mb-4" />
        <TextInput type="email" placeholder="이메일 입력" onChange={e => setEmail(e.target.value)} value={email} className="mb-4" />
        <button className="btn btn-primary mt-4 mb-2" onClick={handleFindPassword}>인증 코드 받기</button>
        {receivedCode && <TextInput type="text" placeholder="인증 코드 입력" onChange={e => setAuthNumber(e.target.value)} value={authNumber} className="mb-4" />}
        {receivedCode && <button className="btn btn-secondary mt-4 mb-2" onClick={handleVerifyCode}>인증 확인</button>}
        {message && <div className="text-green-500 text-sm mt-2">{message}</div>}
        <button className="btn btn-outline mt-4" onClick={() => navigate('/login')}>로그인 페이지로</button>
      </div>
    </div>
  );
};

export default FindPasswordPage;
