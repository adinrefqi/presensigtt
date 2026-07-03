-- ==========================================
-- SQL SCRIPT: SMP THHK Presensi GTT
-- ==========================================
-- Jalankan di Supabase SQL Editor
-- ==========================================

-- Disable RLS
ALTER TABLE guru DISABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal DISABLE ROW LEVEL SECURITY;
ALTER TABLE presensi DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- STEP 1: Create Tables
-- ==========================================

CREATE TABLE IF NOT EXISTS guru (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nuptk TEXT UNIQUE,
    nama TEXT NOT NULL,
    mapel TEXT NOT NULL,
    honor INTEGER DEFAULT 0,
    wa TEXT,
    status TEXT DEFAULT 'Aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jadwal (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guru_id UUID REFERENCES guru(id) ON DELETE CASCADE,
    hari TEXT NOT NULL,
    jam_mulai TEXT NOT NULL,
    jam_selesai TEXT NOT NULL,
    kelas TEXT NOT NULL,
    jp INTEGER DEFAULT 1,
    mapel TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS presensi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    jadwal_id UUID REFERENCES jadwal(id) ON DELETE SET NULL,
    guru_id UUID REFERENCES guru(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    hari TEXT NOT NULL,
    kelas TEXT NOT NULL,
    mapel TEXT NOT NULL,
    jp INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Hadir',
    materi TEXT,
    tanda_tangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- STEP 2: Insert Data Guru
-- ==========================================

INSERT INTO guru (nuptk, nama, mapel, honor, wa, status) VALUES
('198402122009032001', 'Brigita Ajeng DWIANDARI, S.Pd.', 'Matematika', 50000, '08123456789', 'Aktif'),
('198905242015042003', 'Fransiska Virgiana M, S.Pd.', 'Bahasa Inggris', 45000, '08234567890', 'Aktif'),
('197811122005011002', 'Ismadi, S.Pd.', 'Fisika', 55000, '08345678901', 'Aktif'),
('199208082020102005', 'WS. Inggried Budiarti, S.Pd.', 'Bahasa Mandarin', 60000, '08456789012', 'Aktif'),
('198501022010031004', 'Atmo Kusumo, S.Pd.', 'Pendidikan Agama', 40000, '08567890123', 'Aktif'),
('199105152011012006', 'Yunita Mentari Putri, S.Sn.', 'Seni Budaya', 55000, '08623456789', 'Aktif'),
('198803202009022007', 'Anom Kudho Winanto, S.Sn.', 'Prakarya', 45000, '08734567890', 'Aktif')
ON CONFLICT (nuptk) DO UPDATE SET
    nama = EXCLUDED.nama, mapel = EXCLUDED.mapel, honor = EXCLUDED.honor,
    wa = EXCLUDED.wa, status = EXCLUDED.status;

-- ==========================================
-- STEP 3: Insert Jadwal
-- ==========================================

INSERT INTO jadwal (guru_id, hari, jam_mulai, jam_selesai, kelas, jp, mapel)
SELECT g.id, j.hari, j.jam_mulai, j.jam_selesai, j.kelas, j.jp, j.mapel
FROM (VALUES
    ('Senin','07:00','08:30','VII-A',2,'Matematika'),
    ('Senin','08:30','10:00','VIII-B',2,'Bahasa Inggris'),
    ('Selasa','07:00','09:15','IX-A',3,'Fisika'),
    ('Selasa','09:30','11:00','VII-B',2,'Bahasa Mandarin'),
    ('Rabu','07:00','09:15','VIII-A',3,'Matematika'),
    ('Rabu','09:30','11:00','IX-B',2,'Pendidikan Agama'),
    ('Kamis','07:00','08:30','VII-A',2,'Bahasa Inggris'),
    ('Kamis','08:30','10:00','VIII-B',2,'Bahasa Mandarin'),
    ('Kamis','10:15','11:45','IX-C',2,'Fisika'),
    ('Jumat','07:30','09:00','VII-C',2,'Pendidikan Agama'),
    ('Jumat','09:15','10:45','IX-A',2,'Matematika')
) AS j(hari,jam_mulai,jam_selesai,kelas,jp,mapel)
JOIN guru g ON g.mapel = j.mapel;

-- ==========================================
-- STEP 4: Insert Presensi (tanpa VALUES, langsung INSERT)
-- ==========================================

-- Insert presensi dengan cara langsung (bukan VALUES)
INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Matematika' LIMIT 1),
    '2026-06-15'::DATE, 'Senin', 'VII-A', 'Matematika', 2, 'Hadir', 'Melanjutkan materi bab 1 sub-tema 3';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Bahasa Inggris' LIMIT 1),
    '2026-06-15'::DATE, 'Senin', 'VIII-B', 'Bahasa Inggris', 2, 'Hadir', 'Chapter 5: Daily Activities';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Fisika' LIMIT 1),
    '2026-06-16'::DATE, 'Selasa', 'IX-A', 'Fisika', 3, 'Hadir', 'Momentum dan Impuls - Latihan Soal';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Bahasa Mandarin' LIMIT 1),
    '2026-06-16'::DATE, 'Selasa', 'VII-B', 'Bahasa Mandarin', 2, 'Izin', 'Berhalangan hadir: ada urusan keluarga';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Matematika' LIMIT 1),
    '2026-06-17'::DATE, 'Rabu', 'VIII-A', 'Matematika', 3, 'Hadir', 'Persamaan Linear Satu Variabel';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Pendidikan Agama' LIMIT 1),
    '2026-06-17'::DATE, 'Rabu', 'IX-B', 'Pendidikan Agama', 2, 'Hadir', 'Puasa dan Manfaatnya';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Bahasa Inggris' LIMIT 1),
    '2026-06-18'::DATE, 'Kamis', 'VII-A', 'Bahasa Inggris', 2, 'Hadir', 'Grammar: Simple Present Tense';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Bahasa Mandarin' LIMIT 1),
    '2026-06-18'::DATE, 'Kamis', 'VIII-B', 'Bahasa Mandarin', 2, 'Hadir', 'Angka dan Perhitungan Dasar';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Fisika' LIMIT 1),
    '2026-06-18'::DATE, 'Kamis', 'IX-C', 'Fisika', 2, 'Sakit', 'Berhalangan hadir: sakit flu';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Pendidikan Agama' LIMIT 1),
    '2026-06-19'::DATE, 'Jumat', 'VII-C', 'Pendidikan Agama', 2, 'Hadir', 'Shalat Sunnah dan Dalilnya';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Matematika' LIMIT 1),
    '2026-06-19'::DATE, 'Jumat', 'IX-A', 'Matematika', 2, 'Hadir', 'Sistem Persamaan Linear Dua Variabel';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Matematika' LIMIT 1),
    '2026-06-22'::DATE, 'Senin', 'VII-A', 'Matematika', 2, 'Hadir', 'Pertidaksamaan Linear Satu Variabel';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Bahasa Inggris' LIMIT 1),
    '2026-06-22'::DATE, 'Senin', 'VIII-B', 'Bahasa Inggris', 2, 'Hadir', 'Vocabulary Building';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Fisika' LIMIT 1),
    '2026-06-23'::DATE, 'Selasa', 'IX-A', 'Fisika', 3, 'Hadir', 'Hukum Kekekalan Momentum';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Bahasa Mandarin' LIMIT 1),
    '2026-06-23'::DATE, 'Selasa', 'VII-B', 'Bahasa Mandarin', 2, 'Hadir', 'Sapaan dan Perkenalan Diri';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Matematika' LIMIT 1),
    '2026-06-24'::DATE, 'Rabu', 'VIII-A', 'Matematika', 3, 'Alpa', 'Tidak hadir tanpa keterangan';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Pendidikan Agama' LIMIT 1),
    '2026-06-24'::DATE, 'Rabu', 'IX-B', 'Pendidikan Agama', 2, 'Hadir', 'Zakat dan Hikmahnya';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Bahasa Inggris' LIMIT 1),
    '2026-06-25'::DATE, 'Kamis', 'VII-A', 'Bahasa Inggris', 2, 'Hadir', 'Reading Comprehension';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Bahasa Mandarin' LIMIT 1),
    '2026-06-25'::DATE, 'Kamis', 'VIII-B', 'Bahasa Mandarin', 2, 'Hadir', 'Warna dan Benda di Kelas';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Fisika' LIMIT 1),
    '2026-06-25'::DATE, 'Kamis', 'IX-C', 'Fisika', 2, 'Hadir', 'Latihan Soal Ujian';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Matematika' LIMIT 1),
    '2026-06-26'::DATE, 'Jumat', 'IX-A', 'Matematika', 2, 'Hadir', 'Soal Latihan Bab 2';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Matematika' LIMIT 1),
    '2026-06-29'::DATE, 'Senin', 'VII-A', 'Matematika', 2, 'Hadir', 'Ulangan Harian Bab 1-2';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Bahasa Inggris' LIMIT 1),
    '2026-06-29'::DATE, 'Senin', 'VIII-B', 'Bahasa Inggris', 2, 'Hadir', 'Ulangan Harian Chapter 1-5';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Fisika' LIMIT 1),
    '2026-06-30'::DATE, 'Selasa', 'IX-A', 'Fisika', 3, 'Hadir', 'Pembahasan Soal Ujian';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Bahasa Mandarin' LIMIT 1),
    '2026-06-30'::DATE, 'Selasa', 'VII-B', 'Bahasa Mandarin', 2, 'Hadir', 'Ulangan Harian';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Matematika' LIMIT 1),
    '2026-07-01'::DATE, 'Rabu', 'VIII-A', 'Matematika', 3, 'Hadir', 'Persiapan Ujian Semester';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Pendidikan Agama' LIMIT 1),
    '2026-07-01'::DATE, 'Rabu', 'IX-B', 'Pendidikan Agama', 2, 'Hadir', 'Review Materi Semester';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Bahasa Inggris' LIMIT 1),
    '2026-07-02'::DATE, 'Kamis', 'VII-A', 'Bahasa Inggris', 2, 'Hadir', 'Presentasi Kelompok';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Bahasa Mandarin' LIMIT 1),
    '2026-07-02'::DATE, 'Kamis', 'VIII-B', 'Bahasa Mandarin', 2, 'Hadir', 'Latihan Percakapan';

INSERT INTO presensi (guru_id, tanggal, hari, kelas, mapel, jp, status, materi)
SELECT 
    (SELECT id FROM guru WHERE mapel = 'Fisika' LIMIT 1),
    '2026-07-02'::DATE, 'Kamis', 'IX-C', 'Fisika', 2, 'Hadir', 'Konsultasi Tugas Akhir';

-- ==========================================
-- STEP 5: Verifikasi Data
-- ==========================================

SELECT '=== DATA BERHASIL DIIMPORT ===' AS status;
SELECT COUNT(*) AS total_guru FROM guru;
SELECT COUNT(*) AS total_jadwal FROM jadwal;
SELECT COUNT(*) AS total_presensi FROM presensi;

-- ==========================================
-- ADMIN USER (Buat Manual di Dashboard)
-- ==========================================
-- Buka: Supabase Dashboard > Authentication > Users > Add User
--
-- Admin 1: admin@thhk.sch.id / admin123
-- Admin 2: elsa@thhk.sch.id / elsa123
--
-- User Metadata untuk keduanya:
-- {"nama": "Nama Lengkap", "role": "admin", "guruId": null}
