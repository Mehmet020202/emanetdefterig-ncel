import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  Plus,
  Search,
  Package,
  ArrowDown,
  ArrowUp,
  Calendar,
  User,
  Edit,
  Trash2
} from 'lucide-react';
import { formatDateTime, formatMiktarWithBirim } from '@/lib/calculations';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

const Emanetler = () => {
  const { user } = useAuth();
  const { emanets, customers, emanetTypes, loading: dataLoading, addEmanet, updateEmanet, deleteEmanet } = useData();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmanet, setEditingEmanet] = useState(null);

  const [formData, setFormData] = useState({
    musteriId: '',
    turId: '',
    islemTipi: 'emanet-birak',
    miktar: '',
    aciklama: '',
    tarih: new Date().toISOString().slice(0, 16)
  });

  useEffect(() => {
    if (user && !dataLoading) {
      setLoading(false);
    }
  }, [user, dataLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Kullanıcı girişi yapılmamış!');
      return;
    }
    
    if (!formData.musteriId || !formData.turId || !formData.miktar) {
      alert('Müşteri, tür ve miktar zorunludur!');
      return;
    }

    if (parseFloat(formData.miktar) <= 0) {
      alert('Miktar sıfırdan büyük olmalıdır!');
      return;
    }

    try {
      if (editingEmanet) {
        await updateEmanet(editingEmanet.id, {
          ...formData,
          miktar: parseFloat(formData.miktar),
          tarih: formData.tarih ? new Date(formData.tarih) : new Date()
        });
      } else {
        await addEmanet({
          ...formData,
          miktar: parseFloat(formData.miktar),
          tarih: formData.tarih ? new Date(formData.tarih) : new Date()
        });
      }
      
      setDialogOpen(false);
      setEditingEmanet(null);
      setFormData({
        musteriId: '',
        turId: '',
        islemTipi: 'emanet-birak',
        miktar: '',
        aciklama: '',
        tarih: new Date().toISOString().slice(0, 16)
      });
    } catch (error) {
      console.error('Emanet kaydetme hatası:', error);
      alert('Bir hata oluştu!');
    }
  };

  const getMusteri = (musteriId) => {
    return (customers || []).find(m => m.id === musteriId);
  };

  const getTur = (turId) => {
    return (emanetTypes || []).find(t => t.id === turId);
  };

  const handleEdit = (emanet) => {
    setEditingEmanet(emanet);
    setFormData({
      musteriId: emanet.musteriId,
      turId: emanet.turId,
      islemTipi: emanet.islemTipi,
      miktar: emanet.miktar.toString(),
      aciklama: emanet.aciklama || '',
      tarih: new Date(emanet.tarih).toISOString().slice(0, 16)
    });
    setDialogOpen(true);
  };

  const handleDelete = async (emanetId) => {
    if (!user) {
      alert('Kullanıcı girişi yapılmamış!');
      return;
    }
    
    if (!confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deleteEmanet(emanetId);
      alert('İşlem başarıyla silindi!');
    } catch (error) {
      console.error('İşlem silme hatası:', error);
      alert('İşlem silinirken bir hata oluştu!');
    }
  };

  const filteredEmanetler = (emanets || []).filter(emanet => {
    const musteri = getMusteri(emanet.musteriId);
    const tur = getTur(emanet.turId);
    const searchLower = searchTerm.toLowerCase();
    
    return (
      (musteri && `${musteri.ad} ${musteri.soyad}`.toLowerCase().includes(searchLower)) ||
      (tur && tur.isim.toLowerCase().includes(searchLower)) ||
      (emanet.aciklama && emanet.aciklama.toLowerCase().includes(searchLower))
    );
  });

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık ve Arama */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Emanet ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setFormData({
                musteriId: '',
                turId: '',
                islemTipi: 'emanet-birak',
                miktar: '',
                aciklama: '',
                tarih: new Date().toISOString().slice(0, 16)
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni İşlem
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEmanet ? 'Emanet İşlemini Düzenle' : 'Yeni Emanet İşlemi'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="musteriId">Müşteri *</Label>
                <Select value={formData.musteriId} onValueChange={(value) => setFormData({ ...formData, musteriId: value })}>
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

              <div>
                <Label htmlFor="turId">Emanet Türü *</Label>
                <Select value={formData.turId} onValueChange={(value) => setFormData({ ...formData, turId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {(emanetTypes || []).map((tur) => (
                      <SelectItem key={tur.id} value={tur.id}>
                        {tur.sembol} {tur.isim}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="islemTipi">İşlem Tipi</Label>
                <Select value={formData.islemTipi} onValueChange={(value) => setFormData({ ...formData, islemTipi: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emanet-birak">Emanet Bırak</SelectItem>
                    <SelectItem value="emanet-al">Emanet Al</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="miktar">Miktar *</Label>
                <Input
                  id="miktar"
                  type="number"
                  step="0.01"
                  value={formData.miktar}
                  onChange={(e) => setFormData({ ...formData, miktar: e.target.value })}
                  placeholder="0.00"
                  required
                />
                {formData.turId && (
                  <p className="text-sm text-gray-600 mt-1">
                    Birim: {getTur(formData.turId)?.takipSekli}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="tarih">Tarih</Label>
                <Input
                  id="tarih"
                  type="datetime-local"
                  value={formData.tarih}
                  onChange={(e) => setFormData({ ...formData, tarih: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="aciklama">Açıklama</Label>
                <Textarea
                  id="aciklama"
                  value={formData.aciklama}
                  onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                  placeholder="İşlem açıklaması..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">Kaydet</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Emanet Listesi */}
      <div className="space-y-4">
        {filteredEmanetler.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Arama kriterine uygun emanet bulunamadı' : 'Henüz emanet işlemi yapılmamış'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEmanetler.map((emanet) => {
            const musteri = getMusteri(emanet.musteriId);
            const tur = getTur(emanet.turId);
            
            if (!musteri || !tur) return null;
            
            return (
              <Card key={emanet.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`${
                            emanet.islemTipi === 'emanet-birak' ? 'bg-green-100' : 'bg-red-100'
                          } p-2 rounded-full`}>
                            {emanet.islemTipi === 'emanet-birak' ? (
                              <ArrowDown className="h-5 w-5 text-green-600" />
                            ) : (
                              <ArrowUp className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {emanet.islemTipi === 'emanet-birak' ? 'Emanet Bırakıldı' : 'Emanet Alındı'}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {musteri.ad} {musteri.soyad}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDateTime(emanet.tarih)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(emanet)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(emanet.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{tur.sembol}</span>
                          <span className="font-medium">{tur.isim}</span>
                        </div>
                        <Badge variant="secondary" className={`${
                          emanet.islemTipi === 'emanet-birak' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {formatMiktarWithBirim(emanet.miktar, tur.takipSekli)}
                        </Badge>
                      </div>
                      
                      {emanet.aciklama && (
                        <p className="text-sm text-gray-600">{emanet.aciklama}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Emanetler;


