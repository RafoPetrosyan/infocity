'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('province_translations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      province_id: {
        type: Sequelize.INTEGER,
        references: { model: 'provinces', key: 'id' },
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
    await queryInterface.addIndex('province_translations', ['language']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('province_translations');
  },
};
