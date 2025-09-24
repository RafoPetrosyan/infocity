'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('item_images', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      item_id: {
        type: Sequelize.INTEGER,
        references: { model: 'items', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('image', 'video'),
        defaultValue: 'image',
      },
      original: {
        type: Sequelize.STRING,
      },
      thumbnail: {
        type: Sequelize.STRING,
      },
    });

    await queryInterface.addIndex('item_images', ['item_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('item_images', ['item_id']);
    await queryInterface.dropTable('item_images');
  },
};


