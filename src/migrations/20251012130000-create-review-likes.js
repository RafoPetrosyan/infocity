'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('review_likes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      review_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'reviews',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reply_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'review_replies',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Create a unique index to prevent duplicate likes from the same user
    await queryInterface.addIndex('review_likes', ['user_id', 'review_id'], {
      unique: true,
      where: {
        review_id: { [Sequelize.Op.ne]: null },
      },
      name: 'unique_user_review_like',
    });

    await queryInterface.addIndex('review_likes', ['user_id', 'reply_id'], {
      unique: true,
      where: {
        reply_id: { [Sequelize.Op.ne]: null },
      },
      name: 'unique_user_reply_like',
    });

    // Create indexes for performance
    await queryInterface.addIndex('review_likes', ['review_id']);
    await queryInterface.addIndex('review_likes', ['reply_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('review_likes');
  },
};

