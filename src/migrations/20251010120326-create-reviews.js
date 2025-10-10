'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      entity_type: {
        type: Sequelize.ENUM('place', 'event'),
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable('review_emotions', {
      review_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'reviews',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        primaryKey: true,
      },
      emotion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'emotions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        primaryKey: true,
      },
    });

    // Add unique constraint to prevent duplicate emotions per review
    await queryInterface.addConstraint('review_emotions', {
      fields: ['review_id', 'emotion_id'],
      type: 'unique',
      name: 'uq_review_emotions',
    });

    // Add index for better query performance
    await queryInterface.addIndex('reviews', ['entity_id', 'entity_type']);
    await queryInterface.addIndex('reviews', ['user_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('review_emotions');
    await queryInterface.dropTable('reviews');
  },
};
