import { 
  ref, 
  push, 
  set, 
  update, 
  remove, 
  get, 
  serverTimestamp
} from 'firebase/database';
import { database } from './firebase';

// Basit Realtime Database kuralları için veri yapısı
const getUserPath = (userId) => `users/${userId}`;

// Müşteriler CRUD işlemleri
export const musteriler = {
  async getAll(userId) {
    try {
      // Demo mod kontrolü
      const isDemoMode = localStorage.getItem('demo_mode') === 'true' || userId === 'demo-user-123';
      if (isDemoMode) {
        console.log('Demo mod aktif, müşteriler demo veriden yükleniyor');
        return [];
      }

      const snapshot = await get(ref(database, `${getUserPath(userId)}/customers`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
      }
      return [];
    } catch (error) {
      console.error('Müşteriler getirilemedi:', error);
      return [];
    }
  },

  async getById(userId, id) {
    try {
      const snapshot = await get(ref(database, `${getUserPath(userId)}/customers/${id}`));
      if (snapshot.exists()) {
        return { id, ...snapshot.val() };
      }
      return null;
    } catch (error) {
      console.error('Müşteri getirilemedi:', error);
      return null;
    }
  },

  async add(userId, musteriData) {
    try {
      const newRef = push(ref(database, `${getUserPath(userId)}/customers`));
      await set(newRef, {
        ...musteriData,
        userId,
        lastUpdated: serverTimestamp()
      });
      return newRef.key;
    } catch (error) {
      console.error('Müşteri eklenemedi:', error);
      throw error;
    }
  },

  async update(userId, id, musteriData) {
    try {
      await update(ref(database, `${getUserPath(userId)}/customers/${id}`), {
        ...musteriData,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Müşteri güncellenemedi:', error);
      throw error;
    }
  },

  async delete(userId, id) {
    try {
      // Müşteriye ait emanet ve borç kayıtlarını bul ve sil
      const emanetSnapshot = await get(ref(database, `${getUserPath(userId)}/emanets`));
      const borcSnapshot = await get(ref(database, `${getUserPath(userId)}/debts`));
      
      let silinenEmanetSayisi = 0;
      let silinenBorcSayisi = 0;
      
      // Emanetleri kontrol et ve sil
      if (emanetSnapshot.exists()) {
        const emanetData = emanetSnapshot.val();
        const emanetKeys = Object.keys(emanetData).filter(key => emanetData[key].musteriId === id);
        
        for (const key of emanetKeys) {
          await remove(ref(database, `${getUserPath(userId)}/emanets/${key}`));
          silinenEmanetSayisi++;
        }
      }
      
      // Borçları kontrol et ve sil
      if (borcSnapshot.exists()) {
        const borcData = borcSnapshot.val();
        const borcKeys = Object.keys(borcData).filter(key => borcData[key].musteriId === id);
        
        for (const key of borcKeys) {
          await remove(ref(database, `${getUserPath(userId)}/debts/${key}`));
          silinenBorcSayisi++;
        }
      }
      
      // Müşteriyi sil
      await remove(ref(database, `${getUserPath(userId)}/customers/${id}`));
      
      console.log(`Müşteri ve ${silinenEmanetSayisi} emanet, ${silinenBorcSayisi} borç kaydı silindi`);
    } catch (error) {
      console.error('Müşteri silinemedi:', error);
      throw error;
    }
  }
};

// Emanet Türleri CRUD işlemleri
export const emanetTurleri = {
  async getAll(userId) {
    try {
      const snapshot = await get(ref(database, `${getUserPath(userId)}/emanetTypes`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
      }
      return [];
    } catch (error) {
      console.error('Emanet türleri getirilemedi:', error);
      return [];
    }
  },

  async add(userId, turData) {
    try {
      const newRef = push(ref(database, `${getUserPath(userId)}/emanetTypes`));
      await set(newRef, {
        ...turData,
        userId,
        lastUpdated: serverTimestamp()
      });
      return newRef.key;
    } catch (error) {
      console.error('Emanet türü eklenemedi:', error);
      throw error;
    }
  },

  async update(userId, id, turData) {
    try {
      await update(ref(database, `${getUserPath(userId)}/emanetTypes/${id}`), {
        ...turData,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Emanet türü güncellenemedi:', error);
      throw error;
    }
  },

  async delete(userId, id) {
    try {
      await remove(ref(database, `${getUserPath(userId)}/emanetTypes/${id}`));
    } catch (error) {
      console.error('Emanet türü silinemedi:', error);
      throw error;
    }
  }
};

// Emanetler CRUD işlemleri
export const emanetler = {
  async getAll(userId) {
    try {
      const snapshot = await get(ref(database, `${getUserPath(userId)}/emanets`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
      }
      return [];
    } catch (error) {
      console.error('Emanetler getirilemedi:', error);
      return [];
    }
  },

  async getByMusteriId(userId, musteriId) {
    try {
      const allEmanetler = await this.getAll(userId);
      return allEmanetler.filter(emanet => emanet.musteriId === musteriId);
    } catch (error) {
      console.error('Müşteri emanetleri getirilemedi:', error);
      return [];
    }
  },

  async add(userId, emanetData) {
    try {
      const newRef = push(ref(database, `${getUserPath(userId)}/emanets`));
      await set(newRef, {
        ...emanetData,
        userId,
        lastUpdated: serverTimestamp()
      });
      return newRef.key;
    } catch (error) {
      console.error('Emanet eklenemedi:', error);
      throw error;
    }
  },

  async update(userId, id, emanetData) {
    try {
      await update(ref(database, `${getUserPath(userId)}/emanets/${id}`), {
        ...emanetData,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Emanet güncellenemedi:', error);
      throw error;
    }
  },

  async delete(userId, id) {
    try {
      await remove(ref(database, `${getUserPath(userId)}/emanets/${id}`));
    } catch (error) {
      console.error('Emanet silinemedi:', error);
      throw error;
    }
  }
};

// Borçlar CRUD işlemleri
export const borclar = {
  async getAll(userId) {
    try {
      const snapshot = await get(ref(database, `${getUserPath(userId)}/debts`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
      }
      return [];
    } catch (error) {
      console.error('Borçlar getirilemedi:', error);
      return [];
    }
  },

  async getByMusteriId(userId, musteriId) {
    try {
      const allBorclar = await this.getAll(userId);
      return allBorclar.filter(borc => borc.musteriId === musteriId);
    } catch (error) {
      console.error('Müşteri borçları getirilemedi:', error);
      return [];
    }
  },

  async add(userId, borcData) {
    try {
      const newRef = push(ref(database, `${getUserPath(userId)}/debts`));
      await set(newRef, {
        ...borcData,
        userId,
        lastUpdated: serverTimestamp()
      });
      return newRef.key;
    } catch (error) {
      console.error('Borç eklenemedi:', error);
      throw error;
    }
  },

  async update(userId, id, borcData) {
    try {
      await update(ref(database, `${getUserPath(userId)}/debts/${id}`), {
        ...borcData,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Borç güncellenemedi:', error);
      throw error;
    }
  },

  async delete(userId, id) {
    try {
      await remove(ref(database, `${getUserPath(userId)}/debts/${id}`));
    } catch (error) {
      console.error('Borç silinemedi:', error);
      throw error;
    }
  }
};

// Kullanıcı profili yönetimi
export const userProfile = {
  async create(userId, userData) {
    try {
      await set(ref(database, `users/${userId}`), {
        uid: userId,
        email: userData.email,
        displayName: userData.displayName || '',
        deviceList: [],
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Kullanıcı profili oluşturulamadı:', error);
      throw error;
    }
  },

  async get(userId) {
    try {
      const snapshot = await get(ref(database, `users/${userId}`));
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error('Kullanıcı profili getirilemedi:', error);
      return null;
    }
  },

  async update(userId, userData) {
    try {
      await update(ref(database, `users/${userId}`), {
        ...userData,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Kullanıcı profili güncellenemedi:', error);
      throw error;
    }
  }
};

