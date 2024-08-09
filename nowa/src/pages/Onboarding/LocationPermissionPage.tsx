import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/button';
import { FaMapMarkerAlt } from 'react-icons/fa';
import './styles.css';

const LocationPermissionPage: React.FC = () => {
  const [locationError, setLocationError] = useState('');
  const [nickname, setNickname] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [animate, setAnimate] = useState(false);
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
          navigate('/onboarding/friend-addition'); // 위치 정보 연결 후 /onboarding/friend-addition으로
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

  useEffect(() => {
    setAnimate(true);
  }, []);

  const getRandomPosition = () => {
    const top = Math.floor(Math.random() * 50) + 10; // 10%에서 60% 사이의 랜덤한 위치
    const left = Math.floor(Math.random() * 80) + 10; // 10%에서 90% 사이의 랜덤한 위치
    return { top: `${top}%`, left: `${left}%` };
  };

  return (
    <div className="relative min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/images/Locationbackground2.png')" }}>
      <div className="absolute inset-0 flex items-start justify-center bg-black bg-opacity-30 pt-64">
        <h2 className="text-2xl font-bold text-white mt-8">{nickname}님, 위치를 연결할까요?</h2>
      </div>
      <div className="relative z-50 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-full h-full">
            {[1, 2, 3].map((index) => {
              const position = getRandomPosition();
              return (
                <FaMapMarkerAlt
                  key={index}
                  className={`absolute w-16 h-16 text-red-500 ${animate ? 'drop-animation' : ''}`}
                  style={{ top: position.top, left: position.left }}
                />
              );
            })}
          </div>
          <Button
            onClick={handleLocationPermission}
            className="btn-primary text-base mt-16 w-64 h-14 bg-yellow-300 hover:bg-yellow-400 border-none"
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
    </div>
  );
};

export default LocationPermissionPage;
