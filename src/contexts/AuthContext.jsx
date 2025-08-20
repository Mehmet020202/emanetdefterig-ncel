import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut
} from 'firebase/auth';
import { auth, googleProvider, signInWithPopup, onAuthStateChanged, sendPasswordResetEmail, updateProfile, setPersistence, browserLocalPersistence, browserSessionPersistence } from '@/lib/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kullanıcı durumunu dinle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Email/şifre ile giriş
  const loginWithEmail = async (email, password, rememberMe = false) => {
    try {
      setError(null);
      setLoading(true);
      
      // Persistence ayarla
      if (rememberMe) {
        await setPersistence(auth, browserLocalPersistence);
      } else {
        await setPersistence(auth, browserSessionPersistence);
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      let errorMessage = 'Giriş yapılırken bir hata oluştu.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Hatalı şifre.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Geçersiz email adresi.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Google ile giriş
  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      let errorMessage = 'Google ile giriş yapılırken bir hata oluştu.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Giriş işlemi iptal edildi.';
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Yeni kullanıcı kaydı
  const registerWithEmail = async (email, password, displayName) => {
    try {
      setError(null);
      setLoading(true);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Kullanıcı profilini güncelle
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      
      return userCredential.user;
    } catch (error) {
      let errorMessage = 'Kayıt olurken bir hata oluştu.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Bu email adresi zaten kullanımda.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Şifre en az 6 karakter olmalıdır.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Geçersiz email adresi.';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Şifre sıfırlama
  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      let errorMessage = 'Şifre sıfırlama emaili gönderilirken bir hata oluştu.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.';
      }
      
      setError(errorMessage);
      throw error;
    }
  };



  // Çıkış yap
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error) {
      console.error('Çıkış hatası:', error);
      setError('Çıkış yapılırken bir hata oluştu.');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    loginWithEmail,
    loginWithGoogle,
    registerWithEmail,
    resetPassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

