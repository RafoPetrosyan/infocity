'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('items', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      place_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'places', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      menu_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // optional: item can belong to place only
        references: { model: 'menus', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      image: {
        type: Sequelize.STRING,
      },
      image_original: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'AMD',
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
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

    await queryInterface.addIndex('items', ['place_id']);
    await queryInterface.addIndex('items', ['menu_id']);
    await queryInterface.addIndex('items', ['is_available']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('items', ['place_id']);
    await queryInterface.removeIndex('items', ['menu_id']);
    await queryInterface.removeIndex('items', ['is_available']);
    await queryInterface.dropTable('items');
  },
};


