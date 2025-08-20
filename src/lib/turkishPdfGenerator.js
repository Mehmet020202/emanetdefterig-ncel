import jsPDF from 'jspdf';

// Türkçe karakter desteği için özel font ayarları
const setupTurkishFont = (doc) => {
  // jsPDF'in varsayılan fontu Latin karakterleri destekler
  // Türkçe karakterler için özel ayar yapmaya gerek yok
  doc.setFont('helvetica', 'normal');
  doc.setFontEncoding('Identity-H');
};

// Türkçe karakterleri düzgün şekilde işle
const formatTurkishText = (text) => {
  if (!text) return '';
  return text.toString();
};



// Sayfa kontrolü
const checkPageBreak = (doc, yPosition, margin = 20) => {
  if (yPosition > 270) {
    doc.addPage();
    return margin;
  }
  return yPosition;
};

// Başlık ekleme
const addTitle = (doc, text, yPosition, fontSize = 16) => {
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'bold');
  doc.text(formatTurkishText(text), 20, yPosition);
  return yPosition + fontSize + 4;
};

// Alt başlık ekleme
const addSubtitle = (doc, text, yPosition, fontSize = 13) => {
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'bold');
  doc.text(formatTurkishText(text), 20, yPosition);
  return yPosition + fontSize + 2;
};

// Normal metin ekleme
const addText = (doc, text, yPosition, fontSize = 11) => {
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');
  doc.text(formatTurkishText(text), 20, yPosition);
  return yPosition + fontSize - 2;
};

// Tablo başlığı ekleme
const addTableHeader = (doc, headers, yPosition) => {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  const colWidth = 170 / headers.length;
  headers.forEach((header, index) => {
    const x = 20 + (index * colWidth);
    doc.text(formatTurkishText(header), x, yPosition);
  });
  
  // Alt çizgi
  doc.setLineWidth(0.5);
  doc.line(20, yPosition + 2, 190, yPosition + 2);
  
  return yPosition + 10;
};

// Tablo satırı ekleme
const addTableRow = (doc, data, yPosition) => {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const colWidth = 170 / data.length;
  data.forEach((item, index) => {
    const x = 20 + (index * colWidth);
    const text = formatTurkishText(item || '');
    doc.text(text, x, yPosition);
  });
  
  return yPosition + 8;
};

// Müşteri detay raporu oluşturma
export const generateMusteriDetailPDF = (musteri, emanetData, borcData, turler, emanetToplami, borcToplami) => {
  const doc = new jsPDF();
  
  // Türkçe font desteği
  setupTurkishFont(doc);
  
  let yPosition = 30;
  
  // Ana başlık
  yPosition = addTitle(doc, 'EMANET DEFTERİ RAPORU', yPosition, 18);
  
  // Tarih
  const tarih = new Date().toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  yPosition = addText(doc, `Oluşturulma Tarihi: ${tarih}`, yPosition, 10);
  yPosition += 10;
  
  // Müşteri bilgileri
  yPosition = addSubtitle(doc, 'MÜŞTERİ BİLGİLERİ', yPosition);
  yPosition = addText(doc, `Ad Soyad: ${musteri.ad} ${musteri.soyad}`, yPosition);
  yPosition = addText(doc, `Telefon: ${musteri.telefon || 'Belirtilmemiş'}`, yPosition);
  if (musteri.not) {
    yPosition = addText(doc, `Not: ${musteri.not}`, yPosition);
  }
  yPosition += 10;
  
  // Emanet özeti
  yPosition = checkPageBreak(doc, yPosition);
  yPosition = addSubtitle(doc, 'EMANET ÖZETİ', yPosition);
  
  const emanetKeys = Object.keys(emanetToplami).filter(turId => emanetToplami[turId] > 0);
  if (emanetKeys.length > 0) {
    emanetKeys.forEach(turId => {
      const tur = turler.find(t => t.id === turId);
      if (tur) {
        const birim = tur.takipSekli === 'gram' ? 'gram' : 
                     tur.takipSekli === 'adet' ? 'adet' : 'TL';
        const turText = `${tur.sembol || ''} ${tur.isim}: ${emanetToplami[turId].toFixed(2)} ${birim}`;
        yPosition = addText(doc, turText, yPosition, 10);
      }
    });
  } else {
    yPosition = addText(doc, 'Emanet bulunmamaktadır', yPosition, 10);
  }
  
  yPosition += 10;
  
  // Borç özeti
  yPosition = checkPageBreak(doc, yPosition);
  yPosition = addSubtitle(doc, 'BORÇ ÖZETİ', yPosition);
  
  const borcKeys = Object.keys(borcToplami).filter(turId => borcToplami[turId] > 0);
  if (borcKeys.length > 0) {
    borcKeys.forEach(turId => {
      const tur = turler.find(t => t.id === turId);
      if (tur) {
        const birim = tur.takipSekli === 'gram' ? 'gram' : 
                     tur.takipSekli === 'adet' ? 'adet' : 'TL';
        const turText = `${tur.sembol || ''} ${tur.isim}: ${borcToplami[turId].toFixed(2)} ${birim}`;
        yPosition = addText(doc, turText, yPosition, 10);
      }
    });
  } else {
    yPosition = addText(doc, 'Borç bulunmamaktadır', yPosition, 10);
  }
  
  yPosition += 15;
  
  // İşlem geçmişi
  yPosition = checkPageBreak(doc, yPosition);
  yPosition = addSubtitle(doc, 'İŞLEM GEÇMİŞİ', yPosition);
  
  // Tüm işlemleri birleştir ve tarihe göre sırala
  const tumIslemler = [
    ...emanetData.map(e => ({ ...e, tip: 'emanet' })),
    ...borcData.map(b => ({ ...b, tip: 'borc' }))
  ].sort((a, b) => new Date(b.tarih) - new Date(a.tarih)).slice(0, 15); // Son 15 işlem
  
  if (tumIslemler.length > 0) {
    // Tablo başlığı
    yPosition = addTableHeader(doc, ['Tarih', 'İşlem', 'Tür', 'Miktar', 'Not'], yPosition);
    
    tumIslemler.forEach(islem => {
      yPosition = checkPageBreak(doc, yPosition);
      
      const tur = turler.find(t => t.id === islem.turId);
      const tarih = new Date(islem.tarih).toLocaleDateString('tr-TR');
      const islemTipi = islem.tip === 'emanet' ? 
        (islem.islemTipi === 'emanet-birak' ? 'Emanet Bırakıldı' : 'Emanet Alındı') :
        (islem.islemTipi === 'borc-ver' ? 'Borç Verildi' : 'Borç Ödendi');
      const turAdi = tur ? `${tur.sembol || ''} ${tur.isim}` : 'Bilinmeyen Tür';
      const birim = tur ? (tur.takipSekli === 'gram' ? 'gram' : 
                          tur.takipSekli === 'adet' ? 'adet' : 'TL') : '';
      const miktar = `${islem.miktar} ${birim}`;
      const not = islem.not || islem.aciklama || '-';
      
      // Not çok uzunsa kısalt
      const kisaNot = not.length > 20 ? not.substring(0, 17) + '...' : not;
      
      yPosition = addTableRow(doc, [tarih, islemTipi, turAdi, miktar, kisaNot], yPosition);
    });
  } else {
    yPosition = addText(doc, 'İşlem bulunmamaktadır', yPosition, 10);
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Sayfa ${i} / ${pageCount}`, 20, 290);
    doc.text('Emanet Defteri - Müşteri Raporu', 150, 290);
  }
  
  // PDF'i indir
  const fileName = `${musteri.ad}_${musteri.soyad}_rapor_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Genel rapor oluşturma
export const generateGenelRapor = (musteriListesi, emanetData, borcData, turler) => {
  const doc = new jsPDF();
  
  // Türkçe font desteği
  setupTurkishFont(doc);
  
  let yPosition = 30;
  
  // Ana başlık
  yPosition = addTitle(doc, 'GENEL DURUM RAPORU', yPosition, 18);
  
  // Tarih
  const tarih = new Date().toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  yPosition = addText(doc, `Oluşturulma Tarihi: ${tarih}`, yPosition, 10);
  yPosition += 10;
  
  // İstatistikler
  yPosition = addSubtitle(doc, 'GENEL İSTATİSTİKLER', yPosition);
  yPosition = addText(doc, `Toplam Müşteri: ${musteriListesi.length}`, yPosition);
  yPosition = addText(doc, `Toplam Emanet Türü: ${turler.length}`, yPosition);
  yPosition = addText(doc, `Toplam Emanet İşlemi: ${emanetData.length}`, yPosition);
  yPosition = addText(doc, `Toplam Borç İşlemi: ${borcData.length}`, yPosition);
  yPosition += 10;
  
  // Müşteri listesi
  yPosition = checkPageBreak(doc, yPosition);
  yPosition = addSubtitle(doc, 'MÜŞTERİ LİSTESİ', yPosition);
  
  // Tablo başlığı
  yPosition = addTableHeader(doc, ['Sıra', 'Ad Soyad', 'Telefon', 'Emanet', 'Borç'], yPosition);
  
  // Müşteri satırları
  musteriListesi.forEach((musteri, index) => {
    yPosition = checkPageBreak(doc, yPosition);
    
    const musteriEmanetler = emanetData.filter(e => e.musteriId === musteri.id);
    const musteriBorclar = borcData.filter(b => b.musteriId === musteri.id);
    
    const emanetDurumu = musteriEmanetler.length > 0 ? 'Var' : 'Yok';
    const borcDurumu = musteriBorclar.length > 0 ? 'Var' : 'Yok';
    
    yPosition = addTableRow(doc, [
      (index + 1).toString(),
      `${musteri.ad} ${musteri.soyad}`,
      musteri.telefon || '-',
      emanetDurumu,
      borcDurumu
    ], yPosition);
  });
  
  // Tür özeti
  yPosition = checkPageBreak(doc, yPosition);
  yPosition = addSubtitle(doc, 'TÜR ÖZETİ', yPosition);
  
  // Tablo başlığı
  yPosition = addTableHeader(doc, ['Sembol', 'Tür Adı', 'Takip Şekli', 'İşlem Sayısı'], yPosition);
  
  // Tür satırları
  turler.forEach(tur => {
    yPosition = checkPageBreak(doc, yPosition);
    
    const turEmanetler = emanetData.filter(e => e.turId === tur.id);
    const turBorclar = borcData.filter(b => b.turId === tur.id);
    const toplamIslem = turEmanetler.length + turBorclar.length;
    
    yPosition = addTableRow(doc, [
      tur.sembol || '',
      tur.isim,
      tur.takipSekli,
      toplamIslem.toString()
    ], yPosition);
  });
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Sayfa ${i} / ${pageCount}`, 20, 290);
    doc.text('Emanet Defteri - Genel Rapor', 150, 290);
  }
  
  // PDF'i indir
  const fileName = `genel_rapor_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Detaylı müşteri raporu
export const generateDetailedMusteriPDF = (musteri, emanetData, borcData, turler, emanetToplami, borcToplami) => {
  const doc = new jsPDF();
  
  // Türkçe font desteği
  setupTurkishFont(doc);
  
  let yPosition = 30;
  
  // Ana başlık
  yPosition = addTitle(doc, 'DETAYLI MÜŞTERİ RAPORU', yPosition, 18);
  
  // Müşteri bilgileri
  yPosition = addSubtitle(doc, 'MÜŞTERİ BİLGİLERİ', yPosition);
  yPosition = addText(doc, `Ad Soyad: ${musteri.ad} ${musteri.soyad}`, yPosition);
  yPosition = addText(doc, `Telefon: ${musteri.telefon || 'Belirtilmemiş'}`, yPosition);
  if (musteri.not) {
    yPosition = addText(doc, `Not: ${musteri.not}`, yPosition);
  }
  yPosition += 10;
  
  // Emanet detayları
  const emanetKeys = Object.keys(emanetToplami).filter(turId => emanetToplami[turId] > 0);
  if (emanetKeys.length > 0) {
    emanetKeys.forEach(turId => {
      const tur = turler.find(t => t.id === turId);
      if (tur) {
        yPosition = checkPageBreak(doc, yPosition);
        yPosition = addSubtitle(doc, `EMANET: ${tur.sembol} ${tur.isim}`, yPosition);
        
        const musteriEmanetler = emanetData.filter(e => e.turId === turId && e.musteriId === musteri.id);
        
        // Tablo başlığı
        yPosition = addTableHeader(doc, ['Tarih', 'İşlem', 'Miktar', 'Not'], yPosition);
        
        musteriEmanetler.forEach(emanet => {
          yPosition = checkPageBreak(doc, yPosition);
          
          const tarih = new Date(emanet.tarih).toLocaleDateString('tr-TR');
          const islemTipi = emanet.islemTipi === 'emanet-birak' ? 'Emanet Bırakıldı' : 'Emanet Alındı';
          const birim = tur.takipSekli === 'gram' ? 'gram' : 
                       tur.takipSekli === 'adet' ? 'adet' : 'TL';
          const miktar = `${emanet.miktar} ${birim}`;
          const not = emanet.not || emanet.aciklama || '-';
          
          yPosition = addTableRow(doc, [tarih, islemTipi, miktar, not], yPosition);
        });
        
        yPosition += 10;
      }
    });
  }
  
  // Borç detayları
  const borcKeys = Object.keys(borcToplami).filter(turId => borcToplami[turId] > 0);
  if (borcKeys.length > 0) {
    borcKeys.forEach(turId => {
      const tur = turler.find(t => t.id === turId);
      if (tur) {
        yPosition = checkPageBreak(doc, yPosition);
        yPosition = addSubtitle(doc, `BORÇ: ${tur.sembol} ${tur.isim}`, yPosition);
        
        const musteriBorclar = borcData.filter(b => b.turId === turId && b.musteriId === musteri.id);
        
        // Tablo başlığı
        yPosition = addTableHeader(doc, ['Tarih', 'İşlem', 'Miktar', 'Not'], yPosition);
        
        musteriBorclar.forEach(borc => {
          yPosition = checkPageBreak(doc, yPosition);
          
          const tarih = new Date(borc.tarih).toLocaleDateString('tr-TR');
          const islemTipi = borc.islemTipi === 'borc-ver' ? 'Borç Verildi' : 'Borç Ödendi';
          const birim = tur.takipSekli === 'gram' ? 'gram' : 
                       tur.takipSekli === 'adet' ? 'adet' : 'TL';
          const miktar = `${borc.miktar} ${birim}`;
          const not = borc.not || borc.aciklama || '-';
          
          yPosition = addTableRow(doc, [tarih, islemTipi, miktar, not], yPosition);
        });
        
        yPosition += 10;
      }
    });
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Sayfa ${i} / ${pageCount}`, 20, 290);
    doc.text('Emanet Defteri - Detaylı Rapor', 150, 290);
  }
  
  // PDF'i indir
  const fileName = `${musteri.ad}_${musteri.soyad}_detayli_rapor_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
