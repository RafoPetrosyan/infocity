module.exports = {
  up: async (queryInterface) => {
    const provinces = [
      {
        slug: 'yerevan',
        translations: {
          en: 'Yerevan',
          hy: 'Երևան',
          ru: 'Ереван',
        },
        cities: [
          {
            slug: 'yerevan',
            translations: { en: 'Yerevan', hy: 'Երևան', ru: 'Ереван' },
          },
        ],
      },
      {
        slug: 'aragatsotn',
        translations: {
          en: 'Aragatsotn',
          hy: 'Արագածոտն',
          ru: 'Арагацотн',
        },
        cities: [
          {
            slug: 'ashtarak',
            translations: { en: 'Ashtarak', hy: 'Աշտարակ', ru: 'Аштарак' },
          },
          {
            slug: 'aparan',
            translations: { en: 'Aparan', hy: 'Ապարան', ru: 'Апаран' },
          },
          {
            slug: 'talin',
            translations: { en: 'Talin', hy: 'Թալին', ru: 'Талин' },
          },
        ],
      },
      {
        slug: 'ararat',
        translations: {
          en: 'Ararat',
          hy: 'Արարատ',
          ru: 'Арарат',
        },
        cities: [
          {
            slug: 'artashat',
            translations: { en: 'Artashat', hy: 'Արտաշատ', ru: 'Арташат' },
          },
          {
            slug: 'ararat',
            translations: { en: 'Ararat', hy: 'Արարատ', ru: 'Арарат' },
          },
          {
            slug: 'vedi',
            translations: { en: 'Vedi', hy: 'Վեդի', ru: 'Веди' },
          },
          {
            slug: 'masis',
            translations: { en: 'Masis', hy: 'Մասիս', ru: 'Масис' },
          },
        ],
      },
      {
        slug: 'armavir',
        translations: {
          en: 'Armavir',
          hy: 'Արմավիր',
          ru: 'Армавир',
        },
        cities: [
          {
            slug: 'armavir',
            translations: { en: 'Armavir', hy: 'Արմավիր', ru: 'Армавир' },
          },
          {
            slug: 'echmiadzin',
            translations: { en: 'Echmiadzin', hy: 'Էջմիածին', ru: 'Эчмиадзин' },
          },
        ],
      },
      {
        slug: 'gegharkunik',
        translations: {
          en: 'Gegharkunik',
          hy: 'Գեղարքունիք',
          ru: 'Гегаркуник',
        },
        cities: [
          {
            slug: 'gavar',
            translations: { en: 'Gavar', hy: 'Գավառ', ru: 'Гавар' },
          },
          {
            slug: 'martuni',
            translations: { en: 'Martuni', hy: 'Մարտունի', ru: 'Мартуни' },
          },
          {
            slug: 'sevan',
            translations: { en: 'Sevan', hy: 'Սևան', ru: 'Севан' },
          },
          {
            slug: 'vardenis',
            translations: { en: 'Vardenis', hy: 'Վարդենիս', ru: 'Варденис' },
          },
        ],
      },
      {
        slug: 'kotayk',
        translations: {
          en: 'Kotayk',
          hy: 'Կոտայք',
          ru: 'Котайк',
        },
        cities: [
          {
            slug: 'hrazdan',
            translations: { en: 'Hrazdan', hy: 'Հրազդան', ru: 'Раздан' },
          },
          {
            slug: 'abovyan',
            translations: { en: 'Abovyan', hy: 'Աբովյան', ru: 'Абовян' },
          },
          {
            slug: 'charentsavan',
            translations: {
              en: 'Charentsavan',
              hy: 'Չարենցավան',
              ru: 'Чаренцаван',
            },
          },
          {
            slug: 'tsaghkadzor',
            translations: {
              en: 'Tsaghkadzor',
              hy: 'Ծաղկաձոր',
              ru: 'Цахкадзор',
            },
          },
        ],
      },
      {
        slug: 'lori',
        translations: {
          en: 'Lori',
          hy: 'Լոռի',
          ru: 'Лори',
        },
        cities: [
          {
            slug: 'vanadzor',
            translations: { en: 'Vanadzor', hy: 'Վանաձոր', ru: 'Ванадзор' },
          },
          {
            slug: 'stepanavan',
            translations: {
              en: 'Stepanavan',
              hy: 'Ստեփանավան',
              ru: 'Степанаван',
            },
          },
          {
            slug: 'alaverdi',
            translations: { en: 'Alaverdi', hy: 'Ալավերդի', ru: 'Алаверди' },
          },
          {
            slug: 'spitak',
            translations: { en: 'Spitak', hy: 'Սպիտակ', ru: 'Спитак' },
          },
        ],
      },
      {
        slug: 'shirak',
        translations: {
          en: 'Shirak',
          hy: 'Շիրակ',
          ru: 'Ширак',
        },
        cities: [
          {
            slug: 'gyumri',
            translations: { en: 'Gyumri', hy: 'Գյումրի', ru: 'Гюмри' },
          },
          {
            slug: 'artik',
            translations: { en: 'Artik', hy: 'Արթիկ', ru: 'Артик' },
          },
          {
            slug: 'ashocq',
            translations: { en: 'Ashocq', hy: 'Աշոցք', ru: 'Ашоцк' },
          },
        ],
      },
      {
        slug: 'syunik',
        translations: {
          en: 'Syunik',
          hy: 'Սյունիք',
          ru: 'Сюник',
        },
        cities: [
          {
            slug: 'kapan',
            translations: { en: 'Kapan', hy: 'Կապան', ru: 'Капан' },
          },
          {
            slug: 'goris',
            translations: { en: 'Goris', hy: 'Գորիս', ru: 'Горис' },
          },
          {
            slug: 'meghri',
            translations: { en: 'Meghri', hy: 'Մեղրի', ru: 'Мегри' },
          },
          {
            slug: 'sisian',
            translations: { en: 'Sisian', hy: 'Սիսիան', ru: 'Сисиан' },
          },
        ],
      },
      {
        slug: 'tavush',
        translations: {
          en: 'Tavush',
          hy: 'Տավուշ',
          ru: 'Тавуш',
        },
        cities: [
          {
            slug: 'ijevan',
            translations: { en: 'Ijevan', hy: 'Իջևան', ru: 'Иджеван' },
          },
          {
            slug: 'dilijan',
            translations: { en: 'Dilijan', hy: 'Դիլիջան', ru: 'Дилижан' },
          },
          {
            slug: 'berd',
            translations: { en: 'Berd', hy: 'Բերդ', ru: 'Берд' },
          },
          {
            slug: 'noyemberyan',
            translations: {
              en: 'Noyemberyan',
              hy: 'Նոյեմբերյան',
              ru: 'Ноемберян',
            },
          },
        ],
      },
      {
        slug: 'vayots-dzor',
        translations: {
          en: 'Vayots Dzor',
          hy: 'Վայոց ձոր',
          ru: 'Вайоц Дзор',
        },
        cities: [
          {
            slug: 'yeghegnadzor',
            translations: {
              en: 'Yeghegnadzor',
              hy: 'Եղեգնաձոր',
              ru: 'Ехегнадзор',
            },
          },
          {
            slug: 'vayk',
            translations: { en: 'Vayk', hy: 'Վայք', ru: 'Вайк' },
          },
          {
            slug: 'jermuk',
            translations: { en: 'Jermuk', hy: 'Ջերմուկ', ru: 'Джермук' },
          },
        ],
      },
    ];

    const provinceRows = [];
    const provinceTranslationRows = [];
    const cityRows = [];
    const cityTranslationRows = [];

    let provinceId = 1;
    let cityId = 1;

    for (const province of provinces) {
      provinceRows.push({
        id: provinceId,
        slug: province.slug,
      });

      for (const [language, name] of Object.entries(province.translations)) {
        provinceTranslationRows.push({
          province_id: provinceId,
          language,
          name,
        });
      }

      for (const city of province.cities) {
        cityRows.push({
          id: cityId,
          province_id: provinceId,
          slug: city.slug,
        });

        for (const [language, name] of Object.entries(city.translations)) {
          cityTranslationRows.push({
            city_id: cityId,
            language,
            name,
          });
        }

        cityId++;
      }

      provinceId++;
    }

    await queryInterface.bulkInsert('provinces', provinceRows);
    await queryInterface.bulkInsert(
      'province_translations',
      provinceTranslationRows,
    );
    await queryInterface.bulkInsert('cities', cityRows);
    await queryInterface.bulkInsert('city_translations', cityTranslationRows);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('city_translations', null, {});
    await queryInterface.bulkDelete('cities', null, {});
    await queryInterface.bulkDelete('province_translations', null, {});
    await queryInterface.bulkDelete('provinces', null, {});
  },
};
