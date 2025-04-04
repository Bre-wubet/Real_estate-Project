import { Link } from 'react-router-dom';
import { Box } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn, Email, Phone, LocationOn } from '@mui/icons-material';

const Footer = () => {
  return (
    <footer className="bg-primary-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">RaeLestate</h3>
            <p className="text-primary-100">Your trusted partner in finding the perfect home.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary-100 hover:text-white transition-colors">
                <Facebook />
              </a>
              <a href="#" className="text-primary-100 hover:text-white transition-colors">
                <Twitter />
              </a>
              <a href="#" className="text-primary-100 hover:text-white transition-colors">
                <Instagram />
              </a>
              <a href="#" className="text-primary-100 hover:text-white transition-colors">
                <LinkedIn />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/properties" className="text-primary-100 hover:text-white transition-colors">
                  Properties
                </Link>
              </li>
              <li>
                <Link to="/properties/add" className="text-primary-100 hover:text-white transition-colors">
                  List Property
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-primary-100 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-primary-100 hover:text-white transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-primary-100">
                <Email fontSize="small" />
                <span>contact@raelestate.com</span>
              </li>
              <li className="flex items-center space-x-2 text-primary-100">
                <Phone fontSize="small" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2 text-primary-100">
                <LocationOn fontSize="small" />
                <span>123 Real Estate Ave, City, State 12345</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Newsletter</h3>
            <p className="text-primary-100">Subscribe to our newsletter for updates and exclusive offers.</p>
            <form className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-primary-700 text-white placeholder-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-700 text-center text-primary-100">
          <p>&copy; {new Date().getFullYear()} RaeLestate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;