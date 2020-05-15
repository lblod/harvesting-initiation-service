import { app, errorHandler } from 'mu';

app.get('/', function( req, res ) {
  res.send('Hello harvesting-initiation-service');
} );

app.use(errorHandler);