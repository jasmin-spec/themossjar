import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PHONE_RE = /^\+[1-9]\d{7,14}$/;

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const whatsapp = form.phone.replace(/[\s\-()]/g, "");
    if (!PHONE_RE.test(whatsapp)) {
      return setError("Enter your WhatsApp number with country code, for example +971501234567");
    }

    setLoading(true);
    try {
      await register({ ...form, phone: whatsapp });
      navigate("/login", { state: { registered: true, email: form.email.trim().toLowerCase() } });
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
        <input name="email" type="email" placeholder="Email (must be a real email)"
          value={form.email} onChange={handleChange} autoComplete="off" required />
        <input name="password" type="password" placeholder="Password (min 6 characters)"
          value={form.password} onChange={handleChange} autoComplete="new-password"
          required minLength={6} />
        <input name="phone" type="tel" inputMode="tel" placeholder="WhatsApp number"
          value={form.phone} onChange={handleChange} autoComplete="off" required />
        <p className="hint">Include the country code, for example +971501234567</p>
        <input name="address" placeholder="Address" value={form.address}
          onChange={handleChange} autoComplete="off" required />
        <button type="submit" disabled={loading}>
          {loading ? "Checking details..." : "Register"}
        </button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}