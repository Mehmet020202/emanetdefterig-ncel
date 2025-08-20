

// HTML sayfasını açma fonksiyonu
const openHTMLPage = (htmlContent, filename) => {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const newWindow = window.open(url, '_blank');
  
  if (newWindow) {
    newWindow.document.title = filename;
  }
};

// Basit PDF generator - HTML to PDF dönüşümü
export const generateGenelRapor = async (musteriListesi, emanetData, borcData, turler) => {
  try {
    // HTML içeriği oluştur
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Emanet Defteri - Genel Rapor</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 20px;
            }
            
            .container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
              overflow: hidden;
            }
            
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px;
              text-align: center;
              position: relative;
            }
            
            .header h1 {
              font-size: 2.5rem;
              font-weight: 700;
              margin-bottom: 10px;
            }
            
            .header .subtitle {
              font-size: 1.1rem;
              opacity: 0.9;
            }
            
            .report-date {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-radius: 15px;
              padding: 15px 25px;
              margin-top: 20px;
              display: inline-block;
            }
            
            .content {
              padding: 40px;
            }
            
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 40px;
            }
            
            .summary-card {
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              border-radius: 15px;
              padding: 25px;
              text-align: center;
              border: 1px solid #e2e8f0;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            .summary-icon {
              font-size: 2.5rem;
              margin-bottom: 15px;
            }
            
            .summary-number {
              font-size: 2rem;
              font-weight: 700;
              color: #667eea;
              margin-bottom: 5px;
            }
            
            .summary-label {
              color: #6b7280;
              font-weight: 500;
            }
            
            .table-container {
              background: white;
              border-radius: 15px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              border: 1px solid #e5e7eb;
            }
            
            .table-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              font-weight: 600;
              font-size: 1.1rem;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 0.9rem;
            }
            
            th {
              background: #f8fafc;
              color: #374151;
              font-weight: 600;
              padding: 15px 12px;
              text-align: left;
              border-bottom: 2px solid #e5e7eb;
              font-size: 0.85rem;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            td {
              padding: 12px;
              border-bottom: 1px solid #f3f4f6;
              vertical-align: middle;
            }
            
            tr:hover {
              background: #f8fafc;
            }
            
            .actions {
              text-align: center;
              margin-top: 40px;
              padding: 20px;
              background: #f8fafc;
              border-radius: 15px;
            }
            
            .btn {
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.3s ease;
              margin: 0 10px;
              font-size: 0.9rem;
            }
            
            .btn-primary {
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: white;
            }
            
            .btn-primary:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            }
            
            .btn-secondary {
              background: #6b7280;
              color: white;
            }
            
            .btn-secondary:hover {
              background: #4b5563;
              transform: translateY(-2px);
            }
            
            @media print {
              body {
                background: white;
                padding: 0;
              }
              
              .container {
                box-shadow: none;
                border-radius: 0;
              }
              
              .actions {
                display: none;
              }
            }
            
            @media (max-width: 768px) {
              .header h1 {
                font-size: 2rem;
              }
              
              .content {
                padding: 20px;
              }
              
              .summary-grid {
                grid-template-columns: repeat(2, 1fr);
              }
              
              table {
                font-size: 0.8rem;
              }
              
              th, td {
                padding: 8px 6px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Emanet Defteri - Genel Rapor</h1>
              <p class="subtitle">Tüm Müşteriler ve İşlemler Özeti</p>
              <div class="report-date">
                📅 Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            
            <div class="content">
              <div class="summary-grid">
                <div class="summary-card">
                  <div class="summary-icon">👥</div>
                  <div class="summary-number">${musteriListesi.length}</div>
                  <div class="summary-label">Toplam Müşteri</div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon">📦</div>
                  <div class="summary-number">${emanetData.length}</div>
                  <div class="summary-label">Emanet İşlemi</div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon">💰</div>
                  <div class="summary-number">${borcData.length}</div>
                  <div class="summary-label">Borç İşlemi</div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon">🏷️</div>
                  <div class="summary-number">${turler.length}</div>
                  <div class="summary-label">Toplam Tür</div>
                </div>
              </div>
              
              <div class="table-container">
                <div class="table-header">
                  👥 Müşteri Listesi
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>🔢 Sıra</th>
                      <th>👤 Ad Soyad</th>
                      <th>📞 Telefon</th>
                      <th>📝 Not</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${musteriListesi.map((musteri, index) => `
                      <tr>
                        <td><strong>${musteri.sira || index + 1}</strong></td>
                        <td>${musteri.ad || ''} ${musteri.soyad || ''}</td>
                        <td>${musteri.telefon || '-'}</td>
                        <td>${musteri.not || '-'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div class="actions">
              <button class="btn btn-primary" onclick="window.print()">
                🖨️ Yazdır / PDF Olarak Kaydet
              </button>
              <button class="btn btn-secondary" onclick="window.close()">
                ❌ Kapat
              </button>
            </div>
          </div>
        </body>
      </html>
    `;

    // HTML sayfasını aç
    openHTMLPage(htmlContent, `genel_rapor_${new Date().toISOString().split('T')[0]}.html`);
  } catch (error) {
    console.error('Rapor oluşturma hatası:', error);
    throw error;
  }
};

export const generateMusteriDetailPDF = async (musteri, emanetData, borcData, turler, emanetToplami, borcToplami) => {
  try {
    // Profesyonel HTML içeriği oluştur
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${musteri.ad} ${musteri.soyad} - Müşteri Detay Raporu</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 20px;
            }
            
            .container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
              overflow: hidden;
            }
            
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px;
              text-align: center;
              position: relative;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              opacity: 0.3;
            }
            
            .header h1 {
              font-size: 2.5rem;
              font-weight: 700;
              margin-bottom: 10px;
              position: relative;
              z-index: 1;
            }
            
            .header .subtitle {
              font-size: 1.1rem;
              opacity: 0.9;
              position: relative;
              z-index: 1;
            }
            
            .report-date {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-radius: 15px;
              padding: 15px 25px;
              margin-top: 20px;
              display: inline-block;
              position: relative;
              z-index: 1;
            }
            
            .content {
              padding: 40px;
            }
            
            .section {
              margin-bottom: 40px;
            }
            
            .section-title {
              font-size: 1.5rem;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 3px solid #667eea;
              position: relative;
            }
            
            .section-title::after {
              content: '';
              position: absolute;
              bottom: -3px;
              left: 0;
              width: 50px;
              height: 3px;
              background: linear-gradient(90deg, #667eea, #764ba2);
            }
            
            .customer-card {
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              border-radius: 15px;
              padding: 30px;
              border: 1px solid #e2e8f0;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            .customer-info {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
            }
            
            .info-item {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .info-icon {
              width: 40px;
              height: 40px;
              background: linear-gradient(135deg, #667eea, #764ba2);
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 600;
            }
            
            .info-content h3 {
              font-size: 0.9rem;
              color: #6b7280;
              font-weight: 500;
              margin-bottom: 5px;
            }
            
            .info-content p {
              font-size: 1.1rem;
              font-weight: 600;
              color: #1f2937;
            }
            
            .table-container {
              background: white;
              border-radius: 15px;
              overflow: hidden;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              border: 1px solid #e5e7eb;
            }
            
            .table-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              font-weight: 600;
              font-size: 1.1rem;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 0.9rem;
            }
            
            th {
              background: #f8fafc;
              color: #374151;
              font-weight: 600;
              padding: 15px 12px;
              text-align: left;
              border-bottom: 2px solid #e5e7eb;
              font-size: 0.85rem;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            td {
              padding: 12px;
              border-bottom: 1px solid #f3f4f6;
              vertical-align: middle;
            }
            
            tr:hover {
              background: #f8fafc;
            }
            
            .status-badge {
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 0.8rem;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .status-deposit {
              background: #dcfce7;
              color: #166534;
            }
            
            .status-withdraw {
              background: #fef3c7;
              color: #92400e;
            }
            
            .status-debt {
              background: #fee2e2;
              color: #991b1b;
            }
            
            .status-payment {
              background: #dbeafe;
              color: #1e40af;
            }
            
            .balance-card {
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              border-radius: 15px;
              padding: 30px;
              margin-top: 20px;
            }
            
            .balance-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
            }
            
            .balance-item {
              background: white;
              border-radius: 12px;
              padding: 20px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              border: 1px solid #e5e7eb;
            }
            
            .balance-header {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 15px;
            }
            
            .balance-icon {
              width: 35px;
              height: 35px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              font-size: 1.2rem;
            }
            
            .balance-title {
              font-weight: 600;
              color: #374151;
              font-size: 1rem;
            }
            
            .balance-amount {
              font-size: 1.5rem;
              font-weight: 700;
              margin-bottom: 5px;
            }
            
            .balance-positive {
              color: #059669;
            }
            
            .balance-negative {
              color: #dc2626;
            }
            
            .balance-neutral {
              color: #6b7280;
            }
            
            .balance-unit {
              font-size: 0.9rem;
              color: #6b7280;
              font-weight: 500;
            }
            
            .actions {
              text-align: center;
              margin-top: 40px;
              padding: 20px;
              background: #f8fafc;
              border-radius: 15px;
            }
            
            .btn {
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.3s ease;
              margin: 0 10px;
              font-size: 0.9rem;
            }
            
            .btn-primary {
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: white;
            }
            
            .btn-primary:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            }
            
            .btn-secondary {
              background: #6b7280;
              color: white;
            }
            
            .btn-secondary:hover {
              background: #4b5563;
              transform: translateY(-2px);
            }
            
            .empty-state {
              text-align: center;
              padding: 40px;
              color: #6b7280;
            }
            
            .empty-icon {
              font-size: 3rem;
              margin-bottom: 20px;
              opacity: 0.5;
            }
            
            @media print {
              body {
                background: white;
                padding: 0;
              }
              
              .container {
                box-shadow: none;
                border-radius: 0;
              }
              
              .actions {
                display: none;
              }
            }
            
            @media (max-width: 768px) {
              .header h1 {
                font-size: 2rem;
              }
              
              .content {
                padding: 20px;
              }
              
              .customer-info {
                grid-template-columns: 1fr;
              }
              
              .balance-grid {
                grid-template-columns: 1fr;
              }
              
              table {
                font-size: 0.8rem;
              }
              
              th, td {
                padding: 8px 6px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Müşteri Detay Raporu</h1>
              <p class="subtitle">Emanet Defteri - Profesyonel Rapor</p>
              <div class="report-date">
                📅 Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            
            <div class="content">
              <!-- Müşteri Bilgileri -->
              <div class="section">
                <h2 class="section-title">👤 Müşteri Bilgileri</h2>
                <div class="customer-card">
                  <div class="customer-info">
                    <div class="info-item">
                      <div class="info-icon">👤</div>
                      <div class="info-content">
                        <h3>Ad Soyad</h3>
                        <p>${musteri.ad || ''} ${musteri.soyad || ''}</p>
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="info-icon">🔢</div>
                      <div class="info-content">
                        <h3>Sıra No</h3>
                        <p>${musteri.sira || '-'}</p>
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="info-icon">📞</div>
                      <div class="info-content">
                        <h3>Telefon</h3>
                        <p>${musteri.telefon || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                    ${musteri.not ? `
                    <div class="info-item">
                      <div class="info-icon">📝</div>
                      <div class="info-content">
                        <h3>Not</h3>
                        <p>${musteri.not}</p>
                      </div>
                    </div>
                    ` : ''}
                  </div>
                </div>
              </div>
              
              <!-- Emanet İşlemleri -->
              ${emanetData.length > 0 ? `
              <div class="section">
                <h2 class="section-title">📦 Emanet İşlemleri (${emanetData.length} işlem)</h2>
                <div class="table-container">
                  <div class="table-header">
                    📊 Emanet İşlem Geçmişi
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>📅 Tarih</th>
                        <th>🕐 Saat</th>
                        <th>🏷️ Tür</th>
                        <th>📊 Miktar</th>
                        <th>🔄 İşlem</th>
                        <th>📝 Açıklama</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${emanetData.map((emanet) => {
                        const tur = turler.find(t => t.id === emanet.turId);
                        const tarih = new Date(emanet.tarih);
                        const islemTipi = emanet.islemTipi === 'emanet-birak' ? 'Bırakıldı' : 'Alındı';
                        const statusClass = emanet.islemTipi === 'emanet-birak' ? 'status-deposit' : 'status-withdraw';
                        
                        return `
                          <tr>
                            <td><strong>${tarih.toLocaleDateString('tr-TR')}</strong></td>
                            <td>${tarih.toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}</td>
                            <td>
                              <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 1.2rem;">${tur?.sembol || '📦'}</span>
                                <span>${tur ? tur.isim : 'Bilinmeyen Tür'}</span>
                              </div>
                            </td>
                            <td><strong>${emanet.miktar.toFixed(2)} ${tur?.takipSekli === 'gram' ? 'gr' : tur?.takipSekli === 'adet' ? 'adet' : 'TL'}</strong></td>
                            <td><span class="status-badge ${statusClass}">${islemTipi}</span></td>
                            <td>${emanet.aciklama || '-'}</td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
              ` : `
              <div class="section">
                <h2 class="section-title">📦 Emanet İşlemleri</h2>
                <div class="empty-state">
                  <div class="empty-icon">📦</div>
                  <h3>Emanet İşlemi Bulunmuyor</h3>
                  <p>Bu müşteriye ait emanet işlemi bulunmamaktadır.</p>
                </div>
              </div>
              `}
              
              <!-- Borç İşlemleri -->
              ${borcData.length > 0 ? `
              <div class="section">
                <h2 class="section-title">💰 Borç İşlemleri (${borcData.length} işlem)</h2>
                <div class="table-container">
                  <div class="table-header">
                    💳 Borç İşlem Geçmişi
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>📅 Tarih</th>
                        <th>🕐 Saat</th>
                        <th>🏷️ Tür</th>
                        <th>📊 Miktar</th>
                        <th>🔄 İşlem</th>
                        <th>📝 Açıklama</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${borcData.map((borc) => {
                        const tur = turler.find(t => t.id === borc.turId);
                        const tarih = new Date(borc.tarih);
                        const islemTipi = borc.islemTipi === 'borc-ver' ? 'Verildi' : 'Ödendi';
                        const statusClass = borc.islemTipi === 'borc-ver' ? 'status-debt' : 'status-payment';
                        
                        return `
                          <tr>
                            <td><strong>${tarih.toLocaleDateString('tr-TR')}</strong></td>
                            <td>${tarih.toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}</td>
                            <td>
                              <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 1.2rem;">${tur?.sembol || '💰'}</span>
                                <span>${tur ? tur.isim : 'Bilinmeyen Tür'}</span>
                              </div>
                            </td>
                            <td><strong>${borc.miktar.toFixed(2)} ${tur?.takipSekli === 'gram' ? 'gr' : tur?.takipSekli === 'adet' ? 'adet' : 'TL'}</strong></td>
                            <td><span class="status-badge ${statusClass}">${islemTipi}</span></td>
                            <td>${borc.aciklama || '-'}</td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
              ` : `
              <div class="section">
                <h2 class="section-title">💰 Borç İşlemleri</h2>
                <div class="empty-state">
                  <div class="empty-icon">💰</div>
                  <h3>Borç İşlemi Bulunmuyor</h3>
                  <p>Bu müşteriye ait borç işlemi bulunmamaktadır.</p>
                </div>
              </div>
              `}
              
              <!-- Güncel Bakiyeler -->
              <div class="section">
                <h2 class="section-title">📊 Güncel Bakiyeler</h2>
                <div class="balance-card">
                  ${Object.keys(emanetToplami).length > 0 ? `
                  <div class="balance-grid">
                    ${Object.keys(emanetToplami).map(turId => {
                      const tur = turler.find(t => t.id === turId);
                      const emanetMiktar = emanetToplami[turId] || 0;
                      const borcMiktar = borcToplami[turId] || 0;
                      const netBakiye = emanetMiktar - borcMiktar;
                      const birim = tur?.takipSekli === 'gram' ? 'gr' : tur?.takipSekli === 'adet' ? 'adet' : 'TL';
                      const balanceClass = netBakiye > 0 ? 'balance-positive' : netBakiye < 0 ? 'balance-negative' : 'balance-neutral';
                      
                      return `
                        <div class="balance-item">
                          <div class="balance-header">
                            <div class="balance-icon" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white;">
                              ${tur?.sembol || '📦'}
                            </div>
                            <div class="balance-title">${tur ? tur.isim : 'Bilinmeyen Tür'}</div>
                          </div>
                          <div class="balance-amount ${balanceClass}">
                            ${netBakiye > 0 ? '+' : ''}${netBakiye.toFixed(2)}
                          </div>
                          <div class="balance-unit">
                            Emanet: ${emanetMiktar.toFixed(2)} ${birim} | Borç: ${borcMiktar.toFixed(2)} ${birim}
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                  ` : `
                  <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h3>Bakiye Bulunmuyor</h3>
                    <p>Bu müşteriye ait bakiye bulunmamaktadır.</p>
                  </div>
                  `}
                </div>
              </div>
            </div>
            
            <div class="actions">
              <button class="btn btn-primary" onclick="window.print()">
                🖨️ Yazdır / PDF Olarak Kaydet
              </button>
              <button class="btn btn-secondary" onclick="window.close()">
                ❌ Kapat
              </button>
            </div>
          </div>
        </body>
      </html>
    `;

    // HTML sayfasını aç
    openHTMLPage(htmlContent, `${musteri.ad}_${musteri.soyad}_detay_${new Date().toISOString().split('T')[0]}.html`);
  } catch (error) {
    console.error('Rapor oluşturma hatası:', error);
    throw error;
  }
};

