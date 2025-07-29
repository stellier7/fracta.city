'use client';

import React from 'react';

interface QRCodeProps {
  url: string;
  size?: number;
}

export default function QRCode({ url, size = 128 }: QRCodeProps) {
  // Simple QR code using a service (you can replace with a proper QR library)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  
  return (
    <div className="bg-white p-2 rounded-lg">
      <img 
        src={qrCodeUrl} 
        alt="QR Code" 
        width={size} 
        height={size}
        className="rounded-lg"
      />
    </div>
  );
} 