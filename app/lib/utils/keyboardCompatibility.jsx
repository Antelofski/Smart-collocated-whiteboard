import React, { useState, useEffect } from 'react';

// Check if built-in keyboard is visible
export const useKeyboardStatus = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const initialInnerHeight = window.innerHeight;

    const handleResize = () => {
      const heightChange = initialInnerHeight - window.innerHeight;
      const keyboardShown = heightChange > 0;
      setKeyboardVisible(keyboardShown);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isKeyboardVisible;
};