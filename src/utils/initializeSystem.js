const { Organization, User } = require('../models');

const initializeSystem = async () => {
    try {
        console.log('🔧 Initializing LMS System...');

        // Check if organization already exists
        let organization = await Organization.findOne();

        if (!organization) {
            // Create LMS Organization
            organization = await Organization.create({
                name: 'LMS Organization',
                email: 'admin@lms.com',
                description: 'Learning Management System Organization'
            });

            console.log('✅ LMS Organization created');
        } else {
            console.log('ℹ️  LMS Organization already exists');
        }

        // Check if instructors exist
        const instructorCount = await User.count({ where: { role: 'instructor' } });

        if (instructorCount < 1) {
            console.log(`📚 Creating default instructor...`);

            const instructor = await User.create({
                email: `instructor1@lms.com`,
                password: 'password123',
                name: `Instructor 1`,
                role: 'instructor',
                bio: `Experienced instructor specializing in various subjects`,
                expertise: `Subject 1`
            });

            console.log(`✅ Created ${instructor.name} (${instructor.email})`);
        } else {
            console.log('ℹ️  Default instructor already exists');
        }

        console.log('✅ System initialization complete!\n');

    } catch (error) {
        console.error('❌ System initialization failed:', error.message);
        throw error;
    }
};

module.exports = initializeSystem;
