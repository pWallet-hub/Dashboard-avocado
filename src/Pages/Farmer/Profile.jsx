import React from 'react';
import FarmerProfileCard from '../../components/Profile/FarmerProfileCard';

export default function Profile() {
  return (
    <FarmerProfileCard 
      fullScreen={true} 
      showEditButton={true}
      cardOnly={false}
    />
  );
}
 
