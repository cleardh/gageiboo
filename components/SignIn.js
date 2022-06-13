import React, { useState } from 'react';
import { Button, FormGroup, Label, Position, Toast, Toaster, Intent, InputGroup } from '@blueprintjs/core';
import { signIn } from 'next-auth/react';
import CryptoJs from 'crypto-js';
import LoadingSpinner from './LoadingSpinner';

const SignIn = ({ callbackUrl }) => {
    const [loading, setLoading] = useState(false);
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });
    const [signInFailed, setSignedInFailed] = useState(false);
    const keypress = (key) => {
        if (key === 'Enter') authenticate();
    }
    const authenticate = () => {
        if (!loginForm.email || !loginForm.password) {
            return setSignedInFailed(true);
        }
        setLoading(true);
        const { email, password } = loginForm;
        const hash = CryptoJs.SHA256(password).toString();
        setTimeout(() => {
            signIn('credentials', { email, password: hash, callbackUrl });
        }, 500);
    }
    return (
        <>
            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <Toaster position={Position.TOP} canEscapeKeyClear={true}>
                        {signInFailed && (
                            <Toast intent={Intent.DANGER} message='이메일과 비밀번호를 확인해주세요.' icon='warning-sign' onDismiss={() => setSignedInFailed(false)} timeout={5000} />
                        )}
                    </Toaster>
                    <FormGroup>
                        <div className='form-input-group' style={style.formField} onKeyDown={(e) => keypress(e.code)}>
                            <Label htmlFor='amount' className='labels'>이메일</Label>
                            <InputGroup
                                placeholder='이메일'
                                leftIcon='envelope'
                                type='text'
                                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                value={loginForm.email}
                            />
                        </div>
                        <div className='form-input-group' style={style.formField} onKeyDown={(e) => keypress(e.code)}>
                            <Label htmlFor='amount' className='labels'>비밀번호</Label>
                            <InputGroup
                                placeholder='비밀번호'
                                leftIcon='lock'
                                type='password'
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                value={loginForm.password}
                            />
                        </div>
                        <hr style={{ width: '100%' }} />
                        <Button icon='saved' className='btn-submit' text='Enter' type='submit' intent={Intent.SUCCESS} onClick={authenticate} />
                    </FormGroup >
                </>
            )}
        </>
    )
}
const style = {
    formField: {
        margin: '20px 0'
    }
};

export default SignIn;