export function getSidebarClass(
  screenSize: 'mobile' | 'tablet' | 'desktop',
  sidebarOpen: boolean,
  cn: (classes: string) => string
) {
  const baseClasses = 'fixed inset-y-0 left-0 z-50 w-80 bg-sidebar text-sidebar-foreground transform transition-transform ease-in-out duration-300 overflow-hidden';
  
  let positionClasses = '';
  if (screenSize === 'desktop') {
    positionClasses = 'translate-x-0'; // Always visible on desktop
  } else {
    positionClasses = sidebarOpen ? 'translate-x-0' : '-translate-x-full';
  }
  
  return cn(`${baseClasses} ${positionClasses}`);
}