# Trae Real Estate Platform

A modern real estate platform built with React and Node.js, enabling users to list, search, and manage properties with features like property transactions and user authentication.

## Features

- **User Authentication**: Secure login and registration system with role-based access control
- **Property Management**: List, edit, and manage real estate properties
- **Property Search**: Advanced search functionality with filters
- **Real-time Updates**: Dynamic property status updates
- **Transaction System**: Secure property purchase and rental transactions
- **Image Management**: Multiple property image upload and management
- **Responsive Design**: Mobile-first approach with modern UI/UX

## Tech Stack

### Frontend
- React.js with Vite
- Redux for state management
- React Router for navigation
- Tailwind CSS for styling
- Material-UI components
- Stripe for payment processing

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB instance

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd Trae-raelestate
```

2. Install Backend Dependencies
```bash
cd backend
npm install
```

3. Install Frontend Dependencies
```bash
cd frontend
npm install
```

4. Environment Setup

Create `.env` files in both frontend and backend directories:

Backend `.env`:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### Running the Application

1. Start the Backend Server
```bash
cd backend
npm run dev
```

2. Start the Frontend Development Server
```bash
cd frontend
npm run dev
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Property Endpoints

- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Transaction Endpoints

- `POST /api/transactions` - Create new transaction
- `GET /api/transactions` - Get user transactions
- `GET /api/transactions/:id` - Get transaction details

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.