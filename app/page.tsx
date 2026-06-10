'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronRight, Shield, Zap, Bell, LineChart } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#c5c6c7] font-sans selection:bg-[#ffcc00] selection:text-black overflow-hidden relative">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />
      
      {/* Decorative Lines */}
      <div className="absolute top-0 left-8 w-px h-full bg-gradient-to-b from-transparent via-[#ffcc00]/20 to-transparent pointer-events-none hidden sm:block" />
      <div className="absolute top-0 right-8 w-px h-full bg-gradient-to-b from-transparent via-[#00f0ff]/20 to-transparent pointer-events-none hidden sm:block" />

      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-[#ffcc00] clip-angled">
            <Zap className="h-6 w-6 text-black" fill="currentColor" />
          </div>
          <span className="font-mono text-xl font-bold tracking-widest text-white uppercase">Resin_Tracker</span>
        </div>
        <Link 
          href="/login" 
          className="group flex items-center gap-2 border border-[#45a29e] px-4 py-2 text-sm font-mono text-[#66fcf1] transition-all hover:bg-[#45a29e]/20"
        >
          [ LOGIN ]
        </Link>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 pt-20 pb-32 sm:px-12 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="mb-4 inline-flex items-center gap-2 border border-[#ffcc00]/30 bg-[#ffcc00]/10 px-3 py-1 font-mono text-xs text-[#ffcc00]">
            <span className="h-2 w-2 bg-[#ffcc00] animate-pulse" />
            SYSTEM_ONLINE
          </div>
          <h1 className="mb-6 text-5xl font-black uppercase tracking-tight text-white sm:text-7xl lg:text-8xl">
            Satu Tempat <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffcc00] to-[#f39c12]">
              Untuk Semua
            </span> <br />
            Kebutuhan Gacha-mu
          </h1>
          <p className="mb-10 max-w-xl text-lg text-[#878a8f] sm:text-xl border-l-2 border-[#ffcc00] pl-4">
            Operasional terpusat. Lacak resin secara real-time, pantau misi harian, dan terima peringatan kritis sebelum resource Anda penuh.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link 
              href="/dashboard"
              className="group relative inline-flex items-center justify-center gap-2 bg-[#ffcc00] px-8 py-4 font-mono font-bold text-black overflow-hidden hover:bg-[#ffd700] transition-colors"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-12 group-hover:translate-x-[100%] transition-transform duration-700" />
              <span>MULAI SEKARANG</span>
              <ChevronRight className="h-5 w-5" />
            </Link>
            <a 
              href="#features"
              className="inline-flex items-center justify-center gap-2 border border-[#30343f] bg-[#14171c] px-8 py-4 font-mono font-bold text-white hover:bg-[#1e2229] transition-colors"
            >
              LIHAT FITUR
            </a>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          id="features"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}
          className="mt-40 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <FeatureCard 
            icon={<Shield className="h-8 w-8 text-[#00f0ff]" />}
            title="SINKRONISASI AKTIF"
            desc="Kalkulasi presisi tingkat detik. Resin game Anda diprediksi secara lokal tanpa polling server konstan."
          />
          <FeatureCard 
            icon={<Bell className="h-8 w-8 text-[#ffcc00]" />}
            title="PERINGATAN DINI"
            desc="Sistem push notification aktif. Peringatan akan dikirimkan saat resin mencapai 80%, 90%, dan 100%."
          />
          <FeatureCard 
            icon={<LineChart className="h-8 w-8 text-[#ec4899]" />}
            title="ANALISIS DATA"
            desc="Rekam jejak historis penggunaan resin Anda dalam bentuk grafik terukur selama 7 hari terakhir."
          />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1e2229] bg-[#0b0c10] py-8 text-center font-mono text-sm text-[#4a4e58]">
        <p>Gacha Tracker Terminal v1.0.0 // All rights reserved.</p>
      </footer>
      
      {/* Utility styling block for Arknights clip-path */}
      <style>{`
        .clip-angled {
          clip-path: polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%);
        }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group relative border border-[#1e2229] bg-[#14171c] p-8 transition-colors hover:border-[#ffcc00]/50 hover:bg-[#1a1d24]">
      <div className="absolute top-0 right-0 w-8 h-8 bg-[#ffcc00]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-1.5 h-1.5 bg-[#ffcc00]" />
      </div>
      <div className="mb-6 inline-block bg-[#0b0c10] p-3 border border-[#1e2229]">
        {icon}
      </div>
      <h3 className="mb-3 font-mono text-lg font-bold tracking-wide text-white">{title}</h3>
      <p className="text-sm text-[#878a8f] leading-relaxed">{desc}</p>
    </div>
  )
}
