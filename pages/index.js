import React from 'react';
import Head from 'next/head';
import '@blueprintjs/core/lib/css/blueprint.css';
import SignIn from '../components/SignIn';

export default function Home() {
  return (
    <div className='container'>
      <Head>
        <title>Gageiboo</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main>
        <SignIn />
      </main>
    </div>
  );
}