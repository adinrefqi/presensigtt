// App State & Data Management GTT SMP THHK
// With Supabase Integration

// --- SUPABASE INITIALIZATION ---
let supabase = null;

async function initSupabase() {
    try {
        // Check if Supabase SDK is loaded
        if (typeof window.supabase !== 'undefined') {
            // Get config from supabase.js
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase Client initialized');

            // Listen for auth state changes
            supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN' && session) {
                    handleSupabaseLogin(session.user);
                } else if (event === 'SIGNED_OUT') {
                    currentUser = null;
                    localStorage.removeItem("gtt_current_user");
                    showLoginScreen();
                }
            });

            // Check if already logged in
            const session = await supabase.auth.getSession();
            if (session?.session) {
                handleSupabaseLogin(session.session.user);
                return true;
            }
        }
    } catch (error) {
        console.log('⚠️ Supabase not available, using local auth:', error.message);
    }
    return false;
}

// Handle Supabase login
function handleSupabaseLogin(user) {
    // Extract user data from Supabase metadata
    currentUser = {
        id: user.id,
        email: user.email,
        nama: user.user_metadata?.nama || user.email,
        role: user.user_metadata?.role || 'guru',
        guruId: user.user_metadata?.guruId || null
    };
    localStorage.setItem("gtt_current_user", JSON.stringify(currentUser));
    showMainApp();
}

// --- USER AUTHENTICATION SYSTEM ---
// Default users: Admin (Tata Usaha) and Teachers
const DEFAULT_USERS = [
    { id: "U001", username: "admin", password: "admin123", nama: "Administrator", role: "admin" },
    { id: "U001b", username: "elsa", password: "elsa123", nama: "Elsa Angreani, S.T.", role: "admin" },
    { id: "U002", username: "guru001", password: "guru123", nama: "Brigita Ajeng DWIANDARI, S.Pd.", role: "guru", guruId: "G001" },
    { id: "U003", username: "guru002", password: "guru123", nama: "Fransiska Virgiana M, S.Pd.", role: "guru", guruId: "G002" },
    { id: "U004", username: "guru003", password: "guru123", nama: "Ismadi, S.Pd.", role: "guru", guruId: "G003" },
    { id: "U005", username: "guru004", password: "guru123", nama: "WS. Inggried Budiarti, S.Pd.", role: "guru", guruId: "G004" },
    { id: "U006", username: "guru005", password: "guru123", nama: "Atmo Kusumo, S.Pd.", role: "guru", guruId: "G005" },
    { id: "U007", username: "guru006", password: "guru123", nama: "Yunita Mentari Putri, S.Sn.", role: "guru", guruId: "G006" },
    { id: "U008", username: "guru007", password: "guru123", nama: "Anom Kudho Winanto, S.Sn.", role: "guru", guruId: "G007" }
];

// Load users from storage or use defaults
let usersList = JSON.parse(localStorage.getItem("gtt_users")) || DEFAULT_USERS;

// Current logged in user
let currentUser = JSON.parse(localStorage.getItem("gtt_current_user")) || null;

// Check if user is admin
function isAdmin() {
    return currentUser && currentUser.role === "admin";
}

// Check if user is guru (teacher)
function isGuru() {
    return currentUser && currentUser.role === "guru";
}

// Get current guru ID (for guru users)
function getCurrentGuruId() {
    return currentUser && currentUser.guruId ? currentUser.guruId : null;
}

// Login function - supports both local and Supabase auth
async function login(username, password) {
    // Try Supabase auth first
    if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: username + '@thhk.sch.id', // Convert username to email format
            password: password
        });

        if (!error && data.user) {
            handleSupabaseLogin(data.user);
            return true;
        }
    }

    // Fallback to local auth
    const user = usersList.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem("gtt_current_user", JSON.stringify(user));
        return true;
    }
    return false;
}

// Logout function
async function logout() {
    currentUser = null;
    localStorage.removeItem("gtt_current_user");

    // Try Supabase logout
    if (supabase) {
        await supabase.auth.signOut();
    }

    showLoginScreen();
}

// Show login screen
function showLoginScreen() {
    document.getElementById("login-screen").style.display = "flex";
    document.getElementById("app-wrapper").style.display = "none";
}

// Show main app
function showMainApp() {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-wrapper").style.display = "flex";
    updateUserInterface();
}

// Update UI based on user role
function updateUserInterface() {
    if (!currentUser) return;

    // Update profile in sidebar
    document.querySelector(".profile-name").textContent = currentUser.nama;
    document.querySelector(".profile-role").textContent = currentUser.role === "admin" ? "Tata Usaha" : "Guru GTT";
    document.querySelector(".avatar").textContent = currentUser.nama.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

    // Show/hide admin-only menu items
    const guruMenu = document.querySelector('a[data-page="guru-page"]');
    const laporanMenu = document.querySelector('a[data-page="laporan-page"]');

    if (isAdmin()) {
        // Admin sees everything
        guruMenu.style.display = "flex";
        laporanMenu.style.display = "flex";
    } else {
        // Guru only sees: Dashboard, Jadwal, Presensi
        guruMenu.style.display = "none";
        laporanMenu.style.display = "none";
    }

    // Hide admin-only stats on dashboard
    updateDashboardByRole();
}

// --- INITIALIZE STORAGE OR LOAD DEFAULT MOCK DATA ---
const DEFAULT_GURU = [
    { id: "G001", nuptk: "198402122009032001", nama: "Brigita Ajeng DWIANDARI, S.Pd.", mapel: "Matematika", honor: 50000, wa: "08123456789", status: "Aktif" },
    { id: "G002", nuptk: "198905242015042003", nama: "Fransiska Virgiana M, S.Pd.", mapel: "Bahasa Inggris", honor: 45000, wa: "08234567890", status: "Aktif" },
    { id: "G003", nuptk: "197811122005011002", nama: "Ismadi, S.Pd.", mapel: "Fisika", honor: 55000, wa: "08345678901", status: "Aktif" },
    { id: "G004", nuptk: "199208082020102005", nama: "WS. Inggried Budiarti, S.Pd.", mapel: "Bahasa Mandarin", honor: 60000, wa: "08456789012", status: "Aktif" },
    { id: "G005", nuptk: "198501022010031004", nama: "Atmo Kusumo, S.Pd.", mapel: "Pendidikan Agama", honor: 40000, wa: "08567890123", status: "Aktif" },
    { id: "G006", nuptk: "199105152011012006", nama: "Yunita Mentari Putri, S.Sn.", mapel: "Seni Budaya", honor: 55000, wa: "08623456789", status: "Aktif" },
    { id: "G007", nuptk: "198803202009022007", nama: "Anom Kudho Winanto, S.Sn.", mapel: "Prakarya", honor: 45000, wa: "08734567890", status: "Aktif" }
];

const DEFAULT_JADWAL = [
    { id: "J001", guruId: "G001", hari: "Senin", jamMulai: "07:00", jamSelesai: "08:30", kelas: "VII-A", jp: 2, mapel: "Matematika" },
    { id: "J002", guruId: "G002", hari: "Senin", jamMulai: "08:30", jamSelesai: "10:00", kelas: "VIII-B", jp: 2, mapel: "Bahasa Inggris" },
    { id: "J003", guruId: "G003", hari: "Selasa", jamMulai: "07:00", jamSelesai: "09:15", kelas: "IX-A", jp: 3, mapel: "Fisika" },
    { id: "J004", guruId: "G004", hari: "Selasa", jamMulai: "09:30", jamSelesai: "11:00", kelas: "VII-B", jp: 2, mapel: "Bahasa Mandarin" },
    { id: "J005", guruId: "G001", hari: "Rabu", jamMulai: "07:00", jamSelesai: "09:15", kelas: "VIII-A", jp: 3, mapel: "Matematika" },
    { id: "J006", guruId: "G005", hari: "Rabu", jamMulai: "09:30", jamSelesai: "11:00", kelas: "IX-B", jp: 2, mapel: "Pendidikan Agama" },
    { id: "J007", guruId: "G002", hari: "Kamis", jamMulai: "07:00", jamSelesai: "08:30", kelas: "VII-A", jp: 2, mapel: "Bahasa Inggris" },
    { id: "J008", guruId: "G004", hari: "Kamis", jamMulai: "08:30", jamSelesai: "10:00", kelas: "VIII-B", jp: 2, mapel: "Bahasa Mandarin" },
    { id: "J009", guruId: "G003", hari: "Kamis", jamMulai: "10:15", jamSelesai: "11:45", kelas: "IX-C", jp: 2, mapel: "Fisika" },
    { id: "J010", guruId: "G005", hari: "Jumat", jamMulai: "07:30", jamSelesai: "09:00", kelas: "VII-C", jp: 2, mapel: "Pendidikan Agama" },
    { id: "J011", guruId: "G001", hari: "Jumat", jamMulai: "09:15", jamSelesai: "10:45", kelas: "IX-A", jp: 2, mapel: "Matematika" }
];

// Seed some past logs for June 2026 & July 2026 to render beautiful stats & charts immediately
function getMockPresensi() {
    const list = [];
    const statusOpts = ["Hadir", "Hadir", "Hadir", "Hadir", "Hadir", "Izin", "Hadir", "Sakit"];

    // Generate records for June (2026-06-01 to 2026-06-30) and July (2026-07-01 and 2026-07-02)
    // Map schedules to dates
    const daysName = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    // Generate dates
    let startDate = new Date("2026-06-15");
    let endDate = new Date("2026-07-02");

    let counter = 1;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = daysName[d.getDay()];
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateString = `${yyyy}-${mm}-${dd}`;

        // Find schedules matching this day
        const matchedSchedules = DEFAULT_JADWAL.filter(j => j.hari === dayOfWeek);

        matchedSchedules.forEach(sched => {
            // Let's decide if this guru is present
            // We use static random seed so it's deterministic but look realistic
            const hash = (counter * 7 + sched.id.charCodeAt(3) * 13) % 100;
            let status = "Hadir";
            if (hash > 90) status = "Izin";
            else if (hash > 95) status = "Sakit";
            else if (hash > 98) status = "Alpa";

            // Dummy Canvas signature (small checkmark or wavy lines representation)
            const mockSignature = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10 20 Q 30 ${hash % 40} 50 20 T 90 20" stroke="black" fill="none" stroke-width="2"/></svg>`;

            list.push({
                id: `P${String(counter++).padStart(4, '0')}`,
                jadwalId: sched.id,
                guruId: sched.guruId,
                tanggal: dateString,
                hari: dayOfWeek,
                kelas: sched.kelas,
                mapel: sched.mapel,
                jp: sched.jp,
                status: status,
                materi: status === "Hadir" ? `Melanjutkan materi bab pembelajaran sub-tema ${hash % 5 + 1}` : `Berhalangan hadir: ada keperluan keluarga`,
                tandaTangan: status === "Hadir" ? mockSignature : ""
            });
        });
    }

    return list;
}

// Global state variables
let guruList = JSON.parse(localStorage.getItem("gtt_guru")) || DEFAULT_GURU;
let jadwalList = JSON.parse(localStorage.getItem("gtt_jadwal")) || DEFAULT_JADWAL;
let presensiList = JSON.parse(localStorage.getItem("gtt_presensi")) || getMockPresensi();

// Save state to localstorage helper
function saveToStorage() {
    localStorage.setItem("gtt_guru", JSON.stringify(guruList));
    localStorage.setItem("gtt_jadwal", JSON.stringify(jadwalList));
    localStorage.setItem("gtt_presensi", JSON.stringify(presensiList));
}

// --- UTILITY FUNCTIONS ---
function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(number);
}

function getIndonesianDateString(dateObj) {
    const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    const day = hari[dateObj.getDay()];
    const date = dateObj.getDate();
    const month = bulan[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    return `${day}, ${date} ${month} ${year}`;
}

// Toast System
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "check-circle";
    if (type === "danger") icon = "alert-triangle";
    if (type === "warning") icon = "alert-circle";

    toast.innerHTML = `
        <i data-lucide="${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.style.animation = "slideIn 0.3s reverse forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Modal handling helper
function openModal(modalId) {
    document.getElementById(modalId).classList.add("active");
    if (modalId === 'presensi-modal') {
        initSignatureCanvas();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove("active");
    // Clear forms if appropriate
    if (modalId === 'guru-modal') {
        document.getElementById("guru-form").reset();
        document.getElementById("guru-id").value = "";
    } else if (modalId === 'jadwal-modal') {
        document.getElementById("jadwal-form").reset();
    } else if (modalId === 'presensi-modal') {
        document.getElementById("presensi-form").reset();
        document.getElementById("presensi-jadwal-id").value = "";
        clearSignature();
    }
}

// --- LIVE DATETIME ---
function updateLiveDateTime() {
    const now = new Date();

    // Custom set to emulate the metadata date structure if required, 
    // but standard browser clock is preferred.
    const timeStr = now.toTimeString().split(' ')[0];
    document.getElementById("live-time").innerText = timeStr;
    document.getElementById("live-date").innerText = getIndonesianDateString(now);
}
setInterval(updateLiveDateTime, 1000);
updateLiveDateTime();

// --- THEME SWITCHER ---
const themeToggleBtn = document.getElementById("theme-toggle");
themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    const isDark = document.body.classList.contains("dark-theme");
    localStorage.setItem("gtt_dark_theme", isDark);
});
// Set theme on load
if (localStorage.getItem("gtt_dark_theme") === "true") {
    document.body.classList.add("dark-theme");
}

// --- NAVIGATION SYSTEM ---
const navLinks = document.querySelectorAll(".sidebar-menu a");
const pages = document.querySelectorAll(".page-section");

navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();

        // Remove active class from menu items
        navLinks.forEach(n => n.classList.remove("active"));
        link.classList.add("active");

        // Hide all pages, show the selected page
        const targetPageId = link.getAttribute("data-page");
        pages.forEach(p => p.classList.remove("active"));

        const targetPage = document.getElementById(targetPageId);
        targetPage.classList.add("active");

        // Dynamic title changes
        const pageTitle = link.querySelector("span").innerText;
        document.getElementById("page-title").innerText = pageTitle;

        // Custom subtext
        let subtitle = "";
        if (targetPageId === "dashboard-page") {
            subtitle = "Ringkasan aktivitas presensi dan jam mengajar guru.";
            initDashboard();
        } else if (targetPageId === "guru-page") {
            subtitle = "Kelola data Guru Tidak Tetap (GTT) dan tarif honor per jam.";
            initGuruPage();
        } else if (targetPageId === "jadwal-page") {
            subtitle = "Kelola jadwal mengajar mingguan dan jumlah jam pelajaran (JP).";
            initJadwalPage();
        } else if (targetPageId === "presensi-page") {
            subtitle = "Catatan kehadiran mengajar harian guru di kelas.";
            initPresensiPage();
        } else if (targetPageId === "laporan-page") {
            subtitle = "Rekapitulasi total jam kerja, perhitungan honor, dan slip gaji.";
            initLaporanPage();
        }
        document.getElementById("page-subtitle").innerText = subtitle;
    });
});

// --- DIGITAL SIGNATURE CANVAS LOGIC ---
let canvas, ctx, drawing = false;

function initSignatureCanvas() {
    canvas = document.getElementById("signature-canvas");
    ctx = canvas.getContext("2d");

    // Fit canvas width to container
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = 150;

    ctx.strokeStyle = document.body.classList.contains("dark-theme") ? "#38bdf8" : "#4f46e5";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Mouse Events
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    // Touch Events for mobile screens
    canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    });
    canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        if (!drawing) return;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
        ctx.stroke();
    });
    canvas.addEventListener("touchend", stopDrawing);

    document.getElementById("btn-clear-sig").addEventListener("click", clearSignature);
}

function startDrawing(e) {
    drawing = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
}

function stopDrawing() {
    drawing = false;
}

function clearSignature() {
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function isCanvasEmpty(canvasEl) {
    const blank = document.createElement('canvas');
    blank.width = canvasEl.width;
    blank.height = canvasEl.height;
    return canvasEl.toDataURL() === blank.toDataURL();
}


// --- 1. DASHBOARD LOGIC ---
let attendanceChartInstance = null;

function initDashboard() {
    // Stat 1: Total Guru
    document.getElementById("stat-total-guru").innerText = guruList.filter(g => g.status === "Aktif").length;

    // Stat 2: Kehadiran Hari Ini
    // Find matching schedules for current day of week (local time or emulate 2026-07-02 which is Thursday)
    const todayDate = new Date();
    // For demo purposes, we align with the mock data timeline: if current year is 2026, let's use the local time date
    const daysName = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const todayDayName = daysName[todayDate.getDay()];

    const yyyy = todayDate.getFullYear();
    const mm = String(todayDate.getMonth() + 1).padStart(2, '0');
    const dd = String(todayDate.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const todaySchedules = jadwalList.filter(j => j.hari === todayDayName);
    const todayPresensi = presensiList.filter(p => p.tanggal === todayStr);

    const countPresentToday = todayPresensi.filter(p => p.status === "Hadir").length;
    document.getElementById("stat-hadir-hari-ini").innerText = countPresentToday;

    const percent = todaySchedules.length > 0 ? Math.round((todayPresensi.length / todaySchedules.length) * 100) : 0;
    document.getElementById("stat-persen-hadir").innerText = `${percent}% dari ${todaySchedules.length} kelas dijadwalkan`;

    // Stat 3 & 4: Total JP & Honor Bulan Berjalan (Current Month)
    const currentMonth = todayDate.getMonth(); // 0-11
    const currentYear = todayDate.getFullYear();

    const monthLogs = presensiList.filter(p => {
        const logDate = new Date(p.tanggal);
        return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
    });

    let totalJP = 0;
    let totalHonor = 0;

    monthLogs.forEach(log => {
        if (log.status === "Hadir") {
            totalJP += log.jp;
            // find teacher rate
            const teacher = guruList.find(g => g.id === log.guruId);
            if (teacher) {
                totalHonor += log.jp * teacher.honor;
            }
        }
    });

    document.getElementById("stat-total-jp").innerText = `${totalJP} JP`;
    document.getElementById("stat-total-honor").innerText = formatRupiah(totalHonor);

    // Render Today's Schedule Quick List
    renderDashboardSchedule(todayDayName, todayStr);

    // Render Recent Presensi Table
    renderRecentPresensiTable();

    // Render Analytics Chart
    renderDashboardChart();
}

function renderDashboardSchedule(dayName, dateStr) {
    const listContainer = document.getElementById("dashboard-schedule-list");
    listContainer.innerHTML = "";

    const todaySchedules = jadwalList.filter(j => j.hari === dayName);

    if (todaySchedules.length === 0) {
        listContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">Tidak ada jadwal mengajar untuk hari ini.</div>`;
        return;
    }

    todaySchedules.forEach(sched => {
        const teacher = guruList.find(g => g.id === sched.guruId);
        if (!teacher || teacher.status !== "Aktif") return;

        // check if check-in has been completed
        const presence = presensiList.find(p => p.tanggal === dateStr && p.jadwalId === sched.id);

        const card = document.createElement("div");
        card.className = "schedule-quick-card";

        let actionBtn = "";
        if (presence) {
            let badgeClass = "badge-success";
            if (presence.status === "Izin") badgeClass = "badge-warning";
            if (presence.status === "Sakit") badgeClass = "badge-info";
            if (presence.status === "Alpa") badgeClass = "badge-danger";

            actionBtn = `<span class="badge ${badgeClass}">${presence.status}</span>`;
        } else {
            actionBtn = `<button class="btn btn-primary btn-sm" onclick="triggerCheckIn('${sched.id}')">Absen</button>`;
        }

        card.innerHTML = `
            <div class="schedule-quick-info">
                <span class="schedule-quick-title">${teacher.nama}</span>
                <span class="schedule-quick-sub">${sched.mapel} &bull; Kelas ${sched.kelas} (${sched.jp} JP)</span>
                <span class="schedule-quick-time">${sched.jamMulai} - ${sched.jamSelesai}</span>
            </div>
            <div>
                ${actionBtn}
            </div>
        `;
        listContainer.appendChild(card);
    });
}

function renderRecentPresensiTable() {
    const tbody = document.getElementById("dashboard-recent-presensi");
    tbody.innerHTML = "";

    // Sort recent logs by date descending
    const sorted = [...presensiList].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 5);

    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Belum ada log presensi tercatat.</td></tr>`;
        return;
    }

    sorted.forEach(log => {
        const teacher = guruList.find(g => g.id === log.guruId);
        const name = teacher ? teacher.nama : "Guru Tidak Dikenal";

        let badgeClass = "badge-success";
        if (log.status === "Izin") badgeClass = "badge-warning";
        if (log.status === "Sakit") badgeClass = "badge-info";
        if (log.status === "Alpa") badgeClass = "badge-danger";

        // Format date string for readability
        const dObj = new Date(log.tanggal);
        const displayDate = `${dObj.getDate()}/${dObj.getMonth() + 1}/${dObj.getFullYear()}`;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${displayDate}</td>
            <td style="font-weight: 500;">${name}</td>
            <td>${log.mapel}</td>
            <td>${log.kelas}</td>
            <td>${log.jp} JP</td>
            <td><span class="badge ${badgeClass}">${log.status}</span></td>
            <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${log.materi}">${log.materi || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderDashboardChart() {
    const canvasChart = document.getElementById("attendanceChart");
    if (!canvasChart) return;

    // Get last 15 days attendance trend
    const dates = [];
    const counts = [];

    const today = new Date();
    for (let i = 14; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        dates.push(`${dd}/${mm}`);

        const dateStr = `${yyyy}-${mm}-${dd}`;
        const dayPres = presensiList.filter(p => p.tanggal === dateStr && p.status === "Hadir");

        // Sum total JP for the day
        const dayJP = dayPres.reduce((sum, current) => sum + current.jp, 0);
        counts.push(dayJP);
    }

    if (attendanceChartInstance) {
        attendanceChartInstance.destroy();
    }

    const isDark = document.body.classList.contains("dark-theme");
    const gridColor = isDark ? "#1e293b" : "#e2e8f0";
    const labelColor = isDark ? "#94a3b8" : "#475569";

    attendanceChartInstance = new Chart(canvasChart, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Total JP Mengajar',
                data: counts,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#4f46e5',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: labelColor,
                        font: { family: 'Outfit' }
                    }
                },
                y: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: labelColor,
                        font: { family: 'Outfit' },
                        stepSize: 2
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

function triggerCheckIn(scheduleId) {
    const sched = jadwalList.find(j => j.id === scheduleId);
    if (!sched) return;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    openModal("presensi-modal");

    // Prefill modal
    document.getElementById("presensi-jadwal-id").value = sched.id;
    document.getElementById("presensi-guru-id").value = sched.guruId;
    document.getElementById("presensi-tanggal").value = `${yyyy}-${mm}-${dd}`;
    document.getElementById("presensi-kelas").value = sched.kelas;
    document.getElementById("presensi-jp").value = sched.jp;
    document.getElementById("presensi-mapel").value = sched.mapel;
    document.getElementById("presensi-status").value = "Hadir";
    document.getElementById("signature-form-group").style.display = "flex";
}


// --- 2. GURU GTT CRUD LOGIC ---
function initGuruPage() {
    renderGuruTable();

    // Add Search Event
    document.getElementById("guru-search").addEventListener("input", renderGuruTable);
}

function renderGuruTable() {
    const tbody = document.getElementById("guru-table-body");
    tbody.innerHTML = "";

    const searchVal = document.getElementById("guru-search").value.toLowerCase();

    const filtered = guruList.filter(g =>
        g.nama.toLowerCase().includes(searchVal) ||
        g.mapel.toLowerCase().includes(searchVal) ||
        g.nuptk.includes(searchVal)
    );

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 20px;">Guru GTT tidak ditemukan.</td></tr>`;
        return;
    }

    filtered.forEach((guru, idx) => {
        const isAktif = guru.status === "Aktif";
        const badgeClass = isAktif ? "badge-success" : "badge-secondary";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td style="font-family: monospace; font-weight: 500;">${guru.nuptk || '-'}</td>
            <td style="font-weight: 600;">${guru.nama}</td>
            <td>${guru.mapel}</td>
            <td style="font-weight: 500; color: var(--color-success);">${formatRupiah(guru.honor)}</td>
            <td>${guru.wa || '-'}</td>
            <td><span class="badge ${badgeClass}">${guru.status}</span></td>
            <td>
                <div class="card-actions">
                    <button class="btn btn-secondary btn-icon-only" onclick="editGuru('${guru.id}')" title="Edit Guru"><i data-lucide="edit" style="width:16px;height:16px;"></i></button>
                    <button class="btn btn-danger btn-icon-only" onclick="deleteGuru('${guru.id}')" title="Hapus Guru"><i data-lucide="trash-2" style="width:16px;height:16px;"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    lucide.createIcons();
}

document.getElementById("btn-tambah-guru").addEventListener("click", () => {
    document.getElementById("guru-modal-title").innerText = "Tambah Guru GTT";
    document.getElementById("guru-form").reset();
    document.getElementById("guru-id").value = "";
    openModal("guru-modal");
});

document.getElementById("guru-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const id = document.getElementById("guru-id").value;
    const nuptk = document.getElementById("guru-nuptk").value;
    const nama = document.getElementById("guru-nama").value;
    const mapel = document.getElementById("guru-mapel").value;
    const honor = parseInt(document.getElementById("guru-honor").value);
    const wa = document.getElementById("guru-wa").value;
    const status = document.getElementById("guru-status").value;

    if (id) {
        // Edit
        const idx = guruList.findIndex(g => g.id === id);
        if (idx !== -1) {
            guruList[idx] = { id, nuptk, nama, mapel, honor, wa, status };
            showToast("Berhasil memperbarui data Guru GTT.");
        }
    } else {
        // Create
        const maxId = guruList.reduce((max, g) => {
            const num = parseInt(g.id.substring(1));
            return num > max ? num : max;
        }, 0);
        const newId = "G" + String(maxId + 1).padStart(3, '0');
        guruList.push({ id: newId, nuptk, nama, mapel, honor, wa, status });
        showToast("Berhasil menambahkan Guru GTT baru.");
    }

    saveToStorage();
    closeModal("guru-modal");
    renderGuruTable();
});

function editGuru(id) {
    const guru = guruList.find(g => g.id === id);
    if (!guru) return;

    document.getElementById("guru-modal-title").innerText = "Edit Guru GTT";
    document.getElementById("guru-id").value = guru.id;
    document.getElementById("guru-nuptk").value = guru.nuptk;
    document.getElementById("guru-nama").value = guru.nama;
    document.getElementById("guru-mapel").value = guru.mapel;
    document.getElementById("guru-honor").value = guru.honor;
    document.getElementById("guru-wa").value = guru.wa;
    document.getElementById("guru-status").value = guru.status;

    openModal("guru-modal");
}

function deleteGuru(id) {
    if (confirm("Apakah Anda yakin ingin menghapus data guru ini? Semua jadwal yang berhubungan juga akan dihapus.")) {
        guruList = guruList.filter(g => g.id !== id);
        jadwalList = jadwalList.filter(j => j.guruId !== id);

        saveToStorage();
        showToast("Data guru berhasil dihapus.", "danger");
        renderGuruTable();
    }
}


// --- 3. JADWAL CRU LOGIC ---
function initJadwalPage() {
    renderJadwalTable();

    // Bind Hari Filter
    document.getElementById("jadwal-filter-hari").addEventListener("change", renderJadwalTable);

    // Populating dropdowns
    populateGuruDropdown("jadwal-guru-id");
}

function populateGuruDropdown(elementId) {
    const dropdown = document.getElementById(elementId);
    dropdown.innerHTML = '<option value="">-- Pilih Guru --</option>';

    guruList.filter(g => g.status === "Aktif").forEach(guru => {
        const option = document.createElement("option");
        option.value = guru.id;
        option.innerText = `${guru.nama} (${guru.mapel})`;
        dropdown.appendChild(option);
    });
}

function renderJadwalTable() {
    const tbody = document.getElementById("jadwal-table-body");
    tbody.innerHTML = "";

    const filterHari = document.getElementById("jadwal-filter-hari").value;

    const filtered = jadwalList.filter(j => filterHari === "" || j.hari === filterHari);

    // Sort by Day sequence and start time
    const daySequence = { "Senin": 1, "Selasa": 2, "Rabu": 3, "Kamis": 4, "Jumat": 5, "Sabtu": 6, "Minggu": 7 };
    filtered.sort((a, b) => {
        if (daySequence[a.hari] !== daySequence[b.hari]) {
            return daySequence[a.hari] - daySequence[b.hari];
        }
        return a.jamMulai.localeCompare(b.jamMulai);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">Belum ada jadwal mengajar terdaftar.</td></tr>`;
        return;
    }

    filtered.forEach(j => {
        const teacher = guruList.find(g => g.id === j.guruId);
        const teacherName = teacher ? teacher.nama : "Guru Tidak Dikenal";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="font-weight: 600;">${j.hari}</td>
            <td style="font-weight: 500; color: var(--color-primary);">${j.jamMulai} - ${j.jamSelesai}</td>
            <td style="font-weight: 500;">${teacherName}</td>
            <td>${j.mapel || (teacher ? teacher.mapel : '-')}</td>
            <td style="font-weight: 500;">${j.kelas}</td>
            <td>${j.jp} JP</td>
            <td>
                <button class="btn btn-danger btn-icon-only btn-sm" onclick="deleteJadwal('${j.id}')" title="Hapus Jadwal"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    lucide.createIcons();
}

document.getElementById("btn-tambah-jadwal").addEventListener("click", () => {
    populateGuruDropdown("jadwal-guru-id");
    document.getElementById("jadwal-form").reset();
    openModal("jadwal-modal");
});

document.getElementById("jadwal-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const guruId = document.getElementById("jadwal-guru-id").value;
    const hari = document.getElementById("jadwal-hari").value;
    const jamMulai = document.getElementById("jadwal-jam-mulai").value;
    const jamSelesai = document.getElementById("jadwal-jam-selesai").value;
    const kelas = document.getElementById("jadwal-kelas").value;
    const jp = parseInt(document.getElementById("jadwal-jp").value);

    // Optional mapel override
    let mapel = document.getElementById("jadwal-mapel").value;
    if (!mapel) {
        const teacher = guruList.find(g => g.id === guruId);
        mapel = teacher ? teacher.mapel : "";
    }

    const maxId = jadwalList.reduce((max, j) => {
        const num = parseInt(j.id.substring(1));
        return num > max ? num : max;
    }, 0);
    const newId = "J" + String(maxId + 1).padStart(3, '0');
    jadwalList.push({ id: newId, guruId, hari, jamMulai, jamSelesai, kelas, jp, mapel });

    saveToStorage();
    showToast("Jadwal mengajar berhasil ditambahkan.");
    closeModal("jadwal-modal");
    renderJadwalTable();
});

function deleteJadwal(id) {
    if (confirm("Apakah Anda yakin ingin menghapus jadwal mengajar ini?")) {
        jadwalList = jadwalList.filter(j => j.id !== id);
        saveToStorage();
        showToast("Jadwal mengajar berhasil dihapus.", "danger");
        renderJadwalTable();
    }
}


// --- 4. PRESENSI LOGIC ---
function initPresensiPage() {
    // Set default filter date today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    const dateInput = document.getElementById("presensi-filter-tanggal");
    if (!dateInput.value) {
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }

    populateGuruDropdown("presensi-filter-guru");
    populateGuruDropdown("presensi-guru-id");

    // Bind search and filter events
    dateInput.addEventListener("change", renderPresensiTable);
    document.getElementById("presensi-filter-guru").addEventListener("change", renderPresensiTable);

    renderPresensiTable();
}

function renderPresensiTable() {
    const tbody = document.getElementById("presensi-table-body");
    tbody.innerHTML = "";

    const filterTanggal = document.getElementById("presensi-filter-tanggal").value;
    const filterGuru = document.getElementById("presensi-filter-guru").value;

    const filtered = presensiList.filter(p => {
        const matchTanggal = filterTanggal === "" || p.tanggal === filterTanggal;
        const matchGuru = filterGuru === "" || p.guruId === filterGuru;
        return matchTanggal && matchGuru;
    });

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 20px;">Tidak ada rekaman presensi pada filter terpilih.</td></tr>`;
        return;
    }

    filtered.forEach(p => {
        const teacher = guruList.find(g => g.id === p.guruId);
        const name = teacher ? teacher.nama : "Guru Tidak Dikenal";

        let badgeClass = "badge-success";
        if (p.status === "Izin") badgeClass = "badge-warning";
        if (p.status === "Sakit") badgeClass = "badge-info";
        if (p.status === "Alpa") badgeClass = "badge-danger";

        // signature thumbnail
        let sigThumb = "-";
        if (p.status === "Hadir" && p.tandaTangan) {
            sigThumb = `<img src="${p.tandaTangan}" style="max-height: 28px; max-width: 80px; object-fit: contain; background: #fff; padding: 2px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);" alt="Ttd">`;
        }

        // Format date string for readability
        const dObj = new Date(p.tanggal);
        const displayDate = `${dObj.getDate()}/${dObj.getMonth() + 1}/${dObj.getFullYear()}`;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${displayDate}</td>
            <td style="font-weight: 500;">${name}</td>
            <td>${p.kelas}</td>
            <td>${p.mapel}</td>
            <td>${p.jp} JP</td>
            <td><span class="badge ${badgeClass}">${p.status}</span></td>
            <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${p.materi}">${p.materi || '-'}</td>
            <td style="text-align: center;">${sigThumb}</td>
            <td>
                <button class="btn btn-danger btn-icon-only btn-sm" onclick="deletePresensi('${p.id}')" title="Hapus Presensi"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    lucide.createIcons();
}

document.getElementById("btn-presensi-manual").addEventListener("click", () => {
    populateGuruDropdown("presensi-guru-id");
    document.getElementById("presensi-form").reset();
    document.getElementById("presensi-jadwal-id").value = "";

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    document.getElementById("presensi-tanggal").value = `${yyyy}-${mm}-${dd}`;

    // Toggle signature display on status change
    const statusSelect = document.getElementById("presensi-status");
    const sigGroup = document.getElementById("signature-form-group");

    statusSelect.addEventListener("change", () => {
        if (statusSelect.value === "Hadir") {
            sigGroup.style.display = "flex";
        } else {
            sigGroup.style.display = "none";
        }
    });

    sigGroup.style.display = "flex";

    openModal("presensi-modal");
});

document.getElementById("presensi-guru-id").addEventListener("change", (e) => {
    const guruId = e.target.value;
    const teacher = guruList.find(g => g.id === guruId);

    if (teacher) {
        document.getElementById("presensi-mapel").value = teacher.mapel;
    }
});

document.getElementById("presensi-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const jadwalId = document.getElementById("presensi-jadwal-id").value || null;
    const guruId = document.getElementById("presensi-guru-id").value;
    const tanggal = document.getElementById("presensi-tanggal").value;
    const status = document.getElementById("presensi-status").value;
    const kelas = document.getElementById("presensi-kelas").value;
    const jp = parseInt(document.getElementById("presensi-jp").value);
    const mapel = document.getElementById("presensi-mapel").value;
    const materi = document.getElementById("presensi-materi").value;

    let signatureData = "";
    if (status === "Hadir") {
        const sigCanvas = document.getElementById("signature-canvas");
        if (isCanvasEmpty(sigCanvas)) {
            alert("Tanda tangan guru wajib diisi jika status kehadiran adalah Hadir.");
            return;
        }
        signatureData = sigCanvas.toDataURL();
    }

    // Check if duplicate presence for same teacher, date, class/schedule
    const isDup = presensiList.some(p => p.guruId === guruId && p.tanggal === tanggal && p.kelas === kelas && p.mapel === mapel && p.jadwalId === jadwalId);
    if (isDup && !jadwalId) {
        if (!confirm("Guru ini sudah terabsen untuk kelas dan mapel yang sama pada tanggal ini. Tetap simpan?")) {
            return;
        }
    }

    const maxId = presensiList.reduce((max, p) => {
        const num = parseInt(p.id.substring(1));
        return num > max ? num : max;
    }, 0);
    const newId = "P" + String(maxId + 1).padStart(4, '0');

    const dObj = new Date(tanggal);
    const daysName = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const hari = daysName[dObj.getDay()];

    presensiList.push({
        id: newId,
        jadwalId,
        guruId,
        tanggal,
        hari,
        kelas,
        mapel,
        jp,
        status,
        materi,
        tandaTangan: signatureData
    });

    saveToStorage();
    showToast("Catatan presensi berhasil disimpan.");
    closeModal("presensi-modal");

    // Re-render
    const activePage = document.querySelector(".page-section.active").id;
    if (activePage === "dashboard-page") {
        initDashboard();
    } else {
        renderPresensiTable();
    }
});

function deletePresensi(id) {
    if (confirm("Apakah Anda yakin ingin menghapus catatan presensi ini?")) {
        presensiList = presensiList.filter(p => p.id !== id);
        saveToStorage();
        showToast("Catatan presensi telah dihapus.", "danger");
        renderPresensiTable();
    }
}


// --- 5. LAPORAN & PAYROLL SYSTEM ---
function initLaporanPage() {
    const today = new Date();
    // Default selects to current period
    document.getElementById("laporan-bulan").value = today.getMonth();
    document.getElementById("laporan-tahun").value = today.getFullYear();

    // Bind filters
    document.getElementById("laporan-bulan").addEventListener("change", renderLaporan);
    document.getElementById("laporan-tahun").addEventListener("change", renderLaporan);

    renderLaporan();
}

function renderLaporan() {
    const grid = document.getElementById("reports-grid");
    grid.innerHTML = "";

    const bulan = parseInt(document.getElementById("laporan-bulan").value);
    const tahun = parseInt(document.getElementById("laporan-tahun").value);

    guruList.forEach(guru => {
        // filter presensi for this guru on selected month/year
        const guruPres = presensiList.filter(p => {
            const pDate = new Date(p.tanggal);
            return p.guruId === guru.id && pDate.getMonth() === bulan && pDate.getFullYear() === tahun;
        });

        const totalHadirJP = guruPres.filter(p => p.status === "Hadir").reduce((sum, curr) => sum + curr.jp, 0);
        const totalIzin = guruPres.filter(p => p.status === "Izin").length;
        const totalSakit = guruPres.filter(p => p.status === "Sakit").length;
        const totalAlpa = guruPres.filter(p => p.status === "Alpa").length;

        const totalHonorPayable = totalHadirJP * guru.honor;

        const card = document.createElement("div");
        card.className = "teacher-report-card";
        card.innerHTML = `
            <div class="teacher-report-header">
                <div class="teacher-report-title">
                    <h3>${guru.nama}</h3>
                    <p>${guru.mapel} &bull; ${guru.nuptk || '-'}</p>
                </div>
                <span class="badge ${guru.status === 'Aktif' ? 'badge-success' : 'badge-secondary'}">${guru.status}</span>
            </div>
            
            <div class="teacher-report-stats">
                <div class="teacher-report-stat">
                    <span class="val">${totalHadirJP} JP</span>
                    <span class="lbl">Hadir Mengajar</span>
                </div>
                <div class="teacher-report-stat">
                    <span class="val">${totalIzin + totalSakit + totalAlpa} x</span>
                    <span class="lbl">Absen (I/S/A)</span>
                </div>
            </div>
            
            <div class="teacher-report-salary">
                <div>
                    <div class="lbl">Honor / JP</div>
                    <div style="font-weight:600; font-size:0.9rem;">${formatRupiah(guru.honor)}</div>
                </div>
                <div style="text-align: right;">
                    <div class="lbl">Total Terima</div>
                    <div class="amount">${formatRupiah(totalHonorPayable)}</div>
                </div>
            </div>
            
            <div class="card-actions" style="margin-top: 10px; justify-content: space-between;">
                <button class="btn btn-secondary btn-sm" onclick="showRincianPresensi('${guru.id}', ${bulan}, ${tahun})">
                    <i data-lucide="eye" style="width:14px;height:14px;"></i> Rincian
                </button>
                <button class="btn btn-primary btn-sm" onclick="cetakSlipGaji('${guru.id}', ${bulan}, ${tahun})" ${totalHadirJP === 0 ? 'disabled' : ''}>
                    <i data-lucide="printer" style="width:14px;height:14px;"></i> Cetak Slip
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    lucide.createIcons();
}

function showRincianPresensi(guruId, bulan, tahun) {
    const guru = guruList.find(g => g.id === guruId);
    if (!guru) return;

    document.getElementById("rincian-modal-title").innerText = `Rincian Presensi: ${guru.nama}`;
    const tbody = document.getElementById("rincian-table-body");
    tbody.innerHTML = "";

    const records = presensiList.filter(p => {
        const pDate = new Date(p.tanggal);
        return p.guruId === guruId && pDate.getMonth() === bulan && pDate.getFullYear() === tahun;
    });

    // Sort by date descending
    records.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    if (records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">Tidak ada rekaman presensi pada periode ini.</td></tr>`;
    } else {
        records.forEach(r => {
            let badgeClass = "badge-success";
            if (r.status === "Izin") badgeClass = "badge-warning";
            if (r.status === "Sakit") badgeClass = "badge-info";
            if (r.status === "Alpa") badgeClass = "badge-danger";

            let sigThumb = "-";
            if (r.status === "Hadir" && r.tandaTangan) {
                sigThumb = `<img src="${r.tandaTangan}" style="max-height: 24px; max-width: 60px; object-fit: contain; background: #fff;" alt="Ttd">`;
            }

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${r.tanggal}</td>
                <td>${r.kelas}</td>
                <td>${r.mapel}</td>
                <td>${r.jp} JP</td>
                <td><span class="badge ${badgeClass}">${r.status}</span></td>
                <td>${r.materi || '-'}</td>
                <td style="text-align: center;">${sigThumb}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    openModal("rincian-modal");
}

function cetakSlipGaji(guruId, bulan, tahun) {
    const guru = guruList.find(g => g.id === guruId);
    if (!guru) return;

    const records = presensiList.filter(p => {
        const pDate = new Date(p.tanggal);
        return p.guruId === guruId && pDate.getMonth() === bulan && pDate.getFullYear() === tahun;
    });

    const totalHadirJP = records.filter(p => p.status === "Hadir").reduce((sum, curr) => sum + curr.jp, 0);
    const totalAbsen = records.filter(p => p.status !== "Hadir").length;
    const totalHonor = totalHadirJP * guru.honor;

    const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    // Set Print Template Fields
    document.getElementById("print-slip-periode").innerText = `Periode: ${namaBulan[bulan]} ${tahun}`;
    document.getElementById("print-slip-nama").innerText = guru.nama;
    document.getElementById("print-slip-nuptk").innerText = guru.nuptk || '-';
    document.getElementById("print-slip-mapel").innerText = guru.mapel;
    document.getElementById("print-slip-tarif").innerText = formatRupiah(guru.honor);
    document.getElementById("print-slip-jp").innerText = `${totalHadirJP} JP`;
    document.getElementById("print-slip-subtotal").innerText = formatRupiah(totalHonor);
    document.getElementById("print-slip-absen").innerText = `${totalAbsen} kali`;
    document.getElementById("print-slip-total").innerText = formatRupiah(totalHonor);
    document.getElementById("print-slip-nama-ttd").innerText = guru.nama;

    // Set Ttd date to today
    const now = new Date();
    document.getElementById("print-slip-tanggal-ttd").innerText = `${now.getDate()} ${namaBulan[now.getMonth()]} ${now.getFullYear()}`;

    // Get last valid check-in signature for this teacher in this period (if exists)
    const signedLog = records.slice().reverse().find(p => p.status === "Hadir" && p.tandaTangan);
    const sigImgEl = document.getElementById("print-slip-sig-img");

    if (signedLog && signedLog.tandaTangan) {
        sigImgEl.src = signedLog.tandaTangan;
        sigImgEl.style.display = "block";
    } else {
        sigImgEl.style.display = "none";
    }

    // Trigger Print
    window.print();
}

// --- 6. EXPORT LAPORAN CSV ---
document.getElementById("btn-ekspor-csv").addEventListener("click", () => {
    const bulan = parseInt(document.getElementById("laporan-bulan").value);
    const tahun = parseInt(document.getElementById("laporan-tahun").value);
    const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "LAPORAN PRESENSI & HONOR GURU TIDAK TETAP (GTT) SMP THHK\r\n";
    csvContent += `Periode: ${namaBulan[bulan]} ${tahun}\r\n\r\n`;

    csvContent += "No,NUPTK/ID,Nama Guru,Mapel Utama,Honor per JP,Total JP Hadir,Total Absen (I/S/A),Total Terima Honor,Status\r\n";

    guruList.forEach((guru, idx) => {
        const records = presensiList.filter(p => {
            const pDate = new Date(p.tanggal);
            return p.guruId === guru.id && pDate.getMonth() === bulan && pDate.getFullYear() === tahun;
        });

        const totalHadirJP = records.filter(p => p.status === "Hadir").reduce((sum, curr) => sum + curr.jp, 0);
        const totalAbsen = records.filter(p => p.status !== "Hadir").length;
        const totalHonor = totalHadirJP * guru.honor;

        const row = [
            idx + 1,
            `"${guru.nuptk || '-'}"`,
            `"${guru.nama}"`,
            `"${guru.mapel}"`,
            guru.honor,
            totalHadirJP,
            totalAbsen,
            totalHonor,
            guru.status
        ].join(",");

        csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_GTT_SMP_THHK_${namaBulan[bulan]}_${tahun}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Berhasil mengekspor laporan ke file .CSV");
});


// --- QUICK ABSENSI HEADER ACTION ---
document.getElementById("quick-presensi-btn").addEventListener("click", () => {
    // Switch to Presensi page
    document.querySelector('a[data-page="presensi-page"]').click();
    // Auto-click "Input Presensi Kelas"
    document.getElementById("btn-presensi-manual").click();
});


// Update dashboard based on user role
function updateDashboardByRole() {
    // Hide Total Guru stat for guru users (they can't see all teachers)
    const statTotalGuru = document.querySelector(".stats-primary");
    const statTotalHonor = document.querySelector(".stats-info");

    if (isAdmin()) {
        // Admin sees everything
        if (statTotalGuru) statTotalGuru.style.display = "flex";
        if (statTotalHonor) statTotalHonor.style.display = "flex";
    } else {
        // Guru users hide admin-only stats
        if (statTotalGuru) statTotalGuru.style.display = "none";
        if (statTotalHonor) statTotalHonor.style.display = "none";
    }
}

// Filter presensi list by current user's role
function getFilteredPresensi(presensiData) {
    if (isAdmin()) {
        return presensiData; // Admin sees all
    }

    const guruId = getCurrentGuruId();
    if (!guruId) return []; // No guru ID, return empty

    return presensiData.filter(p => p.guruId === guruId);
}

// Filter guru list by current user's role
function getFilteredGuru(guruData) {
    if (isAdmin()) {
        return guruData; // Admin sees all
    }

    const guruId = getCurrentGuruId();
    if (!guruId) return [];

    return guruData.filter(g => g.id === guruId);
}

// Update recent presensi table to filter by role
function renderRecentPresensiTable() {
    const tbody = document.getElementById("dashboard-recent-presensi");
    tbody.innerHTML = "";

    // Sort recent logs by date descending, filtered by role
    const filteredAll = getFilteredPresensi(presensiList);
    const sorted = [...filteredAll].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 5);

    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Belum ada log presensi tercatat.</td></tr>`;
        return;
    }

    sorted.forEach(log => {
        const teacher = guruList.find(g => g.id === log.guruId);
        const name = teacher ? teacher.nama : "Guru Tidak Dikenal";

        let badgeClass = "badge-success";
        if (log.status === "Izin") badgeClass = "badge-warning";
        if (log.status === "Sakit") badgeClass = "badge-info";
        if (log.status === "Alpa") badgeClass = "badge-danger";

        // Format date string for readability
        const dObj = new Date(log.tanggal);
        const displayDate = `${dObj.getDate()}/${dObj.getMonth() + 1}/${dObj.getFullYear()}`;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${displayDate}</td>
            <td style="font-weight: 500;">${name}</td>
            <td>${log.mapel}</td>
            <td>${log.kelas}</td>
            <td>${log.jp} JP</td>
            <td><span class="badge ${badgeClass}">${log.status}</span></td>
            <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${log.materi}">${log.materi || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Update chart to filter by role
function renderDashboardChart() {
    const canvasChart = document.getElementById("attendanceChart");
    if (!canvasChart) return;

    // Get last 15 days attendance trend filtered by role
    const dates = [];
    const counts = [];

    const today = new Date();
    const filteredPresensi = getFilteredPresensi(presensiList);

    for (let i = 14; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        dates.push(`${dd}/${mm}`);

        const dateStr = `${yyyy}-${mm}-${dd}`;
        const dayPres = filteredPresensi.filter(p => p.tanggal === dateStr && p.status === "Hadir");

        // Sum total JP for the day
        const dayJP = dayPres.reduce((sum, current) => sum + current.jp, 0);
        counts.push(dayJP);
    }

    if (attendanceChartInstance) {
        attendanceChartInstance.destroy();
    }

    const isDark = document.body.classList.contains("dark-theme");
    const gridColor = isDark ? "#1e293b" : "#e2e8f0";
    const labelColor = isDark ? "#94a3b8" : "#475569";

    attendanceChartInstance = new Chart(canvasChart, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Total JP Mengajar',
                data: counts,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#4f46e5',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: labelColor,
                        font: { family: 'Outfit' }
                    }
                },
                y: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: labelColor,
                        font: { family: 'Outfit' },
                        stepSize: 2
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// --- LOGIN HANDLING ---
document.addEventListener("DOMContentLoaded", async () => {
    // Initialize Supabase
    await initSupabase();

    // Check if user is already logged in
    if (currentUser) {
        showMainApp();
    } else {
        showLoginScreen();
    }

    // Login form submit
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("login-username").value;
            const password = document.getElementById("login-password").value;

            console.log('Attempting login for:', username);
            const success = await login(username, password);
            console.log('Login result:', success, 'currentUser:', currentUser);

            if (success && currentUser) {
                showToast("Login berhasil! Selamat datang, " + currentUser.nama);
                showMainApp();
            } else {
                showToast("Username atau password salah!", "danger");
            }
        });
    }

    // Logout button
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            logout();
            showToast("Anda telah keluar dari sistem.", "warning");
        });
    }
});

// --- PWA & MOBILE SUPPORT ---
// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}

// Mobile Menu Toggle
function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('aside');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            menuToggle.classList.toggle('active');
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('mobile-open') &&
                !sidebar.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
                menuToggle.classList.remove('active');
            }
        });
    }
}

// Handle back button for mobile
window.addEventListener('popstate', (e) => {
    // Handle navigation state
});

// Prevent zoom on double tap for better mobile experience
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Initialise mobile-specific features
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
});

// --- INITIAL LOAD INVOCATION ---
window.onload = () => {
    lucide.createIcons();
    // Don't init dashboard here - it will be called after login
    if (currentUser) {
        initDashboard();
    }
    initMobileMenu();
};
