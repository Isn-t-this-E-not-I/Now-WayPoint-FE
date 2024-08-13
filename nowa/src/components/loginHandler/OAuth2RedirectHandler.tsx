import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const nickname = urlParams.get('nickname');
    const isFistLogin = urlParams.get('isFirstLogin');

    if (token && nickname) {
      localStorage.setItem('token', token);
      localStorage.setItem('nickname', nickname);
      
      if(isFistLogin === 'true'){
        navigate('/onboarding/location-permission');
      }else {
        navigate('/main');
      }
    } else {
      // 오류 처리
      console.error('Token or nickname not found in URL parameters');
      navigate('/auth');
    }
  }, [navigate]);

  return <div>Loading...</div>; // 또는 로딩 스피너 등을 표시
};

export default OAuth2RedirectHandler;