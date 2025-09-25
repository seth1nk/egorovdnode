module.exports = (sequelize, DataTypes) => {
    const Sales = sequelize.define('Sales', {
        id: { 
            type: DataTypes.BIGINT, 
            primaryKey: true, 
            autoIncrement: true, 
            comment: 'ID продажи',
            field: 'id' 
        },
        customerName: { 
            type: DataTypes.STRING(255), 
            allowNull: false, 
            comment: 'Имя клиента',
            field: 'customer_name' 
        },
        notes: { 
            type: DataTypes.TEXT, 
            allowNull: true, 
            comment: 'Комментарий к заказу',
            field: 'notes' 
        },
        deliveryAddress: { 
            type: DataTypes.STRING(100), 
            allowNull: true, 
            comment: 'Адрес доставки',
            field: 'delivery_address' 
        },
        paymentMethod: { 
            type: DataTypes.STRING(100), 
            allowNull: true, 
            comment: 'Способ оплаты',
            field: 'payment_method' 
        },
        saleYear: { 
            type: DataTypes.INTEGER, 
            allowNull: true, 
            comment: 'Год продажи',
            field: 'sale_year' 
        },
        isConfirmed: { 
            type: DataTypes.BOOLEAN, 
            defaultValue: false, 
            comment: 'Подтверждена',
            field: 'is_confirmed' 
        },
        orderNumber: { 
            type: DataTypes.STRING(255), 
            allowNull: true, 
            comment: 'Номер заказа',
            field: 'order_number' 
        },
        photo: { 
            type: DataTypes.STRING(255), 
            allowNull: true, 
            comment: 'Путь к изображению',
            field: 'photo' 
        }
    }, {
        tableName: 'sales',
        timestamps: true,
        underscored: false // Отключаем преобразование в snake_case
    });
    return Sales;
};