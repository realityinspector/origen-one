import { useState, useEffect } from 'react';

const COOKIE_NAME = 'sunschool_welcome_modal_closed';

export function useWelcomeModal() {
  const [isVisible, setIsVisible] = useState(true);

  // Check cookie when component mounts
  useEffect(() => {
    const checkCookie = () => {
      // Only run in the browser
      if (typeof document === 'undefined') return;
      
      const cookies = document.cookie.split(';');
      const welcomeModalClosed = cookies.some(cookie => 
        cookie.trim().startsWith(`${COOKIE_NAME}=true`)
      );
      
      // Show modal if cookie doesn't exist
      setIsVisible(!welcomeModalClosed);
    };
    
    checkCookie();
  }, []);

  // Function to close modal and set cookie
  const closeModal = () => {
    setIsVisible(false);
    
    // Only run in the browser
    if (typeof document === 'undefined') return;
    
    // Set cookie to expire in 30 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    document.cookie = `${COOKIE_NAME}=true; expires=${expiryDate.toUTCString()}; path=/`;
  };

  return {
    isVisible,
    closeModal
  };
}