import { Link } from "react-router-dom";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import {
  ADMIN_WHATSAPP, WHATSAPP_DISPLAY, INSTAGRAM_USER,
  SHOP_EMAIL, SHOP_LOCATION, SHOP_HOURS,
} from "../config";

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col brand">
          <div className="footer-brand">
            <img src="/logo.jpg" alt="The Moss Jar logo" className="footer-logo" />
            <h3>The Moss Jar</h3>
          </div>
          <p>
            Handcrafted living terrariums, made your way. Choose your design,
            customise it, and we deliver a little forest to your door.
          </p>
          <div className="footer-social">
            <a href={`https://wa.me/${ADMIN_WHATSAPP}`} target="_blank"
              rel="noopener noreferrer" aria-label="WhatsApp"><FaWhatsapp /></a>
            <a href={`https://www.instagram.com/${INSTAGRAM_USER}`} target="_blank"
              rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
          </div>
        </div>

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

        <div className="footer-col">
          <h4>Shopping With Us</h4>
          <span>Order easily on WhatsApp</span>
          <span>Home delivery or store pickup</span>
          <span>Pay on delivery or pickup</span>
          <span>Personal gift messages</span>
        </div>

        <div className="footer-col">
          <h4>Contact Us</h4>
          <span>{SHOP_LOCATION}</span>
          <a href={`https://wa.me/${ADMIN_WHATSAPP}`} target="_blank" rel="noopener noreferrer">
            WhatsApp: {WHATSAPP_DISPLAY}
          </a>
          <a href={`https://www.instagram.com/${INSTAGRAM_USER}`} target="_blank" rel="noopener noreferrer">
            Instagram: @{INSTAGRAM_USER}
          </a>
          <span>{SHOP_EMAIL}</span>
          <span>{SHOP_HOURS}</span>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} The Moss Jar. All rights reserved.</span>
        <span>Made with love and a lot of moss</span>
      </div>
    </footer>
  );
}