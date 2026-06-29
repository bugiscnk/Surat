export type UserRole = 'Super Admin' | 'Admin Persuratan' | 'Pimpinan' | 'Pelaksana';

export interface User {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  role: UserRole;
  status: 'Aktif' | 'Nonaktif';
  password?: string;
  avatar?: string;
}

export type SifatSurat = 'Biasa' | 'Penting' | 'Rahasia' | 'Sangat Segera';
export type KlasifikasiSurat = 'Umum' | 'Keuangan' | 'Kepegawaian' | 'Hukum' | 'Sarpras';

export interface SuratMasuk {
  id: string;
  nomorSurat: string;
  tanggalSurat: string;
  tanggalTerima: string;
  asalSurat: string;
  perihal: string;
  sifat: SifatSurat;
  klasifikasi: KlasifikasiSurat;
  status: 'Draft' | 'Diteruskan' | 'Disposisi' | 'Selesai';
  lampiran?: string;
  fileUrl?: string; // Berkas fisik surat
}

export interface SuratKeluar {
  id: string;
  nomorSurat: string;
  tanggalSurat: string;
  tujuan: string;
  perihal: string;
  sifat: SifatSurat;
  klasifikasi: KlasifikasiSurat;
  status: 'Draft' | 'Dikirim';
  tembusan?: string;
  lampiran?: string;
  fileUrl?: string; // Berkas fisik surat keluar
}

export interface Disposisi {
  id: string;
  suratMasukId: string;
  pengirimId: string; // ID Pimpinan yang mendisposisikan
  pelaksanaIds: string[]; // ID Pelaksana penerima disposisi
  instruksi: string;
  tenggatWaktu: string;
  status: 'Menunggu' | 'Sedang Dikerjakan' | 'Selesai';
  tanggalDisposisi: string;
  catatanBalasan?: string;
  dokumenBalasan?: string; // Berkas laporan hasil tindak lanjut pelaksana
}

export interface AuditTrail {
  id: string;
  timestamp: string;
  userId: string;
  namaUser: string;
  action: string;
  description: string;
}

export interface Notifikasi {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}
