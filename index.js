const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const authRouter = require('./routes/auth');
const bicyclesRouter = require('./routes/bicycles');
const repairServicesRouter = require('./routes/repairServices');
const authRequired = require('./middleware/authRequired');

const app = express();

const sequelize = new Sequelize('postgresql://ujpsuaqorqft21xjzwdd:Bv2H1vhZMDmWBj2zj5FU4XuTRqp0qT@btvo0e3o9wffjmyvbrfx-postgresql.services.clever-cloud.com:50013/btvo0e3o9wffjmyvbrfx', {
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});

const { User, Bicycle, RepairService } = require('./models');

sequelize.sync({ alter: true })
    .then(() => console.log('Models synchronized with database'))
    .catch(err => console.error('Error synchronizing models:', err));

app.use(logger('dev'));
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true,
}));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/bicycles', express.static(path.join(__dirname, 'views', 'bicycles')));
app.use('/repair-services', express.static(path.join(__dirname, 'views', 'repair-services')));
app.use('/js', express.static(path.join(__dirname, 'js')));

app.use('/auth', authRouter);
app.use('/', bicyclesRouter);
app.use('/', repairServicesRouter);

app.get('/', authRequired, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/api/user', authRequired, (req, res) => {
    res.json({ username: req.user.username });
});

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', 'error.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).sendFile(path.join(__dirname, 'views', 'error.html'), {
        message: err.message,
        errorStatus: err.status || 500,
        errorStack: err.stack
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;