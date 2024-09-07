import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const Toast = ({ message, type = 'error', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className={`bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center ${
        type === 'error' ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'
      }`}>
        <p className="flex-grow">{message}</p>
        <button onClick={() => setIsVisible(false)} className="ml-4 text-white">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;