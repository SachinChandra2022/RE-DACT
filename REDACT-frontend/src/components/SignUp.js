"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

// Custom hook for managing localStorage
function useLocalStorage(key, initialValue) {
  // Initialize state with localStorage value or fallback to initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key) || null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  // Function to update the localStorage and state
  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

// Signup component
const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useLocalStorage("token", null);
  const [name, setName] = useLocalStorage("username", null)
  // Use the custom hook for token
  const router = useRouter();

  useEffect(() => {
    console.log(localStorage.getItem("token"))
  }, [token, setToken])

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const historyResponse = await fetch("/api/addhistory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email }),
      });

      const historyData = await historyResponse.json();

      if (!historyResponse.ok) {
        throw new Error(historyData.error || "Failed to create user history.");
      }

      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      console.log("API response:", data); // Log the API response

      if (response.ok) {
        console.log(data.username, data.token)
        setName(data.username);
        setToken(data.token); // Update the token using the custom hook
        toast.success(`Welcome, ${data.username}!`);
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Signup failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 sm:p-8 md:p-10 lg:p-12 max-w-lg mx-auto border border-gray-300 rounded-lg bg-white shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">Sign Up</h2>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="w-full mb-6">
          <label
            htmlFor="username"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            required
          />
        </div>
        <div className="w-full mb-6">
          <label
            htmlFor="email"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            required
          />
        </div>
        <div className="w-full mb-6">
          <label
            htmlFor="password"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-6 py-2 text-white font-semibold rounded-lg bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
