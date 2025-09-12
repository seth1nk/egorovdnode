const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { RepairService } = require('../models');
const authRequired = require('../middleware/authRequired');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../public/images/repair_services');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

router.get('/list-repair-services', authRequired, (req, res) => {
    res.redirect('/repair-services/index.html');
});

router.get('/api/repair-services', authRequired, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await RepairService.findAndCountAll({
            limit,
            offset,
            order: [['id', 'ASC']],
            attributes: ['id', 'name', 'description', 'cost', 'category', 'durationMinutes', 'isAvailable', 'requiredTools', 'difficultyLevel', 'photo'],
        });

        const totalPages = Math.ceil(count / limit);

        const formattedRepairServices = rows.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            cost: item.cost,
            category: item.category,
            durationMinutes: item.durationMinutes,
            isAvailable: item.isAvailable,
            requiredTools: item.requiredTools,
            difficultyLevel: item.difficultyLevel,
            photo: item.photo ? item.photo.replace('/img/', '/images/') : null,
        }));

        res.json({
            repairServices: formattedRepairServices,
            currentPage: page,
            totalPages,
            totalItems: count,
        });
    } catch (error) {
        console.error('Ошибка при получении услуг ремонта:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.get('/api/view-repair-service/:id', authRequired, async (req, res) => {
    try {
        const repairService = await RepairService.findByPk(req.params.id, {
            attributes: ['id', 'name', 'description', 'cost', 'category', 'durationMinutes', 'isAvailable', 'requiredTools', 'difficultyLevel', 'photo'],
        });
        if (!repairService) {
            return res.status(404).json({ error: 'Услуга ремонта не найдена' });
        }
        const formattedRepairService = {
            id: repairService.id,
            name: repairService.name,
            description: repairService.description,
            cost: repairService.cost,
            category: repairService.category,
            durationMinutes: repairService.durationMinutes,
            isAvailable: repairService.isAvailable,
            requiredTools: repairService.requiredTools,
            difficultyLevel: repairService.difficultyLevel,
            photo: repairService.photo ? repairService.photo.replace('/img/', '/images/') : null,
        };
        res.json(formattedRepairService);
    } catch (error) {
        console.error('Ошибка при получении услуги ремонта:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/api/repair-services', authRequired, async (req, res) => {
    try {
        const { name, description, cost, category, durationMinutes, isAvailable, requiredTools, difficultyLevel, photo } = req.body;
        const repairService = await RepairService.create({
            name,
            description,
            cost: parseFloat(cost) || null,
            category,
            durationMinutes: parseInt(durationMinutes) || null,
            isAvailable: isAvailable === 'true' || isAvailable === true,
            requiredTools,
            difficultyLevel,
            photo: photo ? photo.replace('/img/', '/images/') : null,
        });
        const formattedRepairService = {
            id: repairService.id,
            name: repairService.name,
            description: repairService.description,
            cost: repairService.cost,
            category: repairService.category,
            durationMinutes: repairService.durationMinutes,
            isAvailable: repairService.isAvailable,
            requiredTools: repairService.requiredTools,
            difficultyLevel: repairService.difficultyLevel,
            photo: repairService.photo,
        };
        res.status(201).json(formattedRepairService);
    } catch (error) {
        console.error('Ошибка при создании услуги ремонта:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/add-repair-service', authRequired, upload.single('photo'), async (req, res) => {
    let repairService;
    try {
        const requiredFields = ['name'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                throw new Error(`Отсутствует обязательное поле: ${field}`);
            }
        }

        const { name, description, cost, category, durationMinutes, isAvailable, requiredTools, difficultyLevel } = req.body;
        repairService = await RepairService.create({
            name: name.trim(),
            description: description ? description.trim() : null,
            cost: parseFloat(cost) || null,
            category: category ? category.trim() : null,
            durationMinutes: parseInt(durationMinutes) || null,
            isAvailable: isAvailable === 'true' || isAvailable === true,
            requiredTools: requiredTools ? requiredTools.trim() : null,
            difficultyLevel: difficultyLevel ? difficultyLevel.trim() : null,
            photo: null
        });

        let photoPath = null;
        if (req.file) {
            const newFilePath = path.join(__dirname, '../public/images/repair_services', req.file.originalname);
            if (!fs.existsSync(newFilePath)) {
                throw new Error('Не удалось сохранить файл');
            }
            photoPath = `/images/repair_services/${req.file.originalname}`;
            await repairService.update({ photo: photoPath });
        }

        res.redirect('/repair-services/index.html');
    } catch (error) {
        console.error('Ошибка при создании услуги ремонта:', error);
        if (repairService) await repairService.destroy();
        res.status(500).send(`Ошибка при создании услуги ремонта: ${error.message}`);
    }
});

router.put('/api/repair-services/:id', authRequired, async (req, res) => {
    try {
        const repairService = await RepairService.findByPk(req.params.id);
        if (!repairService) {
            return res.status(404).json({ error: 'Услуга ремонта не найдена' });
        }
        const { name, description, cost, category, durationMinutes, isAvailable, requiredTools, difficultyLevel, photo } = req.body;
        await repairService.update({
            name,
            description,
            cost: parseFloat(cost) || null,
            category,
            durationMinutes: parseInt(durationMinutes) || null,
            isAvailable: isAvailable === 'true' || isAvailable === true,
            requiredTools,
            difficultyLevel,
            photo: photo ? photo.replace('/img/', '/images/') : null,
        });
        const formattedRepairService = {
            id: repairService.id,
            name: repairService.name,
            description: repairService.description,
            cost: repairService.cost,
            category: repairService.category,
            durationMinutes: repairService.durationMinutes,
            isAvailable: repairService.isAvailable,
            requiredTools: repairService.requiredTools,
            difficultyLevel: repairService.difficultyLevel,
            photo: repairService.photo,
        };
        res.json(formattedRepairService);
    } catch (error) {
        console.error('Ошибка при обновлении услуги ремонта:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/edit-repair-service/:id', authRequired, upload.single('photo'), async (req, res) => {
    try {
        const repairService = await RepairService.findByPk(req.params.id);
        if (!repairService) {
            return res.status(404).send('Услуга ремонта не найдена');
        }
        const { name, description, cost, category, durationMinutes, isAvailable, requiredTools, difficultyLevel } = req.body;
        let photoPath = repairService.photo;
        if (req.file) {
            const newFilePath = path.join(__dirname, '../public/images/repair_services', req.file.originalname);
            if (!fs.existsSync(newFilePath)) {
                throw new Error('Не удалось сохранить файл');
            }
            photoPath = `/images/repair_services/${req.file.originalname}`;
        }
        await repairService.update({
            name: name.trim(),
            description: description ? description.trim() : null,
            cost: parseFloat(cost) || null,
            category: category ? category.trim() : null,
            durationMinutes: parseInt(durationMinutes) || null,
            isAvailable: isAvailable === 'true' || isAvailable === true,
            requiredTools: requiredTools ? requiredTools.trim() : null,
            difficultyLevel: difficultyLevel ? difficultyLevel.trim() : null,
            photo: photoPath,
        });
        res.redirect('/repair-services/index.html');
    } catch (error) {
        console.error('Ошибка при обновлении услуги ремонта:', error);
        res.status(500).send(`Ошибка сервера: ${error.message}`);
    }
});

router.delete('/delete-repair-service/:id', authRequired, async (req, res) => {
    try {
        const repairService = await RepairService.findByPk(req.params.id);
        if (!repairService) {
            return res.status(404).json({ error: 'Услуга ремонта не найдена' });
        }
        await repairService.destroy();
        res.json({ message: 'Услуга ремонта удалена' });
    } catch (error) {
        console.error('Ошибка при удалении услуги ремонта:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

module.exports = router;