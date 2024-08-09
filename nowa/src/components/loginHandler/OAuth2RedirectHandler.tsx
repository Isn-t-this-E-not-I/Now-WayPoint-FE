import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const nickname = urlParams.get('nickname');

    console.log('Token:', token);  // 로그 추가
    console.log('Nickname:', nickname);  // 로그 추가

    if (token && nickname) {
      localStorage.setItem('token', token);
      localStorage.setItem('nickname', nickname);
      console.log('Token and nickname stored in localStorage');
      navigate('/main'); // 리다이렉트
    } else {
      // 오류 처리
      console.error('Token or nickname not found in URL parameters');
      navigate('/login');
    }
  }, [navigate]);

  return <div>Loading...</div>; // 또는 로딩 스피너 등을 표시
};

export default OAuth2RedirectHandler;