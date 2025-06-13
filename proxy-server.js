const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Enable CORS for all routes with specific configuration
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    next();
});

// Proxy middleware configuration
const proxy = createProxyMiddleware({
    target: 'http://localhost:5001',
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        '^/api': '', // Remove /api prefix when forwarding to Flask
    },
    onProxyReq: (proxyReq, req, res) => {
        // Log the outgoing request
        console.log('Proxying request to:', proxyReq.path);
        console.log('Proxy request headers:', proxyReq.getHeaders());
        
        // If there's a body, write it to the proxy request
        if (req.body) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log('Received response:', proxyRes.statusCode);
        console.log('Response headers:', proxyRes.headers);
    },
    onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy error');
    }
});

// Apply proxy to all /api routes
app.use('/api', proxy);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
    console.log(`Proxying requests to http://localhost:5001`);
}); 