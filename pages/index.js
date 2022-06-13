import React from 'react';
import Head from 'next/head';
import '@blueprintjs/core/lib/css/blueprint.css';
import SignIn from '../components/SignIn';
import { signIn } from 'next-auth/react';

export default function Home({ callbackUrl }) {
  return (
    <div className='container'>
      <Head>
        <title>Gageiboo</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main>
        {/* <SignIn callbackUrl={callbackUrl} /> */}
        <div className='button-signin' onClick={() => signIn('google', { callbackUrl: 'http://localhost:3005/add' })}>
          <svg
            data-name="Layer 1"
            id="Layer_1"
            viewBox="0 0 508.33 508.36"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: '100%' }}
          >
            <defs>
              <clipPath id="clip-path" transform="translate(-1.83 -1.82)">
                <path
                  d="M392.69 221.58h-139.6v57.88h80.36c-7.49 36.77-38.82 57.88-80.36 57.88a88.53 88.53 0 1 1 0-177.05A86.61 86.61 0 0 1 308.25 180l43.58-43.58C325.28 113.3 291.23 99 253.09 99a149.82 149.82 0 0 0 0 299.63c74.91 0 143-54.48 143-149.82a124.29 124.29 0 0 0-3.4-27.23Z"
                  style={{
                    fill: "none",
                  }}
                />
              </clipPath>
              <style>{".cls-3{clip-path:url(#clip-path)}"}</style>
            </defs>
            <title />
            <path
              d="M485 29.72c11.45 15.13 16.61 40.21 19.15 70.7 3.36 45.5 4.71 100.1 6 156.52-1.67 57.47-2.35 115.43-6 156.52-2.88 31.54-9 52.66-19.22 65.47-13 12.79-37.94 23.59-73.5 26.15-43.25 3.69-96.61 3.65-155.48 5.1-65.44-1.12-109.82-.64-156.38-5.08-36.32-2.52-60.08-13.19-74.7-26.07-10.83-14.54-14-30-17-66.24-3.75-41.85-4.58-98.56-6-155.54C4 200.57 4.13 143.44 7.9 100.74 10.43 67.05 14.42 44.4 24.65 30 39 17.77 63.48 11.69 100 8.69c50-5.85 102.06-7 155.88-6.87 55.39.09 108.56 1.67 156 6.34 32 2.56 58.48 8.07 73.07 21.56Z"
              transform="translate(-1.83 -1.82)"
              style={{
                fill: "#fff",
                fillRule: "evenodd",
              }}
            />
            <path
              d="M89.66 337.34V160.29l115.77 88.53Z"
              transform="translate(-1.83 -1.82)"
              style={{
                fill: "#fbbc05",
              }}
              className="cls-3"
            />
            <path
              d="m89.66 160.29 115.77 88.53 47.67-41.54 163.43-26.56V85.38H89.66Z"
              transform="translate(-1.83 -1.82)"
              style={{
                fill: "#ea4335",
              }}
              className="cls-3"
            />
            <path
              d="M89.66 337.34 294 180.72l53.8 6.81 68.73-102.15v326.87H89.66Z"
              transform="translate(-1.83 -1.82)"
              style={{
                fill: "#34a853",
              }}
              className="cls-3"
            />
            <path
              d="m416.53 412.25-211.1-163.43-27.24-20.43 238.34-68.1Z"
              transform="translate(-1.83 -1.82)"
              style={{
                fill: "#4285f4",
              }}
              className="cls-3"
            />
          </svg>
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  return {
    props: {
      callbackUrl: `${process.env.NEXTAUTH_URL}/add`
    }
  };
}