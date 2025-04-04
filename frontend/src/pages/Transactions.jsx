import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Box,
  Button,
  Alert,
  Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { fetchUserTransactions, cancelTransaction } from '../redux/slices/transactionSlice';

const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const Transactions = () => {
  const dispatch = useDispatch();
  const { transactions, loading, error } = useSelector((state) => state.transaction);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUserTransactions());
  }, [dispatch]);

  const handleCancel = (transactionId) => {
    if (window.confirm('Are you sure you want to cancel this transaction?')) {
      dispatch(cancelTransaction(transactionId));
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>My Transactions</Typography>

      {transactions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>No transactions found</Typography>
          <Button
            component={RouterLink}
            to="/properties"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Browse Properties
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {transactions.map((transaction) => (
            <Grid item xs={12} key={transaction._id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Typography variant="h6" component={RouterLink} to={`/properties/${transaction.property._id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                        {transaction.property.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {transaction.type === 'sale' ? 'Purchase' : 'Rental'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <Typography variant="body1">
                        Amount: ${transaction.amount.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <Typography variant="body1">
                        {user._id === transaction.buyer._id ? 'Seller' : 'Buyer'}:{' '}
                        {user._id === transaction.buyer._id
                          ? transaction.seller.name
                          : transaction.buyer.name}
                      </Typography>
                      {transaction.paymentInfo.paymentMethod && (
                        <Typography variant="body2" color="text.secondary">
                          Paid via {transaction.paymentInfo.paymentMethod}
                        </Typography>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: '100%' }}>
                        <Chip
                          label={transaction.status}
                          color={getStatusColor(transaction.status)}
                          sx={{ mr: transaction.status === 'pending' ? 1 : 0 }}
                        />
                        {transaction.status === 'pending' && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleCancel(transaction._id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>

                  {transaction.contractDetails?.terms && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Contract Terms: {transaction.contractDetails.terms}
                      </Typography>
                      {transaction.contractDetails.documents?.map((doc, index) => (
                        <Link
                          key={index}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ display: 'block', mt: 1 }}
                        >
                          View Document {index + 1}
                        </Link>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Transactions;