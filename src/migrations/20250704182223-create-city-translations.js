'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('city_translations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      city_id: {
        type: Sequelize.INTEGER,
        references: { model: 'cities', key: 'id' },
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
      'city_translations',
      ['city_id', 'language'],
      {
        unique: true,
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('city_translations');
  },
};
