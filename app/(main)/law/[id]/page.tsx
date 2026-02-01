import { LawDetail } from '@/components/laws/LawDetail'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LawDetailPage({ params }: PageProps) {
  const { id } = await params
  const lawId = Number(id)

  return <LawDetail lawId={lawId} />
}
