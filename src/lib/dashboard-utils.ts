export const generateAudioLevels = () => Array.from({ length: 40 }, () => Math.random() * 60 + 20);

// Utility for Sidebar class calculation
export const getSidebarClass = (screenSize, sidebarOpen, cn) => {
  if (screenSize === 'desktop') {
    return cn(
      sidebarOpen ? 'relative w-72 flex-shrink-0' : 'relative w-0 flex-shrink-0 overflow-hidden',
      'bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out'
    );
  } else {
    return cn(
      'fixed inset-y-0 left-0 z-50 w-72',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      'transition-transform duration-300 ease-in-out bg-card border-r border-border flex flex-col'
    );
  }
};