// app/apple-icon.tsx
// Apple Touch Icon for iOS devices (when saving to home screen)
import { ImageResponse } from 'next/og';

// Apple icon size - standard 180x180
export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

// Generate the apple touch icon
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FACCD6 0%, #B9DBF4 50%, #FDFACF 100%)',
          color: '#4F468D',
          padding: '20px',
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 'bold',
            fontFamily: 'sans-serif',
            letterSpacing: '-4px',
          }}
        >
          ST
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: '600',
            fontFamily: 'sans-serif',
            marginTop: '10px',
          }}
        >
          SkyTopia
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
