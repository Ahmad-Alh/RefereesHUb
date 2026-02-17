import { laws } from '@/data/laws-2025-26'
import { LawCard } from '@/components/laws/LawCard'

export default function HomePage() {
  return (
    <div className="px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">قوانين اللعبة</h1>
        <p className="text-gray-500 text-sm">قوانين الفيفا 2025/26 — اضغط على أي قانون للتفاصيل</p>
      </header>

      <div className="space-y-2">
        {laws.map((law) => (
          <LawCard key={law.id} law={law} />
        ))}
      </div>
    </div>
  )
}
