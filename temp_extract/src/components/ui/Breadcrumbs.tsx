import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { NAV_ITEMS } from '../../constants/navigation';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (location.pathname === '/') return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-500 mb-6 no-print" aria-label="Breadcrumb">
      <Link
        to="/"
        className="flex items-center hover:text-blue-600 transition-colors"
      >
        <Home size={16} className="mr-1" />
        <span className="font-medium">Trang chủ</span>
      </Link>

      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        
        // Find the name from NAV_ITEMS
        const navItem = NAV_ITEMS.find(item => item.path === to);
        const name = navItem ? navItem.name : value.charAt(0).toUpperCase() + value.slice(1);

        return (
          <React.Fragment key={to}>
            <ChevronRight size={14} className="text-slate-300" />
            {last ? (
              <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                {name}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-blue-600 transition-colors truncate max-w-[150px]"
              >
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
