# Emanet Defteri - Netlify Deployment

Bu proje, emanet ve borç takibi için geliştirilmiş bir web uygulamasıdır. Firebase Realtime Database kullanarak gerçek zamanlı veri senkronizasyonu sağlar.

## 🚀 Netlify Deployment

### Otomatik Deployment
1. GitHub repository'nizi Netlify'a bağlayın
2. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

### Manuel Deployment
```bash
# Projeyi build edin
npm run build

# dist klasörünü Netlify'a yükleyin
```

## 🔄 Veri Senkronizasyonu

### ✅ Çoklu Cihaz Desteği
- **Aynı Google Hesabı**: Tüm cihazlarda aynı Google hesabı ile giriş yapın
- **Gerçek Zamanlı Senkronizasyon**: Firebase Realtime Database kullanılıyor
- **Anında Güncelleme**: Bir cihazda yapılan değişiklik diğerlerinde anında görünür

### 📱 Desteklenen Cihazlar
- Desktop (Windows, Mac, Linux)
- Mobile (Android, iOS)
- Tablet
- Web Browser

## 🔧 Environment Variables

Netlify'da aşağıdaki environment variable'ları ayarlayın:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 📋 Özellikler

### 🔐 Güvenlik
- Google Authentication
- Kullanıcı bazlı veri izolasyonu
- Güvenli Firebase bağlantısı

### 📊 Veri Yönetimi
- Müşteri yönetimi
- Emanet takibi
- Borç takibi
- Emanet türleri
- Raporlama

### 🗑️ Geri Dönüşüm Kutusu
- 30 gün saklama süresi
- Geri yükleme imkanı
- Kalıcı silme
- Otomatik temizlik

### 📈 Raporlama
- Genel toplam raporları
- Müşteri bazlı raporlar
- PDF export
- İnteraktif grafikler

## 🛠️ Teknolojiler

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Firebase Realtime Database
- **Authentication**: Firebase Auth
- **Deployment**: Netlify

## 📱 PWA Özellikleri

- Offline çalışma
- Push notifications
- App-like deneyim
- Responsive tasarım

## 🔄 Senkronizasyon Detayları

### Veri Akışı
1. Kullanıcı giriş yapar (Google Auth)
2. Firebase'den veriler yüklenir
3. Gerçek zamanlı dinleyiciler aktif olur
4. Değişiklikler anında senkronize olur

### Çoklu Cihaz Senaryosu
```
Cihaz A: Müşteri ekler
    ↓
Firebase Realtime Database
    ↓
Cihaz B: Anında görür
Cihaz C: Anında görür
```

## 🚀 Deployment Sonrası

1. **Domain**: Netlify otomatik domain verir
2. **SSL**: Otomatik SSL sertifikası
3. **CDN**: Global CDN ile hızlı erişim
4. **Monitoring**: Netlify Analytics

## 📞 Destek

Herhangi bir sorun yaşarsanız:
- GitHub Issues
- Firebase Console
- Netlify Support

---

**Not**: Tüm veriler Firebase'de güvenli şekilde saklanır ve sadece giriş yapan kullanıcı tarafından erişilebilir.
