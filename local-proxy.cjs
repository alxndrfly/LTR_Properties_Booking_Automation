const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import the Netlify functions
const fetchJsonPayload = require('./netlify/functions/fetch-json-payload.cjs');
const fetchProperties = require('./netlify/functions/fetch-properties.cjs');
const getRecommendations = require('./netlify/functions/get-recommendations.cjs');

const app = express();
const PORT = 8888;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Netlify function context
const createMockContext = () => ({
  awsRequestId: 'mock-request-id',
  functionName: 'mock-function',
  functionVersion: '1',
  memoryLimitInMB: 1024,
  remainingTimeInMillis: () => 30000,
});

// Function to convert Express request to Netlify event format
const convertToNetlifyEvent = (req) => ({
  httpMethod: req.method,
  headers: req.headers,
  queryStringParameters: req.query,
  body: req.method === 'POST' ? JSON.stringify(req.body) : null,
  path: req.path,
});

// Routes for Netlify functions
app.all('/.netlify/functions/fetch-json-payload', async (req, res) => {
  try {
    const event = convertToNetlifyEvent(req);
    const context = createMockContext();
    const result = await fetchJsonPayload.handler(event, context);

    res.status(result.statusCode);
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        res.set(key, value);
      });
    }
    res.send(result.body);
  } catch (error) {
    console.error('Error in fetch-json-payload:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.all('/.netlify/functions/fetch-properties', async (req, res) => {
  try {
    const event = convertToNetlifyEvent(req);
    const context = createMockContext();
    const result = await fetchProperties.handler(event, context);

    res.status(result.statusCode);
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        res.set(key, value);
      });
    }
    res.send(result.body);
  } catch (error) {
    console.error('Error in fetch-properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.all('/.netlify/functions/get-recommendations', async (req, res) => {
  try {
    const event = convertToNetlifyEvent(req);
    const context = createMockContext();
    const result = await getRecommendations.handler(event, context);

    res.status(result.statusCode);
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        res.set(key, value);
      });
    }
    res.send(result.body);
  } catch (error) {
    console.error('Error in get-recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Local Netlify functions proxy running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`  GET  http://localhost:${PORT}/.netlify/functions/fetch-json-payload?uuid=YOUR_UUID`);
  console.log(`  POST http://localhost:${PORT}/.netlify/functions/fetch-properties`);
  console.log(`  GET  http://localhost:${PORT}/.netlify/functions/get-recommendations?uuid=YOUR_UUID`);
});