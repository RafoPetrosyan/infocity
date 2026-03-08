'use strict';

const { Op } = require('sequelize');

const EMOTIONS = [
  {
    label: {
      en: 'Calm, cozy, comfortable',
      hy: 'Հանգիստ, հարմար',
      ru: 'Спокойствие, уют',
    },
    color: '#22c55e',
    icon: 'leaf',
  },
  {
    label: {
      en: 'Drive, adrenaline',
      hy: 'Ուժ, ադրենալին',
      ru: 'Драйв, адреналин',
    },
    color: '#ef4444',
    icon: 'flame',
  },
  {
    label: {
      en: 'Romance, love',
      hy: 'Ռոմանտիկա, սեր',
      ru: 'Романтика, любовь',
    },
    color: '#ec4899',
    icon: 'heart',
  },
  {
    label: {
      en: 'Fun, happy',
      hy: 'Զվարճանք, երջանկություն',
      ru: 'Веселье, радость',
    },
    color: '#f59e0b',
    icon: 'mask',
  },
  {
    label: {
      en: 'Discovery, Learning',
      hy: 'Բացահայտում, ուսուցում',
      ru: 'Открытия, учёба',
    },
    color: '#8b5cf6',
    icon: 'lightbulb',
  },
  {
    label: {
      en: 'Working, Business',
      hy: 'Աշխատանք, բիզնես',
      ru: 'Работа, бизнес',
    },
    color: '#3b82f6',
    icon: 'briefcase',
  },
  {
    label: {
      en: 'Status, rating, respect',
      hy: 'Կարգավիճակ, վարկանիշ',
      ru: 'Статус, рейтинг',
    },
    color: '#eab308',
    icon: 'crown',
  },
];

module.exports = {
  up: async (queryInterface) => {
    const emotionRows = EMOTIONS.map((emotion, index) => ({
      icon: emotion.icon,
      color: emotion.color,
      order: index + 1,
    }));

    const insertedEmotions = await queryInterface.bulkInsert(
      'emotions',
      emotionRows,
      { returning: ['id'] },
    );

    const translationRows = [];
    insertedEmotions.forEach((emotion, index) => {
      const data = EMOTIONS[index];
      for (const [language, name] of Object.entries(data.label)) {
        translationRows.push({
          emotion_id: emotion.id,
          language,
          name,
        });
      }
    });

    await queryInterface.bulkInsert('emotion_translations', translationRows);
  },

  down: async (queryInterface) => {
    const icons = EMOTIONS.map((e) => e.icon);
    const [emotions] = await queryInterface.sequelize.query(
      `SELECT id FROM emotions WHERE icon IN (${icons.map((i) => `'${i}'`).join(',')})`,
    );
    const ids = emotions.map((e) => e.id);
    if (ids.length > 0) {
      await queryInterface.bulkDelete('emotion_translations', {
        emotion_id: { [Op.in]: ids },
      });
      await queryInterface.bulkDelete('emotions', { id: { [Op.in]: ids } });
    }
  },
};

// yarn seed:run -- src/seeders/20250816084400-create-emotions.js
