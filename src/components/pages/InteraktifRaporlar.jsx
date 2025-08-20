import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  Users, 
  Package, 
  CreditCard,
  TrendingUp,
  Calendar,
  RefreshCw,
  BarChart
} from 'lucide-react';
import { 
  calculateMusteriEmanetToplami, 
  calculateMusteriBorcToplami,
  calculateNetBakiye,
  calculateGenelNetBakiye,
  getMusteriNetBakiyeDurumu,
  formatMiktarWithBirim,
  formatNetBakiye
} from '@/lib/calculations';
import { generateMusteriDetailPDF } from '@/lib/simplePdfGenerator';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from 'xlsx';

const InteraktifRaporlar = () => {
  const { user } = useAuth();
  const { customers, emanets, debts, emanetTypes, loading: dataLoading } = useData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !dataLoading) {
      setLoading(false);
    }
  }, [user, dataLoading]);

  // Müşteri detay PDF oluştur
  const handleMusteriDetay = async (musteriId) => {
    try {
      console.log('PDF oluşturma başladı, musteriId:', musteriId);
      console.log('Mevcut veriler:', {
        customers: customers.length,
        emanets: emanets.length,
        debts: debts.length,
        emanetTypes: emanetTypes.length
      });

      const musteri = customers.find(m => m.id === musteriId);
      if (!musteri) {
        console.error('Müşteri bulunamadı:', musteriId);
        toast.error('Müşteri bulunamadı!');
        return;
      }

      console.log('Müşteri bulundu:', musteri);

      const musteriEmanetler = emanets.filter(e => e.musteriId === musteriId);
      const musteriBorclar = debts.filter(b => b.musteriId === musteriId);
      
      console.log('Müşteri işlemleri:', {
        emanetler: musteriEmanetler.length,
        borclar: musteriBorclar.length
      });

      const emanetToplami = calculateMusteriEmanetToplami(musteriEmanetler, musteriId);
      const borcToplami = calculateMusteriBorcToplami(musteriBorclar, musteriId);

      console.log('Toplamlar:', {
        emanetToplami,
        borcToplami
      });

             await generateMusteriDetailPDF(musteri, musteriEmanetler, musteriBorclar, emanetTypes, emanetToplami, borcToplami);
       toast.success('PDF başarıyla oluşturuldu!');
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      toast.error('PDF oluşturulurken bir hata oluştu.');
    }
  };



  // Excel dışa aktarma fonksiyonu
  const exportToExcel = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error('Dışa aktarılacak veri bulunamadı!');
      return;
    }

    try {
      console.log('Excel export başladı:', {
        dataLength: data.length,
        firstRow: data[0],
        filename: filename
      });

      const wb = XLSXUtils.book_new();
      const ws = XLSXUtils.json_to_sheet(data);
      
      // Sütun genişliklerini ayarla
      const colWidths = Object.keys(data[0]).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;
      
      // Başlık satırını kalın yap
      const range = XLSXUtils.decode_range(ws['!ref']);
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSXUtils.encode_cell({ r: 0, c: col });
        if (ws[cellAddress]) {
          ws[cellAddress].s = { font: { bold: true } };
        }
      }
      
      XLSXUtils.book_append_sheet(wb, ws, 'Veri');
      XLSXWriteFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      console.log('Excel export tamamlandı:', filename);
      toast.success(`${filename} Excel dosyası başarıyla dışa aktarıldı!`);
    } catch (error) {
      console.error('Excel dışa aktarma hatası:', error);
      toast.error('Excel dışa aktarma sırasında bir hata oluştu.');
    }
  };

  // Dışa aktarma işleyicileri
  const handleExportCustomers = () => {
    try {
      if (!customers || customers.length === 0) {
        toast.error('Dışa aktarılacak müşteri verisi bulunamadı!');
        return;
      }

      const customerData = customers.map(musteri => {
        try {
          const netBakiyeDurumu = getMusteriNetBakiyeDurumu(emanets, debts, musteri.id);
          const netBakiyeKeys = Object.keys(netBakiyeDurumu);
          
          let netDurum = 'Dengeli';
          if (netBakiyeKeys.some(turId => netBakiyeDurumu[turId]?.tip === 'alacak')) {
            netDurum = 'Alacaklı';
          } else if (netBakiyeKeys.some(turId => netBakiyeDurumu[turId]?.tip === 'borc')) {
            netDurum = 'Borçlu';
          }

          return {
            'Sıra': musteri.sira || '',
            'Ad Soyad': `${musteri.ad || ''} ${musteri.soyad || ''}`,
            'Telefon': musteri.telefon || '-',
            'Net Durum': netDurum,
            'Aktif Tür Sayısı': netBakiyeKeys.length,
            'Not': musteri.not || '-'
          };
        } catch (error) {
          console.error('Müşteri verisi işleme hatası:', error);
          return {
            'Sıra': musteri.sira || '',
            'Ad Soyad': `${musteri.ad || ''} ${musteri.soyad || ''}`,
            'Telefon': musteri.telefon || '-',
            'Net Durum': 'Hata',
            'Aktif Tür Sayısı': 0,
            'Not': musteri.not || '-'
          };
        }
      });

      exportToExcel(customerData, 'musteri_listesi');
    } catch (error) {
      console.error('Müşteri dışa aktarma hatası:', error);
      toast.error('Müşteri verileri dışa aktarılırken bir hata oluştu.');
    }
  };

  const handleExportTransactions = () => {
    try {
      const allTransactions = [...emanets, ...debts];
      if (!allTransactions || allTransactions.length === 0) {
        toast.error('Dışa aktarılacak işlem verisi bulunamadı!');
        return;
      }

      const transactionData = allTransactions
        .sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
        .map(islem => {
          try {
            const musteri = customers.find(m => m.id === islem.musteriId);
            const tur = emanetTypes.find(t => t.id === islem.turId);
            
            const islemTipi = islem.islemTipi === 'emanet-birak' ? 'Emanet Bırakıldı' :
                             islem.islemTipi === 'emanet-al' ? 'Emanet Alındı' :
                             islem.islemTipi === 'borc-ver' ? 'Borç Verildi' : 'Borç Ödendi';
            
            return {
              'Tarih': new Date(islem.tarih).toLocaleDateString('tr-TR'),
              'Saat': new Date(islem.tarih).toLocaleTimeString('tr-TR'),
              'Müşteri': `${musteri?.ad || ''} ${musteri?.soyad || ''}`,
              'İşlem Türü': islemTipi,
              'Emanet/Borç Türü': `${tur?.sembol || ''} ${tur?.isim || ''}`,
              'Miktar': `${islem.miktar || 0} ${tur?.takipSekli === 'gram' ? 'gr' : tur?.takipSekli === 'adet' ? 'adet' : 'TL'}`,
              'Açıklama': islem.aciklama || '-',
              'Not': islem.not || '-'
            };
          } catch (error) {
            console.error('İşlem verisi işleme hatası:', error);
            return {
              'Tarih': new Date(islem.tarih || Date.now()).toLocaleDateString('tr-TR'),
              'Saat': new Date(islem.tarih || Date.now()).toLocaleTimeString('tr-TR'),
              'Müşteri': 'Bilinmeyen',
              'İşlem Türü': 'Hata',
              'Emanet/Borç Türü': '-',
              'Miktar': '0',
              'Açıklama': '-',
              'Not': '-'
            };
          }
        });

      exportToExcel(transactionData, 'islem_gecmisi');
    } catch (error) {
      console.error('İşlem dışa aktarma hatası:', error);
      toast.error('İşlem verileri dışa aktarılırken bir hata oluştu.');
    }
  };

  const handleExportNetBalance = () => {
    try {
      if (!customers || customers.length === 0) {
        toast.error('Dışa aktarılacak veri bulunamadı!');
        return;
      }

      const netBalanceData = [];
      
      customers.forEach(musteri => {
        try {
          const netBakiye = calculateNetBakiye(emanets, debts, musteri.id);
          
          Object.keys(netBakiye).forEach(turId => {
            try {
              const tur = emanetTypes.find(t => t.id === turId);
              const miktar = netBakiye[turId];
              
              if (miktar !== 0) {
                netBalanceData.push({
                  'Müşteri': `${musteri.ad || ''} ${musteri.soyad || ''}`,
                  'Tür': `${tur?.sembol || ''} ${tur?.isim || ''}`,
                  'Net Bakiye': formatNetBakiye(miktar, tur),
                  'Durum': miktar > 0 ? 'Alacak' : 'Borç',
                  'Miktar': Math.abs(miktar).toFixed(2)
                });
              }
            } catch (error) {
              console.error('Tür hesaplama hatası:', error);
            }
          });
        } catch (error) {
          console.error('Müşteri net bakiye hesaplama hatası:', error);
        }
      });

      exportToExcel(netBalanceData, 'net_bakiye_raporu');
    } catch (error) {
      console.error('Net bakiye dışa aktarma hatası:', error);
      toast.error('Net bakiye verileri dışa aktarılırken bir hata oluştu.');
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">İnteraktif Raporlar</h1>
          <p className="text-gray-600 mt-2">Net bakiye sistemi ile detaylı analiz ve veri dışa aktarma</p>
        </div>

      </div>

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="customers">Müşteriler</TabsTrigger>
          <TabsTrigger value="transactions">İşlem Geçmişi</TabsTrigger>
          <TabsTrigger value="netbalance">Net Bakiye</TabsTrigger>
          <TabsTrigger value="summary">Özet Rapor</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Müşteri Listesi
                  </CardTitle>
                  <CardDescription>
                    Toplam {customers.length} müşteri
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleExportCustomers} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    CSV İndir
                  </Button>
                  <Button onClick={() => exportToExcel(customers.map(m => ({
                    'Sıra': m.sira,
                    'Ad': m.ad,
                    'Soyad': m.soyad,
                    'Telefon': m.telefon || '-',
                    'Not': m.not || '-'
                  })), 'musteriler')} variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Excel İndir
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Sıra</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Ad Soyad</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Telefon</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Net Durum</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((musteri, index) => {
                      try {
                        const netBakiyeDurumu = getMusteriNetBakiyeDurumu(emanets, debts, musteri.id);
                        const netBakiyeKeys = Object.keys(netBakiyeDurumu);
                        
                        let netDurum = 'Dengeli';
                        let durumRenk = 'secondary';
                        
                        if (netBakiyeKeys.some(turId => netBakiyeDurumu[turId]?.tip === 'alacak')) {
                          netDurum = 'Alacaklı';
                          durumRenk = 'success';
                        } else if (netBakiyeKeys.some(turId => netBakiyeDurumu[turId]?.tip === 'borc')) {
                          netDurum = 'Borçlu';
                          durumRenk = 'destructive';
                        }

                        return (
                          <tr key={musteri.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-4 py-2">{musteri.sira || ''}</td>
                            <td className="border border-gray-300 px-4 py-2">
                              <div>
                                <div className="font-medium">{musteri.ad || ''} {musteri.soyad || ''}</div>
                                {musteri.not && (
                                  <div className="text-sm text-gray-500 mt-1">{musteri.not}</div>
                                )}
                              </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">{musteri.telefon || '-'}</td>
                            <td className="border border-gray-300 px-4 py-2">
                              <Badge variant={durumRenk}>{netDurum}</Badge>
                              {netBakiyeKeys.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {netBakiyeKeys.map(turId => {
                                    try {
                                      const tur = emanetTypes.find(t => t.id === turId);
                                      const durum = netBakiyeDurumu[turId];
                                      const isAlacak = durum?.tip === 'alacak';
                                      const isBorc = durum?.tip === 'borc';
                                      
                                      return (
                                        <div key={turId} className={`text-xs ${isAlacak ? 'text-green-600' : isBorc ? 'text-red-600' : 'text-gray-600'}`}>
                                          {tur?.sembol || ''} {formatMiktarWithBirim(durum?.miktar || 0, tur?.takipSekli)}
                                          {isAlacak && ' (Alacak)'}
                                          {isBorc && ' (Borç)'}
                                        </div>
                                      );
                                    } catch (error) {
                                      console.error('Tür görüntüleme hatası:', error);
                                      return <div key={turId} className="text-xs text-red-500">Hata</div>;
                                    }
                                  })}
                                </div>
                              )}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => handleMusteriDetay(musteri.id)}
                                  size="sm"
                                  variant="outline"
                                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                >
                                  <FileText className="w-4 h-4 mr-1" />
                                  PDF İndir
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      } catch (error) {
                        console.error('Müşteri satırı işleme hatası:', error);
                        return (
                          <tr key={musteri.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-4 py-2">{musteri.sira || ''}</td>
                            <td className="border border-gray-300 px-4 py-2">
                              <div>
                                <div className="font-medium">{musteri.ad || ''} {musteri.soyad || ''}</div>
                                <div className="text-sm text-red-500">Hata</div>
                              </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">{musteri.telefon || '-'}</td>
                            <td className="border border-gray-300 px-4 py-2">
                              <Badge variant="destructive">Hata</Badge>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => handleMusteriDetay(musteri.id)}
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="bg-gray-50 text-gray-400 border-gray-200"
                                >
                                  <FileText className="w-4 h-4 mr-1" />
                                  PDF İndir
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    İşlem Geçmişi
                  </CardTitle>
                  <CardDescription>
                    Toplam {emanets.length + debts.length} işlem
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleExportTransactions} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Excel İndir
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Tarih</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Müşteri</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">İşlem</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Tür</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Miktar</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Not</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...emanets, ...debts]
                      .sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
                      .slice(0, 50)
                      .map((islem, index) => {
                        try {
                          const musteri = customers.find(m => m.id === islem.musteriId);
                          const tur = emanetTypes.find(t => t.id === islem.turId);
                          const islemTipi = islem.islemTipi === 'emanet-birak' ? '📦 Emanet Bırakıldı' :
                                           islem.islemTipi === 'emanet-al' ? '📤 Emanet Alındı' :
                                           islem.islemTipi === 'borc-ver' ? '💰 Borç Verildi' : '💳 Borç Ödendi';

                          return (
                            <tr key={islem.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="border border-gray-300 px-4 py-2">
                                {new Date(islem.tarih || Date.now()).toLocaleDateString('tr-TR')}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {musteri?.ad || ''} {musteri?.soyad || ''}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">{islemTipi}</td>
                              <td className="border border-gray-300 px-4 py-2">
                                {tur?.sembol || ''} {tur?.isim || ''}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {islem.miktar || 0} {tur?.takipSekli === 'gram' ? 'gr' : tur?.takipSekli === 'adet' ? 'adet' : 'TL'}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {islem.not || islem.aciklama || '-'}
                              </td>
                            </tr>
                          );
                        } catch (error) {
                          console.error('İşlem satırı işleme hatası:', error);
                          return (
                            <tr key={islem.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="border border-gray-300 px-4 py-2">
                                {new Date(islem.tarih || Date.now()).toLocaleDateString('tr-TR')}
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                <span className="text-red-500">Hata</span>
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                <span className="text-red-500">Hata</span>
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                <span className="text-red-500">Hata</span>
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                <span className="text-red-500">Hata</span>
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                <span className="text-red-500">Hata</span>
                              </td>
                            </tr>
                          );
                        }
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="netbalance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Net Bakiye Raporu
                  </CardTitle>
                  <CardDescription>
                    Müşteri bazında net alacak/borç durumu
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleExportNetBalance} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Excel İndir
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Müşteri</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Tür</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Net Bakiye</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(musteri => {
                      try {
                        const netBakiye = calculateNetBakiye(emanets, debts, musteri.id);
                        const netBakiyeKeys = Object.keys(netBakiye).filter(turId => netBakiye[turId] !== 0);
                        
                        if (netBakiyeKeys.length === 0) return null;
                        
                        return netBakiyeKeys.map((turId, index) => {
                          try {
                            const tur = emanetTypes.find(t => t.id === turId);
                            const miktar = netBakiye[turId];
                            const durum = miktar > 0 ? 'Alacak' : 'Borç';
                            const durumRenk = miktar > 0 ? 'success' : 'destructive';
                            
                            return (
                              <tr key={`${musteri.id}-${turId}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-gray-300 px-4 py-2">
                                  {musteri.ad || ''} {musteri.soyad || ''}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {tur?.sembol || ''} {tur?.isim || ''}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 font-mono">
                                  {formatNetBakiye(miktar, tur)}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  <Badge variant={durumRenk}>{durum}</Badge>
                                </td>
                              </tr>
                            );
                          } catch (error) {
                            console.error('Net bakiye satırı işleme hatası:', error);
                            return (
                              <tr key={`${musteri.id}-${turId}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-gray-300 px-4 py-2">
                                  {musteri.ad || ''} {musteri.soyad || ''}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  <span className="text-red-500">Hata</span>
                                </td>
                                <td className="border border-gray-300 px-4 py-2 font-mono">
                                  <span className="text-red-500">Hata</span>
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  <Badge variant="destructive">Hata</Badge>
                                </td>
                              </tr>
                            );
                          }
                        });
                      } catch (error) {
                        console.error('Müşteri net bakiye hesaplama hatası:', error);
                        return null;
                      }
                    }).filter(Boolean)}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Müşteri Özeti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Toplam Müşteri:</span>
                    <span className="font-semibold">{customers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alacaklı Müşteri:</span>
                    <span className="font-semibold text-green-600">
                      {customers.filter(m => {
                        try {
                          const netBakiyeDurumu = getMusteriNetBakiyeDurumu(emanets, debts, m.id);
                          return Object.keys(netBakiyeDurumu).some(turId => netBakiyeDurumu[turId]?.tip === 'alacak');
                        } catch (error) {
                          console.error('Alacaklı müşteri hesaplama hatası:', error);
                          return false;
                        }
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Borçlu Müşteri:</span>
                    <span className="font-semibold text-red-600">
                      {customers.filter(m => {
                        try {
                          const netBakiyeDurumu = getMusteriNetBakiyeDurumu(emanets, debts, m.id);
                          return Object.keys(netBakiyeDurumu).some(turId => netBakiyeDurumu[turId]?.tip === 'borc');
                        } catch (error) {
                          console.error('Borçlu müşteri hesaplama hatası:', error);
                          return false;
                        }
                      }).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  İşlem Özeti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Toplam İşlem:</span>
                    <span className="font-semibold">{emanets.length + debts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emanet İşlemi:</span>
                    <span className="font-semibold text-blue-600">{emanets.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Borç İşlemi:</span>
                    <span className="font-semibold text-orange-600">{debts.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Tür Özeti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Toplam Tür:</span>
                    <span className="font-semibold">{emanetTypes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aktif Tür:</span>
                    <span className="font-semibold text-purple-600">
                      {emanetTypes.filter(tur => {
                        try {
                          const turEmanetler = emanets.filter(e => e.turId === tur.id);
                          const turBorclar = debts.filter(b => b.turId === tur.id);
                          return turEmanetler.length > 0 || turBorclar.length > 0;
                        } catch (error) {
                          console.error('Aktif tür hesaplama hatası:', error);
                          return false;
                        }
                      }).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Genel Net Bakiye
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(() => {
                    try {
                      const genelNetBakiye = calculateGenelNetBakiye(emanets, debts, customers);
                      const genelNetBakiyeKeys = Object.keys(genelNetBakiye);
                      
                      if (genelNetBakiyeKeys.length === 0) {
                        return (
                          <div className="text-center text-gray-500 py-4">
                            Henüz net bakiye hesaplanamadı
                          </div>
                        );
                      }
                      
                      return genelNetBakiyeKeys.map(turId => {
                        try {
                          const tur = emanetTypes.find(t => t.id === turId);
                          const miktar = genelNetBakiye[turId];
                          const isAlacak = miktar > 0;
                          const isBorc = miktar < 0;
                          
                          return (
                            <div key={turId} className="flex justify-between items-center">
                              <span className="text-sm">{tur?.sembol || ''} {tur?.isim || ''}:</span>
                              <span className={`font-semibold text-sm ${isAlacak ? 'text-green-600' : isBorc ? 'text-red-600' : 'text-gray-600'}`}>
                                {formatMiktarWithBirim(Math.abs(miktar), tur?.takipSekli)}
                                {isAlacak && ' (Alacak)'}
                                {isBorc && ' (Borç)'}
                              </span>
                            </div>
                          );
                        } catch (error) {
                          console.error('Genel net bakiye görüntüleme hatası:', error);
                          return (
                            <div key={turId} className="flex justify-between items-center">
                              <span className="text-sm text-red-500">Hata</span>
                              <span className="text-sm text-red-500">Hata</span>
                            </div>
                          );
                        }
                      });
                    } catch (error) {
                      console.error('Genel net bakiye hesaplama hatası:', error);
                      return (
                        <div className="text-center text-red-500 py-4">
                          Net bakiye hesaplanırken hata oluştu
                        </div>
                      );
                    }
                  })()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-5 h-5" />
                  Tür Detayları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Toplam Tür:</span>
                    <span className="font-semibold">{emanetTypes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gram Takipli:</span>
                    <span className="font-semibold">{emanetTypes.filter(t => t.takipSekli === 'gram').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TL Takipli:</span>
                    <span className="font-semibold">{emanetTypes.filter(t => t.takipSekli === 'tl').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteraktifRaporlar;

