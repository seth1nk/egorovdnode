module.exports = (sequelize, DataTypes) => {
    const Televisions = sequelize.define('Televisions', {
        id: { 
            type: DataTypes.BIGINT, 
            primaryKey: true, 
            autoIncrement: true, 
            comment: 'ID телевизора',
            field: 'id' 
        },
        name: { 
            type: DataTypes.STRING(255), 
            allowNull: false, 
            comment: 'Название модели телевизора',
            field: 'name' 
        },
        description: { 
            type: DataTypes.TEXT, 
            allowNull: true, 
            comment: 'Описание',
            field: 'description' 
        },
        brand: { 
            type: DataTypes.STRING(100), 
            allowNull: true, 
            comment: 'Бренд',
            field: 'brand' 
        },
        screenType: { 
            type: DataTypes.STRING(100), 
            allowNull: true, 
            comment: 'Тип экрана',
            field: 'screen_type' 
        },
        releaseYear: { 
            type: DataTypes.INTEGER, 
            allowNull: true, 
            comment: 'Год выпуска',
            field: 'release_year' 
        },
        isInStock: { 
            type: DataTypes.BOOLEAN, 
            defaultValue: true, 
            comment: 'В наличии',
            field: 'is_in_stock' 
        },
price: {
  type: DataTypes.DECIMAL(10, 2),
  allowNull: false,
  defaultValue: 0,
  comment: 'Цена (в рублях)',
  field: 'price'
},
        photo: { 
            type: DataTypes.STRING(255), 
            allowNull: true, 
            comment: 'Путь к изображению',
            field: 'photo' 
        }
    }, {
        tableName: 'televisions',
        timestamps: true,
        underscored: false // Отключаем преобразование в snake_case
    });
    return Televisions;
};