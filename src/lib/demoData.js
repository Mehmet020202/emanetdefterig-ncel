// Demo veri sistemi - Firebase bağımlılığı olmadan test için
export class DemoDataManager {
  constructor() {
    this.storageKey = 'emanet_defteri_demo_data';
    console.log('DemoDataManager constructor çağrıldı');
    this.initializeData();
  }

  initializeData() {
    const existingData = localStorage.getItem(this.storageKey);
    console.log('Demo data initialize ediliyor, mevcut data:', existingData ? 'var' : 'yok');
    if (!existingData) {
      console.log('İlk demo data oluşturuluyor...');
      const initialData = {
        musteriler: [
          {
            id: 'demo-musteri-1',
            ad: 'Ahmet',
            soyad: 'Yılmaz',
            telefon: '0532 123 4567',
            not: 'Güvenilir müşteri',
            sira: 1,
            createdAt: new Date().toISOString()
          },
          {
            id: 'demo-musteri-2',
            ad: 'Fatma',
            soyad: 'Demir',
            telefon: '0533 987 6543',
            not: 'Düzenli müşteri',
            sira: 2,
            createdAt: new Date().toISOString()
          },
          {
            id: 'demo-musteri-3',
            ad: 'Mehmet',
            soyad: 'Kaya',
            telefon: '0534 555 1234',
            not: 'Yeni müşteri',
            sira: 3,
            createdAt: new Date().toISOString()
          }
        ],
        emanetler: [
          {
            id: 'demo-emanet-1',
            musteriId: 'demo-musteri-1',
            turId: 'demo-tur-1',
            miktar: 500.0,
            islemTipi: 'emanet-birak',
            aciklama: '22 ayar bilezik emanet',
            tarih: new Date().toISOString(),
            createdAt: new Date().toISOString()
          },
          {
            id: 'demo-emanet-2',
            musteriId: 'demo-musteri-2',
            turId: 'demo-tur-2',
            miktar: 25.0,
            islemTipi: 'emanet-birak',
            aciklama: 'Gümüş emanet',
            tarih: new Date().toISOString(),
            createdAt: new Date().toISOString()
          },
          {
            id: 'demo-emanet-3',
            musteriId: 'demo-musteri-1',
            turId: 'demo-tur-1',
            miktar: 150.0,
            islemTipi: 'emanet-al',
            aciklama: 'Altın geri alındı',
            tarih: new Date().toISOString(),
            createdAt: new Date().toISOString()
          },
          {
            id: 'demo-emanet-4',
            musteriId: 'demo-musteri-3',
            turId: 'demo-tur-3',
            miktar: 5000.0,
            islemTipi: 'emanet-birak',
            aciklama: 'Dolar emanet',
            tarih: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }
        ],
        borclar: [
          {
            id: 'demo-borc-1',
            musteriId: 'demo-musteri-2',
            turId: 'demo-tur-1',
            miktar: 150.0,
            islemTipi: 'borc-ver',
            aciklama: '22 ayar bilezik borç',
            tarih: new Date().toISOString(),
            createdAt: new Date().toISOString()
          },
          {
            id: 'demo-borc-2',
            musteriId: 'demo-musteri-3',
            turId: 'demo-tur-3',
            miktar: 3500.0,
            islemTipi: 'borc-ver',
            aciklama: 'Dolar borç',
            tarih: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }
        ],
        emanetTurleri: [
          {
            id: 'demo-tur-1',
            isim: '22 Ayar Bilezik',
            sembol: 'Au',
            takipSekli: 'gram',
            createdAt: new Date().toISOString()
          },
          {
            id: 'demo-tur-2', 
            isim: 'Gümüş',
            sembol: 'Ag',
            takipSekli: 'gram',
            createdAt: new Date().toISOString()
          },
          {
            id: 'demo-tur-3',
            isim: 'Nakit TL',
            sembol: '₺',
            takipSekli: 'tl',
            createdAt: new Date().toISOString()
          }
        ]
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
      console.log('Demo data başarıyla oluşturuldu ve kaydedildi');
    } else {
      console.log('Mevcut demo data kullanılıyor');
    }
  }

  getData() {
    const data = localStorage.getItem(this.storageKey);
    console.log('getData çağrıldı, localStorage data:', data ? 'var' : 'yok');
    if (!data) {
      console.log('Data yok, initialize ediliyor...');
      this.initializeData();
      const newData = localStorage.getItem(this.storageKey);
      console.log('Initialize sonrası data:', newData ? 'var' : 'yok');
      return JSON.parse(newData);
    }
    return JSON.parse(data);
  }

  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // Müşteri işlemleri
  async getMusteriler() {
    const data = this.getData();
    console.log('Demo musteriler getiriliyor:', data?.musteriler?.length || 0);
    return data?.musteriler || [];
  }

  async addMusteri(musteri) {
    const data = this.getData();
    const newMusteri = {
      id: 'demo-musteri-' + Date.now(),
      ...musteri,
      createdAt: new Date().toISOString()
    };
    if (!data.musteriler) {
      data.musteriler = [];
    }
    data.musteriler.push(newMusteri);
    this.saveData(data);
    return newMusteri;
  }

  async updateMusteri(id, updates) {
    const data = this.getData();
    const index = data.musteriler.findIndex(m => m.id === id);
    if (index !== -1) {
      data.musteriler[index] = { ...data.musteriler[index], ...updates };
      this.saveData(data);
      return data.musteriler[index];
    }
    return null;
  }

  async deleteMusteri(id) {
    console.log('Demo deleteMusteri çağrıldı:', id);
    const data = this.getData();
    console.log('Mevcut müşteri sayısı:', data.musteriler?.length || 0);
    
    // Müşteriyi sil
    data.musteriler = data.musteriler.filter(m => m.id !== id);
    console.log('Silme sonrası müşteri sayısı:', data.musteriler?.length || 0);
    
    // Müşteriye ait emanet kayıtlarını sil
    const mevcutEmanetSayisi = data.emanetler?.length || 0;
    data.emanetler = data.emanetler.filter(e => e.musteriId !== id);
    console.log('Silinen emanet sayısı:', mevcutEmanetSayisi - (data.emanetler?.length || 0));
    
    // Müşteriye ait borç kayıtlarını sil
    const mevcutBorcSayisi = data.borclar?.length || 0;
    data.borclar = data.borclar.filter(b => b.musteriId !== id);
    console.log('Silinen borç sayısı:', mevcutBorcSayisi - (data.borclar?.length || 0));
    
    this.saveData(data);
    console.log('Müşteri ve ilgili kayıtlar başarıyla silindi');
    return true;
  }

  async updateEmanetTuru(id, updates) {
    const data = this.getData();
    const index = data.emanetTurleri.findIndex(t => t.id === id);
    if (index !== -1) {
      data.emanetTurleri[index] = { ...data.emanetTurleri[index], ...updates };
      this.saveData(data);
      return data.emanetTurleri[index];
    }
    return null;
  }

  async deleteEmanetTuru(id) {
    const data = this.getData();
    data.emanetTurleri = data.emanetTurleri.filter(t => t.id !== id);
    this.saveData(data);
    return true;
  }

  async updateEmanet(id, updates) {
    const data = this.getData();
    const index = data.emanetler.findIndex(e => e.id === id);
    if (index !== -1) {
      data.emanetler[index] = { ...data.emanetler[index], ...updates };
      this.saveData(data);
      return data.emanetler[index];
    }
    return null;
  }

  async deleteEmanet(id) {
    console.log('Demo deleteEmanet çağrıldı:', id);
    const data = this.getData();
    console.log('Mevcut emanet sayısı:', data.emanetler?.length || 0);
    data.emanetler = data.emanetler.filter(e => e.id !== id);
    console.log('Silme sonrası emanet sayısı:', data.emanetler?.length || 0);
    this.saveData(data);
    console.log('Emanet başarıyla silindi');
    return true;
  }

  async updateBorc(id, updates) {
    const data = this.getData();
    const index = data.borclar.findIndex(b => b.id === id);
    if (index !== -1) {
      data.borclar[index] = { ...data.borclar[index], ...updates };
      this.saveData(data);
      return data.borclar[index];
    }
    return null;
  }

  async deleteBorc(id) {
    console.log('Demo deleteBorc çağrıldı:', id);
    const data = this.getData();
    console.log('Mevcut borç sayısı:', data.borclar?.length || 0);
    data.borclar = data.borclar.filter(b => b.id !== id);
    console.log('Silme sonrası borç sayısı:', data.borclar?.length || 0);
    this.saveData(data);
    console.log('Borç başarıyla silindi');
    return true;
  }

  // Emanet işlemleri
  async getEmanetler() {
    const data = this.getData();
    console.log('Demo emanetler getiriliyor:', data?.emanetler?.length || 0);
    return data.emanetler || [];
  }

  async addEmanet(emanet) {
    const data = this.getData();
    const newEmanet = {
      id: 'demo-emanet-' + Date.now(),
      ...emanet,
      createdAt: new Date().toISOString()
    };
    if (!data.emanetler) {
      data.emanetler = [];
    }
    data.emanetler.push(newEmanet);
    this.saveData(data);
    return newEmanet;
  }

  // Borç işlemleri
  async getBorclar() {
    const data = this.getData();
    console.log('Demo borclar getiriliyor:', data?.borclar?.length || 0);
    return data.borclar || [];
  }

  async addBorc(borc) {
    const data = this.getData();
    const newBorc = {
      id: 'demo-borc-' + Date.now(),
      ...borc,
      createdAt: new Date().toISOString()
    };
    if (!data.borclar) {
      data.borclar = [];
    }
    data.borclar.push(newBorc);
    this.saveData(data);
    return newBorc;
  }

  // Emanet türleri işlemleri
  async getEmanetTurleri() {
    const data = this.getData();
    console.log('Demo emanet turleri getiriliyor:', data?.emanetTurleri?.length || 0);
    return data.emanetTurleri || [];
  }

  async addEmanetTuru(tur) {
    const data = this.getData();
    const newTur = {
      id: 'demo-tur-' + Date.now(),
      ...tur,
      createdAt: new Date().toISOString()
    };
    if (!data.emanetTurleri) {
      data.emanetTurleri = [];
    }
    data.emanetTurleri.push(newTur);
    this.saveData(data);
    return newTur;
  }

  // Veri temizleme
  clearAllData() {
    localStorage.removeItem(this.storageKey);
    this.initializeData();
  }

  // Demo data'yı tamamen temizle (sıfırla)
  resetData() {
    localStorage.removeItem(this.storageKey);
    this.initializeData();
    console.log('Demo data sıfırlandı');
  }

  // Export/Import işlemleri
  exportData() {
    return this.getData();
  }

  importData(importedData) {
    this.saveData(importedData);
  }
}

// Global demo data manager instance
export const demoDataManager = new DemoDataManager();

