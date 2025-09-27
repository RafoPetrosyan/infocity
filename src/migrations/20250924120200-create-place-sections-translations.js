'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('place_section_translations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      place_section_id: {
        type: Sequelize.INTEGER,
        references: { model: 'place_sections', key: 'id' },
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
      'place_section_translations',
      ['place_section_id', 'language'],
      {
        unique: true,
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('place_section_translations');
  },
};


