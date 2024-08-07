// src/pages/Onboarding/LocationPermissionPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/button';

const LocationPermissionPage: React.FC = () => {
  const [locationError, setLocationError] = useState('');
  const [nickname, setNickname] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedNickname = localStorage.getItem('nickname');
    if (storedNickname) {
      setNickname(storedNickname);
    }
  }, []);

  const handleLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location accessed:', position);
          navigate('/main'); // 위치 정보 연결 후 /main으로
        },
        (error) => {
          console.error('Error accessing location:', error);
          setLocationError('위치 정보를 가져올 수 없습니다. 위치 정보 사용에 동의해주세요.');
        }
      );
    } else {
      setLocationError('이 브라우저는 위치 정보를 지원하지 않습니다.');
    }
  };

  return (
    <div className="relative min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/images/Locationbackground.png')" }}>
      <div className="absolute inset-0 flex items-start justify-center bg-black bg-opacity-50 pt-64">
        <h2 className="text-2xl font-semibold text-white">{nickname}님, 위치를 연결할까요?</h2>
      </div>
        <div className="relative z-50 flex flex-col items-center justify-center min-h-screen">
          <Button
            onClick={handleLocationPermission}
            className="btn-primary text-lg mt-16 w-64 h-14 bg-yellow-300 hover:bg-yellow-400 border-none"
          >
            내 위치 연결하기
          </Button>
          {locationError && (
            <div className="text-red-500 mt-4">
              {locationError}
        </div>
          )}
        </div>
    </div>
  );
};


export default LocationPermissionPage;