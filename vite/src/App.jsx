// frontend-template/vite/src/App.jsx
import { RouterProvider } from 'react-router-dom';
import { useAuth } from 'contexts/auth/AuthContext';

// project imports
import NavigationScroll from 'layout/NavigationScroll';
import ThemeCustomization from 'themes';
import router from 'routes';

export default function App() {
  const { loading } = useAuth();

  // Block rendering of the router until auth state is fully loaded
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <ThemeCustomization>
      <NavigationScroll>
        <RouterProvider router={router} />
      </NavigationScroll>
    </ThemeCustomization>
  );
}
