import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import Layout from './components/Layout'
import Login from './components/pages/Login'
import GenelToplam from './components/pages/GenelToplam'
import Musteriler from './components/pages/Musteriler'
import MusteriDetay from './components/pages/MusteriDetay'
import Emanetler from './components/pages/Emanetler'
import Borclar from './components/pages/Borclar'
import EmanetTurleri from './components/pages/EmanetTurleri'
import Raporlar from './components/pages/Raporlar'
import InteraktifRaporlar from './components/pages/InteraktifRaporlar'
import GeriDonusumKutusu from './components/pages/GeriDonusumKutusu'
import Ayarlar from './components/pages/Ayarlar'
import ErrorBoundary from './components/ErrorBoundary'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import './App.css'

// MusteriDetay wrapper bileşeni
const MusteriDetayWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/musteriler');
  };
  
  return <MusteriDetay musteriId={id} onBack={handleBack} />;
};

// Ana uygulama bileşeni
const AppContent = () => {
  const { user, loading } = useAuth()

  // Yükleniyor durumu
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Kullanıcı giriş yapmamışsa login sayfasını göster
  if (!user) {
    return <Login />
  }

  // Kullanıcı giriş yapmışsa ana uygulamayı göster
  return (
    <DataProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/genel-toplam" />} />
          <Route path="/genel-toplam" element={<GenelToplam />} />
          <Route path="/musteriler" element={<Musteriler />} />
          <Route path="/musteri-detay/:id" element={<MusteriDetayWrapper />} />
          <Route path="/emanetler" element={<Emanetler />} />
          <Route path="/borclar" element={<Borclar />} />
          <Route path="/emanet-turleri" element={<EmanetTurleri />} />
          <Route path="/raporlar" element={<Raporlar />} />
          <Route path="/interaktif-raporlar" element={<InteraktifRaporlar />} />
          <Route path="/geri-donusum-kutusu" element={<GeriDonusumKutusu />} />
          <Route path="/ayarlar" element={<Ayarlar />} />
          <Route path="*" element={<Navigate to="/genel-toplam" />} />
        </Routes>
        <PWAInstallPrompt />
      </Layout>
    </DataProvider>
  )
}

// Ana App bileşeni - AuthProvider ile sarılmış
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App


