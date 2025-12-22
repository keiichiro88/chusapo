// MedConsult Design System Constants

export const designSystem = {
  // Border Radius System
  borderRadius: {
    small: 'rounded-xl',      // 12px - buttons, badges, small elements
    medium: 'rounded-2xl',    // 16px - inputs, medium cards
    large: 'rounded-3xl',     // 24px - main cards, modals
  },

  // Spacing System  
  spacing: {
    cardSmall: 'p-6',         // 24px - small cards, sidebars
    cardMedium: 'p-8',        // 32px - standard cards
    cardLarge: 'p-12',        // 48px - hero sections, large containers
    sectionPadding: 'px-6 lg:px-8', // horizontal padding for sections
  },

  // Shadow System
  shadow: {
    rest: 'shadow-sm',
    hover: 'hover:shadow-lg',
    elevated: 'shadow-xl',
    interactive: 'shadow-sm hover:shadow-lg',
  },

  // Color Palette
  colors: {
    // Primary Blues
    primary: {
      50: 'bg-blue-50',
      100: 'bg-blue-100', 
      500: 'bg-blue-500',
      600: 'bg-blue-600',
      700: 'bg-blue-700',
    },
    // Text Colors
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-700', 
      muted: 'text-gray-500',
      light: 'text-gray-400',
      white: 'text-white',
    },
    // Background Gradients
    gradients: {
      hero: 'bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700',
      page: 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30',
      card: 'bg-gradient-to-br from-blue-50 to-purple-50',
      button: 'bg-gradient-to-r from-blue-500 to-blue-600',
    },
  },

  // Typography System
  typography: {
    heading: {
      hero: 'text-4xl lg:text-5xl font-black',
      main: 'text-3xl font-black',
      section: 'text-2xl font-bold',
      card: 'text-xl font-bold',
    },
    body: {
      large: 'text-lg font-medium',
      medium: 'text-base font-medium',
      small: 'text-sm font-medium',
      caption: 'text-xs font-medium',
    },
  },

  // Button System
  buttons: {
    primary: `
      bg-gradient-to-r from-blue-500 to-blue-600 
      text-white px-8 py-4 rounded-2xl font-bold 
      hover:from-blue-600 hover:to-blue-700 
      transition-all duration-200 
      shadow-sm hover:shadow-lg hover:scale-105
    `,
    secondary: `
      border-2 border-gray-300 text-gray-700 
      px-8 py-4 rounded-2xl font-bold 
      hover:bg-gray-50 hover:border-gray-400
      transition-all duration-200
      shadow-sm hover:shadow-lg
    `,
    ghost: `
      text-gray-700 px-4 py-2 rounded-xl font-medium
      hover:bg-gray-50 transition-all duration-200
    `,
    icon: `
      p-3 rounded-xl hover:bg-gray-50 
      transition-colors duration-200
    `,
  },

  // Card System
  cards: {
    standard: `
      bg-white rounded-3xl p-8 
      shadow-sm hover:shadow-lg 
      transition-all duration-200 hover:-translate-y-1
      border border-gray-100
    `,
    small: `
      bg-white rounded-2xl p-6 
      shadow-sm hover:shadow-lg 
      transition-all duration-200
      border border-gray-100
    `,
    stats: `
      bg-gradient-to-br from-blue-50 to-purple-50 
      rounded-2xl p-6 border border-blue-100
    `,
  },

  // Animation & Transitions
  transitions: {
    fast: 'transition-all duration-200',
    medium: 'transition-all duration-300',
    slow: 'transition-all duration-500',
  },

  // Interactive States
  interactive: {
    hover: 'hover:-translate-y-1',
    scale: 'hover:scale-105',
    scaleSmall: 'hover:scale-102',
  },
} as const;

// Helper function to combine classes
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Common component patterns
export const componentPatterns = {
  // Sidebar Navigation Item
  sidebarItem: (isActive: boolean) => cn(
    'w-full flex items-center space-x-3 p-3 rounded-xl',
    'transition-all duration-200 font-medium',
    isActive 
      ? 'bg-blue-50 text-blue-600' 
      : 'text-gray-700 hover:bg-gray-50'
  ),

  // Form Input
  input: cn(
    'w-full px-4 py-3 border border-gray-200 rounded-2xl',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    'transition-all duration-200'
  ),

  // Badge
  badge: cn(
    'px-3 py-1 text-xs font-bold rounded-xl'
  ),

  // Icon container
  iconContainer: (size: 'small' | 'medium' | 'large' = 'medium') => {
    const sizes = {
      small: 'h-8 w-8 p-2',
      medium: 'h-10 w-10 p-2', 
      large: 'h-12 w-12 p-3',
    };
    return cn(
      sizes[size],
      'bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl',
      'flex items-center justify-center'
    );
  },
};