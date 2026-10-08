import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-col brand">
                    <div className="footer-brand">
            <img src="/logo.jpg" alt="The Moss Jar logo" className="footer-logo" />
            <h3>The Moss Jar</h3>
          </div>
          <p>
            Handcrafted living terrariums, made your way. Choose your size,
            container and plants, and we deliver a little forest to your door.
          </p>
        </div>

        {/* Quick links */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          {user ? (
            user.role === "admin" ? (
              <Link to="/admin">Admin Dashboard</Link>
            ) : (
              <Link to="/my-orders">My Orders</Link>
            )
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>

        {/* Shop info */}
        <div className="footer-col">
          <h4>Shopping With Us</h4>
          <span>🚚 Home delivery or store pickup</span>
          <span>💳 Secure card payment (Stripe)</span>
          <span>💵 Cash on Delivery available</span>
          <span>🎁 Personal gift messages</span>
        </div>

        {/* Contact: REPLACE with your real details */}
        <div className="footer-col">
          <h4>Contact Us</h4>
          <span>📍 Sharjah, UAE</span>
          <span>📞 +971 50 000 0000</span>
          <span>✉️ hello@themossjar.com</span>
          <span>🕘 Daily: 10 AM to 8 PM</span>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} The Moss Jar. All rights reserved.</span>
        <span>Made with 💚 and a lot of moss</span>
      </div>
    </footer>
  );
}