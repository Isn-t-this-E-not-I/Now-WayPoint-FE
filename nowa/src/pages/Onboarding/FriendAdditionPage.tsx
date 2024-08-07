// src/pages/Onboarding/FriendAdditionPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

const FriendAdditionPage: React.FC = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate('/onboarding/site-guide');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4">친구 추가</h2>
        {/* Add friend addition logic here */}
        <button
          className="btn btn-primary w-full mt-4"
          onClick={handleNext}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default FriendAdditionPage;