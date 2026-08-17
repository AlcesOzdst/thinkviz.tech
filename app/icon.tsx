import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0D0F12',
          borderRadius: '6px',
          color: '#6C8CFF',
          fontWeight: 800,
          fontSize: '20px',
          border: '2px solid #292E36',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        T
      </div>
    ),
    { ...size }
  );
}
