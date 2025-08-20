import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  setDoc,
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { demoDataManager } from './demoData';

// Kullanıcı bazlı veri yapısı
const getUserDataPath = (userId) => {
  return `users/${userId}/userData`;
};

// Veri tiplerini tanımla
const DATA_TYPES = {
  MUSTERI: 'musteri',
  EMANET_TURU: 'emanetTuru',
  EMANET: 'emanet',
  BORC: 'borc'
};

// Demo mod CRUD fonksiyonları
const createUserData = async (userId, dataType, data) => {
  switch (dataType) {
    case DATA_TYPES.MUSTERI:
      return (await demoDataManager.addMusteri(data)).id;
    case DATA_TYPES.EMANET_TURU:
      return (await demoDataManager.addEmanetTuru(data)).id;
    case DATA_TYPES.EMANET:
      return (await demoDataManager.addEmanet(data)).id;
    case DATA_TYPES.BORC:
      return (await demoDataManager.addBorc(data)).id;
    default:
      throw new Error(`Bilinmeyen demo veri tipi: ${dataType}`);
  }
};

const getUserDataByType = async (userId, dataType) => {
  switch (dataType) {
    case DATA_TYPES.MUSTERI:
      return await demoDataManager.getMusteriler();
    case DATA_TYPES.EMANET_TURU:
      return await demoDataManager.getEmanetTurleri();
    case DATA_TYPES.EMANET:
      return await demoDataManager.getEmanetler();
    case DATA_TYPES.BORC:
      return await demoDataManager.getBorclar();
    default:
      throw new Error(`Bilinmeyen demo veri tipi: ${dataType}`);
  }
};

const updateUserData = async (userId, docId, dataType, data) => {
  switch (dataType) {
    case DATA_TYPES.MUSTERI:
      return await demoDataManager.updateMusteri(docId, data);
    case DATA_TYPES.EMANET_TURU:
      return await demoDataManager.updateEmanetTuru(docId, data);
    case DATA_TYPES.EMANET:
      return await demoDataManager.updateEmanet(docId, data);
    case DATA_TYPES.BORC:
      return await demoDataManager.updateBorc(docId, data);
    default:
      throw new Error(`Bilinmeyen demo veri tipi: ${dataType}`);
  }
};

const deleteUserData = async (userId, docId, dataType) => {
  switch (dataType) {
        case DATA_TYPES.MUSTERI:
      return await demoDataManager.deleteMusteri(docId);
          case DATA_TYPES.EMANET_TURU:
      return await demoDataManager.deleteEmanetTuru(docId);
    case DATA_TYPES.EMANET:
      return await demoDataManager.deleteEmanet(docId);
    case DATA_TYPES.BORC:
      return await demoDataManager.deleteBorc(docId);
    default:
      throw new Error(`Bilinmeyen demo veri tipi: ${dataType}`);
  }
};

// Gerçek zamanlı veri dinleme fonksiyonları
export const realtimeListeners = {
  // Müşterileri dinle
  listenToMusteriler(userId, callback, isDemoMode) {
    if (isDemoMode) {
      // Demo modda localStorage'dan dinle
      const interval = setInterval(() => {
        const data = demoDataManager.getMusteriler();
        callback(data);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      // Firestore'dan gerçek zamanlı dinle
      const q = query(
        collection(db, `users/${userId}/musteriler`),
        orderBy('createdAt', 'desc')
      );
      return onSnapshot(q, (snapshot) => {
        const musteriler = [];
        snapshot.forEach((doc) => {
          musteriler.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(musteriler);
      });
    }
  },

  // Emanet türlerini dinle
  listenToEmanetTurleri(userId, callback, isDemoMode) {
    if (isDemoMode) {
      const interval = setInterval(() => {
        const data = demoDataManager.getEmanetTurleri();
        callback(data);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      const q = query(
        collection(db, `users/${userId}/emanetTurleri`),
        orderBy('createdAt', 'desc')
      );
      return onSnapshot(q, (snapshot) => {
        const turler = [];
        snapshot.forEach((doc) => {
          turler.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(turler);
      });
    }
  },

  // Emanetleri dinle
  listenToEmanetler(userId, callback, isDemoMode) {
    if (isDemoMode) {
      const interval = setInterval(() => {
        const data = demoDataManager.getEmanetler();
        callback(data);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      const q = query(
        collection(db, `users/${userId}/emanetler`),
        orderBy('tarih', 'desc')
      );
      return onSnapshot(q, (snapshot) => {
        const emanetler = [];
        snapshot.forEach((doc) => {
          emanetler.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(emanetler);
      });
    }
  },

  // Borçları dinle
  listenToBorclar(userId, callback, isDemoMode) {
    if (isDemoMode) {
      const interval = setInterval(() => {
        const data = demoDataManager.getBorclar();
        callback(data);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      const q = query(
        collection(db, `users/${userId}/borclar`),
        orderBy('tarih', 'desc')
      );
      return onSnapshot(q, (snapshot) => {
        const borclar = [];
        snapshot.forEach((doc) => {
          borclar.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(borclar);
      });
    }
  }
};

// Müşteriler CRUD işlemleri
export const musteriler = {
  async getAll(userId, isDemoMode) {
    if (isDemoMode) {
      return await getUserDataByType(userId, DATA_TYPES.MUSTERI, isDemoMode);
    } else {
      const q = query(
        collection(db, `users/${userId}/musteriler`),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const musteriler = [];
      snapshot.forEach((doc) => {
        musteriler.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return musteriler;
    }
  },

  async getById(userId, id, isDemoMode) {
    if (isDemoMode) {
      const musteriler = await demoDataManager.getMusteriler();
      return musteriler.find(m => m.id === id);
    } else {
      try {
        const docRef = doc(db, getUserDataPath(userId), id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().dataType === DATA_TYPES.MUSTERI) {
          return {
            id: docSnap.id,
            ...docSnap.data().data,
            _meta: {
              lastUpdated: docSnap.data().lastUpdated,
              createdAt: docSnap.data().createdAt
            }
          };
        }
        return null;
      } catch (error) {
        console.error('Müşteri getirilemedi:', error);
        throw error;
      }
    }
  },

  async add(userId, musteriData, isDemoMode) {
    if (isDemoMode) {
      return await createUserData(userId, DATA_TYPES.MUSTERI, musteriData, isDemoMode);
    } else {
      const docRef = await addDoc(collection(db, `users/${userId}/musteriler`), {
        ...musteriData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id };
    }
  },

  async update(userId, id, musteriData, isDemoMode) {
    return await updateUserData(userId, id, DATA_TYPES.MUSTERI, musteriData, isDemoMode);
  },

  async delete(userId, id, isDemoMode) {
    return await deleteUserData(userId, id, DATA_TYPES.MUSTERI, isDemoMode);
  },

  async deleteAll(userId) {
    try {
      const q = query(collection(db, `users/${userId}/musteriler`));
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Tüm müşteriler silinirken hata:', error);
      throw error;
    }
  }
};

// Emanet Türleri CRUD işlemleri
export const emanetTurleri = {
  async getAll(userId, isDemoMode) {
    return await getUserDataByType(userId, DATA_TYPES.EMANET_TURU, isDemoMode);
  },

  async add(userId, turData, isDemoMode) {
    if (isDemoMode) {
      return await createUserData(userId, DATA_TYPES.EMANET_TURU, turData, isDemoMode);
    } else {
      const docRef = await addDoc(collection(db, `users/${userId}/emanetTurleri`), {
        ...turData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id };
    }
  },

  async update(userId, id, turData, isDemoMode) {
    return await updateUserData(userId, id, DATA_TYPES.EMANET_TURU, turData, isDemoMode);
  },

  async delete(userId, id, isDemoMode) {
    return await deleteUserData(userId, id, DATA_TYPES.EMANET_TURU, isDemoMode);
  },

  async deleteAll(userId) {
    try {
      const q = query(collection(db, `users/${userId}/emanetTurleri`));
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Tüm emanet türleri silinirken hata:', error);
      throw error;
    }
  }
};

// Emanetler CRUD işlemleri
export const emanetler = {
  async getAll(userId, isDemoMode) {
    return await getUserDataByType(userId, DATA_TYPES.EMANET, isDemoMode);
  },

  async getByMusteriId(userId, musteriId, isDemoMode) {
    if (isDemoMode) {
      const allEmanetler = await demoDataManager.getEmanetler();
      return allEmanetler.filter(emanet => emanet.musteriId === musteriId);
    } else {
      try {
        const allEmanetler = await getUserDataByType(userId, DATA_TYPES.EMANET);
        return allEmanetler.filter(emanet => emanet.musteriId === musteriId);
      } catch (error) {
        console.error('Müşteri emanetleri getirilemedi:', error);
        throw error;
      }
    }
  },

  async add(userId, emanetData, isDemoMode) {
    if (isDemoMode) {
      return await createUserData(userId, DATA_TYPES.EMANET, emanetData, isDemoMode);
    } else {
      const docRef = await addDoc(collection(db, `users/${userId}/emanetler`), {
        ...emanetData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id };
    }
  },

  async update(userId, id, emanetData, isDemoMode) {
    return await updateUserData(userId, id, DATA_TYPES.EMANET, emanetData, isDemoMode);
  },

  async delete(userId, id, isDemoMode) {
    return await deleteUserData(userId, id, DATA_TYPES.EMANET, isDemoMode);
  },

  async deleteAll(userId) {
    try {
      const q = query(collection(db, `users/${userId}/emanetler`));
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Tüm emanetler silinirken hata:', error);
      throw error;
    }
  }
};

// Borçlar CRUD işlemleri
export const borclar = {
  async getAll(userId, isDemoMode) {
    return await getUserDataByType(userId, DATA_TYPES.BORC, isDemoMode);
  },

  async getByMusteriId(userId, musteriId, isDemoMode) {
    if (isDemoMode) {
      const allBorclar = await demoDataManager.getBorclar();
      return allBorclar.filter(borc => borc.musteriId === musteriId);
    } else {
      try {
        const allBorclar = await getUserDataByType(userId, DATA_TYPES.BORC);
        return allBorclar.filter(borc => borc.musteriId === musteriId);
      } catch (error) {
        console.error('Müşteri borçları getirilemedi:', error);
        throw error;
      }
    }
  },

  async add(userId, borcData, isDemoMode) {
    if (isDemoMode) {
      return await createUserData(userId, DATA_TYPES.BORC, borcData, isDemoMode);
    } else {
      const docRef = await addDoc(collection(db, `users/${userId}/borclar`), {
        ...borcData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id };
    }
  },

  async update(userId, id, borcData, isDemoMode) {
    return await updateUserData(userId, id, DATA_TYPES.BORC, borcData, isDemoMode);
  },

  async delete(userId, id, isDemoMode) {
    return await deleteUserData(userId, id, DATA_TYPES.BORC, isDemoMode);
  },

  async deleteAll(userId) {
    try {
      const q = query(collection(db, `users/${userId}/borclar`));
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Tüm borçlar silinirken hata:', error);
      throw error;
    }
  }
};

// Kullanıcı profili yönetimi
export const userProfile = {
  async create(userId, userData, isDemoMode) {
    if (isDemoMode) {
      // Demo modunda kullanıcı profili oluşturmaya gerek yok
      return null;
    } else {
      try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
          uid: userId,
          email: userData.email,
          displayName: userData.displayName || '',
          deviceList: [],
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
      } catch (error) {
        console.error('Kullanıcı profili oluşturulamadı:', error);
        throw error;
      }
    }
  },

  async get(userId, isDemoMode) {
    if (isDemoMode) {
      // Demo modunda kullanıcı profili döndürmeye gerek yok
      return { uid: userId, displayName: 'Demo Kullanıcı', email: 'demo@example.com' };
    } else {
      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          return userSnap.data();
        }
        return null;
      } catch (error) {
        console.error('Kullanıcı profili getirilemedi:', error);
        throw error;
      }
    }
  },

  async update(userId, userData, isDemoMode) {
    if (isDemoMode) {
      // Demo modunda kullanıcı profili güncellemeye gerek yok
      return null;
    } else {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          ...userData,
          lastUpdated: serverTimestamp()
        });
      } catch (error) {
        console.error('Kullanıcı profili güncellenemedi:', error);
        throw error;
      }
    }
  }
};

