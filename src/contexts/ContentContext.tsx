'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface HomepageSection {
  id: string;
  type: 'hero' | 'about' | 'history' | 'objectives' | 'gallery' | 'news' | 'achievements';
  title: string;
  content: string;
  images: string[];
  videos: string[];
  isActive: boolean;
  order: number;
  lastUpdated: string;
  updatedBy: string;
}

interface NewsEvent {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'news' | 'event';
  image?: string;
  isActive: boolean;
  isFeatured: boolean;
}

interface ContentContextType {
  sections: HomepageSection[];
  newsEvents: NewsEvent[];
  updateSection: (section: HomepageSection) => void;
  updateNewsEvent: (newsEvent: NewsEvent) => void;
  deleteSection: (sectionId: string) => void;
  deleteNewsEvent: (newsId: string) => void;
  getSectionByType: (type: string) => HomepageSection | undefined;
  getActiveNewsEvents: () => NewsEvent[];
  getFeaturedNewsEvents: () => NewsEvent[];
  loading: boolean;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

const STORAGE_KEYS = {
  SECTIONS: 'shambil_homepage_sections',
  NEWS_EVENTS: 'shambil_news_events'
};

// Default content that will be used if no stored content exists
const DEFAULT_SECTIONS: HomepageSection[] = [
  {
    id: '1',
    type: 'hero',
    title: 'Shambil Pride Academy Birnin Gwari',
    content: 'Knowledge is a way to success. Empowering minds, building futures through quality education and character development.',
    images: [],
    videos: [],
    isActive: true,
    order: 1,
    lastUpdated: '2024-01-10',
    updatedBy: 'System'
  },
  {
    id: '2',
    type: 'about',
    title: 'About Shambil Pride Academy',
    content: 'Shambil Pride Academy Birnin Gwari is a premier educational institution committed to providing quality education and nurturing young minds to become future leaders. Established with the vision of excellence in education, we strive to create an environment where students can thrive academically, socially, and morally.',
    images: [],
    videos: [],
    isActive: true,
    order: 2,
    lastUpdated: '2024-01-08',
    updatedBy: 'System'
  },
  {
    id: '3',
    type: 'history',
    title: 'Our Rich History',
    content: 'Founded in 2010, Shambil Pride Academy has grown from a small institution with 50 students to a thriving educational community serving over 1,200 students. Our journey has been marked by continuous growth, academic excellence, and community impact.',
    images: [],
    videos: [],
    isActive: true,
    order: 3,
    lastUpdated: '2024-01-05',
    updatedBy: 'System'
  },
  {
    id: '4',
    type: 'objectives',
    title: 'Our Aims & Objectives',
    content: 'To provide comprehensive education that develops intellectual, physical, social, and moral capabilities of students. We foster critical thinking, creativity, and problem-solving skills while instilling strong moral values and integrity.',
    images: [],
    videos: [],
    isActive: true,
    order: 4,
    lastUpdated: '2024-01-03',
    updatedBy: 'System'
  },
  {
    id: '5',
    type: 'gallery',
    title: 'School Gallery',
    content: 'Explore our beautiful campus, modern facilities, and vibrant school life through our comprehensive photo and video gallery.',
    images: [],
    videos: [],
    isActive: true,
    order: 5,
    lastUpdated: '2024-01-02',
    updatedBy: 'System'
  },
  {
    id: '6',
    type: 'achievements',
    title: 'Our Achievements',
    content: 'We are proud of our outstanding academic results, competition victories, and recognition as a School of Excellence by the Kaduna State Ministry of Education.',
    images: [],
    videos: [],
    isActive: true,
    order: 6,
    lastUpdated: '2024-01-01',
    updatedBy: 'System'
  }
];

const DEFAULT_NEWS_EVENTS: NewsEvent[] = [
  {
    id: '1',
    title: 'New Computer Laboratory Opened',
    content: 'We are excited to announce the opening of our state-of-the-art computer laboratory equipped with the latest technology to enhance digital learning.',
    date: '2024-01-15',
    type: 'news',
    isActive: true,
    isFeatured: true
  },
  {
    id: '2',
    title: 'Parent-Teacher Conference',
    content: 'Join us for our quarterly parent-teacher conference to discuss student progress and academic development.',
    date: '2024-01-20',
    type: 'event',
    isActive: true,
    isFeatured: false
  },
  {
    id: '3',
    title: 'Outstanding WAEC Results Released',
    content: 'We are proud to announce that 98% of our students achieved excellent results in the recent WAEC examinations.',
    date: '2024-01-12',
    type: 'news',
    isActive: true,
    isFeatured: true
  },
  {
    id: '4',
    title: 'Science Fair 2024',
    content: 'Annual science exhibition showcasing innovative projects by our talented students.',
    date: '2024-02-05',
    type: 'event',
    isActive: true,
    isFeatured: false
  }
];

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load content from localStorage on mount
  useEffect(() => {
    try {
      const storedSections = localStorage.getItem(STORAGE_KEYS.SECTIONS);
      const storedNewsEvents = localStorage.getItem(STORAGE_KEYS.NEWS_EVENTS);

      if (storedSections) {
        setSections(JSON.parse(storedSections));
      } else {
        setSections(DEFAULT_SECTIONS);
        localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(DEFAULT_SECTIONS));
      }

      if (storedNewsEvents) {
        setNewsEvents(JSON.parse(storedNewsEvents));
      } else {
        setNewsEvents(DEFAULT_NEWS_EVENTS);
        localStorage.setItem(STORAGE_KEYS.NEWS_EVENTS, JSON.stringify(DEFAULT_NEWS_EVENTS));
      }
    } catch (error) {
      console.error('Error loading content from localStorage:', error);
      setSections(DEFAULT_SECTIONS);
      setNewsEvents(DEFAULT_NEWS_EVENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save sections to localStorage whenever they change
  useEffect(() => {
    if (!loading && sections.length > 0) {
      try {
        const sectionsData = JSON.stringify(sections);
        console.log('ContentContext: Saving sections to localStorage, size:', (sectionsData.length / 1024).toFixed(2), 'KB');
        localStorage.setItem(STORAGE_KEYS.SECTIONS, sectionsData);
        console.log('ContentContext: Sections saved successfully');
      } catch (error) {
        console.error('ContentContext: Failed to save sections to localStorage:', error);
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          console.error('ContentContext: localStorage quota exceeded - images may be too large');
          // You could implement fallback logic here, like removing images or using a different storage method
        }
      }
    }
  }, [sections, loading]);

  // Save news events to localStorage whenever they change
  useEffect(() => {
    if (!loading && newsEvents.length > 0) {
      localStorage.setItem(STORAGE_KEYS.NEWS_EVENTS, JSON.stringify(newsEvents));
    }
  }, [newsEvents, loading]);

  const updateSection = (updatedSection: HomepageSection) => {
    console.log('ContentContext: Updating section', updatedSection.type, 'with images:', updatedSection.images);
    console.log('ContentContext: Images count:', updatedSection.images?.length || 0);
    
    // Check localStorage size
    if (updatedSection.images && updatedSection.images.length > 0) {
      const totalSize = JSON.stringify(updatedSection.images).length;
      console.log('ContentContext: Total images size (chars):', totalSize);
      console.log('ContentContext: Total images size (MB):', (totalSize / 1024 / 1024).toFixed(2));
      
      // Check if we're approaching localStorage limits (usually 5-10MB)
      if (totalSize > 5 * 1024 * 1024) { // 5MB
        console.warn('ContentContext: Images size is large, may cause localStorage issues');
      }
    }
    
    setSections(prev => {
      const existingIndex = prev.findIndex(section => section.id === updatedSection.id);
      if (existingIndex >= 0) {
        // Update existing section
        const updated = [...prev];
        updated[existingIndex] = updatedSection;
        console.log('ContentContext: Updated existing section', updated[existingIndex]);
        return updated;
      } else {
        // Add new section
        console.log('ContentContext: Adding new section', updatedSection);
        return [...prev, updatedSection];
      }
    });
  };

  const updateNewsEvent = (updatedNewsEvent: NewsEvent) => {
    setNewsEvents(prev => {
      const existingIndex = prev.findIndex(news => news.id === updatedNewsEvent.id);
      if (existingIndex >= 0) {
        // Update existing news event
        const updated = [...prev];
        updated[existingIndex] = updatedNewsEvent;
        return updated;
      } else {
        // Add new news event
        return [...prev, updatedNewsEvent];
      }
    });
  };

  const deleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(section => section.id !== sectionId));
  };

  const deleteNewsEvent = (newsId: string) => {
    setNewsEvents(prev => prev.filter(news => news.id !== newsId));
  };

  const getSectionByType = (type: string) => {
    const section = sections.find(section => section.type === type && section.isActive);
    console.log('ContentContext: Getting section by type', type, 'found:', section);
    if (section && section.images) {
      console.log('ContentContext: Section images:', section.images);
    }
    return section;
  };

  const getActiveNewsEvents = () => {
    return newsEvents.filter(news => news.isActive).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const getFeaturedNewsEvents = () => {
    return newsEvents.filter(news => news.isActive && news.isFeatured).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const value: ContentContextType = {
    sections,
    newsEvents,
    updateSection,
    updateNewsEvent,
    deleteSection,
    deleteNewsEvent,
    getSectionByType,
    getActiveNewsEvents,
    getFeaturedNewsEvents,
    loading
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}