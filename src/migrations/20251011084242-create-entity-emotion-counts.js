'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('entity_emotion_counts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      entity_type: {
        type: Sequelize.ENUM('place', 'event'),
        allowNull: false,
      },

      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
      },

      count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    // Unique constraint — one record per entity/emotion pair
    await queryInterface.addConstraint('entity_emotion_counts', {
      fields: ['entity_type', 'entity_id', 'emotion_id'],
      type: 'unique',
      name: 'uq_entity_emotion_counts_unique',
    });

    // Index for quick lookups by entity
    await queryInterface.addIndex(
      'entity_emotion_counts',
      ['entity_type', 'entity_id'],
      {
        name: 'idx_entity_emotion_counts_entity',
      },
    );
  },

  async down(queryInterface, Sequelize) {
    // Drop indexes and constraints explicitly (optional but clean)
    await queryInterface.removeIndex(
      'entity_emotion_counts',
      'idx_entity_emotion_counts_entity',
    );
    await queryInterface.removeConstraint(
      'entity_emotion_counts',
      'uq_entity_emotion_counts_unique',
    );

    // Drop ENUM first (important for Postgres)
    await queryInterface.dropTable('entity_emotion_counts');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_entity_emotion_counts_entity_type";',
    );
  },
};
