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
      
      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/admin/login' });
        }}
      >
        <button type="submit" style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
          Logout
        </button>
      </form>
    </div>
  );
}
