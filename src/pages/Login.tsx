import {
  type SubmitEventHandler,
  type ChangeEventHandler,
  useState,
  use,
} from "react";
import type { LoginFormData } from "../types/auth.ts";
import { AuthContext } from "../context/AuthContext.tsx";
import { Navigate } from "react-router";

const LoginPage = () => {
  const context = use(AuthContext);

  if (!context) throw new Error("missing auth context");

  const { handleLogin, isLoading, isLoggedin } = context;

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const onSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    try {
      e.preventDefault();
      handleLogin(formData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setFormData((prev: LoginFormData) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  if (isLoading) return "...loading";

  if (!isLoading && isLoggedin) {
    return <Navigate to={"/"} />;
  }

  return (
    <form
      className="w-1/2 px-6 py-4 my-5 mx-auto flex flex-col gap-4 shadow-sm bg-gray-900 border border-gray-700 rounded"
      onSubmit={onSubmit}
    >
      <h1 className="text-2xl text-center">Signin</h1>
      <label className="flex items-center gap-2">
        <input
          name="email"
          type="email"
          onChange={handleChange}
          className="px-4 py-2 border border-gray-700 rounded grow"
          placeholder="Email"
        />
      </label>
      <label className="flex items-center gap-2">
        <input
          name="password"
          type="password"
          onChange={handleChange}
          className="px-4 py-2 border border-gray-700 rounded grow"
          placeholder="Password"
        />
      </label>
      <button className="px-4 py-2 bg-gray-200 text-gray-800 font-bold grow rounded cursor-pointer">
        Login
      </button>
    </form>
  );
};

export default LoginPage;
