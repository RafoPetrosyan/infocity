'use strict';

// External image URLs for events — works in any environment. Replace with your own list if needed.
const EXTERNAL_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
  'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
  'https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?w=800',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
];

const EVENT_NAMES = [
  'Summer Fest',
  'Concert Night',
  'Jazz Evening',
  'Food Festival',
  'Art Exhibition',
  'Tech Meetup',
  'Wine Tasting',
  'Comedy Show',
  'Dance Workshop',
  'Film Screening',
  'Open Mic Night',
  'Craft Market',
  'Yoga in the Park',
  'Startup Pitch',
  'Photography Walk',
  'Theater Night',
  'Trivia Night',
  'Karaoke Party',
  'Book Club',
  'Networking Brunch',
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Starting to seed fake events...');

    // Step 1: Get places (events require place_id)
    const places = await queryInterface.sequelize.query(
      'SELECT id FROM places LIMIT 5000',
      { type: Sequelize.QueryTypes.SELECT },
    );
    const placeIds = places.map((p) => p.id);
    if (placeIds.length === 0) {
      console.log('No places found. Run the fake places seeder first.');
      return;
    }
    console.log(`Found ${placeIds.length} places`);

    // Step 2: Get users
    const users = await queryInterface.sequelize.query('SELECT id FROM users', {
      type: Sequelize.QueryTypes.SELECT,
    });
    const userIds = users.map((u) => u.id);
    if (userIds.length === 0) {
      console.log(
        'No users found. Run the fake places seeder or ensure users exist.',
      );
      return;
    }
    console.log(`Found ${userIds.length} users`);

    // Step 3: Get event categories (optional)
    const eventCategories = await queryInterface.sequelize.query(
      'SELECT id FROM event_categories',
      { type: Sequelize.QueryTypes.SELECT },
    );
    const eventCategoryIds = eventCategories.map((c) => c.id);
    console.log(`Found ${eventCategoryIds.length} event categories`);

    // Step 4: Get emotions for entity_emotion_counts
    const emotions = await queryInterface.sequelize.query(
      'SELECT id FROM emotions',
      { type: Sequelize.QueryTypes.SELECT },
    );
    const emotionIds = emotions.map((e) => e.id);
    console.log(`Found ${emotionIds.length} emotions`);

    const getRandomElement = (arr) =>
      arr[Math.floor(Math.random() * arr.length)];
    const getRandomInt = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const generateCoordinates = () => {
      const lat = 40.0 + Math.random() * 1.5;
      const lng = 43.5 + Math.random() * 2.5;
      return {
        latitude: parseFloat(lat.toFixed(8)),
        longitude: parseFloat(lng.toFixed(8)),
      };
    };

    // Event start dates 3–5 months out for long-term testing
    const DAYS_3_MONTHS = 90;
    const DAYS_5_MONTHS = 153;
    const generateDateInFuture = () => {
      const d = new Date();
      d.setDate(d.getDate() + getRandomInt(DAYS_3_MONTHS, DAYS_5_MONTHS));
      d.setHours(getRandomInt(10, 20), getRandomInt(0, 59), 0, 0);
      return d;
    };

    const descriptions = [
      'Join us for an unforgettable experience with great atmosphere and activities.',
      'A must-attend event featuring top performers and creative minds.',
      'Perfect for networking, learning, and having a great time.',
      'Discover something new and meet like-minded people.',
      'An evening of entertainment and connection you will not forget.',
    ];

    const armenianDescriptions = [
      'Միացեք մեզ անմոռաց հիշողություններ ստեղծելու համար։',
      'Գերազանց միջոցառում հիանալի մթնոլորտով։',
    ];

    const russianDescriptions = [
      'Присоединяйтесь к нам для незабываемого вечера.',
      'Отличное мероприятие с прекрасной атмосферой.',
    ];

    const TOTAL_EVENTS = 500;
    const BATCH_SIZE = 100;
    const batches = Math.ceil(TOTAL_EVENTS / BATCH_SIZE);
    const FAKE_SLUG_PREFIX = 'fake-event-';

    console.log(
      `Creating ${TOTAL_EVENTS} fake events in ${batches} batches...`,
    );
    const startTime = Date.now();
    let eventsCreated = 0;

    for (let batch = 0; batch < batches; batch++) {
      const countInBatch = Math.min(BATCH_SIZE, TOTAL_EVENTS - eventsCreated);
      const events = [];
      const eventTranslations = [];
      const eventGoings = [];
      const entityEmotionCounts = [];
      const eventImagesList = [];

      for (let i = 0; i < countInBatch; i++) {
        const idx = eventsCreated + i + 1;
        const baseName = getRandomElement(EVENT_NAMES);
        const slug = `${FAKE_SLUG_PREFIX}${idx}`;
        const coords = generateCoordinates();
        const imageUrl = getRandomElement(EXTERNAL_IMAGE_URLS);
        const startDate = generateDateInFuture();
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + getRandomInt(2, 6));

        const eventCategoryId =
          eventCategoryIds.length > 0
            ? getRandomElement(eventCategoryIds)
            : null;

        events.push({
          slug,
          image: imageUrl,
          image_original: imageUrl,
          start_date: startDate,
          end_date: endDate,
          latitude: coords.latitude,
          longitude: coords.longitude,
          location: Sequelize.fn(
            'ST_SetSRID',
            Sequelize.fn('ST_MakePoint', coords.longitude, coords.latitude),
            4326,
          ),
          address: `Event Venue, Street ${getRandomInt(1, 50)}, Building ${getRandomInt(1, 20)}`,
          email: Math.random() > 0.5 ? `event${idx}@example.com` : null,
          phone_number:
            Math.random() > 0.5
              ? `+374${getRandomInt(10000000, 99999999)}`
              : null,
          price: Math.random() > 0.3 ? getRandomInt(0, 50) : null,
          max_attendees: Math.random() > 0.5 ? getRandomInt(20, 500) : null,
          is_active: true,
          is_featured: Math.random() > 0.85,
          place_id: getRandomElement(placeIds),
          user_id: getRandomElement(userIds),
          event_category_id: eventCategoryId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      const insertedEvents = await queryInterface.bulkInsert('events', events, {
        returning: ['id', 'slug'],
      });

      for (let i = 0; i < insertedEvents.length; i++) {
        const evt = insertedEvents[i];
        const baseName = getRandomElement(EVENT_NAMES);
        const desc = getRandomElement(descriptions);

        eventTranslations.push(
          {
            event_id: evt.id,
            language: 'en',
            name: `${baseName} #${evt.slug.replace(FAKE_SLUG_PREFIX, '')}`,
            description: desc,
            about: `Welcome to ${baseName}. ${desc}`,
          },
          {
            event_id: evt.id,
            language: 'hy',
            name: `${baseName} #${evt.slug.replace(FAKE_SLUG_PREFIX, '')}`,
            description: getRandomElement(armenianDescriptions),
            about: 'Բարի գալուստ մեր միջոցառում։ Գերազանց ծրագիր և մթնոլորտ։',
          },
          {
            event_id: evt.id,
            language: 'ru',
            name: `${baseName} #${evt.slug.replace(FAKE_SLUG_PREFIX, '')}`,
            description: getRandomElement(russianDescriptions),
            about:
              'Добро пожаловать на наше мероприятие. Отличная программа и атмосфера.',
          },
        );

        // Event goings: 0 to 15 random users "going" per event (unique per user-event)
        const numGoings = getRandomInt(0, Math.min(15, userIds.length));
        const goingUserIds = new Set();
        while (goingUserIds.size < numGoings) {
          goingUserIds.add(getRandomElement(userIds));
        }
        const now = new Date();
        for (const uid of goingUserIds) {
          eventGoings.push({
            user_id: uid,
            event_id: evt.id,
            createdAt: now,
            updatedAt: now,
          });
        }

        // Entity emotion counts for this event
        if (emotionIds.length > 0) {
          const numEmotions = getRandomInt(1, Math.min(4, emotionIds.length));
          const used = new Set();
          while (used.size < numEmotions) {
            const eid = getRandomElement(emotionIds);
            if (used.has(eid)) continue;
            used.add(eid);
            entityEmotionCounts.push({
              entity_type: 'event',
              entity_id: evt.id,
              emotion_id: eid,
              count: getRandomInt(1, 80),
              createdAt: now,
              updatedAt: now,
            });
          }
        }

        // Optional: 0–2 extra images per event
        if (Math.random() > 0.6) {
          const imgUrl = getRandomElement(EXTERNAL_IMAGE_URLS);
          eventImagesList.push({
            event_id: evt.id,
            type: 'image',
            original: imgUrl,
            thumbnail: imgUrl,
          });
        }
      }

      await queryInterface.bulkInsert('event_translations', eventTranslations);

      if (eventGoings.length > 0) {
        await queryInterface.bulkInsert('event_goings', eventGoings);
      }

      if (entityEmotionCounts.length > 0) {
        await queryInterface.bulkInsert(
          'entity_emotion_counts',
          entityEmotionCounts,
        );
      }

      if (eventImagesList.length > 0) {
        await queryInterface.bulkInsert('event_images', eventImagesList);
      }

      eventsCreated += countInBatch;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(
        `Batch ${batch + 1}/${batches}: ${eventsCreated}/${TOTAL_EVENTS} events (${elapsed}s)`,
      );
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(
      `\n✅ Successfully created ${TOTAL_EVENTS} fake events in ${totalTime}s.`,
    );
  },

  down: async (queryInterface) => {
    console.log('Removing fake events...');

    const subquery = "SELECT id FROM events WHERE slug LIKE 'fake-event-%'";

    await queryInterface.sequelize.query(
      `DELETE FROM entity_emotion_counts
       WHERE entity_type = 'event' AND entity_id IN (${subquery})`,
    );
    await queryInterface.sequelize.query(
      `DELETE FROM event_goings WHERE event_id IN (${subquery})`,
    );
    await queryInterface.sequelize.query(
      `DELETE FROM event_images WHERE event_id IN (${subquery})`,
    );
    await queryInterface.sequelize.query(
      `DELETE FROM event_translations WHERE event_id IN (${subquery})`,
    );
    await queryInterface.sequelize.query(
      `DELETE FROM events WHERE slug LIKE 'fake-event-%'`,
    );

    console.log('✅ Fake events removed successfully.');
  },
};

// yarn seed:run -- src/seeders/20251015000000-create-fake-events.js
