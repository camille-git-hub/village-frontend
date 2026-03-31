import {
  type SubmitEventHandler,
  type ChangeEventHandler,
  useState,
  use
} from "react";
import type { SignUpFormData } from "../types/auth.ts";
import { AuthContext } from "../context/AuthContext.tsx";


export const SignUpForm = () => {

    const context = use(AuthContext);

    if (!context) throw new Error("missing auth context");

    const { handleRegister, isLoading, isLoggedin } = context;

    const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const onSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    try {
      e.preventDefault();
      handleRegister(formData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setFormData((prev: SignUpFormData) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

    return (
        <form
      className="w-full flex flex-col gap-4 "
      onSubmit={onSubmit}
    >
      <h1 className="text-xl text-gray-600 text-center">Create your account</h1>
      <label className="flex items-center gap-2">
        <input
          name="firstName"
          type="text"
          onChange={handleChange}
          className="px-4 py-2 border border-gray-700 rounded grow"
          placeholder="First Name"
        />
      </label>
      <label className="flex items-center gap-2">
        <input
          name="lastName"
          type="text"
          onChange={handleChange}
          className="px-4 py-2 border border-gray-700 rounded grow"
          placeholder="Last Name"
        />
      </label>
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
      <label className="flex items-center gap-2">
        <input
          name="confirmPassword"
          type="password"
          onChange={handleChange}
          className="px-4 py-2 border border-gray-700 rounded grow"
          placeholder="Confirm Password"
        />
      </label>
      <button type="submit" className="px-4 py-2 bg-villageRed text-white font-bold grow rounded cursor-pointer">
        Sign Up
      </button>
    </form>
    );
}