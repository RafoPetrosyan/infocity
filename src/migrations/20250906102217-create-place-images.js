'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('place_images', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      place_id: {
        type: Sequelize.INTEGER,
        references: { model: 'places', key: 'id' },
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

    await queryInterface.addIndex('place_images', ['place_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('place_images', ['place_id']);
    await queryInterface.dropTable('place_images');
  },
};
