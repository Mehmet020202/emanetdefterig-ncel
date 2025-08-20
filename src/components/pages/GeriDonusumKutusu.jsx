import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  RotateCcw, 
  User, 
  Package, 
  CreditCard, 
  Tag,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatMiktarWithBirim } from '@/lib/calculations';
import ConfirmDialog from '@/components/ui/confirm-dialog';

const GeriDonusumKutusu = () => {
  const { trash, restoreFromTrash, permanentlyDelete, clearExpiredTrash, loading } = useData();
  const [filterType, setFilterType] = useState('all');
  const [showExpired, setShowExpired] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: null,
    itemId: null,
    itemData: null
  });
  const [showEmptyTrashDialog, setShowEmptyTrashDialog] = useState(false);

  // Süresi dolmuş öğeleri temizle
  useEffect(() => {
    const clearExpired = async () => {
      try {
        await clearExpiredTrash();
      } catch (error) {
        console.error('Süresi dolmuş öğeleri temizleme hatası:', error);
      }
    };
    
    // Sayfa yüklendiğinde süresi dolmuş öğeleri temizle
    clearExpired();
  }, [clearExpiredTrash]);

  // Filtrelenmiş çöp kutusu öğeleri
  const filteredTrash = trash.filter(item => {
    const isExpired = new Date(item.expiresAt) < new Date();
    
    if (showExpired && !isExpired) return false;
    if (!showExpired && isExpired) return false;
    
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  // Öğe türüne göre ikon ve renk
  const getItemIcon = (type) => {
    switch (type) {
      case 'customer':
        return <User className="h-4 w-4" />;
      case 'emanet':
        return <Package className="h-4 w-4" />;
      case 'debt':
        return <CreditCard className="h-4 w-4" />;
      case 'emanetType':
        return <Tag className="h-4 w-4" />;
      default:
        return <Trash2 className="h-4 w-4" />;
    }
  };

  const getItemColor = (type) => {
    switch (type) {
      case 'customer':
        return 'bg-blue-100 text-blue-800';
      case 'emanet':
        return 'bg-green-100 text-green-800';
      case 'debt':
        return 'bg-red-100 text-red-800';
      case 'emanetType':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getItemTitle = (type) => {
    switch (type) {
      case 'customer':
        return 'Müşteri';
      case 'emanet':
        return 'Emanet';
      case 'debt':
        return 'Borç';
      case 'emanetType':
        return 'Emanet Türü';
      default:
        return 'Bilinmeyen';
    }
  };

  // Kalan süreyi hesapla
  const getRemainingTime = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Süresi doldu';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} gün ${hours} saat`;
    return `${hours} saat`;
  };

  // Öğe detaylarını göster
  const getItemDetails = (item) => {
    const data = item.data;
    
    switch (item.type) {
      case 'customer':
        return (
          <div className="space-y-1">
            <p className="font-medium">{data.ad} {data.soyad}</p>
            <p className="text-sm text-gray-600">Sıra No: {data.sira}</p>
            {data.telefon && <p className="text-sm text-gray-600">Telefon: {data.telefon}</p>}
          </div>
        );
      case 'emanet':
        return (
          <div className="space-y-1">
            <p className="font-medium">{data.aciklama}</p>
            <p className="text-sm text-gray-600">
              Miktar: {formatMiktarWithBirim(data.miktar, data.birim)}
            </p>
            <p className="text-sm text-gray-600">Tarih: {new Date(data.tarih).toLocaleDateString('tr-TR')}</p>
          </div>
        );
      case 'debt':
        return (
          <div className="space-y-1">
            <p className="font-medium">{data.aciklama}</p>
            <p className="text-sm text-gray-600">
              Miktar: {formatMiktarWithBirim(data.miktar, data.birim)}
            </p>
            <p className="text-sm text-gray-600">Tarih: {new Date(data.tarih).toLocaleDateString('tr-TR')}</p>
          </div>
        );
      case 'emanetType':
        return (
          <div className="space-y-1">
            <p className="font-medium">{data.ad}</p>
            <p className="text-sm text-gray-600">Birim: {data.birim}</p>
          </div>
        );
      default:
        return <p className="text-gray-600">Detay bilgisi bulunamadı</p>;
    }
  };

  // Onay dialogu işlemleri
  const handleRestore = (itemId) => {
    setConfirmDialog({
      isOpen: true,
      type: 'restore',
      itemId,
      itemData: trash.find(t => t.id === itemId)
    });
  };

  const handlePermanentlyDelete = (itemId) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      itemId,
      itemData: trash.find(t => t.id === itemId)
    });
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmDialog.type === 'restore') {
        await restoreFromTrash(confirmDialog.itemId);
      } else if (confirmDialog.type === 'delete') {
        await permanentlyDelete(confirmDialog.itemId);
      }
    } catch (error) {
      console.error('İşlem hatası:', error);
    }
  };

  const getConfirmDialogProps = () => {
    if (confirmDialog.type === 'restore') {
      return {
        title: 'Geri Yükle',
        message: `"${getItemTitle(confirmDialog.itemData?.type)}" öğesini geri yüklemek istediğinizden emin misiniz?`,
        confirmText: 'Geri Yükle',
        variant: 'default',
        icon: RotateCcw
      };
    } else if (confirmDialog.type === 'delete') {
      return {
        title: 'Kalıcı Olarak Sil',
        message: `"${getItemTitle(confirmDialog.itemData?.type)}" öğesini kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
        confirmText: 'Kalıcı Sil',
        variant: 'destructive',
        icon: Trash2
      };
    }
    return {};
  };

  // Geri dönüşüm kutusunu boşalt
  const handleEmptyTrash = async () => {
    try {
      // Tüm öğeleri kalıcı olarak sil
      for (const item of trash) {
        await permanentlyDelete(item.id);
      }
    } catch (error) {
      console.error('Geri dönüşüm kutusunu boşaltma hatası:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık ve İstatistikler */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Trash2 className="h-6 w-6 mr-2" />
            Geri Dönüşüm Kutusu
          </h1>
          <p className="text-gray-600 mt-1">
            Silinen kayıtlar 30 gün boyunca burada saklanır
          </p>
        </div>
        
                 <div className="flex items-center space-x-2">
           <Badge variant="secondary">
             {trash.length} öğe
           </Badge>
           <Badge variant="outline">
             {trash.filter(item => new Date(item.expiresAt) < new Date()).length} süresi dolmuş
           </Badge>
           {trash.length > 0 && (
             <Button
               variant="destructive"
               size="sm"
               onClick={() => setShowEmptyTrashDialog(true)}
               className="flex items-center"
             >
               <Trash2 className="h-4 w-4 mr-1" />
               Kutusu Boşalt
             </Button>
           )}
         </div>
      </div>

      {/* Filtreler */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium mb-1">Tür Filtresi</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="all">Tümü</option>
                <option value="customer">Müşteriler</option>
                <option value="emanet">Emanetler</option>
                <option value="debt">Borçlar</option>
                <option value="emanetType">Emanet Türleri</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showExpired"
                checked={showExpired}
                onChange={(e) => setShowExpired(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showExpired" className="text-sm">
                Sadece süresi dolmuş öğeleri göster
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geri Dönüşüm Kutusu Listesi */}
      {filteredTrash.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Trash2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Geri dönüşüm kutusu boş
            </h3>
            <p className="text-gray-600">
              {showExpired 
                ? 'Süresi dolmuş öğe bulunmuyor'
                : 'Silinen öğe bulunmuyor'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTrash.map((item) => {
            const isExpired = new Date(item.expiresAt) < new Date();
            
            return (
              <Card key={item.id} className={isExpired ? 'border-red-200 bg-red-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-full ${getItemColor(item.type)}`}>
                        {getItemIcon(item.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className={getItemColor(item.type)}>
                            {getItemTitle(item.type)}
                          </Badge>
                          {isExpired && (
                            <Badge variant="destructive" className="flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Süresi Doldu
                            </Badge>
                          )}
                        </div>
                        
                        {getItemDetails(item)}
                        
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Silinme: {new Date(item.deletedAt).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Kalan: {getRemainingTime(item.expiresAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                                         <div className="flex items-center space-x-2 ml-4">
                       {!isExpired && (
                         <Button
                           size="sm"
                           variant="outline"
                           onClick={() => handleRestore(item.id)}
                           className="flex items-center"
                         >
                           <RotateCcw className="h-3 w-3 mr-1" />
                           Geri Yükle
                         </Button>
                       )}
                       
                       <Button
                         size="sm"
                         variant="destructive"
                         onClick={() => handlePermanentlyDelete(item.id)}
                         className="flex items-center"
                       >
                         <Trash2 className="h-3 w-3 mr-1" />
                         Kalıcı Sil
                       </Button>
                     </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bilgi Kartı */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Geri Dönüşüm Kutusu Hakkında</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Silinen kayıtlar 30 gün boyunca burada saklanır</li>
                <li>• Süresi dolmadan önce kayıtları geri yükleyebilirsiniz</li>
                <li>• Süresi dolan kayıtlar otomatik olarak kalıcı olarak silinir</li>
                <li>• Müşteri silindiğinde, ona ait tüm emanet ve borç kayıtları da silinir</li>
              </ul>
            </div>
          </div>
                 </CardContent>
       </Card>

       {/* Onay Dialogu */}
       <ConfirmDialog
         isOpen={confirmDialog.isOpen}
         onClose={() => setConfirmDialog({ isOpen: false, type: null, itemId: null, itemData: null })}
         onConfirm={handleConfirmAction}
         {...getConfirmDialogProps()}
       />

       {/* Geri Dönüşüm Kutusunu Boşaltma Dialogu */}
       <ConfirmDialog
         isOpen={showEmptyTrashDialog}
         onClose={() => setShowEmptyTrashDialog(false)}
         onConfirm={handleEmptyTrash}
         title="Geri Dönüşüm Kutusunu Boşalt"
         message={`Geri dönüşüm kutusundaki tüm ${trash.length} öğeyi kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
         confirmText="Tümünü Sil"
         cancelText="İptal"
         variant="destructive"
         icon={Trash2}
       />
     </div>
   );
 };

export default GeriDonusumKutusu;
