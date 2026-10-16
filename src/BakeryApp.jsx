import React, { useState, useEffect } from "react";
import axios from "axios";
import { Keyboard } from "@capacitor/keyboard";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import bgImage from "../assets/bread-bg1.jpg";
import logo from "../assets/logo.png";
import motto from "../assets/motto.png";
import orderBg from "../assets/order-bg.jpg";

// === Input & button styles ===
const styles = {
  input: {
    width: 280,
    padding: "12px 16px",
    marginBottom: "16px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    fontSize: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    color: "#fff",
    backdropFilter: "blur(4px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    outline: "none",
  },
  button: {
    width: 280,
    padding: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    color: "#000",
    fontWeight: "bold",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "16px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    transition: "all 0.2s ease-in-out",
  },
};

export default function BakeryApp() {
  const API = "https://breadski-backend.onrender.com";

  // === App State ===
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [client, setClient] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [products, setProducts] = useState([]);
  const [latestMessage, setLatestMessage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [orderType, setOrderType] = useState("full");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // === Adjust Resize Mode for Keyboard ===
  useEffect(() => {
    Keyboard.setResizeMode({ mode: 'body' });
  }, []);

  // === Handle Login ===
  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/login`, { login, password });
      const clientData = { ...res.data, login: login.toUpperCase() };
      setClient(clientData);
      const msgRes = await axios.get(`${API}/messages/latest/${clientData.login}`);
      setLatestMessage(msgRes.data);
    } catch (err) {
      alert("Invalid login or password");
    } finally {
      setLoading(false);
    }
  };

  // === Handle Password Change ===
  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword) {
      alert("Please fill in both fields");
      return;
    }
    try {
      const res = await axios.put(`${API}/change-password`, {
        login: client.login,
        oldPassword,
        newPassword,
      });
      if (res.status === 200) {
        alert("Password changed successfully");
        setShowPasswordForm(false);
        setOldPassword("");
        setNewPassword("");
      }
    } catch (err) {
      alert("Password change failed: " + (err.response?.data?.error || err.message));
    }
  };

  // === Handle Logout ===
  const handleLogout = () => {
    setClient(null);
    setLogin("");
    setPassword("");
    setProducts([]);
    setLatestMessage(null);
    setSelectedDate(null);
    setQuantities({});
    setOrderType("full");
    setMessage("");
  };

  // === Load Products Based on Date ===
  const loadProductsForDate = async (date) => {
    if (!client || !date) return;
    const day = date.toLocaleDateString("en-IE", { weekday: "long" });
    try {
      const res = await axios.post(`${API}/products-client`, {
        login: client.login,
        day,
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts([]);
    }
  };

  // === Update Quantity ===
  const handleQuantityChange = (name, v) => {
    const value = String(v);

    // Empty field means no product ordered
    if (value === "") {
      setQuantities((q) => ({ ...q, [name]: 0 }));
      return;
    }

    // Allow only 1-3 digits
    if (!/^\d{1,3}$/.test(value)) {
      return;
    }

    const qty = Number(value);

    if (qty < 0 || qty > 999) {
      return;
    }

    setQuantities((q) => ({ ...q, [name]: qty }));
  };

  // === Validate Delivery Date ===
  const isValidDate = (date) => {
    if (!client) return false;
    const now = new Date();
    const day = date.toLocaleDateString("en-IE", { weekday: "long" });
    const diff = (date - now) / (1000 * 60 * 60 * 24);
    const ok = diff >= 2 || (diff >= 1 && now.getHours() < 19);
    return Array.isArray(client.delivery_days) && client.delivery_days.includes(day) && ok;
  };

  // === Submit Order ===
  const handleSend = async () => {
    if (!selectedDate) {
      alert("No delivery date selected!");
      return;
    }
    setLoading(true);
    const payload = {
      login: client.login,
      deliveryDate: selectedDate.toISOString().split("T")[0],
      orderType,
      note: message,
      items: Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([name, qty]) => ({ name, qty })),
    };
    try {
      const res = await axios.post(`${API}/send`, payload);
      if (res.status === 200) {
        alert("Order sent!");
        setSelectedDate(null);
        setQuantities({});
        setOrderType("full");
        setMessage("");
        setProducts([]);
      } else {
        alert("Server error: " + res.status);
      }
    } catch (err) {
      alert("Failed to send order:\n" + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // === Render Login Screen ===
  if (!client) {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        fontFamily: "Arial",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="spinner" />
            <p style={{ color: "white", marginTop: 20 }}>Logging in...</p>
          </div>
        ) : (
          <>
            <div style={{ position: "absolute", top: 100, width: "100%", display: "flex", justifyContent: "center", paddingTop: 30 }}>
              <img src={logo} alt="logo" style={{ maxWidth: "70%", height: "auto" }} />
            </div>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <input type="text" placeholder="Login" value={login} onChange={(e) => setLogin(e.target.value)} style={styles.input} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
              <button onClick={handleLogin} style={styles.button}>Log in</button>
            </div>
            <div style={{ position: "absolute", bottom: 100, width: "100%", display: "flex", justifyContent: "center", paddingBottom: 20 }}>
              <img src={motto} alt="motto" style={{ maxWidth: "60%", height: "auto" }} />
            </div>
          </>
        )}
      </div>
    );
  }

  // === Group Products by Category ===
  const grouped = products.reduce((acc, { category, name }) => {
    acc[category] = acc[category] || [];
    acc[category].push(name);
    return acc;
  }, {});

  // === Main UI ===
  return (
    <div style={{ position: "relative", minHeight: "100dvh", paddingBottom: "300px", overflowY: "auto", WebkitOverflowScrolling: "touch", scrollBehavior: "smooth", fontFamily: "Arial" }}>
      <img src={orderBg} alt="Order background" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.3, zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, padding: 40 }}>
        <h2>Welcome, {client.name}!</h2>

        {/* Message Section */}
        {latestMessage && (
          <div style={{ background: "#fffae6", padding: "10px 15px", border: "1px solid #ffe58f", borderRadius: 4, marginBottom: 20 }}>
            <strong>Messages from Breadski:</strong>
            <p style={{ margin: "5px 0" }}>{latestMessage.content}</p>
            <small>{new Date(latestMessage.created_at).toLocaleString("en-IE", { dateStyle: "short", timeStyle: "short" })}</small>
          </div>
        )}

        {/* Delivery Date Picker */}
        <h3>Select delivery date</h3>
        <DatePicker selected={selectedDate} onChange={(date) => { setSelectedDate(date); loadProductsForDate(date); }} filterDate={isValidDate} minDate={new Date()} placeholderText="Choose a date" dateFormat="dd/MM/yyyy" />

        {/* Order Type Radio Buttons */}
        <h3>Order type</h3>
        <label><input type="radio" name="orderType" value="full" checked={orderType === "full"} onChange={() => setOrderType("full")} /> Full</label>
        <br />
        <label><input type="radio" name="orderType" value="supplementary" checked={orderType === "supplementary"} onChange={() => setOrderType("supplementary")} /> Additional</label>

        {/* Product Inputs */}
        <h3>Products</h3>
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 20 }}>
            <h4 style={{ textTransform: "capitalize", fontWeight: "bold", fontSize: 18 }}>{cat}</h4>
            {items.map((name) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ flex: 1 }}>{name}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={3}
                  value={quantities[name] || ""}
                  onChange={(e) => handleQuantityChange(name, e.target.value)}
                  style={{ width: 60, textAlign: "right" }}
                />
              </div>
            ))}
          </div>
        ))}

        {/* Message Input */}
        <h3>Your message</h3>
        <textarea rows={3} maxLength={256} style={{ width: "100%", marginBottom: 20 }} value={message} onChange={(e) => setMessage(e.target.value)} />

        {/* Action Buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
          <button onClick={handleSend} disabled={loading} style={{ flex: 1, padding: "10px 20px", fontWeight: "bold", background: "#007bff", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>{loading ? "Sending..." : "Send Order"}</button>
          <button onClick={handleLogout} style={{ flex: 1, padding: "10px 20px", fontWeight: "bold", background: "#dc3545", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>Log out</button>
          <button onClick={() => setShowPasswordForm(true)} style={{ flex: 1, padding: "10px 20px", fontWeight: "bold", background: "#ffc107", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>Change Password</button>
        </div>

        {/* Change Password Form */}
        {showPasswordForm && (
          <div style={{ marginTop: 20 }}>
            <input type="password" placeholder="Old password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} style={{ ...styles.input, width: "100%" }} />
            <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ ...styles.input, width: "100%" }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handlePasswordChange} style={{ ...styles.button, backgroundColor: "#28a745", color: "#fff" }}>Submit</button>
              <button onClick={() => { setShowPasswordForm(false); setOldPassword(""); setNewPassword(""); }} style={{ ...styles.button, backgroundColor: "#6c757d", color: "#fff" }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
