import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { buildOrderMessage, whatsappLink } from "../utils/whatsapp";

function Tracker({ order }) {
  const stages =
    order.deliveryMode === "delivery"
      ? ["placed", "preparing", "out for delivery", "delivered"]
      : ["placed", "preparing", "ready for pickup", "delivered"];
  const current = Math.max(0, stages.indexOf(order.orderStatus));

  return (
    <ol className="mo-track">
      {stages.map((s, i) => (
        <li key={s} className={i < current ? "done" : i === current ? "now" : ""}>
          <span />
          <em>{s}</em>
        </li>
      ))}
    </ol>
  );
}

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/orders/my")
      .then(({ data }) => setOrders(data))
      .catch(() => setError("Could not load your orders"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page mo">
      <h1>My Orders</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && orders.length === 0 && (
        <div className="mo-empty">
          <p>You have no orders yet.</p>
          <Link to="/" className="btn-link">Browse terrariums</Link>
        </div>
      )}

      {orders.map((o) => (
        <div className="mo-card" key={o._id}>
          <div className="mo-head">
            <div>
              <b>Order #{o._id.slice(-6)}</b>
              <small>{new Date(o.createdAt).toLocaleDateString()}</small>
            </div>
            <span className={`mo-pill ${o.paymentStatus === "paid" ? "paid" : "pending"}`}>
              {o.paymentStatus === "paid" ? "Paid" : "Pay on delivery"}
            </span>
          </div>

          {o.orderStatus !== "cancelled" && <Tracker order={o} />}
          {o.orderStatus === "cancelled" && <p className="mo-cancel">This order was cancelled.</p>}

          {o.items.map((item) => {
            const c = item.customisation || {};
            return (
              <div className="mo-item" key={item._id}>
                {item.image && <img src={item.image} alt={item.name} />}
                <div>
                  <b>{item.name}</b> x {item.quantity}
                  <br />
                  <small>
                    {c.size === "ready-made" ? "Ready-made" : `${c.size}, ${c.container}`}
                    {c.plants?.length > 0 && `, ${c.plants.join(", ")}`}
                    {c.theme && c.theme !== "none" && ` | Theme: ${c.theme}`}
                    {c.miniatures?.length > 0 && ` | Miniatures: ${c.miniatures.join(", ")}`}
                    {c.sculptures?.length > 0 && ` | Sculptures: ${c.sculptures.join(", ")}`}
                  </small>
                </div>
              </div>
            );
          })}

          <div className="mo-foot">
            <div>
              <small>{o.deliveryMode === "delivery" ? "Home delivery" : "Store pickup"}</small>
              <div className="mo-total">AED {o.totalPrice}</div>
            </div>
            {o.orderStatus !== "delivered" && o.orderStatus !== "cancelled" && (
              <a
                href={whatsappLink(buildOrderMessage(o, user))}
                target="_blank"
                rel="noopener noreferrer"
                className="wa-btn small"
              >
                <FaWhatsapp size={18} /> Send on WhatsApp
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}