import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

import { UserRole } from '../types/accounting';

interface WorkingContextType {
  workingYear: number;
  workingMonth: number;
  setWorkingYear: (year: number) => void;
  setWorkingMonth: (month: number) => void;
  role: UserRole;
  loading: boolean;
}

const WorkingContext = createContext<WorkingContextType | undefined>(undefined);

export const WorkingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workingYear, setWorkingYear] = useState(new Date().getFullYear());
  const [workingMonth, setWorkingMonth] = useState(new Date().getMonth() + 1);
  const [role, setRole] = useState<UserRole>('viewer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Listen for real-time updates to user settings
        const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.workingYear) {
              setWorkingYear(data.workingYear);
            }
            if (data.workingMonth) {
              setWorkingMonth(data.workingMonth);
            }
            if (data.role) {
              setRole(data.role);
            }
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user document:", error);
          setLoading(false);
        });

        return () => unsubscribeDoc();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const updateWorkingYear = async (year: number) => {
    setWorkingYear(year);
    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { 
          workingYear: year,
          email: user.email,
          displayName: user.displayName,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        console.error('Error updating working year in Firestore:', error);
      }
    }
  };

  const updateWorkingMonth = async (month: number) => {
    setWorkingMonth(month);
    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { 
          workingMonth: month,
          email: user.email,
          displayName: user.displayName,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        console.error('Error updating working month in Firestore:', error);
      }
    }
  };

  return (
    <WorkingContext.Provider value={{ 
      workingYear, 
      workingMonth,
      setWorkingYear: updateWorkingYear, 
      setWorkingMonth: updateWorkingMonth,
      role, 
      loading 
    }}>
      {children}
    </WorkingContext.Provider>
  );
};

export const useWorkingContext = () => {
  const context = useContext(WorkingContext);
  if (!context) {
    throw new Error('useWorkingContext must be used within a WorkingProvider');
  }
  return context;
};
