import { db } from '@/db';
import { systemPerformance } from '@/db/schema';

async function main() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const samplePerformanceData = [
        // Uptime entries (5)
        {
            metricType: 'uptime',
            value: 99.7,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'uptime',
            value: 99.2,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'uptime',
            value: 99.8,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'uptime',
            value: 99.1,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'uptime',
            value: 99.5,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        
        // Response time entries (5)
        {
            metricType: 'response_time',
            value: 145.2,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'response_time',
            value: 162.8,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'response_time',
            value: 128.5,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'response_time',
            value: 175.1,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'response_time',
            value: 134.7,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        
        // Error rate entries (5)
        {
            metricType: 'error_rate',
            value: 0.08,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'error_rate',
            value: 0.12,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'error_rate',
            value: 0.05,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'error_rate',
            value: 0.14,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'error_rate',
            value: 0.09,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        
        // CPU usage entries (5)
        {
            metricType: 'cpu_usage',
            value: 28.3,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'cpu_usage',
            value: 41.7,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'cpu_usage',
            value: 19.5,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'cpu_usage',
            value: 36.2,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'cpu_usage',
            value: 23.8,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        
        // Memory usage entries (5)
        {
            metricType: 'memory_usage',
            value: 72.4,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'memory_usage',
            value: 68.1,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'memory_usage',
            value: 81.5,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'memory_usage',
            value: 75.9,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'memory_usage',
            value: 63.2,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        
        // Disk usage entries (5)
        {
            metricType: 'disk_usage',
            value: 32.1,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'disk_usage',
            value: 28.7,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'disk_usage',
            value: 37.8,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'disk_usage',
            value: 29.4,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
        {
            metricType: 'disk_usage',
            value: 35.6,
            timestamp: new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime())).toISOString(),
        },
    ];

    await db.insert(systemPerformance).values(samplePerformanceData);
    
    console.log('✅ System performance seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});