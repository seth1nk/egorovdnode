module.exports = (sequelize, DataTypes) => {
    const RepairService = sequelize.define('RepairService', {
        id: { 
            type: DataTypes.BIGINT, 
            primaryKey: true, 
            autoIncrement: true, 
            comment: 'ID услуги ремонта',
            field: 'id' 
        },
        name: { 
            type: DataTypes.STRING(255), 
            allowNull: false, 
            comment: 'Название услуги',
            field: 'name' 
        },
        description: { 
            type: DataTypes.TEXT, 
            allowNull: true, 
            comment: 'Описание услуги',
            field: 'description' 
        },
        cost: { 
            type: DataTypes.DECIMAL, 
            allowNull: true, 
            comment: 'Стоимость услуги',
            field: 'cost' 
        },
        category: { 
            type: DataTypes.STRING(100), 
            allowNull: true, 
            comment: 'Категория услуги',
            field: 'category' 
        },
        durationMinutes: { 
            type: DataTypes.INTEGER, 
            allowNull: true, 
            comment: 'Среднее время выполнения (в минутах)',
            field: 'durationMinutes' 
        },
        isAvailable: { 
            type: DataTypes.BOOLEAN, 
            defaultValue: true, 
            comment: 'Доступна',
            field: 'isAvailable' 
        },
        requiredTools: { 
            type: DataTypes.STRING(255), 
            allowNull: true, 
            comment: 'Требуемые инструменты',
            field: 'requiredTools' 
        },
        difficultyLevel: { 
            type: DataTypes.STRING(100), 
            allowNull: true, 
            comment: 'Уровень сложности',
            field: 'difficultyLevel' 
        },
        photo: { 
            type: DataTypes.STRING(255), 
            allowNull: true, 
            comment: 'Путь к изображению',
            field: 'photo' 
        }
    }, {
        tableName: 'repair_services',
        timestamps: false,
        underscored: false // Отключаем преобразование в snake_case
    });
    return RepairService;
};