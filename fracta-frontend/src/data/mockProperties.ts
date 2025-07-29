export interface PropertyCardProps {
  id: string;
  name: string;
  location: string;
  jurisdiction: 'prospera' | 'international';
  fullPrice: number;
  tokenPrice: number;
  expectedYield: number;
  image: string;
  kycRequired: 'prospera-permit' | 'international-kyc';
  status: 'live' | 'coming-soon' | 'sold-out';
}

export const mockProperties: PropertyCardProps[] = [
  {
    id: '1',
    name: 'Duna Residences, Studio',
    location: 'Roatán, Prospera ZEDE',
    jurisdiction: 'prospera',
    fullPrice: 119000,
    tokenPrice: 119,
    expectedYield: 8.5,
    image: '/images/dunaResidences/duna_studio_birdsView.png',
    kycRequired: 'prospera-permit',
    status: 'live'
  },
  {
    id: '2', 
    name: 'Pristine Bay, Villa 1111',
    location: 'Roatán, Prospera ZEDE',
    jurisdiction: 'prospera',
    fullPrice: 175000,
    tokenPrice: 175,
    expectedYield: 6.2,
    image: '/images/pristineBay/PB_1111_1.png',
    kycRequired: 'prospera-permit',
    status: 'coming-soon'
  },
  {
    id: '3',
    name: 'Las Verandas Villa',
    location: 'Roatán, Prospera ZEDE',
    jurisdiction: 'prospera',
    fullPrice: 950000,
    tokenPrice: 950,
    expectedYield: 7.8,
    image: '/images/lasVerandas/lasVerandas_twoStory_twoBedroom.png',
    kycRequired: 'prospera-permit',
    status: 'live'
  },
  {
    id: '4',
    name: 'Duna Residences, Two Bedroom',
    location: 'Roatán, Prospera ZEDE',
    jurisdiction: 'prospera',
    fullPrice: 239500,
    tokenPrice: 240,
    expectedYield: 9.2,
    image: '/images/dunaResidences/duna_twoBedroom_birdsView.png',
    kycRequired: 'prospera-permit',
    status: 'sold-out'
  }
]; 