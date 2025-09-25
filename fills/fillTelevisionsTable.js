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

const Television = require('../models/Television')(sequelize, DataTypes);
const sampleImages = ['t1.png', 't2.png', 't3.png'];

async function fillTelevisionsTable(count) {
    try {
        await sequelize.sync({ alter: true }); // Синхронизация с изменением таблицы
        const brands = ['Samsung', 'LG', 'Sony', 'Philips', 'Panasonic'];
        const screenTypes = ['LED', 'OLED', 'QLED', 'LCD', 'Plasma'];

        for (let i = 0; i < count; i++) {
            const television = await Television.create({
                name: faker.commerce.productName().slice(0, 255),
                description: faker.lorem.paragraph().slice(0, 500),
                brand: faker.helpers.arrayElement(brands),
                screenType: faker.helpers.arrayElement(screenTypes),
                releaseYear: faker.number.int({ min: 2000, max: 2025 }),
                isInStock: faker.datatype.boolean(),
                price: faker.number.float({ min: 10000, max: 200000, precision: 0.01 }),
                photo: null
            });

            const sampleImage = faker.helpers.arrayElement(sampleImages);
            const sourcePath = path.join(__dirname, '../images/televisions', sampleImage);
            const destPath = path.join(__dirname, '../public/images/televisions', sampleImage);

            if (fs.existsSync(sourcePath)) {
                if (!fs.existsSync(path.dirname(destPath))) {
                    fs.mkdirSync(path.dirname(destPath), { recursive: true });
                }
                fs.copyFileSync(sourcePath, destPath);
                await television.update({ photo: `/images/televisions/${sampleImage}` });
            }

            console.log(`Телевизор #${i + 1} успешно создан.`);
        }
        console.log(`${count} телевизоров успешно создано.`);
    } catch (err) {
        console.error('Ошибка при создании телевизора:', err);
    } finally {
        await sequelize.close();
    }
}

const count = process.argv[2] ? parseInt(process.argv[2], 10) : 100;
if (isNaN(count) || count <= 0) {
    console.error('Укажите корректное количество записей.');
    process.exit(1);
}

fillTelevisionsTable(count);