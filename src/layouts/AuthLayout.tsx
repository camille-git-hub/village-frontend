import {Outlet} from "react-router";

export function AuthLayout() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div>
        <h1>Village</h1>
        </div>
        <Outlet /> {/* This will render the child routes (Login, SignUp) */}
      </div>
    </div>
  );
}