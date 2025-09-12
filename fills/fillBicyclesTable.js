const { Sequelize, DataTypes } = require('sequelize');
const { faker } = require('@faker-js/faker/locale/ru');
const path = require('path');
const fs = require('fs');

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
        underscored: false // Отключаем преобразование в snake_case
    }
});

const Bicycle = require('../models/Bicycle')(sequelize, DataTypes);
const sampleImages = ['t1.jpg', 't2.jpg', 't3.png'];

async function fillBicyclesTable(count) {
    try {
        await sequelize.sync({ alter: true }); // Синхронизация с изменением таблицы
        const brands = ['Trek', 'Giant', 'Specialized', 'Cannondale', 'Scott'];
        const types = ['горный', 'дорожный', 'шоссейный', 'городской', 'BMX'];
        const conditions = ['новый', 'б/у', 'требует ремонта'];
        const colors = ['черный', 'белый', 'красный', 'синий', 'зеленый'];

        for (let i = 0; i < count; i++) {
            const bicycle = await Bicycle.create({
                model: faker.vehicle.bicycle().slice(0, 255),
                brand: faker.helpers.arrayElement(brands),
                type: faker.helpers.arrayElement(types),
                manufactureYear: faker.number.int({ min: 1980, max: 2025 }),
                condition: faker.helpers.arrayElement(conditions),
                isAvailable: faker.datatype.boolean(),
                color: faker.helpers.arrayElement(colors),
                serialNumber: faker.string.alphanumeric({ length: 10 }),
                photo: null
            });

            const sampleImage = faker.helpers.arrayElement(sampleImages);
            const sourcePath = path.join(__dirname, '../images/bicycles', sampleImage);
            const destPath = path.join(__dirname, '../public/images/bicycles', sampleImage);

            if (fs.existsSync(sourcePath)) {
                if (!fs.existsSync(path.dirname(destPath))) {
                    fs.mkdirSync(path.dirname(destPath), { recursive: true });
                }
                fs.copyFileSync(sourcePath, destPath);
                await bicycle.update({ photo: `/images/bicycles/${sampleImage}` });
            }

            console.log(`Велосипед #${i + 1} успешно создан.`);
        }
        console.log(`${count} велосипедов успешно создано.`);
    } catch (err) {
        console.error('Ошибка при создании велосипеда:', err);
    } finally {
        await sequelize.close();
    }
}

const count = process.argv[2] ? parseInt(process.argv[2], 10) : 100;
if (isNaN(count) || count <= 0) {
    console.error('Укажите корректное количество записей.');
    process.exit(1);
}

fillBicyclesTable(count);