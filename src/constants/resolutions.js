// Available dimensions for different use cases
export const resolutions = [
  // Social media sizes
  {
    value: 'instagram_post',
    label: 'Instagram Post',
    width: 1080,
    height: 1080,
    category: 'Social Media',
    aspectRatio: '1:1'
  },
  {
    value: 'mobile_wallpaper',
    label: 'Mobile Wallpaper',
    width: 1080,
    height: 1920,
    category: 'Social Media',
    aspectRatio: '9:16'
  },
  {
    value: 'hd_wallpaper',
    label: 'HD Wallpaper',
    width: 1920,
    height: 1080,
    category: 'Social Media',
    aspectRatio: '16:9'
  },
  
  // common video/display resolutions
  {
    value: 'hd',
    label: 'HD (1080p)',
    width: 1920,
    height: 1440,
    category: 'Standard',
    aspectRatio: '4:3'
  },
  {
    value: 'fhd',
    label: 'FHD (1440p)',
    width: 2560,
    height: 1440,
    category: 'Standard',
    aspectRatio: '16:9'
  },
  {
    value: '2k',
    label: '2K',
    width: 2560,
    height: 1440,
    category: 'Standard',
    aspectRatio: '16:9'
  },
  {
    value: '4k',
    label: '4K (2160p)',
    width: 3840,
    height: 2160,
    category: 'Standard',
    aspectRatio: '16:9'
  },
  
  // 4K wallpaper
  {
    value: '4k_wallpaper',
    label: '4K Wallpaper',
    width: 3840,
    height: 2160,
    category: 'Wallpaper',
    aspectRatio: '16:9'
  },
  
  // print sizes
  {
    value: 'a4_print',
    label: 'A4 Print (Portrait)',
    width: 2480,
    height: 3508,
    category: 'Print',
    aspectRatio: '3:4'
  },
  {
    value: 'a3_print',
    label: 'A3 Print (Portrait)',
    width: 3508,
    height: 4961,
    category: 'Print',
    aspectRatio: '3:4'
  },
  {
    value: 'a2_print',
    label: 'A2 Print (Portrait)',
    width: 4961,
    height: 7016,
    category: 'Print',
    aspectRatio: '3:4'
  },
  
  // poster dimensions
  {
    value: 'poster_18x24',
    label: 'Poster 18x24" (Portrait)',
    width: 2160,
    height: 2880,
    category: 'Poster',
    aspectRatio: '3:4'
  },
  {
    value: 'poster_24x36',
    label: 'Poster 24x36" (Portrait)',
    width: 2880,
    height: 4320,
    category: 'Poster',
    aspectRatio: '3:4'
  }
];

export const DEFAULT_RESOLUTION = 'fhd';

// organizes resolutions by their category
export const getResolutionsByCategory = () => {
  const grouped = {};
  resolutions.forEach(res => {
    if (!grouped[res.category]) {
      grouped[res.category] = [];
    }
    grouped[res.category].push(res);
  });
  return grouped;
};
