"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from "firebase/firestore";
import { Plus, Edit2, Trash2, LogOut, Settings, Package, Home, ShoppingBag, Check } from "lucide-react";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const [activeTab, setActiveTab] = useState("orders"); // default to orders
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Settings State
  const [settings, setSettings] = useState({
    siteName: "ZAYELLE",
    heroTitle: "Handmade Gifts.",
    heroSubtitle: "Discover our exclusive collection of handmade gifts.",
    marqueeText: "HANDMADE WITH LOVE ✦ PREMIUM CUSTOM GIFTS ✦ PAN INDIA DELIVERY ✦ BEAUTIFUL CURATIONS ✦",
    instagramLink: "https://www.instagram.com/direct/t/18102416863828766/"
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  // Product Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    shortDesc: "",
    description: "",
    features: "",
    category: "classics", // default category
    image: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchProducts();
        fetchOrders();
        fetchSettings();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError("");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      const ordersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      ordersList.sort((a,b) => {
         const tA = a.timestamp?.seconds || 0;
         const tB = b.timestamp?.seconds || 0;
         return tB - tA; // Newest first
      });
      
      setOrders(ordersList);
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, "settings", "global_config");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    } catch (err) {
      console.error("Error fetching settings", err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "global_config"), settings);
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Error saving settings", err);
      alert("Error saving settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const approveOrder = async (orderId) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "approved"
      });
      fetchOrders(); // Refresh
    } catch (err) {
      console.error("Error approving order", err);
      alert("Error approving order");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSettingsChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }
      const featuresArray = formData.features.split(',').map(item => item.trim());
      const productData = {
        ...formData,
        image: imageUrl,
        features: featuresArray,
        gallery: [imageUrl]
      };
      if (isEditing) {
        await updateDoc(doc(db, "products", currentProductId), productData);
      } else {
        if (products.length >= 20) {
          alert("Maximum 20 products allowed in demo.");
          return;
        }
        await addDoc(collection(db, "products"), productData);
      }
      setFormData({ name: "", price: "", shortDesc: "", description: "", features: "", category: "classics", image: "" });
      setImageFile(null);
      setIsEditing(false);
      setCurrentProductId(null);
      fetchProducts();
    } catch (err) {
      console.error("Error saving product", err);
      alert("Error saving product: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const editProduct = (product) => {
    setIsEditing(true);
    setCurrentProductId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      shortDesc: product.shortDesc,
      description: product.description,
      features: product.features ? product.features.join(", ") : "",
      category: product.category || "classics",
      image: product.image
    });
    setImageFile(null);
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteDoc(doc(db, "products", id));
      fetchProducts();
    }
  };

  const deleteOrder = async (id) => {
    if (window.confirm("Are you sure you want to delete this order request?")) {
      await deleteDoc(doc(db, "orders", id));
      fetchOrders();
    }
  };

  if (!user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "var(--bg-color)" }}>
        <div style={{ backgroundColor: "var(--bg-surface)", padding: "4rem", borderRadius: "30px", boxShadow: "0 25px 50px rgba(0,0,0,0.1)", width: "100%", maxWidth: "450px", textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-primary)", color: "var(--brand-dark)", fontSize: "2.5rem", marginBottom: "2rem", textTransform: "uppercase", letterSpacing: "2px" }}>Zayelle Admin</h1>
          {error && <div style={{ color: "red", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</div>}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required 
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required 
            />
            <button type="submit" style={btnPrimaryStyle}>
              Secure Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-color)", color: "var(--text-primary)" }}>
      {/* Sidebar - Dark Theme */}
      <aside style={{ width: "280px", backgroundColor: "var(--brand-dark)", color: "var(--text-light)", padding: "3rem 1.5rem", display: "flex", flexDirection: "column", boxShadow: "10px 0 30px rgba(0,0,0,0.1)", zIndex: 10 }}>
        <div style={{ fontFamily: "var(--font-primary)", color: "var(--text-light)", fontSize: "2rem", marginBottom: "4rem", textAlign: "center", letterSpacing: "2px" }}>ZAYELLE</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flexGrow: 1 }}>
          <button onClick={() => setActiveTab("orders")} style={{ ...sidebarBtnStyle, backgroundColor: activeTab === "orders" ? "rgba(255,255,255,0.1)" : "transparent", color: activeTab === "orders" ? "var(--brand-sand)" : "var(--text-light)" }}>
            <ShoppingBag size={18} /> Order Requests
            {orders.filter(o => o.status !== 'approved').length > 0 && (
              <span style={{ marginLeft: "auto", background: "var(--brand-sand)", color: "var(--brand-dark)", padding: "2px 8px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold" }}>
                {orders.filter(o => o.status !== 'approved').length}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab("products")} style={{ ...sidebarBtnStyle, backgroundColor: activeTab === "products" ? "rgba(255,255,255,0.1)" : "transparent", color: activeTab === "products" ? "var(--brand-sand)" : "var(--text-light)" }}>
            <Package size={18} /> Products ({products.length}/10)
          </button>
          <button onClick={() => setActiveTab("settings")} style={{ ...sidebarBtnStyle, backgroundColor: activeTab === "settings" ? "rgba(255,255,255,0.1)" : "transparent", color: activeTab === "settings" ? "var(--brand-sand)" : "var(--text-light)" }}>
            <Settings size={18} /> Settings
          </button>
        </nav>
        <button onClick={handleLogout} style={{ ...sidebarBtnStyle, color: "#ff8a80", marginTop: "auto" }}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: "4rem", overflowY: "auto", backgroundColor: "var(--bg-color)" }}>
        
        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
              <h2 style={{ fontFamily: "var(--font-primary)", fontSize: "2.5rem", color: "var(--brand-dark)", letterSpacing: "1px" }}>Order Requests</h2>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {orders.length === 0 ? (
                 <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "var(--bg-surface)", borderRadius: "20px", color: "var(--text-secondary)" }}>
                   No order requests yet.
                 </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} style={{ display: "flex", gap: "2rem", backgroundColor: "var(--bg-surface)", padding: "2rem", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                     <div style={{ flex: 1 }}>
                       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                         <h3 style={{ fontFamily: "var(--font-primary)", fontSize: "1.5rem", color: "var(--brand-dark)", margin: 0 }}>{order.customerName}</h3>
                         {order.status === "approved" ? (
                           <span style={{ background: "#E8F5E9", color: "#2E7D32", padding: "0.4rem 1rem", borderRadius: "50px", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Approved</span>
                         ) : (
                           <span style={{ background: "#FFF3E0", color: "#E65100", padding: "0.4rem 1rem", borderRadius: "50px", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Pending</span>
                         )}
                       </div>
                       
                       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
                         <div><strong>IG:</strong> {order.customerIg}</div>
                         <div><strong>Phone:</strong> {order.customerPhone}</div>
                         <div style={{ gridColumn: "span 2" }}><strong>Address:</strong> {order.customerAddress}</div>
                       </div>
                       
                       <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(30,28,26,0.03)", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                           <strong style={{ color: "var(--brand-dark)" }}>{order.productName}</strong>
                           <span style={{ color: "var(--brand-brown)", fontWeight: 600 }}>{order.productPrice}</span>
                         </div>
                         <div>Quantity: <strong>{order.customerQuantity || 1}</strong></div>
                         {order.customerCustomization && (
                           <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}><strong>Note:</strong> {order.customerCustomization}</div>
                         )}
                       </div>
                     </div>
                     
                     <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", justifyContent: "center" }}>
                        {order.status !== "approved" && (
                          <button onClick={() => approveOrder(order.id)} style={{ ...btnPrimaryStyle, padding: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", backgroundColor: "var(--brand-dark)" }}>
                            <Check size={18} /> Approve
                          </button>
                        )}
                        <button onClick={() => deleteOrder(order.id)} style={{ ...btnSecondaryStyle, padding: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#e74c3c" }}>
                          <Trash2 size={18} /> Delete
                        </button>
                     </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
              <h2 style={{ fontFamily: "var(--font-primary)", fontSize: "2.5rem", color: "var(--brand-dark)", letterSpacing: "1px" }}>Manage Products</h2>
              <div style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                {products.length} Products Active
              </div>
            </div>

            <div style={{ display: "flex", gap: "3rem", alignItems: "flex-start" }}>
              {/* Product Form */}
              <div style={{ flex: "1 1 400px", backgroundColor: "var(--bg-surface)", padding: "2.5rem", borderRadius: "30px", boxShadow: "0 15px 35px rgba(0,0,0,0.05)" }}>
                <h3 style={{ marginBottom: "2rem", fontFamily: "var(--font-primary)", fontSize: "1.8rem", color: "var(--brand-dark)" }}>{isEditing ? "Edit Product" : "Add New Product"}</h3>
                <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Product Name" required style={inputStyle} />
                  <input type="text" name="price" value={formData.price} onChange={handleInputChange} placeholder="Starting Price (e.g., ₹3,499)" required style={inputStyle} />
                  <select name="category" value={formData.category} onChange={handleInputChange} style={inputStyle} required>
                    <option value="classics">The Classics</option>
                    <option value="exclusives">The Exclusives</option>
                  </select>
                  <input type="text" name="shortDesc" value={formData.shortDesc} onChange={handleInputChange} placeholder="Short Description" required style={inputStyle} />
                  <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Full Description" rows="4" required style={{...inputStyle, resize: "vertical"}}></textarea>
                  <input type="text" name="features" value={formData.features} onChange={handleInputChange} placeholder="Features (comma separated)" required style={inputStyle} />
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "500", textTransform: "uppercase", letterSpacing: "1px" }}>Product Image</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setImageFile(e.target.files[0])} 
                      style={inputStyle} 
                      required={!isEditing && !formData.image} 
                    />
                    {formData.image && !imageFile && (
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Current image URL saved. Upload a new file to replace it.</div>
                    )}
                  </div>
                  
                  <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button type="submit" disabled={isUploading} style={{...btnPrimaryStyle, flex: 1, opacity: isUploading ? 0.7 : 1}}>
                      {isUploading ? "Uploading..." : (isEditing ? "Update Product" : "Publish Product")}
                    </button>
                    {isEditing && (
                      <button type="button" onClick={() => {setIsEditing(false); setFormData({name:"", price:"", shortDesc:"", description:"", features:"", image:""}); setImageFile(null);}} style={btnSecondaryStyle}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Product List */}
              <div style={{ flex: "2 1 500px" }}>
                <div style={{ display: "grid", gap: "1.5rem" }}>
                  {products.map(product => (
                    <div key={product.id} style={{ display: "flex", alignItems: "center", gap: "1.5rem", backgroundColor: "var(--bg-surface)", padding: "1.5rem", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                      <img src={product.image} alt={product.name} style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "16px" }} />
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                          <h4 style={{ fontFamily: "var(--font-primary)", fontSize: "1.3rem", color: "var(--brand-dark)", margin: 0 }}>{product.name}</h4>
                          <span style={{ fontSize: "0.65rem", padding: "0.2rem 0.5rem", borderRadius: "10px", background: product.category === 'exclusives' ? "var(--brand-dark)" : "var(--brand-sand)", color: product.category === 'exclusives' ? "#fff" : "var(--brand-dark)", textTransform: "uppercase", fontWeight: "bold" }}>
                            {product.category || 'classics'}
                          </span>
                        </div>
                        <div style={{ color: "var(--brand-brown)", fontWeight: "600", fontSize: "1rem" }}>{product.price}</div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => editProduct(product)} style={iconBtnStyle}><Edit2 size={20} color="var(--brand-dark)" /></button>
                        <button onClick={() => deleteProduct(product.id)} style={iconBtnStyle}><Trash2 size={20} color="#e74c3c" /></button>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)", backgroundColor: "var(--bg-surface)", borderRadius: "30px" }}>
                      No products found. Add your first product!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div style={{ backgroundColor: "var(--bg-surface)", padding: "4rem", borderRadius: "30px", boxShadow: "0 15px 35px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontFamily: "var(--font-primary)", fontSize: "2.5rem", color: "var(--brand-dark)", letterSpacing: "1px", marginBottom: "1rem" }}>Website Settings</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "3rem" }}>Manage your public website content and links here. Changes are applied instantly.</p>
            
            <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "600px" }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "500", textTransform: "uppercase", letterSpacing: "1px" }}>Site Name (Logo)</label>
                <input type="text" name="siteName" value={settings.siteName} onChange={handleSettingsChange} style={inputStyle} required />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "500", textTransform: "uppercase", letterSpacing: "1px" }}>Hero Title</label>
                <input type="text" name="heroTitle" value={settings.heroTitle} onChange={handleSettingsChange} style={inputStyle} required />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "500", textTransform: "uppercase", letterSpacing: "1px" }}>Hero Subtitle</label>
                <textarea name="heroSubtitle" value={settings.heroSubtitle} onChange={handleSettingsChange} rows="2" style={{...inputStyle, resize: "vertical"}} required></textarea>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "500", textTransform: "uppercase", letterSpacing: "1px" }}>Marquee Text</label>
                <input type="text" name="marqueeText" value={settings.marqueeText} onChange={handleSettingsChange} style={inputStyle} required />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "500", textTransform: "uppercase", letterSpacing: "1px" }}>Instagram Link</label>
                <input type="url" name="instagramLink" value={settings.instagramLink} onChange={handleSettingsChange} style={inputStyle} required />
              </div>

              <button type="submit" disabled={isSavingSettings} style={{...btnPrimaryStyle, marginTop: "1rem", opacity: isSavingSettings ? 0.7 : 1}}>
                {isSavingSettings ? "Saving Settings..." : "Save Settings"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

const sidebarBtnStyle = {
  display: "flex", 
  alignItems: "center", 
  gap: "1rem", 
  padding: "1.2rem", 
  border: "none", 
  borderRadius: "16px", 
  cursor: "pointer", 
  fontFamily: "var(--font-sans)",
  fontSize: "1rem",
  fontWeight: "500", 
  textAlign: "left", 
  transition: "all 0.3s ease",
  textTransform: "uppercase",
  letterSpacing: "1px"
};

const inputStyle = {
  padding: "1.2rem",
  borderRadius: "16px",
  border: "1px solid var(--border-subtle)",
  fontFamily: "var(--font-sans)",
  fontSize: "1rem",
  backgroundColor: "rgba(255,255,255,0.7)"
};

const btnPrimaryStyle = {
  padding: "1.2rem 2rem",
  backgroundColor: "var(--brand-dark)",
  color: "#fff",
  border: "none",
  borderRadius: "16px",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "1px",
  transition: "background 0.3s ease"
};

const btnSecondaryStyle = {
  padding: "1.2rem 2rem",
  backgroundColor: "transparent",
  color: "var(--brand-dark)",
  border: "1px solid var(--brand-dark)",
  borderRadius: "16px",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "1px",
  transition: "background 0.3s ease"
};

const iconBtnStyle = {
  background: "rgba(30,28,26,0.05)",
  border: "none",
  cursor: "pointer",
  padding: "0.8rem",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "transform 0.2s"
};
