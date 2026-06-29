import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD5R167wFp_oTgqNyi7Nzd2ymBoy9Mm3Yw",
  authDomain: "zayelle-c72f2.firebaseapp.com",
  projectId: "zayelle-c72f2",
  storageBucket: "zayelle-c72f2.firebasestorage.app",
  messagingSenderId: "368470101704",
  appId: "1:368470101704:web:791e26a54b007ce273dffd",
  measurementId: "G-664N16DT9N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const newProducts = [
  {
    name: "The Grand Peony",
    price: "$295",
    shortDesc: "A masterclass in texture. Featuring rare imported peonies, sweet peas, and cascading phalaenopsis orchids wrapped in silk.",
    category: "Bouquet",
    image: "https://images.unsplash.com/photo-1563241598-bf89e6eb0227?q=80&w=1200&auto=format&fit=crop"
  },
  {
    name: "Midnight Rouge",
    price: "$340",
    shortDesc: "Dramatic, moody, and unforgettable. Deep burgundy baccara roses mixed with dark seasonal foliage in a bespoke matte vase.",
    category: "Bouquet",
    image: "https://images.unsplash.com/photo-1591886960571-74d43a9d4166?q=80&w=1200&auto=format&fit=crop"
  },
  {
    name: "Blush Minimalist",
    price: "$185",
    shortDesc: "Architectural and clean. A curated selection of blush anthuriums and structured stems for the modern aesthetic.",
    category: "Bouquet",
    image: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=1200&auto=format&fit=crop"
  },
  {
    name: "Wildflower Reserve",
    price: "$220",
    shortDesc: "Untamed luxury. A sprawling, asymmetrical arrangement of premium seasonal wildflowers that feels both organic and elevated.",
    category: "Bouquet",
    image: "https://images.unsplash.com/photo-1629851163459-242699e31d79?q=80&w=1200&auto=format&fit=crop"
  }
];

async function seed() {
  console.log("Starting to seed bouquets...");
  for (const product of newProducts) {
    try {
      const docRef = await addDoc(collection(db, "products"), product);
      console.log(`Added: ${product.name} with ID: ${docRef.id}`);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  console.log("Seeding complete!");
  process.exit(0);
}

seed();
