import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        const response = await fetch("http://localhost:5170/api/auth/logout", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          localStorage.removeItem("token");
          navigate("/");
        } else {
          console.error("Failed to log out");
        }
      } catch (error) {
        console.error("Error logging out:", error);
      }
    };

    logout();
  }, [history]);

  return <div>Logging out...</div>;
};

export default Logout;
