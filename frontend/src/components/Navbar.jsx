import { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false); // mobile menu

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login");
  };

  // Scroll to a section on the Home page (goes Home first if needed)
  const goTo = (id) => {
    setOpen(false);
    const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    if (pathname === "/") return scroll();
    navigate("/");
    setTimeout(scroll, 150);
  };

  const linkClass = ({ isActive }) => (isActive ? "nav-item active" : "nav-item");

  return (
    <>
      <div className="topbar">
        🚚 Home delivery or free store pickup &nbsp;·&nbsp; 🌿 Handcrafted terrariums, made your way
      </div>

      <nav className="site-nav">
        <div className="site-nav-inner">
          {/* Brand */}
          <Link to="/" className="nav-brand" onClick={() => setOpen(false)}>
            <img src="/logo.jpg" alt="The Moss Jar logo" className="nav-brand-img" />
            <div>
              <span className="nav-brand-name">The Moss Jar</span>
              <span className="nav-brand-tag">Terrarium</span>
            </div>
          </Link>

          {/* Mobile menu button */}
          <button
            className="nav-toggle"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? "✕" : "☰"}
          </button>

          {/* Links */}
          <div className={open ? "nav-menu open" : "nav-menu"}>
            <div className="nav-center">
              <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>
                Home
              </NavLink>
              <a className="nav-item" onClick={() => goTo("terrariums")}>Shop</a>
              <a className="nav-item" onClick={() => goTo("how")}>How It Works</a>
              {user && (
                user.role === "admin" ? (
                  <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>
                    Admin Dashboard
                  </NavLink>
                ) : (
                  <NavLink to="/my-orders" className={linkClass} onClick={() => setOpen(false)}>
                    My Orders
                  </NavLink>
                )
              )}
            </div>

            <div className="nav-right">
              {user ? (
                <>
                  <div className="nav-user">
                    <span className="nav-avatar">{user.name?.[0]?.toUpperCase()}</span>
                    <span className="nav-username">{user.name}</span>
                  </div>
                  <button className="nav-btn outline" onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-btn outline" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="nav-btn solid" onClick={() => setOpen(false)}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}