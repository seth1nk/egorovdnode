const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Sale } = require('../models');
const authRequired = require('../middleware/authRequired');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../public/images/sales');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

router.get('/list-sales', authRequired, (req, res) => {
    res.redirect('/sales/index.html');
});

router.get('/api/sales', authRequired, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Sale.findAndCountAll({
            limit,
            offset,
            order: [['id', 'ASC']],
            attributes: ['id', 'customerName', 'notes', 'deliveryAddress', 'paymentMethod', 'saleYear', 'isConfirmed', 'orderNumber', 'photo'],
        });

        const totalPages = Math.ceil(count / limit);

        const formattedSales = rows.map(item => ({
            id: item.id,
            customerName: item.customerName,
            notes: item.notes,
            deliveryAddress: item.deliveryAddress,
            paymentMethod: item.paymentMethod,
            saleYear: item.saleYear,
            isConfirmed: item.isConfirmed,
            orderNumber: item.orderNumber,
            photo: item.photo ? item.photo.replace('/img/', '/images/') : null,
        }));

        res.json({
            sales: formattedSales,
            currentPage: page,
            totalPages,
            totalItems: count,
        });
    } catch (error) {
        console.error('Ошибка при получении продаж:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.get('/api/view-sale/:id', authRequired, async (req, res) => {
    try {
        const sale = await Sale.findByPk(req.params.id, {
            attributes: ['id', 'customerName', 'notes', 'deliveryAddress', 'paymentMethod', 'saleYear', 'isConfirmed', 'orderNumber', 'photo'],
        });
        if (!sale) {
            return res.status(404).json({ error: 'Продажа не найдена' });
        }
        const formattedSale = {
            id: sale.id,
            customerName: sale.customerName,
            notes: sale.notes,
            deliveryAddress: sale.deliveryAddress,
            paymentMethod: sale.paymentMethod,
            saleYear: sale.saleYear,
            isConfirmed: sale.isConfirmed,
            orderNumber: sale.orderNumber,
            photo: sale.photo ? sale.photo.replace('/img/', '/images/') : null,
        };
        res.json(formattedSale);
    } catch (error) {
        console.error('Ошибка при получении продажи:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/api/sales', authRequired, async (req, res) => {
    try {
        const { customerName, notes, deliveryAddress, paymentMethod, saleYear, isConfirmed, orderNumber, photo } = req.body;
        const sale = await Sale.create({
            customerName,
            notes,
            deliveryAddress,
            paymentMethod,
            saleYear: parseInt(saleYear) || null,
            isConfirmed: isConfirmed === 'true' || isConfirmed === true,
            orderNumber,
            photo: photo ? photo.replace('/img/', '/images/') : null,
        });
        const formattedSale = {
            id: sale.id,
            customerName: sale.customerName,
            notes: sale.notes,
            deliveryAddress: sale.deliveryAddress,
            paymentMethod: sale.paymentMethod,
            saleYear: sale.saleYear,
            isConfirmed: sale.isConfirmed,
            orderNumber: sale.orderNumber,
            photo: sale.photo,
        };
        res.status(201).json(formattedSale);
    } catch (error) {
        console.error('Ошибка при создании продажи:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/add-sale', authRequired, upload.single('photo'), async (req, res) => {
    let sale;
    try {
        const requiredFields = ['customerName'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                throw new Error(`Отсутствует обязательное поле: ${field}`);
            }
        }

        const { customerName, notes, deliveryAddress, paymentMethod, saleYear, isConfirmed, orderNumber } = req.body;
        sale = await Sale.create({
            customerName: customerName.trim(),
            notes: notes ? notes.trim() : null,
            deliveryAddress: deliveryAddress ? deliveryAddress.trim() : null,
            paymentMethod: paymentMethod ? paymentMethod.trim() : null,
            saleYear: parseInt(saleYear) || null,
            isConfirmed: isConfirmed === 'true' || isConfirmed === true,
            orderNumber: orderNumber ? orderNumber.trim() : null,
            photo: null
        });

        let photoPath = null;
        if (req.file) {
            const newFilePath = path.join(__dirname, '../public/images/sales', req.file.originalname);
            if (!fs.existsSync(newFilePath)) {
                throw new Error('Не удалось сохранить файл');
            }
            photoPath = `/images/sales/${req.file.originalname}`;
            await sale.update({ photo: photoPath });
        }

        res.redirect('/sales/index.html');
    } catch (error) {
        console.error('Ошибка при создании продажи:', error);
        if (sale) await sale.destroy();
        res.status(500).send(`Ошибка при создании продажи: ${error.message}`);
    }
});

router.put('/api/sales/:id', authRequired, async (req, res) => {
    try {
        const sale = await Sale.findByPk(req.params.id);
        if (!sale) {
            return res.status(404).json({ error: 'Продажа не найдена' });
        }
        const { customerName, notes, deliveryAddress, paymentMethod, saleYear, isConfirmed, orderNumber, photo } = req.body;
        await sale.update({
            customerName,
            notes,
            deliveryAddress,
            paymentMethod,
            saleYear: parseInt(saleYear) || null,
            isConfirmed: isConfirmed === 'true' || isConfirmed === true,
            orderNumber,
            photo: photo ? photo.replace('/img/', '/images/') : null,
        });
        const formattedSale = {
            id: sale.id,
            customerName: sale.customerName,
            notes: sale.notes,
            deliveryAddress: sale.deliveryAddress,
            paymentMethod: sale.paymentMethod,
            saleYear: sale.saleYear,
            isConfirmed: sale.isConfirmed,
            orderNumber: sale.orderNumber,
            photo: sale.photo,
        };
        res.json(formattedSale);
    } catch (error) {
        console.error('Ошибка при обновлении продажи:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

router.post('/edit-sale/:id', authRequired, upload.single('photo'), async (req, res) => {
    try {
        const sale = await Sale.findByPk(req.params.id);
        if (!sale) {
            return res.status(404).send('Продажа не найдена');
        }
        const { customerName, notes, deliveryAddress, paymentMethod, saleYear, isConfirmed, orderNumber } = req.body;
        let photoPath = sale.photo;
        if (req.file) {
            const newFilePath = path.join(__dirname, '../public/images/sales', req.file.originalname);
            if (!fs.existsSync(newFilePath)) {
                throw new Error('Не удалось сохранить файл');
            }
            photoPath = `/images/sales/${req.file.originalname}`;
        }
        await sale.update({
            customerName: customerName.trim(),
            notes: notes ? notes.trim() : null,
            deliveryAddress: deliveryAddress ? deliveryAddress.trim() : null,
            paymentMethod: paymentMethod ? paymentMethod.trim() : null,
            saleYear: parseInt(saleYear) || null,
            isConfirmed: isConfirmed === 'true' || isConfirmed === true,
            orderNumber: orderNumber ? orderNumber.trim() : null,
            photo: photoPath,
        });
        res.redirect('/sales/index.html');
    } catch (error) {
        console.error('Ошибка при обновлении продажи:', error);
        res.status(500).send(`Ошибка сервера: ${error.message}`);
    }
});

router.delete('/delete-sale/:id', authRequired, async (req, res) => {
    try {
        const sale = await Sale.findByPk(req.params.id);
        if (!sale) {
            return res.status(404).json({ error: 'Продажа не найдена' });
        }
        await sale.destroy();
        res.json({ message: 'Продажа удалена' });
    } catch (error) {
        console.error('Ошибка при удалении продажи:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

module.exports = router;