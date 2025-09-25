const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('postgresql://ueltee8tbezqerkgdnji:nOS471qLcLM4E2rG6NyJA5lyuQGW30@b1xlws1wx2rfuvgoypj4-postgresql.services.clever-cloud.com:50013/b1xlws1wx2rfuvgoypj4', {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    define: {
        timestamps: true,
        underscored: true,
    }
});

const User = require('./User')(sequelize, DataTypes);
const Television = require('./Television')(sequelize, DataTypes);
const Sale = require('./Sale')(sequelize, DataTypes);

sequelize.sync({ alter: true })
    .then(() => console.log('Models synchronized with database'))
    .catch(err => console.error('Error synchronizing models:', err));

module.exports = {
    sequelize,
    User,
    Sale,
    Television
};