'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sub_category_translations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      sub_category_id: {
        type: Sequelize.INTEGER,
        references: { model: 'sub_categories', key: 'id' },
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

    // Add index for faster queries on language
    await queryInterface.addIndex('sub_category_translations', ['language']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sub_category_translations');
  },
};
