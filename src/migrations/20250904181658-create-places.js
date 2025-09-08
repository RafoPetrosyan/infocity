'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('places', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      logo: {
        type: Sequelize.STRING,
      },
      image: {
        type: Sequelize.STRING,
      },
      image_original: {
        type: Sequelize.STRING,
      },
      latitude: { type: Sequelize.DECIMAL(10, 8) },
      longitude: { type: Sequelize.DECIMAL(11, 8) },
      location: { type: Sequelize.GEOMETRY('POINT') },
      social_links: { type: Sequelize.JSONB },
      city_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'cities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      email: { type: Sequelize.STRING },
      phone_number: { type: Sequelize.STRING(30) },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('places', ['city_id']);
    await queryInterface.addIndex('places', ['category_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('places', ['city_id']);
    await queryInterface.removeIndex('places', ['category_id']);
    await queryInterface.dropTable('places');
  },
};
