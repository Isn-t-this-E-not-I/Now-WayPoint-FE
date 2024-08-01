import React from 'react';
import styled from 'styled-components';
import Button from '../Button/button';
import { useNavigate } from 'react-router-dom';

const FollowListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 2rem;
`;

const FollowItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
`;

const FollowName = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`;

const FollowDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const Nickname = styled.div`
  font-size: 0.9rem;
`;

const UserName = styled.div`
  font-size: 0.8rem;
  color: #555;
`;

interface FollowListProps {
  users: { isFollowing: boolean; name: string; nickname: string; profileImageUrl: string }[];
  searchQuery: string;
  onFollow: (nickname: string) => void;
  onUnfollow: (nickname: string) => void;
  priorityList: { isFollowing: boolean; name: string; nickname: string; profileImageUrl: string }[];
  allUsers: { isFollowing: boolean; name: string; nickname: string; profileImageUrl: string }[];
}

const UserFollowList: React.FC<FollowListProps> = ({ users, searchQuery, priorityList, allUsers }) => {
  const navigate = useNavigate();

  const filteredList = searchQuery ? allUsers.filter((user) => user.nickname.includes(searchQuery)) : users;

  const prioritizedList = searchQuery
    ? [...priorityList, ...filteredList.filter(user => !priorityList.some(pUser => pUser.nickname === user.nickname))]
    : users;

    const handleProfileClick = (nickname: string) => {
      navigate(`/user/${nickname}?tab=posts`);
    };

  return (
    <FollowListWrapper>
      {prioritizedList.map((user, index) => (
        <FollowItem key={index}>
          <FollowName onClick={() => handleProfileClick(user.nickname)}>
            <ProfileImage src={user.profileImageUrl || '/defaultprofile.png'} alt="Profile" />
            <FollowDetails>
              <Nickname>{user.nickname}</Nickname>
              <UserName>@{user.name}</UserName>
            </FollowDetails>
          </FollowName>
        </FollowItem>
      ))}
    </FollowListWrapper>
  );
};

export default UserFollowList;
