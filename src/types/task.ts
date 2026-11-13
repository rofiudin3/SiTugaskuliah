/**
 * ============================================================================
 * DEMONSTRASI KONSEP TYPESCRIPT SESUAI KETENTUAN:
 * 1. Primitive Types (string, number, boolean)
 * 2. Array (string[], Task[])
 * 3. Interface (Task, TaskStats, AppEnvConfig)
 * 4. Type Alias & Union Type (TaskStatus, TaskPriority, FilterStatus, TaskFormData)
 * 5. Generics Sederhana (ServiceResult<T>, lihat juga di src/utils/generics.ts)
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 4. TYPE ALIAS & UNION TYPE
// ----------------------------------------------------------------------------

/** Union Type untuk status penyelesaian tugas kuliah */
export type TaskStatus = 'Belum Selesai' | 'Selesai';

/** Union Type untuk tingkat prioritas tugas kuliah */
export type TaskPriority = 'Rendah' | 'Sedang' | 'Tinggi';

/** Union Type untuk filter tampilan daftar tugas */
export type FilterStatus = 'Semua' | TaskStatus;

/** Union Type untuk pengurutan daftar tugas */
export type SortOption = 'deadline-asc' | 'priority-desc' | 'created-desc';

/** Type Alias untuk ID unik tugas */
export type TaskId = string;

// ----------------------------------------------------------------------------
// 3. INTERFACE & 1. PRIMITIVE TYPES (string, number, boolean)
// ----------------------------------------------------------------------------

/**
 * Interface utama yang merepresentasikan satu item Tugas Kuliah.
 * Menggunakan Primitive Types: string, number, dan boolean.
 */
export interface Task {
  /** ID unik tugas (Primitive: string) */
  id: TaskId;
  /** Judul tugas kuliah (Primitive: string) */
  title: string;
  /** Nama mata kuliah (Primitive: string) */
  course: string;
  /** Deskripsi atau catatan detail tugas (Primitive: string) */
  description: string;
  /** Tanggal tenggat pengumpulan format YYYY-MM-DD (Primitive: string) */
  deadline: string;
  /** Bobot SKS mata kuliah (Primitive: number) */
  sks: number;
  /** Penanda apakah tugas sudah selesai (Primitive: boolean) */
  isCompleted: boolean;
  /** Status teks sesuai ketentuan ('Belum Selesai' | 'Selesai') */
  status: TaskStatus;
  /** Prioritas tugas ('Rendah' | 'Sedang' | 'Tinggi') */
  priority: TaskPriority;
  /** Timestamp waktu pembuatan dalam milidetik (Primitive: number) */
  createdAt: number;
}

/** Type Alias untuk data form tambah/edit tugas */
export type TaskFormData = {
  title: string;
  course: string;
  description: string;
  deadline: string;
  sks: number;
  priority: TaskPriority;
  isCompleted: boolean;
};

/** Interface untuk statistik ringkasan tugas kuliah */
export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionPercentage: number;
  totalSksPending: number;
}

/** Interface untuk konfigurasi Environment Variables (Non-Rahasia) */
export interface AppEnvConfig {
  appName: string;
  appVersion: string;
  semester: string;
  storageKey: string;
}

// ----------------------------------------------------------------------------
// 2. ARRAY
// ----------------------------------------------------------------------------

/** Contoh penggunaan Array bertipe string[] untuk daftar saran mata kuliah */
export const DEFAULT_COURSES: string[] = [
  'Pemrograman Web Lanjut',
  'Struktur Data & Algoritma',
  'Basis Data',
  'Rekayasa Perangkat Lunak',
  'Kecerdasan Buatan',
  'Jaringan Komputer',
];

/** Contoh penggunaan Array bertipe TaskPriority[] */
export const PRIORITY_OPTIONS: TaskPriority[] = ['Rendah', 'Sedang', 'Tinggi'];

// ----------------------------------------------------------------------------
// 5. GENERICS SEDERHANA (Interface Generic)
// ----------------------------------------------------------------------------

/**
 * Interface Generic sederhana untuk membungkus hasil operasi penyimpanan/data
 */
export interface StorageResult<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: number;
}
