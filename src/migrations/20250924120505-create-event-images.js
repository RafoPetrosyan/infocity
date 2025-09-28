'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('event_images', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM('image', 'video'),
        defaultValue: 'image',
      },
      original: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      thumbnail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('event_images', ['event_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('event_images');
  },
};
