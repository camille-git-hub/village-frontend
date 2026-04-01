import {
  use,
} from "react";
import { AuthContext } from "../context/AuthContext.tsx";
import logo from "../assets/IconOnly_Transparent_NoBuffer.png";
import { SignUpForm } from "../components/SignUpForm.tsx";

const SignUpPage = () => {
  const context = use(AuthContext);

  if (!context) throw new Error("missing auth context");
  return (
    <div className="h-screen flex items-center justify-center">
        <div className="absolute scale-70 opacity-30">
        <img src={logo} alt="Village logo" className="w-full md:w-full" />
        </div>
        <div className="relative z-10">
            <div className="w-full max-w-md p-7 bg-white rounded shadow-lg">
            <SignUpForm />
            </div>
        </div>
    </div>

  );
};

export default SignUpPage;
