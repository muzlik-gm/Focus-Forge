'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function ProductRedirect() {
    useEffect(() => {
        redirect('/features');
    }, []);
    return null;
}
