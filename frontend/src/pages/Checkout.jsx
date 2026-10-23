import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { FaTruck, FaStore, FaWhatsapp } from "react-icons/fa";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Checkout() {
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryMode, setDeliveryMode] = useState("delivery");
  const [address, setAddress] = useState(user?.address || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!state) return <Navigate to="/" />;

  const { product, customisation, quantity, unitPrice, deliveryFees } = state;
  const itemsPrice = unitPrice * quantity;
  const deliveryFee = deliveryFees[deliveryMode];
  const total = itemsPrice + deliveryFee;
  const readyMade = customisation.size === "ready-made";
  const list = (arr) => (arr && arr.length ? arr.join(", ") : "none");

  const details = readyMade
    ? [["Type", "Ready-made (as shown in photo)"]]
    : [
        ["Size", customisation.size],
        ["Container", customisation.container],
        ["Plants", list(customisation.plants)],
        ["Theme", customisation.theme === "none" ? "none" : customisation.theme],
        ["Miniatures", list(customisation.miniatures)],
        ["Sculptures", list(customisation.sculptures)],
      ];
  if (customisation.message) details.push(["Gift message", customisation.message]);

  const handlePlaceOrder = async () => {
    setError("");
    if (!phone.trim()) return setError("Please enter your WhatsApp number");
    if (deliveryMode === "delivery" && !address.trim()) {
      return setError("Please enter your delivery address");
    }

    setLoading(true);
    try {
      const { data: order } = await api.post("/orders", {
        items: [{ productId: product._id, quantity, customisation }],
        deliveryMode,
        deliveryAddress: address,
        phone,
      });
      navigate(`/order-placed/${order._id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="page co">
      <h1>Checkout</h1>

      <ol className="co-steps">
        <li className="done"><span>1</span> Choose</li>
        <li className="now"><span>2</span> Details</li>
        <li><span>3</span> Confirm on WhatsApp</li>
      </ol>

      {error && <p className="error">{error}</p>}

      <div className="co-grid">
        {/* LEFT */}
        <div className="co-main">
          <section className="co-card">
            <h3>Delivery method</h3>
            <div className="co-options">
              <button
                type="button"
                className={deliveryMode === "delivery" ? "co-option on" : "co-option"}
                onClick={() => setDeliveryMode("delivery")}
              >
                <FaTruck size={22} />
                <b>Home delivery</b>
                <small>AED {deliveryFees.delivery}</small>
              </button>
              <button
                type="button"
                className={deliveryMode === "pickup" ? "co-option on" : "co-option"}
                onClick={() => setDeliveryMode("pickup")}
              >
                <FaStore size={22} />
                <b>Store pickup</b>
                <small>Free</small>
              </button>
            </div>
          </section>

          <section className="co-card">
            <h3>Your details</h3>
            <div className="co-field">
              <label>Your WhatsApp number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            {deliveryMode === "delivery" && (
              <div className="co-field">
                <label>Delivery address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            )}
            {deliveryMode === "pickup" && (
              <p className="co-hint">We will tell you the pickup time on WhatsApp.</p>
            )}
          </section>

          <section className="co-card">
            <h3>How ordering works</h3>
            <ol className="co-how">
              <li><span>1</span><div><b>Place your order</b><br />It is saved straight away.</div></li>
              <li><span>2</span><div><b>Send it on WhatsApp</b><br />Your order summary is typed for you. Just press send.</div></li>
              <li><span>3</span><div><b>Pay on delivery or pickup</b><br />We confirm everything with you first.</div></li>
            </ol>
          </section>
        </div>

        {/* RIGHT: sticky summary */}
        <aside className="co-summary">
          <h3>Order summary</h3>

          <div className="co-item">
            <img
              src={product.image?.url || "https://placehold.co/120x120?text=No+Image"}
              alt={product.name}
            />
            <div>
              <b>{product.name}</b>
              <div className="co-qty">Quantity: {quantity}</div>
            </div>
          </div>

          <dl className="co-details">
            {details.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <div className="co-row"><span>Items</span><span>AED {itemsPrice}</span></div>
          <div className="co-row"><span>Delivery</span><span>AED {deliveryFee}</span></div>
          <div className="co-total"><span>Total</span><span>AED {total}</span></div>

          <button className="co-place" onClick={handlePlaceOrder} disabled={loading}>
            <FaWhatsapp size={18} /> {loading ? "Please wait..." : "Place Order"}
          </button>
          <p className="co-fine">Pay on delivery or pickup. No card needed.</p>
        </aside>
      </div>
    </div>
  );
}