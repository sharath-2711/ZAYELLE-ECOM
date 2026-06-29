"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Lenis from "lenis";
import { Sparkles, Target, ClipboardList, Package, ArrowRight, ArrowUpRight, Star, Heart, Leaf, X, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, doc, getDoc } from "firebase/firestore";

// --- High-End Animation Variants ---
const revealUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const StaggeredText = ({ text, className, style, delay = 0 }) => {
  const words = text.split(" ");
  return (
    <div style={{ display: "inline-block", ...style }} className={className}>
      {words.map((word, idx) => (
        <span key={idx} style={{ display: "inline-block", overflow: "hidden", paddingRight: "0.25em", paddingBottom: "0.1em" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "100%", rotate: 5 }}
            whileInView={{ y: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: delay + (idx * 0.05) }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  );
};

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Cart Logic
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartOrders, setCartOrders] = useState([]);
  const [isFetchingCart, setIsFetchingCart] = useState(false);

  // Global Scroll Progress for Progress Bar
  const { scrollYProgress } = useScroll();

  // Form State for Orders
  const [customerName, setCustomerName] = useState("");
  const [customerIg, setCustomerIg] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerQuantity, setCustomerQuantity] = useState("1");
  const [customerCustomization, setCustomerCustomization] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [dbError, setDbError] = useState(null);

  // Global Settings State
  const [settings, setSettings] = useState({
    siteName: "ZAYELLE",
    heroTitle: "Handmade Gifts.",
    heroSubtitle: "Curating bespoke hampers, custom photo frames, and beautiful bouquets tailored to your vision.",
    marqueeText: "HANDMADE WITH LOVE ✦ PREMIUM CUSTOM GIFTS ✦ PAN INDIA DELIVERY ✦ BEAUTIFUL CURATIONS ✦",
    instagramLink: "https://www.instagram.com/direct/t/18102416863828766/"
  });

  // Custom Cursor
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    const handleMouseOver = (e) => {
      if (e.target.tagName?.toLowerCase() === 'button' || e.target.tagName?.toLowerCase() === 'a' || e.target.closest('button') || e.target.closest('a') || e.target.closest('.product-card')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };
    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  // Parallax Refs & Hooks
  const heroRef = useRef(null);
  const carouselRef = useRef(null);
  const isHoveringCarousel = useRef(false);
  const exclusivesRef = useRef(null);
  const isHoveringExclusives = useRef(false);

  // Auto-scrolling carousel effect for BOTH carousels
  useEffect(() => {
    let animationFrameId;
    const scroll = () => {
      // Scroll Classics
      if (carouselRef.current && !isHoveringCarousel.current) {
        carouselRef.current.scrollLeft += 0.5; // Auto-scroll speed
        // Reset if we hit the end
        if (carouselRef.current.scrollLeft + carouselRef.current.clientWidth >= carouselRef.current.scrollWidth - 1) {
          carouselRef.current.scrollLeft = 0;
        }
      }
      // Scroll Exclusives (maybe scroll it the other way? Let's just scroll it left)
      if (exclusivesRef.current && !isHoveringExclusives.current) {
        exclusivesRef.current.scrollLeft += 0.4; // Slightly different speed
        if (exclusivesRef.current.scrollLeft + exclusivesRef.current.clientWidth >= exclusivesRef.current.scrollWidth - 1) {
          exclusivesRef.current.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };
    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollExclusives = (direction) => {
    if (exclusivesRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      exclusivesRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  const { scrollYProgress: heroScrollY } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  // Parallax Transforms
  const yHeroText = useTransform(heroScrollY, [0, 1], [0, 300]);
  const yGiftBox1 = useTransform(heroScrollY, [0, 1], [0, -150]);
  const yGiftBox2 = useTransform(heroScrollY, [0, 1], [0, -50]);
  const yGiftBox3 = useTransform(heroScrollY, [0, 1], [0, 100]);
  const opacityHero = useTransform(heroScrollY, [0, 0.8], [1, 0]);
  
  // Text morphing Opacity
  const text1Opacity = useTransform(heroScrollY, [0, 0.5], [1, 0]);
  const text2Opacity = useTransform(heroScrollY, [0.3, 0.8], [0, 1]);

  // Init Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    setTimeout(() => setIsLoaded(true), 100);

    return () => lenis.destroy();
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Settings
        const settingsSnap = await getDoc(doc(db, "settings", "global_config"));
        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data());
        }

        // Fetch Products
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          category: "classics", // default for old data
          ...doc.data()
        }));
        
        // If empty, supply some dummies to match the layout request
        if (productsList.length === 0) {
           setProducts([
             { id: "4", name: "Premium Apparel Hamper", price: "₹8,999", image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=800", shortDesc: "The ultimate gift. Includes a T-shirt, wallet, wish card, chocolates, and flowers in a custom box." },
             { id: "5", name: "Ferrero Chocolate Bouquet", price: "₹3,999", image: "https://images.unsplash.com/photo-1512217730107-744383181ea6?q=80&w=800", shortDesc: "A stunning arrangement of Ferrero Rocher chocolates wrapped beautifully like a floral bouquet." },
             { id: "6", name: "Satin Ribbon Bouquet", price: "₹2,999", image: "https://images.unsplash.com/photo-1579624536968-36423c8a0026?q=80&w=800", shortDesc: "Everlasting roses made completely from high-quality satin ribbons. A gift that never fades." }
           ]);
        } else {
           setProducts(productsList);
        }
      } catch (err) {
        console.error("Error fetching products", err);
      }
    };
    fetchData();
  }, []);

  // Fetch Cart Orders when Cart Opens
  useEffect(() => {
    if (isCartOpen) {
      const fetchCart = async () => {
        setIsFetchingCart(true);
        try {
          const storedIds = JSON.parse(localStorage.getItem("zayelle_orders") || "[]");
          if (storedIds.length === 0) {
            setCartOrders([]);
            setIsFetchingCart(false);
            return;
          }
          
          const orderPromises = storedIds.map(id => getDoc(doc(db, "orders", id)));
          const orderDocs = await Promise.all(orderPromises);
          
          const fetchedOrders = orderDocs
            .filter(docSnap => docSnap.exists())
            .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
            
          // Clean up local storage if some docs were deleted
          if (fetchedOrders.length !== storedIds.length) {
             localStorage.setItem("zayelle_orders", JSON.stringify(fetchedOrders.map(o => o.id)));
          }
          
          // Sort by timestamp
          fetchedOrders.sort((a,b) => {
             const tA = a.timestamp?.seconds || 0;
             const tB = b.timestamp?.seconds || 0;
             return tB - tA;
          });
          
          setCartOrders(fetchedOrders);
        } catch (err) {
          console.error("Error fetching cart orders", err);
        } finally {
          setIsFetchingCart(false);
        }
      };
      fetchCart();
    }
  }, [isCartOpen]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedProduct || isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedProduct, isCartOpen]);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setDbError(null);

    try {
      // 1. Save to Firebase Database
      const docRef = await addDoc(collection(db, "orders"), {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productPrice: selectedProduct.price,
        customerName,
        customerIg,
        customerPhone,
        customerAddress,
        customerQuantity: parseInt(customerQuantity) || 1,
        customerCustomization,
        status: "pending", // Will be 'approved' in admin
        timestamp: new Date()
      });
      
      // Save order ID to LocalStorage
      const existingOrders = JSON.parse(localStorage.getItem("zayelle_orders") || "[]");
      existingOrders.push(docRef.id);
      localStorage.setItem("zayelle_orders", JSON.stringify(existingOrders));
      
      // 2. Construct Order Message for Clipboard
      const orderMessage = `🎁 NEW ORDER REQUEST 🎁\n\nProduct: ${selectedProduct.name} (${selectedProduct.price})\nQuantity: ${customerQuantity}\nName: ${customerName}\nIG Handle: ${customerIg}\nPhone: ${customerPhone}\nAddress: ${customerAddress}\nCustomization: ${customerCustomization}`;
      
      try {
        await navigator.clipboard.writeText(orderMessage);
        alert("Order details copied to clipboard! Paste them in our Instagram DM to confirm.");
      } catch (clipboardErr) {
        console.error("Clipboard copy failed", clipboardErr);
        alert("Order saved! Please message us on Instagram to confirm your details.");
      }

      // 3. Smart Redirect to Instagram (App -> Web Fallback)
      const targetUrl = settings.instagramLink;
      
      if (targetUrl.includes("instagram.com")) {
        // Try opening the app native deep link first
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isAndroid = /android/i.test(navigator.userAgent);
        const path = new URL(targetUrl).pathname;
        
        let appUrl = `instagram://camera`; // safe fallback
        if (path.includes('/direct/')) {
           appUrl = `instagram:/${path}`;
        }
        
        if (isIOS || isAndroid) {
           window.location.href = appUrl;
           // Fallback to web if app doesn't open
           setTimeout(() => {
              window.location.href = targetUrl;
           }, 2500);
        } else {
           window.location.href = targetUrl;
        }
      } else {
         window.location.href = targetUrl;
      }
      
      setSubmitSuccess(true);
      
      // Reset form
      setCustomerName("");
      setCustomerIg("");
      setCustomerPhone("");
      setCustomerAddress("");
      setCustomerQuantity("1");
      setCustomerCustomization("");
      
      setTimeout(() => {
        setSubmitSuccess(false);
        setSelectedProduct(null);
      }, 3000);
      
    } catch (err) {
      console.error("Error adding order: ", err);
      setDbError("Failed to submit order. Please DM us on Instagram instead.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const exclusivesProducts = products.filter(p => p.category === 'exclusives').slice(0, 3);
  const classicsProducts = products.filter(p => p.category === 'classics' || !p.category);

  return (
    <main style={{ backgroundColor: "var(--bg-color)", minHeight: "100vh", opacity: isLoaded ? 1 : 0, transition: "opacity 1s ease", color: "var(--text-primary)", overflowX: "hidden" }}>
      
      <div className="noise-overlay" />
      <motion.div
        style={{
          position: "fixed", top: 0, left: 0, right: 0, height: "4px",
          background: "var(--brand-dark)", transformOrigin: "0%", scaleX: scrollYProgress, zIndex: 999999
        }}
      />

      {/* Custom Cursor */}
      <motion.div 
        className="custom-cursor"
        style={{
          position: "fixed", top: 0, left: 0, width: "24px", height: "24px",
          backgroundColor: isHovering ? "transparent" : "rgba(255, 255, 255, 0.4)",
          border: isHovering ? "2px solid rgba(255, 255, 255, 0.8)" : "1px solid rgba(203, 75, 133, 0.3)",
          backdropFilter: "blur(4px)",
          borderRadius: "50%", pointerEvents: "none", zIndex: 9999999,
          transform: "translate(-50%, -50%)", 
          boxShadow: isHovering ? "none" : "0 4px 10px rgba(0,0,0,0.15)"
        }}
        animate={{ x: mousePosition.x - 12, y: mousePosition.y - 12, scale: isHovering ? 2 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.5 }}
      />
      
      {/* Navigation */}
      <nav className="nav-container" style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        position: "fixed",
        width: "100%",
        top: 0,
        zIndex: 100,
        background: "rgba(30,28,26,0.15)", // VERY subtle glass
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        color: "var(--text-light)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <img src="/logo.png" alt="Zayelle Logo" style={{ height: "40px", width: "40px", objectFit: "cover", borderRadius: "50%" }} />
          <span style={{ fontFamily: "var(--font-primary)", fontSize: "1.5rem", letterSpacing: "2px" }}>{settings.siteName}</span>
        </div>
        <div className="nav-links" style={{ display: "flex", gap: "2.5rem", fontFamily: "var(--font-sans)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1.5px" }}>
          <a href="#collection" className="nav-link" style={{ color: "var(--text-light)" }}>Collection</a>
          <a href="#contact" className="nav-link" style={{ color: "var(--text-light)" }}>Contact</a>
          <a href="/track" className="nav-link" style={{ color: "var(--brand-sand)", fontWeight: "600" }}>Track Order</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); setIsCartOpen(true); }} style={{ color: "var(--text-light)", cursor: "pointer" }}>My Orders</a>
        </div>
      </nav>

      {/* --- WAVY DARK HERO SECTION WITH PARALLAX --- */}
      <section ref={heroRef} className="hero-section" style={{ 
        position: "relative",
        minHeight: "100vh",
        background: "var(--brand-dark)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "10rem" // Space for the wave to hang down
      }}>
        
        {/* Parallax Gift Box Images (Restored as Floating Orbs) */}
        {/* Box 1: Right Top */}
        <motion.div className="hero-orb-1" style={{ position: "absolute", zIndex: 5, y: yGiftBox1, opacity: opacityHero, rotate: 8 }}>
          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
            <Image src="/product1.png" alt="Gift Box" fill style={{ objectFit: "cover" }} />
          </div>
        </motion.div>

        {/* Box 2: Right Main */}
        <motion.div className="hero-orb-2" style={{ position: "absolute", zIndex: 1, y: yGiftBox2, opacity: opacityHero, rotate: -3 }}>
          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
            <Image src="/product2.png" alt="Gift Box" fill style={{ objectFit: "cover" }} />
          </div>
        </motion.div>

        {/* Box 3: Right Inner */}
        <motion.div className="hero-orb-3" style={{ position: "absolute", zIndex: 5, y: yGiftBox3, opacity: opacityHero, rotate: -10 }}>
          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", boxShadow: "0 15px 30px rgba(0,0,0,0.4)" }}>
            <Image src="/product3.png" alt="Gift Pearl" fill style={{ objectFit: "cover" }} />
          </div>
        </motion.div>

        {/* Hero Text */}
        <motion.div style={{ zIndex: 10, textAlign: "left", width: "100%", maxWidth: "1200px", y: yHeroText }}>
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <h1 className="hero-title" style={{ fontFamily: "var(--font-primary)", lineHeight: 0.9, letterSpacing: "-2px", marginBottom: "1rem", marginTop: 0 }}>
              <StaggeredText text={settings.heroTitle ? settings.heroTitle.split(" ")[0] : "Handmade"} delay={0.2} style={{ color: "rgba(255,255,255,0.6)" }} /> <br/>
              {settings.heroTitle && settings.heroTitle.split(" ").length > 1 && (
                <StaggeredText text={settings.heroTitle.split(" ").slice(1).join(" ")} delay={0.4} style={{ color: "var(--brand-sand)" }} />
              )}
            </h1>
            
            <motion.div variants={revealUp} style={{ 
              position: "relative",
              maxWidth: "400px",
              height: "80px", 
              marginBottom: "3rem",
              marginLeft: "1rem"
            }}>
              <motion.p style={{ 
                position: "absolute",
                top: 0, left: 0,
                fontFamily: "var(--font-sans)", 
                fontSize: "1.2rem", 
                color: "rgba(255,255,255,0.7)", 
                lineHeight: 1.6,
                opacity: text1Opacity
              }}>
                {settings.heroSubtitle}
              </motion.p>
              <motion.p style={{ 
                position: "absolute",
                top: 0, left: 0,
                fontFamily: "var(--font-sans)", 
                fontSize: "1.2rem", 
                color: "rgba(255,255,255,0.9)", 
                lineHeight: 1.6,
                opacity: text2Opacity
              }}>
                Because every special moment deserves a gift that lasts a lifetime.
              </motion.p>
            </motion.div>
            
            <motion.div variants={revealUp} style={{ marginLeft: "1rem" }}>
              <a href="#collection" 
                className="shiny-btn"
                style={{
                  display: "inline-block",
                  padding: "1.2rem 3rem",
                  background: "var(--brand-sand)",
                  color: "var(--brand-dark)",
                  borderRadius: "50px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  transition: "transform 0.3s ease",
                  textDecoration: "none"
                }}>
                Shop Now
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* The Asymmetrical Wave at the bottom of the hero */}
        <div style={{
          position: "absolute",
          bottom: "-1px", 
          left: 0,
          width: "100%",
          overflow: "hidden",
          lineHeight: 0,
          transform: "rotate(180deg)",
          zIndex: 0
        }}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ position: "relative", display: "block", width: "calc(100% + 1.3px)", height: "150px" }}>
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" style={{ fill: "var(--bg-color)" }}></path>
          </svg>
        </div>
      </section>

      {/* COOL SCROLLING MARQUEE */}
      <div className="marquee-container">
        <div className="marquee-content">
          <span>{settings.marqueeText} ✦ </span>
          <span>{settings.marqueeText} ✦ </span>
          <span>{settings.marqueeText} ✦ </span>
          <span>{settings.marqueeText} ✦ </span>
        </div>
      </div>

      {/* --- TOP CATEGORIES (Dark Cards) --- */}
      <section id="collection" style={{ padding: "4rem 4rem 8rem", position: "relative", zIndex: 10, textAlign: "center" }}>
        
        {/* Clean, Slow Floating Decorative Elements */}
        <motion.div animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} style={{ position: "absolute", top: "10%", left: "5%", color: "var(--brand-dark)", opacity: 0.2 }}>
          <Sparkles size={32} />
        </motion.div>
        <motion.div animate={{ y: [0, 20, 0], rotate: [0, -15, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }} style={{ position: "absolute", bottom: "15%", right: "8%", color: "var(--brand-brown)", opacity: 0.15 }}>
          <Star size={48} />
        </motion.div>
        <motion.div animate={{ y: [0, -25, 0], rotate: [0, -5, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 5 }} style={{ position: "absolute", top: "40%", right: "3%", color: "var(--brand-dark)", opacity: 0.1 }}>
          <Heart size={36} />
        </motion.div>
        <motion.div animate={{ y: [0, 40, 0], rotate: [0, 20, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }} style={{ position: "absolute", top: "60%", left: "4%", color: "var(--brand-brown)", opacity: 0.2 }}>
          <Sparkles size={56} />
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealUp} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", maxWidth: "1200px", margin: "0 auto", marginBottom: "3rem", padding: "0 2rem" }}>
          <div style={{ textAlign: "left" }}>
            <h2 style={{ fontFamily: "var(--font-primary)", fontSize: "2.5rem", color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>
              <StaggeredText text="The Exclusives" />
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "var(--text-secondary)" }}>Explore our most requested artisan curations.</p>
          </div>
          <div style={{ display: "flex", gap: "1rem" }} className="hide-on-mobile">
            <button onClick={() => scrollExclusives('left')} style={{ background: "rgba(255,255,255,0.1)", border: "none", width: "50px", height: "50px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", transition: "all 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>
              <ChevronLeft size={24} color="var(--text-light)" />
            </button>
            <button onClick={() => scrollExclusives('right')} style={{ background: "rgba(255,255,255,0.1)", border: "none", width: "50px", height: "50px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", transition: "all 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>
              <ChevronRight size={24} color="var(--text-light)" />
            </button>
          </div>
        </motion.div>

        <div 
          ref={exclusivesRef}
          className="carousel-container" 
          onMouseEnter={() => isHoveringExclusives.current = true}
          onMouseLeave={() => isHoveringExclusives.current = false}
          onTouchStart={() => isHoveringExclusives.current = true}
          onTouchEnd={() => { setTimeout(() => isHoveringExclusives.current = false, 1500) }}
        >
          {exclusivesProducts.length === 0 && (
            <div style={{ color: "var(--text-secondary)", fontStyle: "italic", padding: "2rem" }}>No exclusive products yet.</div>
          )}
          {exclusivesProducts.map((product, idx) => (
            <motion.div 
              key={product.id}
              className="carousel-item product-card"
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={revealUp} 
              onClick={() => setSelectedProduct(product)}
              style={{ 
                background: "var(--brand-dark)", 
                borderRadius: "24px", 
                overflow: "hidden",
                color: "var(--text-light)",
                display: "flex", 
                flexDirection: "column", 
                textAlign: "left",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                cursor: "pointer",
                transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              whileHover={{ y: -15 }}
            >
              <div style={{ width: "100%", height: "250px", position: "relative", overflow: "hidden" }}>
                 <Image src={product.image} alt={product.name} fill style={{ objectFit: "cover" }} className="product-card-img" />
              </div>
              <div style={{ padding: "1.5rem", width: "100%", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <h3 style={{ fontFamily: "var(--font-primary)", fontSize: "1.5rem", marginBottom: "0.5rem", lineHeight: 1.2 }}>{product.name}</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: "1rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "1.1rem", color: "var(--brand-sand)" }}>{product.price}</span>
                  <span style={{ fontSize: "0.75rem", opacity: 0.8, textTransform: "uppercase", letterSpacing: "1px" }}>View Details</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- STANDARD COLLECTION (Beige Cards) --- */}
      <section style={{ padding: "4rem 4rem 10rem", position: "relative", zIndex: 10, textAlign: "center" }}>
        
        {/* Clean, Slow Floating Decorative Elements */}
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, -10, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }} style={{ position: "absolute", top: "5%", right: "6%", color: "var(--brand-brown)", opacity: 0.2 }}>
          <Leaf size={40} />
        </motion.div>
        <motion.div animate={{ y: [0, 35, 0], rotate: [0, 15, 0] }} transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }} style={{ position: "absolute", bottom: "10%", left: "7%", color: "var(--text-secondary)", opacity: 0.15 }}>
          <Star size={50} />
        </motion.div>
        <motion.div animate={{ y: [0, -40, 0], rotate: [0, 8, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }} style={{ position: "absolute", top: "30%", left: "2%", color: "var(--brand-brown)", opacity: 0.1 }}>
          <Heart size={28} />
        </motion.div>
        <motion.div animate={{ y: [0, 25, 0], rotate: [0, -12, 0] }} transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", delay: 6 }} style={{ position: "absolute", top: "70%", right: "4%", color: "var(--brand-dark)", opacity: 0.25 }}>
          <Sparkles size={38} />
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={revealUp} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", maxWidth: "1200px", margin: "0 auto", marginBottom: "3rem", padding: "0 2rem" }}>
          <div style={{ textAlign: "left" }}>
            <h2 style={{ fontFamily: "var(--font-primary)", fontSize: "2.5rem", color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>
              <StaggeredText text="The Classics" />
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "var(--text-secondary)" }}>Timeless pieces for any occasion.</p>
          </div>
          <div style={{ display: "flex", gap: "1rem" }} className="hide-on-mobile">
            <button onClick={() => scrollCarousel('left')} style={{ background: "rgba(0,0,0,0.05)", border: "none", width: "50px", height: "50px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", transition: "all 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.1)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}>
              <ChevronLeft size={24} color="var(--brand-dark)" />
            </button>
            <button onClick={() => scrollCarousel('right')} style={{ background: "rgba(0,0,0,0.05)", border: "none", width: "50px", height: "50px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", transition: "all 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.1)"} onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}>
              <ChevronRight size={24} color="var(--brand-dark)" />
            </button>
          </div>
        </motion.div>

        <div 
          ref={carouselRef}
          className="carousel-container" 
          onMouseEnter={() => isHoveringCarousel.current = true}
          onMouseLeave={() => isHoveringCarousel.current = false}
          onTouchStart={() => isHoveringCarousel.current = true}
          onTouchEnd={() => { setTimeout(() => isHoveringCarousel.current = false, 1500) }}
        >
          {classicsProducts.length === 0 && (
            <div style={{ color: "var(--text-secondary)", fontStyle: "italic", padding: "2rem" }}>No classic products yet.</div>
          )}
          {classicsProducts.map((product, idx) => (
            <motion.div 
              key={product.id}
              className="carousel-item product-card"
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={revealUp} 
              onClick={() => setSelectedProduct(product)}
              style={{ 
                background: "var(--bg-surface)", 
                borderRadius: "24px", 
                overflow: "hidden",
                color: "var(--text-primary)",
                display: "flex", 
                flexDirection: "column", 
                textAlign: "left",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
                cursor: "pointer",
                transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              whileHover={{ y: -10 }}
            >
              <div style={{ width: "100%", height: "220px", position: "relative", overflow: "hidden" }}>
                 <Image src={product.image} alt={product.name} fill style={{ objectFit: "cover" }} className="product-card-img" />
              </div>
              <div style={{ padding: "1.5rem", width: "100%", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <h3 style={{ fontFamily: "var(--font-primary)", fontSize: "1.4rem", marginBottom: "0.5rem", lineHeight: 1.2 }}>{product.name}</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
                  <span style={{ fontWeight: 600, fontSize: "1.1rem", color: "var(--brand-dark)" }}>{product.price}</span>
                  <span style={{ background: "var(--brand-dark)", color: "var(--text-light)", padding: "0.5rem 1rem", borderRadius: "50px", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px" }}>Order</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer-container" style={{ background: "var(--brand-dark)", color: "var(--text-light)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* Top Section */}
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "4rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
              <img src="/logo.png" alt="Zayelle Logo" style={{ height: "40px", width: "40px", objectFit: "cover", borderRadius: "50%" }} />
              <span style={{ fontFamily: "var(--font-primary)", fontSize: "1.5rem", letterSpacing: "2px" }}>ZAYELLE</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", maxWidth: "300px", lineHeight: 1.6 }}>
              Bespoke gifting crafted with precision, care, and unparalleled luxury. Made for the moments that matter.
            </p>
          </div>
          
          <div style={{ display: "flex", gap: "6rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", fontSize: "0.9rem" }}>
              <strong style={{ textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem", color: "var(--brand-sand)" }}>Company Info</strong>
              <a href="#" className="nav-link" style={{ color: "rgba(255,255,255,0.7)" }}>About Us</a>
              <a href="#" className="nav-link" style={{ color: "rgba(255,255,255,0.7)" }}>Contact Us</a>
              <a href="/track" className="nav-link" style={{ color: "var(--brand-sand)", fontWeight: "600" }}>Track Order</a>
              <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); setIsCartOpen(true); }} style={{ color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>My Cart</a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", fontSize: "0.9rem" }}>
              <strong style={{ textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem", color: "var(--brand-sand)" }}>Follow Us</strong>
              <a href={settings.instagramLink} target="_blank" className="nav-link" style={{ color: "rgba(255,255,255,0.7)" }}>Instagram</a>
              <a href="#" className="nav-link" style={{ color: "rgba(255,255,255,0.7)" }}>Pinterest</a>
            </div>
          </div>
        </div>

        {/* Giant Typography Footer Bottom */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "4rem", marginTop: "2rem", textAlign: "center", position: "relative" }}>
           <h1 className="footer-title" style={{ 
             fontFamily: "var(--font-primary)", 
             lineHeight: 0.8, 
             margin: 0,
             color: "var(--bg-color)",
             opacity: 0.05,
             letterSpacing: "4px"
           }}>
             ZAYELLE
           </h1>
           <div style={{ display: "flex", justifyContent: "space-between", position: "absolute", bottom: "10px", width: "100%", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>
             <span>© 2026 Zayelle</span>
             <span>Handcrafted in India</span>
           </div>
        </div>
      </footer>

      {/* Cart / My Orders Slide-out Panel */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 999999, display: "flex", justifyContent: "flex-end" }}
          >
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setIsCartOpen(false)}></div>
            <motion.div 
            className="modal-content"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ position: "fixed", top: 0, right: 0, height: "100%", background: "var(--bg-color)", boxShadow: "-10px 0 30px rgba(0,0,0,0.1)", zIndex: 100000, display: "flex", flexDirection: "column", width: "100%", maxWidth: "450px" }}
            >
              <div style={{ padding: "2rem", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--brand-dark)", color: "var(--text-light)" }}>
                <h2 style={{ fontFamily: "var(--font-primary)", fontSize: "1.5rem", letterSpacing: "1px" }}>My Orders</h2>
                <button onClick={() => setIsCartOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-light)", cursor: "pointer", display: "flex" }}><X size={24} /></button>
              </div>
              
              <div style={{ padding: "2rem", flexGrow: 1, overflowY: "auto" }}>
                {isFetchingCart ? (
                  <p style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "2rem" }}>Loading your orders...</p>
                ) : cartOrders.length === 0 ? (
                  <div style={{ textAlign: "center", marginTop: "4rem" }}>
                    <ShoppingBag size={48} color="var(--brand-brown)" style={{ opacity: 0.3, marginBottom: "1rem" }} />
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Your cart is empty.</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", opacity: 0.7, marginTop: "0.5rem" }}>Submit an order request to see it here.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {cartOrders.map(order => (
                      <div key={order.id} style={{ background: "#fff", padding: "1.5rem", borderRadius: "16px", boxShadow: "0 5px 15px rgba(0,0,0,0.05)", border: "1px solid var(--border-subtle)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                          <h4 style={{ fontFamily: "var(--font-primary)", fontSize: "1.2rem", color: "var(--brand-dark)", margin: 0 }}>{order.productName}</h4>
                          <span style={{ fontWeight: 600, color: "var(--brand-brown)" }}>{order.productPrice}</span>
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                          Quantity: <strong>{order.customerQuantity || 1}</strong>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eee", paddingTop: "1rem", marginTop: "1rem" }}>
                           <span style={{ fontSize: "0.85rem", color: "#666" }}>Status:</span>
                           {order.status === "approved" ? (
                             <span style={{ background: "#E8F5E9", color: "#2E7D32", padding: "0.4rem 0.8rem", borderRadius: "50px", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Approved</span>
                           ) : (
                             <span style={{ background: "#FFF3E0", color: "#E65100", padding: "0.4rem 0.8rem", borderRadius: "50px", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Pending Review</span>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Modal Overlay WITH FORM */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", justifyContent: "center", alignItems: "center", padding: "2rem" }}
          >
            <div style={{ position: "absolute", inset: 0, background: "rgba(30,28,26,0.9)", backdropFilter: "blur(10px)" }} onClick={() => setSelectedProduct(null)}></div>
            <motion.div 
            className="product-modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ 
              background: "var(--bg-surface)", 
              borderRadius: "24px", 
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              display: "flex",
              overflow: "hidden",
              position: "relative",
              width: "100%",
              maxWidth: "1000px"
            }}
          >
              <button onClick={() => { setSelectedProduct(null); setSubmitSuccess(false); }} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "rgba(0,0,0,0.1)", border: "none", width: "40px", height: "40px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", zIndex: 10 }}>
                <X size={20} />
              </button>
              
              {/* Image Side */}
              <div className="product-modal-img-container" style={{ flex: "1 1 400px", minHeight: "300px", position: "relative" }}>
                 <Image src={selectedProduct.image} alt={selectedProduct.name} fill style={{ objectFit: "cover" }} />
              </div>
              
              {/* Content & Form Side */}
              <div className="product-modal-details" data-lenis-prevent="true" style={{ flex: "1.2 1 500px", padding: "3rem", display: "flex", flexDirection: "column", maxHeight: "80vh", overflowY: "auto" }}>
                <div style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "2px", color: "var(--brand-brown)", marginBottom: "0.5rem" }}>The Collection</div>
                <h2 style={{ fontFamily: "var(--font-primary)", fontSize: "2.5rem", marginBottom: "0.5rem", lineHeight: 1.1, color: "var(--brand-dark)" }}>{selectedProduct.name}</h2>
                <div style={{ fontSize: "1.25rem", fontFamily: "var(--font-sans)", fontWeight: 600, marginBottom: "1.5rem", color: "var(--text-secondary)" }}>{selectedProduct.price}</div>
                
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "2rem" }}>{selectedProduct.shortDesc}</p>
                
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "2rem" }}>
                  <h3 style={{ fontFamily: "var(--font-primary)", fontSize: "1.5rem", marginBottom: "1.5rem", color: "var(--brand-dark)" }}>Submit Order Request</h3>
                  
                  {submitSuccess ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: "rgba(123, 160, 130, 0.2)", color: "#2B4E41", padding: "1.5rem", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(123, 160, 130, 0.4)" }}>
                      <h4 style={{ marginBottom: "0.5rem", fontSize: "1.1rem" }}>Request Received!</h4>
                      <p style={{ fontSize: "0.9rem" }}>We will review your order and reach out via Instagram or Phone shortly to confirm details and payment.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleOrderSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <input type="text" placeholder="Your Name" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans)" }} />
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <input type="text" placeholder="Instagram Handle (@)" required value={customerIg} onChange={(e) => setCustomerIg(e.target.value)} style={{ flex: 1, padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans)" }} />
                        <input type="tel" placeholder="Phone Number" required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={{ flex: 1, padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans)" }} />
                      </div>
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <input type="number" min="1" placeholder="Qty" required value={customerQuantity} onChange={(e) => setCustomerQuantity(e.target.value)} style={{ flex: "0 0 80px", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans)" }} />
                        <textarea placeholder="Delivery Address" required value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} rows={1} style={{ flex: 1, padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans)", resize: "vertical" }} />
                      </div>
                      <textarea placeholder="Customization Requests (e.g. ribbon color, note)" value={customerCustomization} onChange={(e) => setCustomerCustomization(e.target.value)} rows={3} style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.5)", fontFamily: "var(--font-sans)", resize: "vertical" }} />
                      
                      {dbError && <div style={{ color: "red", fontSize: "0.85rem", marginTop: "-0.5rem" }}>{dbError}</div>}
                      
                      <button type="submit" disabled={isSubmitting} className="shiny-btn" style={{ width: "100%", padding: "1.2rem", background: "var(--brand-dark)", color: "#FFF", border: "none", borderRadius: "12px", fontFamily: "var(--font-sans)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1, transition: "background 0.3s", marginTop: "0.5rem" }}>
                        {isSubmitting ? "Submitting Request..." : "Request Order"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
