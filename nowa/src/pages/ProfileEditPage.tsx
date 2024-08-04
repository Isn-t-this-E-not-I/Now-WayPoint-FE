import React, { useState, useEffect, ChangeEvent } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/Modal/modal'
import Button from '../components/Button/button'
import TextInput from '../components/TextInput/textInput'
import TextArea from '../components/TextArea/textArea'
import FileInput from '../components/FileInput/fileInput'
import defaultProfileImage from '../../../defaultprofile.png'
import { updatePassword, uploadProfileImage } from '../api/userApi'
import styled from 'styled-components';
import { EditIcon } from '../components/icons/icons';


const ProfileImageWrapper = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  margin-top: 30px;
  margin-bottom: 30px;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
`;

const EditIconWrapper = styled.div`
  position: absolute;
  bottom: -3px;
  right: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;


const ProfileEditPage: React.FC = () => {
    const location = import.meta.env.VITE_APP_API
    const [isModalOpen, setModalOpen] = useState(false)
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [userInfo, setUserInfo] = useState<null | {
      loginId: string
      name: string
      nickname: string
      email: string
      profileImageUrl: string
      description: string
    }>(null)
    const navigate = useNavigate()
    const [description, setDescription] = useState(userInfo?.description || '');
    const maxDescriptionLength = 150;
  
    useEffect(() => {
      const fetchUserData = async () => {
        const token = localStorage.getItem('token')
        console.log(token)
        if (!token) {
          navigate('/login')
          return
        }
  
        try {
          const response = await axios.get(`${location}/user`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          console.log('API Response:', response)
          console.log('User data fetched:', response.data)
          setUserInfo({
            loginId: response.data.loginId,
            name: response.data.name,
            nickname: response.data.nickname,
            email: response.data.email,
            profileImageUrl: response.data.profileImageUrl || defaultProfileImage, // 프로필 사진 없으면 기본 이미지 사용
            description: response.data.description,
          })
        } catch (error) {
          console.error('유저 데이터를 가져오는데 실패했습니다:', error)
        }
      }
      fetchUserData()
    }, [navigate])
  
    const handleUpdateProfile = async () => {
      if (!userInfo) return
  
      try {
        await axios.put(
          `${location}/user`,
          {
            name: userInfo.name,
            profileImageUrl: userInfo.profileImageUrl,
            description: userInfo.description,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        )
        alert('프로필이 성공적으로 업데이트되었습니다.')
      } catch (error) {
        console.error('프로필 업데이트에 실패했습니다:', error)
      }
    }
  
    const handleUpdateNickname = async () => {
      if (!userInfo) return
  
      try {
        await axios.put(
          `${location}/user/nickname/change`,
          {
            nickname: userInfo.nickname,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        )
        alert('닉네임이 성공적으로 업데이트되었습니다.')
      } catch (error) {
        console.error('닉네임 업데이트에 실패했습니다:', error)
      }
    }
  
    const handleDeleteAccount = async () => {
      try {
        await axios.post(
          `${location}/user/withdrawal`,
          {
            password: '1234',
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        )
        console.log('계정 삭제가 확인되었습니다.')
        setModalOpen(false)
        navigate('/login')
      } catch (error) {
        console.error('계정 삭제에 실패했습니다:', error)
      }
    }
  
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        setSelectedFile(e.target.files[0])
      }
    }
  
    const handleUploadProfileImage = async () => {
      if (!selectedFile) return
    
      try {
        const response = await uploadProfileImage(selectedFile)
    
        setUserInfo({ ...userInfo, profileImageUrl: response.profileImageUrl })
        alert('프로필 사진이 성공적으로 업데이트되었습니다.')
        setSelectedFile(null);
      } catch (error) {
        console.error('프로필 사진 업데이트에 실패했습니다:', error)
      }
    }
  
    const handlePasswordChange = async () => {
      if (newPassword !== confirmPassword) {
        alert('새 비밀번호가 일치하지 않습니다.')
        return
      }
  
      try {
        await updatePassword(userInfo!.loginId, newPassword)
        alert('비밀번호가 성공적으로 변경되었습니다.')
        setPasswordModalOpen(false) // 모달 닫기
      } catch (error) {
        console.error('비밀번호 변경에 실패했습니다:', error)
      }
    }
  
    if (!userInfo) {
      return <div>Loading...</div>
    }
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
        <div className="relative flex flex-col items-center mb-6">
          <ProfileImageWrapper>
            <ProfileImage
              src={userInfo.profileImageUrl}
              alt="Profile"
            />
            <EditIconWrapper onClick={() => document.getElementById('fileInput')?.click()}>
              <EditIcon theme="light" />
            </EditIconWrapper>
          </ProfileImageWrapper>
          <input
            id="fileInput"
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          {selectedFile && (
            <Button className="mt-2" onClick={handleUploadProfileImage}>
              업데이트
            </Button>
          )}
        </div>
        <div className="w-full max-w-md">
          <div className="mb-4">
            <label className="block text-gray-700">아이디</label>
            <p className="input input-bordered w-full">{userInfo.loginId}</p>
          </div>
          <div className="relative mb-4">
            <TextInput
              type="text"
              value={userInfo.nickname}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUserInfo({ ...userInfo, nickname: e.target.value })
              }
              className="w-full pr-16"
              placeholder=""
            />
            <Button
              className="absolute right-0 top-0 h-full"
              onClick={handleUpdateNickname}
            >
              닉네임 변경
            </Button>
          </div>
          <div className="relative mb-4">
            {/* <label className="block text-gray-700">비밀번호</label> */}
            <TextInput
              type="password"
              value="********"
              className="w-full pr-16"
              placeholder=""
            />
            <Button
              className="absolute right-0 top-0 h-full"
              onClick={() => setPasswordModalOpen(true)}
            >
              비밀번호 변경
            </Button>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <p className="input input-bordered w-full">{userInfo.email}</p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">소개</label>
            <TextArea
              id="description"
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                if (e.target.value.length <= maxDescriptionLength) {
                  setDescription(e.target.value);
                  setUserInfo({ ...userInfo, description: e.target.value });
                }
              }}
              className="w-full"
            />
            <div className="text-right text-gray-500">
              {description.length} / {maxDescriptionLength}
            </div>
          </div>
          <div className="flex justify-between">
            <Button
              className="mb-4 text-red-600"
              onClick={() => setModalOpen(true)}
            >
              회원 탈퇴
            </Button>
            <Button className="mb-4" onClick={handleUpdateProfile}>
              저장
            </Button>
          </div>
        </div>
        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
            <p>정말로 계정을 삭제하시겠습니까?</p>
            <Button onClick={handleDeleteAccount}>삭제</Button>
            <Button onClick={() => setModalOpen(false)}>취소</Button>
          </Modal>
        )}
        {isPasswordModalOpen && (
          <Modal
            isOpen={isPasswordModalOpen}
            onClose={() => setPasswordModalOpen(false)}
          >
            <div className="flex flex-col">
              <TextInput
                type="password"
                placeholder="현재 비밀번호"
                value={currentPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCurrentPassword(e.target.value)
                }
                className="mb-4"
              />
              <TextInput
                type="password"
                placeholder="새 비밀번호"
                value={newPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewPassword(e.target.value)
                }
                className="mb-4"
              />
              <TextInput
                type="password"
                placeholder="새 비밀번호 확인"
                value={confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
                className="mb-4"
              />
              <Button onClick={handlePasswordChange}>변경하기</Button>
            </div>
          </Modal>
        )}
      </div>
    )
};

export default ProfileEditPage;
