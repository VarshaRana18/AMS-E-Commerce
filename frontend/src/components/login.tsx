import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Link,
  Alert,
} from "@heroui/react";
import {
  sendEmailVerification,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  getAuth,
} from "firebase/auth";
import { addToast } from "@heroui/toast";

import { useAuth } from "../contexts/AuthContext";
import { auth } from "../firebase.config.js";

const Login = ({ placement }: any) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasStartedTypingPassword, setHasStartedTypingPassword] =
    useState(false);
  const [resetEmailOrPhone, setResetEmailOrPhone] = useState("");
  const [keepModalOpen] = useState(false);
  const { setIsSignupProcess }: any = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  useEffect(() => {
    let verificationCheckInterval: any;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !user.emailVerified) {
        verificationCheckInterval = setInterval(() => {
          user.reload().then(async () => {
            if (user.emailVerified) {
              clearInterval(verificationCheckInterval);

              try {
                const response = await fetch(`/api/auth/verify/${user.email}`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                });

                if (!response.ok) {
                  throw new Error("Failed to update verification status");
                }

                setAlertMessage("Email verified successfully! Redirecting...");
                setShowAlert(true);

                setTimeout(() => {
                  window.location.href = "/";
                }, 3000);
              } catch (error) {}
            }
          });
        }, 3000);
      }
    });

    return () => {
      unsubscribe();
      if (verificationCheckInterval) {
        clearInterval(verificationCheckInterval);
      }
    };
  }, []);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^\d{10}$/;

  const passwordErrors: any = [];

  if (password.length < 8) {
    passwordErrors.push("Password must be at least 8 characters long.");
  }
  if (!/[A-Z]/.test(password)) {
    passwordErrors.push("Password must include at least one uppercase letter.");
  }
  if (!/[a-z]/.test(password)) {
    passwordErrors.push("Password must include at least one lowercase letter.");
  }
  if (!/\d/.test(password)) {
    passwordErrors.push("Password must include at least one number.");
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    passwordErrors.push(
      "Password must include at least one special character."
    );
  }

  const handleToggleForm = () => {
    setIsSignUp(!isSignUp);
    setIsForgotPassword(false);

    setEmail("");
    setPhone("");
    setName("");
    setPassword("");
    setConfirmPassword("");
    setHasStartedTypingPassword(false);
    setResetEmailOrPhone("");
    setShowAlert(false);
  };

  const handlePasswordChange = (value: any) => {
    setPassword(value);
    if (!hasStartedTypingPassword) {
      setHasStartedTypingPassword(true);
    }
  };

  const handleForgotPassword = () => {
    setIsForgotPassword(true);
    setShowAlert(false);
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setResetEmailOrPhone("");
    setShowAlert(false);
  };

  const handleSignupSubmit = async () => {
    setShowAlert(false);
    setIsSignupProcess(true);
    // Validation checks remain the same
    if (!name.trim()) {
      setAlertMessage("Name is required");
      setShowAlert(true);

      return;
    }

    if (!email.trim() || !emailRegex.test(email)) {
      setAlertMessage("Please enter a valid email address");
      setShowAlert(true);

      return;
    }

    if (!password) {
      setAlertMessage("Password is required");
      setShowAlert(true);

      return;
    }

    if (passwordErrors.length > 0) {
      setAlertMessage("Password does not meet the requirements");
      setShowAlert(true);

      return;
    }

    if (password !== confirmPassword) {
      setAlertMessage("Passwords do not match");
      setShowAlert(true);

      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await sendEmailVerification(userCredential.user);

      // Add MongoDB document creation here
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          mobile: phone,
          password: "firebase-auth",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create user profile");
      }

      setAlertMessage(
        "Verification email sent! Please check your email to verify your account."
      );
      setShowAlert(true);
    } catch (error) {
      if ((error as { code: string }).code === "auth/email-already-in-use") {
        setAlertMessage(
          "Email already exists. Please use a different email address."
        );
        setShowAlert(true);

        return;
      }

      setAlertMessage("Error during signup. Please try again.");
      setShowAlert(true);
    }
  };

  const handleLoginSubmit = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        setAlertMessage("Please verify your email before logging in.");
        setShowAlert(true);

        return;
      }
      const response = await fetch(`/api/auth/user/${user.email}`);
      const userData = await response.json();

      addToast({
        title: `Welcome back ${userData.name}!`,
        description: `Logged in as ${user.email}`,
        timeout: 3000,
        color: "success",
      });
    } catch (error) {
      if ((error as { code: string }).code === "auth/invalid-credential") {
        setAlertMessage("Invalid email or password. Please try again.");
        setShowAlert(true);

        return;
      }

      if ((error as { code: string }).code === "auth/user-not-found") {
        setAlertMessage("No account found with this email.");
        setShowAlert(true);

        return;
      }

      setAlertMessage("Login failed. Please try again.");
      setShowAlert(true);
    }
  };
  // const handleGoogleLogin = async () => {
  //   try {
  //     const provider = new GoogleAuthProvider();
  //     const result = await signInWithPopup(auth, provider);
  //     const user = result.user;

  //     // Check if user exists in MongoDB
  //     const response = await fetch(`/api/auth/check-user/${user.email}`);

  //     console.log(response);
  //     if (response.status === 404) {
  //       // If user does not exist, create a new one
  //       await fetch("/api/auth/google", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           name: user.displayName,
  //           email: user.email,
  //           mobile: "", // No phone from Google, so keep it empty for now
  //           image: user.photoURL, // Store Google profile image
  //           password: "firebase-auth",
  //         }),
  //       });
  //     }

  //     addToast({
  //       title: `Welcome back ${user.displayName}!`,
  //       description: `Logged in as ${user.email}`,
  //       timeout: 3000,
  //       shouldShowTimeoutProgess: true,
  //       color: "success",
  //     });
  //     setTimeout(() => {
  //       window.location.href = "/";
  //     }, 3000);
  //   } catch (error) {
  //     console.error("Google login error:", error);
  //   }
  // };

  const handleForgotPasswordSubmit = async () => {
    if (!resetEmailOrPhone || !emailRegex.test(resetEmailOrPhone)) {
      setAlertMessage("Please enter a valid email address");
      setShowAlert(true);

      return;
    }

    try {
      const auth = getAuth();

      await sendPasswordResetEmail(auth, resetEmailOrPhone);

      setAlertMessage(
        "If an account exists with this email, you will receive a password reset link."
      );
      setShowAlert(true);

      setTimeout(() => {
        handleBackToLogin();
      }, 3000);
    } catch (error: any) {
      if (error?.code === "auth/user-not-found") {
        setAlertMessage(
          "This email is not registered. Please check the email or sign up."
        );
      } else {
        setAlertMessage("Failed to send reset link. Please try again.");
      }
      setShowAlert(true);
    }
  };

  const handleKeyPress = (e: any, nextFieldId: any, isLastField = false) => {
    if (e.key === "Enter") {
      if (isLastField) {
        handleSignupSubmit();
      } else {
        document.getElementById(nextFieldId)?.focus();
      }
    }
  };
  const handleLoginKeyPress = (e: any, field: any) => {
    if (e.key === "Enter") {
      if (field === "email") {
        (
          document.querySelector('input[type="password"]') as HTMLElement
        )?.focus();
      } else if (field === "password") {
        handleLoginSubmit();
      }
    }
  };

  return (
    <>
      <Button color="primary" onPress={onOpen}>
        Login
      </Button>
      <Modal
        isOpen={isOpen || keepModalOpen}
        placement={placement}
        onOpenChange={() => {
          if (!keepModalOpen) {
            onOpenChange();
          }
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isSignUp
                  ? "Sign Up"
                  : isForgotPassword
                    ? "Reset Password"
                    : "Log in"}
              </ModalHeader>
              <ModalBody>
                {showAlert && (
                  <Alert className="mb-4" color="default">
                    {alertMessage}
                  </Alert>
                )}

                {isSignUp ? (
                  // Sign Up Form
                  <>
                    <Input
                      id="name-input"
                      label="Name"
                      placeholder="Enter your name"
                      value={name}
                      variant="bordered"
                      onKeyPress={(e) => handleKeyPress(e, "phone-input")}
                      onValueChange={setName}
                    />
                    <Input
                      errorMessage={
                        !phoneRegex.test(phone) && phone.length > 0
                          ? "Phone number must be exactly 10 digits."
                          : ""
                      }
                      id="phone-input"
                      isInvalid={!phoneRegex.test(phone) && phone.length > 0}
                      label="Phone Number"
                      placeholder="Enter your phone number"
                      value={phone}
                      variant="bordered"
                      onKeyPress={(e) => handleKeyPress(e, "email-input")}
                      onValueChange={setPhone}
                    />
                    <Input
                      errorMessage={
                        !emailRegex.test(email) && email.length > 0
                          ? "Enter a valid email address."
                          : ""
                      }
                      id="email-input"
                      isInvalid={!emailRegex.test(email) && email.length > 0}
                      label="Email"
                      placeholder="Enter your email"
                      value={email}
                      variant="bordered"
                      onKeyPress={(e) => handleKeyPress(e, "password-input")}
                      onValueChange={setEmail}
                    />
                    <Input
                      endContent={
                        <button
                          className="focus:outline-none"
                          type="button"
                          onClick={() =>
                            setShowSignUpPassword(!showSignUpPassword)
                          }
                        >
                          {showSignUpPassword ? (
                            <svg
                              className="w-5 h-5 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.5}
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.066 7.5a10.523 10.523 0 01-4.064 5.942M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.5}
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                      }
                      errorMessage={
                        hasStartedTypingPassword &&
                        passwordErrors.length > 0 ? (
                          <ul>
                            {passwordErrors.map((error: any, i: any) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        ) : (
                          ""
                        )
                      }
                      id="password-input"
                      isInvalid={
                        hasStartedTypingPassword && passwordErrors.length > 0
                      }
                      label="Password"
                      placeholder="Enter your password"
                      type={showSignUpPassword ? "text" : "password"}
                      value={password}
                      variant="bordered"
                      onKeyPress={(e) =>
                        handleKeyPress(e, "confirm-password-input")
                      }
                      onValueChange={handlePasswordChange}
                    />
                    <Input
                      endContent={
                        <button
                          className="focus:outline-none"
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <svg
                              className="w-5 h-5 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.5}
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.066 7.5a10.523 10.523 0 01-4.064 5.942M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.5}
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                      }
                      errorMessage={
                        confirmPassword.length > 0 &&
                        confirmPassword !== password
                          ? "Passwords do not match."
                          : ""
                      }
                      id="confirm-password-input"
                      isInvalid={
                        confirmPassword.length > 0 &&
                        confirmPassword !== password
                      }
                      label="Confirm Password"
                      placeholder="Re-enter your password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      variant="bordered"
                      onKeyPress={(e) => handleKeyPress(e, "", true)}
                      onValueChange={setConfirmPassword}
                    />
                    <div className="text-center mt-2">
                      <span>Already have an account? </span>
                      <Link
                        color="primary"
                        href="#login"
                        onPress={handleToggleForm}
                      >
                        Login
                      </Link>
                    </div>
                  </>
                ) : (
                  // Login/Forgot Password Form
                  <>
                    {isForgotPassword ? (
                      // Forgot Password Form
                      <>
                        <div className="text-center mb-4">
                          <p className="text-sm text-gray-600">
                            Enter your email to reset your password
                          </p>
                        </div>
                        <Input
                          label="Email"
                          placeholder="Enter your email"
                          value={resetEmailOrPhone}
                          variant="bordered"
                          onValueChange={setResetEmailOrPhone}
                        />
                        <div className="flex justify-between mt-4">
                          <Button
                            color="primary"
                            variant="flat"
                            onPress={handleBackToLogin}
                          >
                            Back to Login
                          </Button>
                          <Button
                            color="primary"
                            onPress={handleForgotPasswordSubmit}
                          >
                            Send Reset Link
                          </Button>
                        </div>
                      </>
                    ) : (
                      // Login Form
                      <>
                        <Input
                          label="Email"
                          placeholder="Enter your email"
                          value={email}
                          variant="bordered"
                          onKeyPress={(e) => handleLoginKeyPress(e, "email")}
                          onValueChange={setEmail}
                        />
                        <Input
                          endContent={
                            <button
                              className="focus:outline-none"
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <svg
                                  className="w-5 h-5 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={1.5}
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.066 7.5a10.523 10.523 0 01-4.064 5.942M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-5 h-5 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={1.5}
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </button>
                          }
                          label="Password"
                          placeholder="Enter your password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          variant="bordered"
                          onKeyPress={(e) => handleLoginKeyPress(e, "password")}
                          onValueChange={setPassword}
                        />
                        <div className="flex py-2 px-1 justify-end">
                          <Link
                            color="primary"
                            href="#"
                            size="sm"
                            onPress={handleForgotPassword}
                          >
                            Forgot password?
                          </Link>
                        </div>
                        {/* <div className="hidden lg:flex items-center gap-4">
                          <hr className="w-full border-gray-300" />
                          <p className="text-sm text-gray-800 text-center">or</p>
                          <hr className="w-full border-gray-300" />
                        </div> */}
                        <div className="flex items-center gap-4">
                          <hr className="w-full border-gray-300" />
                        </div>
                        <div className="flex flex-col gap-4 pt-4">
                          {/* <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-slate-300 bg-white p-2 text-sm font-medium text-black outline-none focus:ring-2 focus:ring-[#333] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 hidden lg:inline-flex"  onClick={handleGoogleLogin}>
                            <img
                              src="https://www.svgrepo.com/show/475656/google-color.svg"
                              alt="Google"
                              className="h-[18px] w-[18px]"
                            />
                            Continue with Google
                          </button> */}
                          <div className="text-center">
                            <span>New User? </span>
                            <Link
                              color="primary"
                              href="#signup"
                              onPress={handleToggleForm}
                            >
                              Register here
                            </Link>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                {isSignUp && (
                  <Button color="primary" onPress={handleSignupSubmit}>
                    Sign Up
                  </Button>
                )}
                {!isSignUp && !isForgotPassword && (
                  <Button color="primary" onPress={handleLoginSubmit}>
                    Sign in
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Login;
