// frontend-template/vite/src/routes/authLoader.js
import { redirect } from 'react-router-dom';

export async function rootRedirectLoader() {
  try {
    const res = await fetch('http://localhost:8080/api/auth/me', {
      credentials: 'include'
    });

    if (res.ok) {
      // User is logged in, redirect to dashboard
      return redirect('/dashboard');
    }
  } catch (err) {
    console.error('Error fetching current user in loader', err);
  }

  // Not logged in
  return redirect('/login');
}