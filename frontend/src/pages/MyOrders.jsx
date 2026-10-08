import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";

export default function MyOrders() {
  const { state } = useLocation();
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

  const payNow = async (orderId) => {
    try {
      const { data } = await api.post(`/payments/create-checkout-session/${orderId}`);
      window.location.href = data.url;
    } catch (err) {
      setError(err.response?.data?.message || "Could not start payment");
    }
  };

  return (
    <div className="page">
      <h1>My Orders</h1>
      {state?.placed && <p className="success">✅ Order placed successfully!</p>}
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && orders.length === 0 && <p>You have no orders yet.</p>}

      {orders.map((o) => (
        <div className="order" key={o._id}>
          <div className="order-head">
            <span>Order #{o._id.slice(-6)}</span>
            <span>{new Date(o.createdAt).toLocaleDateString()}</span>
          </div>

          {o.items.map((item) => (
            <div className="order-item" key={item._id}>
              <img src={item.image} alt={item.name} />
              <div>
                <b>{item.name}</b> × {item.quantity}
                <br />
                                <small>
                  {item.customisation.size}, {item.customisation.container}
                  {item.customisation.plants?.length > 0 && `, ${item.customisation.plants.join(", ")}`}
                  {item.customisation.theme && item.customisation.theme !== "none" && ` | Theme: ${item.customisation.theme}`}
                  {item.customisation.miniatures?.length > 0 && ` | Miniatures: ${item.customisation.miniatures.join(", ")}`}
                  {item.customisation.sculptures?.length > 0 && ` | Sculptures: ${item.customisation.sculptures.join(", ")}`}
                </small>
              </div>
            </div>
          ))}

          <p>
            {o.deliveryMode === "delivery" ? "🚚 Home delivery" : "🏪 Store pickup"} |{" "}
            {o.paymentMethod === "stripe" ? "Card" : "Cash on Delivery"}
          </p>
          <p>
            Status: <b>{o.orderStatus}</b> | Payment:{" "}
            <b className={o.paymentStatus === "paid" ? "paid" : "pending"}>{o.paymentStatus}</b>
          </p>
          <p className="price">Total: AED {o.totalPrice}</p>

          {o.paymentMethod === "stripe" &&
            o.paymentStatus === "pending" &&
            o.orderStatus !== "cancelled" && (
              <button onClick={() => payNow(o._id)}>Pay now</button>
            )}
        </div>
      ))}
    </div>
  );
}