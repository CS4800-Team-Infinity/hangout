import type { NextPage } from 'next';
import React from 'react';
import { useEffect, useState } from 'react';

const Home: NextPage = () => {
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('/api/hello')
            .then((res) => res.json())
            .then((data) => setMsg(data.message));
    }, []);

    return (
        <>
            <div className="flex items-center justify-center pt-32 pb-8">
                <p className="text-sm text-zinc-400">api test: {msg}</p>
            </div>
        </>
    );
};

export default Home;