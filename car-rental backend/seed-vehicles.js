const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleVehicles = [
    {
        model: 'Toyota Camry',
        year: 2023,
        licensePlate: 'ABC123',
        vin: '1HGBH41JXMN109186',
        category: 'Sedan',
        transmission: 'Automatic',
        fuelType: 'Gasoline',
        seats: 5,
        dailyRate: 45.00,
        hourlyRate: 8.00,
        isAvailable: true,
        location: 'Downtown Office',
        features: ['AC', 'GPS', 'Bluetooth', 'Backup Camera'],
        images: ['https://example.com/camry1.jpg', 'https://example.com/camry2.jpg'],
        description: 'Comfortable sedan perfect for city driving',
        mileage: 15000,
        status: 'ACTIVE'
    },
    {
        model: 'Honda CR-V',
        year: 2022,
        licensePlate: 'XYZ789',
        vin: '2T1BURHE0JC123456',
        category: 'SUV',
        transmission: 'Automatic',
        fuelType: 'Gasoline',
        seats: 7,
        dailyRate: 65.00,
        hourlyRate: 12.00,
        isAvailable: true,
        location: 'Airport Branch',
        features: ['AC', 'GPS', 'Bluetooth', 'Backup Camera', 'Third Row Seating'],
        images: ['https://example.com/crv1.jpg', 'https://example.com/crv2.jpg'],
        description: 'Spacious SUV with excellent fuel economy',
        mileage: 22000,
        status: 'ACTIVE'
    },
    {
        model: 'Tesla Model 3',
        year: 2024,
        licensePlate: 'EV001',
        vin: '5YJ3E1EA0PF123789',
        category: 'Electric',
        transmission: 'Automatic',
        fuelType: 'Electric',
        seats: 5,
        dailyRate: 85.00,
        hourlyRate: 15.00,
        isAvailable: true,
        location: 'Downtown Office',
        features: ['AC', 'GPS', 'Bluetooth', 'Autopilot', 'Supercharging'],
        images: ['https://example.com/tesla1.jpg', 'https://example.com/tesla2.jpg'],
        description: 'Premium electric vehicle with advanced features',
        mileage: 8000,
        status: 'ACTIVE'
    },
    {
        model: 'Ford F-150',
        year: 2023,
        licensePlate: 'TRK456',
        vin: '1FTEW1EG0JFA12345',
        category: 'Truck',
        transmission: 'Automatic',
        fuelType: 'Gasoline',
        seats: 6,
        dailyRate: 75.00,
        hourlyRate: 14.00,
        isAvailable: true,
        location: 'Industrial District',
        features: ['AC', 'GPS', 'Bluetooth', 'Towing Package', 'Bed Liner'],
        images: ['https://example.com/f1501.jpg', 'https://example.com/f1502.jpg'],
        description: 'Powerful pickup truck for heavy-duty tasks',
        mileage: 18000,
        status: 'ACTIVE'
    },
    {
        model: 'Toyota Prius',
        year: 2023,
        licensePlate: 'HYB789',
        vin: 'JTDKARFU0H1234567',
        category: 'Hybrid',
        transmission: 'Automatic',
        fuelType: 'Hybrid',
        seats: 5,
        dailyRate: 55.00,
        hourlyRate: 10.00,
        isAvailable: true,
        location: 'Airport Branch',
        features: ['AC', 'GPS', 'Bluetooth', 'Hybrid System', 'Eco Mode'],
        images: ['https://example.com/prius1.jpg', 'https://example.com/prius2.jpg'],
        description: 'Fuel-efficient hybrid perfect for eco-conscious drivers',
        mileage: 12000,
        status: 'ACTIVE'
    }
];

async function seedVehicles() {
    try {
        console.log('Starting vehicle seeding...');
        
        for (const vehicleData of sampleVehicles) {
            const vehicle = await prisma.vehicle.create({
                data: vehicleData
            });
            console.log(`Created vehicle: ${vehicle.model} (${vehicle.licensePlate})`);
        }
        
        console.log('Vehicle seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding vehicles:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedVehicles(); 