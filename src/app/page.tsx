import Link from 'next/link'
import styles from './page.module.css'

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.logo}>MindBridge</div>
        <div className={styles.navLinks}>
          <Link href="/login" className="btn btn-ghost">Login</Link>
          <Link href="/register" className="btn btn-primary">Join Now</Link>
        </div>
      </nav>

      <main className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Bridges for the Mind,<br />
            <span>Circles of Support.</span>
          </h1>
          <p className={styles.subtitle}>
            A safe sanctuary for your mental wellbeing. Connect with supportive circles, 
            track your journey, and find your calm in the chaos.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/dashboard" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
              Enter Your Sanctuary
            </Link>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} MindBridge. Built with care for your peace of mind.</p>
      </footer>
    </div>
  )
}
