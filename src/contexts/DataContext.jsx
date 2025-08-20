import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dataSyncManager } from '@/lib/dataSync';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [emanets, setEmanets] = useState([]);
  const [debts, setDebts] = useState([]);
  const [emanetTypes, setEmanetTypes] = useState([]);
  const [settings, setSettings] = useState({});
  const [trash, setTrash] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Kullanıcı değiştiğinde verileri yükle
  useEffect(() => {
    if (!user) {
      setCustomers([]);
      setEmanets([]);
      setDebts([]);
      setEmanetTypes([]);
      setSettings({});
      setTrash([]);
      setLoading(false);
      dataSyncManager.clearAllListeners();
      return;
    }

    // Firebase kullanıcısını ayarla
    dataSyncManager.setCurrentUser(user);

    // Gerçek zamanlı veri dinleyicilerini başlat
    const unsubscribe = dataSyncManager.listenToAllData({
      onCustomersChange: (data) => {
        setCustomers(data ? Object.values(data) : []);
      },
      onEmanetsChange: (data) => {
        setEmanets(data ? Object.values(data) : []);
      },
      onDebtsChange: (data) => {
        setDebts(data ? Object.values(data) : []);
      },
      onEmanetTypesChange: (data) => {
        setEmanetTypes(data ? Object.values(data) : []);
      },
      onSettingsChange: (data) => {
        setSettings(data || {});
      },
      onTrashChange: (data) => {
        setTrash(data ? Object.values(data) : []);
      }
    });

    setLoading(false);

    // Cleanup function
    return () => {
      unsubscribe();
      dataSyncManager.clearAllListeners();
    };
  }, [user]);

  // Geri dönüşüm kutusu işlemleri
  const moveToTrash = async (item, type) => {
    try {
      setSyncing(true);
      const trashItem = {
        id: Date.now().toString(),
        originalId: item.id,
        type: type, // 'customer', 'emanet', 'debt', 'emanetType'
        data: item,
        deletedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 gün
      };

      const trashObj = {};
      [...trash, trashItem].forEach(t => {
        trashObj[t.id] = t;
      });
      await dataSyncManager.syncTrash(trashObj);
    } catch (error) {
      console.error('Çöp kutusuna taşıma hatası:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const restoreFromTrash = async (trashItemId) => {
    try {
      setSyncing(true);
      const item = trash.find(t => t.id === trashItemId);
      if (!item) return;

      // Geri dönüşüm kutusundan kaldır
      const updatedTrash = trash.filter(t => t.id !== trashItemId);
      const trashObj = {};
      updatedTrash.forEach(t => {
        trashObj[t.id] = t;
      });
      await dataSyncManager.syncTrash(trashObj);

      // Orijinal veriyi geri yükle
      const originalData = { ...item.data, id: item.originalId };
      
      switch (item.type) {
        case 'customer':
          await addCustomer(originalData);
          break;
        case 'emanet':
          await addEmanet(originalData);
          break;
        case 'debt':
          await addDebt(originalData);
          break;
        case 'emanetType':
          await addEmanetType(originalData);
          break;
      }
    } catch (error) {
      console.error('Geri yükleme hatası:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const permanentlyDelete = async (trashItemId) => {
    try {
      setSyncing(true);
      const updatedTrash = trash.filter(t => t.id !== trashItemId);
      const trashObj = {};
      updatedTrash.forEach(t => {
        trashObj[t.id] = t;
      });
      await dataSyncManager.syncTrash(trashObj);
    } catch (error) {
      console.error('Kalıcı silme hatası:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const clearExpiredTrash = async () => {
    try {
      setSyncing(true);
      const now = new Date();
      const validTrash = trash.filter(t => new Date(t.expiresAt) > now);
      const trashObj = {};
      validTrash.forEach(t => {
        trashObj[t.id] = t;
      });
      await dataSyncManager.syncTrash(trashObj);
    } catch (error) {
      console.error('Süresi dolmuş öğeleri temizleme hatası:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  // Müşteri işlemleri
  const addCustomer = async (customer) => {
    try {
      setSyncing(true);
      
      // Aynı ad ve soyad ile müşteri var mı kontrol et
      const existingCustomer = customers.find(c => 
        c.ad.toLowerCase().trim() === customer.ad.toLowerCase().trim() &&
        c.soyad.toLowerCase().trim() === customer.soyad.toLowerCase().trim()
      );
      
      if (existingCustomer) {
        throw new Error('Bu ad ve soyad ile bir müşteri zaten mevcut!');
      }
      
      const newCustomer = {
        ...customer,
        id: customer.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const customersObj = {};
      [...customers, newCustomer].forEach(c => {
        customersObj[c.id] = c;
      });
      await dataSyncManager.syncCustomers(customersObj);
      
      return newCustomer;
    } catch (error) {
      console.error('Müşteri ekleme hatası:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const updateCustomer = async (customerId, updates) => {
    try {
      setSyncing(true);
      const updatedCustomer = {
        ...customers.find(c => c.id === customerId),
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const customersObj = {};
      customers.map(c => 
        c.id === customerId ? updatedCustomer : c
      ).forEach(c => {
        customersObj[c.id] = c;
      });
      await dataSyncManager.syncCustomers(customersObj);
    } catch (error) {
      console.error('Müşteri güncelleme hatası:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const deleteCustomer = async (customerId) => {
    try {
      setSyncing(true);
      
      // Müşteriyi bul ve geri dönüşüm kutusuna taşı
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        await moveToTrash(customer, 'customer');
      }
      
      // Müşteriye ait emanet ve borç kayıtlarını da geri dönüşüm kutusuna taşı
      const customerEmanets = emanets.filter(e => e.musteriId === customerId);
      const customerDebts = debts.filter(d => d.musteriId === customerId);
      
      for (const emanet of customerEmanets) {
        await moveToTrash(emanet, 'emanet');
      }
      
      for (const debt of customerDebts) {
        await moveToTrash(debt, 'debt');
      }
      
      // Müşteriyi sil
      const customersObj = {};
      customers.filter(c => c.id !== customerId).forEach(c => {
        customersObj[c.id] = c;
      });
      await dataSyncManager.syncCustomers(customersObj);
      
      // Emanet ve borç kayıtlarını güncelle
      const emanetsObj = {};
      emanets.filter(e => e.musteriId !== customerId).forEach(e => {
        emanetsObj[e.id] = e;
      });
      await dataSyncManager.syncEmanets(emanetsObj);
      
      const debtsObj = {};
      debts.filter(d => d.musteriId !== customerId).forEach(d => {
        debtsObj[d.id] = d;
      });
      await dataSyncManager.syncDebts(debtsObj);
    } catch (error) {
      console.error('Müşteri silme hatası:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  // Emanet işlemleri
  const addEmanet = async (emanet) => {
    try {
      setSyncing(true);
      const newEmanet = {
        ...emanet,
        id: emanet.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const emanetsObj = {};
      [...emanets, newEmanet].forEach(e => {
        emanetsObj[e.id] = e;
      });
      await dataSyncManager.syncEmanets(emanetsObj);
    } catch (error) {
      console.error('Emanet ekleme hatası:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const updateEmanet = async (emanetId, updates) => {
    try {
      setSyncing(true);
      const updatedEmanet = {
        ...emanets.find(e => e.id === emanetId),
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const emanetsObj = {};
      emanets.map(e => 
        e.id === emanetId ? updatedEmanet : e
      ).forEach(e => {
        emanetsObj[e.id] = e;
      });
      await dataSyncManager.syncEmanets(emanetsObj);
    } catch (error) {
      console.error('Emanet güncelleme hatası:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const deleteEmanet = async (emanetId) => {
    try {
      setSyncing(true);
      
      // Emaneti bul ve geri dönüşüm kutusuna taşı
      const emanet = emanets.find(e => e.id === emanetId);
      if (emanet) {
        await moveToTrash(emanet, 'emanet');
      }
      
      const emanetsObj = {};
      emanets.filter(e => e.id !== emanetId).forEach(e => {
        emanetsObj[e.id] = e;
      });
      await dataSyncManager.syncEmanets(emanetsObj);
    } catch (error) {
      console.error('Emanet silme hatası:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  // Borç işlemleri
  const addDebt = async (debt) => {
    try {
      setSyncing(true);
      const newDebt = {
        ...debt,
        id: debt.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const debtsObj = {};
      [...debts, newDebt].forEach(d => {
        debtsObj[d.id] = d;
      });
      await dataSyncManager.syncDebts(debtsObj);
    } catch (error) {
      console.error('Borç ekleme hatası:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const updateDebt = async (debtId, updates) => {
    try {
      setSyncing(true);
      const updatedDebt = {
        ...debts.find(d => d.id === debtId),
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const debtsObj = {};
      debts.map(d => 
        d.id === debtId ? updatedDebt : d
      ).forEach(d => {
        debtsObj[d.id] = d;
      });
      await dataSyncManager.syncDebts(debtsObj);
    } catch (error) {
      console.error('Borç güncelleme hatası:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const deleteDebt = async (debtId) => {
    try {
      setSyncing(true);
      
      // Borcu bul ve geri dönüşüm kutusuna taşı
      const debt = debts.find(d => d.id === debtId);
      if (debt) {
        await moveToTrash(debt, 'debt');
      }
      
      const debtsObj = {};
      debts.filter(d => d.id !== debtId).forEach(d => {
        debtsObj[d.id] = d;
      });
      await dataSyncManager.syncDebts(debtsObj);
    } catch (error) {
      console.error('Borç silme hatası:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  // Emanet türü işlemleri
  const addEmanetType = async (emanetType) => {
    try {
      setSyncing(true);
      const newEmanetType = {
        ...emanetType,
        id: emanetType.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const emanetTypesObj = {};
      [...emanetTypes, newEmanetType].forEach(t => {
        emanetTypesObj[t.id] = t;
      });
      await dataSyncManager.syncEmanetTypes(emanetTypesObj);
    } catch (error) {
      console.error('Emanet türü ekleme hatası:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const updateEmanetType = async (emanetTypeId, updates) => {
    try {
      setSyncing(true);
      const updatedEmanetType = {
        ...emanetTypes.find(t => t.id === emanetTypeId),
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const emanetTypesObj = {};
      emanetTypes.map(t => 
        t.id === emanetTypeId ? updatedEmanetType : t
      ).forEach(t => {
        emanetTypesObj[t.id] = t;
      });
      await dataSyncManager.syncEmanetTypes(emanetTypesObj);
    } catch (error) {
      console.error('Emanet türü güncelleme hatası:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const deleteEmanetType = async (emanetTypeId) => {
    try {
      setSyncing(true);
      
      // Emanet türünü bul ve geri dönüşüm kutusuna taşı
      const emanetType = emanetTypes.find(t => t.id === emanetTypeId);
      if (emanetType) {
        await moveToTrash(emanetType, 'emanetType');
      }
      
      const emanetTypesObj = {};
      emanetTypes.filter(t => t.id !== emanetTypeId).forEach(t => {
        emanetTypesObj[t.id] = t;
      });
      await dataSyncManager.syncEmanetTypes(emanetTypesObj);
    } catch (error) {
      console.error('Emanet türü silme hatası:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  // Ayarlar işlemleri
  const updateSettings = async (newSettings) => {
    try {
      setSyncing(true);
      const updatedSettings = {
        ...settings,
        ...newSettings,
        updatedAt: new Date().toISOString()
      };
      await dataSyncManager.syncSettings(updatedSettings);
    } catch (error) {
      console.error('Ayar güncelleme hatası:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const value = {
    customers,
    emanets,
    debts,
    emanetTypes,
    settings,
    trash,
    loading,
    syncing,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addEmanet,
    updateEmanet,
    deleteEmanet,
    addDebt,
    updateDebt,
    deleteDebt,
    addEmanetType,
    updateEmanetType,
    deleteEmanetType,
    updateSettings,
    restoreFromTrash,
    permanentlyDelete,
    clearExpiredTrash
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

