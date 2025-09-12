module.exports = (sequelize, DataTypes) => {
    const Bicycle = sequelize.define('Bicycle', {
        id: { 
            type: DataTypes.BIGINT, 
            primaryKey: true, 
            autoIncrement: true, 
            comment: 'ID велосипеда',
            field: 'id' 
        },
        model: { 
            type: DataTypes.STRING(255), 
            allowNull: false, 
            comment: 'Модель велосипеда',
            field: 'model' 
        },
        brand: { 
            type: DataTypes.STRING(100), 
            allowNull: true, 
            comment: 'Бренд',
            field: 'brand' 
        },
        type: { 
            type: DataTypes.STRING(100), 
            allowNull: true, 
            comment: 'Тип велосипеда',
            field: 'type' 
        },
        manufactureYear: { 
            type: DataTypes.INTEGER, 
            allowNull: true, 
            comment: 'Год выпуска',
            field: 'manufactureYear' 
        },
        condition: { 
            type: DataTypes.STRING(100), 
            allowNull: true, 
            comment: 'Состояние',
            field: 'condition' 
        },
        isAvailable: { 
            type: DataTypes.BOOLEAN, 
            defaultValue: true, 
            comment: 'Доступен для ремонта',
            field: 'isAvailable' 
        },
        color: { 
            type: DataTypes.STRING(255), 
            allowNull: true, 
            comment: 'Цвет',
            field: 'color' 
        },
        serialNumber: { 
            type: DataTypes.STRING(50), 
            allowNull: true, 
            comment: 'Серийный номер',
            field: 'serialNumber' 
        },
        photo: { 
            type: DataTypes.STRING(255), 
            allowNull: true, 
            comment: 'Путь к изображению',
            field: 'photo' 
        }
    }, {
        tableName: 'bicycles',
        timestamps: false,
        underscored: false // Отключаем преобразование в snake_case
    });
    return Bicycle;
};