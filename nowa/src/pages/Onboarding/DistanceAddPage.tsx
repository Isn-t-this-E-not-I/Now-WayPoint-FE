import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addFollow } from '../../api/userApi';
import Button from '../../components/Button/button';
import { FaPlus, FaCheck } from "react-icons/fa";
import './styles.css';

interface User {
  name: string;
  nickname: string;
  profileImageUrl: string;
  locate: string;
}

const DistanceAddPage: React.FC = () => {
  const [recommendedFriends, setRecommendedFriends] = useState<User[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<User[]>([]);
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();
  const locate = localStorage.getItem('locate');

  useEffect(() => {
    const fetchRecommendedFriends = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const location = import.meta.env.VITE_APP_API;
          const response = await fetch(`${location}/user/locate`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const textResponse = await response.text();

          const users = JSON.parse(textResponse);

          // 로그인한 유저를 추천 친구 목록에서 제외
          const filteredUsers = users.filter((user: any) => user.nickname !== nickname);

          const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const R = 6371; // Earth's radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c; // Distance in km
            return distance;
          };

          const mappedUsers = filteredUsers.map((user: any) => {
            let calculatedDistance = NaN;
            let distance;

            // Extract user location
            if (locate != null) {
              const [userLongitude, userLatitude] = locate.split(',').map(coord => parseFloat(coord.trim()));

              // Extract post location
              const [postLongitude, postLatitude] = user.locate.split(',').map((coord: string) => parseFloat(coord.trim()));

              // Calculate distance between user and post
              calculatedDistance = haversineDistance(userLatitude, userLongitude, postLatitude, postLongitude);

              // Round to three decimal places and convert to string with 'km'
              calculatedDistance = Math.floor(calculatedDistance);

              // Convert distances less than 1km to "0km"
              if (calculatedDistance < 1) {
                distance = "0km";
              } else {
                distance = `${calculatedDistance}km`;
              }
            }

            return {
              name: user.name,
              nickname: user.nickname,
              profileImageUrl: user.profileImageUrl,
              locate: distance
            };
          });

          setRecommendedFriends(mappedUsers);
        } else {
          console.error('No token found');
        }
      } catch (error) {
        console.error('Error fetching recommended friends:', error);
      }
    };

    fetchRecommendedFriends();
  }, [nickname]);

  const handleAddFriend = (friend: User) => {
    setSelectedFriends([...selectedFriends, friend]);
    setRecommendedFriends(recommendedFriends.filter(user => user.nickname !== friend.nickname));
  };

  const handleRemoveFriend = (nickname: string) => {
    const removedFriend = selectedFriends.find(friend => friend.nickname === nickname);
    if (removedFriend) {
      setSelectedFriends(selectedFriends.filter(friend => friend.nickname !== nickname));
      setRecommendedFriends([...recommendedFriends, removedFriend]);
    }
  };

  const handleAddFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await Promise.all(selectedFriends.map(friend => addFollow(token, friend.nickname)));
        navigate('/main');
      } else {
        console.error('No token found');
      }
    } catch (error) {
      console.error('Error adding follow:', error);
    }
  };

  useEffect(() => {
    const storedNickname = localStorage.getItem('nickname');
    if (storedNickname) {
      setNickname(storedNickname);
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-image">
      <h2 className="text-xl font-bold mb-12 text-gray-800 text-center pt-40">
        {nickname}님의 위치를 기반으로 주변에 있는 유저를 추천드릴게요
      </h2>
      <div className="flex justify-center space-x-8">
        <div className="bg-white shadow-md rounded-lg p-6 max-h-100" style={{ width: '360px' }}>
          <h3 className="text-base font-semibold text-center mb-4">나와 가까운 유저</h3>
          <ul className="overflow-y-auto max-h-80">
            {recommendedFriends.map((user: User) => (
              <li key={user.nickname} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-2">
                <div className="flex items-center">
                  <img 
                    src={user.profileImageUrl} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-full mr-4" 
                  />
                  <div className="text-sm text-black">
                    <p>{user.nickname} ({user.name})</p>
                    <p className="text-gray-500 text-sm">{user.locate}</p>
                  </div>
                </div>
                <FaPlus
                  onClick={() => handleAddFriend(user)}
                  className="text-blue-500 cursor-pointer"
                />
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 max-h-100" style={{ width: '360px' }}>
          <h3 className="text-base font-semibold text-center mb-4">선택된 유저</h3>
          <ul className="overflow-y-auto max-h-80">
            {selectedFriends.map((friend: User) => (
              <li key={friend.nickname} className="flex items-center justify-between p-4 bg-blue-100 rounded-lg mb-2">
                <div className="flex items-center">
                  <img 
                    src={friend.profileImageUrl} 
                    alt={friend.name} 
                    className="w-10 h-10 rounded-full mr-4" 
                  />
                  <div className="text-sm text-black">
                    <p>{friend.nickname} ({friend.name})</p>
                    <p className="text-gray-500 text-sm">{friend.locate}</p>
                  </div>
                </div>
                <FaCheck
                  onClick={() => handleRemoveFriend(friend.nickname)}
                  className="text-green-500 cursor-pointer"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex justify-center mt-8">
        <Button
          className="btn-primary text-base mt-4 w-64 h-14 bg-yellow-400 text-white hover:bg-yellow-300 border-none"
          onClick={handleAddFollow}
        >
          친구 {selectedFriends.length}명 추가
        </Button>
      </div>
    </div>
  );
};

export default DistanceAddPage;
