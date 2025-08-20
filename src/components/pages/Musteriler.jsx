import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Plus, User, Phone, MapPin, Calendar, Edit, Trash2, MoreVertical } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

const Musteriler = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { customers, addCustomer, deleteCustomer, loading: dataLoading } = useData();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    telefon: '',
    not: ''
  });

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.ad.trim() || !formData.soyad.trim()) {
      toast.error('Ad ve soyad alanları zorunludur');
      return;
    }

    try {
      const newMusteri = await addCustomer(formData);
      toast.success('Müşteri başarıyla eklendi');

      // Form'u temizle ve dialog'u kapat
      setFormData({ ad: '', soyad: '', telefon: '', not: '' });
      setIsDialogOpen(false);
      
      // Yeni müşteri detay sayfasına yönlendir
      if (newMusteri && newMusteri.id) {
        navigate(`/musteri-detay/${newMusteri.id}`);
      }
      
    } catch (error) {
      console.error('Müşteri eklenemedi:', error);
      toast.error('Müşteri eklenirken bir hata oluştu');
    }
  };

  // Form input değişikliklerini handle et
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Arama filtresi
  const filteredMusteriler = (customers || []).filter(musteri =>
    `${musteri.ad} ${musteri.soyad}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (musteri.telefon && musteri.telefon.includes(searchTerm))
  );

  // Müşteri silme
  const handleDeleteMusteri = async (musteriId, e) => {
    console.log('Müşteri silme fonksiyonu çağrıldı:', musteriId);
    e.stopPropagation();
    
    if (!confirm('Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve müşteriye ait tüm emanet ve borç kayıtları da silinecektir.')) {
      console.log('Kullanıcı silme işlemini iptal etti');
      return;
    }

    try {
      console.log('Silme işlemi başladı');
      await deleteCustomer(musteriId);
      toast.success('Müşteri ve ilgili tüm kayıtlar başarıyla silindi');
    } catch (error) {
      console.error('Müşteri silinemedi:', error);
      toast.error('Müşteri silinirken bir hata oluştu');
    }
  };

  // Müşteri kartına tıklama
  const handleMusteriClick = (musteri) => {
    navigate(`/musteri-detay/${musteri.id}`);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Müşteriler</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Arama */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          {/* Yeni Müşteri Butonu */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Müşteri
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Müşteri</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ad">Ad *</Label>
                    <Input
                      id="ad"
                      placeholder="Ad"
                      value={formData.ad}
                      onChange={(e) => handleInputChange('ad', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="soyad">Soyad *</Label>
                    <Input
                      id="soyad"
                      placeholder="Soyad"
                      value={formData.soyad}
                      onChange={(e) => handleInputChange('soyad', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="telefon">Telefon</Label>
                  <Input
                    id="telefon"
                    placeholder="Telefon numarası"
                    value={formData.telefon}
                    onChange={(e) => handleInputChange('telefon', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="not">Not</Label>
                  <Textarea
                    id="not"
                    placeholder="Müşteri hakkında notlar..."
                    value={formData.not}
                    onChange={(e) => handleInputChange('not', e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button type="submit" className="bg-red-600 hover:bg-red-700">
                    Kaydet
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>



      {/* Müşteri Listesi */}
      {filteredMusteriler.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Müşteri bulunamadı' : 'Henüz müşteri eklenmemiş'}
            </h3>
            <p className="text-gray-500 text-center mb-4">
              {searchTerm 
                ? 'Arama kriterlerinize uygun müşteri bulunamadı.'
                : 'İlk müşterinizi eklemek için "Yeni Müşteri" butonuna tıklayın.'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Müşteri Ekle
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMusteriler.map((musteri) => (
            <Card 
              key={musteri.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleMusteriClick(musteri)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {musteri.ad} {musteri.soyad}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Müşteri
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDeleteMusteri(musteri.id, e);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {musteri.telefon && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {musteri.telefon}
                  </div>
                )}
                
                {musteri.not && (
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {musteri.not}
                  </div>
                )}
                
                {musteri.createdAt && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(musteri.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Musteriler;

