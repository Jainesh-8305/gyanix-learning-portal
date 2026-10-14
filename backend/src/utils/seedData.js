// backend/src/utils/seedData.js
const User = require('../models/User');
const Course = require('../models/Course');

const seedDatabase = async () => {
  try {
    // 1. Seed or update Default Users with clean passwords
    const usersToSeed = [
      {
        name: 'Jainesh Dalwadi',
        email: 'jaineshdalwadi@gmail.com',
        password: 'Password123!',
        role: 'admin',
        bio: 'Founder & System Administrator at Gyanix Academy.',
        isActive: true,
        isEmailVerified: true,
      },
      {
        name: 'Jassi Paaji',
        email: 'jassiipaajii@gmail.com',
        password: 'Password123!',
        role: 'instructor',
        bio: 'Senior Cloud Architect & Lead AI Instructor.',
        isActive: true,
        isEmailVerified: true,
      },
      {
        name: 'Darshil Baladhiya',
        email: 'darshil3d@gmail.com',
        password: 'Password123!',
        role: 'student',
        bio: 'Aspiring AI Engineer and Scholar.',
        isActive: true,
        isEmailVerified: true,
      },
    ];

    for (const u of usersToSeed) {
      const user = await User.findOne({ email: u.email });
      if (!user) {
        await User.create(u);
        console.log(`✅ Seeded User: ${u.email}`);
      } else {
        // Ensure password is valid
        user.password = u.password;
        await user.save();
        console.log(`✅ Updated User Password: ${u.email}`);
      }
    }

    const instructor = await User.findOne({ email: 'jassiipaajii@gmail.com' });

    // 2. Seed Default Courses if none exist
    const courseCount = await Course.countDocuments({ status: 'published' });
    if (courseCount === 0) {
      console.log('🌱 No published courses found. Seeding official curriculum catalog...');

      const defaultCourses = [
        {
          title: 'Full-Stack Next.js 16 & AI Agent Engineering',
          description: 'Master building enterprise-grade applications with React 19, Next.js 16 App Router, TypeScript, and autonomous LLM agents.',
          shortDescription: 'Build enterprise AI applications with Next.js 16 and LLMs.',
          instructor: instructor._id,
          category: 'ai-ml',
          level: 'intermediate',
          price: 0,
          discountPrice: 0,
          status: 'published',
          thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
          tags: ['nextjs', 'react', 'ai', 'fullstack'],
          sections: [
            {
              title: 'Module 1: Architecture & Foundations',
              order: 1,
              lessons: [
                {
                  title: '1.1 Next.js 16 App Router & Server Components',
                  order: 1,
                  videoDuration: 1080,
                  videoUrl: 'https://www.youtube.com/watch?v=wm5gMKuwSYk',
                  isFree: true,
                },
                {
                  title: '1.2 State Management with Zustand & SWR Caching',
                  order: 2,
                  videoDuration: 1440,
                  videoUrl: 'https://www.youtube.com/watch?v=wm5gMKuwSYk',
                  isFree: false,
                },
              ],
            },
            {
              title: 'Module 2: Autonomous AI Agents & Vector RAG',
              order: 2,
              lessons: [
                {
                  title: '2.1 OpenAI GPT-4o Integration & Function Calling',
                  order: 1,
                  videoDuration: 1920,
                  videoUrl: 'https://www.youtube.com/watch?v=wm5gMKuwSYk',
                  isFree: false,
                },
              ],
            },
          ],
        },
        {
          title: 'Deep Space Physics & 60FPS Canvas Animation Masterclass',
          description: 'Learn how to engineer hardware-accelerated 2D canvas physics, multi-layer depth parallax, and particle gravity fields in modern web apps.',
          shortDescription: 'Create high performance interactive canvas visual experiences.',
          instructor: instructor._id,
          category: 'design',
          level: 'advanced',
          price: 49,
          discountPrice: 29,
          status: 'published',
          thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
          tags: ['canvas', 'physics', 'animations', 'typescript'],
          sections: [
            {
              title: 'Module 1: HTML5 Canvas Mathematics',
              order: 1,
              lessons: [
                {
                  title: '1.1 Particle Systems & Velocity Vectors',
                  order: 1,
                  videoDuration: 1320,
                  videoUrl: 'https://www.youtube.com/watch?v=wm5gMKuwSYk',
                  isFree: true,
                },
              ],
            },
          ],
        },
        {
          title: 'Cloud DevOps, Docker & Microservices Orchestration',
          description: 'Deploy resilient full-stack applications with Docker, Kubernetes, CI/CD automated pipelines, and cloud container infrastructure.',
          shortDescription: 'Master cloud deployment pipelines and container orchestration.',
          instructor: instructor._id,
          category: 'devops',
          level: 'beginner',
          price: 29,
          discountPrice: 19,
          status: 'published',
          thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=1200&auto=format&fit=crop',
          tags: ['docker', 'devops', 'kubernetes', 'cloud'],
          sections: [
            {
              title: 'Module 1: Containerization Fundamentals',
              order: 1,
              lessons: [
                {
                  title: '1.1 Dockerizing Next.js & Express Monorepos',
                  order: 1,
                  videoDuration: 1500,
                  videoUrl: 'https://www.youtube.com/watch?v=wm5gMKuwSYk',
                  isFree: true,
                },
              ],
            },
          ],
        },
      ];

      await Course.insertMany(defaultCourses);
      console.log('✅ Successfully seeded official courses catalog into database!');
    }
  } catch (error) {
    console.error('⚠️ Database seed error:', error.message);
  }
};

module.exports = seedDatabase;
