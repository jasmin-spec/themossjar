import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();

  // If the person just registered, their email is already filled in
  const [email, setEmail] = useState(state?.email || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="form-box">
      <img src="/logo.jpg" alt="The Moss Jar logo" className="form-logo" />
      <h2>Login</h2>

      {state?.registered && (
        <p className="success">
          ✅ Registered successfully! Please login with your email and password.
        </p>
      )}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      <p>New here? <Link to="/register">Create an account</Link></p>
    </div>
  );
}