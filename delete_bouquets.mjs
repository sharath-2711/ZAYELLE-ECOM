import { initializeApp } from "firebase/app";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";

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

const idsToDelete = [
  "FN7KWoERCfTq5242EYed",
  "4F8I6UFn12BrnngL9Z8x",
  "F8rHERUHu3s6HYjFDx98",
  "JoMK1zo2Mz2irYVizr7d"
];

async function deleteDocs() {
  console.log("Starting deletion...");
  for (const id of idsToDelete) {
    try {
      await deleteDoc(doc(db, "products", id));
      console.log(`Deleted: ${id}`);
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  }
  console.log("Deletion complete!");
  process.exit(0);
}

deleteDocs();
