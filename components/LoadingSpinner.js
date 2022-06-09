import React from 'react';
import { Intent, Spinner } from '@blueprintjs/core';

const LoadingSpinner = () => {
    return (
        <Spinner intent={Intent.SUCCESS} size={75} />
    )
}

export default LoadingSpinner;