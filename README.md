# Mini Wallet – Frontend Documentation 💰
React (Vite) + Tailwind CSS v4 • Last Updated: March 2026

## 📌 Table of Contents
- [Project Overview](#-project-overview)
- [Core Features](#-core-features)
- [Authentication & Access Control](#-authentication--access-control)
- [Routing Structure](#-routing-structure)
- [Tech Stack](#-tech-stack)
- [API Integration](#-api-integration)
- [Component Architecture](#-component-architecture)
- [Responsive Design](#-responsive-design)
- [Deployment Notes](#-deployment-notes)
- [Getting Started](#-getting-started)
- [Author](#-author)

---

## 📖 Project Overview
**Mini Wallet** adalah platform dompet digital modern yang dibangun menggunakan **React (Vite)** dan **Tailwind CSS v4**. Aplikasi ini dirancang dengan estetika *Premium Minimalist* (Gold & Slate), terintegrasi penuh dengan backend Laravel REST API untuk manajemen keuangan personal yang intuitif.

**Kemampuan Utama:**
*   **Dynamic Financial Tracking:** Kalkulasi otomatis pemasukan dan pengeluaran secara real-time.
*   **Elegant Dashboard:** Antarmuka bersih dengan kartu balance, ringkasan transaksi, dan aksi cepat.
*   **Virtual Card Management:** Tampilan kartu debit virtual yang elegan di menu Duitin.
*   **Premium UI/UX:** Menggunakan Tailwind v4 untuk performa maksimal, *glassmorphism*, dan animasi transisi halaman yang halus.
*   **Secure Auth**: Sistem login dan register dengan proteksi token Sanctum.

---

## 🚀 Core Features

### 🌍 Onboarding & Access
*   **Landing Page (Home.jsx)**: Visualisasi hero premium dengan alur "Get Started" yang mulus.
*   **Auth (Login/Register)**: Desain modern "Modern iOS Style" dengan *floating labels*, ikon interaktif, dan validasi real-time.

### 👤 Main Dashboard Views
*   **Home View**: Ringkasan saldo, banner promo, dan 4 aksi cepat (Top Up, Transfer, Request, History).
*   **Duitin (Wallet)**: Manajemen kartu virtual dan pengaturan limit saldo.
*   **Scan QR**: Mockup antarmuka pemindai QRIS untuk pembayaran cepat.
*   **Statistic View**: Grafik laporan keuangan dan riwayat transaksi yang dikelompokkan berdasarkan hari.
*   **Profile View**: Pengaturan akun, edit profil, dan fitur Logout.

### 💸 Transaction Logic
*   **Real-time Top Up**: Integrasi saldo instan via API backend.
*   **Smart Transfer**: Fitur transfer ke sesama user dengan daftar "Recent Users" untuk pengisian tujuan otomatis.

---

## 🔒 Authentication & Access Control

### Authentication Flow
1.  User login/register via `/login` atau `/register`.
2.  Backend mengirimkan **Bearer Token**, profil user, dan data saldo.
3.  Token disimpan di `localStorage` dan status `isAuthenticated` menjadi `true`.
4.  **Axios Interceptor** ([src/api.js](cci:7://file:///e:/FULLSTACK%20JOURNEY/Assigment/workday/frontwallet/src/api.js:0:0-0:0)) secara otomatis menyisipkan token ke setiap header request API berikutnya.

---

## 📂 Routing Structure
src/
├── pages/
│   ├── Home.jsx        (Onboarding)
│   ├── Login.jsx       (Modern Login UI)
│   ├── Register.jsx    (Modern Signup UI)
│   └── Dashboard.jsx   (Main Container & Sub-views)
├── assets/             (Images & SVG)
├── services/
│   └── api.js          (Axios Configuration)
├── App.jsx             (Routes & State context)
└── main.jsx            (Entry point)

---

## 🛠 Tech Stack Detail
| Package | Version | Description |
| :--- | :--- | :--- |
| **react** | ^19.0.0 | Core library |
| **react-router-dom** | ^7.13.0 | Navigation & SPA Routing |
| **tailwindcss** | ^4.0.0 | Latest CSS-first framework |
| **axios** | ^1.7.9 | HTTP Client with Interceptors |
| **lucide-react** | ^0.474.0 | Premium SVG Icons |
| **vite** | ^6.0.0 | Fast Build Tool & Dev Server |

---

## 🔌 API Integration
**Base URL:** `VITE_API_URL=http://localhost:8000/api` (Local) atau URL Production.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/login` | Authentikasi & Token JWT |
| POST | `/register` | Pendaftaran akun baru |
| GET | `/balance` | Ambil data saldo user terbaru |
| GET | `/transactions` | Ambil riwayat mutasi rekening |
| PUT | `/profile` | Update informasi profil user |
| GET | `/recent-transfers` | Ambil daftar recipient terakhir |

---

## 📐 Component Architecture
*   **Sub-view Pattern**: `Dashboard.jsx` menggunakan sistem `activeView` untuk merender komponen internal (Home, Statistic, Scan, etc) secara dinamis tanpa reload halaman.
*   **Modern Inputs**: Komponen input menggunakan kombinasi `absolute labels` untuk estetika floating teks di atas border.
*   **Interceptor Pattern**: Memastikan keamanan setiap request secara terpusat di [api.js](cci:7://file:///e:/FULLSTACK%20JOURNEY/Assigment/workday/frontwallet/src/api.js:0:0-0:0).

---

## 📱 Responsive Design
*   **Mobile-First**: Dioptimalkan untuk layar ponsel dengan kartu-kartu yang mudah di-tap.
*   **Transition**: Menggunakan `page-transition` CSS classes untuk memberikan nuansa aplikasi native.

---

## 📦 Deployment Notes
*   **Frontend**: Dapat di-host di Vercel/Netlify.
*   **Env Config**: Pastikan `VITE_API_URL` dikonfigurasi di dashboard hosting mengarah ke alamat backend yang valid.
*   **Build**: Jalankan `npm run build` untuk menghasilkan folder `dist` yang dioptimalkan.

---

## 🚀 Getting Started

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/codpangestu/FE-Frontwallet.git
    cd FE-Frontwallet
    npm install
    ```
2.  **Setup Environment**:
    Buat file `.env` di root folder:
    ```env
    VITE_API_URL=http://localhost:8000/api
    ```
3.  **Run Development**:
    ```bash
    npm run dev
    ```

---

## 👨‍💻 Author
**Akbar Pangestu**
*"Building scalable and real-world fullstack applications."*
