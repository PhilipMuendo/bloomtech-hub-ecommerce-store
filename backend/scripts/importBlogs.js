import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from '../models/Blog.js';

dotenv.config();

const blogs = [
  {
    title: "Top 5 Tools Every Technician Should Own",
    content: "Discover the essential tools that every ICT and electrical technician needs in their toolkit for efficient and professional work.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop",
    author: "Admin",
    slug: "top-5-tools-every-technician-should-own",
    published: true,
  },
  {
    title: "Choosing the Right Router for Your Office Setup",
    content: "Learn how to select the perfect router for your business needs, from small offices to enterprise-level installations.",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=250&fit=crop",
    author: "Admin",
    slug: "choosing-the-right-router-for-your-office-setup",
    published: true,
  }
];

async function importBlogs() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await Blog.insertMany(blogs);
    console.log('Blogs imported successfully!');
    process.exit();
  } catch (err) {
    console.error('Error importing blogs:', err);
    process.exit(1);
  }
}

importBlogs(); 