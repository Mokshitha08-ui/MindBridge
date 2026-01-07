'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Lock, Globe, Users } from 'lucide-react'
import styles from './journal.module.css'
import { format } from 'date-fns'

export default function JournalPage() {
    const [journals, setJournals] = useState<{ id: string; title: string; content: string; date: string; isPrivate: boolean }[]>([])

    useEffect(() => {
        fetch('/api/journal').then(r => r.json()).then(d => setJournals(d.journals))
    }, [])

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>My Journal</h1>
                <Link href="/journal/create" className="btn btn-primary">
                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> New Entry
                </Link>
            </div>

            <div className={styles.grid}>
                {journals.map(entry => (
                    <Link href={`/journal/edit/${entry.id}`} key={entry.id} className={styles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 className={styles.cardTitle}>{entry.title}</h3>
                            <span className={`${styles.badge} ${entry.isPrivate ? styles.private : styles.shared}`}>
                                {entry.isPrivate ? 'PRIVATE' : 'SHARED'}
                            </span>
                        </div>
                        <div className={styles.cardDate}>
                            {format(new Date(entry.date), 'M/d/yyyy hh:mm a')}
                            {!entry.isPrivate && (
                                <div className={styles.shareIndicator}>
                                    <Users size={12} /> In Circle
                                </div>
                            )}
                        </div>
                        <p className={styles.preview}>{entry.content}</p>
                    </Link>
                ))}
                {journals.length === 0 && <p style={{ color: 'var(--muted-foreground)' }}>No entries yet. Start writing your thoughts.</p>}
            </div>
        </div>
    )
}
