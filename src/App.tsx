import React, { useState, useEffect, useMemo } from 'react';
import {
  Task,
  TaskStatus,
  TaskPriority,
  FilterStatus,
  SortOption,
  TaskFormData,
  TaskStats,
  AppEnvConfig,
  DEFAULT_COURSES,
  PRIORITY_OPTIONS,
} from './types/task';
import {
  loadFromStorage,
  saveToStorage,
  filterArray,
  updateItemById,
} from './utils/generics';
import { INITIAL_TASKS } from './data/initialTasks';
import './App.css';

// Membaca konfigurasi non-rahasia dari file .env menggunakan import.meta.env
const ENV_CONFIG: AppEnvConfig = {
  appName: import.meta.env.VITE_APP_NAME || 'SiTugas Kuliah',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  semester: import.meta.env.VITE_APP_SEMESTER || 'Semester Aktif',
  storageKey: import.meta.env.VITE_STORAGE_KEY || 'situgas_kuliah_tasks_v1',
};

const EMPTY_FORM: TaskFormData = {
  title: '',
  course: DEFAULT_COURSES[0],
  description: '',
  deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  sks: 3,
  priority: 'Sedang',
  isCompleted: false,
};

export function App(): React.JSX.Element {
  // State utama menggunakan Array of Interface: Task[]
  const [tasks, setTasks] = useState<Task[]>(() => {
    const result = loadFromStorage<Task[]>(ENV_CONFIG.storageKey, INITIAL_TASKS);
    return result.data;
  });

  // State form tambah & edit tugas
  const [formData, setFormData] = useState<TaskFormData>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string>('');

  // State pencarian, filter status (Union Type), filter mata kuliah, dan urutan
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('Semua');
  const [courseFilter, setCourseFilter] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<SortOption>('deadline-asc');
  const [notification, setNotification] = useState<string>('');

  // Simpan perubahan daftar tugas ke LocalStorage menggunakan fungsi Generic
  useEffect(() => {
    saveToStorage<Task[]>(ENV_CONFIG.storageKey, tasks);
  }, [tasks]);

  // Helper notifikasi singkat (menggunakan primitive string)
  const showToast = (msg: string): void => {
    setNotification(msg);
    window.setTimeout(() => {
      setNotification((prev: string) => (prev === msg ? '' : prev));
    }, 3000);
  };

  // Menghitung statistik tugas dengan Interface TaskStats dan Primitive Types (number)
  const stats: TaskStats = useMemo(() => {
    const totalTasks: number = tasks.length;
    const completedTasks: number = filterArray<Task>(
      tasks,
      (t: Task) => t.isCompleted
    ).length;
    const pendingTasks: number = totalTasks - completedTasks;
    const completionPercentage: number =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const totalSksPending: number = filterArray<Task>(
      tasks,
      (t: Task) => !t.isCompleted
    ).reduce((acc: number, curr: Task) => acc + curr.sks, 0);

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionPercentage,
      totalSksPending,
    };
  }, [tasks]);

  // Daftar unik mata kuliah (Array string[])
  const availableCourses: string[] = useMemo(() => {
    const combined: string[] = [
      ...DEFAULT_COURSES,
      ...tasks.map((t: Task) => t.course),
    ];
    return Array.from(new Set(combined));
  }, [tasks]);

  // Menyaring dan mengurutkan tugas menggunakan fungsi Generic filterArray<Task>
  const filteredTasks: Task[] = useMemo(() => {
    const filtered: Task[] = filterArray<Task>(tasks, (task: Task) => {
      const matchesStatus: boolean =
        statusFilter === 'Semua' || task.status === statusFilter;
      const matchesCourse: boolean =
        courseFilter === 'Semua' || task.course === courseFilter;
      const query: string = searchQuery.trim().toLowerCase();
      const matchesSearch: boolean =
        query === '' ||
        task.title.toLowerCase().includes(query) ||
        task.course.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query);

      return matchesStatus && matchesCourse && matchesSearch;
    });

    const priorityWeight: Record<TaskPriority, number> = {
      Tinggi: 3,
      Sedang: 2,
      Rendah: 1,
    };

    return [...filtered].sort((a: Task, b: Task) => {
      if (sortBy === 'deadline-asc') {
        return a.deadline.localeCompare(b.deadline);
      }
      if (sortBy === 'priority-desc') {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return b.createdAt - a.createdAt;
    });
  }, [tasks, statusFilter, courseFilter, searchQuery, sortBy]);

  // Handler Submit Form (Tambah Tugas Baru atau Simpan Edit Tugas)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const cleanTitle: string = formData.title.trim();
    const cleanCourse: string = formData.course.trim();

    if (!cleanTitle || !cleanCourse || !formData.deadline) {
      setFormError('Judul tugas, mata kuliah, dan tenggat waktu wajib diisi!');
      return;
    }

    setFormError('');
    const computedStatus: TaskStatus = formData.isCompleted
      ? 'Selesai'
      : 'Belum Selesai';

    if (editingId) {
      // Update tugas menggunakan fungsi Generic updateItemById<Task>
      setTasks((prev: Task[]) =>
        updateItemById<Task>(prev, editingId, (existing: Task) => ({
          ...existing,
          title: cleanTitle,
          course: cleanCourse,
          description: formData.description.trim(),
          deadline: formData.deadline,
          sks: Number(formData.sks) || 1,
          priority: formData.priority,
          isCompleted: formData.isCompleted,
          status: computedStatus,
        }))
      );
      setEditingId(null);
      showToast(`Tugas "${cleanTitle}" berhasil diperbarui!`);
    } else {
      // Menambahkan tugas baru ke Array Task[]
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: cleanTitle,
        course: cleanCourse,
        description: formData.description.trim(),
        deadline: formData.deadline,
        sks: Number(formData.sks) || 1,
        isCompleted: formData.isCompleted,
        status: computedStatus,
        priority: formData.priority,
        createdAt: Date.now(),
      };
      setTasks((prev: Task[]) => [newTask, ...prev]);
      showToast(`Tugas baru "${cleanTitle}" berhasil ditambahkan!`);
    }

    setFormData(EMPTY_FORM);
  };

  // Handler mulai mengedit tugas
  const handleStartEdit = (task: Task): void => {
    setEditingId(task.id);
    setFormData({
      title: task.title,
      course: task.course,
      description: task.description,
      deadline: task.deadline,
      sks: task.sks,
      priority: task.priority,
      isCompleted: task.isCompleted,
    });
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler membatalkan mode edit
  const handleCancelEdit = (): void => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError('');
  };

  // Handler mengubah status tugas (Belum Selesai <-> Selesai)
  const handleToggleStatus = (id: string): void => {
    setTasks((prev: Task[]) =>
      updateItemById<Task>(prev, id, (task: Task) => {
        const nextCompleted: boolean = !task.isCompleted;
        const nextStatus: TaskStatus = nextCompleted
          ? 'Selesai'
          : 'Belum Selesai';
        return {
          ...task,
          isCompleted: nextCompleted,
          status: nextStatus,
        };
      })
    );
    showToast('Status tugas berhasil diperbarui!');
  };

  // Handler menghapus tugas
  const handleDelete = (task: Task): void => {
    const confirmed: boolean = window.confirm(
      `Apakah Anda yakin ingin menghapus tugas "${task.title}"?`
    );
    if (!confirmed) return;

    setTasks((prev: Task[]) =>
      filterArray<Task>(prev, (item: Task) => item.id !== task.id)
    );
    if (editingId === task.id) {
      handleCancelEdit();
    }
    showToast(`Tugas "${task.title}" telah dihapus.`);
  };

  // Handler hapus semua tugas (kosongkan daftar)
  const handleClearAll = (): void => {
    const confirmed: boolean = window.confirm(
      'Kosongkan semua daftar tugas?'
    );
    if (!confirmed) return;
    setTasks([]);
    handleCancelEdit();
    showToast('Semua daftar tugas telah dikosongkan.');
  };

  // Helper format tanggal Indonesia
  const formatDeadline = (dateStr: string): string => {
    try {
      const date = new Date(`${dateStr}T00:00:00`);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="app-wrapper">
      {/* Header Aplikasi dengan info dari Environment Variables (.env) */}
      <header className="app-header">
        <div className="container header-inner">
          <div className="brand">
            <div className="brand-icon" aria-hidden="true">
              🎓
            </div>
            <div>
              <div className="brand-title-row">
                <h1>{ENV_CONFIG.appName}</h1>
                <span className="version-badge">v{ENV_CONFIG.appVersion}</span>
              </div>
              <p className="subtitle">
                Manajemen Daftar Tugas Kuliah Mahasiswa • {ENV_CONFIG.semester}
              </p>
            </div>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="btn btn-outline-light"
              onClick={handleClearAll}
              title="Kosongkan seluruh daftar tugas"
            >
              Kosongkan Tugas
            </button>
          </div>
        </div>
      </header>

      {/* Notifikasi Toast */}
      {notification && (
        <div className="toast-banner" role="status">
          <span>✅ {notification}</span>
        </div>
      )}

      <main className="container main-content">
        {/* Ringkasan Statistik Tugas */}
        <section className="stats-grid" aria-label="Ringkasan Statistik Tugas">
          <div className="stat-card">
            <span className="stat-label">Total Tugas</span>
            <strong className="stat-value">{stats.totalTasks}</strong>
            <span className="stat-meta">Semua mata kuliah</span>
          </div>
          <div className="stat-card stat-pending">
            <span className="stat-label">Belum Selesai</span>
            <strong className="stat-value">{stats.pendingTasks}</strong>
            <span className="stat-meta">
              Total beban {stats.totalSksPending} SKS aktif
            </span>
          </div>
          <div className="stat-card stat-completed">
            <span className="stat-label">Selesai</span>
            <strong className="stat-value">{stats.completedTasks}</strong>
            <span className="stat-meta">Tugas telah dikumpulkan</span>
          </div>
          <div className="stat-card stat-progress">
            <div className="stat-progress-header">
              <span className="stat-label">Progres Penyelesaian</span>
              <strong className="stat-percentage">
                {stats.completionPercentage}%
              </strong>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
            <span className="stat-meta">
              {stats.completedTasks} dari {stats.totalTasks} tugas tuntas
            </span>
          </div>
        </section>

        <div className="workspace-grid">
          {/* Panel Kiri: Form Tambah / Edit Tugas */}
          <aside className="form-panel">
            <div className="card">
              <div className="card-header">
                <h2>
                  {editingId ? '✏️ Edit Tugas Kuliah' : '➕ Tambah Tugas Baru'}
                </h2>
                <p>
                  {editingId
                    ? 'Perbarui detail tugas kuliah yang sedang dipilih.'
                    : 'Catat tugas baru agar tidak terlewat tenggat pengumpulan.'}
                </p>
              </div>

              {formError && <div className="alert-error">{formError}</div>}

              <form onSubmit={handleSubmit} className="task-form">
                <div className="form-group">
                  <label htmlFor="title">Judul Tugas Kuliah *</label>
                  <input
                    id="title"
                    type="text"
                    placeholder="Contoh: Makalah Arsitektur Web"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="course">Mata Kuliah *</label>
                  <input
                    id="course"
                    list="course-suggestions"
                    type="text"
                    placeholder="Pilih atau ketik nama mata kuliah"
                    value={formData.course}
                    onChange={(e) =>
                      setFormData({ ...formData, course: e.target.value })
                    }
                    required
                  />
                  <datalist id="course-suggestions">
                    {availableCourses.map((courseName: string) => (
                      <option key={courseName} value={courseName} />
                    ))}
                  </datalist>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="deadline">Deadline *</label>
                    <input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="sks">Bobot SKS</label>
                    <input
                      id="sks"
                      type="number"
                      min={1}
                      max={6}
                      value={formData.sks}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sks: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="priority">Prioritas</label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: e.target.value as TaskPriority,
                        })
                      }
                    >
                      {PRIORITY_OPTIONS.map((prio: TaskPriority) => (
                        <option key={prio} value={prio}>
                          {prio}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="status-select">Status Awal</label>
                    <select
                      id="status-select"
                      value={formData.isCompleted ? 'Selesai' : 'Belum Selesai'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isCompleted: e.target.value === 'Selesai',
                        })
                      }
                    >
                      <option value="Belum Selesai">Belum Selesai</option>
                      <option value="Selesai">Selesai</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Deskripsi / Catatan Tugas</label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="Detail instruksi dosen, format file, atau link pengumpulan..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="form-buttons">
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Simpan Perubahan' : 'Tambah Tugas'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>
          </aside>

          {/* Panel Kanan: Daftar Tugas & Filter */}
          <section className="list-panel">
            <div className="card filter-bar">
              <div className="search-box">
                <input
                  type="search"
                  placeholder="🔍 Cari judul tugas, mata kuliah, atau catatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Cari tugas kuliah"
                />
              </div>

              <div className="filter-controls">
                <div className="status-tabs" role="tablist">
                  {(['Semua', 'Belum Selesai', 'Selesai'] as FilterStatus[]).map(
                    (tab: FilterStatus) => (
                      <button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={statusFilter === tab}
                        className={`tab-btn ${
                          statusFilter === tab ? 'active' : ''
                        }`}
                        onClick={() => setStatusFilter(tab)}
                      >
                        {tab}
                      </button>
                    )
                  )}
                </div>

                <div className="dropdown-filters">
                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    aria-label="Filter Mata Kuliah"
                  >
                    <option value="Semua">Semua Mata Kuliah</option>
                    {availableCourses.map((c: string) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    aria-label="Urutkan Tugas"
                  >
                    <option value="deadline-asc">Urut: Deadline Terdekat</option>
                    <option value="priority-desc">
                      Urut: Prioritas Tertinggi
                    </option>
                    <option value="created-desc">Urut: Terbaru Dibuat</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Daftar Kartu Tugas */}
            {filteredTasks.length === 0 ? (
              <div className="card empty-state">
                <div className="empty-icon">📚</div>
                <h3>Tidak Ada Tugas yang Ditemukan</h3>
                <p>
                  Belum ada tugas yang sesuai dengan filter pencarian Anda, atau
                  tambahkan tugas baru melalui formulir di samping.
                </p>
              </div>
            ) : (
              <div className="task-list">
                {filteredTasks.map((task: Task) => (
                  <article
                    key={task.id}
                    className={`card task-card ${
                      task.isCompleted ? 'task-done' : ''
                    } ${editingId === task.id ? 'task-editing' : ''}`}
                  >
                    <div className="task-card-top">
                      <div className="task-badges">
                        <span className="badge badge-course">{task.course}</span>
                        <span className="badge badge-sks">{task.sks} SKS</span>
                        <span
                          className={`badge badge-priority priority-${task.priority.toLowerCase()}`}
                        >
                          Prioritas {task.priority}
                        </span>
                      </div>

                      <span
                        className={`status-pill ${
                          task.isCompleted ? 'status-selesai' : 'status-belum'
                        }`}
                      >
                        {task.status === 'Selesai'
                          ? '✓ Selesai'
                          : '⏳ Belum Selesai'}
                      </span>
                    </div>

                    <h3 className="task-title">{task.title}</h3>
                    {task.description && (
                      <p className="task-desc">{task.description}</p>
                    )}

                    <div className="task-card-footer">
                      <div className="task-deadline">
                        <span>📅 Tenggat: </span>
                        <strong>{formatDeadline(task.deadline)}</strong>
                      </div>

                      <div className="task-actions">
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            task.isCompleted ? 'btn-warning' : 'btn-success'
                          }`}
                          onClick={() => handleToggleStatus(task.id)}
                        >
                          {task.isCompleted
                            ? 'Tandai Belum Selesai'
                            : '✓ Tandai Selesai'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-edit"
                          onClick={() => handleStartEdit(task)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(task)}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <div className="container footer-inner">
          <p>
            <strong>{ENV_CONFIG.appName}</strong> v{ENV_CONFIG.appVersion} •
            Dibuat dengan TypeScript, React, dan Vite
          </p>
          <p className="footer-note">
            Konfigurasi publik dimuat dari <code>.env</code> (tanpa mengekspos
            API Key / Password rahasia).
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
