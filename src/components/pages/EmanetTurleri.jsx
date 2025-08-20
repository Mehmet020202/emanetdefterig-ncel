import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Edit, 
  Trash2, 
  Settings,
  Palette
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

const EmanetTurleri = () => {
  const { user } = useAuth();
  const { emanetTypes, loading: dataLoading, addEmanetType, updateEmanetType, deleteEmanetType } = useData();
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTur, setEditingTur] = useState(null);

  const [formData, setFormData] = useState({
    isim: '',
    takipSekli: 'gram',
    sembol: '🔸',
    renk: '#3b82f6',
    aciklama: ''
  });

  const sembolOptions = [
    '🔸', '🔹', '💎', '💍', '🏆', '🥇', '🥈', '🥉', 
    '💰', '💵', '💴', '💶', '💷', '🪙', '⭐', '🌟',
    '🔥', '💫', '✨', '🎯', '🎪', '🎨', '🎭', '🎪'
  ];

  const renkOptions = [
    { value: '#3b82f6', label: 'Mavi', color: '#3b82f6' },
    { value: '#ef4444', label: 'Kırmızı', color: '#ef4444' },
    { value: '#10b981', label: 'Yeşil', color: '#10b981' },
    { value: '#f59e0b', label: 'Turuncu', color: '#f59e0b' },
    { value: '#8b5cf6', label: 'Mor', color: '#8b5cf6' },
    { value: '#06b6d4', label: 'Cyan', color: '#06b6d4' },
    { value: '#84cc16', label: 'Lime', color: '#84cc16' },
    { value: '#f97316', label: 'Portakal', color: '#f97316' }
  ];

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
    
    if (!formData.isim.trim()) {
      alert('Tür ismi zorunludur!');
      return;
    }

    try {
      if (editingTur) {
        await updateEmanetType(editingTur.id, formData);
      } else {
        await addEmanetType(formData);
      }
      
      setDialogOpen(false);
      setEditingTur(null);
      setFormData({
        isim: '',
        takipSekli: 'gram',
        sembol: '🔸',
        renk: '#3b82f6',
        aciklama: ''
      });
    } catch (error) {
      console.error('Tür kaydetme hatası:', error);
      alert('Bir hata oluştu!');
    }
  };

  const handleEdit = (tur) => {
    setEditingTur(tur);
    setFormData({
      isim: tur.isim,
      takipSekli: tur.takipSekli,
      sembol: tur.sembol,
      renk: tur.renk,
      aciklama: tur.aciklama || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (turId) => {
    if (!user) {
      alert('Kullanıcı girişi yapılmamış!');
      return;
    }
    
    if (!confirm('Bu türü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deleteEmanetType(turId);
    } catch (error) {
      console.error('Tür silme hatası:', error);
      alert('Bir hata oluştu!');
    }
  };

  const getTakipSekliLabel = (takipSekli) => {
    switch (takipSekli) {
      case 'gram': return 'Gram';
      case 'adet': return 'Adet';
      case 'TL': return 'TL';
      default: return takipSekli;
    }
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
      {/* Başlık ve Yeni Tür Butonu */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Emanet Türleri</h2>
          <p className="text-gray-600">Emanet ve borç türlerini yönetin</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTur(null);
              setFormData({
                isim: '',
                takipSekli: 'gram',
                sembol: '🔸',
                renk: '#3b82f6',
                aciklama: ''
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Tür
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTur ? 'Tür Düzenle' : 'Yeni Tür Ekle'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="isim">Tür İsmi *</Label>
                <Input
                  id="isim"
                  value={formData.isim}
                  onChange={(e) => setFormData({ ...formData, isim: e.target.value })}
                  placeholder="örn: 22 Ayar Altın"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="takipSekli">Takip Şekli</Label>
                <Select value={formData.takipSekli} onValueChange={(value) => setFormData({ ...formData, takipSekli: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gram">Gram</SelectItem>
                    <SelectItem value="adet">Adet</SelectItem>
                    <SelectItem value="TL">TL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sembol">Sembol</Label>
                <div className="grid grid-cols-8 gap-2 mt-2">
                  {sembolOptions.map((sembol) => (
                    <button
                      key={sembol}
                      type="button"
                      onClick={() => setFormData({ ...formData, sembol })}
                      className={`p-2 text-xl border rounded hover:bg-gray-50 ${
                        formData.sembol === sembol ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      {sembol}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="renk">Renk</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {renkOptions.map((renk) => (
                    <button
                      key={renk.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, renk: renk.value })}
                      className={`p-3 rounded border-2 ${
                        formData.renk === renk.value ? 'border-gray-800' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: renk.color }}
                      title={renk.label}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="aciklama">Açıklama</Label>
                <Textarea
                  id="aciklama"
                  value={formData.aciklama}
                  onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                  placeholder="Tür hakkında açıklama..."
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">
                  {editingTur ? 'Güncelle' : 'Kaydet'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Türler Listesi */}
      <div className="grid gap-4">
        {(emanetTypes || []).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz tür eklenmemiş</p>
            </CardContent>
          </Card>
        ) : (
          (emanetTypes || []).map((tur) => (
            <Card key={tur.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="p-3 rounded-lg text-2xl"
                      style={{ backgroundColor: `${tur.renk}20`, color: tur.renk }}
                    >
                      {tur.sembol}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{tur.isim}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Takip: {getTakipSekliLabel(tur.takipSekli)}</span>
                        <div className="flex items-center space-x-1">
                          <Palette className="h-3 w-3" />
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: tur.renk }}
                          />
                        </div>
                      </div>
                      {tur.aciklama && (
                        <p className="text-sm text-gray-600 mt-1">{tur.aciklama}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(tur)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(tur.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EmanetTurleri;

