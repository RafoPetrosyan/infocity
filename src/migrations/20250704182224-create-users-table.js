'use strict';

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
      phone_number: { type: Sequelize.STRING },
      verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      login_type: {
        type: Sequelize.ENUM('email', 'google', 'facebook'),
        defaultValue: 'email',
      },
      role: {
        type: Sequelize.ENUM('user', 'admin', 'super-admin', 'business'),
        defaultValue: 'user',
      },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  },
};
