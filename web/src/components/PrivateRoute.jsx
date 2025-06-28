import { Navigate, Outlet } from "react-router-dom";
import { getAuthTokens } from "@/utils/auth";

export default function PrivateRoute() {
  const { access_token: token } = getAuthTokens();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
