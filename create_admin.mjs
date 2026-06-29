import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD5R167wFp_oTgqNyi7Nzd2ymBoy9Mm3Yw",
  authDomain: "zayelle-c72f2.firebaseapp.com",
  projectId: "zayelle-c72f2",
  storageBucket: "zayelle-c72f2.firebasestorage.app",
  messagingSenderId: "368470101704",
  appId: "1:368470101704:web:791e26a54b007ce273dffd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

createUserWithEmailAndPassword(auth, 'k.v.sharath2711@gmail.com', '12345678')
  .then((userCredential) => {
    console.log('Successfully created admin user:', userCredential.user.email);
    process.exit(0);
  })
  .catch((error) => {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists.');
      process.exit(0);
    } else {
      console.error('Error creating admin user:', error.message);
      process.exit(1);
    }
  });
