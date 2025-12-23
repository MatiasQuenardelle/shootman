'use client';

import { HandLandmarks as HandLandmarksType } from '@/types';

interface HandLandmarksProps {
  landmarks: HandLandmarksType | null;
  screenDimensions: { width: number; height: number };
}

export function HandLandmarks({ landmarks, screenDimensions }: HandLandmarksProps) {
  if (!landmarks) return null;

  const { width, height } = screenDimensions;

  // Connections between landmarks for drawing the hand skeleton
  const connections: [number, number][] = [
    // Thumb
    [0, 1], [1, 2], [2, 3], [3, 4],
    // Index finger
    [0, 5], [5, 6], [6, 7], [7, 8],
    // Middle finger
    [0, 9], [9, 10], [10, 11], [11, 12],
    // Ring finger
    [0, 13], [13, 14], [14, 15], [15, 16],
    // Pinky
    [0, 17], [17, 18], [18, 19], [19, 20],
    // Palm connections
    [5, 9], [9, 13], [13, 17],
  ];

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
    >
      {/* Connections */}
      {connections.map(([start, end], i) => {
        const startLandmark = landmarks.landmarks[start];
        const endLandmark = landmarks.landmarks[end];
        if (!startLandmark || !endLandmark) return null;

        // Mirror x coordinate for camera view
        const x1 = (1 - startLandmark.x) * width;
        const y1 = startLandmark.y * height;
        const x2 = (1 - endLandmark.x) * width;
        const y2 = endLandmark.y * height;

        return (
          <line
            key={`conn-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(0, 255, 0, 0.5)"
            strokeWidth="2"
          />
        );
      })}

      {/* Landmarks */}
      {landmarks.landmarks.map((landmark, i) => {
        // Mirror x coordinate for camera view
        const x = (1 - landmark.x) * width;
        const y = landmark.y * height;

        // Color code different parts
        let color = '#00ff00';
        if (i <= 4) color = '#ff0000'; // Thumb
        else if (i <= 8) color = '#00ff00'; // Index
        else if (i <= 12) color = '#0000ff'; // Middle
        else if (i <= 16) color = '#ffff00'; // Ring
        else color = '#ff00ff'; // Pinky

        return (
          <circle
            key={`landmark-${i}`}
            cx={x}
            cy={y}
            r={4}
            fill={color}
            stroke="white"
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}
