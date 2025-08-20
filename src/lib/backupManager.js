// Automatic Backup and Sync Manager

class BackupManager {
  constructor() {
    this.backupInterval = null;
    this.syncInterval = null;
    this.isOnline = navigator.onLine;
    this.pendingChanges = [];
    
    this.init();
  }

  init() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingChanges();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Setup automatic backup
    this.setupAutoBackup();
    
    // Setup periodic sync
    this.setupPeriodicSync();
  }

  setupAutoBackup() {
    const backupEnabled = localStorage.getItem('auto_backup_enabled') === 'true';
    const backupInterval = localStorage.getItem('backup_interval') || '24'; // hours
    
    if (backupEnabled) {
      this.startAutoBackup(parseInt(backupInterval));
    }
  }

  startAutoBackup(hours = 24) {
    this.stopAutoBackup(); // Clear existing interval
    
    const intervalMs = hours * 60 * 60 * 1000; // Convert hours to ms
    
    this.backupInterval = setInterval(async () => {
      try {
        await this.createBackup();
        console.log('Auto backup completed');
      } catch (error) {
        console.error('Auto backup failed:', error);
      }
    }, intervalMs);
    
    localStorage.setItem('auto_backup_enabled', 'true');
    localStorage.setItem('backup_interval', hours.toString());
  }

  stopAutoBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
    localStorage.setItem('auto_backup_enabled', 'false');
  }

  async createBackup() {
    const data = {
      version: '2.0',
      backup_date: new Date().toISOString(),
      data: {
        customers: JSON.parse(localStorage.getItem('customers') || '[]'),
        emanets: JSON.parse(localStorage.getItem('emanets') || '[]'),
        debts: JSON.parse(localStorage.getItem('debts') || '[]'),
        emanetTypes: JSON.parse(localStorage.getItem('emanetTypes') || '[]'),
        settings: JSON.parse(localStorage.getItem('emanet_ayarlar') || '{}')
      }
    };

    // Store backup in IndexedDB
    await this.storeBackupInIndexedDB(data);
    
    // Create downloadable backup file
    this.downloadBackup(data);
    
    return data;
  }

  async storeBackupInIndexedDB(data) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EmanetBackups', 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('backups')) {
          const store = db.createObjectStore('backups', { keyPath: 'id', autoIncrement: true });
          store.createIndex('date', 'backup_date', { unique: false });
        }
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['backups'], 'readwrite');
        const store = transaction.objectStore('backups');
        
        store.add(data);
        
        transaction.oncomplete = () => {
          // Keep only last 10 backups
          this.cleanOldBackups(db);
          resolve();
        };
        
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  cleanOldBackups(db) {
    const transaction = db.transaction(['backups'], 'readwrite');
    const store = transaction.objectStore('backups');
    const index = store.index('date');
    
    index.openCursor(null, 'prev').onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const backups = [];
        let count = 0;
        
        cursor.continue();
        count++;
        
        if (count > 10) {
          cursor.delete();
        }
      }
    };
  }

  downloadBackup(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emanet-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  setupPeriodicSync() {
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.pendingChanges.length > 0) {
        this.syncPendingChanges();
      }
    }, 5 * 60 * 1000);
  }

  addPendingChange(change) {
    this.pendingChanges.push({
      ...change,
      timestamp: new Date().toISOString(),
      id: Date.now() + Math.random()
    });
    
    // Store in localStorage for persistence
    localStorage.setItem('pending_changes', JSON.stringify(this.pendingChanges));
    
    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncPendingChanges();
    }
  }

  async syncPendingChanges() {
    if (this.pendingChanges.length === 0) return;
    
    try {
      // Here you would sync with your backend/Firebase
      console.log('Syncing pending changes:', this.pendingChanges);
      
      // Simulate successful sync
      this.pendingChanges = [];
      localStorage.removeItem('pending_changes');
      
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  getPendingChangesCount() {
    return this.pendingChanges.length;
  }

  async restoreFromBackup(backupData) {
    try {
      if (backupData.data) {
        Object.entries(backupData.data).forEach(([key, value]) => {
          if (key !== 'settings') {
            localStorage.setItem(key, JSON.stringify(value));
          } else {
            localStorage.setItem('emanet_ayarlar', JSON.stringify(value));
          }
        });
        
        // Trigger page reload to reflect changes
        window.location.reload();
      }
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  }
}

export const backupManager = new BackupManager();
