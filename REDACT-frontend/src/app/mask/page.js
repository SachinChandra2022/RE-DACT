"use client";
import FileUploadAndProcess from '@/components/Step1';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
const Page = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if the token is present in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      // Show a toast notification and redirect after 5 seconds
      toast.info('You need to be logged in to access this page. Redirecting to login...', {
        onClose: () => {
          setTimeout(() => {
            router.push('/login');
          }, 0); // Redirect after 5 seconds
        },
      });
    }
  }, [router]);

  return (
    <div>
    <Navbar/>
      {isAuthenticated ? (
        <FileUploadAndProcess /> // Display the component if authenticated
      ) : (
        <div>Loading...</div> // Show loading while checking authentication
      )}
      <ToastContainer />
    </div>
  );
};

export default Page;
