import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Activity, Award, BarChart3, Briefcase, Edit3, Save, X, AlertCircle, TrendingUp, Target, CheckCircle2, Clock, FileText } from 'lucide-react';
import { getAgentInformation, updateAgentInformation } from '../../services/agent-information';
import { listHarvestRequests } from '../../services/serviceRequestsService';
import { Link } from 'react-router-dom';

// Enhanced Profile Section for Membership Card
const ProfileSection = ({ name, specialization, profileImage, status, agentId }) => (
  <div className="flex flex-col items-center w-44">
    <div className="relative mb-4">
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center shadow-2xl ring-4 ring-white/90 ring-offset-2 ring-offset-green-800">
        {profileImage ? (
          <img
            src={profileImage}
            alt={`${name}'s profile`}
            className="w-[120px] h-[120px] rounded-full object-cover"
          />
        ) : (
          <User className="w-20 h-20 text-gray-400" aria-hidden="true" />
        )}
      </div>
      <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg ring-2 ring-white">
        <CheckCircle2 className="w-5 h-5 text-white" />
      </div>
    </div>
    <h2 className="text-white text-xl font-bold text-center drop-shadow-lg mb-1 tracking-wide">
      {name || 'Agent Name'}
    </h2>
    <div className="flex flex-wrap gap-2 justify-center">
      <span className="px-3 py-1.5 bg-green-500/30 text-green-200 text-xs font-bold rounded-full border border-green-400/50 backdrop-blur-sm shadow-md">
        {status || 'Active'}
      </span>
    </div>
  </div>
);

// Enhanced Info Item with better styling
const InfoItem = ({ label, value, Icon }) => (
  <div className="mb-5 group">
    <div className="flex items-center gap-2 text-white/90 text-xs font-bold drop-shadow-sm mb-2 tracking-wide uppercase">
      <div className="p-1.5 bg-white/10 rounded-md backdrop-blur-sm group-hover:bg-white/20 transition-colors">
        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      </div>
      {label}
    </div>
    <p className="text-yellow-300 text-base font-bold drop-shadow-md info-value pl-8 group-hover:text-yellow-200 transition-colors">
      {value || 'N/A'}
    </p>
  </div>
);

// Enhanced Membership Card with refined aesthetics
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
        profileSection.style.transform = 'scale(1.03)';
        profileSection.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      }
    };

    const handleProfileLeave = () => {
      if (profileSection) {
        profileSection.style.transform = 'scale(1)';
      }
    };

    const handleValueEnter = function () {
      this.style.textShadow = '0 2px 4px rgba(0,0,0,0.6), 0 0 20px rgba(255,215,0,0.8)';
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
    <div className="flex justify-center items-center w-full p-6 font-sans">
      <div
        className="membership-card relative w-full max-w-6xl h-80 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-500"
        style={{ cursor: 'pointer' }}
      >
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-gradient-radial from-white/15 via-white/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-gradient-radial from-yellow-500/20 via-yellow-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05)_0%,transparent_40%)] pointer-events-none"></div>
        
        {/* Animated shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>

        {/* Header with enhanced styling */}
        <div className="relative bg-gradient-to-r from-black/20 via-black/30 to-black/20 backdrop-blur-sm py-4 text-center border-b-2 border-yellow-400/50 shadow-lg">
          <h1 className="text-yellow-400 text-xl font-black tracking-widest drop-shadow-lg uppercase">
            Agricultural Extension Agent
          </h1>
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
        </div>

        {/* Main Content with better spacing */}
        <div className="relative flex items-start gap-10 px-10 py-8 h-[calc(100%-64px)]">
          <ProfileSection
            name={name}
            specialization={specialization}
            profileImage={profileImage}
            status={status}
            agentId={agentId}
            className="profile-section"
          />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            <div>
              <InfoItem label="Email Address" value={email} Icon={Mail} />
              <InfoItem label="Territory" value={location} Icon={MapPin} />
              <InfoItem label="Experience" value={experience} Icon={Calendar} />
            </div>
            <div>
              <InfoItem label="Phone Number" value={phone} Icon={Phone} />
              <InfoItem
                label="Certification"
                value={certification?.substring(0, 30) + (certification?.length > 30 ? '...' : '')}
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

// Enhanced Profile Card with modern design
const ProfileCard = ({ icon: Icon, title, value, subtitle, color = "green" }) => {
  const colorStyles = {
    green: "from-green-50 to-green-100/50 border-green-200 text-green-700",
    blue: "from-blue-50 to-blue-100/50 border-blue-200 text-blue-700",
    purple: "from-purple-50 to-purple-100/50 border-purple-200 text-purple-700",
    orange: "from-orange-50 to-orange-100/50 border-orange-200 text-orange-700"
  };

  return (
    <div className={`p-4 bg-gradient-to-br ${colorStyles[color]} rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-2 transform hover:-translate-y-0.5`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg bg-white shadow-sm`}>
          <Icon className={`w-6 h-6 ${colorStyles[color].split(' ')[4]}`} aria-hidden="true" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-gray-900">{value || 'N/A'}</p>
          {subtitle && <p className="text-xs text-gray-600 font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
    </div>
  );
};

// Enhanced Info Field with better visual hierarchy
const InfoField = ({ label, value, icon: Icon, isEditing, onChange, type = "text" }) => (
  <div className="group">
    <div className="flex items-start p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg hover:from-green-50/50 hover:to-white border border-gray-200 hover:border-green-300 transition-all duration-300 shadow-sm hover:shadow">
      <div className="p-2 rounded-lg mr-3 bg-gradient-to-br from-green-50 to-green-100/50 group-hover:from-green-100 group-hover:to-green-200/50 transition-colors shadow-sm">
        <Icon className="w-4 h-4 text-green-700" aria-hidden="true" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 mb-1.5 font-bold uppercase tracking-wide">{label}</p>
        {isEditing ? (
          <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all font-semibold text-gray-900"
          />
        ) : (
          <p className="font-bold text-gray-900 text-sm">{value || 'N/A'}</p>
        )}
      </div>
    </div>
  </div>
);

// Main Agent Profile Component
export default function AgentProfile() {
  const [agentProfile, setAgentProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [recentRequests, setRecentRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  useEffect(() => {
    const fetchAgentProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getAgentInformation();
        const { user_info, agent_profile } = response;
        
        // Extract primary territory
        const primaryTerritory = agent_profile?.territory?.find(t => t.isPrimary) || agent_profile?.territory?.[0];
        
        // Build territory string from coverage
        const territoryString = agent_profile?.territoryCoverage?.districts?.join(', ') || 'N/A';
        
        const enhancedProfile = {
          id: user_info.id,
          full_name: user_info.full_name,
          email: user_info.email,
          phone: user_info.phone || '',
          role: user_info.role,
          status: user_info.status || 'active',
          created_at: user_info.created_at,
          updated_at: user_info.updated_at,
          profile: {
            agentId: agent_profile?.agentId || user_info.id || 'N/A',
            province: agent_profile?.province || '',
            territory: agent_profile?.territory || [],
            territoryCoverage: agent_profile?.territoryCoverage || { totalDistricts: 0, totalSectors: 0, districts: [] },
            primaryDistrict: primaryTerritory?.district || '',
            primarySector: primaryTerritory?.sector || '',
            territoryString: territoryString,
            specialization: agent_profile?.specialization || 'Agricultural Specialist',
            experience: agent_profile?.experience || 'N/A',
            certification: agent_profile?.certification || 'N/A',
            statistics: agent_profile?.statistics || {
              farmersAssisted: 0,
              totalTransactions: 0,
              performance: '0%',
              activeFarmers: 0,
              territoryUtilization: '0%'
            },
            profileImage: agent_profile?.profileImage || null
          }
        };
        
        setAgentProfile(enhancedProfile);
        setEditedProfile(enhancedProfile);
      } catch (err) {
        console.error('Error fetching agent profile:', err);
        setError(err.message || 'An error occurred while fetching the profile');
      } finally {
        setLoading(false);
      }
    };

    fetchAgentProfile();
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const updateData = {
        name: editedProfile.full_name,
        phone: editedProfile.phone,
        agent_profile: {
          province: editedProfile.profile?.province || '',
          territory: editedProfile.profile?.territory || [],
          specialization: editedProfile.profile?.specialization || '',
          experience: editedProfile.profile?.experience || '',
          certification: editedProfile.profile?.certification || '',
          profileImage: editedProfile.profile?.profileImage || ''
        }
      };
      
      const response = await updateAgentInformation(updateData);
      const { user_info, agent_profile } = response;
      
      // Extract primary territory
      const primaryTerritory = agent_profile?.territory?.find(t => t.isPrimary) || agent_profile?.territory?.[0];
      
      // Build territory string from coverage
      const territoryString = agent_profile?.territoryCoverage?.districts?.join(', ') || 'N/A';
      
      const updatedProfile = {
        id: user_info.id,
        full_name: user_info.full_name,
        email: user_info.email,
        phone: user_info.phone,
        role: user_info.role,
        status: user_info.status,
        created_at: user_info.created_at,
        updated_at: user_info.updated_at,
        profile: {
          agentId: agent_profile.agentId,
          province: agent_profile.province,
          territory: agent_profile.territory,
          territoryCoverage: agent_profile.territoryCoverage,
          primaryDistrict: primaryTerritory?.district || '',
          primarySector: primaryTerritory?.sector || '',
          territoryString: territoryString,
          specialization: agent_profile.specialization,
          experience: agent_profile.experience,
          certification: agent_profile.certification,
          statistics: agent_profile.statistics,
          profileImage: agent_profile.profileImage
        }
      };
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currentUser,
        full_name: user_info.full_name,
        phone: user_info.phone,
        email: user_info.email,
        profile: agent_profile
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setAgentProfile(updatedProfile);
      setEditedProfile(updatedProfile);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile({ ...agentProfile });
    setIsEditing(false);
    setError(null);
  };

  const handleProfileChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileNestedChange = (parent, field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-200 border-t-green-600 mb-6"></div>
          <p className="text-gray-700 font-semibold text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-red-200 rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex items-start">
            <div className="p-3 bg-red-100 rounded-xl mr-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-900 mb-3">Unable to Load Profile</h3>
              <p className="text-red-700 mb-6 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 font-bold shadow-lg hover:shadow-xl"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const agentProfileData = agentProfile.profile || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Membership Card with Edit Button */}
        <div className="mb-6 relative">
          <AgentMembershipCard
            name={agentProfile.full_name}
            agentId={agentProfileData.agentId || agentProfile.id}
            location={agentProfileData.territoryString || agentProfileData.province || 'N/A'}
            specialization={agentProfileData.specialization || 'Agricultural Specialist'}
            experience={agentProfileData.experience || 'N/A'}
            profileImage={agentProfileData.profileImage}
            status={agentProfile.status || 'Active'}
            certification={agentProfileData.certification}
            email={agentProfile.email}
            phone={agentProfile.phone}
          />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-8">
          <ProfileCard
            icon={User}
            title="Farmers Assisted"
            value={agentProfileData.statistics?.farmersAssisted || 0}
            subtitle="Total reached"
            color="green"
          />
          <ProfileCard
            icon={BarChart3}
            title="Transactions"
            value={agentProfileData.statistics?.totalTransactions || 0}
            subtitle="Completed"
            color="blue"
          />
          <ProfileCard
            icon={Award}
            title="Performance"
            value={agentProfileData.statistics?.performance || '0%'}
            subtitle="Success rate"
            color="purple"
          />
          <ProfileCard
            icon={TrendingUp}
            title="Experience"
            value={agentProfileData.experience?.split(' ')[0]}
            subtitle="Years active"
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Personal Information */}
          <div className="lg:col-span-2">
            {/* Territory Information */}
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
              <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-2">
                  <MapPin className="w-5 h-5 text-blue-700" />
                </div>
                Territory Coverage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <InfoField 
                  label="Province" 
                  value={isEditing ? editedProfile.profile?.province : agentProfileData.province} 
                  icon={MapPin} 
                  isEditing={isEditing}
                  onChange={(value) => handleProfileNestedChange('profile', 'province', value)}
                />
                <InfoField 
                  label="Primary District" 
                  value={agentProfileData.primaryDistrict || 'N/A'} 
                  icon={MapPin} 
                  isEditing={false}
                />
                <InfoField 
                  label="Primary Sector" 
                  value={agentProfileData.primarySector || 'N/A'} 
                  icon={MapPin} 
                  isEditing={false}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField 
                  label="Total Districts" 
                  value={agentProfileData.territoryCoverage?.totalDistricts || 0} 
                  icon={MapPin} 
                  isEditing={false}
                />
                <InfoField 
                  label="Total Sectors" 
                  value={agentProfileData.territoryCoverage?.totalSectors || 0} 
                  icon={MapPin} 
                  isEditing={false}
                />
              </div>
            </div>

            {/* Territory Details - Districts and Sectors List */}
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 mt-5">
              <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-2">
                  <MapPin className="w-5 h-5 text-green-700" />
                </div>
                Assigned Territories
              </h3>
              
              {agentProfileData.territory && agentProfileData.territory.length > 0 ? (
                <div className="space-y-3">
                  {agentProfileData.territory.map((terr, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        terr.isPrimary 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-md' 
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-900 text-base">
                              {terr.district}
                            </h4>
                            {terr.isPrimary && (
                              <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                                Primary
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold">Sector:</span>
                            <span className="font-bold text-gray-900">{terr.sector}</span>
                          </div>
                          {terr.assignedDate && (
                            <div className="mt-2 text-xs text-gray-500">
                              Assigned: {new Date(terr.assignedDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold">No territories assigned yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
              <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-2">
                  <Award className="w-5 h-5 text-purple-700" />
                </div>
                Professional Details
              </h3>
              <div className="space-y-4">
                <InfoField
                  label="Specialization"
                  value={isEditing ? editedProfile.profile?.specialization : agentProfileData.specialization}
                  icon={Target}
                  isEditing={isEditing}
                  onChange={(value) => handleProfileNestedChange('profile', 'specialization', value)}
                />
                <InfoField 
                  label="Experience" 
                  value={isEditing ? editedProfile.profile?.experience : agentProfileData.experience} 
                  icon={Calendar} 
                  isEditing={isEditing}
                  onChange={(value) => handleProfileNestedChange('profile', 'experience', value)}
                />
                <InfoField 
                  label="Certification" 
                  value={isEditing ? editedProfile.profile?.certification : agentProfileData.certification} 
                  icon={Award} 
                  isEditing={isEditing}
                  onChange={(value) => handleProfileNestedChange('profile', 'certification', value)}
                />
                <InfoField
                  label="Member Since"
                  value={agentProfile.created_at ? new Date(agentProfile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  icon={Calendar}
                  isEditing={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}