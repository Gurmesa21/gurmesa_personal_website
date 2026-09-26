import Link from 'next/link';
import { getPublicProjects } from '@/server/services/projectService';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Work & Portfolio | Gurmesa',
  description: 'A selection of recent projects and case studies.',
};

// Next 15 Server Component with search params
export default async function WorkPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  let projects = await getPublicProjects();

  // Simple server-side filter for technology/tag if requested
  const tagFilter = typeof resolvedParams.tag === 'string' ? resolvedParams.tag : null;
  if (tagFilter) {
    projects = projects.filter(p => p.technologies.some(t => t.slug === tagFilter));
  }

  // Get all unique tags for the filter bar
  const allTags = Array.from(new Set(
    projects.flatMap(p => p.technologies.map(t => t.slug))
  )).sort();

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold">Selected Work</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Dive into detailed case studies explaining how we solved complex problems, 
          the architecture we used, and the outcomes we achieved.
        </p>
      </section>

      {/* Basic Filter Bar */}
      {allTags.length > 0 && (
        <section className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-semibold mr-2">Filter by Tech:</span>
          <Button variant={!tagFilter ? "default" : "outline"} size="sm" asChild>
            <Link href="/work">All</Link>
          </Button>
          {allTags.map(tag => (
            <Button key={tag} variant={tagFilter === tag ? "default" : "outline"} size="sm" asChild>
              <Link href={`/work?tag=${tag}`}>{tag}</Link>
            </Button>
          ))}
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map(project => (
          <Card key={project.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">{project.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {project.technologies.slice(0, 3).map(tech => (
                  <Badge key={tech.id} variant="secondary" className="text-xs">{tech.name}</Badge>
                ))}
                {project.technologies.length > 3 && (
                  <Badge variant="outline" className="text-xs">+{project.technologies.length - 3}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <p className="text-muted-foreground">{project.summary}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/work/${project.slug}`}>Read Case Study</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No case studies found matching the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
