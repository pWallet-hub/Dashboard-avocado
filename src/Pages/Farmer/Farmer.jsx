import { useEffect, useState } from 'react';
import DashboardHeader from '../../components/Header/DashboardHeader';
import FarmerProfileCard from '../../components/Profile/FarmerProfileCard';

export default function Farmer() {
  return (
    <>
      <DashboardHeader />
      <FarmerProfileCard 
        fullScreen={true} 
        showEditButton={false}
        cardOnly={true}
      />
    </>
  );
}