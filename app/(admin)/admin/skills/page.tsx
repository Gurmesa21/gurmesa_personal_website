import { skillRepository } from '@/server/repositories/skillRepository';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { deleteAction, moveAction } from './actions';

export default async function AdminSkillPage() {
  const items = await skillRepository.findMany({ orderBy: { order: 'asc' } });
  
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Skills</h1>
        <Button asChild><Link href="/admin/skills/new">Add Skill</Link></Button>
      </div>
      <div className="space-y-4">
        {items.map((item, index) => (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-xl">{(item as any).organization || (item as any).name || (item as any).platform}</CardTitle>
              <div className="flex gap-2">
                <form action={moveAction.bind(null, item.id, item.order - 1)}>
                  <Button variant="outline" size="sm" type="submit" disabled={index === 0}>Up</Button>
                </form>
                <form action={moveAction.bind(null, item.id, item.order + 1)}>
                  <Button variant="outline" size="sm" type="submit" disabled={index === items.length - 1}>Down</Button>
                </form>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/skills/${item.id}/edit`}>Edit</Link>
                </Button>
                <form action={deleteAction.bind(null, item.id)}>
                  <Button variant="destructive" size="sm" type="submit">Delete</Button>
                </form>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
