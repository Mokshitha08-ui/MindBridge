'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Users, Lock, Unlock } from 'lucide-react'
import styles from './circles.module.css'

interface Circle {
    id: string
    title: string
    description: string
    tags: string
    isPrivate: boolean
    createdAt: string
    _count: {
        members: number
    }
}

export default function CirclesPage() {
    const [circles, setCircles] = useState<Circle[]>([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetch('/api/circles' + (search ? `?q=${search}` : ''))
            .then(res => res.json())
            .then(data => setCircles(data.circles))
    }, [search])

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Discover Circles</h1>
                <Link href="/circles/create" className="btn btn-primary">
                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                    Create Circle
                </Link>
            </div>

            <div className={styles.searchBar}>
                <input
                    type="text"
                    placeholder="Search for circles..."
                    className="input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className={styles.grid}>
                {circles.map(circle => (
                    <Link href={`/circles/${circle.id}`} key={circle.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>{circle.title}</h3>
                            {circle.isPrivate ? (
                                <span className={`${styles.badge} ${styles.private}`}>PRIVATE</span>
                            ) : (
                                <span className={`${styles.badge} ${styles.public}`}>PUBLIC</span>
                            )}
                        </div>

                        <p className={styles.desc}>{circle.description}</p>

                        {circle.tags && (
                            <div className={styles.tags}>
                                {circle.tags.split(',').map(tag => (
                                    <span key={tag} className={styles.tag}>#{tag.trim()}</span>
                                ))}
                            </div>
                        )}

                        <div className={styles.footer}>
                            <div className={styles.memberCount}>
                                <Users size={16} />
                                <span>{circle._count.members} Members</span>
                            </div>
                            <div className={styles.cardAction}>
                                {circle.isPrivate ? 'Request' : 'Enter'}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
