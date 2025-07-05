import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, Settings, DollarSign } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b p-4">
        <div className="container flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            Lawyer Management
          </Link>

          <nav className="flex items-center space-x-6 space-x-reverse">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                location.pathname === '/' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home className="h-4 w-4" />
              الرئيسية
            </Link>
            <Link
              to="/clients"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                location.pathname === '/clients' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Users className="h-4 w-4" />
              الموكلين
            </Link>
            <Link
              to="/accounting"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                location.pathname === '/accounting' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              الحسابات
            </Link>
            <Link
              to="/settings"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                location.pathname === '/settings' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-4 w-4" />
              الإعدادات
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-10 flex-grow">
        <Outlet />
      </main>

      <footer className="bg-gray-100 border-t p-4 text-center text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} Lawyer Management. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Layout;
