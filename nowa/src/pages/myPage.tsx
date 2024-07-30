// src/pages/MyPage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/Button/button';
import styled from 'styled-components';
import defaultProfileImage from '../../../defaultprofile.png';

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-right: 1px solid #ccc;
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 10px;
`;

const ProfileInfo = styled.div`
  text-align: center;
`;

const Stats = styled.div`
  margin-top: 10px;
`;

const StatItem = styled.div`
  margin-bottom: 5px;
`;

const Description = styled.p`
  margin-top: 10px;
`;

interface UserProfile {
  nickname: string;
  profileImageUrl: string;
  description: string;
  followers: number;
  followings: number;
  postCount: number;
}

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = import.meta.env.VITE_APP_API;

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`${location}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('API Response:', response); // 콘솔 로그 추가

      setUserInfo({
        nickname: response.data.nickname,
        profileImageUrl: response.data.profileImageUrl || defaultProfileImage,
        description: response.data.description,
        followers: parseInt(response.data.follower, 10),
        followings: parseInt(response.data.following, 10),
        postCount: response.data.posts ? response.data.posts.length : 0,
      });

      console.log('UserInfo:', {
        nickname: response.data.nickname,
        profileImageUrl: response.data.profileImageUrl || defaultProfileImage,
        description: response.data.description,
        followers: parseInt(response.data.follower, 10),
        followings: parseInt(response.data.following, 10),
        postCount: response.data.posts ? response.data.posts.length : 0,
      }); // 콘솔 로그 추가

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const goToProfileEdit = () => {
    navigate('/mypage/profileEdit');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userInfo) {
    return <div>Failed to load user data</div>;
  }

  return (
    <div style={{ display: 'flex' }}>
      <ProfileSection>
        <ProfileImage 
          src={userInfo.profileImageUrl} 
          alt="Profile" 
        />
        <Button className="btn-primary" onClick={goToProfileEdit}>
          프로필 편집
        </Button>
        <ProfileInfo>
          <h3>{userInfo.nickname}</h3>
          <Stats>
            <StatItem>팔로잉: {userInfo.followings}</StatItem>
            <StatItem>팔로워: {userInfo.followers}</StatItem>
            <StatItem>게시글: {userInfo.postCount}</StatItem>
          </Stats>
          <Description>{userInfo.description}</Description>
        </ProfileInfo>
      </ProfileSection>
      {/* 오른쪽 게시글 부분은 여기에 추가됩니다. */}
    </div>
  );
};

export default MyPage;
