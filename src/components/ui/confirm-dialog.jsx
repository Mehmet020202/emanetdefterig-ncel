import { Button } from '@/components/ui/button';
import { 
  AlertTriangle
} from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Onayla', 
  cancelText = 'İptal',
  variant = 'destructive',
  icon: Icon
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-2 rounded-full ${
            variant === 'destructive' 
              ? 'bg-red-100 text-red-600' 
              : 'bg-blue-100 text-blue-600'
          }`}>
            {(Icon || AlertTriangle) && <Icon className="h-5 w-5" />}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
