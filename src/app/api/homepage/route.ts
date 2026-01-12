import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for homepage content (in production, use a database)
let homepageContent = {
  heroTitle: 'Welcome to Shambil Pride Academy',
  heroSubtitle: 'Excellence in Education, Character, and Leadership',
  heroDescription: 'Nurturing young minds for a brighter future through quality education and moral values.',
  aboutTitle: 'About Our School',
  aboutContent: 'Shambil Pride Academy is committed to providing quality education that develops both academic excellence and strong moral character. Our dedicated faculty and modern facilities create an environment where students can thrive and reach their full potential.',
  principalMessage: 'At Shambil Pride Academy, we believe every child has the potential to excel. Our mission is to provide a nurturing environment that fosters academic achievement, character development, and leadership skills.',
  principalName: 'Dr. Amina Abdullahi',
  principalTitle: 'Principal',
  features: [
    {
      title: 'Quality Education',
      description: 'Comprehensive curriculum designed to meet international standards',
      icon: 'academic-cap'
    },
    {
      title: 'Experienced Faculty',
      description: 'Dedicated teachers committed to student success',
      icon: 'users'
    },
    {
      title: 'Modern Facilities',
      description: 'State-of-the-art classrooms and learning resources',
      icon: 'building-library'
    },
    {
      title: 'Character Development',
      description: 'Focus on moral values and leadership skills',
      icon: 'heart'
    }
  ],
  contactInfo: {
    address: '45, Dan Masani Street, Birnin Gwari, Kaduna State, Nigeria',
    phone: '+234 803 401 2480',
    alternatePhone: '+234 807 938 7958',
    email: 'Shehubala70@gmail.com',
    website: 'www.shambilprideacademy.edu.ng'
  },
  lastUpdated: new Date().toISOString()
};

// GET - Retrieve homepage content
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ homepage: homepageContent });
  } catch (error) {
    console.error('GET /api/homepage error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update homepage content
export async function PUT(request: NextRequest) {
  try {
    const updateData = await request.json();
    
    homepageContent = {
      ...homepageContent,
      ...updateData,
      lastUpdated: new Date().toISOString()
    };
    
    return NextResponse.json({ homepage: homepageContent });
  } catch (error) {
    console.error('PUT /api/homepage error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}