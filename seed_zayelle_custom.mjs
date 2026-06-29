import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";

// Read Firebase config from firebase.js
const firebaseJsPath = path.join(process.cwd(), "firebase.js");
const firebaseJsContent = fs.readFileSync(firebaseJsPath, "utf-8");
const configMatch = firebaseJsContent.match(/const firebaseConfig = ({[\s\S]*?});/);

if (!configMatch) {
  console.error("Could not find firebaseConfig in firebase.js");
  process.exit(1);
}

const firebaseConfig = eval("(" + configMatch[1] + ")");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const newProducts = [
  {
    name: "Mini Hamper Box",
    price: "$45.00",
    image: "/product1.png",
    shortDesc: "A beautiful curated box containing scrunchies, elegant earrings, hair clips, and bracelets.",
    features: ["Velvet Scrunchies", "Statement Earrings", "Pearl Hair Clips", "Custom Note"],
    isTopCategory: true
  },
  {
    name: "Custom Polaroids & Frame",
    price: "$35.00",
    image: "/product2.png",
    shortDesc: "Turn your memories into the perfect gift with a custom photo collage frame.",
    features: ["A4 Size Frame", "Custom Collage Layout", "Spotify Song Code integration"],
    isTopCategory: true
  },
  {
    name: "Spotify Music Keychain",
    price: "$15.00",
    image: "/product3.png",
    shortDesc: "Scan and play your favorite song. A personalized acrylic keychain with your photo and song.",
    features: ["High Quality Acrylic", "Scannable Spotify Code", "Double Sided Print"],
    isTopCategory: true
  },
  {
    name: "Premium Apparel Hamper",
    price: "$120.00",
    image: "/product1.png",
    shortDesc: "The ultimate gift. Includes a T-shirt, wallet, wish card, chocolates, and flowers in a custom box.",
    features: ["Custom Apparel", "Premium Wallet", "Assorted Chocolates", "Fresh or Faux Flowers"]
  },
  {
    name: "Ferrero Chocolate Bouquet",
    price: "$55.00",
    image: "/product2.png",
    shortDesc: "A stunning arrangement of Ferrero Rocher chocolates wrapped beautifully like a floral bouquet.",
    features: ["24 Ferrero Chocolates", "Premium Satin Wrapping", "Custom Ribbon", "Greeting Card"]
  },
  {
    name: "Satin Ribbon Bouquet",
    price: "$40.00",
    image: "/product3.png",
    shortDesc: "Everlasting roses made completely from high-quality satin ribbons. A gift that never fades.",
    features: ["Handcrafted Satin Roses", "Available in multiple colors", "Pearl Accents"]
  }
];

async function seedDatabase() {
  const productsRef = collection(db, "products");
  
  console.log("Deleting old products...");
  const snapshot = await getDocs(productsRef);
  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  console.log(`Deleted ${snapshot.docs.length} old products.`);

  console.log("Adding new products...");
  const addPromises = newProducts.map(product => addDoc(productsRef, product));
  await Promise.all(addPromises);
  console.log(`Added ${newProducts.length} new products.`);

  console.log("Database seeded successfully!");
  process.exit(0);
}

seedDatabase().catch(console.error);
