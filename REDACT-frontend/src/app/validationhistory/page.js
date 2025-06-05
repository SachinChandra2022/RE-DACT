// src/app/validationhistory/page.jsx
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DefaultLayout from '@/components/DefaultLayout';

const ValidationHistory = () => {
    const [validations, setValidations] = useState(null);
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

        // Fetch user's validations from the API route
        fetch(`/api/getMetrics?username=${encodeURIComponent(username)}`)
            .then((response) => response.json())
            .then((data) => {
                if (data && data.validations !== null) {
                    setValidations(data.validations);
                } else {
                    toast.error('Failed to fetch validations data.');
                }
            })
            .catch((error) => {
                console.error(error);
                toast.error('Error fetching validations.');
            });
    }, [router]);

    return (
        <DefaultLayout>
            <div className="flex flex-col items-center p-6 sm:p-8 md:p-10 lg:p-12 max-w-lg mx-auto border border-gray-300 rounded-lg bg-white shadow-md">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900">Validations</h2>
                {validations !== null ? (
                    <p className="text-lg text-gray-700">You have {validations} validations.</p>
                ) : (
                    <p className="text-lg text-gray-700">Loading...</p>
                )}
            </div>
        </DefaultLayout>
    );
};

export default ValidationHistory;