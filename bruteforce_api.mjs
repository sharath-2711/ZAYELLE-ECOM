import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const testKey = async (apiKey) => {
  const firebaseConfig = {
    apiKey: apiKey,
    authDomain: "zayelle-c72f2.firebaseapp.com",
    projectId: "zayelle-c72f2",
  };
  
  const app = initializeApp(firebaseConfig, apiKey);
  const auth = getAuth(app);
  
  try {
    await createUserWithEmailAndPassword(auth, 'k.v.sharath2711@gmail.com', '12345678');
    console.log('SUCCESS! Valid API Key found:', apiKey);
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('SUCCESS! Valid API Key found (user already exists):', apiKey);
      process.exit(0);
    }
    // Invalid key throws auth/api-key-not-valid
  } finally {
    await deleteApp(app);
  }
};

const run = async () => {
  const char1 = ['l', '1', 'I'];
  const char2 = ['w', 'W'];
  const char3 = ['z', 'Z'];

  for (const c1 of char1) {
    for (const c2 of char2) {
      for (const c3 of char3) {
        const key = `AIzaSyD5R${c1}67${c2}Fp_oTgqNyi7N${c3}d2ymBoy9Mm3Yw`;
        await testKey(key);
      }
    }
  }
  console.log('FAILED to find valid API key');
};

run();
