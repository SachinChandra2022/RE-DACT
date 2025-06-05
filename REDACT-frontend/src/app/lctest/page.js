"use client";
import { getIcapAddress } from 'ethers/lib/utils';
import React, { useEffect } from 'react'

const page = () => {

    useEffect(()=>{

        console.log(window)
        console.log(window.sessionStorage.getItem('debug'))
        console.log(window.sessionStorage.setItem("keyhai",JSON.stringify("huhuhuhu")))
        console.log(window.sessionStorage)

    },[])

  return (
    <div>page</div>
  )
}

export default page