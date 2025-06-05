"use client";
import React, { useState } from 'react';

const Page = () => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const UploadToIPFS = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        body: formData,
        headers: {
          pinata_api_key: process.env.NEXT_PUBLIC_API_Key,
          pinata_secret_api_key: process.env.NEXT_PUBLIC_API_Secret,
        },
      });

      const data = await response.json();
      setFileUrl(`https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`);
    } catch (error) {
      console.error("Error uploading file to IPFS:", error);
    }
  };

  return (
    <div>
      <form>
        <input 
          type='file' 
          onChange={handleFileChange}
        />
        <p>Please enter file</p>
        {file && <p>Selected file: {file.name}</p>}
      </form>
      <button type="button" onClick={UploadToIPFS}>Upload to IPFS</button>
      {fileUrl && (
        <div>
          <p>File uploaded successfully. Access it here:</p>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            {fileUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default Page;
