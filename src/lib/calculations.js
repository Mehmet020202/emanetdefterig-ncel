// Hesaplama yardımcı fonksiyonları

// Müşteri bazında emanet toplamını hesapla
export const calculateMusteriEmanetToplami = (emanetler, musteriId) => {
  const musteriEmanetleri = emanetler.filter(e => e.musteriId === musteriId);
  const toplamlar = {};

  musteriEmanetleri.forEach(emanet => {
    const turId = emanet.turId;
    if (!toplamlar[turId]) {
      toplamlar[turId] = 0;
    }

    if (emanet.islemTipi === 'emanet-birak') {
      toplamlar[turId] += parseFloat(emanet.miktar || 0);
    } else if (emanet.islemTipi === 'emanet-al') {
      toplamlar[turId] -= parseFloat(emanet.miktar || 0);
    }
  });

  // Negatif değerleri sıfırla
  Object.keys(toplamlar).forEach(turId => {
    if (toplamlar[turId] < 0) {
      toplamlar[turId] = 0;
    }
  });

  return toplamlar;
};

// Müşteri bazında borç toplamını hesapla
export const calculateMusteriBorcToplami = (borclar, musteriId) => {
  const musteriBorclari = borclar.filter(b => b.musteriId === musteriId);
  const toplamlar = {};

  musteriBorclari.forEach(borc => {
    const turId = borc.turId;
    if (!toplamlar[turId]) {
      toplamlar[turId] = 0;
    }

    if (borc.islemTipi === 'borc-ver') {
      toplamlar[turId] += parseFloat(borc.miktar || 0);
    } else if (borc.islemTipi === 'borc-ode') {
      toplamlar[turId] -= parseFloat(borc.miktar || 0);
    }
  });

  // Negatif değerleri sıfırla
  Object.keys(toplamlar).forEach(turId => {
    if (toplamlar[turId] < 0) {
      toplamlar[turId] = 0;
    }
  });

  return toplamlar;
};

// Net bakiye hesaplama (emanet - borç)
export const calculateNetBakiye = (emanetler, borclar, musteriId = null) => {
  try {
    if (!emanetler || !borclar) {
      return {};
    }

    let filteredEmanetler = emanetler;
    let filteredBorclar = borclar;
    
    if (musteriId) {
      filteredEmanetler = emanetler.filter(e => e && e.musteriId === musteriId);
      filteredBorclar = borclar.filter(b => b && b.musteriId === musteriId);
    }
    
    const netBakiye = {};
    
    // Emanet toplamlarını hesapla
    filteredEmanetler.forEach(emanet => {
      if (!emanet || !emanet.turId) return;
      
      const turId = emanet.turId;
      if (!netBakiye[turId]) {
        netBakiye[turId] = 0;
      }
      
      const miktar = parseFloat(emanet.miktar || 0);
      if (isNaN(miktar)) return;
      
      if (emanet.islemTipi === 'emanet-birak') {
        netBakiye[turId] += miktar;
      } else if (emanet.islemTipi === 'emanet-al') {
        netBakiye[turId] -= miktar;
      }
    });
    
    // Borç toplamlarını çıkar
    filteredBorclar.forEach(borc => {
      if (!borc || !borc.turId) return;
      
      const turId = borc.turId;
      if (!netBakiye[turId]) {
        netBakiye[turId] = 0;
      }
      
      const miktar = parseFloat(borc.miktar || 0);
      if (isNaN(miktar)) return;
      
      if (borc.islemTipi === 'borc-ver') {
        netBakiye[turId] -= miktar;
      } else if (borc.islemTipi === 'borc-ode') {
        netBakiye[turId] += miktar;
      }
    });
    
    // Sadece sıfır olmayan değerleri döndür
    const filteredNetBakiye = {};
    Object.keys(netBakiye).forEach(turId => {
      if (netBakiye[turId] !== 0) {
        filteredNetBakiye[turId] = netBakiye[turId];
      }
    });
    
    return filteredNetBakiye;
  } catch (error) {
    console.error('Net bakiye hesaplama hatası:', error);
    return {};
  }
};

// Müşteri bazında net bakiye durumu
export const getMusteriNetBakiyeDurumu = (emanetler, borclar, musteriId) => {
  try {
    if (!emanetler || !borclar || !musteriId) {
      return {};
    }

    const netBakiye = calculateNetBakiye(emanetler, borclar, musteriId);
    const durum = {};
    
    Object.keys(netBakiye).forEach(turId => {
      try {
        const miktar = netBakiye[turId];
        if (miktar > 0) {
          durum[turId] = {
            tip: 'alacak', // Müşteriden alacağımız var
            miktar: miktar,
            renk: 'green'
          };
        } else if (miktar < 0) {
          durum[turId] = {
            tip: 'borc', // Müşteriye borcumuz var
            miktar: Math.abs(miktar),
            renk: 'red'
          };
        }
      } catch (error) {
        console.error('Tür durumu hesaplama hatası:', error);
      }
    });
    
    return durum;
  } catch (error) {
    console.error('Müşteri net bakiye durumu hesaplama hatası:', error);
    return {};
  }
};

// Genel emanet toplamını hesapla
export const calculateGenelEmanetToplami = (emanetler) => {
  const toplamlar = {};

  emanetler.forEach(emanet => {
    const turId = emanet.turId;
    if (!toplamlar[turId]) {
      toplamlar[turId] = 0;
    }

    if (emanet.islemTipi === 'emanet-birak') {
      toplamlar[turId] += parseFloat(emanet.miktar || 0);
    } else if (emanet.islemTipi === 'emanet-al') {
      toplamlar[turId] -= parseFloat(emanet.miktar || 0);
    }
  });

  // Negatif değerleri sıfırla
  Object.keys(toplamlar).forEach(turId => {
    if (toplamlar[turId] < 0) {
      toplamlar[turId] = 0;
    }
  });

  return toplamlar;
};

// Genel borç toplamını hesapla
export const calculateGenelBorcToplami = (borclar) => {
  const toplamlar = {};

  borclar.forEach(borc => {
    const turId = borc.turId;
    if (!toplamlar[turId]) {
      toplamlar[turId] = 0;
    }

    if (borc.islemTipi === 'borc-ver') {
      toplamlar[turId] += parseFloat(borc.miktar || 0);
    } else if (borc.islemTipi === 'borc-ode') {
      toplamlar[turId] -= parseFloat(borc.miktar || 0);
    }
  });

  // Negatif değerleri sıfırla
  Object.keys(toplamlar).forEach(turId => {
    if (toplamlar[turId] < 0) {
      toplamlar[turId] = 0;
    }
  });

  return toplamlar;
};

// Müşteri bazında toplam bakiye hesapla (emanet + borç)
export const calculateMusteriBakiye = (emanetler, borclar, musteriId) => {
  const emanetToplami = calculateMusteriEmanetToplami(emanetler, musteriId);
  const borcToplami = calculateMusteriBorcToplami(borclar, musteriId);
  
  const bakiye = {};
  
  // Emanet toplamlarını ekle
  Object.keys(emanetToplami).forEach(turId => {
    if (emanetToplami[turId] > 0) {
      bakiye[turId] = {
        tip: 'emanet',
        miktar: emanetToplami[turId]
      };
    }
  });
  
  // Borç toplamlarını ekle
  Object.keys(borcToplami).forEach(turId => {
    if (borcToplami[turId] > 0) {
      bakiye[turId] = {
        tip: 'borc',
        miktar: borcToplami[turId]
      };
    }
  });
  
  return bakiye;
};

// Genel net bakiye hesaplama (tüm müşterilerin tür bazında toplamı)
export const calculateGenelNetBakiye = (emanetler, borclar, musteriler) => {
  try {
    if (!emanetler || !borclar || !musteriler) {
      return {};
    }

    const genelNetBakiye = {};
    
    // Her müşteri için net bakiye hesapla ve topla
    musteriler.forEach(musteri => {
      const musteriNetBakiye = calculateNetBakiye(emanetler, borclar, musteri.id);
      
      Object.keys(musteriNetBakiye).forEach(turId => {
        if (!genelNetBakiye[turId]) {
          genelNetBakiye[turId] = 0;
        }
        genelNetBakiye[turId] += musteriNetBakiye[turId];
      });
    });
    
    // Sadece sıfır olmayan değerleri döndür
    const filteredGenelNetBakiye = {};
    Object.keys(genelNetBakiye).forEach(turId => {
      if (genelNetBakiye[turId] !== 0) {
        filteredGenelNetBakiye[turId] = genelNetBakiye[turId];
      }
    });
    
    return filteredGenelNetBakiye;
  } catch (error) {
    console.error('Genel net bakiye hesaplama hatası:', error);
    return {};
  }
};

// Sayı formatla (Türkçe format)
export const formatNumber = (number, decimals = 2) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  
  return parseFloat(number).toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

// Tarih formatla
export const formatDate = (date) => {
  if (!date) return '';
  
  let dateObj;
  if (date.toDate) {
    // Firestore Timestamp
    dateObj = date.toDate();
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date(date);
  }
  
  return dateObj.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Tarih ve saat formatla
export const formatDateTime = (date) => {
  if (!date) return '';
  
  let dateObj;
  if (date.toDate) {
    // Firestore Timestamp
    dateObj = date.toDate();
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date(date);
  }
  
  return dateObj.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Miktar ve birim formatla
export const formatMiktarWithBirim = (miktar, takipSekli) => {
  try {
    if (miktar === null || miktar === undefined || isNaN(miktar)) {
      miktar = 0;
    }
    
    const formattedMiktar = formatNumber(miktar);
    
    switch (takipSekli) {
      case 'gram':
        return `${formattedMiktar} gram`;
      case 'adet':
        return `${formattedMiktar} adet`;
      case 'TL':
        return `${formattedMiktar} TL`;
      default:
        return formattedMiktar;
    }
  } catch (error) {
    console.error('Miktar formatlama hatası:', error);
    return '0';
  }
};

// Net bakiye formatla
export const formatNetBakiye = (netBakiye, tur) => {
  try {
    if (netBakiye === null || netBakiye === undefined || isNaN(netBakiye)) {
      return '0';
    }

    const miktar = Math.abs(netBakiye);
    const formattedMiktar = formatMiktarWithBirim(miktar, tur?.takipSekli);
    
    if (netBakiye > 0) {
      return `+${formattedMiktar}`;
    } else if (netBakiye < 0) {
      return `-${formattedMiktar}`;
    } else {
      return `0 ${tur?.takipSekli === 'gram' ? 'gram' : tur?.takipSekli === 'adet' ? 'adet' : 'TL'}`;
    }
  } catch (error) {
    console.error('Net bakiye formatlama hatası:', error);
    return '0';
  }
};

