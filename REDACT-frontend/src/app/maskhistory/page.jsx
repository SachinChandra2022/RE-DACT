"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DefaultLayout from '@/components/DefaultLayout';

const MaskHistory = () => {
    const [masks, setMasks] = useState(null);
    const [username, setUsername] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');

        if (!token || !username) {
            toast.error('You must be logged in to access this page.');
            return;
        }

        setUsername(username);

        // Fetch user's masks from the API route
        fetch(`/api/getMetrics?username=${encodeURIComponent(username)}`)
            .then((response) => response.json())
            .then((data) => {
                if (data && data.masks !== null) {
                    setMasks(data.masks);
                } else {
                    toast.error('Failed to fetch masks data.');
                }
            })
            .catch((error) => {
                console.error('Error fetching masks:', error);
                toast.error('Error fetching masks.');
            });
    }, [router]);

    return (
        <DefaultLayout>
            <div className="flex flex-col items-center p-6 sm:p-8 md:p-10 lg:p-12 max-w-lg mx-auto border border-gray-300 rounded-lg bg-white shadow-md">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900">Masks</h2>
                {masks !== null ? (
                    <p className="text-lg text-gray-700">You have {masks} masks.</p>
                ) : (
                    <p className="text-lg text-gray-700">Loading...</p>
                )}
            </div>
        </DefaultLayout>
    );
};

export default MaskHistory;