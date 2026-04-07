import {
  use,
} from "react";
import { AuthContext } from "../context/AuthContext.tsx";
import { Navigate } from "react-router";
import { LoginForm } from "../components/LoginForm.tsx";
import logo from "../assets/IconOnly_Transparent_NoBuffer.png";

const LoginPage = () => {
  const context = use(AuthContext);

  if (!context) throw new Error("missing auth context");

  const { isLoggedin, isLoading } = context;


  if (!isLoading && isLoggedin) {
    return <Navigate to={"/listings"} />;
  }

  return (
    <div className="h-screen flex items-center justify-center">
        <div className="absolute scale-70 opacity-30">
        <img src={logo} alt="Village logo" className="w-full md:w-full" />
        </div>
        <div className="relative z-10">
            <div className="w-full max-w-md p-7 bg-white rounded shadow-lg">
            <LoginForm />
            </div>
        </div>
    </div>

  );
};

export default LoginPage;
