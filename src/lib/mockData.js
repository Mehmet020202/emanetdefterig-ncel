// Demo için mock veri

export const mockMusteriler = [
  {
    id: '1',
    sira: 1,
    ad: 'Abdullah Tarik',
    soyad: 'Altuğ',
    telefon: '0555 123 45 67',
    not: 'Güvenilir müşteri',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const mockEmanetTurleri = [
  {
    id: '1',
    isim: '22 Ayar Bilezik',
    takipSekli: 'gram',
    sembol: '🥇',
    renk: '#FFD700',
    aciklama: '22 ayar bilezik takılar',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    isim: 'Ata Lira',
    takipSekli: 'adet',
    sembol: '🪙',
    renk: '#FFA500',
    aciklama: 'Ata lira koleksiyonu',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    isim: 'Türk Lirası',
    takipSekli: 'TL',
    sembol: '💰',
    renk: '#32CD32',
    aciklama: 'Nakit para',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const mockEmanetler = [
  {
    id: '1',
    musteriId: '1',
    turId: '1',
    islemTipi: 'emanet-birak',
    miktar: 150.50,
    aciklama: '22 ayar bilezik emanet',
    tarih: new Date('2024-01-15T10:30:00'),
    createdAt: new Date('2024-01-15T10:30:00')
  },
  {
    id: '2',
    musteriId: '1',
    turId: '2',
    islemTipi: 'emanet-birak',
    miktar: 5,
    aciklama: 'Ata lira koleksiyonu',
    tarih: new Date('2024-01-20T14:15:00'),
    createdAt: new Date('2024-01-20T14:15:00')
  },
  {
    id: '3',
    musteriId: '1',
    turId: '1',
    islemTipi: 'emanet-birak',
    miktar: 25.75,
    aciklama: 'Altın yüzük',
    tarih: new Date('2024-02-01T09:45:00'),
    createdAt: new Date('2024-02-01T09:45:00')
  },
  {
    id: '4',
    musteriId: '1',
    turId: '1',
    islemTipi: 'emanet-al',
    miktar: 25.75,
    aciklama: 'Altın yüzük iade',
    tarih: new Date('2024-02-10T16:20:00'),
    createdAt: new Date('2024-02-10T16:20:00')
  }
];

export const mockBorclar = [
  {
    id: '1',
    musteriId: '1',
    turId: '1',
    islemTipi: 'borc-ver',
    miktar: 100.25,
    aciklama: '22 ayar bilezik borç',
    tarih: new Date('2024-01-25T11:00:00'),
    createdAt: new Date('2024-01-25T11:00:00')
  },
  {
    id: '2',
    musteriId: '1',
    turId: '3',
    islemTipi: 'borc-ver',
    miktar: 5000,
    aciklama: 'Nakit borç',
    tarih: new Date('2024-02-05T13:30:00'),
    createdAt: new Date('2024-02-05T13:30:00')
  }
];

