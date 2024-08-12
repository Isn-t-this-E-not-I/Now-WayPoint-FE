import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addFollow } from '../../api/userApi';
import Button from '../../components/Button/button';
import { FaPlus, FaCheck, FaMinus } from "react-icons/fa";

interface User {
  name: string;
  nickname: string;
  profileImageUrl: string;
  distance: string;
}

const DistanceAddPage: React.FC = () => {
  const [recommendedFriends, setRecommendedFriends] = useState<User[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<User[]>([]);
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendedFriends = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const location = import.meta.env.VITE_APP_API
          const response = await fetch(`${location}/user/locate`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

            const textResponse = await response.text();
            console.log('Raw Response:', textResponse);

            const users = JSON.parse(textResponse);
            console.log('Parsed JSON:', users);

            const filteredUsers = users.filter((user: any) => user.nickname !== nickname);

          
          const mappedUsers = filteredUsers.map((user: any) => ({
            name: user.name,
            nickname: user.nickname,
            profileImageUrl: user.profileImageUrl,
            distance: '1km', // placeholder
          }));

          setRecommendedFriends(mappedUsers);
          console.log('Mapped Users:', mappedUsers);
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
    <div className="relative min-h-screen bg-cover bg-center bg-blue-300">
      <h2 className="text-2xl font-bold mb-12 text-white text-center pt-40">
        {nickname}님의 위치를 기반으로 주변에 있는 유저를 추천드릴게요
      </h2>
      <div className="flex justify-center space-x-8">
      <div className="bg-white shadow-md rounded-lg p-6 max-h-96" style={{ width: '360px' }}>
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
                  <p className="text-gray-500 text-sm">{user.distance}</p>
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
        <div className="bg-white shadow-md rounded-lg p-6 max-h-96" style={{ width: '360px' }}>
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
                  <p className="text-gray-500 text-sm">{friend.distance}</p>
                </div>
              </div>
              <FaMinus
                onClick={() => handleRemoveFriend(friend.nickname)}
                className="text-red-500 cursor-pointer"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
      <div className="flex justify-center mt-8">
        <Button
          className="btn-primary text-base mt-4 w-64 h-14 bg-pink-500 text-white hover:bg-pink-600 border-none"
          onClick={handleAddFollow}
        >
          친구 {selectedFriends.length}명 추가
        </Button>
      </div>
    </div>
  );
};

export default DistanceAddPage;