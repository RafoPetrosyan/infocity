'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('event_category_translations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      event_category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'event_categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    await queryInterface.addIndex(
      'event_category_translations',
      ['event_category_id', 'language'],
      {
        unique: true,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('event_category_translations');
  },
};
