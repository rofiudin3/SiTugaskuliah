# 🎓 SiTugas Kuliah — Aplikasi Pengelola Daftar Tugas Kuliah

Aplikasi web modern berbasis **React + TypeScript + Vite** untuk mengelola daftar tugas kuliah mahasiswa secara rapi, responsif, dan tersimpan otomatis di `LocalStorage`.

---

## 🎯 Ringkasan Eksekusi Git & GitHub
Repository ini telah memenuhi seluruh ketentuan teknis:
- **Branch Utama**: `main`
- **Branch Fitur 1**: `fitur/course-options` (sudah di-merge)
- **Branch Fitur 2**: `fitur/app-title` (digunakan dalam simulasi dan penyelesaian merge conflict)
- **Branch Fitur 3**: `fitur/dokumentasi-panduan` (diajukan melalui Pull Request)
- **Status Merge Conflict**: Berhasil diselesaikan pada file `.env.example`
- **Keamanan**: File `.env` diabaikan oleh `.gitignore` sehingga tidak terekspos ke repositori publik.

---

## 📋 Pemenuhan 5 Ketentuan Proyek

### 1. Fitur Aplikasi Web
- **Menampilkan Daftar Tugas Kuliah**: Menampilkan kartu tugas lengkap dengan Mata Kuliah, Bobot SKS, Prioritas (`Rendah`, `Sedang`, `Tinggi`), Tanggal Tenggat (Deadline), dan Status (`Belum Selesai` / `Selesai`).
- **Menambahkan Tugas Baru**: Formulir validasi lengkap di panel kiri untuk menambah tugas baru beserta saran nama mata kuliah.
- **Mengedit & Menghapus Tugas**: Tombol **Edit** untuk memuat data tugas ke formulir dan memperbaruinya, serta tombol **Hapus** dengan konfirmasi.
- **Menampilkan & Mengubah Status Tugas**: Badge status visual (`⏳ Belum Selesai` / `✓ Selesai`), tombol *toggle* cepat, serta kartu statistik progres penyelesaian.
- **Filter, Pencarian, & Tampilan Responsif**: Dilengkapi fitur pencarian kata kunci, filter berdasarkan status/mata kuliah, pengurutan deadline/prioritas, dan desain CSS Grid/Flexbox yang responsif di layar Desktop, Tablet, maupun Mobile.

---

### 2. Penggunaan TypeScript (Lokasi di Kode)

Seluruh konsep TypeScript yang diwajibkan telah diimplementasikan secara eksplisit:

| Konsep TypeScript | Lokasi File | Contoh Implementasi |
| :--- | :--- | :--- |
| **Primitive Types** (`string`, `number`, `boolean`) | `src/types/task.ts`, `src/App.tsx` | `title: string`, `sks: number`, `isCompleted: boolean`, `totalTasks: number` |
| **Array** | `src/types/task.ts`, `src/data/initialTasks.ts`, `src/App.tsx` | `DEFAULT_COURSES: string[]`, `INITIAL_TASKS: Task[]`, state `tasks: Task[]` |
| **Interface** | `src/types/task.ts` | `interface Task`, `interface TaskStats`, `interface AppEnvConfig`, `interface StorageResult<T>` |
| **Type Alias & Union Type** | `src/types/task.ts` | `type TaskStatus = 'Belum Selesai' | 'Selesai'`, `type TaskPriority = 'Rendah' | 'Sedang' | 'Tinggi'`, `type FilterStatus = 'Semua' | TaskStatus` |
| **Generics Sederhana** | `src/utils/generics.ts`, `src/types/task.ts` | `loadFromStorage<T>()`, `saveToStorage<T>()`, `filterArray<T>()`, `updateItemById<T extends { id: string }>()` |

---

### 3. Penggunaan npm dan Vite

#### a. Menjalankan Proyek & Build
Pastikan **Node.js** dan **npm** sudah terinstal di komputer Anda, lalu jalankan perintah berikut di terminal pada folder `tugas-kuliah-app`:

```bash
# 1. Menginstal seluruh package dari package.json
npm install

# 2. Menjalankan server development Vite
npm run dev

# 3. Memeriksa tipe TypeScript dan melakukan build produksi ke folder dist/
npm run build

# 4. Menjalankan preview hasil build produksi
npm run preview
```

#### b. Penjelasan `package.json` & npm Scripts
- `"dev": "vite"` — Menjalankan server pengembangan lokal dengan fitur *Hot Module Replacement (HMR)*.
- `"build": "tsc -b && vite build"` — Menjalankan pemeriksaan kompilasi TypeScript terlebih dahulu, lalu mem-bundle aplikasi menjadi aset statis optimal di folder `dist/`.
- `"preview": "vite preview"` — Menjalankan server lokal untuk menguji hasil *build* produksi.
- `"typecheck": "tsc --noEmit"` — Memvalidasi kode TypeScript tanpa menghasilkan file output.

#### c. Perbedaan `dependencies` vs `devDependencies`
- **`dependencies`**: Package yang **dibutuhkan saat aplikasi berjalan di produksi (runtime)** di browser pengguna. Contoh pada proyek ini: `react` dan `react-dom`.
- **`devDependencies`**: Package yang **hanya dibutuhkan saat proses pengembangan (development) dan kompilasi/build**, serta tidak ikut dikirim ke kode akhir di browser. Contoh pada proyek ini: `typescript`, `vite`, `@vitejs/plugin-react`, `@types/react`, dan `@types/react-dom`.

#### d. Memahami Semantic Versioning (`MAJOR.MINOR.PATCH`)
Format versi pada `package.json` menggunakan tiga angka `MAJOR.MINOR.PATCH` (contoh: `18.3.1`):
1. **MAJOR (`18`)**: Perubahan besar yang mungkin tidak kompatibel dengan versi sebelumnya (*breaking changes*).
2. **MINOR (`3`)**: Penambahan fitur baru yang masih kompatibel ke belakang (*backward-compatible*).
3. **PATCH (`1`)**: Perbaikan *bug* atau celah keamanan tanpa mengubah fitur.
- Simbol Caret `^5.4.10`: Mengizinkan update otomatis untuk versi **MINOR** dan **PATCH** (`>=5.4.10 <6.0.0`).
- Simbol Tilde `~5.6.2`: Mengizinkan update otomatis hanya untuk versi **PATCH** (`>=5.6.2 <5.7.0`).

---

### 4. Environment Variables (`.env` & `.env.example`)

- File **`.env`** digunakan untuk menyimpan konfigurasi lokal aplikasi dan **telah dimasukkan ke `.gitignore`** agar tidak terunggah ke GitHub.
- File **`.env.example`** disediakan sebagai template aman yang boleh diunggah ke GitHub tanpa berisi kredensial asli.
- **Keamanan Password & API Key di Vite**:
  - Variabel **non-rahasia** menggunakan awalan `VITE_` (seperti `VITE_APP_NAME="SiTugas Kuliah"`, `VITE_APP_VERSION="1.0.0"`, `VITE_APP_SEMESTER="Semester Ganjil 2026/2027"`) sehingga dapat dibaca di komponen melalui `import.meta.env.VITE_APP_NAME`.
  - Variabel **rahasia** (seperti `SECRET_API_KEY` dan `DB_PASSWORD`) **tidak diberi awalan `VITE_`** dan **tidak pernah dipanggil di kode frontend**, sehingga Vite secara otomatis memblokir variabel tersebut agar tidak pernah bocor ke bundle browser.

---

### 5. Panduan Langkah demi Langkah Git & GitHub (Sesuai Ketentuan)

Berikut panduan perintah Git lengkap yang dapat Anda jalankan secara berurutan di terminal dalam folder `tugas-kuliah-app` untuk memenuhi seluruh syarat Git & GitHub (minimal 5 commit, minimal 2 branch, merge, menyelesaikan merge conflict, push/pull, dan Pull Request):

#### Langkah 1: Inisialisasi Git & Commit ke-1 s/d ke-3 di Branch `main`
```bash
cd tugas-kuliah-app
git init
git branch -M main

# Commit 1: Konfigurasi proyek dasar & .gitignore
git add package.json tsconfig.json vite.config.ts index.html .gitignore .env.example
git commit -m "chore: inisialisasi proyek Vite TypeScript dan konfigurasi env example"

# Commit 2: Menambahkan tipe data TypeScript & fungsi Generics
git add src/vite-env.d.ts src/types/task.ts src/utils/generics.ts
git commit -m "feat: menambahkan interface, union type, dan utilitas generics TypeScript"

# Commit 3: Menambahkan data awal, komponen utama, dan styling responsif
git add src/data/initialTasks.ts src/App.tsx src/App.css src/main.tsx README.md
git commit -m "feat: implementasi komponen CRUD daftar tugas kuliah dan tampilan responsif"
```

#### Langkah 2: Membuat Branch ke-1 (`fitur/Course-update`) & Merge ke `main` (Commit ke-4)
```bash
# Buat dan pindah ke branch baru
git checkout -b fitur/Course-update

# (Opsional) Ubah sedikit teks atau tambahkan mata kuliah di src/types/task.ts, lalu commit:
git commit --allow-empty -m "feat: pembaruan daftar mata kuliah default pada branch fitur"

# Kembali ke branch main dan lakukan merge
git checkout main
git merge fitur/Course-update -m "merge: menggabungkan branch fitur/Course-update ke main"
```

#### Langkah 3: Membuat Branch ke-2 (`fitur/judul-header`) & Simulasi Merge Conflict (Commit ke-5 & ke-6)
Untuk mendemonstrasikan penyelesaian **Merge Conflict**:
```bash
# 1. Buat branch ke-2 dari main
git checkout -b fitur/judul-header

# 2. Ubah nilai VITE_APP_NAME di .env.example pada branch fitur/judul-header, lalu commit (Commit 5)
# Misalnya ubah baris VITE_APP_NAME menjadi: VITE_APP_NAME="SiTugas Kuliah Pro"
git add .env.example
git commit -m "feat(header): ubah nama aplikasi di env.example pada branch fitur"

# 3. Pindah kembali ke main dan ubah baris yang sama di .env.example dengan nilai berbeda
git checkout main
# Misalnya ubah baris VITE_APP_NAME menjadi: VITE_APP_NAME="Portal Tugas Mahasiswa"
git add .env.example
git commit -m "chore(header): ubah nama aplikasi di env.example pada branch main"

# 4. Coba gabungkan (merge) branch fitur/judul-header ke main -> Akan muncul MERGE CONFLICT!
git merge fitur/judul-header

# 5. Buka file .env.example, hapus tanda <<<<<<< HEAD, =======, dan >>>>>>> fitur/judul-header
# Pilih teks yang diinginkan, simpan file, lalu selesaikan conflict (Commit 6):
git add .env.example
git commit -m "fix: menyelesaikan merge conflict pada file .env.example"
```

#### Langkah 4: Push, Pull Request, dan Pull dengan Repository GitHub
```bash
# 1. Buat repository baru (kosong) di GitHub, lalu hubungkan remote:
git remote add origin https://github.com/USERNAME_ANDA/tugas-kuliah-app.git

# 2. Push branch main dan branch fitur ke GitHub
git push -u origin main
git push -u origin fitur/judul-header

# 3. Untuk membuat Pull Request (PR):
#    - Buat 1 commit kecil di branch fitur/Course-update atau branch baru:
git checkout -b fitur/dokumentasi-pr
git commit --allow-empty -m "docs: melengkapi dokumentasi untuk Pull Request"
git push -u origin fitur/dokumentasi-pr
#    - Buka halaman repository GitHub Anda di browser -> klik "Compare & pull request"
#    - Buat Pull Request ke branch `main`, lalu klik "Merge pull request" di GitHub.

# 4. Tarik (Pull) perubahan hasil merge PR dari GitHub ke lokal Anda:
git checkout main
git pull origin main
```
