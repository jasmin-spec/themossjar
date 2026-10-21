import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { ADMIN_WHATSAPP, INSTAGRAM_URL } from "../config";

export default function SocialFloat() {
  const hello = encodeURIComponent(
    "Hello The Moss Jar, I have a question about your terrariums."
  );

  return (
    <div className="social-float">
      <a
        href={`https://wa.me/${ADMIN_WHATSAPP}?text=${hello}`}
        target="_blank"
        rel="noopener noreferrer"
        className="sf wa"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp />
      </a>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="sf ig"
        aria-label="Visit our Instagram"
      >
        <FaInstagram />
      </a>
    </div>
  );
}