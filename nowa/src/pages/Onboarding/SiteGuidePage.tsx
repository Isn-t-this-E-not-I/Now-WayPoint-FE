// src/pages/Onboarding/SiteGuidePage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

const SiteGuidePage: React.FC = () => {
  const navigate = useNavigate();

  const handleFinish = () => {
    navigate('/main');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-100">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4">사이트 가이드</h2>
        {/* Add site guide content here */}
        <button
          className="btn btn-primary w-full mt-4"
          onClick={handleFinish}
        >
          완료
        </button>
      </div>
    </div>
  );
};

export default SiteGuidePage;