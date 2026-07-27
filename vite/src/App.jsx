// frontend-template/vite/src/App.jsx
import { RouterProvider } from 'react-router-dom';
import { useAuth } from 'contexts/auth/AuthContext';

// project imports
import NavigationScroll from 'layout/NavigationScroll';
import ThemeCustomization from 'themes';
import router from 'routes';
import { GlobalFilterProvider } from 'contexts/filters/GlobalFilterContext';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <ThemeCustomization>
      <GlobalFilterProvider>
        <NavigationScroll>
          <RouterProvider router={router} />
        </NavigationScroll>
      </GlobalFilterProvider>
    </ThemeCustomization>
  );
}