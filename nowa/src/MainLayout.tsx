import React, { useState } from 'react';
import styled from 'styled-components';
import { Outlet, useNavigate } from 'react-router-dom';
import { NowaIcon, ExitIcon } from './components/icons/icons';
import Modal from './components/Modal/modal';
import Button from './components/Button/button';
import { handleLogout } from './components/Logout/Logout';

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  flex-direction: column; /* 전체를 세로로 정렬 */
`;

const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  margin-bottom: 0px;
  padding-top: 10px;
  padding-left: 250px;
`;

const MainContainer = styled.div`
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3;
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 990px;
  height: 95vh;
  background-color: #ffffff;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center; /* 콘텐츠를 수직 가운데 정렬 */
  overflow: hidden;
  z-index: 3;
`;

const LogOutIconButtonWrapper = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 650px;
`
// margin-top: 8px;
// position: relative;
// width: 4.2rem;
// height: 55px;

const MainLayout: React.FC = () => {
    const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
    const navigate = useNavigate();
  
    const handleLogout = () => {
      localStorage.removeItem('token');
      navigate('/login');
    };

    return (
    <Wrapper>
      {/* <HeaderContainer>
        <NowaIcon theme="light" />
        <LogOutIconButtonWrapper
          onClick={() => setLogoutModalOpen(true)}
        >
          <ExitIcon theme="light" />
        </LogOutIconButtonWrapper>
      </HeaderContainer> */}
        <MainContainer>
          <ContentContainer>
            <Outlet />
          </ContentContainer>
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
              <Button onClick={() => handleLogout}>
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