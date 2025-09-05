import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Activity, Award, BarChart3, Briefcase, LogOut } from 'lucide-react';

// Sub-component for Profile Section in AgentMembershipCard
const ProfileSection = ({ name, specialization, profileImage, status, agentId }) => (
  <div className="flex flex-col items-center w-40">
    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-white to-gray-100 flex items-center justify-center mb-4 shadow-lg ring-2 ring-white/80">
      {profileImage ? (
        <img
          src={profileImage}
          alt={`${name}'s profile`}
          className="w-[110px] h-[110px] rounded-full object-cover"
        />
      ) : (
        <User className="w-16 h-16 text-gray-600" aria-hidden="true" />
      )}
    </div>
    <h2 className="text-white text-lg font-bold text-center drop-shadow-md mb-2">
      {name || 'Agent Name'}
    </h2>
    <p className="text-yellow-400 text-sm font-semibold text-center drop-shadow-sm mb-3">
      {specialization || 'Agricultural Specialist'}
    </p>
    <div className="flex flex-wrap gap-2 justify-center">
      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30">
        {status || 'Active'}
      </span>
      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30">
        ID: {agentId || 'AGT001234'}
      </span>
    </div>
  </div>
);

// Sub-component for Info Item in AgentMembershipCard
const InfoItem = ({ label, value, Icon }) => (
  <div className="mb-4">
    <div className="flex items-center gap-2 text-white text-sm font-semibold drop-shadow-sm mb-1">
      <Icon className="w-4 h-4" aria-hidden="true" />
      {label}
    </div>
    <p className="text-yellow-400 text-sm font-semibold drop-shadow-sm info-value">
      {value || 'N/A'}
    </p>
  </div>
);

// AgentMembershipCard Component
const AgentMembershipCard = ({
  name,
  agentId,
  location,
  specialization,
  experience,
  profileImage,
  status,
  certification,
  email,
  phone,
}) => {
  useEffect(() => {
    const profileSection = document.querySelector('.profile-section');
    const infoValues = document.querySelectorAll('.info-value');

    const handleProfileEnter = () => {
      if (profileSection) {
        profileSection.style.transform = 'scale(1.05)';
        profileSection.style.transition = 'transform 0.3s ease';
      }
    };

    const handleProfileLeave = () => {
      if (profileSection) {
        profileSection.style.transform = 'scale(1)';
      }
    };

    const handleValueEnter = function () {
      this.style.textShadow = '0 1px 2px rgba(0,0,0,0.5), 0 0 12px rgba(255,215,0,0.6)';
      this.style.transition = 'text-shadow 0.3s ease';
    };

    const handleValueLeave = function () {
      this.style.textShadow = '0 1px 2px rgba(0,0,0,0.5)';
    };

    if (profileSection) {
      profileSection.addEventListener('mouseenter', handleProfileEnter);
      profileSection.addEventListener('mouseleave', handleProfileLeave);
    }

    infoValues.forEach((value) => {
      value.addEventListener('mouseenter', handleValueEnter);
      value.addEventListener('mouseleave', handleValueLeave);
    });

    return () => {
      if (profileSection) {
        profileSection.removeEventListener('mouseenter', handleProfileEnter);
        profileSection.removeEventListener('mouseleave', handleProfileLeave);
      }
      infoValues.forEach((value) => {
        value.removeEventListener('mouseenter', handleValueEnter);
        value.removeEventListener('mouseleave', handleValueLeave);
      });
    };
  }, []);

  return (
    <div className="flex justify-center items-center w-full p-5 bg-gray-100 font-sans">
      <div
        className="membership-card relative w-full max-w-5xl h-72 rounded-xl overflow-hidden shadow-2xl hover:shadow-3xl hover:-translate-y-0.5 transition-all duration-300"
        style={{ cursor: 'pointer' }}
      >
        {/* Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-900 via-green-800 to-green-900"></div>
        <div className="absolute -top-8 -right-8 w-80 h-80 bg-white/10 rounded-full -rotate-12"></div>
        <div className="absolute top-5 right-4 w-96 h-48 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full -rotate-6 opacity-60"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.04)_0%,transparent_50%),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.03)_0%,transparent_40%)] pointer-events-none"></div>

        {/* Header */}
        <div className="relative bg-black/10 py-3 text-center border-b border-yellow-400">
          <h1 className="text-yellow-400 text-lg font-bold tracking-wide drop-shadow-md">
            AGRICULTURAL EXTENSION AGENT CARD
          </h1>
        </div>

        {/* Main Content */}
        <div className="relative flex items-start gap-8 p-8 h-[calc(100%-48px)]">
          <ProfileSection
            name={name}
            specialization={specialization}
            profileImage={profileImage}
            status={status}
            agentId={agentId}
            className="profile-section"
          />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
            <div>
              <InfoItem label="Email Address" value={email} Icon={Mail} />
              <InfoItem label="Location" value={location} Icon={MapPin} />
              <InfoItem label="Experience" value={experience} Icon={Calendar} />
            </div>
            <div>
              <InfoItem label="Phone Number" value={phone} Icon={Phone} />
              <InfoItem
                label="Certification"
                value={certification?.substring(0, 25) + (certification?.length > 25 ? '...' : '')}
                Icon={Award}
              />
              <InfoItem label="Agent ID" value={agentId || 'AGT001234'} Icon={Briefcase} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// AgentProfile Component
export default function AgentProfile() {
  const [agentProfile, setAgentProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgentProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        // Replace with actual API call
        // const response = await fetch('/api/agent-profile');
        // if (!response.ok) throw new Error('Failed to fetch profile');
        // const data = await response.json();
        // setAgentProfile(data);

        // Simulated API call for demonstration
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setAgentProfile({
          fullname: "Jean Baptiste Uwimana",
          email: "j.uwimana@agent.rw",
          phonenumber: "+250 788 123 456",
          province: "Kigali",
          district: "Gasabo",
          sector: "Kinyinya",
          joinDate: "2023-01-15",
          status: "Active",
          agentId: "AGT001234",
          specialization: "Crop Management",
          experience: "5 years",
          certification: "Certified Agricultural Extension Agent",
          performance: "95%",
          farmersAssisted: 127,
          totalTransactions: 2847,
          lastLogin: "2024-01-20 09:30",
        });
      } catch (err) {
        setError(err.message || 'An error occurred while fetching the profile');
      } finally {
        setLoading(false);
      }
    };

    fetchAgentProfile();
  }, []);

  const handleLogout = () => {
    window.location.href = '/';
  };

  const ProfileCard = ({ icon: Icon, title, value, subtitle }) => (
    <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-[#1F310A0D]">
          <Icon className="w-6 h-6 text-[#1F310A]" aria-hidden="true" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800">{value || 'N/A'}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
    </div>
  );

  const InfoField = ({ label, value, icon: Icon }) => (
    <div className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
      <div className="p-2 rounded-lg mr-4 bg-[#1F310A0D]">
        <Icon className="w-5 h-5 text-[#1F310A]" aria-hidden="true" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="font-semibold text-gray-800">{value || 'N/A'}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-[#1F310A] mb-4"
            role="status"
            aria-label="Loading"
          ></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="shadow-sm bg-[#1F310A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                <User className="w-6 h-6 text-[#1F310A]" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Agent Profile</h1>
                <p className="text-green-200 text-sm">Agricultural Extension Agent</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Membership Card Section */}
        <div className="mb-8">
          <AgentMembershipCard
            name={agentProfile.fullname}
            agentId={agentProfile.agentId}
            location={`${agentProfile.district}, ${agentProfile.province}`}
            specialization={agentProfile.specialization}
            experience={agentProfile.experience}
            profileImage={agentProfile.profileImage}
            status={agentProfile.status}
            certification={agentProfile.certification}
            email={agentProfile.email}
            phone={agentProfile.phonenumber}
          />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ProfileCard
            icon={User}
            title="Farmers Assisted"
            value={agentProfile.farmersAssisted}
            subtitle="This month"
          />
          <ProfileCard
            icon={BarChart3}
            title="Total Transactions"
            value={agentProfile.totalTransactions}
            subtitle="All time"
          />
          <ProfileCard
            icon={Award}
            title="Performance Score"
            value={agentProfile.performance}
            subtitle="Current rating"
          />
          <ProfileCard
            icon={Briefcase}
            title="Years of Service"
            value={agentProfile.experience?.split(' ')[0]}
            subtitle="Agricultural extension"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-[#1F310A]" aria-hidden="true" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Full Name" value={agentProfile.fullname} icon={User} />
                <InfoField label="Email Address" value={agentProfile.email} icon={Mail} />
                <InfoField label="Phone Number" value={agentProfile.phonenumber} icon={Phone} />
                <InfoField label="Agent ID" value={agentProfile.agentId} icon={Briefcase} />
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-[#1F310A]" aria-hidden="true" />
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField label="Province" value={agentProfile.province} icon={MapPin} />
                <InfoField label="District" value={agentProfile.district} icon={MapPin} />
                <InfoField label="Sector" value={agentProfile.sector} icon={MapPin} />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Award className="w-5 h-5 mr-2 text-[#1F310A]" aria-hidden="true" />
                Professional Details
              </h3>
              <div className="space-y-4">
                <InfoField
                  label="Specialization"
                  value={agentProfile.specialization}
                  icon={Briefcase}
                />
                <InfoField label="Experience" value={agentProfile.experience} icon={Calendar} />
                <InfoField label="Certification" value={agentProfile.certification} icon={Award} />
                <InfoField
                  label="Join Date"
                  value={agentProfile.joinDate ? new Date(agentProfile.joinDate).toLocaleDateString() : 'N/A'}
                  icon={Calendar}
                />
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-[#1F310A]" aria-hidden="true" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Last Login</p>
                  <p className="font-semibold text-gray-800">{agentProfile.lastLogin || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {agentProfile.status || 'Active'}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Performance</p>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="h-2 rounded-full bg-[#1F310A]"
                        style={{ width: agentProfile.performance || '0%' }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {agentProfile.performance || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}