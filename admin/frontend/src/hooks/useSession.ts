// src/hooks/useSession.ts
import { useEffect, useState } from "react";

export function useSession() {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:5170/api/session", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.username);
        } else {
          alert("Session expired! Redirecting to login.");
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };

    checkSession();
  }, []);

  return user;
}
