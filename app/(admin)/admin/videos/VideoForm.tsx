'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, X, Plus, Upload } from 'lucide-react'

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
  videoId?: string // if set → edit mode
}

export default function VideoForm({ initial, videoId }: VideoFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<VideoFormData>({ ...INITIAL, ...initial })
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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
      setError('ارفع ملف فيديو أو أضف رابط فيديو')
      return
    }

    setError('')
    setSaving(true)

    try {
      const endpoint = videoId ? `/api/admin/videos/${videoId}` : '/api/admin/videos'
      const method = videoId ? 'PUT' : 'POST'

      const payload = new FormData()
      payload.append('titleAr', form.titleAr)
      payload.append('titleEn', form.titleEn)
      payload.append('descriptionAr', form.descriptionAr)
      payload.append('url', form.url)
      payload.append('thumbnailUrl', form.thumbnailUrl)
      payload.append('difficulty', form.difficulty)
      payload.append('position', form.position)
      payload.append('isControversial', String(form.isControversial))
      payload.append('isPublished', String(form.isPublished))
      payload.append('tags', JSON.stringify(form.tags))
      payload.append('lawIds', JSON.stringify(form.lawIds))
      if (videoFile) payload.append('file', videoFile)

      const res = await fetch(endpoint, { method, body: payload })

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
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">معلومات الفيديو</h2>

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

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Upload className="w-4 h-4 text-green-600" />
          مصدر الفيديو
        </h2>

        <Field label="رفع ملف فيديو (مثل قسم PDF)">
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            className="w-full bg-white text-gray-700 px-4 py-2.5 rounded-lg border border-gray-300 cursor-pointer file:ml-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-green-600 file:text-white file:text-sm file:cursor-pointer"
          />
        </Field>

        <Field label="أو رابط فيديو (اختياري)">
          <input
            type="url"
            value={form.url}
            onChange={(e) => set('url', e.target.value)}
            className={inputClass}
            placeholder="https://www.youtube.com/watch?v=..."
            dir="ltr"
          />
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

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">القوانين المرتبطة (1-17)</h2>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 17 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => toggleLaw(n)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                form.lawIds.includes(n)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">التصنيفات والوسوم</h2>

        <div className="flex flex-wrap gap-2">
          {PRESET_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                form.tags.includes(tag)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full"
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

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">الإعدادات</h2>

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
  'w-full bg-white border border-gray-300 text-gray-900 px-3 py-2.5 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600'
