import { LawDetail } from '@/components/laws/LawDetail'

// Required for static export - generate all 17 law pages at build time
export function generateStaticParams() {
  return Array.from({ length: 17 }, (_, i) => ({
    id: String(i + 1),
  }))
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LawDetailPage({ params }: PageProps) {
  const { id } = await params
  const lawId = Number(id)

  return <LawDetail lawId={lawId} />
}
