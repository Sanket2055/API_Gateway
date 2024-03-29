const express = require("express");
const PORT = 3005;

const morgan = require("morgan");
const { rateLimit } = require('express-rate-limit')
const { createProxyMiddleware } = require("http-proxy-middleware");
const axios = require("axios");
const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
})
app.use(morgan("combined"));
app.use(limiter)
app.use('/bookingservice', async (req, res, next) => {
    console.log(req.headers['x-access-token']);
    try {
        const response = await axios.get('http://localhost:3001/api/v1/isauthenticated', {
            headers: {
                'x-access-token': req.headers['x-access-token']
            }
        });
        console.log(response.data);
        if (response.data.success) {
            next();
        } else {
            return res.status(401).json({
                message: 'Unauthorised'
            })
        }
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorised'
        })
    }
})
app.use('/bookingservice', createProxyMiddleware({ target: 'http://localhost:3002', changeOrigin: true }));

app.get("/home", (req, res) => {
    return res.json({
        message: "Hello World"
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});