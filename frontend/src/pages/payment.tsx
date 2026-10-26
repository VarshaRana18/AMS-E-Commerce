import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToast } from "@heroui/toast";
import { default as QRCodeComponent } from "react-qr-code";
const QRCode = QRCodeComponent as any;

const Payment = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData]: any = useState(null);
  const [showQr, setShowQr]: any = useState(false);
  const [paymentConfirmed]: any = useState(false);

  useEffect(() => {
    document.title = "AMS || Payment";
    // Get order data from session storage
    const pendingOrder = sessionStorage.getItem("pendingOrder");

    if (!pendingOrder) {
      addToast({
        title: "Error!",
        description: "No order found. Please start checkout again.",
        timeout: 2000,
        color: "danger",
      });
      navigate("/cart");

      return;
    }

    setOrderData(JSON.parse(pendingOrder));
  }, [navigate]);

  const upiId = "ranavarsha321@okhdfcbank";
  const payeeName = "AMS Computer Repairing and Services";
  const upiUrl = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${orderData?.total_price}&cu=INR&tn=Order Payment`;

  const handlePaymentConfirmation = async () => {
    try {
      // Call your original checkout API to finalize the order

      const response = await fetch(
        `/api/auth/checkout/${orderData.userEmail}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            components: orderData.components,
            total_price: orderData.total_price,
            address: orderData.address,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to place order");

      // Clear cart and session storage
      sessionStorage.removeItem("pendingOrder");

      addToast({
        title: "Success!",
        description:
          "We have received your payment request. We will place  your order once we verify your payment.",
        timeout: 3000,
        color: "success",
      });

      // Redirect to orders page
      navigate("/orders");
    } catch (error) {
      addToast({
        title: "Error!",
        description: "Failed to confirm payment. Please contact support.",
        timeout: 3000,
        color: "danger",
      });
    }
  };

  if (!orderData) return <div>Loading...</div>;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f4f4",
        textAlign: "center",
        padding: "20px",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
          display: "inline-block",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        <h2 style={{ color: "#333" }}>Complete Your Payment</h2>
        <p style={{ fontSize: "18px", fontWeight: "bold", color: "#0070f3" }}>
          Amount: ₹{orderData.total_price}
        </p>

        {!showQr ? (
          <button
            style={{
              background: "#0070f3",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
              margin: "10px 0",
              width: "100%",
            }}
            onClick={() => setShowQr(true)}
          >
            Pay via UPI
          </button>
        ) : paymentConfirmed ? (
          <div style={{ color: "green", fontWeight: "bold", padding: "20px" }}>
            ✅ Payment received! Redirecting...
          </div>
        ) : (
          <div style={{ marginTop: "20px" }}>
            <p>Scan this QR code with any UPI app:</p>
            <div
              style={{
                padding: "10px",
                display: "inline-block",
                border: "1px solid #ddd",
                borderRadius: "5px",
              }}
            >
              <QRCode
                bgColor="#ffffff"
                fgColor="#000000"
                size={200}
                value={upiUrl}
              />
            </div>
            <p>
              Or{" "}
              <a href={upiUrl} style={{ color: "#0070f3" }}>
                click here
              </a>{" "}
              to pay directly
            </p>

            <button
              style={{
                background: "#4CAF50",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
                margin: "20px 0 10px",
                width: "100%",
              }}
              onClick={handlePaymentConfirmation}
            >
              I have made the payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
