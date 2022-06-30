import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar, Icon, IconSize, Alignment, Overlay, Button, Intent } from '@blueprintjs/core';

const GlobalNavbar = ({ darkMode, setDarkMode, user, signOut }) => {
    const [downloadActive, setDownloadActive] = useState(false);
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
            <Overlay isOpen={downloadActive}>
                <div className='overlay'>
                    <span style={{ fontSize: 25 }}>다운로드 하시겠습니까?</span>
                    <div className='overlay-btn-container' style={{ transform: 'scale(1.5)', flexDirection: 'column', marginTop: 60 }}>
                        <Link href='/api/download' passHref>
                            <a style={{ color: '#f5f5f5', textDecoration: 'none' }} target='_blank'>
                                <Button icon='download' intent={Intent.SUCCESS} text='Download' style={{ width: 150 }} onClick={() => setDownloadActive(false)} />
                            </a>
                        </Link>
                        <Button icon='cross' intent={Intent.DANGER} text='Cancel' style={{ width: 150, marginTop: 10 }} onClick={() => setDownloadActive(false)} />
                    </div>
                </div>
            </Overlay>
            <Navbar.Group align={Alignment.RIGHT}>
                <Link href='/add'><Icon icon='insert' size={IconSize.LARGE} className='navbar-elements' /></Link>
                <Link href='/chart'><Icon icon='chart' size={IconSize.LARGE} className='navbar-elements' /></Link>
                <Link href='/raw'><Icon icon='th' size={IconSize.LARGE} className='navbar-elements' /></Link>
                <Icon icon='download' size={IconSize.LARGE} className='navbar-elements' onClick={() => setDownloadActive(true)} />
                <Icon icon='contrast' size={IconSize.LARGE} onClick={() => setDarkMode(!darkMode)} className='navbar-elements' />
                <Icon icon='log-out' size={IconSize.LARGE} onClick={signOut} className='navbar-elements' />
            </Navbar.Group >
        </Navbar>
    )
}

export default GlobalNavbar;