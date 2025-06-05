import React from "react";
import Link from "next/link";
import Header from "@/components/Header";

const page = () => {
  return (
    <div>
      <Header />
      <section className="relative">
        <div className="px-4 pt-10 mx-auto max-w-7xl md:pt-16">
          <div className="w-full pb-5 mx-auto text-center md:w-11/12">
            <h1 className="mb-3 text-5xl font-bold tracking-tight text-black dark:text-black md:text-6xl">
              Masking Media
              <br />
              <div className="m-2 text-transparent bg-clip-text bg-gradient-to-r dark:bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 dark:from-pink-500 dark:via-purple-400 dark:to-indigo-500">
                with Power of Blockchain.
              </div>
            </h1>
            <p className="max-w-xl pt-5 mx-auto text-lg text-black dark:text-black md:text-lg">
              Redact is a platform where you do not need to worry about the
              security of your documents, audios, videos and more.
            </p>
            <div className="mt-6 text-center md:ml-6">
              <Link
                className="inline-flex items-center px-5 py-3 text-sm font-medium text-white transition duration-300 bg-black rounded hover:bg-gray-600"
                aria-label="learn more"
                rel="noreferrer"
                href="https://anayverma.in"
              >
                <span className="flex justify-center">GitHub Link</span>
              </Link>
              <br className="sm:hidden" />
              <Link
                href="/mask"
                className="inline-flex items-center px-5 py-3 mt-2 ml-0 text-sm font-medium text-black transition duration-300 border rounded shadow dark:hover:border-gray-500 hover:shadow-md md:ml-2"
                aria-label="learn more"
              >
                <span className="flex justify-center">See a Demo</span>
              </Link>
            </div>
          </div>
          <div className="relative w-full py-10 mx-auto text-center md:py-2 md:my-2 md:w-10/12">
            <div className="relative z-10">
              <Link
                target="_blank"
                rel="noreferrer"
                href="https://unsplash.com/photos/e9TrFZZ72DQ"
              >
                {/* <img
                  className="transition duration-700 shadow-xl rounded-xl ring-1 ring-black ring-opacity-5 hover:transform hover:scale-105"
                  src="/images/placeholder.webp"
                  alt="Placeholder Image"
                /> */}
              </Link>
            </div>

            <div className="">
              <img
                src="/women.svg"
                alt="Illustration of a woman"
                className="mx-auto w-[40rem] h-[40rem] md:w-[48rem] md:h-[48rem]"
              />
            </div>

            <p className="z-10 my-8 text-sm font-medium text-gray-500">
              Made By Team Pragyantrix.
            </p>
            <p className="z-10 text-sm font-medium text-gray-500">
              All rights reserved ©2024
            </p>
          </div>
        </div>
        {/* <div
        style={{ backgroundImage: "url(/images/blur.png)" }}
        className="absolute inset-0 w-full h-full bg-bottom bg-no-repeat bg-cover -z-1"
      /> */}
      </section>
    </div>
  );
};

export default page;
