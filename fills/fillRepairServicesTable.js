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

const RepairService = require('../models/RepairService')(sequelize, DataTypes);
const sampleImages = ['s1.png', 's2.png', 's3.jpg'];

async function fillRepairServicesTable(count) {
    try {
        await sequelize.sync({ alter: true }); // Синхронизация с изменением таблицы
        const categories = ['обслуживание', 'ремонт рамы', 'ремонт колес', 'настройка'];
        const difficultyLevels = ['легкий', 'средний', 'сложный'];
        const tools = ['гаечный ключ', 'отвертка', 'насос', 'смазка'];

        for (let i = 0; i < count; i++) {
            const repairService = await RepairService.create({
                name: faker.lorem.words(3).slice(0, 255),
                description: faker.lorem.sentence().slice(0, 1000),
                cost: faker.number.float({ min: 500, max: 10000, precision: 0.01 }),
                category: faker.helpers.arrayElement(categories),
                durationMinutes: faker.number.int({ min: 30, max: 240 }),
                isAvailable: faker.datatype.boolean(),
                requiredTools: faker.helpers.arrayElement(tools),
                difficultyLevel: faker.helpers.arrayElement(difficultyLevels),
                photo: null
            });

            const sampleImage = faker.helpers.arrayElement(sampleImages);
            const sourcePath = path.join(__dirname, '../images/repair_services', sampleImage);
            const destPath = path.join(__dirname, '../public/images/repair_services', sampleImage);

            if (fs.existsSync(sourcePath)) {
                if (!fs.existsSync(path.dirname(destPath))) {
                    fs.mkdirSync(path.dirname(destPath), { recursive: true });
                }
                fs.copyFileSync(sourcePath, destPath);
                await repairService.update({ photo: `/images/repair_services/${sampleImage}` });
            }

            console.log(`Услуга ремонта #${i + 1} успешно создана.`);
        }
        console.log(`${count} услуг ремонта успешно создано.`);
    } catch (err) {
        console.error('Ошибка при создании услуги ремонта:', err);
    } finally {
        await sequelize.close();
    }
}

const count = process.argv[2] ? parseInt(process.argv[2], 10) : 100;
if (isNaN(count) || count <= 0) {
    console.error('Укажите корректное количество записей.');
    process.exit(1);
}

fillRepairServicesTable(count);