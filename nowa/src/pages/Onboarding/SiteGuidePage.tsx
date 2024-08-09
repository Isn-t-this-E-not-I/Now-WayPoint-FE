import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import FeatureOverlay from '../../components/Overlay/FeatureOverlay';
import Sidebar from '../../components/Sidebar/sidebar';
import MainSidebarPage from '../MainSidebarPage';

const Container = styled.div`
  display: flex;
`;

const OverlayMessage = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1001;
`;

const SiteGuidePage: React.FC = () => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: '메인 페이지',
      description: '이곳에서 메인 페이지로 이동할 수 있습니다.',
      target: '#main-icon',
      action: () => {
        (document.querySelector('#main-icon') as HTMLElement)?.click();
      },
    },
    {
      title: '알림',
      description: '여기에서 알림을 확인할 수 있습니다.',
      target: '#notifications-icon',
      action: () => {
        (document.querySelector('#notifications-icon') as HTMLElement)?.click();
      },
    },
    {
      title: '메시지',
      description: '여기에서 메시지를 확인할 수 있습니다.',
      target: '#chat-icon',
      action: () => {
        (document.querySelector('#chat-icon') as HTMLElement)?.click();
      },
    },
    {
      title: '새 게시물',
      description: '여기에서 새 게시물을 작성할 수 있습니다.',
      target: '#new-post-icon',
      action: () => {
        (document.querySelector('#new-post-icon') as HTMLElement)?.click();
      },
    },
    // 추가적인 단계들을 여기에 추가하세요.
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      steps[step].action();
      setStep(step + 1);
    }
  };

  const handleClose = () => {
    setStep(-1);
  };

  const currentStep = step >= 0 && step < steps.length ? steps[step] : null;

  return (
    <Container>
      <Sidebar theme="light" />
      <MainSidebarPage />
      {currentStep && (
        <OverlayMessage>
          <h3>{currentStep.title}</h3>
          <p>{currentStep.description}</p>
          <button onClick={handleNext}>Next</button>
          <button onClick={handleClose}>Close</button>
        </OverlayMessage>
      )}
    </Container>
  );
};

//   return (
//     <Container>
//       <Sidebar theme="light" />
//       <MainSidebarPage />
//       {step >= 0 && step < steps.length && (
//         <FeatureOverlay
//           isOpen={true}
//           onClose={handleClose}
//           title={steps[step].title}
//           description={
//             <>
//               <p>{steps[step].description}</p>
//               <button onClick={handleNext}>Next</button>
//             </>
//           }
//         />
//       )}
//     </Container>
//   );
// };

export default SiteGuidePage;