import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in? No need to register
  if (user) return <Navigate to="/" />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      // Go to Login with a success message and the email filled in
      navigate("/login", { state: { registered: true, email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="form-box">
      <img src="/logo.jpg" alt="The Moss Jar logo" className="form-logo" />
      <h2>Create Account</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} autoComplete="off">
        <input name="name" placeholder="Full name" value={form.name}
          onChange={handleChange} autoComplete="off" required />
        <input name="email" type="email" placeholder="Email" value={form.email}
          onChange={handleChange} autoComplete="off" required />
        <input name="password" type="password" placeholder="Password (min 6 characters)"
          value={form.password} onChange={handleChange} autoComplete="new-password"
          required minLength={6} />
        <input name="phone" placeholder="Phone number" value={form.phone}
          onChange={handleChange} autoComplete="off" required />
        <input name="address" placeholder="Address" value={form.address}
          onChange={handleChange} autoComplete="off" required />
        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}