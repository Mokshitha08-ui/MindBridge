'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Smile, Book, User, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import styles from './Sidebar.module.css'

export default function Sidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()

    const links = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/mood', label: 'Mood History', icon: Smile },
        { href: '/circles', label: 'Circles', icon: Users },
        { href: '/journal', label: 'Journal', icon: Book },
        { href: '/profile', label: 'Profile', icon: User },
    ]

    return (
        <div className={styles.container}>
            <div className={styles.logo}>
                <Users size={28} />
                MindBridge
            </div>

            <nav className={styles.nav}>
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname.startsWith(link.href)
                    // Exact match for dashboard to avoid active state on other paths locally
                    const activeClass = isActive ? styles.active : ''

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.link} ${activeClass}`}
                        >
                            <Icon size={20} />
                            {link.label}
                        </Link>
                    )
                })}
            </nav>

            <div className={styles.footer}>
                {user && (
                    <Link href="/profile" className={styles.user}>
                        <div className={styles.avatar} style={{ backgroundImage: user.avatarUrl ? `url(${user.avatarUrl})` : undefined }} />
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{user.displayName || user.username}</span>
                            <span className={styles.userEmail}>{user.email}</span>
                        </div>
                    </Link>
                )}
                <button onClick={logout} className={styles.link} style={{ width: '100%' }}>
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
