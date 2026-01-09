// frontend-template/vite/src/routes/authLoader.js
import { redirect } from 'react-router-dom';

export function rootRedirectLoader() {
  const token = localStorage.getItem('token');

  if (token && token !== 'undefined' && token !== 'null') {
    return redirect('/dashboard/default');
  }

  return redirect('/login');
}
