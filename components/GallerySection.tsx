'use client';

import { useState } from 'react';
import { 
  Search,
  ExternalLink,
  Heart,
  Eye
} from 'lucide-react';

const GallerySection = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'icons', label: 'Icons' },
    { id: 'logos', label: 'Logos' },
    { id: 'illustrations', label: 'Illustrations' },
    { id: 'charts', label: 'Charts' }
  ];

  const galleryItems = [
    {
      id: 1,
      title: 'Modern User Icon',
      category: 'icons',
      svgCode: `<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="25" r="12" fill="#3B82F6"/><path d="M40 45c-12 0-22 8-22 18v2h44v-2c0-10-10-18-22-18z" fill="#3B82F6"/></svg>`,
      views: 1234,
      downloads: 567
    },
    {
      id: 2,
      title: 'Company Logo',
      category: 'logos',
      svgCode: `<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="60" height="60" rx="8" fill="#10B981"/><text x="40" y="50" text-anchor="middle" fill="white" font-size="24" font-weight="bold">C</text></svg>`,
      views: 2341,
      downloads: 892
    },
    {
      id: 3,
      title: 'Data Visualization',
      category: 'charts',
      svgCode: `<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="50" width="15" height="20" fill="#F59E0B"/><rect x="30" y="30" width="15" height="40" fill="#EF4444"/><rect x="50" y="20" width="15" height="50" fill="#8B5CF6"/></svg>`,
      views: 987,
      downloads: 234
    },
    {
      id: 4,
      title: 'Abstract Art',
      category: 'illustrations',
      svgCode: `<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="20" fill="#EC4899" opacity="0.7"/><circle cx="50" cy="50" r="20" fill="#06B6D4" opacity="0.7"/></svg>`,
      views: 1567,
      downloads: 445
    },
    {
      id: 5,
      title: 'Settings Gear',
      category: 'icons',
      svgCode: `<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><path d="M40 20c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm0 30c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10z" fill="#6B7280"/></svg>`,
      views: 876,
      downloads: 321
    },
    {
      id: 6,
      title: 'Brand Identity',
      category: 'logos',
      svgCode: `<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><polygon points="40,10 60,30 60,50 40,70 20,50 20,30" fill="#7C3AED"/><circle cx="40" cy="40" r="8" fill="white"/></svg>`,
      views: 1890,
      downloads: 678
    }
  ];

  const filteredItems = activeCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  const toggleLike = (id: number) => {
    const newLiked = new Set(likedItems);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedItems(newLiked);
  };

  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            SVG Template Gallery
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Explore our collection of professionally designed SVG templates
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Preview */}
              <div className="relative bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center h-48">
                <div 
                  className="w-20 h-20 flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: item.svgCode }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                    <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform">
                      <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform">
                      <ExternalLink className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                
                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {item.views.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      {item.downloads.toLocaleString()}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => toggleLike(item.id)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Heart className={`w-5 h-5 ${likedItems.has(item.id) ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-500'}`} />
                  </button>
                </div>
                
                {/* Actions */}
                <div className="flex space-x-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                    Use Template
                  </button>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Load More Templates
          </button>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;