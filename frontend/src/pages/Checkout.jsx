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
  const [paymentMethod, setPaymentMethod] = useState("stripe");
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
    setLoading(true);
    try {
      const { data: order } = await api.post("/orders", {
        items: [{ productId: product._id, quantity, customisation }],
        deliveryMode,
        deliveryAddress: address,
        phone,
        paymentMethod,
      });

      if (paymentMethod === "stripe") {
        const { data } = await api.post(`/payments/create-checkout-session/${order._id}`);
        window.location.href = data.url;
      } else {
        navigate("/my-orders", { state: { placed: true } });
      }
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
        <p><b>{product.name}</b> × {quantity}</p>

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

        <label>Phone number</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="summary">
        <h3>Payment method</h3>
        <label className="check">
          <input type="radio" checked={paymentMethod === "stripe"}
            onChange={() => setPaymentMethod("stripe")} />
          Pay now by card (Stripe)
        </label>
        <label className="check">
          <input type="radio" checked={paymentMethod === "cod"}
            onChange={() => setPaymentMethod("cod")} />
          Cash on Delivery
        </label>
      </div>

      <button onClick={handlePlaceOrder} disabled={loading}>
        {loading ? "Please wait..." : paymentMethod === "stripe" ? "Place Order & Pay" : "Place Order"}
      </button>
    </div>
  );
}