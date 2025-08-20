import jsPDF from 'jspdf';

// Türkçe karakter desteği için gelişmiş çözüm
const turkishToEnglish = (text) => {
  if (!text) return '';
  
  const turkishChars = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G', 
    'ı': 'i', 'I': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U',
    'İ': 'I'
  };
  
  return text.toString().replace(/[çÇğĞıIöÖşŞüÜİ]/g, char => turkishChars[char] || char);
};



// Sayfa kontrolü ve yeni sayfa ekleme
const checkPageBreak = (doc, yPosition, margin = 20) => {
  if (yPosition > 270) {
    doc.addPage();
    return margin;
  }
  return yPosition;
};

// Başlık ekleme
const addTitle = (doc, text, yPosition) => {
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(turkishToEnglish(text), 20, yPosition);
  return yPosition + 20;
};

// Alt başlık ekleme
const addSubtitle = (doc, text, yPosition) => {
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(turkishToEnglish(text), 20, yPosition);
  return yPosition + 15;
};

// Bilgi satırı ekleme
const addInfoLine = (doc, label, value, yPosition) => {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const text = turkishToEnglish(`${label}: ${value || '-'}`);
  doc.text(text, 20, yPosition);
  return yPosition + 8;
};

// Tablo başlığı ekleme
const addTableHeader = (doc, headers, yPosition) => {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  headers.forEach((header, index) => {
    const x = 20 + (index * 50);
    doc.text(turkishToEnglish(header), x, yPosition);
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
  
  data.forEach((item, index) => {
    const x = 20 + (index * 50);
    const text = turkishToEnglish(item || '');
    doc.text(text, x, yPosition);
  });
  
  return yPosition + 8;
};

// Müşteri detay raporu oluşturma
export const generateMusteriDetailPDF = (musteri, emanetData, borcData, turler, emanetToplami, borcToplami) => {
  const doc = new jsPDF();
  
  let yPosition = 30;
  
  // Başlık
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(turkishToEnglish('Emanet Defteri Raporu'), 105, yPosition, { align: 'center' });
  yPosition += 20;
  
  // Tarih
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(turkishToEnglish(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`), 20, yPosition);
  yPosition += 10;
  
  // Müşteri bilgileri
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(turkishToEnglish(`Musteri Raporu: ${musteri.ad} ${musteri.soyad}`), 20, yPosition);
  yPosition += 10;
  
  // Sıra No (müşteri ID'si)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(turkishToEnglish(`Sira No: ${musteri.id || 'N/A'}`), 20, yPosition);
  yPosition += 15;
  
  // Emanet Toplamları
  yPosition = checkPageBreak(doc, yPosition);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(turkishToEnglish('Emanet Toplamlari:'), 20, yPosition);
  yPosition += 10;
  
  const emanetKeys = Object.keys(emanetToplami).filter(turId => emanetToplami[turId] > 0);
  if (emanetKeys.length > 0) {
    emanetKeys.forEach(turId => {
      const tur = turler.find(t => t.id === turId);
      if (tur && tur.sembol && tur.isim) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const birim = tur.takipSekli === 'gram' ? 'gram' : 
                     tur.takipSekli === 'adet' ? 'adet' : 'TL';
        const turText = turkishToEnglish(`${tur.sembol} ${tur.isim}: ${emanetToplami[turId].toFixed(2)} ${birim}`);
        doc.text(turText, 30, yPosition);
        yPosition += 8;
      } else {
        // Tür bulunamadıysa basit format kullan
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const turText = turkishToEnglish(`Tür ${turId}: ${emanetToplami[turId].toFixed(2)} birim`);
        doc.text(turText, 30, yPosition);
        yPosition += 8;
      }
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(turkishToEnglish('Emanet bulunmuyor'), 30, yPosition);
    yPosition += 8;
  }
  
  yPosition += 10;
  
  // Borç Toplamları
  yPosition = checkPageBreak(doc, yPosition);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(turkishToEnglish('Borc Toplamlari:'), 20, yPosition);
  yPosition += 10;
  
  const borcKeys = Object.keys(borcToplami).filter(turId => borcToplami[turId] > 0);
  if (borcKeys.length > 0) {
    borcKeys.forEach(turId => {
      const tur = turler.find(t => t.id === turId);
      if (tur && tur.sembol && tur.isim) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const birim = tur.takipSekli === 'gram' ? 'gram' : 
                     tur.takipSekli === 'adet' ? 'adet' : 'TL';
        const turText = turkishToEnglish(`${tur.sembol} ${tur.isim}: ${borcToplami[turId].toFixed(2)} ${birim}`);
        doc.text(turText, 30, yPosition);
        yPosition += 8;
      } else {
        // Tür bulunamadıysa basit format kullan
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const turText = turkishToEnglish(`Tür ${turId}: ${borcToplami[turId].toFixed(2)} birim`);
        doc.text(turText, 30, yPosition);
        yPosition += 8;
      }
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(turkishToEnglish('Borc bulunmuyor'), 30, yPosition);
    yPosition += 8;
  }
  
  yPosition += 10;
  
  // Son İşlemler
  yPosition = checkPageBreak(doc, yPosition);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(turkishToEnglish('Son Islemler:'), 20, yPosition);
  yPosition += 10;
  
  // Tüm işlemleri birleştir ve tarihe göre sırala
  const tumIslemler = [
    ...emanetData.map(e => ({ ...e, tip: 'emanet' })),
    ...borcData.map(b => ({ ...b, tip: 'borc' }))
  ].sort((a, b) => new Date(b.tarih) - new Date(a.tarih)).slice(0, 10); // Son 10 işlem
  
  if (tumIslemler.length > 0) {
    tumIslemler.forEach(islem => {
      const tur = turler.find(t => t.id === islem.turId);
      if (tur && tur.sembol && tur.isim) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const tarih = new Date(islem.tarih).toLocaleDateString('tr-TR');
        const islemTipi = islem.tip === 'emanet' ? 
          (islem.islemTipi === 'emanet-birak' ? 'Emanet Birak' : 'Emanet Iade') :
          (islem.islemTipi === 'borc-ver' ? 'Borc Ver' : 'Borc Ode');
        const miktar = `${islem.miktar} ${tur.takipSekli === 'gram' ? 'gram' : tur.takipSekli === 'adet' ? 'adet' : 'TL'}`;
        
        const islemText = turkishToEnglish(`${tarih} - ${islemTipi} - ${tur.sembol} ${tur.isim}: ${miktar}`);
        doc.text(islemText, 30, yPosition);
        yPosition += 6;
      } else {
        // Tür bulunamadıysa basit format kullan
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const tarih = new Date(islem.tarih).toLocaleDateString('tr-TR');
        const islemTipi = islem.tip === 'emanet' ? 
          (islem.islemTipi === 'emanet-birak' ? 'Emanet Birak' : 'Emanet Iade') :
          (islem.islemTipi === 'borc-ver' ? 'Borc Ver' : 'Borc Ode');
        const miktar = `${islem.miktar} ${islem.turId || 'birim'}`;
        
        const islemText = turkishToEnglish(`${tarih} - ${islemTipi} - ${miktar}`);
        doc.text(islemText, 30, yPosition);
        yPosition += 6;
      }
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(turkishToEnglish('Islem bulunmuyor'), 30, yPosition);
    yPosition += 8;
  }
  
  return doc;
};

// Genel rapor oluşturma
export const generateGenelRapor = (musteriListesi, emanetData, borcData, turler) => {
  const doc = new jsPDF();
  
  let yPosition = 30;
  
  // Başlık
  yPosition = addTitle(doc, 'Genel Rapor', yPosition);
  yPosition += 10;
  
  // İstatistikler
  yPosition = addInfoLine(doc, 'Toplam Musteri', musteriListesi.length, yPosition);
  yPosition = addInfoLine(doc, 'Toplam Emanet Turu', turler.length, yPosition);
  yPosition += 10;
  
  // Müşteri listesi
  yPosition = checkPageBreak(doc, yPosition);
  yPosition = addSubtitle(doc, 'Musteri Listesi', yPosition);
  
  // Tablo başlığı
  yPosition = addTableHeader(doc, ['Sira', 'Ad Soyad', 'Telefon'], yPosition);
  
  // Müşteri satırları
  musteriListesi.forEach((musteri, index) => {
    yPosition = checkPageBreak(doc, yPosition);
    
    const sira = index + 1;
    const adSoyad = `${musteri.ad} ${musteri.soyad}`;
    const telefon = musteri.telefon || '-';
    
    yPosition = addTableRow(doc, [sira.toString(), adSoyad, telefon], yPosition);
  });
  
  return doc;
}; 