'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import styles from './dashboard.module.css'
import { Plus, Book, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import MoodPrompt from '@/components/MoodPrompt'

export default function DashboardPage() {
    const { user } = useAuth()
    const [updates, setUpdates] = useState<any[]>([])
    const [journalEntries, setJournalEntries] = useState<any[]>([])
    const [recommended, setRecommended] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [upRes, joRes, reRes] = await Promise.all([
                    fetch('/api/dashboard/updates'),
                    fetch('/api/dashboard/journal'),
                    fetch('/api/dashboard/recommended')
                ])

                if (upRes.ok) {
                    const data = await upRes.json()
                    setUpdates(data.posts || [])
                }
                if (joRes.ok) {
                    const data = await joRes.json()
                    setJournalEntries(data.entries || [])
                }
                if (reRes.ok) {
                    const data = await reRes.json()
                    setRecommended(data.circles || [])
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (!user) return null

    return (
        <div className={styles.container}>
            <header className={styles.sanctuaryHeader}>
                <div>
                    <h3>Good Morning, {user.displayName || user.username}</h3>
                    <h1>How is your sanctuary today?</h1>
                </div>
                <Link href="/mood" className={styles.logBtn}>Log Reflection</Link>
            </header>

            <MoodPrompt />

            <div className={styles.contentGrid}>
                <section className={styles.mainFeed}>
                    <h2 className={styles.sectionTitle}>Updates from Your Circles</h2>
                    <div className={styles.updatesList}>
                        {updates.map(update => (
                            <div key={update.id} className={styles.updateCard}>
                                <div className={styles.updateHeader}>
                                    <span className={styles.circleName}>{update.circle.title}</span>
                                    <span className={styles.updateDate}>{format(new Date(update.createdAt), 'M/d/yyyy')}</span>
                                </div>
                                <p className={styles.updateContent}>{update.content}</p>
                                <Link href={`/circles/${update.circle.id}`} className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: '1px solid var(--border)' }}>
                                    View Discussion
                                </Link>
                            </div>
                        ))}
                        {updates.length === 0 && !loading && (
                            <div className={styles.updateCard}>
                                <p>No updates from your circles yet. Join more circles to see what's happening!</p>
                            </div>
                        )}
                    </div>
                </section>

                <aside className={styles.sidebarColumn}>
                    <div className={styles.miniCard}>
                        <div className={styles.miniCardHeader}>
                            <h3 className={styles.miniCardTitle}>Quick Access Journal</h3>
                            <Link href="/journal" className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                <Plus size={14} /> New
                            </Link>
                        </div>
                        <div className={styles.journalList}>
                            {journalEntries.map(entry => (
                                <Link key={entry.id} href={`/journal/edit/${entry.id}`} className={styles.journalItem}>
                                    <div className={styles.journalIcon}><Book size={16} /></div>
                                    <div className={styles.journalInfo}>
                                        <h4>{entry.title}</h4>
                                        <p>Last edited: {format(new Date(entry.date), 'M/d/yyyy')}</p>
                                    </div>
                                </Link>
                            ))}
                            {journalEntries.length === 0 && !loading && (
                                <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>No entries yet.</p>
                            )}
                        </div>
                    </div>

                    <div className={styles.miniCard}>
                        <h3 className={styles.miniCardTitle} style={{ marginBottom: '1.25rem' }}>Recommended for You</h3>
                        <div className={styles.recList}>
                            {recommended.map(circle => (
                                <div key={circle.id} className={styles.recItem}>
                                    <div className={styles.recInfo}>
                                        <h4>{circle.title}</h4>
                                        <p>{circle.tags || 'General'}</p>
                                    </div>
                                    <Link href={`/circles/${circle.id}`} className="btn btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
                                        Join
                                    </Link>
                                </div>
                            ))}
                            {recommended.length === 0 && !loading && (
                                <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>No new public circles yet.</p>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}
