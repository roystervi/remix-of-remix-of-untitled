import { db } from '@/db';
import { appearanceSettings } from '@/db/schema';

async function main() {
    const defaultAppearanceSettings = [
        {
            primaryColor: '#3b82f6',
            backgroundColor: 'rgb(92, 113, 132)',
            cardPlaceholderColor: '#9ca3af',
            navbarBackgroundColor: 'rgb(22, 143, 203)',
            themePreset: 'default',
            screenSize: 'desktop',
            width: 1200,
            height: 800,
            mode: 'auto',
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(appearanceSettings).values(defaultAppearanceSettings);
    
    console.log('✅ Appearance settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});