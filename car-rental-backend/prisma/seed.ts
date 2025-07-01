import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Sample vehicles data
  const vehicles = [
    {
      model: 'Toyota Prado',
      year: 2022,
      licensePlate: 'KCA 123A',
      vin: '1HGBH41JXMN109186',
      category: 'SUV',
      transmission: 'Automatic',
      fuelType: 'Diesel',
      seats: 7,
      dailyRate: 45000,
      hourlyRate: 5000,
      isAvailable: true,
      location: 'Nairobi',
      features: ['4WD', 'Leather Seats', 'Navigation', 'Bluetooth'],
      images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop'],
      description: 'Luxury SUV perfect for family trips and off-road adventures. Features advanced safety systems and comfortable interior.',
      mileage: 15000,
      status: 'ACTIVE'
    },
    {
      model: 'BMW i3',
      year: 2023,
      licensePlate: 'KCA 456B',
      vin: '2T1BURHE0JC123456',
      category: 'Sedan',
      transmission: 'Automatic',
      fuelType: 'Electric',
      seats: 4,
      dailyRate: 38000,
      hourlyRate: 4000,
      isAvailable: true,
      location: 'Mombasa',
      features: ['Electric', 'Fast Charging', 'Premium Audio', 'Parking Sensors'],
      images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop'],
      description: 'Electric vehicle with zero emissions. Perfect for city driving with instant torque and low running costs.',
      mileage: 8000,
      status: 'ACTIVE'
    },
    {
      model: 'Mercedes G-Class',
      year: 2021,
      licensePlate: 'KCA 789C',
      vin: '3VWDX7AJ5DM123456',
      category: 'SUV',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      seats: 5,
      dailyRate: 70000,
      hourlyRate: 8000,
      isAvailable: true,
      location: 'Kisumu',
      features: ['4WD', 'Leather Interior', 'Premium Sound', '360 Camera'],
      images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop'],
      description: 'Iconic luxury SUV with unmatched off-road capability and premium interior. The ultimate status symbol.',
      mileage: 25000,
      status: 'ACTIVE'
    },
    {
      model: 'Honda Civic',
      year: 2020,
      licensePlate: 'KCA 012D',
      vin: '4T1B11HK5JU123456',
      category: 'Sedan',
      transmission: 'Manual',
      fuelType: 'Petrol',
      seats: 5,
      dailyRate: 20000,
      hourlyRate: 2500,
      isAvailable: true,
      location: 'Nairobi',
      features: ['Fuel Efficient', 'Backup Camera', 'Bluetooth', 'USB Ports'],
      images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop'],
      description: 'Reliable and fuel-efficient sedan perfect for daily commuting. Great value for money with low maintenance costs.',
      mileage: 45000,
      status: 'ACTIVE'
    },
    {
      model: 'Toyota Hilux',
      year: 2021,
      licensePlate: 'KCA 345E',
      vin: '5TFEY5F17FX123456',
      category: 'Truck',
      transmission: 'Manual',
      fuelType: 'Diesel',
      seats: 5,
      dailyRate: 60000,
      hourlyRate: 7000,
      isAvailable: true,
      location: 'Mombasa',
      features: ['4WD', 'Towing Package', 'Bed Liner', 'Work Lights'],
      images: ['https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop'],
      description: 'Rugged pickup truck built for work and adventure. Excellent towing capacity and off-road performance.',
      mileage: 30000,
      status: 'ACTIVE'
    },
    {
      model: 'BMW X6',
      year: 2022,
      licensePlate: 'KCA 678F',
      vin: '6T1BURHE0JC123456',
      category: 'Sports',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      seats: 5,
      dailyRate: 85000,
      hourlyRate: 10000,
      isAvailable: true,
      location: 'Kisumu',
      features: ['Sport Mode', 'Premium Leather', 'Harman Kardon', 'Heads-up Display'],
      images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop'],
      description: 'Sporty SUV with coupe styling. Combines luxury with performance for an exhilarating driving experience.',
      mileage: 18000,
      status: 'ACTIVE'
    }
  ];

  // Clear existing vehicles
  await prisma.vehicle.deleteMany();

  // Insert new vehicles
  for (const vehicle of vehicles) {
    await prisma.vehicle.create({
      data: vehicle
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 