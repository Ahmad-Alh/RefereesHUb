import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://refereeshub.com'

  // Static public routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/videos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/quizzes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]

  // Dynamic published video routes
  let videoRoutes: MetadataRoute.Sitemap = []
  try {
    const videos = await prisma.video.findMany({
      where: { isPublished: true },
      select: { id: true, updatedAt: true },
    })
    videoRoutes = videos.map((v) => ({
      url: `${baseUrl}/videos/${v.id}`,
      lastModified: v.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {
    // DB might not be available at build time — silently skip
  }

  // Law pages (static 1-17)
  const lawRoutes: MetadataRoute.Sitemap = Array.from({ length: 17 }, (_, i) => ({
    url: `${baseUrl}/law/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // NOTE: /admin is intentionally excluded from sitemap
  return [...staticRoutes, ...videoRoutes, ...lawRoutes]
}
