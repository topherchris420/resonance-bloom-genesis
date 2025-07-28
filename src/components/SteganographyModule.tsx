import React, { useState } from 'react';

interface SteganographyModuleProps {
  onEmbed: (message: string) => void;
  onExtract: () => void;
  extractedMessage: string;
}

export const SteganographyModule: React.FC<SteganographyModuleProps> = ({ onEmbed, onExtract, extractedMessage }) => {
  const [message, setMessage] = useState('');

  const handleEmbed = () => {
    onEmbed(message);
    setMessage('');
  };

  return (
    <div className="p-2 bg-gray-800 text-white">
      <h3 className="text-lg">Steganography Module</h3>
      <div className="flex flex-col gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message to embed"
          className="bg-gray-700 p-1"
        />
        <button onClick={handleEmbed} className="bg-blue-500 p-1">Embed Message</button>
        <button onClick={onExtract} className="bg-green-500 p-1">Extract Message</button>
        {extractedMessage && (
          <div>
            <h4 className="text-md">Extracted Message:</h4>
            <p>{extractedMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};
