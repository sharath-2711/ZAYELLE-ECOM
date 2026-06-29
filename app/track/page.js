"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ArrowLeft, Search, Package, Calendar, Tag, CheckCircle, Clock } from "lucide-react";

export default function TrackOrderPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone || phone.trim() === "") return;
    
    setIsLoading(true);
    setHasSearched(true);
    setError(null);
    setOrders([]);

    try {
      const q = query(
        collection(db, "orders"),
        where("customerPhone", "==", phone.trim())
      );
      
      const querySnapshot = await getDocs(q);
      const ordersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by newest first
      ordersList.sort((a,b) => {
         const tA = a.timestamp?.seconds || 0;
         const tB = b.timestamp?.seconds || 0;
         return tB - tA;
      });
      
      setOrders(ordersList);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return "Recently";
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-color)", color: "var(--text-primary)" }}>
      {/* Simple Header */}
      <header style={{ padding: "2rem", borderBottom: "1px solid var(--border-subtle)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--brand-dark)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px", width: "fit-content" }}>
          <ArrowLeft size={20} /> Back to Store
        </Link>
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 2rem" }}>
        
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h1 style={{ fontFamily: "var(--font-primary)", fontSize: "3.5rem", color: "var(--brand-dark)", marginBottom: "1rem" }}>Track Your Order</h1>
          <p style={{ fontFamily: "var(--font-sans)", color: "var(--text-secondary)", fontSize: "1.1rem" }}>
            Enter the phone number you used during checkout to view your order history and status.
          </p>
        </div>

        {/* Search Form */}
        <div style={{ backgroundColor: "var(--bg-surface)", padding: "3rem", borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)", marginBottom: "4rem" }}>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 300px" }}>
              <input 
                type="tel" 
                placeholder="Enter your Phone Number (e.g., 9876543210)" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "1.2rem",
                  borderRadius: "16px",
                  border: "2px solid var(--border-subtle)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "1.1rem",
                  backgroundColor: "rgba(255,255,255,0.7)",
                  outline: "none"
                }}
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                padding: "1.2rem 2.5rem",
                backgroundColor: "var(--brand-dark)",
                color: "#fff",
                border: "none",
                borderRadius: "16px",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "1px",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                opacity: isLoading ? 0.7 : 1,
                transition: "background 0.3s ease",
                flex: "0 1 auto"
              }}>
              <Search size={20} /> {isLoading ? "Searching..." : "Track"}
            </button>
          </form>
          {error && <p style={{ color: "red", marginTop: "1rem", textAlign: "center" }}>{error}</p>}
        </div>

        {/* Results */}
        {hasSearched && !isLoading && (
          <div>
            <h2 style={{ fontFamily: "var(--font-primary)", fontSize: "2rem", color: "var(--brand-dark)", marginBottom: "2rem" }}>
              Your Orders ({orders.length})
            </h2>

            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "var(--bg-surface)", borderRadius: "24px", color: "var(--text-secondary)" }}>
                <Package size={48} style={{ opacity: 0.2, marginBottom: "1rem" }} />
                <h3>No orders found.</h3>
                <p>We couldn't find any orders linked to {phone}.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {orders.map(order => (
                  <div key={order.id} style={{ 
                    backgroundColor: "var(--bg-surface)", 
                    padding: "2rem", 
                    borderRadius: "24px", 
                    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem"
                  }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                      <div>
                        <h3 style={{ fontFamily: "var(--font-primary)", fontSize: "1.5rem", color: "var(--brand-dark)", margin: 0, marginBottom: "0.5rem" }}>
                          {order.productName}
                        </h3>
                        <div style={{ display: "flex", gap: "1rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Calendar size={16} /> {formatDate(order.timestamp)}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Tag size={16} /> {order.productPrice} x {order.customerQuantity || 1}</span>
                        </div>
                      </div>
                      
                      {/* Status Pill */}
                      <div>
                        {order.status === "approved" ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#E8F5E9", color: "#2E7D32", padding: "0.6rem 1.2rem", borderRadius: "50px", fontSize: "0.9rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
                            <CheckCircle size={18} /> Confirmed
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#FFF3E0", color: "#E65100", padding: "0.6rem 1.2rem", borderRadius: "50px", fontSize: "0.9rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
                            <Clock size={18} /> Pending Review
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div style={{ padding: "1.5rem", background: "rgba(30,28,26,0.02)", borderRadius: "16px", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                        <div>
                          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.25rem" }}>Shipping To</p>
                          <p style={{ fontWeight: 500 }}>{order.customerName}</p>
                          <p style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>{order.customerAddress}</p>
                        </div>
                        {order.customerCustomization && (
                          <div>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.25rem" }}>Custom Request</p>
                            <p style={{ fontSize: "0.9rem", fontStyle: "italic" }}>"{order.customerCustomization}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
