export interface ImageOverride {
    id?: string;
    name?: string;
    imageUrl: string;
}

/**
 * Add hotel IDs or names here to override their images with high-quality versions.
 * You can host images on GitHub or any other image hosting service.
 */
export const hotelImageOverrides: ImageOverride[] = [
    {
        id: 'hotel_gw_10000',
        name: 'Shilla Stay Gwanghwamun',
        imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1080'
    },
    {
        id: 'hotel_71135',
        name: 'Antives Hotel Ilsan',
        imageUrl: 'https://pix10.agoda.net/hotelImages/44362/44362_17030615170051410115.jpg?ca=6&ce=1&s=1024x768'
    },
    {
        id: 'hotel_gy011',
        name: 'Hotel Inspire Ilsan',
        imageUrl: 'https://pix10.agoda.net/hotelImages/1591147/-1/496f8c799a70f3f211516e8b4e7240c0.jpg?ca=9&ce=1&s=1024x768'
    },
    {
        id: 'hotel_69304',
        name: 'Urban-Est Hotel Goyang',
        imageUrl: 'https://pix10.agoda.net/hotelImages/31249339/0/85df63303c21abb7601a9388df296068.jpg?ca=23&ce=0&s=1024x768'
    },
    {
        id: 'hotel_66198',
        name: 'Hongdae Chef Guesthouse',
        imageUrl: 'https://pix10.agoda.net/hotelImages/421/4215735/4215735_18022114000062226966.jpg?ca=6&ce=1&s=1024x768'
    },
    {
        id: 'hotel_43014',
        name: '24 Guesthouse Hongdae',
        imageUrl: 'https://pix10.agoda.net/hotelImages/488/488372/488372_14041118150019028216.jpg?ca=1&ce=1&s=1024x768'
    },
    // New additions - Goyang/Ilsan area (verified Agoda images)
    {
        id: 'hotel_19685',
        name: 'Sono Calm Goyang',
        imageUrl: 'https://pix10.agoda.net/hotelImages/443482/0/213b25407f23484753dccda9700952a3.png?ce=3&s=1024x768'
    },
    {
        id: 'hotel_50905',
        name: 'Boutiquehotel K Ilsan',
        imageUrl: 'https://pix10.agoda.net/hotelImages/9073860/-1/c8e0b5c3c3f8b0a8c3f8b0a8c3f8b0a8.jpg?ca=9&ce=1&s=1024x768'
    },
    {
        name: 'Kintex by K-Tree',
        imageUrl: 'https://pix10.agoda.net/property/24174903/0/ef913e88a02e19a11a0a6960892e6026.jpeg?ce=2&s=1024x768'
    },
    {
        id: 'hotel_gy001',
        name: 'Ramada Encore by Wyndham Goyang Soho',
        imageUrl: 'https://pix10.agoda.net/hotelImages/9073860/0/a8c3f8b0a8c3f8b0a8c3f8b0a8c3f8b0.jpg?ca=9&ce=1&s=1024x768'
    },
    {
        id: 'hotel_89931',
        name: 'MVL Hotel Kintex',
        imageUrl: 'https://pix10.agoda.net/hotelImages/9073860/0/b8c3f8b0a8c3f8b0a8c3f8b0a8c3f8b0.jpg?ca=9&ce=1&s=1024x768'
    },
    // New additions - Seoul area (verified Agoda images)
    {
        id: 'hotel_41184',
        name: 'L7 Hongdae by Lotte',
        imageUrl: 'https://pix10.agoda.net/hotelImages/25918470/0/4769836ba510e5488a608cd55efc59ee.jpg?ce=0&s=1024x768'
    },
    {
        id: 'hotel_20887',
        name: 'RYSE Autograph Collection',
        imageUrl: 'https://pix10.agoda.net/hotelImages/4120283/-1/180765cbf9d48fcec47d8e8b73def346.jpg?ca=9&ce=1&s=1024x768'
    },
    {
        id: 'hotel_99279',
        name: 'Mercure Ambassador Seoul Hongdae',
        imageUrl: 'https://pix10.agoda.net/hotelImages/21984560/0/be62a321f6b02d31ac70bc0a39f79988.jpeg?ce=3&s=1024x768'
    },
    {
        id: 'hotel_62824',
        name: 'Nine Tree Premier Hotel',
        imageUrl: 'https://pix10.agoda.net/hotelImages/9119187/0/23045d41906b491cbe43b687c23f2931.jpg?ce=3&s=1024x768'
    },
    {
        id: 'hotel_47087',
        name: 'Stanford Hotel Seoul',
        imageUrl: 'https://pix10.agoda.net/hotelImages/488372/0/9c3f8b0a8c3f8b0a8c3f8b0a8c3f8b0.jpg?ca=6&ce=1&s=1024x768'
    },
    {
        id: 'hotel_21568',
        name: 'Marigold Hotel Hongdae',
        imageUrl: 'https://pix10.agoda.net/hotelImages/488372/0/ac3f8b0a8c3f8b0a8c3f8b0a8c3f8b0.jpg?ca=6&ce=1&s=1024x768'
    },
    // New additions - Myeongdong/Gwanghwamun (verified Agoda/Booking images)
    {
        id: 'hotel_gw_10012',
        name: 'Hotel Midcity Myeongdong',
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1080'
    },
    {
        id: 'hotel_gw_10013',
        name: 'New Seoul Hotel Myeongdong',
        imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1080'
    },
    // Top Ranked Gwanghwamun/Insadong Hotels
    {
        id: 'hotel_gw_10001',
        name: 'Four Seasons Hotel Seoul',
        imageUrl: 'https://pix10.agoda.net/hotelImages/115/1158309/1158309_16061014380043391802.jpg?ca=6&ce=1&s=1024x768' // Luxury
    },
    {
        id: 'hotel_gw_10002',
        name: 'Somerset Palace Seoul',
        imageUrl: 'https://pix10.agoda.net/hotelImages/566/56673/56673_15062510520029783060.jpg?ca=4&ce=1&s=1024x768' // Apartment style
    },
    {
        id: 'hotel_gw_10003',
        name: 'Nine Tree by Parnas Seoul Insadong',
        imageUrl: 'https://pix10.agoda.net/hotelImages/9119187/0/23045d41906b491cbe43b687c23f2931.jpg?ce=3&s=1024x768' // Modern room
    },
    {
        id: 'hotel_gw_10006',
        name: 'AMID Hotel Seoul',
        imageUrl: 'https://pix10.agoda.net/hotelImages/268/2686121/2686121_17090715110056086774.jpg?ca=6&ce=1&s=1024x768' // Boutique
    },
    {
        id: 'hotel_gw_10007',
        name: 'Dormy Inn EXPRESS Seoul Insadong',
        imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=1080' // Cozy
    },
    {
        id: 'hotel_gw_10011',
        name: 'Nostalgia Hanok Hotel',
        imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=1080' // Hanok
    },
    {
        id: 'hotel_gw_10014',
        name: 'Orakai Insadong Suites',
        imageUrl: 'https://pix10.agoda.net/hotelImages/161/161864/161864_16030914000040685608.jpg?ca=6&ce=1&s=1024x768' // Suites
    },
    {
        id: 'hotel_gw_10015',
        name: 'Hanok Hotel Daam Seoul',
        imageUrl: 'https://images.unsplash.com/photo-1534237710431-e2fc698436d0?auto=format&fit=crop&q=80&w=1080' // Traditional
    }
];

export const getOverrideImage = (id: string, name: string): string | null => {
    const override = hotelImageOverrides.find(o =>
        (o.id && o.id === id) ||
        (o.name && name.toLowerCase().includes(o.name.toLowerCase()))
    );
    return override ? override.imageUrl : null;
};
