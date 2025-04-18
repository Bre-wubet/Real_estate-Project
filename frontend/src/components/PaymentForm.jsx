import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { completeTransaction } from '../redux/slices/transactionSlice';

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const { currentTransaction } = useSelector((state) => state.transaction);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    // Check for internet connection
    if (!navigator.onLine) {
      setError('Please check your internet connection and try again.');
      setProcessing(false);
      return;
    }

    try {
      // Validate Stripe configuration
      if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY || 
          import.meta.env.VITE_STRIPE_PUBLIC_KEY.includes('your_stripe_public_key_here')) {
        throw new Error('Invalid Stripe configuration. Please contact support.');
      }

      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/transactions'
        },
        redirect: 'if_required'
      }).catch(err => {
        if (err.type === 'network_error') {
          throw new Error('Network error occurred. Please check your connection.');
        }
        throw err;
      });

      if (paymentError) {
        setError(paymentError.message);
        setProcessing(false);
        return;
      }

      // If no redirect happened, payment was successful
      await dispatch(completeTransaction({
        transactionId: currentTransaction._id,
        paymentMethod: 'card'
      })).unwrap();

      navigate('/transactions');
    } catch (err) {
      setError(err.message || 'Something went wrong with the payment');
      setProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <PaymentElement />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={!stripe || processing}
        sx={{ mt: 3 }}
      >
        {processing ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          <Typography>Pay Now</Typography>
        )}
      </Button>
    </Box>
  );
};

export default PaymentForm;