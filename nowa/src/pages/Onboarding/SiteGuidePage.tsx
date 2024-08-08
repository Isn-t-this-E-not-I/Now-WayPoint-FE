import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import './SiteGuidePage.css';

const steps = [
  {
    target: '.sidebar-icon-1',
    title: '기사 목록',
    description: '여기를 클릭하면 기사 목록을 볼 수 있습니다.',
  },
  {
    target: '.sidebar-icon-2',
    title: '지면 목록',
    description: '여기를 클릭하면 지면 목록을 볼 수 있습니다.',
  },
  // 추가적인 스텝들을 여기에 추가합니다.
];

const SiteGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    navigate('/main');
  };

  const { target, title, description } = steps[currentStep];

  return (
    <div className="site-guide-page">
      <div className="overlay"></div>
      <div className={`highlight ${target.replace('.', '')}`}></div>
      <div className="tooltip">
        <h2>{title}</h2>
        <p>{description}</p>
        <button onClick={handleNextStep}>
          {currentStep < steps.length - 1 ? '다음' : '완료'}
        </button>
      </div>
    </div>
  );
};

export default SiteGuidePage;