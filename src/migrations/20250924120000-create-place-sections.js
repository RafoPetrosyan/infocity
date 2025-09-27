'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('place_sections', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      place_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'places', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    await queryInterface.addIndex('place_sections', ['place_id']);
    await queryInterface.addIndex('place_sections', ['is_active']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('place_sections', ['place_id']);
    await queryInterface.removeIndex('place_sections', ['is_active']);
    await queryInterface.dropTable('place_sections');
  },
};
