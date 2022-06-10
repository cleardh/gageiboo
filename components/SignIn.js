import React, { useState, useEffect } from 'react';
import { Button, FormGroup, Label, Position, Toast, Toaster, Intent, InputGroup } from '@blueprintjs/core';
import cryptoJs from 'crypto-js';

const SignIn = ({ signIn, setLoadingData }) => {
    const [password, setPassword] = useState('');
    const [signInFailed, setSignedInFailed] = useState(false);
    useEffect(() => {
        if (sessionStorage.getItem('auth')) signIn();
    }, []);
    const authenticate = () => {
        if (password === 'test') {
            setLoadingData(true);
            const hash = cryptoJs.SHA256(password).toString();
            sessionStorage.setItem('auth', hash);
            setTimeout(() => {
                signIn();
                setLoadingData(false);
            }, 1000);
        }
    }
    return (
        <>
            <Toaster position={Position.TOP} canEscapeKeyClear={true}>
                {signInFailed && (
                    <Toast intent={Intent.DANGER} message='비밀번호가 틀렸어요.' icon='warning-sign' onDismiss={() => setSignedInFailed(false)} timeout={5000} />
                )}
            </Toaster>
            <FormGroup>
                <div className='form-input-group'>
                    <Label htmlFor='amount' className='labels'>비밀번호</Label>
                    <InputGroup
                        placeholder='비밀번호'
                        leftIcon='lock'
                        type='password'
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                    />
                </div>
                <hr style={{ width: '100%' }} />
                <Button icon='saved' className='btn-submit' text='Enter' type='button' intent={Intent.SUCCESS} onClick={authenticate} />
            </FormGroup >
        </>
    )
}

export default SignIn;