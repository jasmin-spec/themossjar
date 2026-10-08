import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId) return setStatus("error");

    // Ask our backend to confirm with Stripe
    api
      .post("/payments/verify", { sessionId })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="page center">
              <img src="/logo.jpg" alt="The Moss Jar logo" className="form-logo" />
      {status === "checking" && <h2>Confirming your payment...</h2>}
      {status === "success" && (
        <>
          <h1>🎉 Payment successful!</h1>
          <p>Thank you. Your terrarium order has been placed.</p>
          <Link to="/my-orders" className="btn-link">View My Orders</Link>
        </>
      )}
      {status === "error" && (
        <>
          <h2>We could not confirm your payment</h2>
          <p>If money was taken, check My Orders in a minute.</p>
          <Link to="/my-orders" className="btn-link">View My Orders</Link>
        </>
      )}
    </div>
  );
}