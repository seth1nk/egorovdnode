const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Television } = require('../models');
const authRequired = require('../middleware/authRequired');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../public/images/televisions');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

router.get('/list-televisions', authRequired, (req, res) => {
    res.redirect('/televisions/index.html');
});

router.get('/api/televisions', authRequired, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Television.findAndCountAll({
            limit,
            offset,
            order: [['id', 'ASC']],
            attributes: ['id', 'name', 'description', 'brand', 'screenType', 'releaseYear', 'isInStock', 'price', 'photo'],
        });

        const totalPages = Math.ceil(count / limit);

        const formattedTelevisions = rows.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            brand: item.brand,
            screenType: item.screenType,
            releaseYear: item.releaseYear,
            isInStock: item.isInStock,
            price: item.price,
            photo: item.photo ? item.photo.replace('/img/', '/images/') : null,
        }));

        res.json({
            televisions: formattedTelevisions,
            currentPage: page,
            totalPages,
            totalItems: count,
        });
    } catch (error) {
        console.error('Ошибка при получении телевизоров:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.get('/api/view-television/:id', authRequired, async (req, res) => {
    try {
        const television = await Television.findByPk(req.params.id, {
            attributes: ['id', 'name', 'description', 'brand', 'screenType', 'releaseYear', 'isInStock', 'price', 'photo'],
        });
        if (!television) {
            return res.status(404).json({ error: 'Телевизор не найден' });
        }
        const formattedTelevision = {
            id: television.id,
            name: television.name,
            description: television.description,
            brand: television.brand,
            screenType: television.screenType,
            releaseYear: television.releaseYear,
            isInStock: television.isInStock,
            price: television.price,
            photo: television.photo ? television.photo.replace('/img/', '/images/') : null,
        };
        res.json(formattedTelevision);
    } catch (error) {
        console.error('Ошибка при получении телевизора:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/api/televisions', authRequired, async (req, res) => {
    try {
        const { name, description, brand, screenType, releaseYear, isInStock, price, photo } = req.body;
        const television = await Television.create({
            name,
            description,
            brand,
            screenType,
            releaseYear: parseInt(releaseYear) || null,
            isInStock: isInStock === 'true' || isInStock === true,
            price: parseFloat(price) || null,
            photo: photo ? photo.replace('/img/', '/images/') : null,
        });
        const formattedTelevision = {
            id: television.id,
            name: television.name,
            description: television.description,
            brand: television.brand,
            screenType: television.screenType,
            releaseYear: television.releaseYear,
            isInStock: television.isInStock,
            price: television.price,
            photo: television.photo,
        };
        res.status(201).json(formattedTelevision);
    } catch (error) {
        console.error('Ошибка при создании телевизора:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/add-television', authRequired, upload.single('photo'), async (req, res) => {
    let television;
    try {
        const requiredFields = ['name'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                throw new Error(`Отсутствует обязательное поле: ${field}`);
            }
        }

        const { name, description, brand, screenType, releaseYear, isInStock, price } = req.body;
        television = await Television.create({
            name: name.trim(),
            description: description ? description.trim() : null,
            brand: brand ? brand.trim() : null,
            screenType: screenType ? screenType.trim() : null,
            releaseYear: parseInt(releaseYear) || null,
            isInStock: isInStock === 'true' || isInStock === true,
            price: parseFloat(price) || null,
            photo: null
        });

        let photoPath = null;
        if (req.file) {
            const newFilePath = path.join(__dirname, '../public/images/televisions', req.file.originalname);
            if (!fs.existsSync(newFilePath)) {
                throw new Error('Не удалось сохранить файл');
            }
            photoPath = `/images/televisions/${req.file.originalname}`;
            await television.update({ photo: photoPath });
        }

        res.redirect('/televisions/index.html');
    } catch (error) {
        console.error('Ошибка при создании телевизора:', error);
        if (television) await television.destroy();
        res.status(500).send(`Ошибка при создании телевизора: ${error.message}`);
    }
});

router.put('/api/televisions/:id', authRequired, async (req, res) => {
    try {
        const television = await Television.findByPk(req.params.id);
        if (!television) {
            return res.status(404).json({ error: 'Телевизор не найден' });
        }
        const { name, description, brand, screenType, releaseYear, isInStock, price, photo } = req.body;
        await television.update({
            name,
            description,
            brand,
            screenType,
            releaseYear: parseInt(releaseYear) || null,
            isInStock: isInStock === 'true' || isInStock === true,
            price: parseFloat(price) || null,
            photo: photo ? photo.replace('/img/', '/images/') : null,
        });
        const formattedTelevision = {
            id: television.id,
            name: television.name,
            description: television.description,
            brand: television.brand,
            screenType: television.screenType,
            releaseYear: television.releaseYear,
            isInStock: television.isInStock,
            price: television.price,
            photo: television.photo,
        };
        res.json(formattedTelevision);
    } catch (error) {
        console.error('Ошибка при обновлении телевизора:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/edit-television/:id', authRequired, upload.single('photo'), async (req, res) => {
    try {
        const television = await Television.findByPk(req.params.id);
        if (!television) {
            return res.status(404).send('Телевизор не найден');
        }
        const { name, description, brand, screenType, releaseYear, isInStock, price } = req.body;
        let photoPath = television.photo;
        if (req.file) {
            const newFilePath = path.join(__dirname, '../public/images/televisions', req.file.originalname);
            if (!fs.existsSync(newFilePath)) {
                throw new Error('Не удалось сохранить файл');
            }
            photoPath = `/images/televisions/${req.file.originalname}`;
        }
        await television.update({
            name: name.trim(),
            description: description ? description.trim() : null,
            brand: brand ? brand.trim() : null,
            screenType: screenType ? screenType.trim() : null,
            releaseYear: parseInt(releaseYear) || null,
            isInStock: isInStock === 'true' || isInStock === true,
            price: parseFloat(price) || null,
            photo: photoPath,
        });
        res.redirect('/televisions/index.html');
    } catch (error) {
        console.error('Ошибка при обновлении телевизора:', error);
        res.status(500).send(`Ошибка сервера: ${error.message}`);
    }
});

router.delete('/delete-television/:id', authRequired, async (req, res) => {
    try {
        const television = await Television.findByPk(req.params.id);
        if (!television) {
            return res.status(404).json({ error: 'Телевизор не найден' });
        }
        await television.destroy();
        res.json({ message: 'Телевизор удален' });
    } catch (error) {
        console.error('Ошибка при удалении телевизора:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

module.exports = router;