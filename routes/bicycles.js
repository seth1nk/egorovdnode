const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Bicycle } = require('../models');
const authRequired = require('../middleware/authRequired');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../public/images/bicycles');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

router.get('/list-bicycles', authRequired, (req, res) => {
    res.redirect('/bicycles/index.html');
});

router.get('/api/bicycles', authRequired, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Bicycle.findAndCountAll({
            limit,
            offset,
            order: [['id', 'ASC']],
            attributes: ['id', 'model', 'brand', 'type', 'manufactureYear', 'condition', 'isAvailable', 'color', 'serialNumber', 'photo'],
        });

        const totalPages = Math.ceil(count / limit);

        const formattedBicycles = rows.map(item => ({
            id: item.id,
            model: item.model,
            brand: item.brand,
            type: item.type,
            manufactureYear: item.manufactureYear,
            condition: item.condition,
            isAvailable: item.isAvailable,
            color: item.color,
            serialNumber: item.serialNumber,
            photo: item.photo ? item.photo.replace('/img/', '/images/') : null,
        }));

        res.json({
            bicycles: formattedBicycles,
            currentPage: page,
            totalPages,
            totalItems: count,
        });
    } catch (error) {
        console.error('Ошибка при получении велосипедов:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.get('/api/view-bicycle/:id', authRequired, async (req, res) => {
    try {
        const bicycle = await Bicycle.findByPk(req.params.id, {
            attributes: ['id', 'model', 'brand', 'type', 'manufactureYear', 'condition', 'isAvailable', 'color', 'serialNumber', 'photo'],
        });
        if (!bicycle) {
            return res.status(404).json({ error: 'Велосипед не найден' });
        }
        const formattedBicycle = {
            id: bicycle.id,
            model: bicycle.model,
            brand: bicycle.brand,
            type: bicycle.type,
            manufactureYear: bicycle.manufactureYear,
            condition: bicycle.condition,
            isAvailable: bicycle.isAvailable,
            color: bicycle.color,
            serialNumber: bicycle.serialNumber,
            photo: bicycle.photo ? bicycle.photo.replace('/img/', '/images/') : null,
        };
        res.json(formattedBicycle);
    } catch (error) {
        console.error('Ошибка при получении велосипеда:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/api/bicycles', authRequired, async (req, res) => {
    try {
        const { model, brand, type, manufactureYear, condition, isAvailable, color, serialNumber, photo } = req.body;
        const bicycle = await Bicycle.create({
            model,
            brand,
            type,
            manufactureYear: parseInt(manufactureYear) || null,
            condition,
            isAvailable: isAvailable === 'true' || isAvailable === true,
            color,
            serialNumber,
            photo: photo ? photo.replace('/img/', '/images/') : null,
        });
        const formattedBicycle = {
            id: bicycle.id,
            model: bicycle.model,
            brand: bicycle.brand,
            type: bicycle.type,
            manufactureYear: bicycle.manufactureYear,
            condition: bicycle.condition,
            isAvailable: bicycle.isAvailable,
            color: bicycle.color,
            serialNumber: bicycle.serialNumber,
            photo: bicycle.photo,
        };
        res.status(201).json(formattedBicycle);
    } catch (error) {
        console.error('Ошибка при создании велосипеда:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/add-bicycle', authRequired, upload.single('photo'), async (req, res) => {
    let bicycle;
    try {
        const requiredFields = ['model'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                throw new Error(`Отсутствует обязательное поле: ${field}`);
            }
        }

        const { model, brand, type, manufactureYear, condition, isAvailable, color, serialNumber } = req.body;
        bicycle = await Bicycle.create({
            model: model.trim(),
            brand: brand ? brand.trim() : null,
            type: type ? type.trim() : null,
            manufactureYear: parseInt(manufactureYear) || null,
            condition: condition ? condition.trim() : null,
            isAvailable: isAvailable === 'true' || isAvailable === true,
            color: color ? color.trim() : null,
            serialNumber: serialNumber ? serialNumber.trim() : null,
            photo: null
        });

        let photoPath = null;
        if (req.file) {
            const newFilePath = path.join(__dirname, '../public/images/bicycles', req.file.originalname);
            if (!fs.existsSync(newFilePath)) {
                throw new Error('Не удалось сохранить файл');
            }
            photoPath = `/images/bicycles/${req.file.originalname}`;
            await bicycle.update({ photo: photoPath });
        }

        res.redirect('/bicycles/index.html');
    } catch (error) {
        console.error('Ошибка при создании велосипеда:', error);
        if (bicycle) await bicycle.destroy();
        res.status(500).send(`Ошибка при создании велосипеда: ${error.message}`);
    }
});

router.put('/api/bicycles/:id', authRequired, async (req, res) => {
    try {
        const bicycle = await Bicycle.findByPk(req.params.id);
        if (!bicycle) {
            return res.status(404).json({ error: 'Велосипед не найден' });
        }
        const { model, brand, type, manufactureYear, condition, isAvailable, color, serialNumber, photo } = req.body;
        await bicycle.update({
            model,
            brand,
            type,
            manufactureYear: parseInt(manufactureYear) || null,
            condition,
            isAvailable: isAvailable === 'true' || isAvailable === true,
            color,
            serialNumber,
            photo: photo ? photo.replace('/img/', '/images/') : null,
        });
        const formattedBicycle = {
            id: bicycle.id,
            model: bicycle.model,
            brand: bicycle.brand,
            type: bicycle.type,
            manufactureYear: bicycle.manufactureYear,
            condition: bicycle.condition,
            isAvailable: bicycle.isAvailable,
            color: bicycle.color,
            serialNumber: bicycle.serialNumber,
            photo: bicycle.photo,
        };
        res.json(formattedBicycle);
    } catch (error) {
        console.error('Ошибка при обновлении велосипеда:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/edit-bicycle/:id', authRequired, upload.single('photo'), async (req, res) => {
    try {
        const bicycle = await Bicycle.findByPk(req.params.id);
        if (!bicycle) {
            return res.status(404).send('Велосипед не найден');
        }
        const { model, brand, type, manufactureYear, condition, isAvailable, color, serialNumber } = req.body;
        let photoPath = bicycle.photo;
        if (req.file) {
            const newFilePath = path.join(__dirname, '../public/images/bicycles', req.file.originalname);
            if (!fs.existsSync(newFilePath)) {
                throw new Error('Не удалось сохранить файл');
            }
            photoPath = `/images/bicycles/${req.file.originalname}`;
        }
        await bicycle.update({
            model: model.trim(),
            brand: brand ? brand.trim() : null,
            type: type ? type.trim() : null,
            manufactureYear: parseInt(manufactureYear) || null,
            condition: condition ? condition.trim() : null,
            isAvailable: isAvailable === 'true' || isAvailable === true,
            color: color ? color.trim() : null,
            serialNumber: serialNumber ? serialNumber.trim() : null,
            photo: photoPath,
        });
        res.redirect('/bicycles/index.html');
    } catch (error) {
        console.error('Ошибка при обновлении велосипеда:', error);
        res.status(500).send(`Ошибка сервера: ${error.message}`);
    }
});

router.delete('/delete-bicycle/:id', authRequired, async (req, res) => {
    try {
        const bicycle = await Bicycle.findByPk(req.params.id);
        if (!bicycle) {
            return res.status(404).json({ error: 'Велосипед не найден' });
        }
        await bicycle.destroy();
        res.json({ message: 'Велосипед удален' });
    } catch (error) {
        console.error('Ошибка при удалении велосипеда:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

module.exports = router;