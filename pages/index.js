import React from 'react';
import Head from 'next/head';
import '@blueprintjs/core/lib/css/blueprint.css';
import SignIn from '../components/SignIn';

export default function Home({ callbackUrl }) {
  return (
    <div className='container'>
      <Head>
        <title>Gageiboo</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main>
        <SignIn callbackUrl={callbackUrl} />
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