const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Подключение к PostgreSQL (Clever Cloud)
const sequelize = new Sequelize('postgresql://ueltee8tbezqerkgdnji:nOS471qLcLM4E2rG6NyJA5lyuQGW30@b1xlws1wx2rfuvgoypj4-postgresql.services.clever-cloud.com:50013/b1xlws1wx2rfuvgoypj4', {
   dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});

(async () => {
  try {
    // Синхронизация модели с базой данных
    await sequelize.sync();

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash('Q1qqqqqq', 10);

    // Создаем администратора
    const admin = await User(sequelize, DataTypes).create({
      username: 'admin',
      email: 'admin@mail.ru',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Администратор успешно создан:', admin.toJSON());
  } catch (err) {
    console.error('Ошибка при создании администратора:', err);
  } finally {
    await sequelize.close();
  }
})();