import React from 'react';
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
  font-size: 1rem;
`;

interface FollowListProps {
  followings: { nickname: string }[];
  followers: { nickname: string }[];
  isFollowingList: boolean;
}

const FollowList: React.FC<FollowListProps> = ({ followings, followers, isFollowingList }) => {
  const list = isFollowingList ? followings : followers;
  return (
    <FollowListWrapper>
      {list.map((user, index) => (
        <FollowItem key={index}>
          <FollowName>{user.nickname}</FollowName>
          <button>메시지</button>
        </FollowItem>
      ))}
    </FollowListWrapper>
  );
};

export default FollowList;