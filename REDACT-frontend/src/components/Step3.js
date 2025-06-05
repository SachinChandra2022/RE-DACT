"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ethers } from "ethers"; // Import ethers
import { useRouter } from "next/navigation";
// import Navbar from "./Navbar";
import abi from "../../artifacts/contracts/Redact.sol/Redact.json"
const contractABI = [
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

const contractAddress =process.env.NEXT_PUBLIC_S_C_ADDRESS; // Your deployed contract address


const DemaskComponent = () => {
  const router = useRouter();
  const [username, setUsername] = useState(null);
  const [maskedLink, setMaskedLink] = useState("");
  const [demaskResult, setDemaskResult] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      toast.error("Username not found. Redirecting to login.");
      router.push("/login");
    } else {
      setUsername(storedUsername);
    }
  }, [router]);

  const connectToContract = async () => {
    if (!maskedLink) {
      toast.error("Please enter a masked link.");
      return;
    }
    setLoading(true); // Set loading to true when starting the process
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const [originalLink, certificateLink] = await contract.demask(maskedLink);
      setDemaskResult({ originalLink, certificateLink });
      toast.success("Link demasked successfully!");

      const metricsResponse = await fetch("/api/updateMetrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          incrementDemask: 1,
          username: username.trim(),
        }),
      });

      if (!metricsResponse.ok) {
        throw new Error("Error updating mask metrics.");
      }

    } catch (error) {
      console.error("Error demasking link:", error);
      toast.error("Failed to demask link. Please try again.");
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  return (
    <div>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-12 w-12"></div>
         <span className=" text-3xl text-white">Loading ...</span>
        </div>
      )}
      <div className={`min-h-screen flex flex-col justify-center items-center ${loading ? "opacity-50" : ""}`}>
        <div className="bg-white rounded-lg shadow-2xl p-6 md:w-1/2 w-full max-w-xl">
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
            Demask Your Link
          </h2>

          {username && (
            <div>
              <p className="text-gray-600 text-center mb-4">
                Welcome, <span className="font-bold">{username}</span>!
              </p>

              <input
                type="text"
                className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter Masked Link"
                value={maskedLink}
                onChange={(e) => setMaskedLink(e.target.value)}
              />

              <button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold transition duration-300 ease-in-out"
                onClick={connectToContract}
                disabled={loading} // Disable button while loading
              >
                {loading ? "Demasking..." : "Demask Link"}
              </button>
            </div>
          )}

          {demaskResult && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-ellipsis overflow-clip whitespace-nowrap">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Demasked Result
              </h3>
              <p className="text-gray-600 mb-1 text-ellipsis overflow-clip whitespace-nowrap">
                <span className="font-bold">Original Link: </span>
                <a
                  href={demaskResult.originalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {demaskResult.originalLink}
                </a>
              </p>
              <p className="text-gray-600 text-ellipsis overflow-clip whitespace-nowrap">
                <span className="font-bold">Certificate Link: </span>
                <a
                  href={demaskResult.certificateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {demaskResult.certificateLink}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemaskComponent;