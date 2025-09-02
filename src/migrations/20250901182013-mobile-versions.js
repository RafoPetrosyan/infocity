'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mobile_versions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      ios_version: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '1.0.0',
      },
      android_version: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '1.0.0',
      },
      force_update: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      app_working: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // insert one default row
    await queryInterface.bulkInsert('mobile_versions', [
      {
        ios_version: '1.0.0',
        android_version: '1.0.0',
        force_update: false,
        app_working: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mobile_versions');
  },
};
