import { User, SuratMasuk, SuratKeluar, Disposisi, AuditTrail, Notifikasi } from './types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    nip: '198804152010121001',
    nama: 'Budi Santoso, M.Kom.',
    role: 'Super Admin',
    status: 'Aktif',
    jabatan: 'Kepala Bidang IT & Sistem Persuratan',
    foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'
  },
  {
    id: 'user-2',
    nip: '199211052015032002',
    nama: 'Siti Aminah, A.Md.',
    role: 'Admin Persuratan',
    status: 'Aktif',
    jabatan: 'Staf Sekretariat & Registrasi',
    foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop'
  },
  {
    id: 'user-3',
    nip: '197508221999031003',
    nama: 'Dr. Ahmad Fauzi, M.T.',
    role: 'Pimpinan',
    status: 'Aktif',
    jabatan: 'Kepala Dinas Persuratan Digital',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop'
  },
  {
    id: 'user-4',
    nip: '198501102008011002',
    nama: 'Hendra Wijaya, S.E.',
    role: 'Pelaksana',
    status: 'Aktif',
    jabatan: 'Kepala Subbagian Keuangan & Aset',
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop'
  },
  {
    id: 'user-5',
    nip: '198907142012122001',
    nama: 'Rina Kartika, S.H.',
    role: 'Pelaksana',
    status: 'Aktif',
    jabatan: 'Penyusun Administrasi Kepegawaian',
    foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&auto=format&fit=crop'
  },
  {
    id: 'user-6',
    nip: '199503122018082003',
    nama: 'Andi Saputra, S.T.',
    role: 'Pelaksana',
    status: 'Aktif',
    jabatan: 'Analid Sistem & Jaringan',
    foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop'
  }
];

export const mockSuratMasuk: SuratMasuk[] = [
  {
    id: 'sm-1',
    nomorSurat: '045.2/210/DISDIK/2026',
    tanggalSurat: '2026-06-15',
    tanggalTerima: '2026-06-16',
    asalSurat: 'Dinas Pendidikan Provinsi',
    perihal: 'Undangan Rapat Koordinasi Kurikulum Baru 2026',
    sifat: 'Penting',
    klasifikasi: 'Akademik',
    status: 'Selesai',
    lampiran: 'Undangan_Kurikulum_2026.pdf'
  },
  {
    id: 'sm-2',
    nomorSurat: '900/451/BPKAD/2026',
    tanggalSurat: '2026-06-18',
    tanggalTerima: '2026-06-19',
    asalSurat: 'Badan Pengelola Keuangan Daerah',
    perihal: 'Pemberitahuan Alokasi Anggaran Kuartal II',
    sifat: 'Penting',
    klasifikasi: 'Keuangan',
    status: 'Didisposisikan',
    lampiran: 'DED_Alokasi_Anggaran_Q2.pdf'
  },
  {
    id: 'sm-3',
    nomorSurat: '800/1024/BKD-KAB/2026',
    tanggalSurat: '2026-06-20',
    tanggalTerima: '2026-06-21',
    asalSurat: 'Badan Kepegawaian Daerah',
    perihal: 'Pemutakhiran Data Profil ASN Tahun 2026',
    sifat: 'Biasa',
    klasifikasi: 'Kepegawaian',
    status: 'Selesai',
    lampiran: 'Instruksi_Profil_ASN.pdf'
  },
  {
    id: 'sm-4',
    nomorSurat: '005/112/SETDA/2026',
    tanggalSurat: '2026-06-22',
    tanggalTerima: '2026-06-23',
    asalSurat: 'Sekretariat Daerah',
    perihal: 'Undangan Upacara Hari Kemerdekaan Tingkat Provinsi',
    sifat: 'Biasa',
    klasifikasi: 'Umum',
    status: 'Diteruskan',
    lampiran: 'Upacara_Proklamasi_Jadwal.pdf'
  },
  {
    id: 'sm-5',
    nomorSurat: 'CONF-09/DIR-UT/2026',
    tanggalSurat: '2026-06-23',
    tanggalTerima: '2026-06-24',
    asalSurat: 'PT. Telekomunikasi Indonesia Tbk.',
    perihal: 'Proposal Kerja Sama Infrastruktur Jaringan Tertutup',
    sifat: 'Rahasia',
    klasifikasi: 'Umum',
    status: 'Draft',
    lampiran: 'Proposal_KSO_Telkom_Secure.pdf'
  },
  {
    id: 'sm-6',
    nomorSurat: '421/3091/PMP/2026',
    tanggalSurat: '2026-06-24',
    tanggalTerima: '2026-06-25',
    asalSurat: 'Kementerian Pendidikan & Kebudayaan',
    perihal: 'Penyaluran Bantuan Operasional Satuan Pendidikan',
    sifat: 'Penting',
    klasifikasi: 'Akademik',
    status: 'Didisposisikan',
    lampiran: 'Juknis_BOSP_2026_Nasional.pdf'
  },
  {
    id: 'sm-7',
    nomorSurat: '912/KEU-A/2026',
    tanggalSurat: '2026-06-25',
    tanggalTerima: '2026-06-26',
    asalSurat: 'Kantor Pelayanan Pajak Pratama',
    perihal: 'Klarifikasi Pelaporan SPT Tahunan Badan',
    sifat: 'Penting',
    klasifikasi: 'Keuangan',
    status: 'Didisposisikan',
    lampiran: 'Surat_Klarifikasi_SPT_2025.pdf'
  },
  {
    id: 'sm-8',
    nomorSurat: '120/ADM-UM/2026',
    tanggalSurat: '2026-06-26',
    tanggalTerima: '2026-06-27',
    asalSurat: 'CV. Bintang Persada Jaya',
    perihal: 'Penawaran Pengadaan Alat Tulis Kantor dan Komputer',
    sifat: 'Biasa',
    klasifikasi: 'Umum',
    status: 'Didisposisikan',
    lampiran: 'Katalog_Penawaran_ATK_Aksesoris.pdf'
  },
  {
    id: 'sm-9',
    nomorSurat: '800/220/MUTASI/2026',
    tanggalSurat: '2026-06-26',
    tanggalTerima: '2026-06-27',
    asalSurat: 'Bupati Pemerintah Kabupaten',
    perihal: 'Surat Keputusan Pemindahan Pegawai (Mutasi Jabatan)',
    sifat: 'Rahasia',
    klasifikasi: 'Kepegawaian',
    status: 'Didisposisikan',
    lampiran: 'SK_Mutasi_ASN_Lampiran.pdf'
  },
  {
    id: 'sm-10',
    nomorSurat: '005/99/AKAD-R/2026',
    tanggalSurat: '2026-06-27',
    tanggalTerima: '2026-06-28',
    asalSurat: 'Universitas Indonesia',
    perihal: 'Undangan Menjadi Pembicara Seminar Nasional Digitalisasi',
    sifat: 'Biasa',
    klasifikasi: 'Akademik',
    status: 'Didisposisikan',
    lampiran: 'Kerangka_Acuan_Seminar_Nasional.pdf'
  },
  {
    id: 'sm-11',
    nomorSurat: '221/DIS-KOMINFO/2026',
    tanggalSurat: '2026-06-28',
    tanggalTerima: '2026-06-28',
    asalSurat: 'Dinas Komunikasi dan Informatika',
    perihal: 'Audit Keamanan Siber dan Tata Kelola Portal Web',
    sifat: 'Penting',
    klasifikasi: 'Umum',
    status: 'Diteruskan',
    lampiran: 'Formulir_Audit_Keamanan_Siber.pdf'
  }
];

export const mockSuratKeluar: SuratKeluar[] = [
  {
    id: 'sk-1',
    nomorSurat: '045.2/321/SPD/2026',
    tanggalSurat: '2026-06-18',
    tujuan: 'Dinas Pendidikan Provinsi',
    perihal: 'Konfirmasi Kehadiran Rapat Koordinasi Kurikulum',
    sifat: 'Biasa',
    klasifikasi: 'Akademik',
    status: 'Dikirim',
    tembusan: 'Arsip Umum'
  },
  {
    id: 'sk-2',
    nomorSurat: '900/182/SPD/2026',
    tanggalSurat: '2026-06-22',
    tujuan: 'Badan Pengelola Keuangan Daerah',
    perihal: 'Laporan Realisasi Penggunaan Anggaran Kuartal I',
    sifat: 'Penting',
    klasifikasi: 'Keuangan',
    status: 'Dikirim',
    tembusan: 'Kepala Subbagian Keuangan'
  },
  {
    id: 'sk-3',
    nomorSurat: '800/405/SPD/2026',
    tanggalSurat: '2026-06-25',
    tujuan: 'Badan Kepegawaian Daerah',
    perihal: 'Penyampaian Berkas Fisik ASN untuk Pemutakhiran Data',
    sifat: 'Biasa',
    klasifikasi: 'Kepegawaian',
    status: 'Dikirim',
    tembusan: 'Staf Kepegawaian'
  },
  {
    id: 'sk-4',
    nomorSurat: '005/115/SPD/2026',
    tanggalSurat: '2026-06-27',
    tujuan: 'Seluruh Kepala Bidang & Subbagian',
    perihal: 'Undangan Rapat Evaluasi Kinerja Bulanan Internal',
    sifat: 'Biasa',
    klasifikasi: 'Umum',
    status: 'Draft',
    tembusan: '-'
  },
  {
    id: 'sk-5',
    nomorSurat: 'CONF-02/SPD/2026',
    tanggalSurat: '2026-06-28',
    tujuan: 'PT. Telekomunikasi Indonesia Tbk.',
    perihal: 'Tanggapan Non-Disclosure Agreement (NDA) Kerja Sama',
    sifat: 'Rahasia',
    klasifikasi: 'Umum',
    status: 'Draft',
    tembusan: 'Direktur Utama, Bidang IT'
  }
];

export const mockDisposisi: Disposisi[] = [
  {
    id: 'disp-1',
    suratMasukId: 'sm-1',
    pengirimId: 'user-3',
    pelaksanaIds: ['user-5', 'user-6'],
    instruksi: 'Harap mewakili saya menghadiri rapat koordinasi ini dan segera buat risalah serta laporannya.',
    tenggatWaktu: '2026-06-18',
    status: 'Selesai',
    catatanBalasan: 'Laporan telah diselesaikan dan diunggah. Rapat membahas implementasi kurikulum vokasi siber.',
    dokumenBalasan: 'Risalah_Rapat_Kurikulum_2026.pdf',
    tanggalDisposisi: '2026-06-16'
  },
  {
    id: 'disp-2',
    suratMasukId: 'sm-2',
    pengirimId: 'user-3',
    pelaksanaIds: ['user-4'],
    instruksi: 'Pelajari alokasi dana kuartal II, koordinasikan dengan bidang terkait untuk rencana pencairan.',
    tenggatWaktu: '2026-06-25',
    status: 'Sedang Dikerjakan',
    tanggalDisposisi: '2026-06-20'
  },
  {
    id: 'disp-3',
    suratMasukId: 'sm-3',
    pengirimId: 'user-3',
    pelaksanaIds: ['user-5'],
    instruksi: 'Tindak lanjuti pengisian profil ASN seluruh staf, target selesai sebelum akhir minggu.',
    tenggatWaktu: '2026-06-26',
    status: 'Selesai',
    catatanBalasan: 'Seluruh data ASN sebanyak 45 pegawai telah berhasil dimutakhirkan di portal BKD.',
    dokumenBalasan: 'Rekap_Selesai_Pemutakhiran_BKD.xlsx',
    tanggalDisposisi: '2026-06-22'
  },
  {
    id: 'disp-4',
    suratMasukId: 'sm-7',
    pengirimId: 'user-3',
    pelaksanaIds: ['user-4'],
    instruksi: 'Lakukan pencocokan data SPT dengan laporan keuangan kuartal I. Siapkan surat balasan resmi.',
    tenggatWaktu: '2026-07-02',
    status: 'Sedang Dikerjakan',
    tanggalDisposisi: '2026-06-27'
  },
  {
    id: 'disp-5',
    suratMasukId: 'sm-9',
    pengirimId: 'user-3',
    pelaksanaIds: ['user-5'],
    instruksi: 'Persiapkan Surat Keputusan (SK) penempatan baru bagi pegawai mutasi tersebut. Laporkan jika sudah siap.',
    tenggatWaktu: '2026-07-03',
    status: 'Menunggu',
    tanggalDisposisi: '2026-06-28'
  },
  {
    id: 'disp-6',
    suratMasukId: 'sm-6',
    pengirimId: 'user-3',
    pelaksanaIds: ['user-4', 'user-6'],
    instruksi: 'Alokasikan dana bantuan operasional sesuai petunjuk teknis. Buat draf rencana penggunaan.',
    tenggatWaktu: '2026-07-05',
    status: 'Menunggu',
    tanggalDisposisi: '2026-06-26'
  },
  {
    id: 'disp-7',
    suratMasukId: 'sm-8',
    pengirimId: 'user-3',
    pelaksanaIds: ['user-4'],
    instruksi: 'Cek daftar harga ATK yang ditawarkan dan bandingkan dengan anggaran pengadaan tahunan kita.',
    tenggatWaktu: '2026-07-10',
    status: 'Menunggu',
    tanggalDisposisi: '2026-06-27'
  },
  {
    id: 'disp-8',
    suratMasukId: 'sm-10',
    pengirimId: 'user-3',
    pelaksanaIds: ['user-6'],
    instruksi: 'Siapkan draf bahan presentasi mengenai Digitalisasi Persuratan di Pemda sebagai referensi saya.',
    tenggatWaktu: '2026-07-01',
    status: 'Sedang Dikerjakan',
    tanggalDisposisi: '2026-06-28'
  }
];

export const mockAuditTrail: AuditTrail[] = [
  {
    id: 'audit-1',
    suratId: 'sm-1',
    jenisSurat: 'Masuk',
    tanggal: '2026-06-16 08:30',
    aksi: 'Registrasi Surat',
    aktor: 'Siti Aminah, A.Md. (Admin)',
    deskripsi: 'Registrasi pertama kali surat masuk Dinas Pendidikan Provinsi dengan Nomor 045.2/210/DISDIK/2026.'
  },
  {
    id: 'audit-2',
    suratId: 'sm-1',
    jenisSurat: 'Masuk',
    tanggal: '2026-06-16 09:15',
    aksi: 'Diteruskan ke Pimpinan',
    aktor: 'Siti Aminah, A.Md. (Admin)',
    deskripsi: 'Meneruskan berkas surat ke Kepala Dinas.'
  },
  {
    id: 'audit-3',
    suratId: 'sm-1',
    jenisSurat: 'Masuk',
    tanggal: '2026-06-16 14:00',
    aksi: 'Disposisi Baru',
    aktor: 'Dr. Ahmad Fauzi, M.T. (Pimpinan)',
    deskripsi: 'Membuat disposisi instruksi kepada Rina Kartika dan Andi Saputra dengan tenggat 18 Juni.'
  },
  {
    id: 'audit-4',
    suratId: 'sm-1',
    jenisSurat: 'Masuk',
    tanggal: '2026-06-17 10:00',
    aksi: 'Perubahan Status Tugas',
    aktor: 'Rina Kartika, S.H. (Pelaksana)',
    deskripsi: 'Mengubah status pengerjaan disposisi menjadi "Sedang Dikerjakan".'
  },
  {
    id: 'audit-5',
    suratId: 'sm-1',
    jenisSurat: 'Masuk',
    tanggal: '2026-06-18 16:30',
    aksi: 'Unggah Dokumen Tindak Lanjut',
    aktor: 'Rina Kartika, S.H. (Pelaksana)',
    deskripsi: 'Mengunggah dokumen balasan "Risalah_Rapat_Kurikulum_2026.pdf" dan mengirimkan catatan balasan.'
  },
  {
    id: 'audit-6',
    suratId: 'sm-1',
    jenisSurat: 'Masuk',
    tanggal: '2026-06-18 17:00',
    aksi: 'Penyelesaian Surat',
    aktor: 'Dr. Ahmad Fauzi, M.T. (Pimpinan)',
    deskripsi: 'Menyetujui tindak lanjut dan menutup status surat menjadi "Selesai".'
  },
  {
    id: 'audit-7',
    suratId: 'sm-2',
    jenisSurat: 'Masuk',
    tanggal: '2026-06-19 10:15',
    aksi: 'Registrasi Surat',
    aktor: 'Siti Aminah, A.Md. (Admin)',
    deskripsi: 'Registrasi pertama kali surat masuk dari BPKAD.'
  },
  {
    id: 'audit-8',
    suratId: 'sm-2',
    jenisSurat: 'Masuk',
    tanggal: '2026-06-19 11:00',
    aksi: 'Diteruskan ke Pimpinan',
    aktor: 'Siti Aminah, A.Md. (Admin)',
    deskripsi: 'Meneruskan surat alokasi anggaran ke Kepala Dinas.'
  },
  {
    id: 'audit-9',
    suratId: 'sm-2',
    jenisSurat: 'Masuk',
    tanggal: '2026-06-20 09:00',
    aksi: 'Disposisi Baru',
    aktor: 'Dr. Ahmad Fauzi, M.T. (Pimpinan)',
    deskripsi: 'Mendisposisikan surat ke Hendra Wijaya untuk koordinasi anggaran.'
  },
  {
    id: 'audit-10',
    suratId: 'sm-3',
    jenisSurat: 'Masuk',
    tanggal: '2026-06-21 13:00',
    aksi: 'Registrasi Surat',
    aktor: 'Siti Aminah, A.Md. (Admin)',
    deskripsi: 'Registrasi surat masuk dari BKD mengenai Profil ASN.'
  },
  {
    id: 'audit-11',
    suratId: 'sm-3',
    jenisSurat: 'Masuk',
    tanggal: '2026-06-22 08:45',
    aksi: 'Disposisi Baru',
    aktor: 'Dr. Ahmad Fauzi, M.T. (Pimpinan)',
    deskripsi: 'Disposisi ke Rina Kartika untuk pemutakhiran data ASN.'
  },
  {
    id: 'audit-12',
    suratId: 'sm-3',
    jenisSurat: 'Masuk',
    tanggal: '2026-06-25 15:00',
    aksi: 'Penyelesaian Tugas & Surat',
    aktor: 'Rina Kartika, S.H. (Pelaksana)',
    deskripsi: 'Unggah file Rekap_Selesai_Pemutakhiran_BKD.xlsx dan selesaikan disposisi.'
  },
  {
    id: 'audit-13',
    suratId: 'sk-1',
    jenisSurat: 'Keluar',
    tanggal: '2026-06-17 14:00',
    aksi: 'Pembuatan Draf',
    aktor: 'Siti Aminah, A.Md. (Admin)',
    deskripsi: 'Membuat draf surat keluar Nomor 045.2/321/SPD/2026.'
  },
  {
    id: 'audit-14',
    suratId: 'sk-1',
    jenisSurat: 'Keluar',
    tanggal: '2026-06-18 09:00',
    aksi: 'Persetujuan Pimpinan',
    aktor: 'Dr. Ahmad Fauzi, M.T. (Pimpinan)',
    deskripsi: 'Menandatangani surat keluar secara elektronik.'
  },
  {
    id: 'audit-15',
    suratId: 'sk-1',
    jenisSurat: 'Keluar',
    tanggal: '2026-06-18 11:30',
    aksi: 'Pengiriman Surat',
    aktor: 'Siti Aminah, A.Md. (Admin)',
    deskripsi: 'Surat resmi dikirim ke Dinas Pendidikan Provinsi.'
  },
  {
    id: 'audit-16',
    suratId: 'sm-6',
    jenisSurat: 'Masuk',
    tanggal: '2026-06-25 11:00',
    aksi: 'Registrasi Surat',
    aktor: 'Siti Aminah, A.Md. (Admin)',
    deskripsi: 'Registrasi berkas Bantuan Operasional Satuan Pendidikan (BOSP).'
  },
  {
    id: 'audit-17',
    suratId: 'sm-6',
    jenisSurat: 'Masuk',
    tanggal: '2026-06-26 10:00',
    aksi: 'Disposisi Baru',
    aktor: 'Dr. Ahmad Fauzi, M.T. (Pimpinan)',
    deskripsi: 'Disposisi ke Hendra Wijaya dan Andi Saputra.'
  },
  {
    id: 'audit-18',
    suratId: 'sm-7',
    jenisSurat: 'Masuk',
    tanggal: '2026-06-26 16:00',
    aksi: 'Registrasi Surat',
    aktor: 'Siti Aminah, A.Md. (Admin)',
    deskripsi: 'Registrasi surat KPP Pratama perihal klarifikasi SPT.'
  },
  {
    id: 'audit-19',
    suratId: 'sm-7',
    jenisSurat: 'Masuk',
    tanggal: '2026-06-27 11:00',
    aksi: 'Disposisi Baru',
    aktor: 'Dr. Ahmad Fauzi, M.T. (Pimpinan)',
    deskripsi: 'Disposisi ke Hendra Wijaya perihal SPT.'
  },
  {
    id: 'audit-20',
    suratId: 'sk-2',
    jenisSurat: 'Keluar',
    tanggal: '2026-06-22 10:00',
    aksi: 'Pengiriman Surat',
    aktor: 'Siti Aminah, A.Md. (Admin)',
    deskripsi: 'Kirim laporan realisasi anggaran Q1 ke BPKAD.'
  }
];

export const mockNotifikasi: Notifikasi[] = [
  {
    id: 'notif-1',
    judul: 'Surat Masuk Baru',
    deskripsi: 'Surat masuk dari Dinas Komunikasi dan Informatika mengenai "Audit Keamanan Siber" telah diregistrasi.',
    tanggal: '2026-06-28 17:15',
    dibaca: false,
    targetRole: 'Pimpinan'
  },
  {
    id: 'notif-2',
    judul: 'Disposisi Baru Diterima',
    deskripsi: 'Pimpinan memberikan disposisi baru mengenai "SK Pemindahan Pegawai (Mutasi Jabatan)" dengan tenggat 03 Juli 2026.',
    tanggal: '2026-06-28 16:45',
    dibaca: false,
    targetRole: 'Pelaksana'
  },
  {
    id: 'notif-3',
    judul: 'Surat Masuk Baru',
    deskripsi: 'Undangan Seminar Nasional Digitalisasi dari Universitas Indonesia perlu diteruskan ke pimpinan.',
    tanggal: '2026-06-28 09:30',
    dibaca: false,
    targetRole: 'Admin Persuratan'
  },
  {
    id: 'notif-4',
    judul: 'Disposisi Baru Diterima',
    deskripsi: 'Pimpinan mendisposisikan "Undangan Pembicara Seminar" kepada Anda untuk menyiapkan presentasi.',
    tanggal: '2026-06-28 15:00',
    dibaca: true,
    targetRole: 'Pelaksana'
  },
  {
    id: 'notif-5',
    judul: 'Disposisi Selesai dikerjakan',
    deskripsi: 'Rina Kartika menyelesaikan disposisi "Pemutakhiran Data Profil ASN" dan melampirkan file rekap.',
    tanggal: '2026-06-25 15:02',
    dibaca: true,
    targetRole: 'Pimpinan'
  },
  {
    id: 'notif-6',
    judul: 'Undangan Upacara Masuk',
    deskripsi: 'Surat masuk dari Sekretariat Daerah mengenai "Undangan Upacara Hari Kemerdekaan" siap diteruskan.',
    tanggal: '2026-06-23 10:30',
    dibaca: true,
    targetRole: 'Admin Persuratan'
  },
  {
    id: 'notif-7',
    judul: 'Tenggat Waktu Disposisi Mendekati',
    deskripsi: 'Disposisi mengenai "Alokasi Anggaran Kuartal II" memiliki tenggat besok hari.',
    tanggal: '2026-06-24 08:00',
    dibaca: false,
    targetRole: 'Pelaksana'
  },
  {
    id: 'notif-8',
    judul: 'Pengguna Baru Terdaftar',
    deskripsi: 'Akun Andi Saputra, S.T. (Pelaksana) telah diaktifkan oleh sistem.',
    tanggal: '2026-06-12 11:20',
    dibaca: true,
    targetRole: 'Super Admin'
  },
  {
    id: 'notif-9',
    judul: 'Audit Keamanan Siber',
    deskripsi: 'Surat masuk dari Dinas Komunikasi dan Informatika telah masuk di draft sistem persuratan.',
    tanggal: '2026-06-28 16:00',
    dibaca: false,
    targetRole: 'Super Admin'
  },
  {
    id: 'notif-10',
    judul: 'Surat Keluar Menunggu Tanda Tangan',
    deskripsi: 'Surat draf Undangan Rapat Evaluasi Bulanan siap diperiksa.',
    tanggal: '2026-06-27 15:00',
    dibaca: true,
    targetRole: 'Pimpinan'
  }
];
