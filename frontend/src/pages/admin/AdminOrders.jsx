import { useEffect, useState } from "react";
import api from "../../api";

const STATUSES = [
  "placed", "preparing", "out for delivery",
  "ready for pickup", "delivered", "cancelled",
];

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
      load(); // reload so payment status updates too (COD becomes paid when delivered)
    } catch (err) {
      setError(err.response?.data?.message || "Could not update status");
    }
  };

  const paidTotal = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div>
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}

      <div className="stats">
        <div><b>{orders.length}</b><span>Total orders</span></div>
        <div><b>AED {paidTotal}</b><span>Paid revenue</span></div>
        <div>
          <b>{orders.filter((o) => o.paymentStatus === "pending").length}</b>
          <span>Payment pending</span>
        </div>
      </div>

      {orders.map((o) => (
        <div className="order" key={o._id}>
          <div className="order-head">
            <span>Order #{o._id.slice(-6)}</span>
            <span>{new Date(o.createdAt).toLocaleString()}</span>
          </div>

          <p>
            <b>Customer:</b> {o.user?.name || "Deleted user"} | {o.user?.email}
            <br />
            <b>Phone:</b> {o.phone} | <b>Address:</b> {o.deliveryAddress}
          </p>

          {o.items.map((item) => (
            <div className="order-item" key={item._id}>
              <img src={item.image} alt={item.name} />
              <div>
                <b>{item.name}</b> × {item.quantity} (AED {item.price} each)
                <br />
                                <small>
                  {item.customisation.size}, {item.customisation.container}
                  {item.customisation.plants?.length > 0 && `, ${item.customisation.plants.join(", ")}`}
                  {item.customisation.theme && item.customisation.theme !== "none" && ` | Theme: ${item.customisation.theme}`}
                  {item.customisation.miniatures?.length > 0 && ` | Miniatures: ${item.customisation.miniatures.join(", ")}`}
                  {item.customisation.sculptures?.length > 0 && ` | Sculptures: ${item.customisation.sculptures.join(", ")}`}
                  {item.customisation.message && ` | Message: "${item.customisation.message}"`}
                </small>
              </div>
            </div>
          ))}

          <p>
            {o.deliveryMode === "delivery" ? "🚚 Home delivery" : "🏪 Store pickup"} |{" "}
            {o.paymentMethod === "stripe" ? "💳 Card (Stripe)" : "💵 Cash on Delivery"} |{" "}
            Payment:{" "}
            <b className={o.paymentStatus === "paid" ? "paid" : "pending"}>{o.paymentStatus}</b>
          </p>
          <p className="price">Total: AED {o.totalPrice}</p>

          <label>
            Order status:{" "}
            <select value={o.orderStatus} onChange={(e) => changeStatus(o._id, e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
      ))}
    </div>
  );
}