import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, Package, CreditCard, Eye, EyeOff, Search, Plus, UserPlus } from 'lucide-react';
import { 
  calculateGenelEmanetToplami, 
  calculateGenelBorcToplami,
  formatMiktarWithBirim 
} from '@/lib/calculations';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

const GenelToplam = () => {
  const { user } = useAuth();
  const { customers, emanets, debts, emanetTypes, loading: dataLoading, addCustomer } = useData();
  const [loading, setLoading] = useState(true);
  const [showBorcluNames, setShowBorcluNames] = useState(false);

  const [stats, setStats] = useState({
    toplamMusteri: 0,
    toplamEmanetTuru: 0,
    toplamBorcTuru: 0
  });

  // Müşteri arama ve ekleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    ad: '',
    soyad: '',
    telefon: '',
    email: '',
    adres: ''
  });

  useEffect(() => {
    if (user && !dataLoading) {
      // İstatistikleri hesapla
      const emanetToplami = calculateGenelEmanetToplami(emanets || []);
      const borcToplami = calculateGenelBorcToplami(debts || []);

      setStats({
        toplamMusteri: (customers || []).length,
        toplamEmanetTuru: Object.keys(emanetToplami).filter(turId => emanetToplami[turId] > 0).length,
        toplamBorcTuru: Object.keys(borcToplami).filter(turId => borcToplami[turId] > 0).length
      });
      
      setLoading(false);
    }
  }, [user, dataLoading, customers, emanets, debts]);

  // Müşteri arama fonksiyonu
  const filteredCustomers = (customers || []).filter(musteri => {
    const searchLower = searchTerm.toLowerCase();
    return (
      musteri.ad?.toLowerCase().includes(searchLower) ||
      musteri.soyad?.toLowerCase().includes(searchLower) ||
      musteri.telefon?.includes(searchTerm) ||
      musteri.email?.toLowerCase().includes(searchLower)
    );
  });

  // Yeni müşteri ekleme fonksiyonu
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);

  const handleAddCustomer = async () => {
    if (isAddingCustomer) return; // Çift tıklamayı önle
    
    if (!user || !newCustomer.ad || !newCustomer.soyad) {
      alert('Ad ve soyad alanları zorunludur!');
      return;
    }

    setIsAddingCustomer(true);

    try {
      const customerData = {
        ad: newCustomer.ad.trim(),
        soyad: newCustomer.soyad.trim(),
        telefon: newCustomer.telefon.trim(),
        email: newCustomer.email.trim(),
        adres: newCustomer.adres.trim()
      };

      const newCustomerResult = await addCustomer(customerData);
      
      // Formu temizle
      setNewCustomer({
        ad: '',
        soyad: '',
        telefon: '',
        email: '',
        adres: ''
      });
      
      // Dialog'u kapat
      setIsAddDialogOpen(false);
      
      alert('Müşteri başarıyla eklendi!');
      
      // Yeni müşteri kartına yönlendir
      if (newCustomerResult && newCustomerResult.id) {
        window.location.href = `/musteri-detay/${newCustomerResult.id}`;
      }
    } catch (error) {
      console.error('Müşteri ekleme hatası:', error);
      if (error.message.includes('zaten mevcut')) {
        alert(error.message);
      } else {
        alert('Müşteri eklenirken hata oluştu!');
      }
    } finally {
      setIsAddingCustomer(false);
    }
  };

  const emanetToplami = calculateGenelEmanetToplami(emanets || []);
  const borcToplami = calculateGenelBorcToplami(debts || []);

  // Borçlu müşterileri getir
  const getBorcluMusteriler = (turId) => {
    const borcluMusteriler = [];
    
    (customers || []).forEach(musteri => {
      const musteriBorclari = (debts || []).filter(b => b.musteriId === musteri.id && b.turId === turId);
      let toplam = 0;
      
      musteriBorclari.forEach(borc => {
        if (borc.islemTipi === 'borc-ver') {
          toplam += parseFloat(borc.miktar || 0);
        } else if (borc.islemTipi === 'borc-ode') {
          toplam -= parseFloat(borc.miktar || 0);
        }
      });
      
      if (toplam > 0) {
        borcluMusteriler.push({
          musteri,
          miktar: toplam
        });
      }
    });
    
    return borcluMusteriler;
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
      {/* Müşteri Arama ve Ekleme Bölümü */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Müşteri Yönetimi</span>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Müşteri Ekle</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ad" className="text-right">Ad *</Label>
                    <Input
                      id="ad"
                      value={newCustomer.ad}
                      onChange={(e) => setNewCustomer({...newCustomer, ad: e.target.value})}
                      className="col-span-3"
                      placeholder="Müşteri adı"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="soyad" className="text-right">Soyad *</Label>
                    <Input
                      id="soyad"
                      value={newCustomer.soyad}
                      onChange={(e) => setNewCustomer({...newCustomer, soyad: e.target.value})}
                      className="col-span-3"
                      placeholder="Müşteri soyadı"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="telefon" className="text-right">Telefon</Label>
                    <Input
                      id="telefon"
                      value={newCustomer.telefon}
                      onChange={(e) => setNewCustomer({...newCustomer, telefon: e.target.value})}
                      className="col-span-3"
                      placeholder="Telefon numarası"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                      className="col-span-3"
                      placeholder="E-posta adresi"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="adres" className="text-right">Adres</Label>
                    <Input
                      id="adres"
                      value={newCustomer.adres}
                      onChange={(e) => setNewCustomer({...newCustomer, adres: e.target.value})}
                      className="col-span-3"
                      placeholder="Adres bilgisi"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button 
                    onClick={handleAddCustomer}
                    disabled={isAddingCustomer}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isAddingCustomer ? 'Ekleniyor...' : 'Müşteri Ekle'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Müşteri Arama */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Müşteri ara (ad, soyad, telefon, e-posta)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Müşteri Listesi */}
            {searchTerm && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Arama Sonuçları ({filteredCustomers.length})
                </h4>
                {filteredCustomers.length === 0 ? (
                  <p className="text-sm text-gray-500">Müşteri bulunamadı</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredCustomers.map((musteri) => (
                      <div 
                        key={musteri.id} 
                        className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => window.location.href = `/musteri-detay/${musteri.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{musteri.ad} {musteri.soyad}</p>
                            {musteri.telefon && (
                              <p className="text-sm text-gray-600">{musteri.telefon}</p>
                            )}
                            {musteri.email && (
                              <p className="text-sm text-gray-600">{musteri.email}</p>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            Müşteri
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.toplamMusteri}</p>
                <p className="text-sm text-gray-600">Toplam Müşteri</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.toplamEmanetTuru}</p>
                <p className="text-sm text-gray-600">Emanet Türü</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.toplamBorcTuru}</p>
                <p className="text-sm text-gray-600">Borç Türü</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emanet Toplamları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-green-600" />
            <span>Emanet Toplamları</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(emanetToplami).filter(turId => emanetToplami[turId] > 0).length === 0 ? (
            <p className="text-gray-500 text-center py-4">Henüz emanet bulunmuyor</p>
          ) : (
            <div className="space-y-3">
              {Object.keys(emanetToplami)
                .filter(turId => emanetToplami[turId] > 0)
                .map(turId => {
                  const tur = (emanetTypes || []).find(t => t.id === turId);
                  if (!tur) return null;
                  
                  return (
                    <div key={turId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{tur.sembol}</span>
                        <div>
                          <p className="font-medium">{tur.isim}</p>
                          <p className="text-sm text-gray-600">{tur.aciklama}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {formatMiktarWithBirim(emanetToplami[turId], tur.takipSekli)}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Borç Toplamları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-red-600" />
              <span>Borç Toplamları</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBorcluNames(!showBorcluNames)}
            >
              {showBorcluNames ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showBorcluNames ? 'İsimleri Gizle' : 'İsimleri Göster'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(borcToplami).filter(turId => borcToplami[turId] > 0).length === 0 ? (
            <p className="text-gray-500 text-center py-4">Henüz borç bulunmuyor</p>
          ) : (
            <div className="space-y-4">
              {Object.keys(borcToplami)
                .filter(turId => borcToplami[turId] > 0)
                .map(turId => {
                  const tur = (emanetTypes || []).find(t => t.id === turId);
                  if (!tur) return null;
                  
                  const borcluMusteriler = getBorcluMusteriler(turId);
                  
                  return (
                    <div key={turId} className="p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{tur.sembol}</span>
                          <div>
                            <p className="font-medium">{tur.isim}</p>
                            <p className="text-sm text-gray-600">{tur.aciklama}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">
                            {formatMiktarWithBirim(borcToplami[turId], tur.takipSekli)}
                          </p>
                        </div>
                      </div>
                      
                      {showBorcluNames && borcluMusteriler.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-red-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">Borçlu Müşteriler:</p>
                          <div className="flex flex-wrap gap-2">
                            {borcluMusteriler.map(({ musteri, miktar }) => (
                              <Badge key={musteri.id} variant="secondary" className="text-xs">
                                {musteri.ad} {musteri.soyad} - {formatMiktarWithBirim(miktar, tur.takipSekli)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GenelToplam;

