// アバター表示のためのユーティリティ関数

export const generateUserAvatar = (author: string, role: string) => {
  const initials = author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600', 
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600'
  ];
  const colorIndex = author.charCodeAt(0) % colors.length;
  return { initials, gradient: colors[colorIndex] };
};

export const generateAvatarGradient = (name: string = '') => {
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600', 
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600',
    'from-pink-500 to-rose-600',
    'from-yellow-500 to-orange-600'
  ];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : Math.floor(Math.random() * colors.length);
  return colors[colorIndex];
};

export const getExpertBadgeInfo = (role: string) => {
  if (role.includes('医師') || role.includes('医') || role.includes('Dr')) {
    return { type: 'doctor', color: 'text-blue-600', bg: 'bg-blue-100', label: '医師' };
  }
  if (role.includes('看護師') || role.includes('ナース')) {
    return { type: 'nurse', color: 'text-emerald-600', bg: 'bg-emerald-100', label: '看護師' };
  }
  if (role.includes('技師') || role.includes('技士')) {
    return { type: 'technician', color: 'text-purple-600', bg: 'bg-purple-100', label: '技師' };
  }
  return null;
};