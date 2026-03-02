'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, X, Plus } from 'lucide-react'

interface VideoFormData {
  titleAr: string
  titleEn: string
  descriptionAr: string
  url: string
  thumbnailUrl: string
  lawIds: number[]
  difficulty: string
  position: string
  isControversial: boolean
  isPublished: boolean
  tags: string[]
}

const INITIAL: VideoFormData = {
  titleAr: '',
  titleEn: '',
  descriptionAr: '',
  url: '',
  thumbnailUrl: '',
  lawIds: [],
  difficulty: 'BEGINNER',
  position: 'ALL',
  isControversial: false,
  isPublished: true,
  tags: [],
}

const PRESET_TAGS = ['handball', 'offside', 'AR', 'CAR', 'DOGSO', 'SPA', 'foul', 'restart', 'penalty']

const difficultyOptions = [
  { value: 'BEGINNER', label: 'مبتدئ' },
  { value: 'INTERMEDIATE', label: 'متوسط' },
  { value: 'ADVANCED', label: 'متقدم' },
]

const positionOptions = [
  { value: 'ALL', label: 'الكل' },
  { value: 'CENTER_REF', label: 'حكم وسط' },
  { value: 'ASSISTANT_REF', label: 'حكم مساعد' },
  { value: 'FOURTH_OFFICIAL', label: 'الحكم الرابع' },
]

interface VideoFormProps {
  initial?: Partial<VideoFormData>
  videoId?: string
}

export default function VideoForm({ initial, videoId }: VideoFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<VideoFormData>({ ...INITIAL, ...initial })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof VideoFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const toggleLaw = (id: number) => {
    set(
      'lawIds',
      form.lawIds.includes(id)
        ? form.lawIds.filter((l) => l !== id)
        : [...form.lawIds, id]
    )
  }

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase()
    if (t && !form.tags.includes(t)) {
      set('tags', [...form.tags, t])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    set('tags', form.tags.filter((t) => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titleAr.trim()) {
      setError('العنوان مطلوب')
      return
    }
    if (!videoFile && !form.url.trim()) {
      setError('أدخل رابط الفيديو أو ارفع ملف فيديو')
      return
    }

    setError('')
    setSaving(true)

    try {
      const url = videoId ? `/api/admin/videos/${videoId}` : '/api/admin/videos'
      const method = videoId ? 'PUT' : 'POST'

      const body = new FormData()
      body.set('titleAr', form.titleAr)
      body.set('titleEn', form.titleEn)
      body.set('descriptionAr', form.descriptionAr)
      body.set('url', form.url)
      body.set('thumbnailUrl', form.thumbnailUrl)
      body.set('difficulty', form.difficulty)
      body.set('position', form.position)
      body.set('isControversial', String(form.isControversial))
      body.set('isPublished', String(form.isPublished))
      body.set('tags', JSON.stringify(form.tags))
      body.set('lawIds', JSON.stringify(form.lawIds))

      if (videoFile) {
        body.set('file', videoFile)
      }

      const res = await fetch(url, {
        method,
        body,
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'حدث خطأ أثناء الحفظ')
        return
      }

      router.push('/admin/videos')
      router.refresh()
    } catch {
      setError('حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-200 pb-2">
          معلومات الفيديو
        </h2>

        <Field label="العنوان بالعربية *">
          <input
            type="text"
            value={form.titleAr}
            onChange={(e) => set('titleAr', e.target.value)}
            className={inputClass}
            placeholder="مثال: موقف تسلل معقد"
            required
          />
        </Field>

        <Field label="العنوان بالإنجليزية">
          <input
            type="text"
            value={form.titleEn}
            onChange={(e) => set('titleEn', e.target.value)}
            className={inputClass}
            placeholder="e.g. Complex Offside Situation"
            dir="ltr"
          />
        </Field>

        <Field label="الشرح والوصف">
          <textarea
            value={form.descriptionAr}
            onChange={(e) => set('descriptionAr', e.target.value)}
            className={`${inputClass} h-28 resize-none`}
            placeholder="اكتب شرحاً تفصيلياً للموقف..."
          />
        </Field>
      </div>

      <div className="space-y-4">
        <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-200 pb-2">
          مصدر الفيديو
        </h2>

        <Field label="رابط الفيديو (اختياري إذا تم رفع ملف)">
          <input
            type="url"
            value={form.url}
            onChange={(e) => set('url', e.target.value)}
            className={inputClass}
            placeholder="https://www.youtube.com/watch?v=..."
            dir="ltr"
          />
        </Field>

        <Field label="أو ارفع ملف فيديو (اختياري)">
          <label className="block rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-green-400 transition-colors cursor-pointer p-4">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
            <div className="text-sm text-gray-700 text-center">
              {videoFile ? (
                <>
                  <p className="font-medium text-gray-900">{videoFile.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <p className="font-medium">اختر ملف فيديو</p>
                  <p className="text-xs text-gray-600 mt-1">MP4 / MOV / WebM</p>
                </>
              )}
            </div>
          </label>
        </Field>

        <Field label="رابط الصورة المصغرة (اختياري)">
          <input
            type="url"
            value={form.thumbnailUrl}
            onChange={(e) => set('thumbnailUrl', e.target.value)}
            className={inputClass}
            placeholder="https://..."
            dir="ltr"
          />
        </Field>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-200 pb-2">
          القوانين المرتبطة (1-17)
        </h2>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 17 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => toggleLaw(n)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                form.lawIds.includes(n)
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-200 pb-2">
          التصنيفات والوسوم
        </h2>

        <div className="flex flex-wrap gap-2">
          {PRESET_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                form.tags.includes(tag)
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag(tagInput)
              }
            }}
            className={`${inputClass} flex-1`}
            placeholder="وسم مخصص..."
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => addTag(tagInput)}
            className="px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 text-xs rounded-full"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-200 pb-2">
          الإعدادات
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <Field label="مستوى الصعوبة">
            <select
              value={form.difficulty}
              onChange={(e) => set('difficulty', e.target.value)}
              className={inputClass}
            >
              {difficultyOptions.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>

          <Field label="المنصب">
            <select
              value={form.position}
              onChange={(e) => set('position', e.target.value)}
              className={inputClass}
            >
              {positionOptions.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isControversial}
              onChange={(e) => set('isControversial', e.target.checked)}
              className="w-4 h-4 accent-green-500"
            />
            <span className="text-sm text-gray-700">موقف خلافي</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => set('isPublished', e.target.checked)}
              className="w-4 h-4 accent-green-500"
            />
            <span className="text-sm text-gray-700">نشر الفيديو (ظاهر للجمهور)</span>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'جاري الحفظ...' : videoId ? 'حفظ التغييرات' : 'إضافة الفيديو'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/videos')}
          className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full bg-white border border-gray-300 text-gray-900 px-3 py-2.5 rounded-lg text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border file:border-gray-300 file:bg-gray-50 file:text-gray-700'
