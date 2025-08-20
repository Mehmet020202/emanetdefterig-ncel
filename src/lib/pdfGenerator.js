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
    'ü': 'u', 'Ü': 'U'
  };
  
  return text.toString().replace(/[çÇğĞıIöÖşŞüÜ]/g, char => turkishChars[char] || char);
};

// Metni belirli genişlikte böl
const splitText = (doc, text, maxWidth) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const testWidth = doc.getTextWidth(testLine);
    
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

// Müşteri detay raporu oluşturma - Düzgün yazı formatı
export const generateMusteriDetailPDF = (musteri, emanetData, borcData, turler, emanetToplami, borcToplami) => {
  const doc = new jsPDF();
  
  let yPosition = 30;
  
  // Müşteri adı - büyük başlık
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const musteriAdi = turkishToEnglish(`${musteri.ad} ${musteri.soyad}`);
  doc.text(musteriAdi, 20, yPosition);
  yPosition += 20;
  
  // Telefon ve Not bilgileri
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(turkishToEnglish(`Telefon: ${musteri.telefon || '-'}`), 20, yPosition);
  yPosition += 8;
  doc.text(turkishToEnglish(`Not: ${musteri.not || '-'}`), 20, yPosition);
  yPosition += 20;
  
  // Emanetler başlığı
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Emanetler', 20, yPosition);
  yPosition += 15;
  
  // Emanet türleri ve toplamları
  Object.keys(emanetToplami).forEach(turId => {
    if (emanetToplami[turId] > 0) {
      const tur = turler.find(t => t.id === turId);
      if (tur) {
        // Sayfa kontrolü
        if (yPosition > 260) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const turIsmi = turkishToEnglish(tur.isim);
        doc.text(turIsmi, 20, yPosition);
        
        // Toplam sağ tarafa - daha okunaklı
        const birim = tur.takipSekli === 'gram' ? 'gram' : 
                     tur.takipSekli === 'adet' ? 'adet' : 'TL';
        const toplamText = turkishToEnglish(`Toplam: ${emanetToplami[turId].toFixed(2)} ${birim}`);
        const toplamWidth = doc.getTextWidth(toplamText);
        doc.text(toplamText, 190 - toplamWidth, yPosition);
        yPosition += 12;
        
        // Tablo başlıkları - daha geniş aralıklarla
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Tarih', 20, yPosition);
        doc.text('Miktar', 70, yPosition);
        doc.text('Aciklama', 120, yPosition);
        
        // Alt çizgi
        doc.setLineWidth(0.5);
        doc.line(20, yPosition + 2, 190, yPosition + 2);
        yPosition += 10;
        
        // Emanet işlemleri
        const musteriEmanetler = emanetData.filter(e => e.turId === turId);
        doc.setFont('helvetica', 'normal');
        
        musteriEmanetler.forEach(emanet => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          const tarih = new Date(emanet.tarih).toLocaleDateString('tr-TR');
          const miktar = emanet.islemTipi === 'emanet-birak' ? `+${emanet.miktar}` : `-${emanet.miktar}`;
          const aciklama = turkishToEnglish(emanet.aciklama || '-');
          
          // Açıklama çok uzunsa böl
          const aciklamaLines = splitText(doc, aciklama, 70);
          
          doc.text(tarih, 20, yPosition);
          doc.text(miktar, 70, yPosition);
          doc.text(aciklamaLines[0], 120, yPosition);
          
          // Eğer açıklama birden fazla satırsa
          if (aciklamaLines.length > 1) {
            yPosition += 6;
            for (let i = 1; i < aciklamaLines.length; i++) {
              doc.text(aciklamaLines[i], 120, yPosition);
              yPosition += 6;
            }
          }
          
          yPosition += 8;
        });
        
        yPosition += 10;
      }
    }
  });
  
  // Borçlar başlığı
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Borclar', 20, yPosition);
  yPosition += 15;
  
  // Borç türleri ve toplamları
  Object.keys(borcToplami).forEach(turId => {
    if (borcToplami[turId] > 0) {
      const tur = turler.find(t => t.id === turId);
      if (tur) {
        if (yPosition > 260) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const turIsmi = turkishToEnglish(tur.isim);
        doc.text(turIsmi, 20, yPosition);
        
        // Toplam sağ tarafa
        const birim = tur.takipSekli === 'gram' ? 'gram' : 
                     tur.takipSekli === 'adet' ? 'adet' : 'TL';
        const toplamText = turkishToEnglish(`Toplam: ${borcToplami[turId].toFixed(2)} ${birim}`);
        const toplamWidth = doc.getTextWidth(toplamText);
        doc.text(toplamText, 190 - toplamWidth, yPosition);
        yPosition += 12;
        
        // Tablo başlıkları
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Tarih', 20, yPosition);
        doc.text('Miktar', 70, yPosition);
        doc.text('Aciklama', 120, yPosition);
        
        // Alt çizgi
        doc.setLineWidth(0.5);
        doc.line(20, yPosition + 2, 190, yPosition + 2);
        yPosition += 10;
        
        // Borç işlemleri
        const musteriBorclar = borcData.filter(b => b.turId === turId);
        doc.setFont('helvetica', 'normal');
        
        musteriBorclar.forEach(borc => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          const tarih = new Date(borc.tarih).toLocaleDateString('tr-TR');
          const miktar = borc.islemTipi === 'borc-ver' ? `+${borc.miktar}` : `-${borc.miktar}`;
          const aciklama = turkishToEnglish(borc.aciklama || '-');
          
          // Açıklama çok uzunsa böl
          const aciklamaLines = splitText(doc, aciklama, 70);
          
          doc.text(tarih, 20, yPosition);
          doc.text(miktar, 70, yPosition);
          doc.text(aciklamaLines[0], 120, yPosition);
          
          // Eğer açıklama birden fazla satırsa
          if (aciklamaLines.length > 1) {
            yPosition += 6;
            for (let i = 1; i < aciklamaLines.length; i++) {
              doc.text(aciklamaLines[i], 120, yPosition);
              yPosition += 6;
            }
          }
          
          yPosition += 8;
        });
        
        yPosition += 10;
      }
    }
  });
  
  // Alt bilgi
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(turkishToEnglish(`Olusturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`), 20, pageHeight - 10);
  
  // PDF'i indir
  doc.save(turkishToEnglish(`${musteri.ad}_${musteri.soyad}_rapor.pdf`));
};

// Genel rapor oluşturma - Düzgün yazı formatı
export const generateGenelRapor = (musteriListesi, emanetData, borcData) => {
  const doc = new jsPDF();
  
  let yPosition = 30;
  
  // Başlık
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Genel Durum Raporu', 20, yPosition);
  yPosition += 25;
  
  // Müşteri listesi
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Musteri Listesi', 20, yPosition);
  yPosition += 15;
  
  // Tablo başlıkları - daha geniş aralıklarla
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Sira', 20, yPosition);
  doc.text('Ad Soyad', 40, yPosition);
  doc.text('Telefon', 100, yPosition);
  doc.text('Emanet', 140, yPosition);
  doc.text('Borc', 170, yPosition);
  
  // Alt çizgi
  doc.setLineWidth(0.5);
  doc.line(20, yPosition + 2, 190, yPosition + 2);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  
  musteriListesi.forEach(musteri => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    
    const musteriEmanetler = emanetData.filter(e => e.musteriId === musteri.id);
    const musteriBorclar = borcData.filter(b => b.musteriId === musteri.id);
    
    const emanetDurumu = musteriEmanetler.length > 0 ? 'Var' : 'Yok';
    const borcDurumu = musteriBorclar.length > 0 ? 'Var' : 'Yok';
    
    // Uzun isimleri kısalt
    const adSoyad = turkishToEnglish(`${musteri.ad} ${musteri.soyad}`);
    const kisaAdSoyad = adSoyad.length > 25 ? adSoyad.substring(0, 22) + '...' : adSoyad;
    
    doc.text(musteri.sira.toString(), 20, yPosition);
    doc.text(kisaAdSoyad, 40, yPosition);
    doc.text(musteri.telefon || '-', 100, yPosition);
    doc.text(emanetDurumu, 140, yPosition);
    doc.text(borcDurumu, 170, yPosition);
    
    yPosition += 8;
  });
  
  // Alt bilgi
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(turkishToEnglish(`Olusturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`), 20, pageHeight - 10);
  
  // PDF'i indir
  doc.save(turkishToEnglish(`genel_durum_raporu_${new Date().toISOString().split('T')[0]}.pdf`));
};

