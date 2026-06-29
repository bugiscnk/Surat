import { User, SuratMasuk, SuratKeluar, Disposisi, AuditTrail, Notifikasi } from './types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    nama: 'Syahrul Ramadhan, S.Kom., M.T.',
    nip: '198510122010011005',
    jabatan: 'Super Administrator',
    role: 'Super Admin',
    status: 'Aktif',
    password: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
  },
  {
    id: 'user-2',
    nama: 'Hj. Sitti Rahmawati, S.Sos.',
    nip: '197405151998032002',
    jabatan: 'Admin Persuratan & Arsiparis',
    role: 'Admin Persuratan',
    status: 'Aktif',
    password: 'staff',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces'
  },
  {
    id: 'user-3',
    nama: 'Dr. Ir. H. Andi Bachtiar, M.Si.',
    nip: '196808201994031004',
    jabatan: 'Kepala Dinas',
    role: 'Pimpinan',
    status: 'Aktif',
    password: 'bos',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
  },
  {
    id: 'user-4',
    nama: 'Budi Darmawan, S.STP.',
    nip: '199104052014061001',
    jabatan: 'Analis Kebijakan / Pelaksana',
    role: 'Pelaksana',
    status: 'Aktif',
    password: 'budi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces'
  },
  {
    id: 'user-5',
    nama: 'Siti Aminah, S.E.',
    nip: '199311242018012003',
    jabatan: 'Pranata Humas / Pelaksana',
    role: 'Pelaksana',
    status: 'Aktif',
    password: 'siti',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces'
  }
];

export const mockSuratMasuk: SuratMasuk[] = [
  {
    id: 'sm-1',
    nomorSurat: '045.2/1023/BAPPEDA/2026',
    tanggalSurat: '2026-06-15',
    tanggalTerima: '2026-06-16',
    asalSurat: 'Badan Perencanaan Pembangunan Daerah (BAPPEDA) Provinsi',
    perihal: 'Undangan Rapat Koordinasi Penyusunan Rencana Kerja Pemerintah Daerah (RKPD) Tahun Anggaran 2027',
    sifat: 'Penting',
    klasifikasi: 'Umum',
    status: 'Disposisi',
    lampiran: 'Surat_Undangan_RKPD_2027.pdf',
    fileUrl: 'berkas_undangan_rkpd.pdf'
  },
  {
    id: 'sm-2',
    nomorSurat: '900/4521/BPKAD/2026',
    tanggalSurat: '2026-06-18',
    tanggalTerima: '2026-06-19',
    asalSurat: 'Badan Pengelolaan Keuangan dan Aset Daerah (BPKAD)',
    perihal: 'Pemberitahuan Rekonsiliasi Laporan Realisasi Anggaran Triwulan II Tahun 2026',
    sifat: 'Sangat Segera',
    klasifikasi: 'Keuangan',
    status: 'Selesai',
    lampiran: 'Panduan_Rekonsiliasi_Q2.pdf',
    fileUrl: 'surat_bpkad_keuangan_q2.pdf'
  },
  {
    id: 'sm-3',
    nomorSurat: '800/1205/BKD/2026',
    tanggalSurat: '2026-06-20',
    tanggalTerima: '2026-06-22',
    asalSurat: 'Badan Kepegawaian Daerah (BKD)',
    perihal: 'Pemutakhiran Data Mandiri Pegawai Negeri Sipil melalui Aplikasi SAPK',
    sifat: 'Biasa',
    klasifikasi: 'Kepegawaian',
    status: 'Diteruskan',
    lampiran: 'Petunjuk_Teknis_PDM_SAPK.pdf',
    fileUrl: 'pdm_kepegawaian_2026.pdf'
  },
  {
    id: 'sm-4',
    nomorSurat: '180/084/HUKUM/2026',
    tanggalSurat: '2026-06-25',
    tanggalTerima: '2026-06-26',
    asalSurat: 'Biro Hukum dan Organisasi Setda Provinsi',
    perihal: 'Penyampaian Salinan Peraturan Gubernur tentang Tata Naskah Dinas Elektronik',
    sifat: 'Rahasia',
    klasifikasi: 'Hukum',
    status: 'Draft',
    lampiran: 'Pergub_Tata_Naskah_Elektronik_2026.pdf',
    fileUrl: 'pergub_naskah_dinas_2026.pdf'
  }
];

export const mockSuratKeluar: SuratKeluar[] = [
  {
    id: 'sk-1',
    nomorSurat: '090/512/DK/VI/2026',
    tanggalSurat: '2026-06-21',
    tujuan: 'Kepala Dinas Komunikasi dan Informatika Provinsi',
    perihal: 'Permohonan Fasilitasi Integrasi Domain Aplikasi e-Surat dan Subdomain Instansi',
    sifat: 'Biasa',
    klasifikasi: 'Umum',
    status: 'Dikirim',
    tembusan: 'Sekretaris Daerah Provinsi',
    lampiran: 'Topologi_Arsitektur_Integrasi.pdf',
    fileUrl: 'surat_keluar_diskominfo.pdf'
  },
  {
    id: 'sk-2',
    nomorSurat: '900/618/DK/VI/2026',
    tanggalSurat: '2026-06-24',
    tujuan: 'Pimpinan Cabang Bank Pembangunan Daerah (BPD)',
    perihal: 'Permohonan Pembukaan Rekening Virtual Account Pembayaran Retribusi Daerah',
    sifat: 'Penting',
    klasifikasi: 'Keuangan',
    status: 'Draft',
    lampiran: 'Proposal_Retribusi_Virtual.pdf',
    fileUrl: 'surat_keluar_bank_bpd.pdf'
  }
];

export const mockDisposisi: Disposisi[] = [
  {
    id: 'disp-1',
    suratMasukId: 'sm-1',
    pengirimId: 'user-3', // Kepala Dinas
    pelaksanaIds: ['user-4', 'user-5'], // Budi & Siti
    instruksi: 'Tolong hadiri rapat koordinasi ini, buat kajian singkat kesiapan program kerja kita untuk RKPD 2027, dan koordinasikan dengan Bidang Sarana Prasarana.',
    tenggatWaktu: '2026-07-02',
    status: 'Sedang Dikerjakan',
    tanggalDisposisi: '2026-06-17'
  },
  {
    id: 'disp-2',
    suratMasukId: 'sm-2',
    pengirimId: 'user-3',
    pelaksanaIds: ['user-5'], // Siti Aminah
    instruksi: 'Lakukan rekonsiliasi data keuangan triwulan II segera dengan bendahara pengeluaran dan laporkan hasilnya sebelum tenggat waktu.',
    tenggatWaktu: '2026-06-28',
    status: 'Selesai',
    tanggalDisposisi: '2026-06-20',
    catatanBalasan: 'Laporan rekonsiliasi keuangan triwulan II telah selesai disinkronkan dengan BPKAD. Semua angka sudah klop dan draf berita acara rekonsiliasi telah ditandatangani.',
    dokumenBalasan: 'Berita_Acara_Rekon_Terverifikasi.pdf'
  }
];

export const mockAuditTrail: AuditTrail[] = [
  {
    id: 'audit-1',
    timestamp: '2026-06-16T08:30:00Z',
    userId: 'user-2',
    namaUser: 'Hj. Sitti Rahmawati, S.Sos.',
    action: 'Registrasi Surat Masuk',
    description: 'Mendaftarkan surat masuk baru nomor 045.2/1023/BAPPEDA/2026 dari BAPPEDA Provinsi.'
  },
  {
    id: 'audit-2',
    timestamp: '2026-06-17T09:15:00Z',
    userId: 'user-2',
    namaUser: 'Hj. Sitti Rahmawati, S.Sos.',
    action: 'Meneruskan Surat',
    description: 'Meneruskan surat Nomor 045.2/1023/BAPPEDA/2026 ke Kepala Dinas untuk didisposisikan.'
  },
  {
    id: 'audit-3',
    timestamp: '2026-06-17T11:00:00Z',
    userId: 'user-3',
    namaUser: 'Dr. Ir. H. Andi Bachtiar, M.Si.',
    action: 'Penerbitan Disposisi',
    description: 'Menerbitkan instruksi disposisi surat BAPPEDA ke pelaksana: Budi Darmawan, Siti Aminah.'
  },
  {
    id: 'audit-4',
    timestamp: '2026-06-19T09:40:00Z',
    userId: 'user-2',
    namaUser: 'Hj. Sitti Rahmawati, S.Sos.',
    action: 'Registrasi Surat Masuk',
    description: 'Mendaftarkan surat masuk baru nomor 900/4521/BPKAD/2026 dari BPKAD.'
  },
  {
    id: 'audit-5',
    timestamp: '2026-06-20T10:05:00Z',
    userId: 'user-3',
    namaUser: 'Dr. Ir. H. Andi Bachtiar, M.Si.',
    action: 'Penerbitan Disposisi',
    description: 'Menerbitkan disposisi surat BPKAD ke pelaksana: Siti Aminah.'
  },
  {
    id: 'audit-6',
    timestamp: '2026-06-24T15:30:00Z',
    userId: 'user-5',
    namaUser: 'Siti Aminah, S.E.',
    action: 'Penyelesaian Tugas Disposisi',
    description: 'Menyelesaikan tugas disposisi surat BPKAD dengan melampirkan laporan rekonsiliasi.'
  }
];

export const mockNotifikasi: Notifikasi[] = [
  {
    id: 'notif-1',
    userId: 'user-3',
    title: 'Surat Masuk Baru Diterima',
    message: 'Surat BKD nomor 800/1205/BKD/2026 telah diteruskan ke meja Anda.',
    read: false,
    timestamp: '2026-06-22T10:25:00Z'
  },
  {
    id: 'notif-2',
    userId: 'user-4',
    title: 'Disposisi Baru dari Pimpinan',
    message: 'Anda menerima instruksi disposisi baru dari Kepala Dinas perihal RKPD 2027.',
    read: false,
    timestamp: '2026-06-17T11:00:00Z'
  },
  {
    id: 'notif-3',
    userId: 'user-3',
    title: 'Tugas Disposisi Selesai',
    message: 'Siti Aminah telah merampungkan tindak lanjut disposisi surat nomor 900/4521/BPKAD/2026.',
    read: true,
    timestamp: '2026-06-24T15:30:00Z'
  }
];
