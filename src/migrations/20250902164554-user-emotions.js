'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_emotions', {
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
    });

    await queryInterface.addConstraint('user_emotions', {
      fields: ['user_id', 'emotion_id'],
      type: 'primary key',
      name: 'pk_user_emotions',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_emotions');
  },
};
