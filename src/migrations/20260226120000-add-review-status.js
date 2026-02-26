'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('reviews', 'status', {
      type: Sequelize.ENUM('public', 'private', 'removed'),
      allowNull: false,
      defaultValue: 'public',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('reviews', 'status');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_reviews_status";',
    );
  },
};
