import React, { useState, useEffect } from 'react';
import { ChevronUpIcon } from './Icons';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="العودة للأعلى"
      className="fixed bottom-28 left-4 z-50 w-11 h-11 rounded-full bg-amber-600 text-white shadow-lg hover:bg-amber-700 transition-all flex items-center justify-center opacity-80 hover:opacity-100"
    >
      <ChevronUpIcon size={20} />
    </button>
  );
}
