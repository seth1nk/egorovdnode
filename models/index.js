const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('postgresql://ujpsuaqorqft21xjzwdd:Bv2H1vhZMDmWBj2zj5FU4XuTRqp0qT@btvo0e3o9wffjmyvbrfx-postgresql.services.clever-cloud.com:50013/btvo0e3o9wffjmyvbrfx', {
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
const Bicycle = require('./Bicycle')(sequelize, DataTypes);
const RepairService = require('./RepairService')(sequelize, DataTypes);

sequelize.sync({ alter: true })
    .then(() => console.log('Models synchronized with database'))
    .catch(err => console.error('Error synchronizing models:', err));

module.exports = {
    sequelize,
    User,
    Bicycle,
    RepairService
};