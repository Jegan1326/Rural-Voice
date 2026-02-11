const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const villageRoutes = require('./routes/villageRoutes');
const issueRoutes = require('./routes/issueRoutes');
const userRoutes = require('./routes/userRoutes');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const analyticsRoutes = require('./routes/analyticsRoutes');
const startEscalationJob = require('./services/escalationService');

dotenv.config();

// connectDB(); // Moved to server start block

const app = express();

// Middleware
app.use(helmet());
app.use(compression());

// Rate Limiting: Max 100 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

// Serve Uploads statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/villages', villageRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
    res.send('Rural Voice API is running...');
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Make io accessible to our router
app.set('io', io);

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('joinVillage', (villageId) => {
        socket.join(villageId);
        console.log(`Socket ${socket.id} joined village ${villageId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    connectDB();
    startEscalationJob();
    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
