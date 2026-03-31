import {
  use
} from "react";
import { AuthContext } from "../context/AuthContext.tsx";
import { Navigate } from "react-router";
import { SignUpForm } from "../components/SignUpForm.tsx";

const SignUpPage = () => {
  const context = use(AuthContext);

  if (!context) throw new Error("missing auth context");
    const { isLoading, isLoggedin } = context;

  //if (isLoading) return "...loading";

  if (!isLoading && isLoggedin) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="w-full h-screen flex items-center justify-center">
    <SignUpForm />
    <a href="/login" className="text-center text-gray-300 hover:text-white">Already have an account? Login</a>
    </div>

  );
};

export default SignUpPage;  