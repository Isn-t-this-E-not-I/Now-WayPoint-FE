import React, { useState } from 'react';
import styled from 'styled-components';

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
  followings: { name: string; nickname: string; profileImageUrl: string }[];
  followers: { name: string; nickname: string; profileImageUrl: string }[];
  isFollowingList: boolean;
  searchQuery: string;
}

const FollowList: React.FC<FollowListProps> = ({ followings, followers, isFollowingList, searchQuery }) => {
  const list = isFollowingList ? followings : followers;

  const filteredList = list.filter(user =>
    user.name.includes(searchQuery) || user.nickname.includes(searchQuery)
  );

  return (
    <FollowListWrapper>
      {filteredList.map((user, index) => (
        <FollowItem key={index}>
          <FollowName>
            <ProfileImage src={user.profileImageUrl || '/defaultprofile.png'} alt="Profile" />
            <FollowDetails>
              <UserName>{user.name}</UserName>
              <Nickname>@{user.nickname}</Nickname>
            </FollowDetails>
          </FollowName>
          <button>메시지</button>
        </FollowItem>
      ))}
    </FollowListWrapper>
  );
};

export default FollowList;
