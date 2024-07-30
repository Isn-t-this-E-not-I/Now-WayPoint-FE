import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/Button/button';
import styled from 'styled-components';
import defaultProfileImage from '../../../defaultprofile.png';
import Posts from '../components/Posts/Posts';
import FollowList from '../components/FollowList/FollowList';

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
  followersList: { name: string; nickname: string; profileImageUrl: string }[];
  followingsList: { name: string; nickname: string; profileImageUrl: string }[];
}

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('posts');
  const [searchQuery, setSearchQuery] = useState('');
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
      console.log('User API Response:', response);

      const followingResponse = await axios.get(`${location}/follow/following`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Following API Response:', followingResponse);

      const followerResponse = await axios.get(`${location}/follow/follower`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Follower API Response:', followerResponse);

      setUserInfo({
        nickname: response.data.nickname,
        profileImageUrl: response.data.profileImageUrl || defaultProfileImage,
        description: response.data.description,
        followers: parseInt(response.data.follower, 10),
        followings: parseInt(response.data.following, 10),
        postCount: response.data.posts ? response.data.posts.length : 0,
        posts: response.data.posts
          ? response.data.posts.map((post: any) => ({
              id: post.id,
              mediaUrls: post.mediaUrls,
              createdAt: post.createdAt,
            }))
          : [],
        followersList: followerResponse.data
          ? followerResponse.data.map((user: any) => ({
              name: user.name,
              nickname: user.nickname,
              profileImageUrl: user.profileImageUrl || defaultProfileImage,
            }))
          : [],
        followingsList: followingResponse.data
          ? followingResponse.data.map((user: any) => ({
              name: user.name,
              nickname: user.nickname,
              profileImageUrl: user.profileImageUrl || defaultProfileImage,
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
  }, []);

  const goToProfileEdit = () => {
    navigate('/mypage/profileEdit');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

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
        <Button className="btn-primary" onClick={goToProfileEdit}>
          프로필 편집
        </Button>
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
        {selectedTab === 'followings' && (
          <>
            <SectionTitle>팔로잉</SectionTitle>
            <input 
              type="text"
              placeholder="검색"
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '20px',
                border: '1px solid #ccc',
                borderRadius: '8px',
              }}
            />
            <FollowList followings={userInfo.followingsList} followers={[]} isFollowingList={true} searchQuery={searchQuery} />
          </>
        )}
        {selectedTab === 'followers' && (
          <>
            <SectionTitle>팔로워</SectionTitle>
            <input 
              type="text"
              placeholder="검색"
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '20px',
                border: '1px solid #ccc',
                borderRadius: '8px',
              }}
            />
            <FollowList followings={[]} followers={userInfo.followersList} isFollowingList={false} searchQuery={searchQuery} />
          </>
        )}
      </ContentSection>
    </Container>
  );
};

export default MyPage;
