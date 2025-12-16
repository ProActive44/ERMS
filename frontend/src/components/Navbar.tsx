import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logoutUser } from '../store/authSlice';
import { Home, Users, LogOut, Menu, X, FolderKanban, Calendar, FileText, Sparkles, User, ChevronDown } from 'lucide-react';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/employees', label: 'Employees', icon: Users },
    { path: '/attendance', label: 'Attendance', icon: Calendar },
    { path: '/leaves', label: 'Leaves', icon: FileText },
    { path: '/projects', label: 'Projects', icon: FolderKanban },
    { path: '/tasks', label: 'Tasks', icon: FolderKanban },
    { path: '/reports', label: 'Reports', icon: FileText },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-lg border-gray-200/50' 
        : 'bg-white/80 backdrop-blur-md shadow-sm border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-[72px] relative">
          {/* Logo/Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/dashboard" className="flex items-center group focus:outline-none focus:ring-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500 rounded-2xl blur-md opacity-60 group-hover:opacity-90 transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-600 text-white font-extrabold text-2xl px-6 py-3 rounded-2xl shadow-lg transform group-hover:scale-105 group-hover:shadow-xl transition-all duration-500 flex items-center space-x-2.5">
                  <Sparkles size={24} className="animate-pulse text-yellow-300" />
                  <span className="tracking-wider">ERMS</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2 flex-1 justify-center px-8">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`group relative flex items-center space-x-2.5 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-0 ${
                  isActive(path)
                    ? 'text-white shadow-md'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                {isActive(path) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-600 rounded-xl shadow-lg animate-fade-in"></div>
                )}
                <div className="relative flex items-center space-x-2.5">
                  <Icon size={20} className={`${
                    isActive(path) 
                      ? 'text-white drop-shadow-sm' 
                      : 'text-gray-500 group-hover:text-primary-600 group-hover:scale-110 transition-all'
                  }`} />
                  <span className="text-[15px]">{label}</span>
                </div>
                {isActive(path) && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-white to-transparent rounded-full animate-pulse"></div>
                )}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
            {user && (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-0 group"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full blur-sm opacity-50"></div>
                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 via-purple-500 to-secondary-500 flex items-center justify-center text-white font-bold shadow-md text-sm ring-2 ring-white">
                      {user.firstName[0].toUpperCase()}{user.lastName[0].toUpperCase()}
                    </div>
                  </div>
                  <ChevronDown size={18} className={`text-gray-500 transition-transform duration-300 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-scale-in z-50">
                    {/* User Info Header */}
                    <div className="px-5 py-4 bg-gradient-to-r from-primary-50 via-purple-50 to-secondary-50 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full blur-sm opacity-50"></div>
                          <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 via-purple-500 to-secondary-500 flex items-center justify-center text-white font-bold shadow-md text-base ring-2 ring-white">
                            {user.firstName[0].toUpperCase()}{user.lastName[0].toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 leading-tight">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-primary-600 capitalize font-semibold tracking-wide mt-0.5">{user.role}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate('/profile');
                        }}
                        className="w-full flex items-center space-x-3 px-5 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 hover:text-primary-700 transition-all duration-200 focus:outline-none focus:ring-0 group"
                      >
                        <User size={20} className="text-gray-500 group-hover:text-primary-600 transition-colors" />
                        <span className="font-semibold text-[15px]">My Profile</span>
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center space-x-3 px-5 py-3 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 focus:outline-none focus:ring-0 group"
                      >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                        <span className="font-semibold text-[15px]">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden ml-auto">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 hover:text-primary-600 transition-all duration-300 focus:outline-none focus:ring-0 shadow-sm hover:shadow-md border border-transparent hover:border-primary-200"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl animate-slide-down shadow-xl">
          <div className="px-3 pt-3 pb-4 space-y-2">
            {navLinks.map(({ path, label, icon: Icon }, index) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-5 py-3.5 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-0 ${
                  isActive(path)
                    ? 'bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-primary-600'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Icon size={22} className={isActive(path) ? 'text-white' : 'text-gray-500'} />
                <span className="text-[15px]">{label}</span>
              </Link>
            ))}
          </div>
          {user && (
            <div className="border-t border-gray-200/50 bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50">
              {/* User Info Header */}
              <div className="px-4 py-4 flex items-center space-x-3 border-b border-gray-200/50">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full blur-sm opacity-50"></div>
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 via-purple-500 to-secondary-500 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-primary-600 capitalize font-semibold tracking-wide">{user.role}</p>
                </div>
              </div>
              
              {/* Profile & Logout Options */}
              <div className="px-3 py-3 space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-white hover:text-primary-600 transition-all duration-300 focus:outline-none focus:ring-0"
                >
                  <User size={20} className="text-gray-500" />
                  <span className="text-[15px]">My Profile</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 focus:outline-none focus:ring-0"
                >
                  <LogOut size={20} />
                  <span className="text-[15px]">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
