import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Outlet, useNavigate } from 'react-router-dom';
import { NowaIcon, ExitIcon } from './components/icons/icons';
import Modal from './components/Modal/modal';
import Button from './components/Button/button';
import { handleLogout } from './components/Logout/Logout';
import axios from 'axios';
import defaultProfileImage from '../../defaultprofile.png';

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  flex-direction: column;
`;

const MainContainer = styled.div`
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 3;  
  height: 100%;
`;

const LeftSidebar = styled.div`
  width: 250px;
  background-color: #f8faff;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
`;

const RightSidebar = styled.div`
  width: 250px;
  background-color: #f8faff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding-left: 2rem;
  box-sizing: border-box;
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 990px;
  height: 95vh;
  background-color: #ffffff;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  z-index: 100;
`;

const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
`;

const ProfileImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 10px;
`;

const Nickname = styled.span`
  font-weight: bold;
  font-size: 14px;
`;

const LoginId = styled.span`
  color: #888;
  font-size: 14px;
`;

const Name = styled.span`
  color: #888;
  font-size: 14px;
`;

const LogOutIconButtonWrapper = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding-bottom: 1.5rem;
  display: flex;
  align-items: center;
  margin-left: auto; /* 로그아웃 버튼을 오른쪽으로 정렬 */
`;

const RecommendationsContainer = styled.div`
  width: 100%;
  margin-top: 20px;
`;

const RecommendationTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const RecommendationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
`;

const RecommendationItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  width: 100%;
`;

const FollowButton = styled(Button)`
  margin-left: auto;
  margin-bottom: 0.8rem;
  padding: 0.3rem 0.8rem;
`;

const MainLayout: React.FC = () => {
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<null | {
    profileImageUrl: string;
    nickname: string;
    loginId: string;
  }>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const navigate = useNavigate();
  const location = import.meta.env.VITE_APP_API;

  useEffect(() => {
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

        setUserInfo({
          profileImageUrl: response.data.profileImageUrl || defaultProfileImage,
          nickname: response.data.nickname,
          loginId: response.data.loginId, // loginId를 표시
        });

        // 추천 친구 목록 가져오기
        const allUsersResponse = await axios.get(`${location}/user/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const followingResponse = await axios.get(`${location}/follow/following`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const followingNicknames = followingResponse.data.map((user: any) => user.nickname);

        const notFollowingUsers = allUsersResponse.data.filter(
          (user: any) => !followingNicknames.includes(user.nickname)
        );

        setRecommendations(notFollowingUsers.slice(0, 3)); // 최대 3명의 유저를 추천
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleFollow = async (nickname: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.put(
        `${location}/follow/add`,
        { nickname },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 팔로우 후 추천 목록에서 해당 유저 제거
      setRecommendations((prevRecommendations) =>
        prevRecommendations.filter((user) => user.nickname !== nickname)
      );
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  return (
    <Wrapper>
      <MainContainer>
        <ContentContainer>
          <Outlet />
        </ContentContainer>
        <RightSidebar>
          {userInfo && (
            <ProfileContainer>
              <ProfileImage src={userInfo.profileImageUrl} alt="Profile" />
              <UserInfo>
                <Nickname>{userInfo.nickname}</Nickname>
                <LoginId>{userInfo.loginId}</LoginId>
              </UserInfo>
              <LogOutIconButtonWrapper onClick={() => setLogoutModalOpen(true)}>
                <ExitIcon theme="light" />
              </LogOutIconButtonWrapper>
            </ProfileContainer>
          )}

          {/* 추천 친구 섹션 */}
          <RecommendationsContainer>
            <RecommendationTitle>추천 친구</RecommendationTitle>
            <RecommendationList>
              {recommendations.map((user) => (
                <RecommendationItem key={user.nickname}>
                  <ProfileContainer>
                    <ProfileImage src={user.profileImageUrl || defaultProfileImage} alt="Profile" />
                    <UserInfo>
                      <Nickname>{user.nickname}</Nickname>
                      <Name>{user.name}</Name>
                    </UserInfo>
                  </ProfileContainer>
                  <FollowButton onClick={() => handleFollow(user.nickname)}>팔로우</FollowButton>
                </RecommendationItem>
              ))}
            </RecommendationList>
          </RecommendationsContainer>
        </RightSidebar>
      </MainContainer>
      {isLogoutModalOpen && (
        <Modal
          isOpen={isLogoutModalOpen}
          showCloseButton={false}
          onClose={() => setLogoutModalOpen(false)}
        >
          <div style={{ textAlign: 'center' }}>
            <h3>로그아웃 하시겠습니까?</h3>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                marginTop: '20px',
              }}
            >
              <Button onClick={handleLogout}>
                네
              </Button>
              <Button onClick={() => setLogoutModalOpen(false)}>
                아니오
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Wrapper>
  );
};

export default MainLayout;
