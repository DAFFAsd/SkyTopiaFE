// app/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {  
  FaBolt, 
  FaShieldAlt, 
  FaUsers,
  FaChild,
  FaMoneyBillWave,
  FaRobot,
  FaDatabase,
  FaTools,
  FaClipboardCheck,
  FaComments,
  FaPhone,
  FaEnvelope,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import styles from './page.module.css';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Smooth scroll handler for anchor links
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    closeMobileMenu();
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.landingPage}>
      {/* Header/Navbar */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.logo}>
            <Image 
              src="/skytopia-logo.svg" 
              alt="SkyTopia Logo" 
              width={140} 
              height={40}
              priority
            />
          </div>
          
          {/* Desktop Navigation */}
          <nav className={styles.nav}>
            <a 
              href="#mengapa" 
              className={styles.navLink}
              onClick={(e) => handleAnchorClick(e, '#mengapa')}
            >
              Mengapa
            </a>
            <a 
              href="#fitur" 
              className={styles.navLink}
              onClick={(e) => handleAnchorClick(e, '#fitur')}
            >
              Fitur
            </a>
            <a 
              href="#kontak" 
              className={styles.navLink}
              onClick={(e) => handleAnchorClick(e, '#kontak')}
            >
              Kontak
            </a>
            <Link href="/login" className={styles.loginButton}>
              Login
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <a 
              href="#mengapa" 
              className={styles.mobileNavLink} 
              onClick={(e) => handleAnchorClick(e, '#mengapa')}
            >
              Mengapa
            </a>
            <a 
              href="#fitur" 
              className={styles.mobileNavLink} 
              onClick={(e) => handleAnchorClick(e, '#fitur')}
            >
              Fitur
            </a>
            <a 
              href="#kontak" 
              className={styles.mobileNavLink} 
              onClick={(e) => handleAnchorClick(e, '#kontak')}
            >
              Kontak
            </a>
            <Link href="/login" className={styles.mobileLoginButton} onClick={closeMobileMenu}>
              Login
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroHeadline}>
              Kelola Daycare Anda dengan Cerdas & Ceria!
            </h1>
            <p className={styles.heroSubheadline}>
              SkyTopia adalah solusi lengkap untuk mengelola daycare Anda. 
              Dari manajemen anak, pembayaran, hingga komunikasi dengan orang tua—
              semua dalam satu platform yang mudah digunakan.
            </p>
            <a href="#kontak" className={styles.heroCTA}>
              <FaComments className={styles.ctaIcon} />
              Kontak Kami
            </a>
          </div>
          
          <div className={styles.heroVisual}>
            {/* Toy Blocks Illustration */}
            <Image
              src="/toy-blocks.svg"
              alt="SkyTopia Toy Blocks Illustration"
              width={500}
              height={500}
              className={styles.heroImage}
              priority
            />
          </div>
        </div>
      </section>

      {/* Why SkyTopia Section */}
      <section id="mengapa" className={styles.whySection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionHeadline}>Mengapa SkyTopia?</h2>
          
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon} style={{backgroundColor: '#FACCD6'}}>
                <FaBolt />
              </div>
              <h3 className={styles.benefitTitle}>Efisiensi Maksimal</h3>
              <p className={styles.benefitDesc}>
                Hemat waktu dengan otomasi tugas administratif. 
                Fokus pada yang terpenting: merawat anak-anak.
              </p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon} style={{backgroundColor: '#B9DBF4'}}>
                <FaUsers />
              </div>
              <h3 className={styles.benefitTitle}>Komunikasi Transparan</h3>
              <p className={styles.benefitDesc}>
                Jaga orang tua tetap terhubung dengan laporan harian 
                dan update real-time tentang anak mereka.
              </p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon} style={{backgroundColor: '#FDFACF'}}>
                <FaShieldAlt />
              </div>
              <h3 className={styles.benefitTitle}>Aman & Terpercaya</h3>
              <p className={styles.benefitDesc}>
                Data terenkripsi dan sistem keamanan berlapis 
                untuk melindungi informasi sensitif daycare Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className={styles.featuresSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionHeadline}>Fitur Unggulan</h2>
          <p className={styles.featuresSubheadline}>
            Solusi lengkap untuk mengelola daycare Anda dengan fitur-fitur canggih dalam satu platform terpadu.
          </p>
          
          <div className={styles.featuresGrid}>
            {/* Manajemen Komprehensif */}
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaDatabase />
              </div>
              <h3 className={styles.featureTitle}>Manajemen Komprehensif</h3>
              <p className={styles.featureDesc}>
                Kelola data anak, guru, kurikulum, jadwal, fasilitas, dan inventaris dalam satu tempat.
              </p>
            </div>

            {/* Laporan & Absensi */}
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaClipboardCheck />
              </div>
              <h3 className={styles.featureTitle}>Laporan & Absensi</h3>
              <p className={styles.featureDesc}>
                Buat laporan harian, kelola absensi, dan catat kondisi fasilitas dengan mudah.
              </p>
            </div>

            {/* Manajemen Keuangan */}
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaMoneyBillWave />
              </div>
              <h3 className={styles.featureTitle}>Manajemen Keuangan</h3>
              <p className={styles.featureDesc}>
                Kelola pembayaran, tagihan, dan riwayat transaksi secara transparan dan terorganisir.
              </p>
            </div>

            {/* Komunikasi Efektif */}
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaRobot />
              </div>
              <h3 className={styles.featureTitle}>Komunikasi Efektif</h3>
              <p className={styles.featureDesc}>
                Chatbot AI untuk orang tua dan akses transparan ke laporan harian anak.
              </p>
            </div>

            {/* Peminjaman & Inventaris */}
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaTools />
              </div>
              <h3 className={styles.featureTitle}>Peminjaman & Inventaris</h3>
              <p className={styles.featureDesc}>
                Sistem peminjaman fasilitas dan manajemen barang inventaris yang efisien.
              </p>
            </div>

            {/* Akses Informasi */}
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <FaChild />
              </div>
              <h3 className={styles.featureTitle}>Akses Informasi</h3>
              <p className={styles.featureDesc}>
                Lihat informasi detail anak, jadwal kegiatan, dan perkembangan secara real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section id="mulai" className={styles.gettingStartedSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionHeadline}>Siap Memulai?</h2>
          
          <div className={styles.stepsGrid}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Hubungi Tim Kami</h3>
              <p className={styles.stepDesc}>
                Konsultasikan kebutuhan daycare Anda dengan tim SkyTopia.
              </p>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Demo & Setup</h3>
              <p className={styles.stepDesc}>
                Kami akan membantu setup sistem dan memberikan training lengkap.
              </p>
            </div>

            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Mulai Kelola</h3>
              <p className={styles.stepDesc}>
                Daycare Anda siap dikelola dengan efisien menggunakan SkyTopia.
              </p>
            </div>
          </div>

          <div className={styles.finalCTA}>
            <a href="#kontak" className={styles.finalCTAButton}>
              <FaComments className={styles.ctaIcon} />
              Kontak Kami
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontak" className={styles.contactSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionHeadline}>Hubungi Kami</h2>
          <p className={styles.contactSubheadline}>
            Siap mengubah manajemen daycare Anda? Tim kami siap membantu!
          </p>
          
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <div className={styles.contactIcon}>
                <FaPhone />
              </div>
              <div className={styles.contactDetails}>
                <h3 className={styles.contactLabel}>Telepon</h3>
                <a href="tel:+6281234567890" className={styles.contactLink}>
                  +62 812 3456 7890
                </a>
              </div>
            </div>

            <div className={styles.contactItem}>
              <div className={styles.contactIcon}>
                <FaEnvelope />
              </div>
              <div className={styles.contactDetails}>
                <h3 className={styles.contactLabel}>Email</h3>
                <a href="mailto:info@skytopia.com" className={styles.contactLink}>
                  info@skytopia.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <p className={styles.copyright}>
            © 2025 SkyTopia. Dibuat oleh GuardianBee dan MakaraOne. Project Rekayasa Perangkat Lunak.
          </p>
        </div>
      </footer>
    </div>
  );
}
