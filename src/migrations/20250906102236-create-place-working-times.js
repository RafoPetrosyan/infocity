'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('place_working_times', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      place_id: {
        type: Sequelize.INTEGER,
        references: { model: 'places', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      weekday: {
        type: Sequelize.ENUM(
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
        ),
        allowNull: false,
      },
      start_time: {
        type: Sequelize.TIME,
      },
      end_time: {
        type: Sequelize.TIME,
      },
      is_working_day: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      breaks: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
    });

    await queryInterface.addIndex('place_working_times', ['place_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('place_working_times', ['place_id']);
    await queryInterface.dropTable('place_working_times');
  },
};
