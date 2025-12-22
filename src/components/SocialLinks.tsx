import React from 'react';
import { 
  Youtube, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Globe,
  ExternalLink 
} from 'lucide-react';

interface SocialLinksProps {
  socialLinks?: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

const SocialLinks: React.FC<SocialLinksProps> = ({ 
  socialLinks, 
  size = 'md', 
  showLabels = false 
}) => {
  if (!socialLinks) return null;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  };

  const socialPlatforms = [
    {
      key: 'youtube',
      icon: Youtube,
      label: 'YouTube',
      url: socialLinks.youtube,
      color: 'hover:bg-red-50 hover:text-red-600',
      bgColor: 'bg-red-500'
    },
    {
      key: 'instagram',
      icon: Instagram,
      label: 'Instagram',
      url: socialLinks.instagram,
      color: 'hover:bg-pink-50 hover:text-pink-600',
      bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500'
    },
    {
      key: 'twitter',
      icon: Twitter,
      label: 'X (Twitter)',
      url: socialLinks.twitter,
      color: 'hover:bg-blue-50 hover:text-blue-600',
      bgColor: 'bg-black'
    },
    {
      key: 'linkedin',
      icon: Linkedin,
      label: 'LinkedIn',
      url: socialLinks.linkedin,
      color: 'hover:bg-blue-50 hover:text-blue-700',
      bgColor: 'bg-blue-600'
    },
    {
      key: 'website',
      icon: Globe,
      label: 'ウェブサイト',
      url: socialLinks.website,
      color: 'hover:bg-gray-50 hover:text-gray-600',
      bgColor: 'bg-gray-600'
    }
  ];

  const validLinks = socialPlatforms.filter(platform => platform.url && platform.url.trim() !== '');

  if (validLinks.length === 0) return null;

  const validateAndFormatUrl = (url: string): string => {
    try {
      // httpまたはhttpsで始まらない場合は追加
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {validLinks.map((platform) => {
        const IconComponent = platform.icon;
        const formattedUrl = validateAndFormatUrl(platform.url!);
        
        return (
          <div key={platform.key} className="flex items-center space-x-1">
            <a
              href={formattedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                ${buttonSizeClasses[size]} rounded-lg transition-all duration-200 
                ${platform.color} group relative
              `}
              title={`${platform.label}で開く`}
            >
              <IconComponent className={`${sizeClasses[size]} text-gray-600 group-hover:scale-110 transition-transform duration-200`} />
              
              {/* 外部リンクアイコン */}
              <ExternalLink className="absolute -top-1 -right-1 h-2 w-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </a>
            
            {showLabels && (
              <span className="text-xs text-gray-500 font-medium">{platform.label}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SocialLinks;