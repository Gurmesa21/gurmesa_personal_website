import Link from 'next/link';
import { auth, signOut } from '../../../auth';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const session = await auth();

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Admin Dashboard</h1>
      <p>Logged in as {session.user?.email}</p>
      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Link href="/admin/projects" style={{ color: 'blue', textDecoration: 'underline' }}>Manage Projects & Case Studies</Link>
        <Link href="/admin/technologies" style={{ color: 'blue', textDecoration: 'underline' }}>Manage Technologies</Link>
        <Link href="/admin/blog" style={{ color: 'blue', textDecoration: 'underline' }}>Manage Blog Posts</Link>
        <Link href="/admin/services" style={{ color: 'blue', textDecoration: 'underline' }}>Manage Services</Link>
        <Link href="/admin/testimonials" style={{ color: 'blue', textDecoration: 'underline' }}>Manage Testimonials</Link>
        <Link href="/admin/inquiries" style={{ color: 'blue', textDecoration: 'underline' }}>Manage Inquiries</Link>
      </div>

      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/admin/login' });
        }}
      >
        <button type="submit" style={{ padding: '0.5rem 1rem', marginTop: '2rem' }}>
          Logout
        </button>
      </form>
    </div>
  );
}
