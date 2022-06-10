import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';

export default function Error() {
    const router = useRouter();
    useEffect(() => {
        setTimeout(() => {
            router.push('/');
        }, 5000);
    }, []);
    return (
        <div className='container'>
            <Head>
                <title>Gageiboo</title>
                <link rel='icon' href='/favicon.ico' />
            </Head>

            <main>
                <div>
                    <Icon icon='lock' size={40}></Icon>
                    <span style={{ fontSize: 30, marginLeft: 10 }}>로그인 실패</span>
                </div>
            </main>
        </div>
    );
}