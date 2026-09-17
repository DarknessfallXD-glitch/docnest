import { getDatabase, rowToSettings } from './database';
import { AppSettings } from '@/types';
import { STORAGE_KEYS } from '@/constants';

class SettingsService {
  private async getDb() {
    return getDatabase();
  }

  async getSettings(): Promise<AppSettings> {
    const db = await this.getDb();
    const row = await db.getFirstAsync('SELECT value FROM settings WHERE key = ?', [STORAGE_KEYS.SETTINGS]);
    return row ? rowToSettings(row) : this.getDefaultSettings();
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const db = await this.getDb();
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    await db.runAsync(
      'UPDATE settings SET value = ? WHERE key = ?',
      [JSON.stringify(updated), STORAGE_KEYS.SETTINGS]
    );
    return updated;
  }

  private getDefaultSettings(): AppSettings {
    return {
      theme: 'system',
      defaultSort: 'date',
      sortOrder: 'desc',
      showThumbnails: true,
      autoBackup: false,
    };
  }
}

export const settingsService = new SettingsService();