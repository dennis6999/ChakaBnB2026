export const MOCK_PROPERTIES = [
    {
        id: 1,
        name: 'Chaka Ranch Tented Camp',
        type: 'Camp',
        distance: '2.5 km from center',
        description:
            'Experience luxury in the wild. Set between Mt Kenya and the Aberdares, featuring an outdoor entertainment park, quad bikes, and spacious tents. Perfect for families and team building. Our premium tents offer unparalleled comfort while keeping you connected to nature.',
        roomInfo: 'Superior Luxury Tent',
        guests: 4,
        bedrooms: 2,
        bathrooms: 1,
        features: ['Free breakfast', 'Free WiFi', 'Free parking', 'Restaurant', 'Water park access', 'Air conditioning'],
        price: 10500,
        rating: 9.2,
        reviewText: 'Superb',
        reviews: 128,
        totalRooms: 10,
        bookedDates: [
            { start: '2026-02-22', end: '2026-02-25', roomsBooked: 10 }, // Fully booked
            { start: '2026-03-01', end: '2026-03-05', roomsBooked: 9 }   // 1 room left
        ],
        cancellationPolicy: 'Free cancellation',
        mealPlan: 'Breakfast included',
        paymentPreference: 'No prepayment needed - pay at the property',
        host: { name: 'David', joined: '2018' },
        image: 'https://images.unsplash.com/photo-1534889156217-d643df14f14a?auto=format&fit=crop&w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1534889156217-d643df14f14a?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
        ],
    }
];
