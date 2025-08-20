import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  User
} from 'lucide-react';
import { 
  calculateMusteriEmanetToplami, 
  calculateMusteriBorcToplami
} from '@/lib/calculations';
import { useData } from '@/contexts/DataContext';
import { generateGenelRapor, generateMusteriDetailPDF } from '@/lib/simplePdfGenerator';

const Raporlar = () => {
  
  const { emanets, debts, customers, emanetTypes, loading: dataLoading } = useData();
  const [loading, setLoading] = useState(true);
  const [selectedMusteri, setSelectedMusteri] = useState('');
  const [raporTipi, setRaporTipi] = useState('genel');

  useEffect(() => {
    if (!dataLoading) {
      setLoading(false);
    }
  }, [dataLoading]);

  const generatePDF = async () => {
    try {
      if (raporTipi === 'genel') {
        // Genel rapor için yeni PDF generator kullan
        await generateGenelRapor(customers || [], emanets || [], debts || [], emanetTypes || []);
      } else if (raporTipi === 'musteri' && selectedMusteri) {
        // Müşteri raporu için yeni PDF generator kullan
        const musteri = (customers || []).find(m => m.id === selectedMusteri);
        if (musteri) {
          const musteriEmanetler = (emanets || []).filter(e => e.musteriId === selectedMusteri);
          const musteriBorclar = (debts || []).filter(b => b.musteriId === selectedMusteri);
          const emanetToplami = calculateMusteriEmanetToplami(emanets || [], selectedMusteri);
          const borcToplami = calculateMusteriBorcToplami(debts || [], selectedMusteri);
          
          await generateMusteriDetailPDF(musteri, musteriEmanetler, musteriBorclar, emanetTypes || [], emanetToplami, borcToplami);
        }
      }
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken bir hata oluştu.');
    }
  };

  const getRaporOnizleme = () => {
    if (raporTipi === 'genel') {
      // Genel rapor önizlemesi için basit istatistikler
      const toplamMusteri = customers?.length || 0;
      const toplamEmanet = emanets?.length || 0;
      const toplamBorc = debts?.length || 0;
      const toplamTur = emanetTypes?.length || 0;
      
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Genel İstatistikler
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span>Toplam Müşteri:</span>
                <Badge variant="secondary">{toplamMusteri}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span>Toplam Emanet Türü:</span>
                <Badge variant="secondary">{toplamTur}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span>Toplam Emanet İşlemi:</span>
                <Badge variant="secondary">{toplamEmanet}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded">
                <span>Toplam Borç İşlemi:</span>
                <Badge variant="secondary">{toplamBorc}</Badge>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (raporTipi === 'musteri' && selectedMusteri) {
      const musteri = (customers || []).find(m => m.id === selectedMusteri);
      if (!musteri) return null;
      
      const emanetToplami = calculateMusteriEmanetToplami(emanets || [], selectedMusteri);
      const borcToplami = calculateMusteriBorcToplami(debts || [], selectedMusteri);
      
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Müşteri Bilgileri
            </h3>
            <div className="space-y-1 text-sm">
              <p><strong>Ad Soyad:</strong> {musteri.ad} {musteri.soyad}</p>
              <p><strong>Sıra No:</strong> {musteri.sira}</p>
              {musteri.telefon && <p><strong>Telefon:</strong> {musteri.telefon}</p>}
              {musteri.not && <p><strong>Not:</strong> {musteri.not}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Emanet Durumu</h4>
              <p className="text-sm">
                {Object.keys(emanetToplami).filter(turId => emanetToplami[turId] > 0).length > 0 
                  ? `${Object.keys(emanetToplami).filter(turId => emanetToplami[turId] > 0).length} tür emanet` 
                  : 'Emanet bulunmuyor'}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Borç Durumu</h4>
              <p className="text-sm">
                {Object.keys(borcToplami).filter(turId => borcToplami[turId] > 0).length > 0 
                  ? `${Object.keys(borcToplami).filter(turId => borcToplami[turId] > 0).length} tür borç` 
                  : 'Borç bulunmuyor'}
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return <p className="text-gray-500">Rapor önizlemesi için gerekli seçimleri yapın</p>;
  };

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rapor Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Rapor Ayarları</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rapor Tipi</label>
              <Select value={raporTipi} onValueChange={setRaporTipi}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="genel">Genel Toplam</SelectItem>
                  <SelectItem value="musteri">Müşteri Bazlı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {raporTipi === 'musteri' && (
              <div>
                <label className="block text-sm font-medium mb-2">Müşteri</label>
                <Select value={selectedMusteri} onValueChange={setSelectedMusteri}>
                  <SelectTrigger>
                    <SelectValue placeholder="Müşteri seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {(customers || []).map((musteri) => (
                      <SelectItem key={musteri.id} value={musteri.id}>
                        {musteri.sira}. {musteri.ad} {musteri.soyad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={generatePDF}
              disabled={raporTipi === 'musteri' && !selectedMusteri}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF İndir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rapor Önizleme */}
      <Card>
        <CardHeader>
          <CardTitle>Rapor Önizleme</CardTitle>
        </CardHeader>
        <CardContent>
          {getRaporOnizleme()}
        </CardContent>
      </Card>
    </div>
  );
};

export default Raporlar;

