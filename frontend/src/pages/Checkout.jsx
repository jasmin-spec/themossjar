import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
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
    <div className="page checkout">
      <h1>Checkout</h1>
      {error && <p className="error">{error}</p>}

      <div className="summary">
        <h3>Order summary</h3>
        <p><b>{product.name}</b> x {quantity}</p>

        {readyMade ? (
          <p>
            Ready-made terrarium (as shown in photo)
            {customisation.message && <><br />Message: {customisation.message}</>}
          </p>
        ) : (
          <p>
            Size: {customisation.size} | Container: {customisation.container}
            <br />
            Plants: {list(customisation.plants)}
            <br />
            Theme: {customisation.theme}
            <br />
            Miniatures: {list(customisation.miniatures)}
            <br />
            Sculptures: {list(customisation.sculptures)}
            {customisation.message && <><br />Message: {customisation.message}</>}
          </p>
        )}

        <p>Items: AED {itemsPrice}</p>
        <p>Delivery: AED {deliveryFee}</p>
        <p className="price big">Total: AED {total}</p>
      </div>

      <div className="summary">
        <h3>Delivery mode</h3>
        <label className="check">
          <input type="radio" checked={deliveryMode === "delivery"}
            onChange={() => setDeliveryMode("delivery")} />
          Home delivery (AED {deliveryFees.delivery})
        </label>
        <label className="check">
          <input type="radio" checked={deliveryMode === "pickup"}
            onChange={() => setDeliveryMode("pickup")} />
          Store pickup (free)
        </label>

        {deliveryMode === "delivery" && (
          <>
            <label>Delivery address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} />
          </>
        )}

        <label>Your WhatsApp number</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="summary">
        <h3>How ordering works</h3>
        <p className="note">
          1. Press <b>Place Order</b>. Your order is saved.<br />
          2. Next, send your order summary to us on <b>WhatsApp</b>.<br />
          3. We confirm with you, and you <b>pay on delivery or pickup</b>.
        </p>
      </div>

      <button onClick={handlePlaceOrder} disabled={loading}>
        {loading ? "Please wait..." : "Place Order"}
      </button>
    </div>
  );
}