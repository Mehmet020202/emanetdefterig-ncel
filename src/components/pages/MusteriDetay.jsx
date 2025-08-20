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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  ArrowLeft,
  Plus, 
  Minus,
  Package, 
  CreditCard,
  Calendar,
  FileText,
  Download,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { 
  calculateMusteriEmanetToplami, 
  calculateMusteriBorcToplami,
  formatMiktarWithBirim,
  formatDateTime
} from '@/lib/calculations';
import { generateMusteriDetailPDF } from '@/lib/simplePdfGenerator';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

const MusteriDetay = ({ musteriId, onBack }) => {
  const { user } = useAuth();
  const { customers, emanets, debts, emanetTypes, loading: dataLoading, addEmanet, addDebt, updateEmanet, updateDebt, deleteEmanet, deleteDebt } = useData();
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [emanetDialogOpen, setEmanetDialogOpen] = useState(false);
  const [iadeDialogOpen, setIadeDialogOpen] = useState(false);
  const [borcDialogOpen, setBorcDialogOpen] = useState(false);
  const [odemeDialogOpen, setOdemeDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Form states
  const [emanetForm, setEmanetForm] = useState({ turId: '', miktar: '', aciklama: '' });
  const [iadeForm, setIadeForm] = useState({ turId: '', miktar: '', aciklama: '' });
  const [borcForm, setBorcForm] = useState({ turId: '', miktar: '', aciklama: '' });
  const [odemeForm, setOdemeForm] = useState({ turId: '', miktar: '', aciklama: '' });
  const [editForm, setEditForm] = useState({ id: '', turId: '', miktar: '', aciklama: '', tip: '' });

  useEffect(() => {
    if (musteriId && user && !dataLoading) {
      setLoading(false);
    }
  }, [musteriId, user, dataLoading]);

  // Müşteri bilgilerini al
  const musteri = (customers || []).find(m => m.id === musteriId);
  const musteriEmanetleri = (emanets || []).filter(e => e.musteriId === musteriId);
  const musteriBorclari = (debts || []).filter(b => b.musteriId === musteriId);
  
  console.log('Müşteri detay sayfası - emanetTypes:', emanetTypes);
  console.log('Müşteri detay sayfası - musteri:', musteri);

  const handleEmanetEkle = async () => {
    if (!user) {
      toast.error('Kullanıcı girişi yapılmamış!');
      return;
    }
    
    if (!emanetForm.turId || !emanetForm.miktar || parseFloat(emanetForm.miktar) <= 0) {
      toast.error('Tür ve geçerli miktar seçiniz!');
      return;
    }

    try {
      await addEmanet({
        musteriId,
        turId: emanetForm.turId,
        islemTipi: 'emanet-birak',
        miktar: parseFloat(emanetForm.miktar),
        aciklama: emanetForm.aciklama || 'Emanet eklendi',
        tarih: new Date()
      });
      toast.success('Emanet başarıyla eklendi');
      
      setEmanetDialogOpen(false);
      setEmanetForm({ turId: '', miktar: '', aciklama: '' });
    } catch (error) {
      console.error('Emanet ekleme hatası:', error);
      toast.error('Emanet eklenirken bir hata oluştu');
    }
  };

  const handleIadeEt = async () => {
    if (!user) {
      toast.error('Kullanıcı girişi yapılmamış!');
      return;
    }
    
    if (!iadeForm.turId || !iadeForm.miktar || parseFloat(iadeForm.miktar) <= 0) {
      toast.error('Tür ve geçerli miktar seçiniz!');
      return;
    }

    // Mevcut emanet miktarını kontrol et
    const emanetToplami = calculateMusteriEmanetToplami(musteriEmanetleri, musteriId);
    const mevcutMiktar = emanetToplami[iadeForm.turId] || 0;
    
    if (parseFloat(iadeForm.miktar) > mevcutMiktar) {
      toast.error('İade edilecek miktar mevcut emanet miktarından fazla olamaz!');
      return;
    }

    try {
      await addEmanet({
        musteriId,
        turId: iadeForm.turId,
        islemTipi: 'emanet-al',
        miktar: parseFloat(iadeForm.miktar),
        aciklama: iadeForm.aciklama || 'Emanet iade edildi',
        tarih: new Date()
      });
      toast.success('Emanet iade edildi');
      
      setIadeDialogOpen(false);
      setIadeForm({ turId: '', miktar: '', aciklama: '' });
    } catch (error) {
      console.error('İade hatası:', error);
      toast.error('İade işlemi sırasında bir hata oluştu');
    }
  };

  const handleBorcEkle = async () => {
    if (!user) {
      toast.error('Kullanıcı girişi yapılmamış!');
      return;
    }
    
    if (!borcForm.turId || !borcForm.miktar || parseFloat(borcForm.miktar) <= 0) {
      toast.error('Tür ve geçerli miktar seçiniz!');
      return;
    }

    try {
      await addDebt({
        musteriId,
        turId: borcForm.turId,
        islemTipi: 'borc-ver',
        miktar: parseFloat(borcForm.miktar),
        aciklama: borcForm.aciklama || 'Borç verildi',
        tarih: new Date()
      });
      toast.success('Borç başarıyla eklendi');
      
      setBorcDialogOpen(false);
      setBorcForm({ turId: '', miktar: '', aciklama: '' });
    } catch (error) {
      console.error('Borç ekleme hatası:', error);
      toast.error('Borç eklenirken bir hata oluştu');
    }
  };

  const handleOdemeYap = async () => {
    if (!user) {
      toast.error('Kullanıcı girişi yapılmamış!');
      return;
    }
    
    if (!odemeForm.turId || !odemeForm.miktar || parseFloat(odemeForm.miktar) <= 0) {
      toast.error('Tür ve geçerli miktar seçiniz!');
      return;
    }

    // Mevcut borç miktarını kontrol et
    const borcToplami = calculateMusteriBorcToplami(musteriBorclari, musteriId);
    const mevcutBorc = borcToplami[odemeForm.turId] || 0;
    const odemeMiktari = parseFloat(odemeForm.miktar);
    
    // Ondalık hassasiyet sorununu çözmek için küçük bir tolerans ekle
    const tolerans = 0.01; // 1 kuruş tolerans
    
    if (odemeMiktari > (mevcutBorc + tolerans)) {
      toast.error(`Ödeme miktarı mevcut borç miktarından fazla olamaz! Mevcut borç: ${mevcutBorc.toFixed(2)}`);
      return;
    }

    try {
      await addDebt({
        musteriId,
        turId: odemeForm.turId,
        islemTipi: 'borc-ode',
        miktar: parseFloat(odemeForm.miktar),
        aciklama: odemeForm.aciklama || 'Borç ödendi',
        tarih: new Date()
      });
      toast.success('Borç ödendi');
      
      setOdemeDialogOpen(false);
      setOdemeForm({ turId: '', miktar: '', aciklama: '' });
    } catch (error) {
      console.error('Ödeme hatası:', error);
      toast.error('Ödeme işlemi sırasında bir hata oluştu');
    }
  };

  // Tamamını öde fonksiyonu
  const handleTamaminiOde = () => {
    if (!odemeForm.turId) {
      toast.error('Önce bir tür seçiniz!');
      return;
    }
    
    const borcToplami = calculateMusteriBorcToplami(musteriBorclari, musteriId);
    const mevcutBorc = borcToplami[odemeForm.turId] || 0;
    
    if (mevcutBorc <= 0) {
      toast.error('Bu türde borç bulunmuyor!');
      return;
    }
    
    setOdemeForm({
      ...odemeForm,
      miktar: mevcutBorc.toFixed(2)
    });
    
    toast.success(`Tamamını öde butonu ile ${mevcutBorc.toFixed(2)} miktarı dolduruldu`);
  };
  const generateMusteriPDF = async () => {
    try {
      await generateMusteriDetailPDF(
        musteri,
        musteriEmanetleri,
        musteriBorclari,
        emanetTypes,
        emanetToplami,
        borcToplami
      );
      toast.success('PDF başarıyla oluşturuldu!');
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      toast.error('PDF oluşturulurken bir hata oluştu.');
    }
  };

  // İşlem düzenleme
  const handleEditIslem = (islem) => {
    console.log('İşlem düzenleme fonksiyonu çağrıldı:', islem);
    setEditForm({
      id: islem.id,
      turId: islem.turId,
      miktar: islem.miktar.toString(),
      aciklama: islem.aciklama || '',
      tip: islem.tip
    });
    setEditDialogOpen(true);
  };

  // İşlem güncelleme
  const handleUpdateIslem = async () => {
    console.log('İşlem güncelleme fonksiyonu çağrıldı:', editForm);
    
    if (!editForm.turId || !editForm.miktar || parseFloat(editForm.miktar) <= 0) {
      toast.error('Tür ve geçerli miktar seçiniz!');
      return;
    }

    try {
      console.log('İşlem güncelleme başladı');
      if (editForm.tip === 'emanet') {
        console.log('Emanet güncelleme işlemi');
        await updateEmanet(editForm.id, {
          turId: editForm.turId,
          miktar: parseFloat(editForm.miktar),
          aciklama: editForm.aciklama
        });
        toast.success('Emanet işlemi başarıyla güncellendi');
      } else {
        console.log('Borç güncelleme işlemi');
        await updateDebt(editForm.id, {
          turId: editForm.turId,
          miktar: parseFloat(editForm.miktar),
          aciklama: editForm.aciklama
        });
        toast.success('Borç işlemi başarıyla güncellendi');
      }
      
      console.log('Veriler yenileniyor');
      setEditDialogOpen(false);
      setEditForm({ id: '', turId: '', miktar: '', aciklama: '', tip: '' });
    } catch (error) {
      console.error('İşlem güncellenemedi:', error);
      toast.error('İşlem güncellenirken bir hata oluştu');
    }
  };

  // İşlem silme
  const handleDeleteIslem = async (islemId, islemTipi) => {
    console.log('İşlem silme fonksiyonu çağrıldı:', islemId, islemTipi);
    
    if (!confirm('Bu işlemi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      console.log('Kullanıcı işlem silme işlemini iptal etti');
      return;
    }

    try {
      console.log('İşlem silme başladı');
      if (islemTipi === 'emanet') {
        console.log('Emanet silme işlemi');
        await deleteEmanet(islemId);
        toast.success('Emanet işlemi başarıyla silindi');
      } else {
        console.log('Borç silme işlemi');
        await deleteDebt(islemId);
        toast.success('Borç işlemi başarıyla silindi');
      }
      
      console.log('Veriler yenileniyor');
    } catch (error) {
      console.error('İşlem silinemedi:', error);
      toast.error('İşlem silinirken bir hata oluştu');
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (!musteri) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Müşteri bulunamadı</div>
      </div>
    );
  }

  const emanetToplami = calculateMusteriEmanetToplami(musteriEmanetleri, musteriId);
  const borcToplami = calculateMusteriBorcToplami(musteriBorclari, musteriId);
  
  // Tüm işlemleri birleştir ve tarihe göre sırala
  const tumIslemler = [
    ...musteriEmanetleri.map(e => ({ ...e, tip: 'emanet' })),
    ...musteriBorclari.map(b => ({ ...b, tip: 'borc' }))
  ].sort((a, b) => new Date(b.tarih) - new Date(a.tarih));

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{musteri.ad} {musteri.soyad}</h2>
            <p className="text-gray-600">Sıra No: {musteri.sira}</p>
          </div>
        </div>
        <Button onClick={generateMusteriPDF}>
          <Download className="h-4 w-4 mr-2" />
          PDF Al
        </Button>
      </div>

      {/* Müşteri Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Müşteri Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Ad Soyad:</strong> {musteri.ad} {musteri.soyad}</p>
              <p><strong>Sıra No:</strong> {musteri.sira}</p>
            </div>
            <div>
              {musteri.telefon && <p><strong>Telefon:</strong> {musteri.telefon}</p>}
              {musteri.not && <p><strong>Not:</strong> {musteri.not}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İşlem Butonları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Dialog open={emanetDialogOpen} onOpenChange={setEmanetDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Emanet Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Emanet Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tür</Label>
                <Select value={emanetForm.turId} onValueChange={(value) => setEmanetForm({ ...emanetForm, turId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {(emanetTypes || []).map((tur) => (
                      <SelectItem key={tur.id} value={tur.id}>
                        {tur.sembol} {tur.isim}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Miktar</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={emanetForm.miktar}
                  onChange={(e) => setEmanetForm({ ...emanetForm, miktar: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Açıklama</Label>
                <Textarea
                  value={emanetForm.aciklama}
                  onChange={(e) => setEmanetForm({ ...emanetForm, aciklama: e.target.value })}
                  placeholder="İşlem açıklaması..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEmanetDialogOpen(false)}>İptal</Button>
                <Button onClick={handleEmanetEkle}>Ekle</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={iadeDialogOpen} onOpenChange={setIadeDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              <Minus className="h-4 w-4 mr-2" />
              İade Et
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Emanet İade Et</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tür</Label>
                <Select value={iadeForm.turId} onValueChange={(value) => setIadeForm({ ...iadeForm, turId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {(emanetTypes || []).filter(tur => emanetToplami[tur.id] > 0).map((tur) => (
                      <SelectItem key={tur.id} value={tur.id}>
                        {tur.sembol} {tur.isim} (Mevcut: {formatMiktarWithBirim(emanetToplami[tur.id], tur.takipSekli)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Miktar</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={iadeForm.miktar}
                  onChange={(e) => setIadeForm({ ...iadeForm, miktar: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Açıklama</Label>
                <Textarea
                  value={iadeForm.aciklama}
                  onChange={(e) => setIadeForm({ ...iadeForm, aciklama: e.target.value })}
                  placeholder="İşlem açıklaması..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIadeDialogOpen(false)}>İptal</Button>
                <Button onClick={handleIadeEt}>İade Et</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={borcDialogOpen} onOpenChange={setBorcDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Borç Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Borç Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tür</Label>
                <Select value={borcForm.turId} onValueChange={(value) => setBorcForm({ ...borcForm, turId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {(emanetTypes || []).map((tur) => (
                      <SelectItem key={tur.id} value={tur.id}>
                        {tur.sembol} {tur.isim}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Miktar</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={borcForm.miktar}
                  onChange={(e) => setBorcForm({ ...borcForm, miktar: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Açıklama</Label>
                <Textarea
                  value={borcForm.aciklama}
                  onChange={(e) => setBorcForm({ ...borcForm, aciklama: e.target.value })}
                  placeholder="İşlem açıklaması..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setBorcDialogOpen(false)}>İptal</Button>
                <Button onClick={handleBorcEkle}>Ekle</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={odemeDialogOpen} onOpenChange={setOdemeDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
              <Minus className="h-4 w-4 mr-2" />
              Ödeme Yap
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Borç Ödemesi</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tür</Label>
                <Select value={odemeForm.turId} onValueChange={(value) => setOdemeForm({ ...odemeForm, turId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {(emanetTypes || []).filter(tur => borcToplami[tur.id] > 0).map((tur) => (
                      <SelectItem key={tur.id} value={tur.id}>
                        {tur.sembol} {tur.isim} (Borç: {formatMiktarWithBirim(borcToplami[tur.id], tur.takipSekli)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {odemeForm.turId && (
                  <p className="text-sm text-gray-600 mt-1">
                    Mevcut borç: {formatMiktarWithBirim(borcToplami[odemeForm.turId] || 0, (emanetTypes || []).find(t => t.id === odemeForm.turId)?.takipSekli || 'adet')}
                  </p>
                )}
              </div>
              <div>
                <Label>Miktar</Label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={odemeForm.miktar}
                    onChange={(e) => setOdemeForm({ ...odemeForm, miktar: e.target.value })}
                    placeholder="0.00"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTamaminiOde}
                    disabled={!odemeForm.turId}
                    className="whitespace-nowrap"
                  >
                    Tamamını Öde
                  </Button>
                </div>
              </div>
              <div>
                <Label>Açıklama</Label>
                <Textarea
                  value={odemeForm.aciklama}
                  onChange={(e) => setOdemeForm({ ...odemeForm, aciklama: e.target.value })}
                  placeholder="İşlem açıklaması..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setOdemeDialogOpen(false)}>İptal</Button>
                <Button onClick={handleOdemeYap}>Öde</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* İşlem Düzenleme Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>İşlem Düzenle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tür</Label>
                <Select value={editForm.turId} onValueChange={(value) => setEditForm({ ...editForm, turId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {(emanetTypes || []).map((tur) => (
                      <SelectItem key={tur.id} value={tur.id}>
                        {tur.sembol} {tur.isim}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Miktar</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.miktar}
                  onChange={(e) => setEditForm({ ...editForm, miktar: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Açıklama</Label>
                <Textarea
                  value={editForm.aciklama}
                  onChange={(e) => setEditForm({ ...editForm, aciklama: e.target.value })}
                  placeholder="İşlem açıklaması..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>İptal</Button>
                <Button onClick={handleUpdateIslem}>Güncelle</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Güncel Bakiye */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emanet Bakiyesi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-green-600" />
              <span>Güncel Emanet Bakiyesi</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(emanetToplami).filter(turId => emanetToplami[turId] > 0).length === 0 ? (
              <p className="text-gray-500">Emanet bulunmuyor</p>
            ) : (
              <div className="space-y-2">
                {Object.keys(emanetToplami)
                  .filter(turId => emanetToplami[turId] > 0)
                  .map(turId => {
                    const tur = (emanetTypes || []).find(t => t.id === turId);
                    if (!tur) return null;
                    return (
                      <div key={turId} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span>{tur.sembol} {tur.isim}</span>
                        <Badge className="bg-green-100 text-green-800">
                          {formatMiktarWithBirim(emanetToplami[turId], tur.takipSekli)}
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Borç Bakiyesi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-red-600" />
              <span>Güncel Borç Bakiyesi</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(borcToplami).filter(turId => borcToplami[turId] > 0).length === 0 ? (
              <p className="text-gray-500">Borç bulunmuyor</p>
            ) : (
              <div className="space-y-2">
                {Object.keys(borcToplami)
                  .filter(turId => borcToplami[turId] > 0)
                  .map(turId => {
                    const tur = (emanetTypes || []).find(t => t.id === turId);
                    if (!tur) return null;
                    return (
                      <div key={turId} className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <span>{tur.sembol} {tur.isim}</span>
                        <Badge className="bg-red-100 text-red-800">
                          {formatMiktarWithBirim(borcToplami[turId], tur.takipSekli)}
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* İşlem Geçmişi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>İşlem Geçmişi</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tumIslemler.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Henüz işlem yapılmamış</p>
          ) : (
            <div className="space-y-3">
              {tumIslemler.map((islem) => {
                const tur = (emanetTypes || []).find(t => t.id === islem.turId);
                if (!tur) return null;
                
                const islemTipi = islem.islemTipi === 'emanet-birak' ? 'Emanet Bırakıldı' :
                                islem.islemTipi === 'emanet-al' ? 'Emanet Alındı' :
                                islem.islemTipi === 'borc-ver' ? 'Borç Verildi' : 'Borç Ödendi';
                
                const islemRengi = islem.tip === 'emanet' 
                  ? (islem.islemTipi === 'emanet-birak' ? 'bg-green-50 border-green-200' : 'bg-green-50 border-green-200')
                  : (islem.islemTipi === 'borc-ver' ? 'bg-red-50 border-red-200' : 'bg-red-50 border-red-200');
                
                return (
                  <div key={islem.id} className={`p-3 rounded border ${islemRengi}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{tur.sembol}</span>
                        <div>
                          <p className="font-medium">{islemTipi}</p>
                          <p className="text-sm text-gray-600">{tur.isim}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="font-bold">{formatMiktarWithBirim(islem.miktar, tur.takipSekli)}</p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDateTime(islem.tarih)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleEditIslem(islem);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleDeleteIslem(islem.id, islem.tip);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {islem.aciklama && (
                      <p className="text-sm text-gray-600 mt-2">{islem.aciklama}</p>
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

export default MusteriDetay;

