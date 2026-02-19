import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../providers/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { Usuario } from '../@types/schema';


interface AuthContextType {
    usuario: Usuario | null;
    carregando: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Se logou no Auth, buscamos o 'Role' e dados no Firestore
        const docRef = doc(db, "usuario", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUsuario(docSnap.data() as Usuario);
        }
      } else {
        setUsuario(null);
      }
      setCarregando(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, carregando }}>
      {!carregando && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);