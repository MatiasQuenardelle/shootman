'use client';

import { forwardRef } from 'react';

interface CameraProps {
  className?: string;
}

export const Camera = forwardRef<HTMLVideoElement, CameraProps>(
  ({ className = '' }, ref) => {
    return (
      <video
        ref={ref}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover ${className}`}
      />
    );
  }
);

Camera.displayName = 'Camera';
