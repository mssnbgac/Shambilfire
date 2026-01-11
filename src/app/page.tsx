'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useContent } from '@/contexts/ContentContext';
import Link from 'next/link';
import { 
  CalendarIcon, 
  ComputerDesktopIcon, 
  AcademicCapIcon,
  BookOpenIcon,
  TrophyIcon,
  NewspaperIcon,
  PhotoIcon,
  InformationCircleIcon,
  StarIcon,
  HeartIcon,
  UsersIcon,
  UserGroupIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CogIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const { user, loading } = useAuth();
  const { getSectionByType, getActiveNewsEvents, sections, loading: contentLoading } = useContent();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('News & Events');

  useEffect(() => {
    // Check if user explicitly wants to view homepage via query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    
    // If user is logged in and didn't explicitly request homepage, redirect to dashboard
    if (!loading && user && viewParam !== 'homepage') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading while checking authentication and content
  if (loading || contentLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  // Get dynamic content from ContentContext
  const heroSection = getSectionByType('hero');
  const aboutSection = getSectionByType('about');
  const historySection = getSectionByType('history');
  const objectivesSection = getSectionByType('objectives');
  const gallerySection = getSectionByType('gallery');
  const achievementsSection = getSectionByType('achievements');
  const activeNewsEvents = getActiveNewsEvents();

  // Debug logging
  console.log('Homepage: Gallery section:', gallerySection);
  if (gallerySection?.images) {
    console.log('Homepage: Gallery images:', gallerySection.images);
    console.log('Homepage: Gallery images count:', gallerySection.images.length);
    gallerySection.images.forEach((img, idx) => {
      console.log(`Homepage: Image ${idx + 1}:`, img.substring(0, 100) + '...');
      console.log(`Homepage: Image ${idx + 1} is data URL:`, img.startsWith('data:'));
    });
  }

  // Separate news and events
  const recentNews = activeNewsEvents.filter(item => item.type === 'news').slice(0, 3);
  const upcomingEvents = activeNewsEvents.filter(item => item.type === 'event').slice(0, 4);

  const navigationTabs = [
    { name: 'About Us', icon: InformationCircleIcon, active: false },
    { name: 'Our History', icon: BookOpenIcon, active: false },
    { name: 'Aims & Objectives', icon: AcademicCapIcon, active: false },
    { name: 'Gallery', icon: PhotoIcon, active: false },
    { name: 'News & Events', icon: NewspaperIcon, active: true },
    { name: 'Achievements', icon: TrophyIcon, active: false },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'About Us':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <InformationCircleIcon className="h-6 w-6 mr-2 text-blue-600" />
              {aboutSection?.title || 'About Shambil Pride Academy'}
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-4">
                {aboutSection?.content || 'Shambil Pride Academy Birnin Gwari is a premier educational institution committed to providing quality education and nurturing young minds to become future leaders.'}
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-600 mb-4">
                To provide comprehensive, quality education that empowers students with knowledge, skills, and values 
                necessary for success in life while fostering critical thinking, creativity, and character development.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Vision</h3>
              <p className="text-gray-600 mb-4">
                To be the leading educational institution in Kaduna State, recognized for academic excellence, 
                character development, and producing well-rounded individuals who contribute positively to society.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <UsersIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">1,200+</h4>
                  <p className="text-sm text-gray-600">Students</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <AcademicCapIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">80+</h4>
                  <p className="text-sm text-gray-600">Teachers</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <BookOpenIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">30</h4>
                  <p className="text-sm text-gray-600">Classes</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Our History':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <BookOpenIcon className="h-6 w-6 mr-2 text-green-600" />
              {historySection?.title || 'Our History'}
            </h2>
            <div className="space-y-6">
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-6">
                  {historySection?.content || 'Founded in 2010, Shambil Pride Academy has grown from a small institution with 50 students to a thriving educational community serving over 1,200 students.'}
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900">2010 - Foundation</h3>
                <p className="text-gray-600">
                  Shambil Pride Academy was established in 2010 with a vision to provide quality education 
                  to the children of Birnin Gwari and surrounding communities. Started with just 50 students 
                  and 8 teachers in a modest building.
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900">2012 - First Graduation</h3>
                <p className="text-gray-600">
                  Our first set of students graduated with outstanding results, setting the foundation 
                  for our reputation of academic excellence. 95% of our graduates gained admission 
                  into higher institutions.
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900">2015 - Expansion</h3>
                <p className="text-gray-600">
                  Major expansion project completed, adding new classroom blocks, science laboratories, 
                  and a modern library. Student population grew to 500 students with 35 qualified teachers.
                </p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900">2018 - Technology Integration</h3>
                <p className="text-gray-600">
                  Launched our digital learning initiative with computer laboratories and internet 
                  connectivity. Introduced e-learning platforms and digital resources for enhanced learning.
                </p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900">2020 - COVID-19 Adaptation</h3>
                <p className="text-gray-600">
                  Successfully transitioned to online learning during the pandemic, ensuring continuity 
                  of education. Implemented hybrid learning models and enhanced digital infrastructure.
                </p>
              </div>
              <div className="border-l-4 border-indigo-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900">2024 - Present Day</h3>
                <p className="text-gray-600">
                  Today, we proudly serve over 1,200 students with 80+ qualified teachers. Our graduates 
                  continue to excel in universities and contribute meaningfully to society.
                </p>
              </div>
            </div>
          </div>
        );

      case 'Aims & Objectives':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <AcademicCapIcon className="h-6 w-6 mr-2 text-purple-600" />
              {objectivesSection?.title || 'Aims & Objectives'}
            </h2>
            <div className="space-y-6">
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-6">
                  {objectivesSection?.content || 'To provide comprehensive education that develops intellectual, physical, social, and moral capabilities of students.'}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Educational Aims</h3>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <StarIcon className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">To provide comprehensive education that develops intellectual, physical, social, and moral capabilities of students</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <StarIcon className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">To foster critical thinking, creativity, and problem-solving skills in all students</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <StarIcon className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">To prepare students for higher education and successful careers in their chosen fields</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <StarIcon className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">To instill strong moral values, integrity, and respect for diversity</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Core Objectives</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Academic Excellence</h4>
                    <p className="text-sm text-blue-700">Maintain high academic standards and achieve outstanding results in all examinations</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Character Development</h4>
                    <p className="text-sm text-green-700">Build strong character, leadership skills, and ethical values in every student</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Innovation & Technology</h4>
                    <p className="text-sm text-purple-700">Integrate modern technology and innovative teaching methods in education</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Community Service</h4>
                    <p className="text-sm text-yellow-700">Encourage active participation in community development and social responsibility</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Commitment</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 italic">
                    "We are committed to creating an inclusive, supportive, and challenging learning environment 
                    where every student can discover their potential, pursue their passions, and prepare for a 
                    successful future. Our dedicated faculty and staff work tirelessly to ensure that each student 
                    receives personalized attention and guidance to achieve their academic and personal goals."
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Gallery':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <PhotoIcon className="h-6 w-6 mr-2 text-pink-600" />
              {gallerySection?.title || 'School Gallery'}
            </h2>
            <div className="space-y-6">
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-6">
                  {gallerySection?.content || 'Explore our beautiful campus, modern facilities, and vibrant school life through our comprehensive photo and video gallery.'}
                </p>
              </div>
              
              {/* Display admin-uploaded images if available */}
              {gallerySection?.images && gallerySection.images.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Photo Gallery</h3>
                    <button
                      onClick={() => {
                        console.log('Debug: Gallery section:', gallerySection);
                        console.log('Debug: Gallery images:', gallerySection.images);
                        console.log('Debug: All sections:', sections);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Debug Gallery
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {gallerySection.images.map((image, index) => (
                      <div key={index} className="bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={image} 
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-48 object-cover"
                          onLoad={() => {
                            console.log(`Homepage: Image ${index + 1} loaded successfully`);
                          }}
                          onError={(e) => {
                            console.error(`Homepage: Image ${index + 1} failed to load:`, image.substring(0, 100) + '...');
                            console.error(`Homepage: Image ${index + 1} error:`, e);
                            // Hide broken images and show placeholder
                            e.currentTarget.style.display = 'none';
                            const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                            if (placeholder) {
                              placeholder.style.display = 'flex';
                            }
                          }}
                        />
                        <div 
                          className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
                          style={{ display: 'none' }}
                        >
                          <div className="text-center">
                            <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Image not available</p>
                            <p className="text-xs text-gray-400 mt-1">Check console for details</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Campus Facilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: 'Modern Classrooms', desc: 'Well-equipped classrooms with smart boards' },
                    { title: 'Science Laboratory', desc: 'State-of-the-art physics, chemistry, and biology labs' },
                    { title: 'Computer Lab', desc: 'Modern computers with high-speed internet' },
                    { title: 'Library', desc: 'Extensive collection of books and digital resources' },
                    { title: 'Sports Complex', desc: 'Football field, basketball court, and athletics track' },
                    { title: 'Auditorium', desc: 'Multi-purpose hall for events and assemblies' }
                  ].map((item, index) => (
                    <div key={index} className="bg-gray-100 rounded-lg p-4 text-center">
                      <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-3 flex items-center justify-center">
                        <PhotoIcon className="h-12 w-12 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">School Activities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Science Fair 2023', desc: 'Students showcasing innovative projects' },
                    { title: 'Sports Day', desc: 'Annual inter-house sports competition' },
                    { title: 'Cultural Festival', desc: 'Celebrating diversity and traditions' },
                    { title: 'Graduation Ceremony', desc: 'Celebrating academic achievements' }
                  ].map((item, index) => (
                    <div key={index} className="bg-gray-100 rounded-lg p-4">
                      <div className="h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg mb-3 flex items-center justify-center">
                        <PhotoIcon className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-700 text-center">
                  📸 More photos and videos are available in our physical gallery. 
                  Visit the school to see our complete collection of memorable moments!
                </p>
              </div>
            </div>
          </div>
        );

      case 'Achievements':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <TrophyIcon className="h-6 w-6 mr-2 text-yellow-600" />
              {achievementsSection?.title || 'Our Achievements'}
            </h2>
            <div className="space-y-6">
              <div className="prose max-w-none">
                <p className="text-gray-600 mb-6">
                  {achievementsSection?.content || 'We are proud of our outstanding academic results, competition victories, and recognition as a School of Excellence by the Kaduna State Ministry of Education.'}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Academic Excellence</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <TrophyIcon className="h-6 w-6 text-yellow-600 mr-2" />
                      <h4 className="font-semibold text-yellow-900">WAEC Excellence</h4>
                    </div>
                    <p className="text-sm text-yellow-700">98% pass rate in WAEC examinations for the past 5 years</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <TrophyIcon className="h-6 w-6 text-blue-600 mr-2" />
                      <h4 className="font-semibold text-blue-900">JAMB Success</h4>
                    </div>
                    <p className="text-sm text-blue-700">95% of students score above 250 in JAMB examinations</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <TrophyIcon className="h-6 w-6 text-green-600 mr-2" />
                      <h4 className="font-semibold text-green-900">University Admissions</h4>
                    </div>
                    <p className="text-sm text-green-700">100% university admission rate for qualified graduates</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <TrophyIcon className="h-6 w-6 text-purple-600 mr-2" />
                      <h4 className="font-semibold text-purple-900">Scholarship Awards</h4>
                    </div>
                    <p className="text-sm text-purple-700">50+ students received merit scholarships in 2023</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Competition Awards</h3>
                <div className="space-y-3">
                  {[
                    { year: '2023', award: 'Best School in Kaduna State Science Competition', position: '1st Place' },
                    { year: '2023', award: 'Inter-School Mathematics Olympiad', position: '2nd Place' },
                    { year: '2022', award: 'National Quiz Competition', position: '3rd Place' },
                    { year: '2022', award: 'Debate Championship - Kaduna Zone', position: '1st Place' },
                    { year: '2021', award: 'Best ICT Integration in Education', position: 'Winner' },
                    { year: '2021', award: 'Environmental Conservation Project', position: '1st Place' }
                  ].map((achievement, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{achievement.year}</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{achievement.award}</p>
                          <p className="text-sm text-gray-600">{achievement.position}</p>
                        </div>
                      </div>
                      <TrophyIcon className="h-5 w-5 text-yellow-600" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Recognition & Awards</h3>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <StarIcon className="h-6 w-6 text-yellow-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">School of Excellence Award</h4>
                  </div>
                  <p className="text-gray-600 mb-3">
                    Recognized by the Kaduna State Ministry of Education as a "School of Excellence" 
                    for outstanding performance in academics, character development, and community service.
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>Awarded in December 2023</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default: // News & Events
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">News & Events</h2>
            <p className="text-gray-600 mb-6">
              Stay updated with the latest news and events at Shambil Pride Academy:
            </p>

            {/* Upcoming Events */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                Upcoming Events:
              </h3>
              <div className="space-y-3">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                        {event.content && (
                          <p className="text-sm text-gray-600 mt-1">{event.content}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No upcoming events at this time.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent News */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <NewspaperIcon className="h-5 w-5 mr-2 text-green-600" />
                Recent News:
              </h3>
              <div className="space-y-3">
                {recentNews.length > 0 ? (
                  recentNews.map((news, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{news.title}</p>
                        <p className="text-sm text-gray-600">{new Date(news.date).toLocaleDateString()}</p>
                        {news.content && (
                          <p className="text-sm text-gray-600 mt-1">{news.content}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No recent news at this time.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      {/* Logged-in User Header */}
      {user && (
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-white">
                  <p className="text-sm">Welcome back, <span className="font-semibold">{user.firstName} {user.lastName}</span></p>
                  <p className="text-xs text-blue-100 capitalize">Viewing as {user.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
                >
                  <span className="mr-2">📊</span>
                  Back to Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/homepage-manager"
                    className="inline-flex items-center px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
                  >
                    <span className="mr-2">⚙️</span>
                    Edit Homepage
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="relative">
        {/* Login Button - Only show for non-logged-in users */}
        {!user && (
          <div className="absolute top-4 right-4 z-10">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-medium hover:bg-yellow-300 transition-colors shadow-lg"
            >
              <span className="mr-2">🔐</span>
              Login
            </Link>
          </div>
        )}

        {/* Main Header */}
        <div className="relative text-center py-20 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Background decorative elements */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-48 -translate-y-48"></div>
              <div className="absolute top-1/2 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-40"></div>
              <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-white/5 rounded-full translate-y-32"></div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              {heroSection?.title || 'Shambil Pride Academy Birnin Gwari'}
            </h1>
            <p className="text-xl md:text-3xl text-blue-100 mb-12 font-light">
              {heroSection?.content || 'Knowledge is a way to success'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="group inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-2xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1">
                <CalendarIcon className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                Admissions Open
              </button>
              <button className="group inline-flex items-center px-8 py-4 bg-blue-500/80 backdrop-blur-sm text-white rounded-2xl font-semibold hover:bg-blue-400 transition-all duration-300 shadow-2xl hover:shadow-3xl border border-blue-400/50 transform hover:-translate-y-1">
                <ComputerDesktopIcon className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                Virtual Tour
              </button>
              <Link
                href="/login"
                className="group inline-flex items-center px-8 py-4 bg-green-500/80 backdrop-blur-sm text-white rounded-2xl font-semibold hover:bg-green-400 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
              >
                <AcademicCapIcon className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                Student Portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/95 backdrop-blur-xl shadow-2xl border-t border-white/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center">
            {navigationTabs.map((tab, index) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`group flex items-center px-6 py-4 text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.name
                    ? 'text-blue-600 border-b-3 border-blue-600 bg-blue-50/50 shadow-lg'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50/50 border-b-3 border-transparent hover:border-blue-300'
                }`}
              >
                <tab.icon className={`h-5 w-5 mr-3 transition-all duration-300 ${
                  activeTab === tab.name ? 'text-blue-600 scale-110' : 'text-gray-500 group-hover:text-blue-600 group-hover:scale-105'
                }`} />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Active Tab Indicator */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Currently Viewing: <span className="text-blue-600">{activeTab}</span>
                </h1>
                <div className="text-sm text-gray-500 bg-gray-100/50 px-4 py-2 rounded-xl">
                  Click on the tabs above to explore different sections
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="transition-all duration-300 ease-in-out">
                {renderTabContent()}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Quick Links */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white">Quick Links</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <Link
                      href="/login"
                      className="group block w-full text-left px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-blue-100 hover:border-blue-300 hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center">
                        <AcademicCapIcon className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                        Student Portal
                      </div>
                    </Link>
                    <Link
                      href="/login"
                      className="group block w-full text-left px-4 py-3 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 border border-green-100 hover:border-green-300 hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center">
                        <UserGroupIcon className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                        Teacher Portal
                      </div>
                    </Link>
                    <Link
                      href="/login"
                      className="group block w-full text-left px-4 py-3 text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 border border-purple-100 hover:border-purple-300 hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center">
                        <UsersIcon className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                        Parent Portal
                      </div>
                    </Link>
                    <Link
                      href="/login"
                      className="group block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border border-red-100 hover:border-red-300 hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center">
                        <CogIcon className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                        Admin Portal
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* School Info */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white">School Information</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4 text-sm text-gray-600">
                    <div className="flex items-start space-x-3 p-3 bg-gray-50/50 rounded-xl">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">Address:</p>
                        <p>45, Dan Masani Street, Birnin Gwari, Kaduna State, Nigeria</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-gray-50/50 rounded-xl">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">Phone:</p>
                        <p>+234 803 401 2480 / +234 807 938 7958</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-gray-50/50 rounded-xl">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">Email:</p>
                        <p>Shehubala70@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-gray-50/50 rounded-xl">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">Established:</p>
                        <p>2010</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                <AcademicCapIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Shambil Pride Academy</h3>
                <p className="text-blue-200 text-sm">Birnin Gwari</p>
              </div>
            </div>
            <p className="text-gray-300 text-lg mb-2">
              © 2024 Shambil Pride Academy Birnin Gwari. All rights reserved.
            </p>
            <p className="text-blue-200 text-sm">
              Empowering minds, building futures - Knowledge is a way to success
            </p>
            <div className="mt-8 flex justify-center space-x-6">
              <div className="flex items-center text-blue-200">
                <HeartIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">Made with care for education</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
