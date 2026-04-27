import { User } from '@/types';
import { createUserWithEmailAndPassword, signOut as firebaseSignOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

export class AuthManager {
  static async signUp(email: string, pass: string, fullName: string, age: number): Promise<User | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const uid = userCredential.user.uid;

      const newUser: User = {
        uid,
        fullName,
        age,
        email,
        totalScore: 0,
        role: 'patient',
        createdAt: new Date().toISOString()
      };

      // Save user profile to Firestore 'users' collection
      await setDoc(doc(db, 'users', uid), newUser);

      return newUser;
    } catch (error) {
      console.error("SignUp Error:", error);
      throw error;
    }
  }

  static async signIn(email: string, pass: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      return userCredential.user;
    } catch (error) {
      console.error("SignIn Error:", error);
      throw error;
    }
  }

  static async signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("SignOut Error:", error);
      throw error;
    }
  }
}
