'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('menu_translations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      menu_id: {
        type: Sequelize.INTEGER,
        references: { model: 'menus', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      language: {
        type: Sequelize.ENUM('en', 'hy', 'ru'),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
      },
    });

    await queryInterface.addIndex(
      'menu_translations',
      ['menu_id', 'language'],
      {
        unique: true,
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('menu_translations');
  },
};


