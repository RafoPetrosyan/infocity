'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cities', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      province_id: {
        type: Sequelize.INTEGER,
        references: { model: 'provinces', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('cities');
  },
};
