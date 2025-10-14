'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create user_contacts table with status
    await queryInterface.createTable('user_contacts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      contact_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted'),
        allowNull: false,
        defaultValue: 'pending',
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

    // Add unique constraint to prevent duplicate contacts
    await queryInterface.addIndex(
      'user_contacts',
      ['user_id', 'contact_id'],
      {
        unique: true,
        name: 'user_contacts_unique',
      },
    );

    // Add indexes for better query performance
    await queryInterface.addIndex('user_contacts', ['user_id']);
    await queryInterface.addIndex('user_contacts', ['contact_id']);
    await queryInterface.addIndex('user_contacts', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_contacts');
  },
};
