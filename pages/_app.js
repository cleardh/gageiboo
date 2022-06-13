import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { SessionProvider, signOut } from 'next-auth/react';
import GlobalNavbar from '../components/Navbar';
import globalStyle from '../utils/style';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(true);
    useEffect(() => {
        console.log(Component.name);
        // if (['Home', 'Error'].indexOf(Component.name) < 0 && !pageProps.user) router.push('/');
    }, [Component]);
    return (
        <SessionProvider session={session}>
            <GlobalNavbar darkMode={darkMode} setDarkMode={setDarkMode} user={pageProps.user} signOut={signOut} />
            <Component {...pageProps} darkMode={darkMode} />
            {globalStyle(darkMode)}
        </SessionProvider>
    );
}
