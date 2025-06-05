import ChangePassword from '@/components/Change-password'
import React from 'react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const page = () => {
  return (
    <div>

    <ChangePassword/>
    <ToastContainer />

    </div>
  )
}

export default page