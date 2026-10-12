import { getAdminProjects } from '@/server/services/projectService';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { deleteProjectAction } from './actions';

export default async function AdminProjectsPage() {
  const projects = await getAdminProjects();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Projects & Case Studies</h1>
        <Button asChild>
          <Link href="/admin/projects/new">Add Project</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id} data-testid="admin-row">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
                <Badge variant={project.confidentiality === 'PRIVATE' ? 'destructive' : 'outline'}>
                  {project.confidentiality}
                </Badge>
                {project.caseStudy && (
                  <Badge variant={project.caseStudy.status === 'PUBLISHED' ? 'default' : 'secondary'} className="bg-blue-600">
                    Case Study {project.caseStudy.status}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/projects/${project.id}/edit`} data-testid="edit-link">Edit / Case Study</Link>
                </Button>
                <form action={deleteProjectAction.bind(null, project.id)}>
                  <Button variant="destructive" size="sm" type="submit">Delete</Button>
                </form>
              </div>
            </CardHeader>
            <CardContent className="py-0 pb-4 text-sm text-muted-foreground flex justify-between">
              <div>
                <p>{project.summary}</p>
                {project.clientRef && <p className="text-xs text-red-500 mt-1">Client: {project.clientRef}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
        {projects.length === 0 && (
          <p className="text-muted-foreground">No projects found. Create one to get started.</p>
        )}
      </div>
    </div>
  );
}
