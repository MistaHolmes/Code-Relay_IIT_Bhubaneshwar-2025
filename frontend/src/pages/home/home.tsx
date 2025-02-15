
import React, { useState } from "react";
import Attendoo from "../../assist/reshot-icon-lastfm-NVQ647DYCA.svg";
import { Link } from "react-router-dom";


const Home = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black min-h-screen">
      <header className="py-6 bg-gradient-to-r from-gray-900 to-bl  ack sm:py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="shrink-0">
              <a href="#" className="flex group">
                <img
                  className="w-auto h-9 transition-transform group-hover:scale-110"
                  src={Attendoo}
                  alt="Logo"
                />
              </a>
            </div>

            <div className="flex md:hidden">
              <button
                type="button"
                className="text-white hover:text-cyan-400 transition-colors"
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
              >
                {!expanded ? (
                  <svg
                    className="w-7 h-7"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-7 h-7"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>

            <nav className="hidden md:flex md:items-center md:justify-end md:space-x-12">
              {["Products", "Pricing", "Support"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-base font-medium text-gray-400 transition-all duration-200 hover:text-cyan-400"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          {expanded && (
            <nav className="md:hidden">
              <div className="flex flex-col pt-8 pb-4 space-y-6">
                {["Products", "Features", "Pricing", "Support"].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-base font-medium text-gray-400 transition-all duration-200 hover:text-cyan-400"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      <section className="py-12 sm:pb-16 lg:pb-20 xl:pb-24">
        <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
          <div className="relative">
            <div className="lg:w-2/3">
              <p className="text-sm font-medium tracking-widest text-cyan-400 uppercase">
                Your Classroom, Upgraded
              </p>
              <h1 className="mt-6 text-4xl font-bold text-white sm:mt-10 sm:text-5xl lg:text-6xl xl:text-8xl">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  Welcome to Attendoo!
                </span>
              </h1>
              <p className="max-w-lg mt-4 text-xl font-medium text-gray-400 sm:mt-8">
                Smart Attendance. Live Interaction. Seamless Learning
              </p>

              <div className="flex flex-wrap gap-6 mt-8 sm:mt-12">
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-all duration-400"></div>
                  <Link
                    to="/studentlogin"
                    className="relative flex items-center px-8 py-4 bg-gray-900 rounded-full leading-none transition-all duration-200 group-hover:bg-gray-800"
                  >
                    <span className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      Student Login
                    </span>
                  </Link>
                </div>

                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-all duration-400"></div>
                  <Link
                    to="/teacherLogin"
                    className="relative flex items-center px-8 py-4 bg-gray-900 rounded-full leading-none transition-all duration-200 group-hover:bg-gray-800"
                  >
                    <span className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      Professor Login
                    </span>
                  </Link>
                </div>

                <div className="group relative">
  <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-gray-500 rounded-full blur opacity-1 group-hover:opacity-75 transition-all duration-400"></div>
  <Link
    to="/adminLogin"
    className="relative flex items-center px-6 py-3 bg-gray-900 rounded-full leading-none transition-all duration-200 group-hover:bg-gray-800"
  >
    <span className="text-sm font-medium bg-gradient-to-r from-gray-400 to-gray-300 bg-clip-text text-transparent">
      💼 Admin Access
    </span>
  </Link>
</div>

              </div>

              

              <div className="inline-flex items-center pt-6 mt-8 border-t border-gray-800 sm:pt-10 sm:mt-14">
                <div className="animate-pulse">
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.5"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13 7.00003H21M21 7.00003V15M21 7.00003L13 15L9 11L3 17"
                      stroke="url(#a)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient
                        id="a"
                        x1="3"
                        y1="7.00003"
                        x2="22.2956"
                        y2="12.0274"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0%" stopColor="var(--color-cyan-500)" />
                        <stop offset="100%" stopColor="var(--color-purple-500)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span className="ml-2 text-base font-medium text-cyan-200">
                  Join 10K+ students & professors on Attendoo!
                </span>
              </div>
            </div>

            <div className="mt-8 md:absolute md:mt-0 md:top-32 lg:top-0 md:right-0">
              <img
                className="w-full max-w-xs mx-auto transition-transform duration-300 hover:scale-105 lg:max-w-lg xl:max-w-xl"
                src="https://landingfoliocom.imgix.net/store/collection/dusk/images/hero/1/3d-illustration.png"
                alt="3D Illustration"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

