import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { GrFormNext } from 'react-icons/gr'
import './styles.css'

const Container = styled.div`
  display: flex;
`

const Overlay = styled.div<{ targetRect: DOMRect | null }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;

  ${({ targetRect }) =>
    targetRect &&
    `
    &::before {
      content: '';
      position: absolute;
      top: ${targetRect.top}px;
      left: ${targetRect.left}px;
      width: ${targetRect.width}px;
      height: ${targetRect.height}px;
      background: transparent;
      border: 2px solid rgba(255, 255, 255, 0.7);
      border-radius: 10px;
    }
  `}
`

// const OverlayMessage = styled.div<{ targetRect: DOMRect | null }>`
//   position: fixed;
//   top: ${({ targetRect }) => (targetRect ? targetRect.top : '50%')}px;
//   left: ${({ targetRect }) => (targetRect ? targetRect.right + 10 : '50%')}px;
//   background: white;
//   padding: 23px;
//   border-radius: 8px;
//   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
//   z-index: 1001;
// `;

const SiteGuidePage: React.FC = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  const steps = [
    {
      title: '메인 페이지',
      description: '지도에서 컨텐츠를 확인할 수 있습니다',
      target: '#main-icon',
    },
    {
      title: '새 게시물',
      description: '게시글을 업로드할 수 있습니다',
      target: '#new-post-icon',
    },
    {
      title: '알림',
      description: '새로운 알림을 확인할 수 있습니다',
      target: '#notifications-icon',
    },
    {
      title: '메시지',
      description: '메시지를 확인하고 새로운 채팅방을 생성할 수 있습니다',
      target: '#chat-icon',
    },
    {
      title: '주변 컨텐츠',
      description: '위치 주변의 컨텐츠를 확인할 수 있습니다',
      target: '#contents-icon',
    },
    {
      title: '팔로우 컨텐츠',
      description: '팔로우하는 유저의 컨텐츠를 확인할 수 있습니다',
      target: '#follow-contents-icon',
    },
    {
      title: '마이페이지',
      description: '마이페이지에서 회원 정보를 수정할 수 있습니다',
      target: '#mypage-icon',
    },
  ]

  useEffect(() => {
    const currentStep = steps[step]
    if (currentStep) {
      const targetElement = document.querySelector(currentStep.target)
      if (targetElement) {
        setTargetRect(targetElement.getBoundingClientRect())
      }
    }
  }, [step])

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      navigate('/main') // 마지막 단계에서 /main으로 이동
    }
  }

  const handleClose = () => {
    setStep(-1)
  }

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (targetRect) {
      const { clientX, clientY } = event
      if (
        clientX >= targetRect.left &&
        clientX <= targetRect.right &&
        clientY >= targetRect.top &&
        clientY <= targetRect.bottom
      ) {
        handleNext()
      }
    }
  }

  useEffect(() => {
    // 엔터 키프레스 추가
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [step])

  const currentStep = step >= 0 && step < steps.length ? steps[step] : null

  //   return (
  //     <Container>
  //       {currentStep && (
  //         <>
  //         <Overlay targetRect={targetRect} onClick={handleOverlayClick} />
  //         <OverlayMessage targetRect={targetRect}>
  //           {/* <h3>{currentStep.title}</h3> */}
  //           <p>{currentStep.description}</p>
  //           <button onClick={handleNext}>
  //             <GrFormNext size={24}/>
  //           </button>
  //           {/* <button onClick={handleClose}>Close</button> */}
  //         </OverlayMessage>
  //         </>
  //       )}
  //     </Container>
  //   );
  // };

  // export default SiteGuidePage;

  return (
    <Container>
      {currentStep && (
        <>
          <Overlay targetRect={targetRect} onClick={handleOverlayClick} />

          <div
            className="bubble"
            style={{
              position: 'fixed',
              top: targetRect ? targetRect.top - 20 : '50%',
              left: targetRect ? targetRect.right + 30 : '50%',
              zIndex: 1001,
            }}
          >
            <p>{currentStep.description}</p>
            <button onClick={handleNext}>
              <GrFormNext size={24} />
            </button>
          </div>

          <button onClick={handleClose}>Close</button>
        </>
      )}
    </Container>
  )
}

export default SiteGuidePage
