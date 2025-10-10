'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_follows', {
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
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      entity_type: {
        type: Sequelize.ENUM('place', 'event'),
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

    // Add unique constraint to prevent duplicate follows
    await queryInterface.addIndex(
      'user_follows',
      ['user_id', 'entity_id', 'entity_type'],
      {
        unique: true,
        name: 'user_follows_unique',
      },
    );

    // Add indexes for better query performance
    await queryInterface.addIndex('user_follows', ['user_id']);
    await queryInterface.addIndex('user_follows', ['entity_id', 'entity_type']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_follows');
  },
};
