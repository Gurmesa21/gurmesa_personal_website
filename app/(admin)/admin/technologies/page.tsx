import { getAdminTechnologies } from '@/server/services/technologyService';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { deleteTechnologyAction } from './actions';

export default async function AdminTechnologiesPage() {
  const technologies = await getAdminTechnologies();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Technologies</h1>
        <Button asChild>
          <Link href="/admin/technologies/new">Add Technology</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {technologies.map((tech) => (
          <Card key={tech.id}>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <CardTitle className="text-xl">{tech.name}</CardTitle>
                <Badge variant="outline">{tech.category}</Badge>
                <span className="text-sm text-muted-foreground">{tech.slug}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/technologies/${tech.id}/edit`}>Edit</Link>
                </Button>
                <form action={deleteTechnologyAction.bind(null, tech.id)}>
                  <Button variant="destructive" size="sm" type="submit">Delete</Button>
                </form>
              </div>
            </CardHeader>
          </Card>
        ))}
        {technologies.length === 0 && (
          <p className="text-muted-foreground">No technologies found. Create one to get started.</p>
        )}
      </div>
    </div>
  );
}
