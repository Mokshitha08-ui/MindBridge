'use client'
import { useState, useEffect } from 'react'
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay
} from 'date-fns'
import styles from './mood.module.css'

export default function MoodPage() {
    const [history, setHistory] = useState<{ id: string; date: string; value: string }[]>([])
    const [currentDate] = useState(new Date())
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/mood/list')
            .then(r => r.json())
            .then(d => {
                setHistory(d.entries || [])
                setLoading(false)
            })
    }, [])

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    })

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Mood History</h1>
                <span className={styles.monthLabel}>{format(currentDate, 'MMMM yyyy')}</span>
            </header>

            <div className={styles.calendar}>
                <div className={styles.daysGrid}>
                    {dayLabels.map(label => (
                        <div key={label} className={styles.dayLabel}>{label}</div>
                    ))}
                </div>

                <div className={styles.grid}>
                    {calendarDays.map((day, idx) => {
                        const dayMoods = history.filter(entry => isSameDay(new Date(entry.date), day))
                        const primaryMood = dayMoods.length > 0 ? dayMoods[0].value : null
                        const isCurrentMonth = isSameMonth(day, monthStart)

                        return (
                            <div
                                key={idx}
                                className={`${styles.cell} ${!isCurrentMonth ? styles.otherMonth : ''}`}
                            >
                                <span className={styles.dayNumber}>{format(day, 'd')}</span>
                                {primaryMood && (
                                    <div className={`${styles.moodIndicator} ${styles['mood' + primaryMood]}`} />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {loading && <p style={{ marginTop: '1rem', textAlign: 'center' }}>Loading your reflections...</p>}
        </div>
    )
}
