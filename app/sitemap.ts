import { MetadataRoute } from 'next';
import { getPublicProjects } from '@/server/services/projectService';
import { getPublicServices } from '@/server/services/serviceService';
import { getPublicPosts } from '@/server/services/blogService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const projects = await getPublicProjects();
  const services = await getPublicServices();
  const posts = await getPublicPosts();

  const projectUrls = projects.map(project => ({
    url: `${baseUrl}/work/${project.slug}`,
    lastModified: project.updatedAt,
  }));

  const serviceUrls = services.map(service => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: new Date(),
  }));

  const postUrls = posts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/work`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
    },
    ...serviceUrls,
    ...projectUrls,
    ...postUrls,
  ];
}
