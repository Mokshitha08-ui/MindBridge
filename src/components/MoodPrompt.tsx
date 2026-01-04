'use client'
import { useState, useEffect } from 'react'
import { Smile, Meh, Frown } from 'lucide-react'
import styles from './MoodPrompt.module.css'

export default function MoodPrompt() {
    const [mood, setMood] = useState<{ value: string } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/mood').then(r => r.json()).then(d => {
            setMood(d.mood)
            setLoading(false)
        })
    }, [])

    const handleMood = async (value: string) => {
        // Optimistic update
        const previous = mood
        setMood({ ...mood, value })

        try {
            const res = await fetch('/api/mood', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value }),
            })
            const data = await res.json()
            setMood(data)
        } catch (e) {
            setMood(previous)
            console.error(e)
        }
    }

    if (loading) return <div className={styles.card}>Loading...</div>

    return (
        <div className={styles.card}>
            <h3 className={styles.title}>
                {mood ? "You've logged your mood today" : "How are you feeling today?"}
            </h3>
            <div className={styles.options}>
                <button
                    className={`${styles.option} ${mood?.value === 'GOOD' ? styles.selected : ''}`}
                    onClick={() => handleMood('GOOD')}
                >
                    <span className={styles.moodEmoji}>😊</span>
                    <div className={styles.moodLabel}>Good Day</div>
                    <div className={styles.moodDesc}>I feel energized and happy</div>
                </button>
                <button
                    className={`${styles.option} ${mood?.value === 'NEUTRAL' ? styles.selected : ''}`}
                    onClick={() => handleMood('NEUTRAL')}
                >
                    <span className={styles.moodEmoji}>😐</span>
                    <div className={styles.moodLabel}>Neutral Day</div>
                    <div className={styles.moodDesc}>Just a normal day</div>
                </button>
                <button
                    className={`${styles.option} ${mood?.value === 'BAD' ? styles.selected : ''}`}
                    onClick={() => handleMood('BAD')}
                >
                    <span className={styles.moodEmoji}>😔</span>
                    <div className={styles.moodLabel}>Bad Day</div>
                    <div className={styles.moodDesc}>Feeling down or anxious</div>
                </button>
            </div>
        </div>
    )
}
