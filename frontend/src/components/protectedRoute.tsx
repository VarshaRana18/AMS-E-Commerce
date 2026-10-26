import { Navigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading }: any = useAuth();

  if (loading) return <p>Loading...</p>;

  return currentUser ? children : <Navigate replace to="/" />;
};

export default ProtectedRoute;
