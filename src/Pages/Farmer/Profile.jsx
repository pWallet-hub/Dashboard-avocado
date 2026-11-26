import FarmerProfileCard from '../../components/Profile/FarmerProfileCard';
import ProfileCompletion from '../../components/Profile/ProfileCompletion';

export default function Profile() {
  return (
    <div className="space-y-6">
      <div className="mx-auto w-full max-w-7xl">
        <ProfileCompletion />
      </div>
      <FarmerProfileCard />
    </div>
  );
}
