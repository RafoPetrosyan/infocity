const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const password = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('users', [
      {
        first_name: 'Super',
        last_name: 'Admin',
        email: 'admin@gmail.com',
        password: password,
        verified: true,
        avatar: null,
        login_type: 'email',
        role: 'super-admin',
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', { email: 'admin@gmail.com' }, {});
  },
};
