import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, Home as HomeIcon } from '@mui/icons-material';
import { logout } from '../../redux/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    handleCloseUserMenu();
  };

  const navigationLinks = [
    { title: 'Properties', path: '/properties' },
    ...(isAuthenticated && user?.role === 'seller'
      ? [{ title: 'Add Property', path: '/properties/add' }]
      : []),
    ...(isAuthenticated
      ? [{ title: 'My Transactions', path: '/transactions' }]
      : [])
  ];

  const userMenuItems = isAuthenticated
    ? [
        { title: 'Dashboard', path: '/dashboard' },
        { title: 'Profile', path: '/profile' },
        { title: 'Logout', onClick: handleLogout }
      ]
    : [
        { title: 'Login', path: '/login' },
        { title: 'Register', path: '/register' }
      ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Desktop Logo */}
          <div className="flex-shrink-0 flex items-center">
            <HomeIcon className="hidden md:block h-8 w-8 text-primary-600" />
            <RouterLink to="/" className="hidden md:block ml-2 text-xl font-bold text-gray-800">
              Real Estate
            </RouterLink>
          </div>

          {/* Mobile Navigation Menu */}
          <div className="flex md:hidden">
            <button
              onClick={handleOpenNavMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            {anchorElNav && (
              <div className="absolute top-16 left-0 w-full bg-white shadow-lg py-1">
                {navigationLinks.map((link) => (
                  <RouterLink
                    key={link.path}
                    to={link.path}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleCloseNavMenu}
                  >
                    {link.title}
                  </RouterLink>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Logo */}
          <div className="flex items-center md:hidden">
            <HomeIcon className="h-8 w-8 text-primary-600" />
            <RouterLink to="/" className="ml-2 text-xl font-bold text-gray-800">
              Real Estate
            </RouterLink>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-4">
            {navigationLinks.map((link) => (
              <RouterLink
                key={link.path}
                to={link.path}
                className="nav-link"
                onClick={handleCloseNavMenu}
              >
                {link.title}
              </RouterLink>
            ))}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={handleOpenUserMenu}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <img
                className="h-8 w-8 rounded-full"
                src={user?.profileImage || '/default-avatar.png'}
                alt={user?.name || 'User'}
              />
            </button>
            {anchorElUser && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                {userMenuItems.map((item) => (
                  <button
                    key={item.title}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      } else {
                        navigate(item.path);
                        handleCloseUserMenu();
                      }
                    }}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;