import { StorageResult } from '../types/task';

/**
 * ============================================================================
 * DEMONSTRASI GENERICS SEDERHANA DI TYPESCRIPT
 * Fungsi-fungsi utilitas generic (<T>) yang dapat bekerja dengan tipe data apa pun
 * namun tetap menjaga keamanan tipe (type-safety).
 * ============================================================================
 */

/**
 * 1. Fungsi Generic untuk membaca data dari LocalStorage dengan aman
 * @template T Tipe data yang dikembalikan
 */
export function loadFromStorage<T>(key: string, fallbackValue: T): StorageResult<T> {
  try {
    const rawData: string | null = localStorage.getItem(key);
    if (!rawData) {
      return {
        success: true,
        data: fallbackValue,
        message: 'Menggunakan data awal (belum ada data di LocalStorage).',
        timestamp: Date.now(),
      };
    }
    const parsedData: T = JSON.parse(rawData) as T;
    return {
      success: true,
      data: parsedData,
      message: 'Berhasil memuat data dari LocalStorage.',
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Gagal membaca LocalStorage:', error);
    return {
      success: false,
      data: fallbackValue,
      message: 'Terjadi kesalahan saat membaca LocalStorage.',
      timestamp: Date.now(),
    };
  }
}

/**
 * 2. Fungsi Generic untuk menyimpan data ke LocalStorage
 * @template T Tipe data yang akan disimpan
 */
export function saveToStorage<T>(key: string, data: T): StorageResult<T> {
  try {
    const serialized: string = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return {
      success: true,
      data,
      message: 'Data berhasil disimpan ke LocalStorage.',
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Gagal menyimpan ke LocalStorage:', error);
    return {
      success: false,
      data,
      message: 'Gagal menyimpan data ke LocalStorage.',
      timestamp: Date.now(),
    };
  }
}

/**
 * 3. Fungsi Generic untuk menyaring (filter) Array berdasarkan predikat
 * @template T Tipe elemen di dalam Array
 */
export function filterArray<T>(items: T[], predicate: (item: T) => boolean): T[] {
  return items.filter(predicate);
}

/**
 * 4. Fungsi Generic untuk memperbarui item di dalam Array yang memiliki properti `id`
 * @template T Tipe objek yang memiliki properti `id: string`
 */
export function updateItemById<T extends { id: string }>(
  items: T[],
  targetId: string,
  updater: (item: T) => T
): T[] {
  return items.map((item: T) => (item.id === targetId ? updater(item) : item));
}
