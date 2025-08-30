'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('emotion_translations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      emotion_id: {
        type: Sequelize.INTEGER,
        references: { model: 'emotions', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      language: {
        type: Sequelize.ENUM('en', 'hy', 'ru'),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });

    // Add index for faster queries on language
    await queryInterface.addIndex('emotion_translations', ['language']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('emotion_translations');
  },
};
