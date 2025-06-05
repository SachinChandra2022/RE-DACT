"use client";
import React, { useImperativeHandle, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./Navbar";


const ValidateMaskedElement = () => {
  const [elementType, setElementType] = useState("");
  const [element, setElement] = useState(null);
  const [certificateType, setCertificateType] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [preview, setPreview] = useState("");
  const [certificatePreview, setCertificatePreview] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [cerfileUrl, setCerFileUrl] = useState("");
  const [validationResult, setValidationResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem("username") || "REDACT");

  const handleElementTypeChange = (e) => {
    setElementType(e.target.value);
    setElement(null);
    setPreview("");
    setFileUrl("");
    setValidationResult("");
  };

  const handleCertificateTypeChange = (e) => {
    setCertificateType(e.target.value);
    setCertificate(null);
    setCertificatePreview("");
    setCerFileUrl("");
  };

  const handleElementChange = (e) => {
    const selectedElement = e.target.files[0];
    if (selectedElement) {
      setElement(selectedElement);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };

      if (
        elementType.startsWith("image") ||
        elementType === "application/pdf" ||
        elementType === "video/mp4" ||
        elementType === "audio/mp3"
      ) {
        reader.readAsDataURL(selectedElement);
      } else {
        setPreview("");
      }
    }
  };

  const handleCertificateChange = (e) => {
    const selectedCertificate = e.target.files[0];
    if (selectedCertificate) {
      setCertificate(selectedCertificate);

      const reader = new FileReader();
      reader.onloadend = () => {
        setCertificatePreview(reader.result);
      };

      if (
        certificateType.startsWith("image") ||
        certificateType === "application/pdf" ||
        certificateType === "video/mp4" ||
        certificateType === "audio/mp3"
      ) {
        reader.readAsDataURL(selectedCertificate);
      } else {
        setCertificatePreview("");
      }
    }
  };

  const uploadToIPFS = async () => {
    if (!element || !certificate) {
      toast.error("Please select both element and certificate.");
      return;
    }

    try {
      setLoading(true); // Start loading

      // Upload element separately
      const elementIpfsLink = await uploadFileToIPFS(element);
      setFileUrl(elementIpfsLink);
      validateMaskedElement(elementIpfsLink, "element");

      // Upload certificate separately
      const certificateIpfsLink = await uploadFileToIPFS(certificate);
      setCerFileUrl(certificateIpfsLink);
      validateMaskedElement(certificateIpfsLink, "certificate");
    } catch (error) {
      console.error("Error uploading files to IPFS:", error);
      toast.error("Error uploading files to IPFS.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const uploadFileToIPFS = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
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
    const ipfsLink = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
    return ipfsLink;
  };

  const validateMaskedElement = async (ipfsLink, type) => {
    try {
      setLoading(true); // Start loading

      const metricsResponse = await fetch("/api/updateMetrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          incrementValidation: 1,
          username: localStorage.getItem("username") || "pehliU",
        }),
      });
      if (!metricsResponse.ok) {
        throw new Error("Error updating mask metrics.");
      }

      toast.success("Mask metrics updated successfully!");

      const response = await fetch("/api/validategetlink", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ link: ipfsLink }),
      });

      if (!response.ok) {
        throw new Error(`Error validating ${type}.`);
      }
      setUsername(username.replace(/^"(.*)"$/, '$1').trim());

      setValidationResult(
        `Validation successful for ${type||"pdf"}! Username: ${username}`
      );
      toast.success(`${type} validated successfully!`);
    } catch (error) {
      console.error(`Error validating ${type}:`, error);
      toast.error(`Error validating ${type}.`);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center p-6 sm:p-8 md:p-10 lg:p-12 max-w-lg mx-auto border border-gray-300 rounded-lg bg-white shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          Validate Masked Element
        </h2>
        <div className="w-full mb-6">
          <label
            htmlFor="element-type"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Select Element Type
          </label>
          <select
            id="element-type"
            value={elementType}
            onChange={handleElementTypeChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select element type</option>
            <option value="image/*">Image (JPEG, PNG, etc.)</option>
            <option value="application/pdf">PDF</option>
            <option value="application/msword">DOC</option>
            <option value="video/mp4">MP4 Video</option>
            <option value="audio/mp3">MP3 Audio</option>
          </select>
        </div>
        <div className="w-full mb-6">
          <label
            htmlFor="certificate-type"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Select Certificate Type
          </label>
          <select
            id="certificate-type"
            value={certificateType}
            onChange={handleCertificateTypeChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select certificate type</option>
            <option value="image/*">Image (JPEG, PNG, etc.)</option>
            <option value="application/pdf">PDF</option>
            <option value="application/msword">DOC</option>
            <option value="video/mp4">MP4 Video</option>
            <option value="audio/mp3">MP3 Audio</option>
          </select>
        </div>
        {elementType && (
          <>
            <div className="w-full mb-6">
              <input
                type="file"
                accept={elementType}
                onChange={handleElementChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>
            {preview && (
              <div className="flex flex-col items-center mb-6">
                <h3 className="text-xl font-medium mb-2 text-gray-800">
                  Preview:
                </h3>
                {elementType.startsWith("image") && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full max-h-80 rounded-lg border border-gray-300"
                  />
                )}
                {elementType === "application/pdf" && (
                  <iframe
                    src={preview}
                    title="PDF Preview"
                    className="w-full h-80 border border-gray-300"
                  />
                )}
                {elementType === "video/mp4" && (
                  <video
                    src={preview}
                    controls
                    className="w-full h-80 border border-gray-300 rounded-lg"
                  />
                )}
                {elementType === "audio/mp3" && (
                  <audio
                    src={preview}
                    controls
                    className="w-full border border-gray-300 rounded-lg"
                  />
                )}
              </div>
            )}
          </>
        )}
        {certificateType && (
          <>
            <div className="w-full mb-6">
              <input
                type="file"
                accept={certificateType}
                onChange={handleCertificateChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>
            {certificatePreview && (
              <div className="flex flex-col items-center mb-6">
                <h3 className="text-xl font-medium mb-2 text-gray-800">
                  Certificate Preview:
                </h3>
                {certificateType.startsWith("image") && (
                  <img
                    src={certificatePreview}
                    alt="Preview"
                    className="max-w-full max-h-80 rounded-lg border border-gray-300"
                  />
                )}
                {certificateType === "application/pdf" && (
                  <iframe
                    src={certificatePreview}
                    title="Certificate PDF Preview"
                    className="w-full h-80 border border-gray-300"
                  />
                )}
                {certificateType === "video/mp4" && (
                  <video
                    src={certificatePreview}
                    controls
                    className="w-full h-80 border border-gray-300 rounded-lg"
                  />
                )}
                {certificateType === "audio/mp3" && (
                  <audio
                    src={certificatePreview}
                    controls
                    className="w-full border border-gray-300 rounded-lg"
                  />
                )}
              </div>
            )}
          </>
        )}

        <button
          onClick={uploadToIPFS}
          disabled={loading}
          className={`w-full px-4 py-2 font-semibold text-lg text-white rounded-lg shadow-md ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"
          }`}
        >
          {loading ? "Uploading..." : "Validate Masked Element"}
        </button>

        {validationResult && (
          <div className="w-full mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Validation Result:
            </h3>
            <p className="text-sm text-gray-600">{validationResult}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidateMaskedElement;