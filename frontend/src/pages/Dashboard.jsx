import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { transactions } = useSelector((state) => state.transaction);
  const { properties } = useSelector((state) => state.property);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const userProperties = properties?.filter(property =>
    user?.role === 'seller' ? property.seller === user._id : property.buyer === user._id
  ) || [];

  const userTransactions = transactions?.filter(transaction =>
    transaction.buyer === user?._id || transaction.seller === user?._id
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your {user?.role === 'seller' ? 'properties and sales' : 'saved properties and purchases'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Properties Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {user?.role === 'seller' ? 'My Listed Properties' : 'Saved Properties'}
          </h2>
          {userProperties.length > 0 ? (
            <div className="space-y-4">
              {userProperties.map(property => (
                <div
                  key={property._id}
                  className="border rounded-md p-4 hover:border-primary-500 cursor-pointer"
                  onClick={() => navigate(`/properties/${property._id}`)}
                >
                  <h3 className="font-medium text-gray-900">{property.title}</h3>
                  <p className="text-sm text-gray-500">${property.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              {user?.role === 'seller'
                ? 'You haven\'t listed any properties yet.'
                : 'You haven\'t saved any properties yet.'}
            </p>
          )}
        </div>

        {/* Transactions Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          {userTransactions.length > 0 ? (
            <div className="space-y-4">
              {userTransactions.map(transaction => (
                <div
                  key={transaction._id}
                  className="border rounded-md p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {transaction.property.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ${transaction.amount.toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No transactions found.</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-4">
            {user?.role === 'seller' && (
              <button
                onClick={() => navigate('/properties/add')}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                List New Property
              </button>
            )}
            <button
              onClick={() => navigate('/properties')}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Browse Properties
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;