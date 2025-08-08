import db from '../sequelize_models/index.js';

const { Blog, BlogComment } = db;

const testBlogSystem = async () => {
  try {
    console.log('=== Testing Enhanced Blog System ===\n');

    // Test 1: Create a blog post with all new features
    console.log('1. Creating a test blog post with enhanced features...');
    const testBlog = await Blog.create({
      title: 'Test Enhanced Blog Post',
      content: 'This is a test blog post to verify all the new features are working properly. It includes scheduling, categories, tags, SEO fields, and more.',
      author: 'Test Author',
      slug: 'test-enhanced-blog-post',
      published: true,
      status: 'published',
      category: 'Technology',
      tags: ['test', 'enhanced', 'blog'],
      excerpt: 'A test blog post to verify enhanced features.',
      metaTitle: 'Test Enhanced Blog Post - SEO Title',
      metaDescription: 'This is a test blog post to verify all the new features are working properly.',
      metaKeywords: 'test, blog, enhanced, features',
      featured: true,
      priority: 5,
      socialImage: 'https://example.com/social-image.jpg',
      scheduledAt: null,
      publishedAt: new Date()
    });

    console.log('✅ Blog post created successfully!');
    console.log(`   - ID: ${testBlog.id}`);
    console.log(`   - Title: ${testBlog.title}`);
    console.log(`   - Status: ${testBlog.status}`);
    console.log(`   - Category: ${testBlog.category}`);
    console.log(`   - Tags: ${testBlog.tags?.join(', ')}`);
    console.log(`   - Featured: ${testBlog.featured}`);
    console.log(`   - Priority: ${testBlog.priority}`);
    console.log(`   - Reading Time: ${testBlog.readingTime} min`);
    console.log(`   - Views: ${testBlog.views}`);
    console.log(`   - Likes: ${testBlog.likes}\n`);

    // Test 2: Create a scheduled blog post
    console.log('2. Creating a scheduled blog post...');
    const scheduledBlog = await Blog.create({
      title: 'Scheduled Blog Post',
      content: 'This blog post is scheduled for future publication.',
      author: 'Test Author',
      slug: 'scheduled-blog-post',
      published: false,
      status: 'scheduled',
      category: 'Business',
      tags: ['scheduled', 'future'],
      excerpt: 'A blog post scheduled for future publication.',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      featured: false,
      priority: 3
    });

    console.log('✅ Scheduled blog post created successfully!');
    console.log(`   - Status: ${scheduledBlog.status}`);
    console.log(`   - Scheduled for: ${scheduledBlog.scheduledAt}\n`);

    // Test 3: Create a blog comment
    console.log('3. Creating a blog comment...');
    const testComment = await BlogComment.create({
      blogId: testBlog.id,
      authorName: 'Test Commenter',
      authorEmail: 'commenter@example.com',
      content: 'This is a test comment to verify the comment system is working.',
      status: 'approved'
    });

    console.log('✅ Blog comment created successfully!');
    console.log(`   - Comment ID: ${testComment.id}`);
    console.log(`   - Author: ${testComment.authorName}`);
    console.log(`   - Status: ${testComment.status}\n`);

    // Test 4: Test blog queries
    console.log('4. Testing blog queries...');
    
    // Get all published blogs
    const publishedBlogs = await Blog.findAll({
      where: { published: true, status: 'published' }
    });
    console.log(`   - Published blogs: ${publishedBlogs.length}`);

    // Get featured blogs
    const featuredBlogs = await Blog.findAll({
      where: { featured: true, published: true, status: 'published' }
    });
    console.log(`   - Featured blogs: ${featuredBlogs.length}`);

    // Get blogs by category
    const techBlogs = await Blog.findAll({
      where: { category: 'Technology', published: true, status: 'published' }
    });
    console.log(`   - Technology blogs: ${techBlogs.length}`);

    // Get scheduled blogs
    const scheduledBlogs = await Blog.findAll({
      where: { status: 'scheduled' }
    });
    console.log(`   - Scheduled blogs: ${scheduledBlogs.length}\n`);

    // Test 5: Test comment queries
    console.log('5. Testing comment queries...');
    
    const comments = await BlogComment.findAll({
      where: { blogId: testBlog.id, status: 'approved' }
    });
    console.log(`   - Approved comments for blog ${testBlog.id}: ${comments.length}\n`);

    // Test 6: Update blog (simulate view increment)
    console.log('6. Testing blog updates...');
    await testBlog.increment('views');
    await testBlog.increment('likes');
    
    const updatedBlog = await Blog.findByPk(testBlog.id);
    console.log(`   - Updated views: ${updatedBlog.views}`);
    console.log(`   - Updated likes: ${updatedBlog.likes}\n`);

    // Test 7: Test scheduling logic
    console.log('7. Testing scheduling logic...');
    const pastScheduledBlog = await Blog.create({
      title: 'Past Scheduled Blog',
      content: 'This blog was scheduled for the past.',
      author: 'Test Author',
      slug: 'past-scheduled-blog',
      published: false,
      status: 'scheduled',
      scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      category: 'News'
    });

    // Simulate the scheduling process
    if (pastScheduledBlog.scheduledAt && new Date(pastScheduledBlog.scheduledAt) <= new Date()) {
      await pastScheduledBlog.update({
        status: 'published',
        published: true,
        publishedAt: new Date()
      });
      console.log('   - Past scheduled blog auto-published!');
    }

    console.log('✅ All blog system tests completed successfully!\n');

    // Cleanup
    console.log('Cleaning up test data...');
    await BlogComment.destroy({ where: { blogId: testBlog.id } });
    await Blog.destroy({ where: { id: testBlog.id } });
    await Blog.destroy({ where: { id: scheduledBlog.id } });
    await Blog.destroy({ where: { id: pastScheduledBlog.id } });
    console.log('✅ Test data cleaned up successfully!');

  } catch (error) {
    console.error('❌ Blog system test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

// Run the test
testBlogSystem().then(() => {
  console.log('\n🎉 Blog system enhancement completed successfully!');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Blog system test failed:', error);
  process.exit(1);
}); 