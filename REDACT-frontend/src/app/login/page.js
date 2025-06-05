import Login from '@/components/Login';
import React from 'react';
import Link from 'next/link';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '@/components/Navbar';

const Page = () => {
  return (
    <div>
    <Navbar/>
      <Login />  {/* Original Login Component */}

      <div className="text-center mt-4">
        <p>
          Don't have an account? 
          <Link href="/signup" className="text-blue-500 underline ml-2">
            Sign Up
          </Link>
        </p>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Page;
