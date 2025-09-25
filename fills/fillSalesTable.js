const { Sequelize, DataTypes } = require('sequelize');
const { faker } = require('@faker-js/faker/locale/ru');
const path = require('path');
const fs = require('fs');

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
        underscored: false // Отключаем преобразование в snake_case
    }
});

const Sale = require('../models/Sale')(sequelize, DataTypes);
const sampleImages = ['y1.png', 'y2.png', 'y3.png'];

async function fillSalesTable(count) {
    try {
        await sequelize.sync({ alter: true }); // Синхронизация с изменением таблицы
        const paymentMethods = ['наличные', 'карта', 'перевод', 'рассрочка'];
        const orderPrefixes = ['ORD', 'SL', 'INV'];

        for (let i = 0; i < count; i++) {
            const sale = await Sale.create({
                customerName: faker.person.fullName().slice(0, 255),
                notes: faker.lorem.sentence().slice(0, 500),
                deliveryAddress: faker.address.streetAddress().slice(0, 100),
                paymentMethod: faker.helpers.arrayElement(paymentMethods),
                saleYear: faker.number.int({ min: 2000, max: 2025 }),
                isConfirmed: faker.datatype.boolean(),
                orderNumber: `${faker.helpers.arrayElement(orderPrefixes)}-${faker.string.alphanumeric({ length: 8 })}`.slice(0, 255),
                photo: null
            });

            const sampleImage = faker.helpers.arrayElement(sampleImages);
            const sourcePath = path.join(__dirname, '../images/sales', sampleImage);
            const destPath = path.join(__dirname, '../public/images/sales', sampleImage);

            if (fs.existsSync(sourcePath)) {
                if (!fs.existsSync(path.dirname(destPath))) {
                    fs.mkdirSync(path.dirname(destPath), { recursive: true });
                }
                fs.copyFileSync(sourcePath, destPath);
                await sale.update({ photo: `/images/sales/${sampleImage}` });
            }

            console.log(`Продажа #${i + 1} успешно создана.`);
        }
        console.log(`${count} продаж успешно создано.`);
    } catch (err) {
        console.error('Ошибка при создании продажи:', err);
    } finally {
        await sequelize.close();
    }
}

const count = process.argv[2] ? parseInt(process.argv[2], 10) : 100;
if (isNaN(count) || count <= 0) {
    console.error('Укажите корректное количество записей.');
    process.exit(1);
}

fillSalesTable(count);