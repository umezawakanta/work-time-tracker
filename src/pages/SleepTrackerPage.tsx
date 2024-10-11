import SleepTracker from '@/components/SleepTracker'

export default function SleepTrackerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">睡眠トラッカー</h1>
      <SleepTracker />
    </div>
  )
}