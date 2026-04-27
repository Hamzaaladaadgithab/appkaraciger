import { db } from './firebaseConfig';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { SessionLog, Progress, Scenario, User } from '@/types';

export class DatabaseManager {
  
  static async getPatients(): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'patient'));
      const querySnapshot = await getDocs(q);
      
      const patients: User[] = [];
      querySnapshot.forEach((docSnap) => {
        patients.push(docSnap.data() as User);
      });
      return patients;
    } catch (error) {
      console.error("Error fetching patients:", error);
      return [];
    }
  }

  static async updateUserScore(uid: string, newScore: number): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { totalScore: newScore });
      return true;
    } catch (error) {
      console.error("Error updating user score:", error);
      return false;
    }
  }

  static async deleteUser(uid: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', uid);
      await deleteDoc(userRef);
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  static async getDecisionTree(scenarioId: string): Promise<Scenario | null> {
    try {
      const docRef = doc(db, 'scenarios', scenarioId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Scenario;
      }
      return null;
    } catch (error) {
      console.error("Error fetching scenario:", error);
      return null;
    }
  }

  static async saveSessionLog(log: Omit<SessionLog, 'logId' | 'ts'>): Promise<string> {
    try {
      const newLogRef = doc(collection(db, 'session_logs'));
      const logData: SessionLog = {
        ...log,
        logId: newLogRef.id,
        ts: new Date().toISOString()
      };
      
      // Save the log
      await setDoc(newLogRef, logData);
      
      // Update the user's progress 1-to-1 document
      await this.updateUserProgress(log.userId, log.scenarioId, log.score);

      return newLogRef.id;
    } catch (error) {
      console.error("Error saving session log:", error);
      throw error;
    }
  }

  static async updateUserProgress(userId: string, scenarioId: string, additionalScore: number) {
    try {
      const progressRef = doc(db, 'progress', userId);
      const progressSnap = await getDoc(progressRef);
      
      if (progressSnap.exists()) {
        const data = progressSnap.data() as Progress;
        await updateDoc(progressRef, {
          totalScore: data.totalScore + additionalScore,
          completedScenarios: data.completedScenarios.includes(scenarioId) 
            ? data.completedScenarios 
            : [...data.completedScenarios, scenarioId]
        });
      } else {
        // Create initial progress document for user
        const newProgress: Progress = {
          progressId: userId, // mapping progress doc directly to userId
          userId,
          completedScenarios: [scenarioId],
          totalScore: additionalScore
        };
        await setDoc(progressRef, newProgress);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  }
}
