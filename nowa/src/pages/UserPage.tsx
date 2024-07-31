import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import defaultProfileImage from '../../../defaultprofile.png';
import Posts from '../components/Posts/Posts';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100vh;
  padding: 20px;
`;

const ProfileSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const ContentSection = styled.div`
  flex: 5;
  padding: 20px;
  margin-left: 30px;
  margin-right: 30px;
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-top: 30px;
  margin-bottom: 30px;
`;

const ProfileInfo = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const Stats = styled.div`
  margin-top: 10px;
  margin-bottom: 20px;
`;

const StatItem = styled.div`
  margin-bottom: 5px;
  cursor: pointer;
`;

const Description = styled.p`
  margin-top: 10px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 20px;
`;

const NicknameTitle = styled.h3`
  font-size: 16px;
`;

interface UserProfile {
  nickname: string;
  profileImageUrl: string;
  description: string;
  followers: number;
  followings: number;
  postCount: number;
  posts: { id: number; mediaUrls: string[]; createdAt: string }[];
}

const UserPage: React.FC = () => {
  const { nickname } = useParams<{ nickname: string }>();
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('posts');
  const location = import.meta.env.VITE_APP_API;

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get(`${location}/user?nickname=${nickname}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('User API Response:', response);

      setUserInfo({
        nickname: response.data.nickname,
        profileImageUrl: response.data.profile_image_url || defaultProfileImage,
        description: response.data.description,
        followers: parseInt(response.data.followers, 10),
        followings: parseInt(response.data.followings, 10),
        postCount: response.data.posts ? response.data.posts.length : 0,
        posts: response.data.posts
          ? response.data.posts.map((post: any) => ({
              id: post.id,
              mediaUrls: post.mediaUrls,
              createdAt: post.createdAt,
            }))
          : [],
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [nickname]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userInfo) {
    return <div>Failed to load user data</div>;
  }

  return (
    <Container>
      <ProfileSection>
        <ProfileImage src={userInfo.profileImageUrl} alt="Profile" />
        <ProfileInfo>
          <NicknameTitle>{userInfo.nickname}</NicknameTitle>
          <Stats>
            <StatItem onClick={() => setSelectedTab('posts')}>게시글 {userInfo.postCount}</StatItem>
            <StatItem onClick={() => setSelectedTab('followings')}>팔로잉 {userInfo.followings}</StatItem>
            <StatItem onClick={() => setSelectedTab('followers')}>팔로워 {userInfo.followers}</StatItem>
          </Stats>
          <Description>{userInfo.description}</Description>
        </ProfileInfo>
      </ProfileSection>
      <ContentSection>
        {selectedTab === 'posts' && (
          <>
            <SectionTitle>게시글</SectionTitle>
            <Posts posts={userInfo.posts} />
          </>
        )}
      </ContentSection>
    </Container>
  );
};

export default UserPage;