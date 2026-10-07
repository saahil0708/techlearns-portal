'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Box } from '@mui/material';

interface QRCodeCanvasProps {
  url: string;
  size?: number;
}

export default function QRCodeCanvas({ url, size = 120 }: QRCodeCanvasProps) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isCancelled = false;
    setDataUrl('');
    if (url) {
      QRCode.toDataURL(url, {
        width: size,
        margin: 1,
        color: { dark: '#0A0F1D', light: '#FFFFFF' },
      })
        .then((res) => {
          if (!isCancelled) setDataUrl(res);
        })
        .catch(() => {
          if (!isCancelled) setDataUrl('');
        });
    }
    return () => {
      isCancelled = true;
    };
  }, [url, size]);

  if (!dataUrl) {
    return <Box sx={{ width: size, height: size, bgcolor: '#F1F5F9', borderRadius: '12px' }} />;
  }

  return (
    <img
      src={dataUrl}
      alt="Skill Passport QR Verification"
      width={size}
      height={size}
      style={{ borderRadius: '10px', display: 'block' }}
    />
  );
}
