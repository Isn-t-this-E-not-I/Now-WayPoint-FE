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

const UserName = styled.div`
  font-size: 1rem;
  font-weight: bold;
`;

const Nickname = styled.div`
  font-size: 0.8rem;
  color: #555;
`;

interface FollowListProps {
  users: { isFollowing: boolean; name: string; nickname: string; profileImageUrl: string }[];
  searchQuery: string;
  onFollow: (nickname: string) => void;
  onUnfollow: (nickname: string) => void;
}

const FollowList: React.FC<FollowListProps> = ({ users, searchQuery, onFollow, onUnfollow }) => {
  const navigate = useNavigate();

  const filteredList = users.filter((user) =>
    user.name.includes(searchQuery) || user.nickname.includes(searchQuery)
  );

  const handleProfileClick = (nickname: string) => {
    navigate(`/user/${nickname}`);
  };

  return (
    <FollowListWrapper>
      {filteredList.map((user, index) => (
        <FollowItem key={index}>
          <FollowName onClick={() => handleProfileClick(user.nickname)}>
            <ProfileImage src={user.profileImageUrl || '/defaultprofile.png'} alt="Profile" />
            <FollowDetails>
              <UserName>{user.name}</UserName>
              <Nickname>@{user.nickname}</Nickname>
            </FollowDetails>
          </FollowName>
          <Button
            className={user.isFollowing ? 'btn-secondary' : 'btn-primary'}
            onClick={() => (user.isFollowing ? onUnfollow(user.nickname) : onFollow(user.nickname))}
          >
            {user.isFollowing ? '언팔로우' : '팔로우'}
          </Button>
        </FollowItem>
      ))}
    </FollowListWrapper>
  );
};

export default FollowList;
