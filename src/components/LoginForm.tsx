import {
  type SubmitEventHandler,
  type ChangeEventHandler,
  useState,
  use
} from "react";
import type { LoginFormData } from "../types/auth.ts";
import { AuthContext } from "../context/AuthContext.tsx";


export const LoginForm = () => {
    const context = use(AuthContext);

    if (!context) throw new Error("missing auth context");

    const { handleLogin } = context;

    const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: ""
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

    return (
        <form
      className="w-full flex flex-col gap-4 "
      onSubmit={onSubmit}
    >
      <h1 className="text-xl text-gray-600 text-center">Login</h1>
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
      <button type="submit" className="px-4 py-2 bg-villageRed text-white font-bold grow rounded cursor-pointer">
        Login
      </button>
      <span className="text-center text-gray-600 text-sm">
        Don't have an account yet? <a href="/signup" className="text-villageRed hover:text-red-700">Sign Up</a>
      </span>
    </form>
    );
}