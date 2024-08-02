import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import defaultProfileImage from '../../../defaultprofile.png';
import Posts from '../components/Posts/Posts';
import UserFollowList from '../components/FollowList/UserFollowList';
import { getCommentsByPostId } from '../services/comments';

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

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

interface Post {
  id: number;
  mediaUrls: string[];
  createdAt: string;
  category: string;
  likeCount: number;
  commentCount: number; // 댓글 수 추가
}

interface UserProfile {
  nickname: string;
  profileImageUrl: string;
  description: string;
  followers: number;
  followings: number;
  postCount: number;
  posts: Post[];
  followersList: {
    isFollowing: boolean;
    name: string;
    nickname: string;
    profileImageUrl: string;
  }[];
  followingsList: {
    isFollowing: boolean;
    name: string;
    nickname: string;
    profileImageUrl: string;
  }[];
  allUsers: {
    isFollowing: boolean;
    name: string;
    nickname: string;
    profileImageUrl: string;
  }[];
}

const UserPage: React.FC = () => {
  const { nickname } = useParams<{ nickname: string }>();
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('posts');
  const [searchQuery, setSearchQuery] = useState('');
  const location = import.meta.env.VITE_APP_API;
  const locations = useLocation();

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      console.log('Fetching user data...');
      const response = await axios.get(`${location}/user?nickname=${nickname}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('User API Response:', response);

      const userData = response.data;

      console.log(`Fetching following data for ${nickname}...`);
      const followingResponse = await axios.get(`${location}/follow/following?nickname=${nickname}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Following API Response:', followingResponse);

      console.log(`Fetching follower data for ${nickname}...`);
      const followerResponse = await axios.get(`${location}/follow/follower?nickname=${nickname}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Follower API Response:', followerResponse);

      console.log('Fetching all users...');
      const allUsersResponse = await axios.get(`${location}/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('All Users API Response:', allUsersResponse);

      const allUsers = allUsersResponse.data.map((user: any) => ({
        isFollowing: followingResponse.data.some(
          (followingUser: any) => followingUser.nickname === user.nickname
        ),
        ...user,
      }));

      // 각 게시글의 댓글 수를 가져와서 posts 배열에 추가
      const postsWithCommentCounts = await Promise.all(
        userData.posts.map(async (post: any) => {
          const comments = await getCommentsByPostId(post.id);
          return {
            id: post.id,
            mediaUrls: post.mediaUrls,
            createdAt: post.createdAt,
            category: post.category,
            likeCount: post.likeCount,
            commentCount: comments.length, // 댓글 수 추가
          };
        })
      );

      setUserInfo({
        nickname: userData.nickname,
        profileImageUrl: userData.profileImageUrl || defaultProfileImage,
        description: userData.description,
        followers: parseInt(userData.follower, 10),
        followings: parseInt(userData.following, 10),
        postCount: userData.posts ? userData.posts.length : 0,
        posts: postsWithCommentCounts,
        followersList: followerResponse.data
          ? followerResponse.data.map((user: any) => ({
              isFollowing: true,
              name: user.name,
              nickname: user.nickname,
              profileImageUrl: user.profileImageUrl || defaultProfileImage,
            }))
          : [],
        followingsList: followingResponse.data
          ? followingResponse.data.map((user: any) => ({
              isFollowing: true,
              name: user.name,
              nickname: user.nickname,
              profileImageUrl: user.profileImageUrl || defaultProfileImage,
            }))
          : [],
        allUsers,
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setLoading(false);
    }
  };

  const handleFollow = async (nickname: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const location = import.meta.env.VITE_APP_API;
      const response = await fetch(`${location}/follow/add`, {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname }),
      });

      if (response.ok) {
        setUserInfo((prevUserInfo) => {
          if (!prevUserInfo) return prevUserInfo;
          return {
            ...prevUserInfo,
            // followings: prevUserInfo.followings + 1,
            followingsList: prevUserInfo.followingsList.map((user) =>
              user.nickname === nickname ? { ...user, isFollowing: true } : user
            ),
            followersList: prevUserInfo.followersList.map((user) =>
              user.nickname === nickname ? { ...user, isFollowing: true } : user
            ),
            allUsers: prevUserInfo.allUsers.map((user) =>
              user.nickname === nickname ? { ...user, isFollowing: true } : user
            ),
          };
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUnfollow = async (nickname: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const location = import.meta.env.VITE_APP_API;
      const response = await fetch(`${location}/follow/cancel`, {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname }),
      });

      if (response.ok) {
        setUserInfo((prevUserInfo) => {
          if (!prevUserInfo) return prevUserInfo;
          return {
            ...prevUserInfo,
            // followings: prevUserInfo.followings - 1,  //*
            followingsList: prevUserInfo.followingsList.map((user) =>
              user.nickname === nickname ? { ...user, isFollowing: false } : user
            ),
            followersList: prevUserInfo.followersList.map((user) =>
              user.nickname === nickname ? { ...user, isFollowing: false } : user
            ),
            allUsers: prevUserInfo.allUsers.map((user) =>
              user.nickname === nickname ? { ...user, isFollowing: false } : user
            ),
          };
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
    setSelectedTab('posts');
  }, [nickname]);

  useEffect(() => {
    const params = new URLSearchParams(locations.search);
    const tab = params.get('tab');
    setSelectedTab(tab || 'posts');
  }, [locations.search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredFollowings = userInfo?.followingsList.filter((user) =>
    user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFollowers = userInfo?.followersList.filter((user) =>
    user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <StatItem onClick={() => setSelectedTab('posts')}>
              게시글 {userInfo.postCount}
            </StatItem>
            <StatItem onClick={() => setSelectedTab('followings')}>
              팔로잉 {userInfo.followings}
            </StatItem>
            <StatItem onClick={() => setSelectedTab('followers')}>
              팔로워 {userInfo.followers}
            </StatItem>
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
            <SearchInput
              type="text"
              placeholder="검색"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <UserFollowList
              users={filteredFollowings || userInfo.followingsList}
              searchQuery={searchQuery}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
            />
          </>
        )}
        {selectedTab === 'followers' && (
          <>
            <SectionTitle>팔로워</SectionTitle>
            <SearchInput
              type="text"
              placeholder="검색"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <UserFollowList
              users={filteredFollowers || userInfo.followersList}
              searchQuery={searchQuery}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
            />
          </>
        )}
      </ContentSection>
    </Container>
  );
};

export default UserPage;
