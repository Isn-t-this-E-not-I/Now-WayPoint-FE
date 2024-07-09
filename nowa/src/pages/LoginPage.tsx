import React, { useState } from 'react';
import { login, loginWithKakao } from '../api/userApi';
import TextInput from '../components/TextInput/TextInput';
import ThemeController from '../components/ThemeController/ThemeController';


const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const handleLogin = async () => {
    try {
      const data = await login({ email, password });
      console.log('Login success:', data);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleKakaoLogin = async () => {
    try {
      const data = await loginWithKakao();
      window.location.href = data.url; // 카카오 로그인 페이지로 리디렉트
    } catch (error) {
      console.error('Kakao login failed:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="card w-96 shadow-xl p-5 bg-gray-50">
        <h2 className="text-lg font-bold mb-4">로그인</h2>
        <TextInput type="email" placeholder="이메일" onChange={e => setEmail(e.target.value)} value={email} className="mb-4" />
        <TextInput type="password" placeholder="비밀번호" onChange={e => setPassword(e.target.value)} value={password} className="mb-4" />
        <div className="form-control flex items-center space-x-2">
          <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="checkbox checkbox-primary" />
          <span className="label-text">아이디 저장</span>
        </div>
        <button className="btn btn-primary mt-4 mb-2">로그인</button>
        <button className="btn btn-warning mt-4" onClick={handleKakaoLogin}>카카오 간편 로그인</button>
        <button className="btn btn-outline mt-4">회원가입</button> {/* 회원가입 버튼 스타일 수정 */}
      </div>
    </div>
  );
};

export default LoginPage;
