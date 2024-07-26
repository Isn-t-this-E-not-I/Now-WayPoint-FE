//src/pages/myPage.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from '../components/Modal/modal';
import Button from '../components/Button/button';
import TextInput from '../components/TextInput/textInput';
import TextArea from '../components/TextArea/textArea';
import axios from 'axios';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #fff;
  padding: 20px;
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MyPage = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    bio: '',
    profileImage: '/path/to/default/profile.jpg',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/user', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUserInfo({
          nickname: response.data.nickname,
          bio: response.data.description,
          profileImage: response.data.profile_image_url
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      await axios.put('/api/user', {
        name: userInfo.name,
        nickname: userInfo.nickname,
        profile_image_url: userInfo.profileImage,
        description: userInfo.bio
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('Profile updated successfully.');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete('/api/user', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Account deletion confirmed.');
      setModalOpen(false);
      // Redirect to login or home page after deletion
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  return (
    <Wrapper>
      <ProfileSection>
        <img src={userInfo.profileImage} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: '#ccc' }} />
        <Button onClick={() => console.log('Change profile photo')}>Change Profile Photo</Button>
      </ProfileSection>
      <InfoSection>
        <TextInput type="text" placeholder="Nickname" value={userInfo.nickname} onChange={(e) => setUserInfo({...userInfo, nickname: e.target.value})} />
        <Button onClick={handleUpdateProfile}>Update Nickname</Button>
        <TextArea placeholder="Bio" value={userInfo.bio} onChange={(e) => setUserInfo({...userInfo, bio: e.target.value})} />
        <Button onClick={handleUpdateProfile}>Save Bio</Button>
        <Button onClick={() => setModalOpen(true)}>Delete Account</Button>
      </InfoSection>
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
          <p>Are you sure you want to delete your account?</p>
          <Button onClick={handleDeleteAccount}>Delete</Button>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
        </Modal>
      )}
    </Wrapper>
  );
};

export default MyPage;