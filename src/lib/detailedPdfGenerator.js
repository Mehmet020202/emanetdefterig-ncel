import jsPDF from 'jspdf';
import DOMPurify from 'dompurify';

// Türkçe karakter temizleme
const sanitizeText = (text) => {
  if (!text) return '';
  
  // DOMPurify ile temizle
  const cleanText = DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
  
  // Türkçe karakterleri düzelt
  const turkishChars = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G', 
    'ı': 'i', 'I': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
  };
  
  return cleanText.replace(/[çÇğĞıIöÖşŞüÜ]/g, char => turkishChars[char] || char);
};

// Detaylı müşteri raporu - resimdeki gibi tablo formatında
export const generateDetailedMusteriPDF = (musteri, emanetData, borcData, turler, emanetToplami, borcToplami) => {
  const doc = new jsPDF();
  
  let yPosition = 30;
  
  // Müşteri adı - büyük başlık
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(sanitizeText(`${musteri.ad} ${musteri.soyad}`), 20, yPosition);
  yPosition += 15;
  
  // Telefon ve Not bilgileri
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Telefon: ${sanitizeText(musteri.telefon || '-')}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Not: ${sanitizeText(musteri.not || '-')}`, 20, yPosition);
  yPosition += 20;
  
  // Emanetler başlığı
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Emanetler', 20, yPosition);
  yPosition += 15;
  
  // Emanet türleri ve işlemleri
  Object.keys(emanetToplami).forEach(turId => {
    if (emanetToplami[turId] > 0) {
      const tur = turler.find(t => t.id === turId);
      if (tur) {
        // Sayfa kontrolü
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Tür başlığı ve toplam
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(sanitizeText(tur.isim), 20, yPosition);
        
        const birim = tur.takipSekli === 'gram' ? 'gram' : 
                     tur.takipSekli === 'adet' ? 'adet' : 'TL';
        const toplamText = `Toplam: ${emanetToplami[turId].toFixed(2)} ${birim}`;
        const toplamWidth = doc.getTextWidth(toplamText);
        doc.text(toplamText, 190 - toplamWidth, yPosition);
        yPosition += 10;
        
        // Tablo başlıkları
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Tarih', 20, yPosition);
        doc.text('Miktar', 70, yPosition);
        doc.text('Aciklama', 120, yPosition);
        
        // Alt çizgi
        doc.setLineWidth(0.3);
        doc.line(20, yPosition + 2, 190, yPosition + 2);
        yPosition += 8;
        
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
          const aciklama = sanitizeText(emanet.aciklama || '-');
          
          doc.text(tarih, 20, yPosition);
          doc.text(miktar, 70, yPosition);
          doc.text(aciklama, 120, yPosition);
          
          yPosition += 7;
        });
        
        yPosition += 10;
      }
    }
  });
  
  // Borçlar başlığı
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Borclar', 20, yPosition);
  yPosition += 15;
  
  // Borç türleri ve işlemleri
  Object.keys(borcToplami).forEach(turId => {
    if (borcToplami[turId] > 0) {
      const tur = turler.find(t => t.id === turId);
      if (tur) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Tür başlığı ve toplam
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(sanitizeText(tur.isim), 20, yPosition);
        
        const birim = tur.takipSekli === 'gram' ? 'gram' : 
                     tur.takipSekli === 'adet' ? 'adet' : 'TL';
        const toplamText = `Toplam: ${borcToplami[turId].toFixed(2)} ${birim}`;
        const toplamWidth = doc.getTextWidth(toplamText);
        doc.text(toplamText, 190 - toplamWidth, yPosition);
        yPosition += 10;
        
        // Tablo başlıkları
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Tarih', 20, yPosition);
        doc.text('Miktar', 70, yPosition);
        doc.text('Aciklama', 120, yPosition);
        
        // Alt çizgi
        doc.setLineWidth(0.3);
        doc.line(20, yPosition + 2, 190, yPosition + 2);
        yPosition += 8;
        
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
          const aciklama = sanitizeText(borc.aciklama || '-');
          
          doc.text(tarih, 20, yPosition);
          doc.text(miktar, 70, yPosition);
          doc.text(aciklama, 120, yPosition);
          
          yPosition += 7;
        });
        
        yPosition += 10;
      }
    }
  });
  
  // Alt bilgi
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Olusturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 20, pageHeight - 10);
  
  // PDF'i indir
  doc.save(sanitizeText(`${musteri.ad}_${musteri.soyad}_rapor.pdf`));
};

export default {
  generateDetailedMusteriPDF,
  sanitizeText
};

