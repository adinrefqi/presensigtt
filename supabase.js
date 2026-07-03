// ==========================================
// SUPABASE CONFIGURATION
// ==========================================
// Untuk setup Supabase, ikuti langkah berikut:
//
// 1. Buat akun di https://supabase.com
// 2. Buat project baru
// 3. Dapatkan URL dan anon key dari Settings > API
// 4. Ganti nilai di bawah ini

const SUPABASE_URL = 'https://aphmiysoebhkhnsmrprv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwaG1peXNvZWJoa2huc21ycHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMDU2NjcsImV4cCI6MjA5ODU4MTY2N30.ZPl9DH6vfj_tgSDcYlUCZb9s9AXBRSygjfDEJ_zTtCY';

// Note: supabase client initialization is handled in app.js

// Load Supabase SDK
function loadSupabaseSDK() {
    return new Promise((resolve, reject) => {
        if (typeof window.supabase !== 'undefined') {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Gagal load Supabase SDK'));
        document.head.appendChild(script);
    });
}

// ==========================================
// INITIAL DATA SEEDING
// ==========================================
// Jalankan SQL berikut di Supabase SQL Editor untuk seed data awal:
// 
// -- Insert Elsa Angreani as Admin
// INSERT INTO auth.users (id, email, encrypted_password, user_metadata) VALUES 
// (gen_random_uuid(), 'elsa@thhk.sch.id', crypt('elsa123', gen_salt('bf')), 
//  '{"nama": "Elsa Angreani, S.T.", "role": "admin", "guruId": null}');

// ==========================================
// DATABASE TABLES SCHEMA
// ==========================================
// Jalankan SQL berikut di Supabase SQL Editor:
//
// -- Table: users (auth users)
// -- Supabase Auth sudah handle ini otomatis
//
// -- Table: guru (data guru GTT)
// CREATE TABLE guru (
//     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//     nuptk TEXT UNIQUE,
//     nama TEXT NOT NULL,
//     mapel TEXT NOT NULL,
//     honor INTEGER DEFAULT 0,
//     wa TEXT,
//     status TEXT DEFAULT 'Aktif',
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
//     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );
//
// -- Table: jadwal (jadwal mengajar)
// CREATE TABLE jadwal (
//     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//     guru_id UUID REFERENCES guru(id) ON DELETE CASCADE,
//     hari TEXT NOT NULL,
//     jam_mulai TEXT NOT NULL,
//     jam_selesai TEXT NOT NULL,
//     kelas TEXT NOT NULL,
//     jp INTEGER DEFAULT 1,
//     mapel TEXT,
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );
//
// -- Table: presensi (log kehadiran)
// CREATE TABLE presensi (
//     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//     jadwal_id UUID REFERENCES jadwal(id) ON DELETE SET NULL,
//     guru_id UUID REFERENCES guru(id) ON DELETE CASCADE,
//     tanggal DATE NOT NULL,
//     hari TEXT NOT NULL,
//     kelas TEXT NOT NULL,
//     mapel TEXT NOT NULL,
//     jp INTEGER DEFAULT 0,
//     status TEXT DEFAULT 'Hadir',
//     materi TEXT,
//     tanda_tangan TEXT,
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );
//
// -- Enable Row Level Security (RLS)
// ALTER TABLE guru ENABLE ROW LEVEL SECURITY;
// ALTER TABLE jadwal ENABLE ROW LEVEL SECURITY;
// ALTER TABLE presensi ENABLE ROW LEVEL SECURITY;
//
// -- Policy untuk akses data
// -- Allow authenticated users untuk read semua data
// CREATE POLICY "Allow read" ON guru FOR SELECT TO authenticated USING (true);
// CREATE POLICY "Allow read" ON jadwal FOR SELECT TO authenticated USING (true);
// CREATE POLICY "Allow read" ON presensi FOR SELECT TO authenticated USING (true);
//
// -- Allow insert/update/delete untuk authenticated users
// CREATE POLICY "Allow insert" ON guru FOR INSERT TO authenticated WITH CHECK (true);
// CREATE POLICY "Allow update" ON guru FOR UPDATE TO authenticated USING (true);
// CREATE POLICY "Allow delete" ON guru FOR DELETE TO authenticated USING (true);
//
// CREATE POLICY "Allow insert" ON jadwal FOR INSERT TO authenticated WITH CHECK (true);
// CREATE POLICY "Allow update" ON jadwal FOR UPDATE TO authenticated USING (true);
// CREATE POLICY "Allow delete" ON jadwal FOR DELETE TO authenticated USING (true);
//
// CREATE POLICY "Allow insert" ON presensi FOR INSERT TO authenticated WITH CHECK (true);
// CREATE POLICY "Allow update" ON presensi FOR UPDATE TO authenticated USING (true);
// CREATE POLICY "Allow delete" ON presensi FOR DELETE TO authenticated USING (true);

// ==========================================
// SUPABASE DATA FUNCTIONS
// ==========================================

// Fetch semua guru
async function fetchGuru() {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('guru')
        .select('*')
        .order('nama');

    if (error) {
        console.error('Error fetching guru:', error);
        return null;
    }
    return data;
}

// Fetch guru by ID
async function fetchGuruById(id) {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('guru')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching guru:', error);
        return null;
    }
    return data;
}

// Insert guru baru
async function insertGuru(guruData) {
    if (!supabase) return { error: 'Supabase not initialized' };

    const { data, error } = await supabase
        .from('guru')
        .insert([guruData])
        .select()
        .single();

    return { data, error };
}

// Update guru
async function updateGuru(id, updates) {
    if (!supabase) return { error: 'Supabase not initialized' };

    const { data, error } = await supabase
        .from('guru')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    return { data, error };
}

// Delete guru
async function deleteGuru(id) {
    if (!supabase) return { error: 'Supabase not initialized' };

    const { error } = await supabase
        .from('guru')
        .delete()
        .eq('id', id);

    return { error };
}

// Fetch semua jadwal
async function fetchJadwal() {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('jadwal')
        .select('*')
        .order('hari');

    if (error) {
        console.error('Error fetching jadwal:', error);
        return null;
    }
    return data;
}

// Insert jadwal baru
async function insertJadwal(jadwalData) {
    if (!supabase) return { error: 'Supabase not initialized' };

    const { data, error } = await supabase
        .from('jadwal')
        .insert([jadwalData])
        .select()
        .single();

    return { data, error };
}

// Delete jadwal
async function deleteJadwalById(id) {
    if (!supabase) return { error: 'Supabase not initialized' };

    const { error } = await supabase
        .from('jadwal')
        .delete()
        .eq('id', id);

    return { error };
}

// Fetch presensi dengan filter
async function fetchPresensi(filters = {}) {
    if (!supabase) return null;

    let query = supabase
        .from('presensi')
        .select('*')
        .order('tanggal', { ascending: false });

    if (filters.guruId) {
        query = query.eq('guru_id', filters.guruId);
    }
    if (filters.tanggal) {
        query = query.eq('tanggal', filters.tanggal);
    }
    if (filters.bulan !== undefined && filters.tahun) {
        const startDate = `${filters.tahun}-${String(filters.bulan + 1).padStart(2, '0')}-01`;
        const endDate = new Date(filters.tahun, filters.bulan + 1, 0).toISOString().split('T')[0];
        query = query.gte('tanggal', startDate).lte('tanggal', endDate);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching presensi:', error);
        return null;
    }
    return data;
}

// Insert presensi
async function insertPresensi(presensiData) {
    if (!supabase) return { error: 'Supabase not initialized' };

    const { data, error } = await supabase
        .from('presensi')
        .insert([presensiData])
        .select()
        .single();

    return { data, error };
}

// Delete presensi
async function deletePresensiById(id) {
    if (!supabase) return { error: 'Supabase not initialized' };

    const { error } = await supabase
        .from('presensi')
        .delete()
        .eq('id', id);

    return { error };
}

// ==========================================
// SUPABASE AUTH FUNCTIONS
// ==========================================

// Sign up new user
async function supabaseSignUp(email, password, userData) {
    if (!supabase) return { error: 'Supabase not initialized' };

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: userData
        }
    });

    return { data, error };
}

// Sign in user
async function supabaseSignIn(email, password) {
    if (!supabase) return { error: 'Supabase not initialized' };

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    return { data, error };
}

// Sign out user
async function supabaseSignOut() {
    if (!supabase) return { error: 'Supabase not initialized' };

    const { error } = await supabase.auth.signOut();
    return { error };
}

// Get current session
async function getSupabaseSession() {
    if (!supabase) return null;

    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// Listen to auth state changes
function onAuthStateChange(callback) {
    if (!supabase) return null;

    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

// ==========================================
// SYNC LOCAL STORAGE WITH SUPABASE
// ==========================================

// Sync local data to Supabase
async function syncLocalToSupabase() {
    if (!supabase) return;

    try {
        // Sync guru
        const localGuru = JSON.parse(localStorage.getItem("gtt_guru")) || [];
        for (const guru of localGuru) {
            const { error } = await supabase
                .from('guru')
                .upsert(guru, { onConflict: 'nuptk' });
            if (error) console.error('Error syncing guru:', guru.nama, error);
        }

        // Sync jadwal
        const localJadwal = JSON.parse(localStorage.getItem("gtt_jadwal")) || [];
        for (const jadwal of localJadwal) {
            const { error } = await supabase
                .from('jadwal')
                .upsert(jadwal);
            if (error) console.error('Error syncing jadwal:', error);
        }

        // Sync presensi
        const localPresensi = JSON.parse(localStorage.getItem("gtt_presensi")) || [];
        for (const presensi of localPresensi) {
            const { error } = await supabase
                .from('presensi')
                .upsert(presensi);
            if (error) console.error('Error syncing presensi:', error);
        }

        console.log('✅ Data berhasil disinkronkan ke Supabase');
        showToast('Data berhasil disinkronkan ke cloud!');

    } catch (error) {
        console.error('Error syncing to Supabase:', error);
        showToast('Gagal sinkron data ke cloud', 'danger');
    }
}

// Load data from Supabase to local storage
async function loadFromSupabase() {
    if (!supabase) return false;

    try {
        const [guruData, jadwalData, presensiData] = await Promise.all([
            fetchGuru(),
            fetchJadwal(),
            fetchPresensi()
        ]);

        if (guruData) {
            localStorage.setItem("gtt_guru", JSON.stringify(guruData));
            guruList = guruData;
        }

        if (jadwalData) {
            localStorage.setItem("gtt_jadwal", JSON.stringify(jadwalData));
            jadwalList = jadwalData;
        }

        if (presensiData) {
            localStorage.setItem("gtt_presensi", JSON.stringify(presensiData));
            presensiList = presensiData;
        }

        console.log('✅ Data berhasil dimuat dari Supabase');
        return true;

    } catch (error) {
        console.error('Error loading from Supabase:', error);
        return false;
    }
}

// Export functions
window.SupabaseClient = {
    init: initSupabase,
    loadSDK: loadSupabaseSDK,
    fetchGuru,
    fetchGuruById,
    insertGuru,
    updateGuru,
    deleteGuru,
    fetchJadwal,
    insertJadwal,
    deleteJadwal: deleteJadwalById,
    fetchPresensi,
    insertPresensi,
    deletePresensi: deletePresensiById,
    signUp: supabaseSignUp,
    signIn: supabaseSignIn,
    signOut: supabaseSignOut,
    getSession: getSupabaseSession,
    onAuthStateChange,
    syncLocalToSupabase,
    loadFromSupabase
};
