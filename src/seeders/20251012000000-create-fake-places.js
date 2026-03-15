const bcrypt = require('bcryptjs');

// External image URLs — works in any environment (local/server). Replace with your own list if needed.
const EXTERNAL_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
  'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800',
  'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
  'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400',
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Starting to seed fake places...');

    // Step 2: Create several fake users
    const password = await bcrypt.hash('password123', 10);
    const usersToCreate = [];
    for (let i = 1; i <= 10; i++) {
      usersToCreate.push({
        first_name: `User${i}`,
        last_name: `Test${i}`,
        email: `user${i}@test.com`,
        password: password,
        email_verified: true,
        phone_verified: true,
        avatar: null,
        login_type: 'email',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log('Creating fake users...');
    const createdUsers = await queryInterface.bulkInsert(
      'users',
      usersToCreate,
      {
        returning: ['id'],
      },
    );
    console.log(`Created ${createdUsers.length} users`);

    // Step 3: Get all cities
    const cities = await queryInterface.sequelize.query(
      'SELECT id FROM cities',
      { type: Sequelize.QueryTypes.SELECT },
    );
    const cityIds = cities.map((c) => c.id);
    console.log(`Found ${cityIds.length} cities`);

    // Step 4: Get all categories
    const categories = await queryInterface.sequelize.query(
      'SELECT id FROM categories',
      { type: Sequelize.QueryTypes.SELECT },
    );
    const categoryIds = categories.map((c) => c.id);
    console.log(`Found ${categoryIds.length} categories`);

    // Step 4b: Get sub_categories grouped by category_id (for dynamic sub_category_id)
    const subCategories = await queryInterface.sequelize.query(
      'SELECT id, category_id FROM sub_categories',
      { type: Sequelize.QueryTypes.SELECT },
    );
    const subCategoriesByCategory = {};
    for (const sc of subCategories) {
      if (!subCategoriesByCategory[sc.category_id]) {
        subCategoriesByCategory[sc.category_id] = [];
      }
      subCategoriesByCategory[sc.category_id].push(sc.id);
    }
    console.log(
      `Found ${subCategories.length} sub_categories across ${Object.keys(subCategoriesByCategory).length} categories`,
    );

    // Step 4c: Get all emotions (for entity_emotion_counts)
    const emotions = await queryInterface.sequelize.query(
      'SELECT id FROM emotions',
      { type: Sequelize.QueryTypes.SELECT },
    );
    const emotionIds = emotions.map((e) => e.id);
    console.log(`Found ${emotionIds.length} emotions`);

    // Step 5: Get user IDs (including newly created ones)
    const users = await queryInterface.sequelize.query('SELECT id FROM users', {
      type: Sequelize.QueryTypes.SELECT,
    });
    const userIds = users.map((u) => u.id);
    console.log(`Total users available: ${userIds.length}`);

    // Helper functions
    const getRandomElement = (arr) =>
      arr[Math.floor(Math.random() * arr.length)];

    const getRandomInt = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const generatePhoneNumber = () => {
      const prefix = '+374';
      const number = Math.floor(10000000 + Math.random() * 90000000);
      return `${prefix}${number}`;
    };

    const generateCoordinates = () => {
      // Armenia coordinates range
      const lat = 40.0 + Math.random() * 1.5; // ~40.0 to 41.5
      const lng = 43.5 + Math.random() * 2.5; // ~43.5 to 46.0
      return {
        latitude: parseFloat(lat.toFixed(8)),
        longitude: parseFloat(lng.toFixed(8)),
      };
    };

    const placeNames = {
      restaurants: [
        'Bella Italia',
        'Dragon Sushi',
        'Golden Spoon',
        'Ocean View',
        'Mountain Peak',
        'City Lights',
        'Garden Terrace',
        'Royal Palace',
        'Blue Lagoon',
        'Sunset Grill',
        'Silver Fork',
        'The Grand Table',
        'Fusion Kitchen',
        'Spice Route',
        'Harbor Bistro',
      ],
      cafes: [
        'Coffee House',
        'Bean & Brew',
        'Cozy Corner',
        'Morning Glory',
        'Urban Cafe',
        'Steam Coffee',
        'Aroma Point',
        'Latte Art',
        'Daily Grind',
        'Espresso Bar',
        'Cup of Joy',
        'Roasted Dreams',
        'Café Central',
        'The Bean Scene',
        'Mocha Magic',
      ],
      hotels: [
        'Grand Hotel',
        'Plaza Inn',
        'Royal Suites',
        'Paradise Resort',
        'Luxury Stay',
        'Comfort Inn',
        'Elite Hotel',
        'Golden Palace',
        'Riverside Hotel',
        'Mountain View',
        'Central Hotel',
        'Victoria Palace',
        'Ambassador Hotel',
        'Royal Crown',
        'Diamond Hotel',
      ],
      shops: [
        'Fashion Boutique',
        'Style Gallery',
        'Trendy Shop',
        'Modern Store',
        'Elite Fashion',
        'Urban Wear',
        'Classic Style',
        'Premium Shop',
        'Design Store',
        'Fashion Hub',
        'Luxury Boutique',
        'Style Point',
        'Fashion Central',
        'Trend Setters',
        'Chic Shop',
      ],
      general: [
        'City Center',
        'Main Street',
        'Central Plaza',
        'Downtown Hub',
        'Urban Space',
        'Metro Point',
        'Business Center',
        'The Square',
        'Market Place',
        'City Park',
      ],
    };

    const descriptions = [
      'A wonderful place with excellent service and great atmosphere.',
      'Experience premium quality and professional service.',
      'Your perfect destination for memorable moments.',
      'Where quality meets excellence.',
      'Discover unique experiences in a comfortable environment.',
      'The best choice for discerning customers.',
      'Modern comfort and traditional values.',
      'Excellence in every detail.',
      'Creating unforgettable experiences since day one.',
      'Your trusted partner for quality services.',
    ];

    const armenianNames = [
      'Արարատ',
      'Սևան',
      'Մասիս',
      'Գարնի',
      'Հրազդան',
      'Արագած',
      'Դիլիջան',
      'Գորիս',
      'Կապան',
      'Վանաձոր',
    ];

    const russianNames = [
      'Центральный',
      'Престиж',
      'Элитный',
      'Премиум',
      'Королевский',
      'Золотой',
      'Современный',
      'Люкс',
      'Империал',
      'Классика',
    ];

    // Step 6: Generate places in batches
    const TOTAL_PLACES = 100000;
    const BATCH_SIZE = 5000;
    const batches = Math.ceil(TOTAL_PLACES / BATCH_SIZE);

    console.log(`Generating ${TOTAL_PLACES} places in ${batches} batches...`);

    let placesCreated = 0;
    const startTime = Date.now();

    for (let batch = 0; batch < batches; batch++) {
      const placesInBatch = Math.min(BATCH_SIZE, TOTAL_PLACES - placesCreated);
      const places = [];
      const placeTranslations = [];

      for (let i = 0; i < placesInBatch; i++) {
        const coords = generateCoordinates();
        const imageIndex = Math.floor(Math.random() * EXTERNAL_IMAGE_URLS.length);
        const imageUrl = EXTERNAL_IMAGE_URLS[imageIndex];
        // Use same URL for both (app can resize client-side or use CDN params)
        const thumbUrl = imageUrl;
        const allNames = Object.values(placeNames).flat();
        const baseName = getRandomElement(allNames);
        const uniqueName = `${baseName} ${placesCreated + i + 1}`;
        const slug = `${baseName.toLowerCase().replace(/\s+/g, '-')}-${placesCreated + i + 1}`;

        const categoryId = getRandomElement(categoryIds);
        const subIds = subCategoriesByCategory[categoryId];
        const subCategoryId =
          subIds && subIds.length > 0 ? getRandomElement(subIds) : null;

        const place = {
          slug: slug,
          image: thumbUrl,
          image_original: imageUrl,
          latitude: coords.latitude,
          longitude: coords.longitude,
          location: Sequelize.fn(
            'ST_SetSRID',
            Sequelize.fn('ST_MakePoint', coords.longitude, coords.latitude),
            4326,
          ),
          address: `Street ${getRandomInt(1, 100)}, Building ${getRandomInt(1, 50)}`,
          city_id: getRandomElement(cityIds),
          category_id: categoryId,
          sub_category_id: subCategoryId,
          user_id: getRandomElement(userIds),
          email:
            Math.random() > 0.5
              ? `contact${placesCreated + i}@example.com`
              : null,
          phone_number: Math.random() > 0.5 ? generatePhoneNumber() : null,
          social_links:
            Math.random() > 0.7
              ? JSON.stringify([
                  {
                    platform: 'facebook',
                    url: `https://facebook.com/${slug}`,
                  },
                ])
              : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        places.push(place);
      }

      // Insert places
      console.log(`Inserting batch ${batch + 1}/${batches}...`);
      const insertedPlaces = await queryInterface.bulkInsert('places', places, {
        returning: ['id', 'slug'],
      });

      // Create translations for each place
      console.log(`Creating translations for batch ${batch + 1}/${batches}...`);
      for (let i = 0; i < insertedPlaces.length; i++) {
        const place = insertedPlaces[i];
        const baseName = place.slug.split('-').slice(0, -1).join(' ');
        const titleCaseName = baseName.replace(/\b\w/g, (l) => l.toUpperCase());

        const translations = [
          {
            place_id: place.id,
            language: 'en',
            name: titleCaseName,
            description: getRandomElement(descriptions),
            about: `Welcome to ${titleCaseName}. ${getRandomElement(descriptions)}`,
          },
          {
            place_id: place.id,
            language: 'hy',
            name: `${getRandomElement(armenianNames)} ${titleCaseName}`,
            description:
              'Հիանալի վայր գերազանց սպասարկմամբ և հրաշալի մթնոլորտով։',
            about:
              'Բարի գալուստ մեր հաստատություն։ Մենք առաջարկում ենք բարձրակարգ ծառայություններ։',
          },
          {
            place_id: place.id,
            language: 'ru',
            name: `${getRandomElement(russianNames)} ${titleCaseName}`,
            description:
              'Прекрасное место с отличным обслуживанием и замечательной атмосферой.',
            about:
              'Добро пожаловать в наше заведение. Мы предлагаем услуги высокого качества.',
          },
        ];

        placeTranslations.push(...translations);
      }

      // Insert translations in smaller sub-batches to avoid memory issues
      const TRANSLATION_BATCH_SIZE = 10000;
      for (
        let j = 0;
        j < placeTranslations.length;
        j += TRANSLATION_BATCH_SIZE
      ) {
        const translationBatch = placeTranslations.slice(
          j,
          j + TRANSLATION_BATCH_SIZE,
        );
        await queryInterface.bulkInsert('place_translations', translationBatch);
      }

      // Create entity_emotion_counts for places (from existing emotions)
      if (emotionIds.length > 0) {
        const emotionCounts = [];
        for (const place of insertedPlaces) {
          // Each place gets 1–4 random emotions with a count
          const numEmotions = getRandomInt(1, Math.min(4, emotionIds.length));
          const used = new Set();
          while (used.size < numEmotions) {
            const emotionId = getRandomElement(emotionIds);
            if (used.has(emotionId)) continue;
            used.add(emotionId);
            emotionCounts.push({
              entity_type: 'place',
              entity_id: place.id,
              emotion_id: emotionId,
              count: getRandomInt(1, 100),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }
        if (emotionCounts.length > 0) {
          await queryInterface.bulkInsert('entity_emotion_counts', emotionCounts);
        }
      }

      placesCreated += placesInBatch;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      const rate = ((placesCreated / (Date.now() - startTime)) * 1000).toFixed(
        2,
      );
      console.log(
        `Progress: ${placesCreated}/${TOTAL_PLACES} (${((placesCreated / TOTAL_PLACES) * 100).toFixed(2)}%) - ${elapsed}s elapsed - ${rate} places/sec`,
      );
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(
      `\n✅ Successfully created ${TOTAL_PLACES} places in ${totalTime} seconds!`,
    );
  },

  down: async (queryInterface) => {
    console.log('Removing fake places...');

    // Match seeded place slugs (end with -number, e.g. bella-italia-1)
    const slugMatch = "slug ~ '-[0-9]+$'";

    // Delete entity_emotion_counts for seeded places first
    await queryInterface.sequelize.query(
      `DELETE FROM entity_emotion_counts
       WHERE entity_type = 'place' AND entity_id IN (
         SELECT id FROM places WHERE ${slugMatch}
       )`,
    );

    // Delete translations first
    await queryInterface.sequelize.query(
      `DELETE FROM place_translations WHERE place_id IN (
        SELECT id FROM places WHERE ${slugMatch}
      )`,
    );

    // Delete places
    await queryInterface.sequelize.query(
      `DELETE FROM places WHERE ${slugMatch}`,
    );

    // Delete fake users
    await queryInterface.bulkDelete('users', {
      email: {
        [queryInterface.sequelize.Op.like]: 'user%@test.com',
      },
    });

    console.log('✅ Fake places removed successfully!');
  },
};
