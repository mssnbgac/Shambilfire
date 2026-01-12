'use client';

import { useState, useEffect } from 'react';
import { 
  PencilIcon, 
  PhotoIcon, 
  VideoCameraIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  CalendarIcon,
  TrophyIcon,
  InformationCircleIcon,
  BookOpenIcon,
  AcademicCapIcon,
  NewspaperIcon,
  CloudArrowUpIcon,
  LinkIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useContent } from '@/contexts/ContentContext';
import MediaUploader from './MediaUploader';
import toast from 'react-hot-toast';

// Import storage keys for debugging
const STORAGE_KEYS = {
  SECTIONS: 'shambil_homepage_sections',
  NEWS_EVENTS: 'shambil_news_events'
};

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

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  size: number;
  uploadDate: string;
  section: string;
}

export default function HomepageManager() {
  const { user } = useAuth();
  const { 
    sections, 
    newsEvents, 
    updateSection, 
    updateNewsEvent, 
    deleteSection, 
    deleteNewsEvent,
    loading 
  } = useContent();
  const [activeTab, setActiveTab] = useState<'sections' | 'news' | 'media' | 'preview'>('sections');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [editingNews, setEditingNews] = useState<NewsEvent | null>(null);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadMediaData();
    loadHomepageContent();
  }, []);

  const loadHomepageContent = async () => {
    try {
      // Try API first
      const response = await fetch('/api/homepage');
      if (response.ok) {
        const data = await response.json();
        if (data.homepage) {
          // Update sections based on API data
          console.log('Loaded homepage content from API:', data.homepage);
        }
      } else {
        console.log('API not available, using default content');
      }
    } catch (error) {
      console.error('Error loading homepage content:', error);
    }
  };

  const loadMediaData = () => {
    // Demo media files
    const demoMediaFiles: MediaFile[] = [
      {
        id: '1',
        name: 'hero-background.jpg',
        url: '/images/hero-bg.jpg',
        type: 'image',
        size: 2048000,
        uploadDate: '2024-01-10',
        section: 'hero'
      },
      {
        id: '2',
        name: 'school-tour.mp4',
        url: '/videos/campus-tour.mp4',
        type: 'video',
        size: 15728640,
        uploadDate: '2024-01-08',
        section: 'gallery'
      },
      {
        id: '3',
        name: 'about-us-1.jpg',
        url: '/images/about-1.jpg',
        type: 'image',
        size: 1536000,
        uploadDate: '2024-01-05',
        section: 'about'
      }
    ];

    setMediaFiles(demoMediaFiles);
  };

  const handleSaveSection = (sectionData: Partial<HomepageSection>) => {
    if (editingSection) {
      const updatedSection: HomepageSection = {
        ...editingSection,
        ...sectionData,
        lastUpdated: new Date().toISOString().split('T')[0],
        updatedBy: user?.firstName || 'Admin'
      };
      updateSection(updatedSection);
      toast.success('Section updated successfully!');
    } else {
      const newSection: HomepageSection = {
        id: Date.now().toString(),
        type: sectionData.type || 'about',
        title: sectionData.title || '',
        content: sectionData.content || '',
        images: sectionData.images || [],
        videos: sectionData.videos || [],
        isActive: sectionData.isActive ?? true,
        order: sections.length + 1,
        lastUpdated: new Date().toISOString().split('T')[0],
        updatedBy: user?.firstName || 'Admin'
      };
      updateSection(newSection);
      toast.success('Section created successfully!');
    }
    setShowSectionForm(false);
    setEditingSection(null);
  };

  const handleSaveNews = (newsData: Partial<NewsEvent>) => {
    if (editingNews) {
      const updatedNews: NewsEvent = {
        ...editingNews,
        ...newsData
      };
      updateNewsEvent(updatedNews);
      toast.success('News/Event updated successfully!');
    } else {
      const newNews: NewsEvent = {
        id: Date.now().toString(),
        title: newsData.title || '',
        content: newsData.content || '',
        date: newsData.date || new Date().toISOString().split('T')[0],
        type: newsData.type || 'news',
        image: newsData.image,
        isActive: newsData.isActive ?? true,
        isFeatured: newsData.isFeatured ?? false
      };
      updateNewsEvent(newNews);
      toast.success('News/Event created successfully!');
    }
    setShowNewsForm(false);
    setEditingNews(null);
  };

  const handleDeleteSection = (sectionId: string) => {
    deleteSection(sectionId);
    toast.success('Section deleted successfully!');
  };

  const handleDeleteNews = (newsId: string) => {
    deleteNewsEvent(newsId);
    toast.success('News/Event deleted successfully!');
  };

  const handleMediaUpload = (uploadedFiles: any[]) => {
    const newMediaFiles = uploadedFiles.map(file => ({
      ...file,
      uploadDate: new Date().toISOString().split('T')[0],
      section: 'homepage'
    }));
    setMediaFiles(prev => [...prev, ...newMediaFiles]);
    toast.success(`${uploadedFiles.length} file(s) added to media library!`);
  };

  const handleDeleteMedia = (mediaId: string) => {
    setMediaFiles(prev => prev.filter(media => media.id !== mediaId));
    toast.success('Media file deleted successfully!');
  };

  const handleToggleActive = (id: string, type: 'section' | 'news') => {
    if (type === 'section') {
      const section = sections.find(s => s.id === id);
      if (section) {
        const updatedSection = { ...section, isActive: !section.isActive };
        updateSection(updatedSection);
      }
    } else {
      const news = newsEvents.find(n => n.id === id);
      if (news) {
        const updatedNews = { ...news, isActive: !news.isActive };
        updateNewsEvent(updatedNews);
      }
    }
    toast.success(`${type === 'section' ? 'Section' : 'News/Event'} ${type === 'section' ? sections.find(s => s.id === id)?.isActive ? 'deactivated' : 'activated' : newsEvents.find(n => n.id === id)?.isActive ? 'deactivated' : 'activated'}!`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'hero': return GlobeAltIcon;
      case 'about': return InformationCircleIcon;
      case 'history': return BookOpenIcon;
      case 'objectives': return AcademicCapIcon;
      case 'gallery': return PhotoIcon;
      case 'news': return NewspaperIcon;
      case 'achievements': return TrophyIcon;
      default: return DocumentTextIcon;
    }
  };

  const SectionForm = () => {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length !== files.length) {
        toast.error('Please select only image files');
      }

      if (imageFiles.length > 0) {
        setSelectedImages(prev => [...prev, ...imageFiles]);
        
        // Create previews for new images
        imageFiles.forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              setImagePreviews(prev => [...prev, e.target!.result as string]);
            }
          };
          reader.readAsDataURL(file);
        });
      }
    };

    const removeImage = (index: number) => {
      URL.revokeObjectURL(imagePreviews[index]);
      setSelectedImages(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const clearAllImages = () => {
      imagePreviews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      setSelectedImages([]);
      setImagePreviews([]);
    };

    const convertFilesToDataUrls = async (files: File[]): Promise<string[]> => {
      console.log('Converting files to data URLs:', files.length, 'files');
      const promises = files.map((file, index) => {
        console.log(`Converting file ${index + 1}:`, file.name, file.type, file.size);
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              const dataUrl = e.target.result as string;
              console.log(`File ${index + 1} converted:`, dataUrl.substring(0, 50) + '...');
              
              // Check if the data URL is too large (over 1MB)
              if (dataUrl.length > 1024 * 1024) {
                console.warn(`File ${index + 1} is large (${(dataUrl.length / 1024 / 1024).toFixed(2)}MB), consider compression`);
                
                // Simple compression by reducing quality for large images
                if (file.type.startsWith('image/')) {
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  const img = new Image();
                  
                  img.onload = () => {
                    // Resize if image is too large
                    const maxWidth = 800;
                    const maxHeight = 600;
                    let { width, height } = img;
                    
                    if (width > maxWidth || height > maxHeight) {
                      const ratio = Math.min(maxWidth / width, maxHeight / height);
                      width *= ratio;
                      height *= ratio;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    ctx?.drawImage(img, 0, 0, width, height);
                    
                    // Convert to compressed JPEG
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    console.log(`File ${index + 1} compressed from ${(dataUrl.length / 1024).toFixed(0)}KB to ${(compressedDataUrl.length / 1024).toFixed(0)}KB`);
                    resolve(compressedDataUrl);
                  };
                  
                  img.onerror = () => {
                    console.warn(`File ${index + 1} compression failed, using original`);
                    resolve(dataUrl);
                  };
                  
                  img.src = dataUrl;
                } else {
                  resolve(dataUrl);
                }
              } else {
                resolve(dataUrl);
              }
            } else {
              reject(new Error('Failed to read file'));
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
      });
      
      const results = await Promise.all(promises);
      console.log('All files converted successfully:', results.length, 'data URLs');
      return results;
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingSection ? 'Edit Section' : 'Create New Section'}
          </h3>
          <form className="space-y-6" onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            
            console.log('Form submission: Selected images count:', selectedImages.length);
            console.log('Form submission: Existing images:', editingSection?.images);
            
            // Handle image uploads - convert to data URLs for persistence
            let imageUrls = editingSection?.images || [];
            if (selectedImages.length > 0) {
              try {
                console.log('Converting images to data URLs...');
                const newImageUrls = await convertFilesToDataUrls(selectedImages);
                console.log('Converted images:', newImageUrls.length, 'URLs generated');
                console.log('First image preview:', newImageUrls[0]?.substring(0, 50) + '...');
                imageUrls = [...imageUrls, ...newImageUrls];
                console.log('Final image URLs count:', imageUrls.length);
              } catch (error) {
                console.error('Image conversion error:', error);
                toast.error('Failed to process images');
                return;
              }
            }
            
            const sectionData = {
              type: formData.get('type') as any,
              title: formData.get('title') as string,
              content: formData.get('content') as string,
              images: imageUrls,
              isActive: formData.get('isActive') === 'on'
            };
            
            console.log('Saving section data:', sectionData);
            console.log('Image URLs being saved:', imageUrls);
            console.log('Image URLs length:', imageUrls.length);
            if (imageUrls.length > 0) {
              console.log('First image URL preview:', imageUrls[0].substring(0, 100) + '...');
              console.log('First image is data URL:', imageUrls[0].startsWith('data:'));
            }
            handleSaveSection(sectionData);
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Section Type</label>
                <select 
                  name="type"
                  defaultValue={editingSection?.type || 'about'}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="hero">Hero Section</option>
                  <option value="about">About Us</option>
                  <option value="history">Our History</option>
                  <option value="objectives">Aims & Objectives</option>
                  <option value="gallery">Gallery</option>
                  <option value="news">News & Events</option>
                  <option value="achievements">Achievements</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingSection?.title || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Section title"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                name="content"
                rows={6}
                defaultValue={editingSection?.content || ''}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Section content..."
                required
              />
            </div>

            {/* Images Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
              
              {/* Existing Images */}
              {editingSection?.images && editingSection.images.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {editingSection.images.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={imageUrl} 
                          alt={`Section image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-300"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.jpg';
                          }}
                        />
                        <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          Current
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">New Images to Upload:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Upload Input */}
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <PhotoIcon className="h-4 w-4 mr-2" />
                  Add Images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                {imagePreviews.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllImages}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Clear New Images
                  </button>
                )}
                {/* Debug button */}
                <button
                  type="button"
                  onClick={() => {
                    console.log('Debug: Selected images:', selectedImages);
                    console.log('Debug: Image previews:', imagePreviews);
                    console.log('Debug: Editing section:', editingSection);
                    console.log('Debug: Current sections from context:', sections);
                    const gallerySection = sections.find(s => s.type === 'gallery');
                    console.log('Debug: Current gallery section:', gallerySection);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Debug Images
                </button>
                {/* Test localStorage button */}
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const testData = localStorage.getItem(STORAGE_KEYS.SECTIONS);
                      console.log('Debug: localStorage sections data length:', testData?.length || 0);
                      if (testData) {
                        const parsed = JSON.parse(testData);
                        console.log('Debug: Parsed sections:', parsed);
                        const gallerySection = parsed.find((s: any) => s.type === 'gallery');
                        console.log('Debug: Gallery section from localStorage:', gallerySection);
                      }
                    } catch (error) {
                      console.error('Debug: Error reading localStorage:', error);
                    }
                  }}
                  className="text-green-600 hover:text-green-800 text-sm"
                >
                  Test Storage
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPG, PNG, GIF, WebP (Max 5MB each). Images will be stored as data URLs for persistence.
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                defaultChecked={editingSection?.isActive ?? true}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active (visible on homepage)
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowSectionForm(false);
                  setEditingSection(null);
                  clearAllImages();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingSection ? 'Update' : 'Create'} Section
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const NewsForm = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.type.startsWith('image/')) {
          setSelectedImage(file);
          
          // Create data URL preview
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              setImagePreview(e.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        } else {
          toast.error('Please select an image file');
        }
      }
    };

    const removeImage = () => {
      setSelectedImage(null);
      setImagePreview('');
    };

    const convertFileToDataUrl = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingNews ? 'Edit News/Event' : 'Create News/Event'}
          </h3>
          <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            
            // Handle image upload - convert to data URL for persistence
            let imageUrl = editingNews?.image || '';
            if (selectedImage) {
              try {
                imageUrl = await convertFileToDataUrl(selectedImage);
              } catch (error) {
                toast.error('Failed to process image');
                return;
              }
            }
            
            handleSaveNews({
              title: formData.get('title') as string,
              content: formData.get('content') as string,
              date: formData.get('date') as string,
              type: formData.get('type') as 'news' | 'event',
              image: imageUrl,
              isActive: formData.get('isActive') === 'on',
              isFeatured: formData.get('isFeatured') === 'on'
            });
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select 
                  name="type"
                  defaultValue={editingNews?.type || 'news'}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="news">News</option>
                  <option value="event">Event</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={editingNews?.date || new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                defaultValue={editingNews?.title || ''}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="News/Event title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                name="content"
                rows={4}
                defaultValue={editingNews?.content || ''}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="News/Event content..."
                required
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              
              {/* Current Image Preview */}
              {(imagePreview || editingNews?.image) && (
                <div className="mb-4">
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview || editingNews?.image} 
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* File Upload Input */}
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <PhotoIcon className="h-4 w-4 mr-2" />
                  {imagePreview || editingNews?.image ? 'Change Image' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                {(imagePreview || editingNews?.image) && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove Image
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: JPG, PNG, GIF, WebP (Max 5MB). Images will be stored as data URLs.
              </p>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="newsActive"
                  defaultChecked={editingNews?.isActive ?? true}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="newsActive" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isFeatured"
                  id="newsFeatured"
                  defaultChecked={editingNews?.isFeatured ?? false}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="newsFeatured" className="ml-2 block text-sm text-gray-900">
                  Featured
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowNewsForm(false);
                  setEditingNews(null);
                  removeImage();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingNews ? 'Update' : 'Create'} {editingNews?.type || 'News'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Homepage Management</h2>
          <p className="text-gray-600">Manage homepage content, sections, and media</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            {previewMode ? 'Exit Preview' : 'Preview Homepage'}
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            View Live Site
          </a>
          {/* Debug button to clear localStorage */}
          <button
            onClick={() => {
              if (confirm('Clear all homepage content from localStorage? This will reset all sections and news.')) {
                localStorage.removeItem(STORAGE_KEYS.SECTIONS);
                localStorage.removeItem(STORAGE_KEYS.NEWS_EVENTS);
                window.location.reload();
              }
            }}
            className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Clear Storage
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'sections', label: 'Sections', count: sections.length },
            { key: 'news', label: 'News & Events', count: newsEvents.length },
            { key: 'media', label: 'Media Library', count: mediaFiles.length },
            { key: 'preview', label: 'Preview', count: null }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} {tab.count !== null && `(${tab.count})`}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Homepage Sections</h3>
            <button
              onClick={() => setShowSectionForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Section
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {sections.map((section) => {
              const IconComponent = getSectionIcon(section.type);
              return (
                <div key={section.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-2 rounded-lg ${section.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <IconComponent className={`h-6 w-6 ${section.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{section.title}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            section.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {section.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                            {section.type}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{section.content}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Order: {section.order}</span>
                          <span>Updated: {section.lastUpdated}</span>
                          <span>By: {section.updatedBy}</span>
                          {section.images.length > 0 && (
                            <span className="flex items-center">
                              <PhotoIcon className="h-4 w-4 mr-1" />
                              {section.images.length} images
                            </span>
                          )}
                          {section.videos.length > 0 && (
                            <span className="flex items-center">
                              <VideoCameraIcon className="h-4 w-4 mr-1" />
                              {section.videos.length} videos
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(section.id, 'section')}
                        className={`p-2 rounded-md ${
                          section.isActive 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={section.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {section.isActive ? <XMarkIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => {
                          setEditingSection(section);
                          setShowSectionForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'news' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">News & Events</h3>
            <button
              onClick={() => setShowNewsForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add News/Event
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newsEvents.map((news) => (
              <div key={news.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      news.type === 'news' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {news.type}
                    </span>
                    {news.isFeatured && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      news.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {news.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(news.id, 'news')}
                      className={`p-1 rounded-md ${
                        news.isActive 
                          ? 'text-red-600 hover:bg-red-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {news.isActive ? <XMarkIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingNews(news);
                        setShowNewsForm(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNews(news.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {news.image && (
                  <div className="mb-4">
                    <img 
                      src={news.image} 
                      alt={news.title}
                      className="w-full h-32 object-cover rounded-lg bg-gray-100"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <h4 className="text-lg font-medium text-gray-900 mb-2">{news.title}</h4>
                <p className="text-gray-600 mb-3 line-clamp-3">{news.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(news.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Media Library</h3>
            <button
              onClick={() => setShowMediaUpload(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <CloudArrowUpIcon className="h-4 w-4 mr-2" />
              Upload Media
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaFiles.map((file) => (
              <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    file.type === 'image' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {file.type}
                  </span>
                  <button 
                    onClick={() => handleDeleteMedia(file.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="mb-3">
                  {file.type === 'image' ? (
                    <img 
                      src={file.url} 
                      alt={file.name}
                      className="w-full h-32 object-cover rounded-lg bg-gray-100"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <VideoCameraIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <h4 className="text-sm font-medium text-gray-900 mb-1 truncate">{file.name}</h4>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Size: {formatFileSize(file.size)}</div>
                  <div>Uploaded: {file.uploadDate}</div>
                  <div>Section: {file.section}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center">
            <GlobeAltIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Homepage Preview</h3>
            <p className="text-gray-600 mb-6">
              Preview how your homepage will look with the current content and settings.
            </p>
            <div className="space-y-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <EyeIcon className="h-5 w-5 mr-2" />
                Open Homepage in New Tab
              </a>
              <p className="text-sm text-gray-500">
                Changes will be reflected immediately on the live homepage.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Forms */}
      {showSectionForm && <SectionForm />}
      {showNewsForm && <NewsForm />}
      
      {/* Media Uploader */}
      <MediaUploader
        isOpen={showMediaUpload}
        onClose={() => setShowMediaUpload(false)}
        onUpload={handleMediaUpload}
        section="homepage"
        maxFiles={10}
        maxFileSize={20 * 1024 * 1024} // 20MB
      />
    </div>
  );
}