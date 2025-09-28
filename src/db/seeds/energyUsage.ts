import { db } from '@/db';
import { energyUsage } from '@/db/schema';

async function main() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const sampleEnergyUsage = [];
    
    // Generate 18 records for last 24 hours (30%)
    for (let i = 0; i < 18; i++) {
        const randomTime = new Date(oneDayAgo.getTime() + Math.random() * (now.getTime() - oneDayAgo.getTime()));
        const hour = randomTime.getHours();
        const deviceId = Math.random() < 0.5 ? 16 : 17;
        
        let consumptionKwh;
        if (deviceId === 16) { // Light - higher usage 6PM-11PM
            if (hour >= 18 && hour <= 23) {
                consumptionKwh = 0.10 + Math.random() * 0.05; // 0.10-0.15
            } else if (hour >= 0 && hour <= 5) {
                consumptionKwh = 0.05 + Math.random() * 0.03; // 0.05-0.08
            } else {
                consumptionKwh = 0.07 + Math.random() * 0.05; // 0.07-0.12
            }
        } else { // Speaker - higher usage 12PM-10PM
            if (hour >= 12 && hour <= 22) {
                consumptionKwh = 0.04 + Math.random() * 0.04; // 0.04-0.08
            } else {
                consumptionKwh = 0.02 + Math.random() * 0.02; // 0.02-0.04
            }
        }
        
        consumptionKwh = Math.round(consumptionKwh * 1000) / 1000;
        const cost = Math.round(consumptionKwh * 0.12 * 100) / 100;
        
        sampleEnergyUsage.push({
            deviceId,
            timestamp: randomTime.toISOString(),
            consumptionKwh,
            cost,
        });
    }
    
    // Generate 42 records for days 2-7 (70%)
    for (let i = 0; i < 42; i++) {
        const randomTime = new Date(sevenDaysAgo.getTime() + Math.random() * (oneDayAgo.getTime() - sevenDaysAgo.getTime()));
        const hour = randomTime.getHours();
        const deviceId = Math.random() < 0.5 ? 16 : 17;
        
        let consumptionKwh;
        if (deviceId === 16) { // Light - higher usage 6PM-11PM
            if (hour >= 18 && hour <= 23) {
                consumptionKwh = 0.10 + Math.random() * 0.05; // 0.10-0.15
            } else if (hour >= 0 && hour <= 5) {
                consumptionKwh = 0.05 + Math.random() * 0.03; // 0.05-0.08
            } else {
                consumptionKwh = 0.07 + Math.random() * 0.05; // 0.07-0.12
            }
        } else { // Speaker - higher usage 12PM-10PM
            if (hour >= 12 && hour <= 22) {
                consumptionKwh = 0.04 + Math.random() * 0.04; // 0.04-0.08
            } else {
                consumptionKwh = 0.02 + Math.random() * 0.02; // 0.02-0.04
            }
        }
        
        consumptionKwh = Math.round(consumptionKwh * 1000) / 1000;
        const cost = Math.round(consumptionKwh * 0.12 * 100) / 100;
        
        sampleEnergyUsage.push({
            deviceId,
            timestamp: randomTime.toISOString(),
            consumptionKwh,
            cost,
        });
    }
    
    // Sort by timestamp
    sampleEnergyUsage.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    await db.insert(energyUsage).values(sampleEnergyUsage);
    
    console.log('✅ Energy usage seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});