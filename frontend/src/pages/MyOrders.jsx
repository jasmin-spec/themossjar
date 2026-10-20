import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { buildOrderMessage, whatsappLink } from "../utils/whatsapp";

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
    <div className="page">
      <h1>My Orders</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && orders.length === 0 && <p>You have no orders yet.</p>}

      {orders.map((o) => (
        <div className="order" key={o._id}>
          <div className="order-head">
            <span>Order #{o._id.slice(-6)}</span>
            <span>{new Date(o.createdAt).toLocaleDateString()}</span>
          </div>

          {o.items.map((item) => {
            const c = item.customisation || {};
            return (
              <div className="order-item" key={item._id}>
                {item.image && <img src={item.image} alt={item.name} />}
                <div>
                  <b>{item.name}</b> x {item.quantity}
                  <br />
                  <small>
                    {c.size === "ready-made"
                      ? "Ready-made"
                      : `${c.size}, ${c.container}`}
                    {c.plants?.length > 0 && `, ${c.plants.join(", ")}`}
                    {c.theme && c.theme !== "none" && ` | Theme: ${c.theme}`}
                    {c.miniatures?.length > 0 && ` | Miniatures: ${c.miniatures.join(", ")}`}
                    {c.sculptures?.length > 0 && ` | Sculptures: ${c.sculptures.join(", ")}`}
                  </small>
                </div>
              </div>
            );
          })}

          <p>
            {o.deliveryMode === "delivery" ? "Home delivery" : "Store pickup"} |{" "}
            {o.paymentMethod === "stripe" ? "Paid by card" : "Pay on delivery / pickup"}
          </p>
          <p>
            Status: <b>{o.orderStatus}</b> | Payment:{" "}
            <b className={o.paymentStatus === "paid" ? "paid" : "pending"}>{o.paymentStatus}</b>
          </p>
          <p className="price">Total: AED {o.totalPrice}</p>

          {o.orderStatus !== "delivered" && (
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
      ))}
    </div>
  );
}