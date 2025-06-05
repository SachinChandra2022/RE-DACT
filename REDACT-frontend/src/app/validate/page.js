import MaskedImageValidator from '@/components/Step2'
import React from 'react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const page = () => {
  return (
    <div>

    <MaskedImageValidator/>
    <ToastContainer />

    </div>
  )
}

export default page