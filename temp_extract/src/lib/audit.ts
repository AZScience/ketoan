import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

export const logAudit = async (module: string, action: string, details: string) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await addDoc(collection(db, 'audit_logs'), {
      userId: user.uid,
      userName: user.displayName || user.email || 'Unknown User',
      module,
      action,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error recording audit log:', error);
  }
};
