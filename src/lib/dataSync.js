import { ref, set, onValue, push, remove, update } from 'firebase/database';
import { database } from './firebase';

class DataSyncManager {
  constructor() {
    this.listeners = new Map();
    this.currentUser = null;
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  // Kullanıcı verilerinin referansını al
  getUserDataRef(path = '') {
    if (!this.currentUser) {
      throw new Error('Kullanıcı giriş yapmamış');
    }
    return ref(database, `users/${this.currentUser.uid}${path ? '/' + path : ''}`);
  }

  // Veri kaydet
  async saveData(path, data) {
    try {
      const dataRef = this.getUserDataRef(path);
      await set(dataRef, data);
      console.log(`Veri kaydedildi: ${path}`);
    } catch (error) {
      console.error('Veri kaydetme hatası:', error);
      throw error;
    }
  }

  // Veri güncelle
  async updateData(path, updates) {
    try {
      const dataRef = this.getUserDataRef(path);
      await update(dataRef, updates);
      console.log(`Veri güncellendi: ${path}`);
    } catch (error) {
      console.error('Veri güncelleme hatası:', error);
      throw error;
    }
  }

  // Yeni veri ekle (push)
  async addData(path, data) {
    try {
      const dataRef = this.getUserDataRef(path);
      const newRef = push(dataRef);
      await set(newRef, data);
      console.log(`Yeni veri eklendi: ${path}`);
      return newRef.key;
    } catch (error) {
      console.error('Veri ekleme hatası:', error);
      throw error;
    }
  }

  // Veri sil
  async deleteData(path) {
    try {
      const dataRef = this.getUserDataRef(path);
      await remove(dataRef);
      console.log(`Veri silindi: ${path}`);
    } catch (error) {
      console.error('Veri silme hatası:', error);
      throw error;
    }
  }

  // Veri dinle (gerçek zamanlı)
  listenToData(path, callback) {
    if (!this.currentUser) {
      console.warn('Kullanıcı giriş yapmamış, veri dinlenemiyor');
      return;
    }

    const dataRef = this.getUserDataRef(path);
    const listenerId = `${this.currentUser.uid}_${path}`;

    // Önceki listener'ı temizle
    this.stopListening(path);

    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      callback(data);
    }, (error) => {
      console.error('Veri dinleme hatası:', error);
    });

    this.listeners.set(listenerId, unsubscribe);
    console.log(`Veri dinleniyor: ${path}`);

    return () => this.stopListening(path);
  }

  // Veri dinlemeyi durdur
  stopListening(path) {
    if (!this.currentUser) return;

    const listenerId = `${this.currentUser.uid}_${path}`;
    const unsubscribe = this.listeners.get(listenerId);
    
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerId);
      console.log(`Veri dinleme durduruldu: ${path}`);
    }
  }

  // Tüm listener'ları temizle
  clearAllListeners() {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
    console.log('Tüm veri dinleyicileri temizlendi');
  }

  // Müşteri verilerini senkronize et
  async syncCustomers(customers) {
    return this.saveData('customers', customers);
  }

  // Emanet verilerini senkronize et
  async syncEmanets(emanets) {
    return this.saveData('emanets', emanets);
  }

  // Borç verilerini senkronize et
  async syncDebts(debts) {
    return this.saveData('debts', debts);
  }

  // Emanet türlerini senkronize et
  async syncEmanetTypes(types) {
    return this.saveData('emanetTypes', types);
  }

  // Ayarları senkronize et
  async syncSettings(settings) {
    return this.saveData('settings', settings);
  }

  // Geri dönüşüm kutusunu senkronize et
  async syncTrash(trash) {
    return this.saveData('trash', trash);
  }

  // Müşteri verilerini dinle
  listenToCustomers(callback) {
    return this.listenToData('customers', callback);
  }

  // Emanet verilerini dinle
  listenToEmanets(callback) {
    return this.listenToData('emanets', callback);
  }

  // Borç verilerini dinle
  listenToDebts(callback) {
    return this.listenToData('debts', callback);
  }

  // Emanet türlerini dinle
  listenToEmanetTypes(callback) {
    return this.listenToData('emanetTypes', callback);
  }

  // Ayarları dinle
  listenToSettings(callback) {
    return this.listenToData('settings', callback);
  }

  // Geri dönüşüm kutusunu dinle
  listenToTrash(callback) {
    return this.listenToData('trash', callback);
  }

  // Tüm verileri senkronize et
  async syncAllData(data) {
    try {
      const promises = [];
      
      if (data.customers) {
        promises.push(this.syncCustomers(data.customers));
      }
      
      if (data.emanets) {
        promises.push(this.syncEmanets(data.emanets));
      }
      
      if (data.debts) {
        promises.push(this.syncDebts(data.debts));
      }
      
      if (data.emanetTypes) {
        promises.push(this.syncEmanetTypes(data.emanetTypes));
      }
      
      if (data.settings) {
        promises.push(this.syncSettings(data.settings));
      }

      if (data.trash) {
        promises.push(this.syncTrash(data.trash));
      }

      await Promise.all(promises);
      console.log('Tüm veriler senkronize edildi');
    } catch (error) {
      console.error('Veri senkronizasyon hatası:', error);
      throw error;
    }
  }

  // Tüm verileri dinle
  listenToAllData(callbacks) {
    const unsubscribes = [];

    if (callbacks.onCustomersChange) {
      unsubscribes.push(this.listenToCustomers(callbacks.onCustomersChange));
    }

    if (callbacks.onEmanetsChange) {
      unsubscribes.push(this.listenToEmanets(callbacks.onEmanetsChange));
    }

    if (callbacks.onDebtsChange) {
      unsubscribes.push(this.listenToDebts(callbacks.onDebtsChange));
    }

    if (callbacks.onEmanetTypesChange) {
      unsubscribes.push(this.listenToEmanetTypes(callbacks.onEmanetTypesChange));
    }

    if (callbacks.onSettingsChange) {
      unsubscribes.push(this.listenToSettings(callbacks.onSettingsChange));
    }

    if (callbacks.onTrashChange) {
      unsubscribes.push(this.listenToTrash(callbacks.onTrashChange));
    }

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe && unsubscribe());
    };
  }
}

export const dataSyncManager = new DataSyncManager();
export default dataSyncManager;

