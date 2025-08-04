'use client';

import { 
  Sparkles,
  Layers,
  Download,
  Code,
  Play,
  Smartphone
} from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Conversion',
      description: 'Advanced AI algorithms ensure perfect conversion quality with automatic optimization for different use cases.',
      color: 'purple',
      highlight: true
    },
    {
      icon: Layers,
      title: 'Template Library',
      description: 'Access hundreds of pre-designed SVG templates and icons ready for instant conversion to PNG format.',
      color: 'blue'
    },
    {
      icon: Download,
      title: 'Multiple Export Options',
      description: 'Export in various resolutions and formats including PNG, JPG, WebP with customizable quality settings.',
      color: 'emerald'
    },
    {
      icon: Code,
      title: 'Code Editor',
      description: 'Built-in SVG code editor with syntax highlighting, validation, and real-time preview capabilities.',
      color: 'amber'
    },
    {
      icon: Play,
      title: 'Animation Support',
      description: 'Convert animated SVGs to PNG sequences or GIFs while preserving animation timing and effects.',
      color: 'rose'
    },
    {
      icon: Smartphone,
      title: 'Responsive Design',
      description: 'Optimized for all devices with responsive design ensuring perfect conversion on mobile and desktop.',
      color: 'indigo'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-700',
        gradient: 'from-purple-500 to-purple-600',
        glow: 'shadow-purple-500/25'
      },
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-700',
        gradient: 'from-blue-500 to-blue-600',
        glow: 'shadow-blue-500/25'
      },
      emerald: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-700',
        gradient: 'from-emerald-500 to-emerald-600',
        glow: 'shadow-emerald-500/25'
      },
      amber: {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-700',
        gradient: 'from-amber-500 to-amber-600',
        glow: 'shadow-amber-500/25'
      },
      rose: {
        bg: 'bg-rose-100 dark:bg-rose-900/30',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-700',
        gradient: 'from-rose-500 to-rose-600',
        glow: 'shadow-rose-500/25'
      },
      indigo: {
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-700',
        gradient: 'from-indigo-500 to-indigo-600',
        glow: 'shadow-indigo-500/25'
      }
    };
    return colorMap[color as keyof typeof colorMap];
  };

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features for Perfect Conversions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Everything you need to convert SVG to PNG with professional quality and ease
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const colors = getColorClasses(feature.color);
            const Icon = feature.icon;
            
            return (
              <div 
                key={index} 
                className={`relative bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group ${
                  feature.highlight ? `ring-2 ring-purple-500/20 ${colors.glow}` : ''
                }`}
              >
                {/* Highlight Badge */}
                {feature.highlight && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      AI POWERED
                    </div>
                  </div>
                )}
                
                {/* Icon */}
                <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mb-6 border ${colors.border} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 ${colors.text}`} />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
              </div>
            );
          })}
        </div>

        {/* Bottom Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">10K+</div>
            <div className="text-gray-600 dark:text-gray-400">Happy Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">1M+</div>
            <div className="text-gray-600 dark:text-gray-400">Conversions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">99.9%</div>
            <div className="text-gray-600 dark:text-gray-400">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">24/7</div>
            <div className="text-gray-600 dark:text-gray-400">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;