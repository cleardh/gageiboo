import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar, Icon, IconSize, Alignment } from '@blueprintjs/core';

const GlobalNavbar = ({ darkMode, setDarkMode, user, signOut }) => {
    const [downloadActive, setDownloadActive] = useState(false);
    const activateDownload = () => {
        setDownloadActive(true);
        setTimeout(() => setDownloadActive(false), 300);
    }
    if (!user) {
        return (
            <Navbar fixedToTop className='navbar'>
                <Navbar.Group align={Alignment.RIGHT}>
                    <Icon icon='insert' size={IconSize.LARGE} className='navbar-elements' />
                    <Icon icon='chart' size={IconSize.LARGE} className='navbar-elements' />
                    <Icon icon='th' size={IconSize.LARGE} className='navbar-elements' />
                    <Icon icon='download' size={IconSize.LARGE} className='navbar-elements' />
                    <Icon icon='contrast' size={IconSize.LARGE} onClick={() => setDarkMode(!darkMode)} className='navbar-elements' />
                </Navbar.Group >
            </Navbar>
        );
    }
    return (
        <Navbar fixedToTop className='navbar'>
            <Navbar.Group align={Alignment.RIGHT}>
                <Link href='/add'><Icon icon='insert' size={IconSize.LARGE} className='navbar-elements' /></Link>
                <Link href='/chart'><Icon icon='chart' size={IconSize.LARGE} className='navbar-elements' /></Link>
                <Link href='/raw'><Icon icon='th' size={IconSize.LARGE} className='navbar-elements' /></Link>
                {downloadActive ? (
                    <Link href='/api/download' passHref>
                        <a style={{ color: '#f5f5f5' }} target='_blank'>
                            <Icon icon='download' size={IconSize.LARGE} className='navbar-elements' onClick={() => setDownloadActive(false)} />
                        </a>
                    </Link>
                ) : (
                    <Icon icon='download' size={IconSize.LARGE} className='navbar-elements' onClick={activateDownload} />
                )
                }
                <Icon icon='contrast' size={IconSize.LARGE} onClick={() => setDarkMode(!darkMode)} className='navbar-elements' />
                <Icon icon='log-out' size={IconSize.LARGE} onClick={signOut} className='navbar-elements' />
            </Navbar.Group >
        </Navbar>
    )
}

export default GlobalNavbar;