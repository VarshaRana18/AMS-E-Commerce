import { ImageLogo } from "./ImageLogo";
import { useState } from "react";
import { Button } from "@heroui/button";
import { Alert } from "@heroui/react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleLogin = async () => {
    const response = await fetch("http://localhost:5170/api/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token);
      // alert("Login successful!");
      window.location.href = "/carousel";
    } else {
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000); // Hide after 3s
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      <div className="border border-gray-300 rounded-lg p-6 shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] flex justify-between w-full max-w-2xl">
        {showAlert && (
          <div className="fixed top-8 z-50 py-1 bg-red-100 text-red-700 border border-red-400 rounded-lg shadow-lg transition-all duration-300 opacity-100 scale-100 w-full max-w-2xl left-1/2 transform -translate-x-1/2">
            <Alert color="danger" title="Incorrect Password or Username!" />
          </div>
        )}
        <form className="space-y-4 w-full">
          <div className="mb-8">
            <h3 className="text-gray-800 text-3xl font-bold">LOGIN</h3>
          </div>

          <div>
            <label className="text-gray-800 text-sm mb-2 block">
              User name
            </label>
            <div className="relative flex items-center">
              <input
                name="username"
                type="text"
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full text-sm text-gray-800 border border-gray-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                placeholder="Enter user name"
              />

              <svg
                className="w-6 h-6 absolute right-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="#bbb"
                viewBox="0 0 24 24"
              >
                <path
                  fill-rule="evenodd"
                  d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div>
            <label className="text-gray-800 text-sm mb-2 block">Password</label>
            <div className="relative flex items-center">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-sm text-gray-800 border border-gray-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                placeholder="Enter password"
              />
              <div
                onClick={togglePasswordVisibility}
                className="absolute right-4 cursor-pointer"
              >
                {showPassword ? (
                  <svg
                    className="w-6 h-6 text-gray-800"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="#bbb"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3.933 13.909A4.357 4.357 0 0 1 3 12c0-1 4-6 9-6m7.6 3.8A5.068 5.068 0 0 1 21 12c0 1-3 6-9 6-.314 0-.62-.014-.918-.04M5 19 19 5m-4 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="#bbb"
                      stroke-width="2"
                      d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z"
                    />
                    <path
                      stroke="#bbb"
                      stroke-width="2"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>

          <div className="!mt-8 flex justify-center w-full">
            <Button
              onPress={handleLogin}
              type="button"
              className="w-full shadow-xl py-2.5 px-4 text-sm tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Login
            </Button>
          </div>
        </form>

        <div className="max-md:mt-8 flex items-center justify-center mx-10">
          <ImageLogo
            size={250}
            className="hover:scale-105 transition-transform items-center mx-10"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
