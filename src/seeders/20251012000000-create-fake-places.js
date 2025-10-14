const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Starting to seed fake places...');

    // Step 1: Get existing images from uploads/places
    const existingImages = [
      '1757751214221-e492f11a-89a8-4c7f-9166-ca43a5f06b3a.png',
      '1757761681392-be5e04a3-a7fd-4816-a6a8-8423f0c03024.png',
      '1757761743049-95c2259d-70a7-4d08-a1c9-d1da72fc0954.png',
      '1757763402939-26f264e3-1e05-4ce6-99cc-c11a3636b4c6.png',
      '1757789752930-d644f5d8-ec76-4131-a83f-8f43180ee37a.png',
      '1757789798367-1cd0bf2a-2bb3-4352-87b1-9daf994c24b2.png',
      '1757789800306-23a238a4-dc2b-4a64-98bd-81e2ea324b90.png',
      '1757789860643-21932459-5340-405d-8166-ce261e36056c.png',
      '1757790002380-04c0033a-fd66-4900-8c80-4e34e4b064fb.png',
      '1757790003373-a4278b3e-989e-431d-89a9-181a8473160a.png',
      '1757790004218-514dac93-899e-4636-92ed-0e43e8ad04c7.png',
      '1757790005197-0f57aee6-eddf-4dfa-b23e-d4e046112032.png',
      '1757790039232-9871106b-203c-4737-82b1-3b15c68c59c2.png',
      '1757852373142-56f30ae1-f6f8-4a54-a558-a01f70d13fc5.png',
      '1758382808415-5b73a73d-c90e-449a-9c8a-d7f7a66d647f.png',
      '1758390487731-47d9a2a3-ed0a-44bc-a39d-22a627406eda.jpg',
      '1758470773493-877f5c1f-97b7-4e83-a9c0-58fd491cfe56.webp',
      '1758470806100-563ce29f-96d5-4b5c-a5b2-d29d6f86be6f.webp',
      '1758470865951-31d3755f-73de-4b91-b37f-7284a7b93ca6.webp',
      '1758958251327-e9eaa21e-1013-45c9-a423-cccf09943930.webp',
      '1759074809567-ef61d313-59fe-48ec-92f5-56337b6982cb.webp',
      '1759074913344-5362b926-57c9-4ee4-a22e-9483ec778e57.webp',
      '1760112875449-dfe06d7d-0935-4f0c-b524-c6143f0e5717.png',
      '1760212567745-84856038-abcd-46a0-97c9-2f9e916b9780.jpeg',
    ];

    const thumbImages = [
      '1757751214221-e492f11a-89a8-4c7f-9166-ca43a5f06b3a-thumb.png',
      '1757761681392-be5e04a3-a7fd-4816-a6a8-8423f0c03024-thumb.png',
      '1757761743049-95c2259d-70a7-4d08-a1c9-d1da72fc0954-thumb.png',
      '1757763402939-26f264e3-1e05-4ce6-99cc-c11a3636b4c6-thumb.png',
      '1757789752930-d644f5d8-ec76-4131-a83f-8f43180ee37a-thumb.png',
      '1757789798367-1cd0bf2a-2bb3-4352-87b1-9daf994c24b2-thumb.png',
      '1757789800306-23a238a4-dc2b-4a64-98bd-81e2ea324b90-thumb.png',
      '1757789860643-21932459-5340-405d-8166-ce261e36056c-thumb.png',
      '1757790002380-04c0033a-fd66-4900-8c80-4e34e4b064fb-thumb.png',
      '1757790003373-a4278b3e-989e-431d-89a9-181a8473160a-thumb.png',
      '1757790004218-514dac93-899e-4636-92ed-0e43e8ad04c7-thumb.png',
      '1757790005197-0f57aee6-eddf-4dfa-b23e-d4e046112032-thumb.png',
      '1757790039232-9871106b-203c-4737-82b1-3b15c68c59c2-thumb.png',
      '1757852373142-56f30ae1-f6f8-4a54-a558-a01f70d13fc5-thumb.png',
      '1758382808415-5b73a73d-c90e-449a-9c8a-d7f7a66d647f-thumb.png',
      '1758390487731-47d9a2a3-ed0a-44bc-a39d-22a627406eda-thumb.jpg',
      '1758470773493-877f5c1f-97b7-4e83-a9c0-58fd491cfe56-thumb.webp',
      '1758470806100-563ce29f-96d5-4b5c-a5b2-d29d6f86be6f-thumb.webp',
      '1758470865951-31d3755f-73de-4b91-b37f-7284a7b93ca6-thumb.webp',
      '1758958251327-e9eaa21e-1013-45c9-a423-cccf09943930-thumb.webp',
      '1759074809567-ef61d313-59fe-48ec-92f5-56337b6982cb-thumb.webp',
      '1759074913344-5362b926-57c9-4ee4-a22e-9483ec778e57-thumb.webp',
      '1760112875449-dfe06d7d-0935-4f0c-b524-c6143f0e5717-thumb.png',
      '1760212567745-84856038-abcd-46a0-97c9-2f9e916b9780-thumb.jpeg',
    ];

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
        const imageIndex = Math.floor(Math.random() * existingImages.length);
        const allNames = Object.values(placeNames).flat();
        const baseName = getRandomElement(allNames);
        const uniqueName = `${baseName} ${placesCreated + i + 1}`;
        const slug = `${baseName.toLowerCase().replace(/\s+/g, '-')}-${placesCreated + i + 1}`;

        const place = {
          slug: slug,
          image: thumbImages[imageIndex],
          image_original: existingImages[imageIndex],
          latitude: coords.latitude,
          longitude: coords.longitude,
          location: Sequelize.fn(
            'ST_SetSRID',
            Sequelize.fn('ST_MakePoint', coords.longitude, coords.latitude),
            4326,
          ),
          address: `Street ${getRandomInt(1, 100)}, Building ${getRandomInt(1, 50)}`,
          city_id: getRandomElement(cityIds),
          category_id: getRandomElement(categoryIds),
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

    // Delete translations first
    await queryInterface.sequelize.query(
      `DELETE FROM place_translations WHERE place_id IN (
        SELECT id FROM places WHERE slug LIKE '%-[0-9]%'
      )`,
    );

    // Delete places
    await queryInterface.sequelize.query(
      `DELETE FROM places WHERE slug LIKE '%-[0-9]%'`,
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
