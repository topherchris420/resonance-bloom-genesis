import React, { useState } from 'react';

interface VoiceprintAuthProps {
  onEnroll: () => void;
  onAuthenticate: () => void;
  isEnrolled: boolean;
  isAuthenticated: boolean;
}

export const VoiceprintAuth: React.FC<VoiceprintAuthProps> = ({ onEnroll, onAuthenticate, isEnrolled, isAuthenticated }) => {
  return (
    <div className="p-2 bg-gray-800 text-white">
      <h3 className="text-lg">Voiceprint Authentication</h3>
      <div className="flex flex-col gap-2">
        {!isEnrolled && (
          <button onClick={onEnroll} className="bg-blue-500 p-1">Enroll Voiceprint</button>
        )}
        {isEnrolled && !isAuthenticated && (
          <button onClick={onAuthenticate} className="bg-green-500 p-1">Authenticate</button>
        )}
        {isAuthenticated && (
          <p className="text-green-400">Authenticated</p>
        )}
      </div>
    </div>
  );
};
