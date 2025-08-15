// Demo data for service requests
export const populateDemoData = () => {
  const demoRequests = [
    {
      id: '1',
      type: 'Pest Management',
      status: 'pending',
      submittedAt: '2024-01-15T10:30:00.000Z',
      farmerName: 'Jean Pierre Uwimana',
      farmerPhone: '+250 789 123 456',
      farmerEmail: 'jean.uwimana@example.com',
      farmerLocation: 'Kigali, Rwanda',
      pestType: 'Aphids',
      infestationLevel: 'High',
      cropType: 'Tomatoes',
      farmSize: '3 acres',
      description: 'Severe aphid infestation affecting tomato plants. Leaves are curling and yellowing. Need immediate treatment.'
    },
    {
      id: '2',
      type: 'Harvesting Day',
      status: 'approved',
      submittedAt: '2024-01-14T14:20:00.000Z',
      farmerName: 'Marie Claire Niyonsaba',
      farmerPhone: '+250 789 234 567',
      farmerEmail: 'marie.niyonsaba@example.com',
      farmerLocation: 'Butare, Rwanda',
      workersNeeded: '5',
      equipmentNeeded: ['Tractors', 'Harvesters', 'Transport Vehicles'],
      transportationNeeded: 'Need transport for harvested crops to market',
      harvestDateFrom: '2024-01-20',
      harvestDateTo: '2024-01-24',
      harvestImages: ['crop1.jpg', 'crop2.jpg']
    },
    {
      id: '3',
      type: 'Property Evaluation',
      status: 'completed',
      submittedAt: '2024-01-10T08:45:00.000Z',
      farmerName: 'Emmanuel Ndayisaba',
      farmerPhone: '+250 789 345 678',
      farmerEmail: 'emmanuel.ndayisaba@example.com',
      farmerLocation: 'Gisenyi, Rwanda',
      irrigationSource: 'Yes',
      irrigationTiming: 'This Coming Season',
        soilTesting: 'Basic soil testing completed, pH levels optimal',
        visitStartDate: '2024-01-15',
        visitEndDate: '2024-01-19',
        evaluationPurpose: 'Need certified property valuation for bank loan application'
    },
    {
      id: '4',
      type: 'Pest Management',
      status: 'pending',
      submittedAt: '2024-01-16T11:15:00.000Z',
      farmerName: 'Anastasie Mukamana',
      farmerPhone: '+250 789 456 789',
      farmerEmail: 'anastasie.mukamana@example.com',
      farmerLocation: 'Kibuye, Rwanda',
      pestType: 'Spider Mites',
      infestationLevel: 'Medium',
      cropType: 'Beans',
      farmSize: '2 acres',
      description: 'Spider mite infestation detected on bean plants. Small white spots on leaves. Need organic treatment solution.'
    },
    {
      id: '5',
      type: 'Harvesting Day',
      status: 'pending',
      submittedAt: '2024-01-16T13:30:00.000Z',
      farmerName: 'Theophile Habimana',
      farmerPhone: '+250 789 567 890',
      farmerEmail: 'theophile.habimana@example.com',
      farmerLocation: 'Ruhengeri, Rwanda',
      workersNeeded: '8',
      equipmentNeeded: ['Tractors', 'Plows', 'Hand Tools', 'Storage Containers'],
      transportationNeeded: 'Need transport for workers and equipment',
      harvestDateFrom: '2024-01-25',
      harvestDateTo: '2024-01-29',
      harvestImages: ['harvest1.jpg', 'harvest2.jpg', 'harvest3.jpg']
    }
  ];

  // Save to localStorage
  localStorage.setItem('farmerServiceRequests', JSON.stringify(demoRequests));
  return demoRequests;
};

// Function to clear demo data
export const clearDemoData = () => {
  localStorage.removeItem('farmerServiceRequests');
};

// Function to check if demo data exists
export const hasDemoData = () => {
  const requests = localStorage.getItem('farmerServiceRequests');
  return requests && JSON.parse(requests).length > 0;
};
