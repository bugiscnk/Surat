export type UserRole = 'Super Admin' | 'Admin Persuratan' | 'Pimpinan' | 'Pelaksana';

export interface User {
  id: string;
  nip: string;
  nama: string;
  role: UserRole;
  status: 'Aktif' | 'Nonaktif';
  jabatan: string;
  foto?: string;
  password?: string;
}

export type SifatSurat = 'Biasa' | 'Penting' | 'Rahasia';
export type KlasifikasiSurat = 'Umum' | 'Keuangan' | 'Kepegawaian' | 'Akademik';

export type StatusSuratMasuk = 'Draft' | 'Diteruskan' | 'Didisposisikan' | 'Selesai';
export type StatusSuratKeluar = 'Draft' | 'Dikirim';

export interface SuratMasuk {
  id: string;
  nomorSurat: string;
  tanggalSurat: string;
  tanggalTerima: string;
  asalSurat: string;
  perihal: string;
  sifat: SifatSurat;
  klasifikasi: KlasifikasiSurat;
  status: StatusSuratMasuk;
  lampiran?: string;
}

export interface SuratKeluar {
  id: string;
  nomorSurat: string;
  tanggalSurat: string;
  tujuan: string;
  perihal: string;
  sifat: SifatSurat;
  klasifikasi: KlasifikasiSurat;
  status: StatusSuratKeluar;
  tembusan?: string;
  lampiran?: string;
}

export type StatusDisposisi = 'Menunggu' | 'Sedang Dikerjakan' | 'Selesai';

export interface Disposisi {
  id: string;
  suratMasukId: string;
  pengirimId: string; // ID of Pimpinan
  pelaksanaIds: string[]; // IDs of Pelaksana
  instruksi: string;
  tenggatWaktu: string;
  status: StatusDisposisi;
  catatanBalasan?: string;
  dokumenBalasan?: string;
  tanggalDisposisi: string;
}

export interface AuditTrail {
  id: string;
  suratId: string;
  jenisSurat: 'Masuk' | 'Keluar';
  tanggal: string;
  aksi: string;
  aktor: string;
  deskripsi: string;
}

export interface Notifikasi {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal: string;
  dibaca: boolean;
  targetRole?: UserRole;
}
