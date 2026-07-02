# 📚 Presensi GTT SMP THHK

Sistem Presensi Guru Tidak Tetap dan Honor SMP THHK - Aplikasi web-based untuk mengelola kehadiran dan honor guru.

![Status](https://img.shields.io/badge/status-Active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎯 Fitur

- **Dashboard Interaktif** - Ringkasan data presensi dan statistik
- **Manajemen Data Guru** - CRUD data guru GTT
- **Jadwal Mengajar** - Kelola jadwal mengajar per hari
- **Presensi Harian** - Input kehadiran dengan tanda tangan digital
- **Laporan & Slip Honor** - Generate laporan dan slip honor per bulan
- **PWA Support** - Bisa diinstal di smartphone
- **Offline Support** - Tetap berfungsi tanpa koneksi internet
- **Dark Mode** - Mode gelap untuk kenyamanan mata

## 🛠️ Teknologi

- HTML5, CSS3, JavaScript (Vanilla)
- [Lucide Icons](https://lucide.dev/) - Icon library
- [Chart.js](https://www.chartjs.org/) - Charts
- [Outfit Font](https://fonts.google.com/specimen/Outfit) - Typography
- LocalStorage - Data persistence
- Service Worker - PWA & Offline support

## 📱 Instalasi

### Clone Repository
```bash
git clone https://github.com/adinrefqi/presensigtt.git
cd presensigtt
```

### Jalankan
Buka `index.html` di browser, atau gunakan local server:
```bash
# Python
python -m http.server 8000

# Node.js
npx serve
```

## 🔐 Login Demo

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Guru | guru001 | guru123 |

## 📂 Struktur File

```
├── index.html      # Main HTML
├── styles.css       # Stylesheet
├── app.js          # Application logic
├── manifest.json   # PWA manifest
├── sw.js           # Service Worker
└── README.md       # Dokumentasi
```

## 🌐 Hosting

Aplikasi bisa dihosting gratis di:
- **GitHub Pages** - https://adinrefqi.github.io/presensigtt
- **Netlify** - Drag & drop folder
- **Vercel** - Connect repo

## 📝 Lisensi

MIT License - Bebas digunakan untuk keperluan apapun.

---

Made with ❤️ for SMP THHK
