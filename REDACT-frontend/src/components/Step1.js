"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import "react-toastify/dist/ReactToastify.css";
import { flightRouterStateSchema } from "next/dist/server/app-render/types";

// Replace with your smart contract ABI and address
const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "initialSalt",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "username",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "maskedLink",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "originalLink",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "certificateLink",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "LinkMasked",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
    ],
    name: "addUser",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "maskedLink",
        type: "string",
      },
    ],
    name: "demask",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "maskedLink",
        type: "string",
      },
    ],
    name: "getLinkInfo",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSalt",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
    ],
    name: "getUserLinks",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
    ],
    name: "getUserLinksByUsername",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getUsernames",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
      {
        internalType: "string",
        name: "originalLink",
        type: "string",
      },
      {
        internalType: "string",
        name: "maskedLink",
        type: "string",
      },
      {
        internalType: "string",
        name: "certificateLink",
        type: "string",
      },
    ],
    name: "mask",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "maskedLink",
        type: "string",
      },
      {
        internalType: "string",
        name: "originalLink",
        type: "string",
      },
      {
        internalType: "string",
        name: "certificateLink",
        type: "string",
      },
    ],
    name: "setMaskedToLinkInfo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "newSalt",
        type: "string",
      },
    ],
    name: "setSalt",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
      {
        internalType: "string[]",
        name: "links",
        type: "string[]",
      },
    ],
    name: "setUserLinks",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string[]",
        name: "newUsernames",
        type: "string[]",
      },
    ],
    name: "setUsernames",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "maskedLink",
        type: "string",
      },
    ],
    name: "validate",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
const CONTRACT_ADDRESS = "0xb22b28B0E9B05731f57336dFd06a2b2e5c428aE9"; // Replace with your contract address

const FileUploadAndProcess = () => {
  const [fileType, setFileType] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fields, setFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [maskingLevel, setMaskingLevel] = useState(1);
  const [processedLink, setProcessedLink] = useState("");
  const [processedCerLink, setProcessedCerLink] = useState("");
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "test"
  );
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null); // Add state for the smart contract
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);

  useEffect(() => {
    if (provider) {
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider.getSigner()
      );
      setContract(contractInstance);
    }
  }, [provider]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const sepoliaChainId = "0xaa36a7";
        const currentChainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        if (currentChainId !== sepoliaChainId) {
          toast.error("Please switch to Sepolia Testnet!");
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: sepoliaChainId }],
          });
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        setAccount(accounts[0]);
        toast.success("Wallet connected!");
      } catch (error) {
        console.error("Error connecting wallet:", error);
        toast.error("Failed to connect wallet!");
      }
    } else {
      toast.error("MetaMask not detected!");
    }
  };

  const addUser = async (username) => {
    if (!contract) {
      toast.error("Smart contract is not loaded.");
      return;
    }

    try {
      setLoading(true);
      const tx = await contract.addUser(username);
      await tx.wait();
      setLoading(false);

      toast.success("User added successfully!");
    } catch (error) {
      console.error("Error adding user:", error);
      // toast.error("Failed to add user.");
    }
  };

  const storeMaskedLink = async (
    username,
    originalLink,
    maskedLink,
    certLink
  ) => {
    if (!contract) {
      toast.error("Smart contract is not loaded.");
      return;
    }

    try {
      setLoading(true);

      const tx = await contract.mask(
        username,
        originalLink,
        maskedLink,
        certLink
      );

      await tx.wait();
      setLoading(false);
      toast.success("Masked link stored successfully!");
    } catch (error) {
      console.error("Error storing masked link:", error);
      toast.error("Failed to store masked link.");
    }
  };

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value);
    setFile(null);
    setPreview("");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };

      if (
        fileType.startsWith("image") ||
        fileType === "application/pdf" ||
        fileType === "video/mp4" ||
        fileType === "audio/mp3"
      ) {
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview("");
      }
    }
  };

  const UploadToIPFS = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          body: formData,
          headers: {
            pinata_api_key: process.env.NEXT_PUBLIC_API_Key,
            pinata_secret_api_key: process.env.NEXT_PUBLIC_API_Secret,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error uploading file to IPFS.");
      }

      const data = await response.json();
      setLoading(false);

      setFileUrl(`https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`);
      toast.success("File uploaded to IPFS successfully!");
    } catch (error) {
      console.error("Error uploading file to IPFS:", error);
      toast.error("Error uploading file to IPFS.");
    }
  };

  const getVulnerableFields = async () => {
    if (!fileUrl) {
      toast.error("No file URL found. Please upload a file first.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:5000/api/testVF", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ipfs_link: fileUrl }),
      });
      setLoading(false);

      if (!response.ok) {
        throw new Error("Error fetching vulnerable fields.");
      }

      const data = await response.json();
      const vulnerableFields = Object.entries(data).map(([key, values]) => ({
        key,
        values: values.filter((field) => field.trim() !== ""),
      }));

      setFields(vulnerableFields);
      toast.success("Vulnerable fields retrieved successfully!");
    } catch (error) {
      console.error("Error fetching vulnerable fields:", error);
      toast.error("Error fetching vulnerable fields.");
    }
  };

  const handleFieldChange = (e) => {
    const { value, checked } = e.target;
    setSelectedFields((prev) =>
      checked ? [...prev, value] : prev.filter((field) => field !== value)
    );
  };

  const handleMaskingChange = (e) => {
    setMaskingLevel(Number(e.target.value));
  };

  const handleNext = async () => {
    if (selectedFields.length === 0) {
      toast.error("Please select at least one field.");
      return;
    }

    const selectedFieldData = {};
    fields.forEach(({ key, values }) => {
      const selectedValues = values.filter((value) =>
        selectedFields.includes(value)
      );
      if (selectedValues.length > 0) {
        selectedFieldData[key] = selectedValues;
      }
    });

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:5000/api/testmask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input_pdf_path: fileUrl,
          vulnerabilities: selectedFieldData,
          severity_index: maskingLevel,
          file_type: "pdf",
          username: username,
          unique_id: "12345",
        }),
      });
      setLoading(false);
      if (!response.ok) {
        throw new Error("Error processing file.");
      }

      const { certificate_ipfs_link, masked_pdf_ipfs_link } =
        await response.json();
      setProcessedLink(masked_pdf_ipfs_link);
      setProcessedCerLink(certificate_ipfs_link);
      toast.success("File processed successfully!");

      // Add user and store masked link
      setLoading(true);

      await addUser(username);
      await storeMaskedLink(
        username,
        fileUrl,
        masked_pdf_ipfs_link,
        certificate_ipfs_link
      );
      const metricsResponse = await fetch("/api/updateMetrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          incrementMask: 1,
          username: username.trim(),
        }),
      });

      if (!metricsResponse.ok) {
        throw new Error("Error updating mask metrics.");
      }

      toast.success("Mask metrics updated successfully!");
      setLoading(false);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error processing file.");
    }
  };
  // const handleNext = async () => {
  //   if (selectedFields.length === 0) {
  //     toast.error("Please select at least one field.");
  //     return;
  //   }

  //   const trimmedUsername = username.trim();

  //   console.log('Username before API call:', trimmedUsername);

  //   try {
  //     // Call the mask processing API
  //     const maskResponse = await fetch("/api/testMask", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         fileLink: fileUrl,
  //         fileType,
  //         selectedFields,
  //         maskingLevel,
  //       }),
  //     });

  //     if (!maskResponse.ok) {
  //       throw new Error("Error processing file.");
  //     }

  //     const { processedLink } = await maskResponse.json();
  //     setProcessedLink(processedLink);
  //     toast.success("File processed successfully!");

  //     // Call the updateMetrics API to increase masks attribute by one
  //     const metricsResponse = await fetch("/api/updateMetrics", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         incrementMask: 1,
  //         username: trimmedUsername
  //       }),
  //     });

  //     if (!metricsResponse.ok) {
  //       throw new Error("Error updating mask metrics.");
  //     }

  //     toast.success("Mask metrics updated successfully!");
  //   } catch (error) {
  //     console.error("Error processing file or updating metrics:", error);
  //     toast.error("Error processing file or updating mask metrics.");
  //   }
  // };
  return (
    <div className="flex flex-col items-center p-6 sm:p-8 md:p-10 lg:p-12 max-w-lg mx-auto border border-gray-300 rounded-lg bg-white shadow-md">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-xl">Loading...</div>
        </div>
      )}
      <nav className="w-full flex justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Upload & Process
        </h2>
        {account ? (
          <div className="text-gray-900 font-semibold">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            Connect Wallet
          </button>
        )}
      </nav>

      <div className="w-full mb-6">
        <label
          htmlFor="file-type"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          Select File Type
        </label>
        <select
          id="file-type"
          value={fileType}
          onChange={handleFileTypeChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
        >
          <option value="">Select file type</option>
          <option value="image/*">Image (JPEG, PNG, etc.)</option>
          <option value="application/pdf">PDF</option>
          <option value="application/msword">DOC</option>
          <option value="video/mp4">MP4 Video</option>
          <option value="audio/mp3">MP3 Audio</option>
        </select>
      </div>

      {fileType && (
        <>
          <div className="w-full mb-6">
            <input
              type="file"
              accept={fileType}
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          {preview && (
            <div className="w-full mb-6">
              {fileType.startsWith("image/") && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
              )}
              {fileType === "application/pdf" && (
                <iframe
                  src={preview}
                  className="w-full h-64"
                  title="PDF Preview"
                ></iframe>
              )}
              {fileType === "video/mp4" && (
                <video controls className="w-full h-64">
                  <source src={preview} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              {fileType === "audio/mp3" && (
                <audio controls className="w-full">
                  <source src={preview} type="audio/mp3" />
                  Your browser does not support the audio tag.
                </audio>
              )}
            </div>
          )}
          <button
            onClick={UploadToIPFS}
            className="w-full py-2 mb-4 bg-blue-500 text-white rounded-lg"
          >
            Upload to IPFS
          </button>
        </>
      )}

      {fileUrl && (
        <button
          onClick={getVulnerableFields}
          className="w-full py-2 mb-4 bg-green-500 text-white rounded-lg"
        >
          Get Vulnerable Fields
        </button>
      )}

      {fields.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Select Fields to Mask
          </h3>
          <div className="w-full mb-4">
            {fields.map((field) => (
              <div key={field.key} className="mb-2">
                <h4 className="text-md font-semibold text-gray-700">
                  {field.key}
                </h4>
                {field.values.map((value) => (
                  <div key={value} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      value={value}
                      onChange={handleFieldChange}
                      className="mr-2"
                    />
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="w-full mb-4">
            <label
              htmlFor="masking-level"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              Select Masking Level
            </label>
            <input
              type="range"
              id="masking-level"
              min="1"
              max="4"
              value={maskingLevel}
              onChange={handleMaskingChange}
              className="w-full"
            />
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-600">Low</span>
              <span className="text-sm text-gray-600">Medium</span>
              <span className="text-sm text-gray-600">High</span>
              <span className="text-sm text-gray-600">Critical</span>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-2 mb-4 bg-purple-500 text-white rounded-lg"
          >
            Process File
          </button>
        </>
      )}

      {processedLink && (
        <div className="w-full mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Processed File
          </h3>
          <a
            href={processedLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View Masked File
          </a>
        </div>
      )}

      {processedCerLink && (
        <div className="w-full mt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Certificate
          </h3>
          <a
            href={processedCerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500 underline"
          >
            View Certificate
          </a>
        </div>
      )}
    </div>
  );
};

export default FileUploadAndProcess;
