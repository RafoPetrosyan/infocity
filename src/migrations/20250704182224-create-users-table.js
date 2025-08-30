'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      first_name: { type: Sequelize.STRING, allowNull: false },
      last_name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, unique: true, allowNull: false },
      password: { type: Sequelize.STRING },
      avatar: { type: Sequelize.STRING },
      phone_number: { type: Sequelize.STRING(30) },
      phone_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      email_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      login_type: {
        type: Sequelize.ENUM('phone', 'google', 'facebook', 'apple', 'email'),
        defaultValue: 'email',
      },
      role: {
        type: Sequelize.ENUM('user', 'admin', 'super-admin'),
        defaultValue: 'user',
      },
      locale: {
        type: Sequelize.ENUM('hy', 'en', 'ru'),
      },
      refresh_token: { type: Sequelize.STRING },
      fcm_token: { type: Sequelize.STRING },
      latitude: { type: Sequelize.DECIMAL(10, 8) },
      longitude: { type: Sequelize.DECIMAL(11, 8) },
      location: { type: Sequelize.GEOMETRY('POINT') },

      city_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'cities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  },
};
