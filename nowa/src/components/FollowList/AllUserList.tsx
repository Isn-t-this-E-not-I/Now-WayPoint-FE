import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const UserListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 2rem;
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ccc;
`;

const UserName = styled.div`
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

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const Nickname = styled.div`
  font-size: 0.9rem;
`;

const Name = styled.div`
  font-size: 0.8rem;
  color: #555;
`;

interface AllUserListProps {
  users: { name: string; nickname: string; profileImageUrl: string }[];
  searchQuery: string;
}

const AllUserList: React.FC<AllUserListProps> = ({ users, searchQuery }) => {
  const navigate = useNavigate();

  const filteredUsers = searchQuery
    ? users.filter((user) => user.nickname.includes(searchQuery))
    : [];

  const handleProfileClick = (nickname: string) => {
    navigate(`/user/${nickname}`);
  };

  return (
    <UserListWrapper>
      {filteredUsers.map((user, index) => (
        <UserItem key={index}>
          <UserName onClick={() => handleProfileClick(user.nickname)}>
            <ProfileImage src={user.profileImageUrl || '/defaultprofile.png'} alt="Profile" />
            <UserDetails>
              <Nickname>{user.nickname}</Nickname>
              <Name>@{user.name}</Name>
            </UserDetails>
          </UserName>
        </UserItem>
      ))}
    </UserListWrapper>
  );
};

export default AllUserList;
