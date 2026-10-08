import { Link } from "react-router-dom";

export default function PaymentCancelled() {
  return (
    <div className="page center">
              <img src="/logo.jpg" alt="The Moss Jar logo" className="form-logo" />
      <h1>Payment cancelled</h1>
      <p>No money was taken. Your order is saved, and you can pay from My Orders.</p>
      <Link to="/my-orders" className="btn-link">Go to My Orders</Link>
    </div>
  );
}