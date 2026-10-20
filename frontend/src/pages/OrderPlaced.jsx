import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { buildOrderMessage, whatsappLink } from "../utils/whatsapp";

export default function OrderPlaced() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch(() => setError("Could not load your order"));
  }, [id]);

  if (error) return <div className="page"><p className="error">{error}</p></div>;
  if (!order) return <div className="page"><p>Loading...</p></div>;

  const link = whatsappLink(buildOrderMessage(order, user));

  return (
    <div className="page placed">
      <div className="placed-head">
        <img src="/logo.jpg" alt="The Moss Jar logo" className="form-logo" />
        <h1>Order placed!</h1>
        <p>Order #{String(order._id).slice(-6)} is saved. One last step to confirm it:</p>
      </div>

      <div className="summary">
        <a href={link} target="_blank" rel="noopener noreferrer" className="wa-btn">
          <FaWhatsapp size={22} /> Send order on WhatsApp
        </a>
        <p className="hint center-text">
          WhatsApp opens with your full order already typed. Just press <b>Send</b>.
        </p>
      </div>

      <div className="summary">
        <h3>Your order</h3>
        {order.items.map((item) => (
          <div className="order-item" key={item._id}>
            {item.image && <img src={item.image} alt={item.name} />}
            <div>
              <b>{item.name}</b> x {item.quantity}
              <br />
              <small>
                {item.customisation.size === "ready-made"
                  ? "Ready-made"
                  : `${item.customisation.size}, ${item.customisation.container}`}
              </small>
            </div>
          </div>
        ))}
        <p>Delivery: AED {order.deliveryFee}</p>
        <p className="price big">Total: AED {order.totalPrice}</p>
        <p>You pay on {order.deliveryMode === "delivery" ? "delivery" : "pickup"}.</p>
      </div>

      <p className="center-text">
        <Link to="/my-orders" className="btn-link">View My Orders</Link>
      </p>
    </div>
  );
}