import { db } from '@/db';
import { gasStations } from '@/db/schema';

async function main() {
    const sampleGasStations = [
        {
            name: 'RaceTrac Atlantic Marketplace',
            brand: 'RaceTrac',
            lat: 30.3345,
            lon: -81.6623,
            address: '1665 Mayport Road, Jacksonville, FL 32233',
            fuelTypes: ["regular", "plus", "premium", "e85", "diesel"],
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            name: 'Shell on Heckscher Drive',
            brand: 'Shell',
            lat: 30.3289,
            lon: -81.6542,
            address: '8942 Heckscher Drive, Jacksonville, FL 32226',
            fuelTypes: ["regular", "premium", "diesel"],
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            name: 'BP on Monument Road',
            brand: 'BP',
            lat: 30.3356,
            lon: -81.6721,
            address: '12156 Monument Road, Jacksonville, FL 32225',
            fuelTypes: ["regular", "premium"],
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            name: 'Speedway on Merrill Road',
            brand: 'Speedway',
            lat: 30.3312,
            lon: -81.6598,
            address: '10245 Merrill Road, Jacksonville, FL 32225',
            fuelTypes: ["regular", "premium", "diesel"],
            createdAt: new Date('2024-01-22').toISOString(),
            updatedAt: new Date('2024-01-22').toISOString(),
        },
        {
            name: 'Wawa on Mayport Road',
            brand: 'Wawa',
            lat: 30.3378,
            lon: -81.6634,
            address: '1951 Mayport Road, Jacksonville, FL 32233',
            fuelTypes: ["regular", "premium", "diesel"],
            createdAt: new Date('2024-01-25').toISOString(),
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            name: 'Circle K on Fernandina Road',
            brand: 'Circle K',
            lat: 30.3267,
            lon: -81.6456,
            address: '4567 Fernandina Road, Jacksonville, FL 32226',
            fuelTypes: ["regular", "premium"],
            createdAt: new Date('2024-01-28').toISOString(),
            updatedAt: new Date('2024-01-28').toISOString(),
        },
        {
            name: 'Murphy USA on Dunn Avenue',
            brand: 'Murphy USA',
            lat: 30.3234,
            lon: -81.6578,
            address: '9834 Dunn Avenue, Jacksonville, FL 32218',
            fuelTypes: ["regular", "diesel"],
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-02-01').toISOString(),
        },
        {
            name: 'Chevron on Yellow Bluff Road',
            brand: 'Chevron',
            lat: 30.3198,
            lon: -81.6623,
            address: '1457 Yellow Bluff Road, Jacksonville, FL 32226',
            fuelTypes: ["regular", "premium"],
            createdAt: new Date('2024-02-03').toISOString(),
            updatedAt: new Date('2024-02-03').toISOString(),
        },
        {
            name: 'Exxon on Broward Road',
            brand: 'Exxon',
            lat: 30.3423,
            lon: -81.6789,
            address: '11567 Broward Road, Jacksonville, FL 32225',
            fuelTypes: ["regular", "premium", "diesel"],
            createdAt: new Date('2024-02-05').toISOString(),
            updatedAt: new Date('2024-02-05').toISOString(),
        },
        {
            name: 'Gate on New Berlin Road',
            brand: 'Gate',
            lat: 30.3389,
            lon: -81.6445,
            address: '14623 New Berlin Road, Jacksonville, FL 32225',
            fuelTypes: ["regular", "diesel"],
            createdAt: new Date('2024-02-08').toISOString(),
            updatedAt: new Date('2024-02-08').toISOString(),
        }
    ];

    await db.insert(gasStations).values(sampleGasStations);
    
    console.log('✅ Gas stations seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});