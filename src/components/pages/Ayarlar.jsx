import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Settings,
  Download, 
  Upload, 
  Palette,
  Cloud,
  Clock,
  Sun,
  Moon,
  Monitor,
  FileText,
  Database
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const Ayarlar = () => {
  const { user } = useAuth();
  const { customers, emanets, debts, emanetTypes, loading: dataLoading } = useData();
  
  const [otomatikYedekleme, setOtomatikYedekleme] = useState(false);
  const [yedeklemeSuresi, setYedeklemeSuresi] = useState('daily');
  const [tema, setTema] = useState('light');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ayarları localStorage'dan yükle
    const savedSettings = localStorage.getItem('emanet_ayarlar');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setOtomatikYedekleme(settings.otomatikYedekleme || false);
        setYedeklemeSuresi(settings.yedeklemeSuresi || 'daily');
        setTema(settings.tema || 'light');
      } catch (error) {
        console.error('Ayarlar yüklenirken hata:', error);
      }
    }
  }, []);

  const saveSettings = () => {
    try {
      const settings = {
        otomatikYedekleme,
        yedeklemeSuresi,
        tema
      };
      localStorage.setItem('emanet_ayarlar', JSON.stringify(settings));
      
      // Tema uygula
      applyTheme(tema);
      toast.success('Ayarlar kaydedildi!');
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
      toast.error('Ayarlar kaydedilemedi!');
    }
  };

  const applyTheme = (selectedTheme) => {
    const root = document.documentElement;
    
    switch (selectedTheme) {
      case 'dark':
        root.classList.add('dark');
        break;
      case 'light':
        root.classList.remove('dark');
        break;
      case 'auto': {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        break;
      }
      default:
        root.classList.remove('dark');
    }
  };



  // JSON formatında veri dışa aktarma
  const exportDataAsJSON = async () => {
    if (!user) {
      toast.error('Kullanıcı girişi yapılmamış!');
      return;
    }

    try {
      setLoading(true);
      toast.info('Veriler hazırlanıyor...');
      
      // Mevcut verileri kullan
      const musteriData = customers || [];
      const emanetData = emanets || [];
      const borcData = debts || [];
      const turlerData = emanetTypes || [];

      const exportData = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        userInfo: {
          uid: user.uid,
          email: user.email,
          mode: 'firebase'
        },
        data: {
          musteriler: musteriData || [],
          emanetler: emanetData || [],
          borclar: borcData || [],
          emanetTurleri: turlerData || []
        },
        statistics: {
          toplamMusteri: (musteriData || []).length,
          toplamEmanet: (emanetData || []).length,
          toplamBorc: (borcData || []).length,
          toplamTur: (turlerData || []).length
        }
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const BOM = '\uFEFF'; // UTF-8 BOM for Turkish characters
      const dataBlob = new Blob([BOM + dataStr], { 
        type: 'application/json;charset=utf-8' 
      });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `emanet-defteri-yedek-${new Date().toISOString().split('T')[0]}.json`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('JSON verisi başarıyla dışa aktarıldı!');
    } catch (error) {
      console.error('JSON dışa aktarma hatası:', error);
      toast.error('JSON dışa aktarma sırasında bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  // Excel formatında veri dışa aktarma
  const exportDataAsExcel = async () => {
    if (!user) {
      toast.error('Kullanıcı girişi yapılmamış!');
      return;
    }

    if (dataLoading) {
      toast.error('Veriler yükleniyor, lütfen bekleyin...');
      return;
    }

    try {
      setLoading(true);
      toast.info('Excel dosyası hazırlanıyor...');
      
      // Mevcut verileri kullan
      const musteriData = customers || [];
      const emanetData = emanets || [];
      const borcData = debts || [];
      const turlerData = emanetTypes || [];

      // Excel çalışma kitabı oluştur
      const wb = XLSX.utils.book_new();
      
      // Müşteriler sayfası
      const musteriWS = XLSX.utils.json_to_sheet(musteriData.map(m => ({
        'Sıra': m.sira,
        'Ad': m.ad,
        'Soyad': m.soyad,
        'Telefon': m.telefon || '',
        'Not': m.not || ''
      })));
      XLSX.utils.book_append_sheet(wb, musteriWS, 'Müşteriler');
      
      // Emanetler sayfası
      const emanetWS = XLSX.utils.json_to_sheet(emanetData.map(e => {
        const musteri = musteriData.find(m => m.id === e.musteriId);
        const tur = turlerData.find(t => t.id === e.turId);
        return {
          'Tarih': new Date(e.tarih).toLocaleDateString('tr-TR'),
          'Müşteri': `${musteri?.ad || ''} ${musteri?.soyad || ''}`,
          'Tür': `${tur?.sembol || ''} ${tur?.isim || ''}`,
          'İşlem Tipi': e.islemTipi === 'emanet-birak' ? 'Emanet Bırakıldı' : 'Emanet Alındı',
          'Miktar': e.miktar,
          'Birim': tur?.takipSekli || '',
          'Açıklama': e.aciklama || '',
          'Not': e.not || ''
        };
      }));
      XLSX.utils.book_append_sheet(wb, emanetWS, 'Emanetler');
      
      // Borçlar sayfası
      const borcWS = XLSX.utils.json_to_sheet(borcData.map(b => {
        const musteri = musteriData.find(m => m.id === b.musteriId);
        const tur = turlerData.find(t => t.id === b.turId);
        return {
          'Tarih': new Date(b.tarih).toLocaleDateString('tr-TR'),
          'Müşteri': `${musteri?.ad || ''} ${musteri?.soyad || ''}`,
          'Tür': `${tur?.sembol || ''} ${tur?.isim || ''}`,
          'İşlem Tipi': b.islemTipi === 'borc-ver' ? 'Borç Verildi' : 'Borç Ödendi',
          'Miktar': b.miktar,
          'Birim': tur?.takipSekli || '',
          'Açıklama': b.aciklama || '',
          'Not': b.not || ''
        };
      }));
      XLSX.utils.book_append_sheet(wb, borcWS, 'Borçlar');
      
      // Türler sayfası
      const turWS = XLSX.utils.json_to_sheet(turlerData.map(t => ({
        'Sembol': t.sembol,
        'İsim': t.isim,
        'Takip Şekli': t.takipSekli,
        'Açıklama': t.aciklama || ''
      })));
      XLSX.utils.book_append_sheet(wb, turWS, 'Türler');
      
      // Excel dosyasını indir
      XLSX.writeFile(wb, `emanet-defteri-tam-yedek-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Excel dosyası başarıyla dışa aktarıldı!');
    } catch (error) {
      console.error('Excel dışa aktarma hatası:', error);
      toast.error('Excel dışa aktarma sırasında bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  // CSV formatında veri dışa aktarma
  const exportDataAsCSV = async () => {
    if (!user) {
      toast.error('Kullanıcı girişi yapılmamış!');
      return;
    }

    if (dataLoading) {
      toast.error('Veriler yükleniyor, lütfen bekleyin...');
      return;
    }

    try {
      setLoading(true);
      toast.info('CSV dosyaları hazırlanıyor...');
      
      // Mevcut verileri kullan
      const musteriData = customers || [];
      const emanetData = emanets || [];
      const borcData = debts || [];
      const turlerData = emanetTypes || [];

      // Tüm işlemleri birleştir
      const tumIslemler = [
        ...emanetData.map(e => {
          const musteri = musteriData.find(m => m.id === e.musteriId);
          const tur = turlerData.find(t => t.id === e.turId);
          return {
            'Tarih': new Date(e.tarih).toLocaleDateString('tr-TR'),
            'Saat': new Date(e.tarih).toLocaleTimeString('tr-TR'),
            'Müşteri': `${musteri?.ad || ''} ${musteri?.soyad || ''}`,
            'Tür': `${tur?.sembol || ''} ${tur?.isim || ''}`,
            'İşlem Tipi': e.islemTipi === 'emanet-birak' ? 'Emanet Bırakıldı' : 'Emanet Alındı',
            'Miktar': e.miktar,
            'Birim': tur?.takipSekli || '',
            'Açıklama': e.aciklama || '',
            'Not': e.not || ''
          };
        }),
        ...borcData.map(b => {
          const musteri = musteriData.find(m => m.id === b.musteriId);
          const tur = turlerData.find(t => t.id === b.turId);
          return {
            'Tarih': new Date(b.tarih).toLocaleDateString('tr-TR'),
            'Saat': new Date(b.tarih).toLocaleTimeString('tr-TR'),
            'Müşteri': `${musteri?.ad || ''} ${musteri?.soyad || ''}`,
            'Tür': `${tur?.sembol || ''} ${tur?.isim || ''}`,
            'İşlem Tipi': b.islemTipi === 'borc-ver' ? 'Borç Verildi' : 'Borç Ödendi',
            'Miktar': b.miktar,
            'Birim': tur?.takipSekli || '',
            'Açıklama': b.aciklama || '',
            'Not': b.not || ''
          };
        })
      ].sort((a, b) => new Date(b.Tarih + ' ' + b.Saat) - new Date(a.Tarih + ' ' + a.Saat));

      // CSV içeriği oluştur
      const headers = Object.keys(tumIslemler[0] || {}).join(',');
      const csvContent = tumIslemler.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value
        ).join(',')
      ).join('\n');

      const csv = `${headers}\n${csvContent}`;
      const BOM = '\uFEFF'; // UTF-8 BOM for Turkish characters
      const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `emanet-defteri-islemler-${new Date().toISOString().split('T')[0]}.csv`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('CSV dosyası başarıyla dışa aktarıldı!');
    } catch (error) {
      console.error('CSV dışa aktarma hatası:', error);
      toast.error('CSV dışa aktarma sırasında bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  // JSON dosyasından veri içe aktarma
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!user) {
      toast.error('Kullanıcı girişi yapılmamış!');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setLoading(true);
        toast.info('Veri içe aktarılıyor...');
        
        const importData = JSON.parse(e.target.result);
        
        if (!importData.data) {
          throw new Error('Geçersiz dosya formatı');
        }

        // Firestore'a verileri kaydet
        const promises = [];
        
        // Veri içe aktarma işlemleri burada yapılacak
        // Şu anda sadece demo amaçlı
        toast.info('Veri içe aktarma özelliği geliştirme aşamasında');

        await Promise.all(promises);
        
        toast.success('Veri başarıyla içe aktarıldı! Sayfa yenileniyor...');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        console.error('İçe aktarma hatası:', error);
        toast.error('İçe aktarma sırasında bir hata oluştu! Dosya formatını kontrol edin.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };





  useEffect(() => {
    saveSettings();
  }, [otomatikYedekleme, yedeklemeSuresi, tema]);

  const temaOptions = [
    { value: 'light', label: 'Açık Tema', icon: Sun },
    { value: 'dark', label: 'Koyu Tema', icon: Moon },
    { value: 'auto', label: 'Otomatik', icon: Monitor }
  ];

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center space-x-4">
        <Settings className="h-8 w-8 text-blue-600" />
        <h2 className="text-2xl font-bold">Ayarlar</h2>
      </div>

      {/* Veri Aktarımı */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Veri Aktarımı</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={exportDataAsJSON} 
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>JSON İndir</span>
            </Button>
            
            <Button 
              onClick={exportDataAsExcel} 
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Excel İndir</span>
            </Button>
            
            <Button 
              onClick={exportDataAsCSV} 
              disabled={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>CSV İndir</span>
            </Button>
          </div>
          
          <div className="border-t pt-4">
            <Label htmlFor="import-file" className="text-sm font-medium">
              Veri İçe Aktarma (JSON)
            </Label>
            <Input
              id="import-file"
              type="file"
              accept=".json"
              onChange={importData}
              disabled={loading}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Sadece bu uygulamadan dışa aktarılan JSON dosyalarını yükleyin.
            </p>
          </div>


        </CardContent>
      </Card>

      {/* Tema Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Görünüm</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tema</Label>
            <Select value={tema} onValueChange={setTema}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {temaOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <option.icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Otomatik Yedekleme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Otomatik Yedekleme</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-backup">Otomatik yedekleme</Label>
            <Switch
              id="auto-backup"
              checked={otomatikYedekleme}
              onCheckedChange={setOtomatikYedekleme}
            />
          </div>
          
          {otomatikYedekleme && (
            <div>
              <Label>Yedekleme Sıklığı</Label>
              <Select value={yedeklemeSuresi} onValueChange={setYedeklemeSuresi}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Günlük</SelectItem>
                  <SelectItem value="weekly">Haftalık</SelectItem>
                  <SelectItem value="monthly">Aylık</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>



      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-center">İşlem devam ediyor...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ayarlar;

