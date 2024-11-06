import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';

const app = express();
app.use(cors());
app.use(express.json());

// Route requests to appropriate services
app.use('/auth', proxy('http://localhost:3001'));
app.use('/diary', proxy('http://localhost:3002'));
app.use('/notes', proxy('http://localhost:3003'));
app.use('/todo', proxy('http://localhost:3004'));
app.use('/finance', proxy('http://localhost:3005'));
app.use('/ai', proxy('http://localhost:3006'));
app.use('/search', proxy('http://localhost:3007'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});