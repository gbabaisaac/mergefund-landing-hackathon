import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({ id: 'rowrunner-storage' });

export const mmkv = {
  getString: (key: string) => storage.getString(key) ?? null,
  setString: (key: string, value: string) => storage.set(key, value),
  getNumber: (key: string) => storage.getNumber(key) ?? null,
  setNumber: (key: string, value: number) => storage.set(key, value),
  getBoolean: (key: string) => storage.getBoolean(key) ?? false,
  setBoolean: (key: string, value: boolean) => storage.set(key, value),
  delete: (key: string) => storage.delete(key),
  clearAll: () => storage.clearAll(),
};
