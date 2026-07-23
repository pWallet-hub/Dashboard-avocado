import React, { useEffect, useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Activity, Award, BarChart3, 
  Briefcase, Edit3, Save, X, AlertCircle, TrendingUp, Target, 
  CheckCircle2, Clock, FileText, ShieldCheck
} from 'lucide-react';
import { getAgentInformation, updateAgentInformation } from '../../services/agent-information';
import { updateProfile } from '../../services/authService';
import { listHarvestRequests } from '../../services/serviceRequestsService';
import { Link } from 'react-router-dom';

// ----------------------------------------------------------------------
// 1. EXACT ORIGINAL MEMBERSHIP CARD COMPONENTS (UNCHANGED)
// ----------------------------------------------------------------------

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
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-900"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-gradient-radial from-white/15 via-white/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-gradient-radial from-yellow-500/20 via-yellow-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05)_0%,transparent_40%)] pointer-events-none"></div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>

        <div className="relative bg-gradient-to-r from-black/20 via-black/30 to-black/20 backdrop-blur-sm py-4 text-center border-b-2 border-yellow-400/50 shadow-lg">
          <h1 className="text-yellow-400 text-xl font-black tracking-widest drop-shadow-lg uppercase">
            Agricultural Extension Agent
          </h1>
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
        </div>

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

// ----------------------------------------------------------------------
// 2. REDESIGNED DASHBOARD SUB-COMPONENTS
// ----------------------------------------------------------------------

// Modern Dashboard Metric Card (Matching Reference Dashboard Structure)
const MetricCard = ({ icon: Icon, title, value, subtitle, trend, variant = "emerald" }) => {
  const variants = {
    emerald: "bg-emerald-600 text-white",
    purple: "bg-purple-600 text-white",
    blue: "bg-sky-500 text-white",
    coral: "bg-orange-500 text-white"
  };

  return (
    <div className={`${variants[variant]} rounded-xl p-5 flex items-center justify-between shadow-xs transition-transform hover:-translate-y-0.5`}>
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-wider opacity-85">{title}</p>
        <h3 className="text-2xl font-extrabold tracking-tight">{value || '0'}</h3>
        {trend && (
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-md mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>{trend}</span>
          </div>
        )}
        {!trend && subtitle && (
          <p className="text-xs opacity-80 font-medium">{subtitle}</p>
        )}
      </div>
      <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
        <Icon className="w-7 h-7 text-white" aria-hidden="true" />
      </div>
    </div>
  );
};

// Clean Info Field Box
const InfoField = ({ label, value, icon: Icon, isEditing, onChange, type = "text" }) => (
  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center gap-3">
    <div className="p-2 bg-white rounded-md border border-slate-200 text-emerald-700 shadow-2xs">
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
      {isEditing ? (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full mt-1 px-2.5 py-1 text-xs border border-emerald-600 rounded bg-white font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      ) : (
        <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{value || 'N/A'}</p>
      )}
    </div>
  </div>
);

// ----------------------------------------------------------------------
// 3. MAIN AGENT PROFILE COMPONENT
// ----------------------------------------------------------------------

export default function AgentProfile() {
  const [agentProfile, setAgentProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});

  useEffect(() => {
    const fetchAgentProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getAgentInformation();
        const { user_info, agent_profile } = response;
        
        const primaryTerritory = agent_profile?.territory?.find(t => t.isPrimary) || agent_profile?.territory?.[0];
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
      const user_info = await updateProfile({
        full_name: editedProfile.full_name,
        phone: editedProfile.phone,
      });

      const agent_profile = await updateAgentInformation({
        province: editedProfile.profile?.province || '',
        territory: editedProfile.profile?.territory || [],
        specialization: editedProfile.profile?.specialization || '',
        experience: editedProfile.profile?.experience || '',
        certification: editedProfile.profile?.certification || '',
      });

      const primaryTerritory = agent_profile?.territory?.find(t => t.isPrimary) || agent_profile?.territory?.[0];
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
          territoryCoverage: agent_profile.territoryCoverage || editedProfile.profile?.territoryCoverage,
          primaryDistrict: primaryTerritory?.district || '',
          primarySector: primaryTerritory?.sector || '',
          territoryString: territoryString,
          specialization: agent_profile.specialization,
          experience: agent_profile.experience,
          certification: agent_profile.certification,
          statistics: agent_profile.statistics,
          profileImage: editedProfile.profile?.profileImage || null
        }
      };

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currentUser,
        full_name: user_info.full_name,
        phone: user_info.phone,
        email: user_info.email,
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-slate-200 border-t-emerald-700 mx-auto"></div>
          <p className="text-xs font-semibold text-slate-600">Retrieving agent profile records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-rose-200 rounded-2xl p-6 max-w-md w-full shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Profile Loading Error</h3>
              <p className="text-xs text-rose-700 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-xs font-semibold cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const agentProfileData = agentProfile.profile || {};

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-['Poppins'] p-4 sm:p-6 lg:p-8">
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header Bar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Extension Agent Profile</h1>
            <p className="text-xs text-slate-500 mt-0.5">Operational credentials, field coverage, and assignment performance</p>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. MEMBERSHIP CARD (100% PRESERVED DESIGN & STRUCTURE) */}
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

        {/* 2. DASHBOARD METRICS BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={User}
            title="Farmers Assisted"
            value={agentProfileData.statistics?.farmersAssisted || 0}
            trend="+12% this month"
            variant="emerald"
          />
          <MetricCard
            icon={BarChart3}
            title="Transactions"
            value={agentProfileData.statistics?.totalTransactions || 0}
            subtitle="Completed total"
            variant="purple"
          />
          <MetricCard
            icon={Award}
            title="Performance Rate"
            value={agentProfileData.statistics?.performance || '0%'}
            trend="High Efficiency"
            variant="blue"
          />
          <MetricCard
            icon={TrendingUp}
            title="Experience"
            value={agentProfileData.experience?.split(' ')[0] || 'N/A'}
            subtitle="Years active in field"
            variant="coral"
          />
        </div>

        {/* 3. DETAILS & TERRITORY PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Territory Summary */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>Territory Coverage</span>
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                  Active Domain
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <InfoField 
                  label="Total Districts Covered" 
                  value={agentProfileData.territoryCoverage?.totalDistricts || 0} 
                  icon={MapPin} 
                  isEditing={false}
                />
                <InfoField 
                  label="Total Sectors Covered" 
                  value={agentProfileData.territoryCoverage?.totalSectors || 0} 
                  icon={MapPin} 
                  isEditing={false}
                />
              </div>
            </div>

            {/* Assigned Territories List */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Assigned Field Territories</span>
                </h3>
              </div>

              {agentProfileData.territory && agentProfileData.territory.length > 0 ? (
                <div className="divide-y divide-slate-100 text-xs">
                  {agentProfileData.territory.map((terr, index) => (
                    <div key={index} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{terr.district}</p>
                          {terr.isPrimary && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500">Sector: <strong className="text-slate-700">{terr.sector}</strong></p>
                      </div>

                      {terr.assignedDate && (
                        <span className="text-[11px] font-medium text-slate-400">
                          Assigned {new Date(terr.assignedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No explicit territories assigned to this agent.
                </div>
              )}
            </div>

          </div>

          {/* Professional Credentials Side Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>Professional Credentials</span>
                </h3>
              </div>

              <div className="space-y-3">
                <InfoField
                  label="Specialization"
                  value={isEditing ? editedProfile.profile?.specialization : agentProfileData.specialization}
                  icon={Target}
                  isEditing={isEditing}
                  onChange={(value) => handleProfileNestedChange('profile', 'specialization', value)}
                />
                <InfoField 
                  label="Field Experience" 
                  value={isEditing ? editedProfile.profile?.experience : agentProfileData.experience} 
                  icon={Calendar} 
                  isEditing={isEditing}
                  onChange={(value) => handleProfileNestedChange('profile', 'experience', value)}
                />
                <InfoField 
                  label="Accreditation Certification" 
                  value={isEditing ? editedProfile.profile?.certification : agentProfileData.certification} 
                  icon={Award} 
                  isEditing={isEditing}
                  onChange={(value) => handleProfileNestedChange('profile', 'certification', value)}
                />
                <InfoField
                  label="Registered Since"
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