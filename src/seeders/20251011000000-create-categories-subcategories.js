'use strict';

const slugify = require('slugify');
const { Op } = require('sequelize');

const NAV_ITEMS = [
  { label: 'Attractions', icon: '🎡' },
  { label: 'Hotels', icon: '🏨' },
  { label: 'Eat', icon: '🍽️' },
  { label: 'Tourism', icon: '🧭' },
  { label: 'Vacation spots', icon: '🌴' },
  { label: 'Entertainment', icon: '🎭' },
  { label: 'Transport', icon: '🚌' },
  { label: 'Refills', icon: '⛽' },
  {
    label: 'Store',
    icon: '🛍️',
    subItems: [
      'Supermarkets',
      'Grocery',
      'Coffee',
      'Beer',
      'Sweets',
      'Shop',
      'Hardware',
      'Furniture',
      'Electronics',
    ],
  },
  {
    label: 'Services',
    icon: '🧰',
    subItems: [
      'Cosmetics and perfumes',
      'For baby',
      'Jewelry and accessories',
      'Flowers',
    ],
  },
  { label: 'Production', icon: '🏭' },
  { label: 'Medicine', icon: '🩺' },
];

function toSlug(str) {
  return slugify(str, { lower: true, strict: true });
}

module.exports = {
  up: async (queryInterface) => {
    const categoryRows = NAV_ITEMS.map((item, index) => ({
      slug: toSlug(item.label),
      image: item.icon,
      order: index + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const insertedCategories = await queryInterface.bulkInsert(
      'categories',
      categoryRows,
      { returning: ['id', 'slug'] },
    );

    const categoryTranslationRows = [];
    insertedCategories.forEach((category, index) => {
      const name = NAV_ITEMS[index].label;
      for (const language of ['en', 'hy', 'ru']) {
        categoryTranslationRows.push({
          category_id: category.id,
          language,
          name,
        });
      }
    });

    await queryInterface.bulkInsert(
      'category_translations',
      categoryTranslationRows,
    );

    const subCategoryRows = [];
    const subCategoryTranslationRows = [];

    insertedCategories.forEach((category, index) => {
      const item = NAV_ITEMS[index];
      if (item.subItems && item.subItems.length > 0) {
        item.subItems.forEach((subLabel, subIndex) => {
          subCategoryRows.push({
            slug: toSlug(subLabel),
            image: null,
            order: subIndex + 1,
            category_id: category.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        });
      }
    });

    if (subCategoryRows.length > 0) {
      const insertedSubCategories = await queryInterface.bulkInsert(
        'sub_categories',
        subCategoryRows,
        { returning: ['id'] },
      );

      let subItemIndex = 0;
      insertedCategories.forEach((category, index) => {
        const item = NAV_ITEMS[index];
        if (item.subItems && item.subItems.length > 0) {
          item.subItems.forEach((subLabel) => {
            const subCategory = insertedSubCategories[subItemIndex++];
            for (const language of ['en', 'hy', 'ru']) {
              subCategoryTranslationRows.push({
                sub_category_id: subCategory.id,
                language,
                name: subLabel,
              });
            }
          });
        }
      });

      await queryInterface.bulkInsert(
        'sub_category_translations',
        subCategoryTranslationRows,
      );
    }
  },

  down: async (queryInterface) => {
    const slugs = NAV_ITEMS.map((item) => toSlug(item.label));

    const [categories] = await queryInterface.sequelize.query(
      `SELECT id FROM categories WHERE slug IN (${slugs.map((s) => `'${s}'`).join(',')})`,
    );
    const categoryIds = categories.map((c) => c.id);

    if (categoryIds.length > 0) {
      const [subCategories] = await queryInterface.sequelize.query(
        `SELECT id FROM sub_categories WHERE category_id IN (${categoryIds.join(',')})`,
      );
      const subCategoryIds = subCategories.map((sc) => sc.id);

      if (subCategoryIds.length > 0) {
        await queryInterface.bulkDelete('sub_category_translations', {
          sub_category_id: { [Op.in]: subCategoryIds },
        });
        await queryInterface.bulkDelete('sub_categories', {
          category_id: { [Op.in]: categoryIds },
        });
      }

      await queryInterface.bulkDelete('category_translations', {
        category_id: { [Op.in]: categoryIds },
      });
      await queryInterface.bulkDelete('categories', {
        id: { [Op.in]: categoryIds },
      });
    }
  },
};

// yarn seed:run -- src/seeders/20251011000000-create-categories-subcategories.js
