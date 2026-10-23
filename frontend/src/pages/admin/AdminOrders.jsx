import { useEffect, useState } from "react";
import { FaWhatsapp, FaTrash } from "react-icons/fa";
import api from "../../api";

const STATUSES = [
  "placed", "preparing", "out for delivery",
  "ready for pickup", "delivered",
];

const isIntl = (p) => /^\+\d{8,15}$/.test(String(p || "").replace(/[\s\-()]/g, ""));

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () =>
    api
      .get("/orders")
      .then(({ data }) => setOrders(data))
      .catch(() => setError("Could not load orders"))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const changeStatus = async (orderId, orderStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update status");
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order permanently? This cannot be undone.")) return;
    try {
      await api.delete(`/orders/${orderId}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete order");
    }
  };

  const paidTotal = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingCount = orders.filter((o) => o.paymentStatus === "pending").length;

  return (
    <div>
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}

      <div className="ad-stats">
        <div className="ad-stat">
          <span>Total orders</span>
          <b>{orders.length}</b>
        </div>
        <div className="ad-stat">
          <span>Paid revenue</span>
          <b>AED {paidTotal}</b>
        </div>
        <div className="ad-stat warn">
          <span>Payment pending</span>
          <b>{pendingCount}</b>
        </div>
      </div>

      {!loading && orders.length === 0 && (
        <div className="ad-empty">No orders yet.</div>
      )}

      {orders.map((o) => {
        const statusOptions = STATUSES.includes(o.orderStatus)
          ? STATUSES
          : [...STATUSES, o.orderStatus];

        return (
          <div className="ad-order" key={o._id}>
            <div className="ad-order-top">
              <div>
                <b className="ad-order-id">Order #{o._id.slice(-6)}</b>
                <small>{new Date(o.createdAt).toLocaleString()}</small>
              </div>
              <div className="ad-badges">
                <span className={`ad-badge ${o.paymentStatus === "paid" ? "green" : "orange"}`}>
                  {o.paymentStatus === "paid" ? "Paid" : "Payment pending"}
                </span>
                <span className="ad-badge blue">{o.orderStatus}</span>
              </div>
            </div>

            <div className="ad-cols">
              <div className="ad-box">
                <h4>Customer</h4>
                <p><b>{o.user?.name || "Deleted user"}</b></p>
                <p>{o.user?.email}</p>
                <p>
                  {isIntl(o.phone) ? (
                    <a
                      className="wa-chip"
                      href={`https://wa.me/${String(o.phone).replace(/[^\d]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaWhatsapp /> {o.phone}
                    </a>
                  ) : (
                    o.phone
                  )}
                </p>
              </div>
              <div className="ad-box">
                <h4>{o.deliveryMode === "delivery" ? "Home delivery" : "Store pickup"}</h4>
                <p>{o.deliveryAddress}</p>
                <p className="ad-muted">
                  {o.paymentMethod === "stripe" ? "Card (Stripe)" : "Pay on delivery / pickup"}
                </p>
              </div>
            </div>

            <div className="ad-items">
              {o.items.map((item) => {
                const c = item.customisation || {};
                return (
                  <div className="ad-item" key={item._id}>
                    {item.image && <img src={item.image} alt={item.name} />}
                    <div className="ad-item-info">
                      <b>{item.name}</b> x {item.quantity}
                      <span className="ad-muted"> (AED {item.price} each)</span>
                      <small>
                        {c.size === "ready-made" ? "Ready-made" : `${c.size}, ${c.container}`}
                        {c.plants?.length > 0 && `, ${c.plants.join(", ")}`}
                        {c.theme && c.theme !== "none" && ` | Theme: ${c.theme}`}
                        {c.miniatures?.length > 0 && ` | Miniatures: ${c.miniatures.join(", ")}`}
                        {c.sculptures?.length > 0 && ` | Sculptures: ${c.sculptures.join(", ")}`}
                        {c.message && ` | Message: "${c.message}"`}
                      </small>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="ad-order-foot">
              <div className="ad-total">
                <small>Total</small>
                <b>AED {o.totalPrice}</b>
              </div>
              <div className="ad-actions">
                <label>
                  Status
                  <select
                    value={o.orderStatus}
                    onChange={(e) => changeStatus(o._id, e.target.value)}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <button type="button" className="ad-del" onClick={() => deleteOrder(o._id)}>
                  <FaTrash size={13} /> Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}