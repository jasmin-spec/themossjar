import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaWhatsapp, FaCheck } from "react-icons/fa";
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
    <div className="page op">
      <div className="op-hero">
        <div className="op-tick"><FaCheck size={30} /></div>
        <h1>Order placed!</h1>
        <p>Order <b>#{String(order._id).slice(-6)}</b> is saved. One last step to confirm it.</p>
      </div>

      <div className="op-card op-wa">
        <ol className="op-steps">
          <li className="done"><span><FaCheck size={11} /></span> Order saved</li>
          <li className="now"><span>2</span> Send it on WhatsApp</li>
          <li><span>3</span> We confirm with you</li>
        </ol>

        <a href={link} target="_blank" rel="noopener noreferrer" className="wa-btn">
          <FaWhatsapp size={22} /> Send order on WhatsApp
        </a>
        <p className="op-fine">
          WhatsApp opens with your full order already typed. Just press <b>Send</b>.
        </p>
      </div>

      <div className="op-card">
        <h3>Your order</h3>
        {order.items.map((item) => (
          <div className="op-item" key={item._id}>
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
            <span className="op-amt">AED {item.price * item.quantity}</span>
          </div>
        ))}
        <div className="co-row"><span>Delivery</span><span>AED {order.deliveryFee}</span></div>
        <div className="co-total"><span>Total</span><span>AED {order.totalPrice}</span></div>
        <p className="op-fine left">
          {order.deliveryMode === "delivery" ? "Home delivery" : "Store pickup"} |{" "}
          pay on {order.deliveryMode === "delivery" ? "delivery" : "pickup"}
        </p>
      </div>

      <p className="center-text">
        <Link to="/my-orders" className="btn-link">View My Orders</Link>
      </p>
    </div>
  );
}