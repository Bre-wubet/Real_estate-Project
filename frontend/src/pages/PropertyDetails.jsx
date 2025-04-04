import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import {
  LocationOn,
  BedOutlined,
  BathtubOutlined,
  SquareFootOutlined,
  LocalParking,
  Weekend,
  Favorite,
  FavoriteBorder
} from '@mui/icons-material';
import { fetchPropertyById, toggleLikeProperty } from '../redux/slices/propertySlice';
import { createTransaction } from '../redux/slices/transactionSlice';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from '../components/PaymentForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentProperty, loading, error } = useSelector((state) => state.property);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { paymentIntent } = useSelector((state) => state.transaction);

  const [transactionDialog, setTransactionDialog] = useState(false);
  const [transactionType, setTransactionType] = useState('');

  useEffect(() => {
    dispatch(fetchPropertyById(id));
  }, [dispatch, id]);

  const handleLike = () => {
    if (isAuthenticated) {
      dispatch(toggleLikeProperty(id));
    } else {
      navigate('/login');
    }
  };

  const handleTransaction = (type) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setTransactionType(type);
    setTransactionDialog(true);
  };

  const handleCreateTransaction = () => {
    dispatch(createTransaction({
      propertyId: id,
      type: transactionType,
      amount: currentProperty.price
    }));
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!currentProperty) return <Typography>Property not found</Typography>;

  const isLiked = currentProperty.likes?.includes(user?._id);
  const isSeller = user?._id === currentProperty.owner._id;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Property Images */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={currentProperty.images[0]}
              alt={currentProperty.title}
            />
          </Card>
        </Grid>

        {/* Property Details */}
        <Grid item xs={12} md={4}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" gutterBottom>
              {currentProperty.title}
              <IconButton onClick={handleLike} color="primary">
                {isLiked ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            </Typography>
            <Typography variant="h5" color="primary" gutterBottom>
              ${currentProperty.price.toLocaleString()}
            </Typography>
            <Chip
              label={currentProperty.status}
              color={currentProperty.status === 'for-sale' ? 'primary' : 'secondary'}
              sx={{ mr: 1 }}
            />
            <Chip label={currentProperty.type} />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn sx={{ mr: 1 }} />
              {`${currentProperty.location.address}, ${currentProperty.location.city}, ${currentProperty.location.state} ${currentProperty.location.zipCode}`}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                  <BedOutlined sx={{ mr: 1 }} />
                  {currentProperty.features.bedrooms} Beds
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                  <BathtubOutlined sx={{ mr: 1 }} />
                  {currentProperty.features.bathrooms} Baths
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                  <SquareFootOutlined sx={{ mr: 1 }} />
                  {currentProperty.features.area} sqft
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                  {currentProperty.features.parking ? (
                    <>
                      <LocalParking sx={{ mr: 1 }} />
                      Parking
                    </>
                  ) : null}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                  {currentProperty.features.furnished ? (
                    <>
                      <Weekend sx={{ mr: 1 }} />
                      Furnished
                    </>
                  ) : null}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {!isSeller && currentProperty.status !== 'sold' && currentProperty.status !== 'rented' && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mb: 1 }}
                onClick={() => handleTransaction(currentProperty.status === 'for-sale' ? 'sale' : 'rent')}
              >
                {currentProperty.status === 'for-sale' ? 'Buy Now' : 'Rent Now'}
              </Button>
            </Box>
          )}

          {isSeller && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={() => navigate(`/properties/edit/${id}`)}
              >
                Edit Property
              </Button>
            </Box>
          )}
        </Grid>

        {/* Description */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Description</Typography>
          <Typography variant="body1">{currentProperty.description}</Typography>
        </Grid>
      </Grid>

      {/* Transaction Dialog */}
      <Dialog open={transactionDialog} onClose={() => setTransactionDialog(false)}>
        <DialogTitle>
          {transactionType === 'sale' ? 'Purchase Property' : 'Rent Property'}
        </DialogTitle>
        <DialogContent>
          {paymentIntent ? (
            <Elements stripe={stripePromise} options={{ clientSecret: paymentIntent.clientSecret }}>
              <PaymentForm />
            </Elements>
          ) : (
            <Box sx={{ py: 2 }}>
              <Typography variant="body1" gutterBottom>
                Total Amount: ${currentProperty.price.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Click proceed to continue with the {transactionType === 'sale' ? 'purchase' : 'rental'} process.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransactionDialog(false)}>Cancel</Button>
          {!paymentIntent && (
            <Button onClick={handleCreateTransaction} variant="contained" color="primary">
              Proceed
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PropertyDetails;