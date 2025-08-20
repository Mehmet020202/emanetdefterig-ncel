import jsPDF from 'jspdf';
import { formatMiktarWithBirim, formatDate } from './calculations';

// Türkçe karakter desteği için font ekleme
const addTurkishFont = (doc) => {
  // jsPDF varsayılan olarak Latin karakterleri destekler
  // Türkçe karakterler için özel ayar yapmaya gerek yok
  doc.setFont('helvetica', 'normal');
};

// Renkli header ekleme
const addColorfulHeader = (doc, title, subtitle = '') => {
  // Arka plan rengi (açık mavi)
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Başlık
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, 25);
  
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 20, 35);
  }
  
  // Tarih
  const now = new Date();
  const tarihStr = now.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  doc.setFontSize(10);
  doc.text(`Oluşturulma Tarihi: ${tarihStr}`, 20, 45);
  
  // Çizgi
  doc.setDrawColor(52, 152, 219);
  doc.setLineWidth(2);
  doc.line(20, 50, 190, 50);
  
  // Metin rengini siyaha çevir
  doc.setTextColor(0, 0, 0);
  
  return 60; // Sonraki içerik için Y pozisyonu
};

// Renkli tablo oluşturma
const createColorfulTable = (doc, headers, data, startY, options = {}) => {
  const {
    headerColor = [52, 152, 219],
    alternateRowColor = [245, 245, 245],
    textColor = [0, 0, 0],
    fontSize = 10
  } = options;
  
  let currentY = startY;
  const cellHeight = 15;
  const tableWidth = 170;
  const colWidth = tableWidth / headers.length;
  
  // Header
  doc.setFillColor(...headerColor);
  doc.rect(20, currentY, tableWidth, cellHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'bold');
  
  headers.forEach((header, index) => {
    doc.text(header, 25 + (index * colWidth), currentY + 10);
  });
  
  currentY += cellHeight;
  
  // Data rows
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'normal');
  
  data.forEach((row, rowIndex) => {
    // Alternatif satır rengi
    if (rowIndex % 2 === 1) {
      doc.setFillColor(...alternateRowColor);
      doc.rect(20, currentY, tableWidth, cellHeight, 'F');
    }
    
    row.forEach((cell, colIndex) => {
      doc.text(String(cell || ''), 25 + (colIndex * colWidth), currentY + 10);
    });
    
    currentY += cellHeight;
    
    // Sayfa sonu kontrolü
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }
  });
  
  return currentY + 10;
};

// Renkli bilgi kutusu
const addInfoBox = (doc, title, content, startY, color = [46, 204, 113]) => {
  const boxHeight = 30;
  
  // Kutu arka planı
  doc.setFillColor(...color);
  doc.rect(20, startY, 170, boxHeight, 'F');
  
  // Başlık
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 25, startY + 15);
  
  // İçerik
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(content, 25, startY + 25);
  
  doc.setTextColor(0, 0, 0);
  
  return startY + boxHeight + 10;
};

// Gelişmiş müşteri PDF raporu
export const generateAdvancedMusteriPDF = (musteri, emanetler, borclar, turler, emanetToplami, borcToplami) => {
  const doc = new jsPDF();
  
  // Türkçe font desteği
  addTurkishFont(doc);
  
  // Renkli header
  let currentY = addColorfulHeader(
    doc, 
    'MÜŞTERİ DETAY RAPORU',
    `${musteri.ad} ${musteri.soyad}`
  );
  
  // Müşteri bilgileri kutusu
  const musteriInfo = `Ad Soyad: ${musteri.ad} ${musteri.soyad} | Telefon: ${musteri.telefon || 'Belirtilmemiş'}`;
  currentY = addInfoBox(doc, 'MÜŞTERİ BİLGİLERİ', musteriInfo, currentY, [155, 89, 182]);
  
  // Müşteri notu varsa ekle
  if (musteri.not) {
    currentY = addInfoBox(doc, 'MÜŞTERİ NOTU', musteri.not, currentY, [241, 196, 15]);
  }
  
  // Emanet özeti
  const emanetKeys = Object.keys(emanetToplami).filter(turId => emanetToplami[turId] > 0);
  if (emanetKeys.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(46, 204, 113);
    doc.text('EMANET ÖZETİ', 20, currentY);
    currentY += 15;
    
    const emanetData = emanetKeys.map(turId => {
      const tur = turler.find(t => t.id === turId);
      return [
        tur?.sembol || '',
        tur?.isim || '',
        formatMiktarWithBirim(emanetToplami[turId], tur?.takipSekli),
        tur?.takipSekli || ''
      ];
    });
    
    currentY = createColorfulTable(
      doc,
      ['Sembol', 'Tür Adı', 'Miktar', 'Birim'],
      emanetData,
      currentY,
      { headerColor: [46, 204, 113] }
    );
  } else {
    currentY = addInfoBox(doc, 'EMANET DURUMU', 'Bu müşterinin emaneti bulunmamaktadır.', currentY, [149, 165, 166]);
  }
  
  // Borç özeti
  const borcKeys = Object.keys(borcToplami).filter(turId => borcToplami[turId] > 0);
  if (borcKeys.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(231, 76, 60);
    doc.text('BORÇ ÖZETİ', 20, currentY);
    currentY += 15;
    
    const borcData = borcKeys.map(turId => {
      const tur = turler.find(t => t.id === turId);
      return [
        tur?.sembol || '',
        tur?.isim || '',
        formatMiktarWithBirim(borcToplami[turId], tur?.takipSekli),
        tur?.takipSekli || ''
      ];
    });
    
    currentY = createColorfulTable(
      doc,
      ['Sembol', 'Tür Adı', 'Miktar', 'Birim'],
      borcData,
      currentY,
      { headerColor: [231, 76, 60] }
    );
  } else {
    currentY = addInfoBox(doc, 'BORÇ DURUMU', 'Bu müşterinin borcu bulunmamaktadır.', currentY, [149, 165, 166]);
  }
  
  // İşlem geçmişi
  const tumIslemler = [...emanetler, ...borclar].sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
  
  if (tumIslemler.length > 0) {
    // Yeni sayfa ekle
    doc.addPage();
    currentY = addColorfulHeader(doc, 'İŞLEM GEÇMİŞİ', `Son ${Math.min(tumIslemler.length, 20)} işlem`);
    
    const islemData = tumIslemler.slice(0, 20).map(islem => {
      const tur = turler.find(t => t.id === islem.turId);
      const islemTipi = islem.islemTipi === 'emanet-birak' ? 'Emanet Bırakıldı' :
                       islem.islemTipi === 'emanet-al' ? 'Emanet Alındı' :
                       islem.islemTipi === 'borc-ver' ? 'Borç Verildi' : 'Borç Ödendi';
      
      return [
        formatDate(islem.tarih),
        islemTipi,
        `${tur?.sembol || ''} ${tur?.isim || ''}`,
        formatMiktarWithBirim(islem.miktar, tur?.takipSekli),
        islem.not || islem.aciklama || '-'
      ];
    });
    
    currentY = createColorfulTable(
      doc,
      ['Tarih', 'İşlem Türü', 'Emanet/Borç Türü', 'Miktar', 'Not'],
      islemData,
      currentY,
      { headerColor: [52, 152, 219], fontSize: 8 }
    );
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

// Genel rapor PDF'i
export const generateGenelRaporPDF = (musteriData, emanetData, borcData, turler) => {
  const doc = new jsPDF();
  
  addTurkishFont(doc);
  
  let currentY = addColorfulHeader(doc, 'GENEL RAPOR', 'Tüm müşteriler ve işlemler özeti');
  
  // Genel istatistikler
  const toplamMusteri = musteriData.length;
  const toplamEmanet = emanetData.length;
  const toplamBorc = borcData.length;
  const toplamTur = turler.length;
  
  const istatistikInfo = `Müşteri: ${toplamMusteri} | Emanet İşlemi: ${toplamEmanet} | Borç İşlemi: ${toplamBorc} | Tür: ${toplamTur}`;
  currentY = addInfoBox(doc, 'GENEL İSTATİSTİKLER', istatistikInfo, currentY, [52, 152, 219]);
  
  // Müşteri özet tablosu
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 152, 219);
  doc.text('MÜŞTERİ ÖZETİ', 20, currentY);
  currentY += 15;
  
  const musteriOzetData = musteriData.slice(0, 15).map(musteri => {
    const musteriEmanetler = emanetData.filter(e => e.musteriId === musteri.id);
    const musteriBorclar = borcData.filter(b => b.musteriId === musteri.id);
    
    return [
      musteri.sira,
      `${musteri.ad} ${musteri.soyad}`,
      musteri.telefon || '-',
      musteriEmanetler.length,
      musteriBorclar.length,
      musteriEmanetler.length + musteriBorclar.length
    ];
  });
  
  currentY = createColorfulTable(
    doc,
    ['Sıra', 'Ad Soyad', 'Telefon', 'Emanet', 'Borç', 'Toplam'],
    musteriOzetData,
    currentY
  );
  
  // Tür özet tablosu
  if (currentY > 200) {
    doc.addPage();
    currentY = 20;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(46, 204, 113);
  doc.text('TÜR ÖZETİ', 20, currentY);
  currentY += 15;
  
  const turOzetData = turler.map(tur => {
    const turEmanetler = emanetData.filter(e => e.turId === tur.id);
    const turBorclar = borcData.filter(b => b.turId === tur.id);
    
    return [
      tur.sembol,
      tur.isim,
      tur.takipSekli,
      turEmanetler.length,
      turBorclar.length,
      turEmanetler.length + turBorclar.length
    ];
  });
  
  currentY = createColorfulTable(
    doc,
    ['Sembol', 'Tür Adı', 'Takip Şekli', 'Emanet', 'Borç', 'Toplam'],
    turOzetData,
    currentY,
    { headerColor: [46, 204, 113] }
  );
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Sayfa ${i} / ${pageCount}`, 20, 290);
    doc.text('Emanet Defteri - Genel Rapor', 150, 290);
  }
  
  const fileName = `genel_rapor_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Yazdırma fonksiyonu
export const printMusteriReport = (musteri, emanetler, borclar, turler, emanetToplami, borcToplami) => {
  // Yazdırma için HTML içeriği oluştur
  const printContent = `
    <html>
      <head>
        <title>Müşteri Raporu - ${musteri.ad} ${musteri.soyad}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { background: #2980b9; color: white; padding: 20px; margin-bottom: 20px; }
          .info-box { background: #ecf0f1; padding: 15px; margin: 10px 0; border-left: 4px solid #3498db; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #3498db; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .emanet { border-left: 4px solid #27ae60; }
          .borc { border-left: 4px solid #e74c3c; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Müşteri Detay Raporu</h1>
          <h2>${musteri.ad} ${musteri.soyad}</h2>
          <p>Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}</p>
        </div>
        
        <div class="info-box">
          <strong>Müşteri Bilgileri:</strong><br>
          Ad Soyad: ${musteri.ad} ${musteri.soyad}<br>
          Telefon: ${musteri.telefon || 'Belirtilmemiş'}<br>
          ${musteri.not ? `Not: ${musteri.not}` : ''}
        </div>
        
        <div class="emanet">
          <h3>Emanet Özeti</h3>
          ${Object.keys(emanetToplami).filter(turId => emanetToplami[turId] > 0).length > 0 ? `
            <table>
              <tr><th>Tür</th><th>Miktar</th></tr>
              ${Object.keys(emanetToplami).filter(turId => emanetToplami[turId] > 0).map(turId => {
                const tur = turler.find(t => t.id === turId);
                return `<tr><td>${tur?.sembol} ${tur?.isim}</td><td>${formatMiktarWithBirim(emanetToplami[turId], tur?.takipSekli)}</td></tr>`;
              }).join('')}
            </table>
          ` : '<p>Emanet bulunmamaktadır.</p>'}
        </div>
        
        <div class="borc">
          <h3>Borç Özeti</h3>
          ${Object.keys(borcToplami).filter(turId => borcToplami[turId] > 0).length > 0 ? `
            <table>
              <tr><th>Tür</th><th>Miktar</th></tr>
              ${Object.keys(borcToplami).filter(turId => borcToplami[turId] > 0).map(turId => {
                const tur = turler.find(t => t.id === turId);
                return `<tr><td>${tur?.sembol} ${tur?.isim}</td><td>${formatMiktarWithBirim(borcToplami[turId], tur?.takipSekli)}</td></tr>`;
              }).join('')}
            </table>
          ` : '<p>Borç bulunmamaktadır.</p>'}
        </div>
      </body>
    </html>
  `;
  
  // Yeni pencerede aç ve yazdır
  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
};

