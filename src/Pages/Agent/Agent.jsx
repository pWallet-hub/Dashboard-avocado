import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Settings, Activity, Award, BarChart3, Briefcase, Edit3, LogOut } from 'lucide-react';

export default function AgentProfile() {
  const [agentProfile, setAgentProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgentProfile = async () => {
      setLoading(true);
      setError(null);
      
      // Simulate API call - replace with actual API call
      setTimeout(() => {
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
          lastLogin: "2024-01-20 09:30"
        });
        setLoading(false);
      }, 1000);
    };

    fetchAgentProfile();
  }, []);

  const handleLogout = () => {
    // Remove localStorage usage as per instructions
    window.location.href = '/';
  };

  const ProfileCard = ({ icon: Icon, title, value, subtitle }) => (
    <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg" style={{ backgroundColor: '#1F310A0D' }}>
          <Icon className="w-6 h-6" style={{ color: '#1F310A' }} />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
    </div>
  );

  const InfoField = ({ label, value, icon: Icon }) => (
    <div className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
      <div className="p-2 rounded-lg mr-4" style={{ backgroundColor: '#1F310A0D' }}>
        <Icon className="w-5 h-5" style={{ color: '#1F310A' }} />
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
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 mb-4" style={{ borderTopColor: '#1F310A' }}></div>
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
      <div className="shadow-sm" style={{ backgroundColor: '#1F310A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                <User className="w-6 h-6" style={{ color: '#1F310A' }} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Agent Profile</h1>
                <p className="text-green-200 text-sm">Agricultural Extension Agent</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="w-32 h-32 rounded-full flex items-center justify-center mb-6 md:mb-0 md:mr-8" style={{ backgroundColor: '#1F310A' }}>
              <User className="w-16 h-16 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{agentProfile.fullname}</h2>
              <p className="text-lg text-gray-600 mb-3">{agentProfile.specialization}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {agentProfile.status}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  ID: {agentProfile.agentId}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {agentProfile.experience} Experience
                </span>
              </div>
              <div className="flex justify-center md:justify-start">
                <button className="flex items-center px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 mr-3" style={{ backgroundColor: '#1F310A' }}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
                <button className="flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
              </div>
            </div>
          </div>
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
                <User className="w-5 h-5 mr-2" style={{ color: '#1F310A' }} />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="Full Name"
                  value={agentProfile.fullname}
                  icon={User}
                />
                <InfoField
                  label="Email Address"
                  value={agentProfile.email}
                  icon={Mail}
                />
                <InfoField
                  label="Phone Number"
                  value={agentProfile.phonenumber}
                  icon={Phone}
                />
                <InfoField
                  label="Agent ID"
                  value={agentProfile.agentId}
                  icon={Briefcase}
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <MapPin className="w-5 h-5 mr-2" style={{ color: '#1F310A' }} />
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField
                  label="Province"
                  value={agentProfile.province}
                  icon={MapPin}
                />
                <InfoField
                  label="District"
                  value={agentProfile.district}
                  icon={MapPin}
                />
                <InfoField
                  label="Sector"
                  value={agentProfile.sector}
                  icon={MapPin}
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Award className="w-5 h-5 mr-2" style={{ color: '#1F310A' }} />
                Professional Details
              </h3>
              <div className="space-y-4">
                <InfoField
                  label="Specialization"
                  value={agentProfile.specialization}
                  icon={Briefcase}
                />
                <InfoField
                  label="Experience"
                  value={agentProfile.experience}
                  icon={Calendar}
                />
                <InfoField
                  label="Certification"
                  value={agentProfile.certification}
                  icon={Award}
                />
                <InfoField
                  label="Join Date"
                  value={new Date(agentProfile.joinDate).toLocaleDateString()}
                  icon={Calendar}
                />
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2" style={{ color: '#1F310A' }} />
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Last Login</p>
                  <p className="font-semibold text-gray-800">{agentProfile.lastLogin}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Performance</p>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="h-2 rounded-full" style={{ backgroundColor: '#1F310A', width: agentProfile.performance }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{agentProfile.performance}</span>
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