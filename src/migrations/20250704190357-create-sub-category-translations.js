'use strict';

/** @type {import('sequelize-cli').Migration} */
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
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });

    await queryInterface.addIndex(
      'sub_category_translations',
      ['sub_category_id', 'language'],
      {
        unique: true,
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sub_category_translations');
  },
};
