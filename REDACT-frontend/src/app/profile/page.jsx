// pages/dashboard.js
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { verifyToken, verifyTokenLogin } from '@/lib/jwt';
import Dashboard from '@/components/dashboard';
import DefaultLayout from '@/components/DefaultLayout';

const Profile = () => {
    const [username, setUsername] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        console.log(token)
        if (!token) {
            toast.error('You must be logged in to access this page.');
            //   router.push('/login');
            return;
        }

        const user = verifyToken(token, username) || verifyTokenLogin(token, username);
        console.log(user)
        if (user) {
            console.log("hefefiu")
            setUsername(username.replace("\"", "") + " ");
        } else {
            toast.error('Invalid token. Please log in again.');
            // localStorage.removeItem('token');
            //   router.push('/login');
        }
    }, [router]);
    useEffect(() => {
        console.log(username)
    }, [])
    return (
        <DefaultLayout>
            <div className="flex flex-col items-center p-6 sm:p-8 md:p-10 lg:p-12 max-w-lg mx-auto border border-gray-300 rounded-lg bg-white shadow-md">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900">Dashboard</h2>
                {username ? (
                    <p className="text-lg text-gray-700">Welcome back, {username}!</p>
                ) : (
                    <p className="text-lg text-gray-700">Loading...</p>
                )}
            </div>
        </DefaultLayout>
    );
};

export default Profile;