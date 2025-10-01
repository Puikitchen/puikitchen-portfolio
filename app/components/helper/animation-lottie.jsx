"use client"

import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";

// Dynamically import Lottie only on client side
const Lottie = dynamic(() => import('lottie-react'), { 
  ssr: false,
  loading: () => <div style={{ width: '95%', height: '400px' }} />
});

const AnimationLottie = ({ animationPath, width }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationPath,
    style: {
      width: '95%',
    }
  };

  if (!isClient) {
    return <div style={{ width: '95%', height: '400px' }} />;
  }

  return (
    <Lottie {...defaultOptions} />
  );
};

export default AnimationLottie;