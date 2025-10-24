/**
 * Farmer Information API Integration
 * 
 * This module provides methods to interact with the Farmer Information API endpoints.
 * All methods require authentication via JWT token.
 * 
 * @module farmer-information
 */

import apiClient from './apiClient';

const FARMER_INFO_ENDPOINT = '/farmer-information';

/**
 * Test if Farmer Information routes are working
 * 
 * @returns {Promise<Object>} Test response
 * @example
 * const result = await testFarmerRoutes();
 * console.log(result.message); // "Farmer Information routes are working!"
 */
export const testFarmerRoutes = async () => {
  try {
    const response = await apiClient.get(`${FARMER_INFO_ENDPOINT}/test`);
    return response.data;
  } catch (error) {
    console.error('Test farmer routes error:', error);
    throw error;
  }
};

/**
 * Get complete farmer information including user details and farmer profile
 * 
 * @returns {Promise<Object>} Farmer information response
 * @throws {Error} If user is not authenticated or not a farmer
 * 
 * @example
 * const farmerInfo = await getFarmerInformation();
 * console.log(farmerInfo.data.farmer_profile.tree_count);
 */
export const getFarmerInformation = async () => {
  try {
    const response = await apiClient.get(FARMER_INFO_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Get farmer information error:', error);
    throw error;
  }
};

/**
 * Update farmer profile information
 * Creates profile if it doesn't exist (upsert behavior)
 * 
 * @param {Object} updateData - Farmer profile data to update
 * @param {string} [updateData.full_name] - Farmer's full name
 * @param {string} [updateData.phone] - Phone number
 * @param {string} [updateData.email] - Email address
 * @param {number} [updateData.age] - Age in years
 * @param {string} [updateData.id_number] - National ID number
 * @param {string} [updateData.gender] - Gender
 * @param {string} [updateData.marital_status] - Marital status
 * @param {string} [updateData.education_level] - Education level
 * @param {string} [updateData.province] - Province of residence
 * @param {string} [updateData.district] - District of residence
 * @param {string} [updateData.sector] - Sector of residence
 * @param {string} [updateData.cell] - Cell of residence
 * @param {string} [updateData.village] - Village of residence
 * @param {number} [updateData.farm_age] - Age of farm in years
 * @param {string} [updateData.planted] - Year planted
 * @param {string} [updateData.avocado_type] - Type of avocado
 * @param {number} [updateData.mixed_percentage] - Percentage mixed (0-100)
 * @param {number} [updateData.farm_size] - Farm size in hectares
 * @param {number} [updateData.tree_count] - Number of trees
 * @param {string} [updateData.upi_number] - UPI identification number
 * @param {string} [updateData.farm_province] - Province where farm is located
 * @param {string} [updateData.farm_district] - District where farm is located
 * @param {string} [updateData.farm_sector] - Sector where farm is located
 * @param {string} [updateData.farm_cell] - Cell where farm is located
 * @param {string} [updateData.farm_village] - Village where farm is located
 * @param {string[]} [updateData.assistance] - Array of assistance types received
 * @param {string} [updateData.image] - URL or path to farmer/farm image
 * 
 * @returns {Promise<Object>} Updated farmer information
 * 
 * @example
 * const updated = await updateFarmerInformation({
 *   age: 35,
 *   farm_size: 2.5,
 *   tree_count: 150,
 *   avocado_type: "Hass"
 * });
 */
export const updateFarmerInformation = async (updateData) => {
  try {
    console.log('Sending update data:', updateData);
    const response = await apiClient.put(FARMER_INFO_ENDPOINT, updateData);
    console.log('Update response:', response);
    return response.data;
  } catch (error) {
    console.error('Update farmer information error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

/**
 * Create a new farmer profile
 * Use this for first-time profile creation
 * Returns error if profile already exists
 * 
 * @param {Object} profileData - Initial farmer profile data
 * @param {number} [profileData.age] - Age in years
 * @param {string} [profileData.id_number] - National ID number
 * @param {string} [profileData.gender] - Gender
 * @param {string} [profileData.marital_status] - Marital status
 * @param {string} [profileData.education_level] - Education level
 * @param {string} [profileData.province] - Province of residence
 * @param {string} [profileData.district] - District of residence
 * @param {string} [profileData.sector] - Sector of residence
 * @param {string} [profileData.cell] - Cell of residence
 * @param {string} [profileData.village] - Village of residence
 * @param {number} [profileData.farm_age] - Age of farm in years
 * @param {string} [profileData.planted] - Year planted
 * @param {string} [profileData.avocado_type] - Type of avocado
 * @param {number} [profileData.mixed_percentage] - Percentage mixed (0-100)
 * @param {number} [profileData.farm_size] - Farm size in hectares
 * @param {number} [profileData.tree_count] - Number of trees
 * @param {string} [profileData.upi_number] - UPI identification number
 * @param {string} [profileData.farm_province] - Province where farm is located
 * @param {string} [profileData.farm_district] - District where farm is located
 * @param {string} [profileData.farm_sector] - Sector where farm is located
 * @param {string} [profileData.farm_cell] - Cell where farm is located
 * @param {string} [profileData.farm_village] - Village where farm is located
 * @param {string[]} [profileData.assistance] - Array of assistance types received
 * @param {string} [profileData.image] - URL or path to farmer/farm image
 * 
 * @returns {Promise<Object>} Created farmer profile
 * @throws {Error} If profile already exists
 * 
 * @example
 * const newProfile = await createFarmerProfile({
 *   age: 35,
 *   gender: "Male",
 *   farm_size: 2.5,
 *   tree_count: 150,
 *   province: "Eastern",
 *   district: "Nyagatare"
 * });
 */
export const createFarmerProfile = async (profileData) => {
  try {
    const response = await apiClient.post(`${FARMER_INFO_ENDPOINT}/create`, profileData);
    return response.data;
  } catch (error) {
    console.error('Create farmer profile error:', error);
    throw error;
  }
};

/**
 * Update tree count only
 * Quick update endpoint for a specific field
 * Creates profile if it doesn't exist
 * 
 * @param {number} treeCount - Number of trees (must be >= 0)
 * @returns {Promise<Object>} Updated farmer information
 * @throws {Error} If tree count is invalid (negative or not a number)
 * 
 * @example
 * const updated = await updateTreeCount(175);
 * console.log(updated.data.farmer_profile.tree_count); // 175
 */
export const updateTreeCount = async (treeCount) => {
  try {
    if (typeof treeCount !== 'number' || treeCount < 0) {
      throw new Error('Tree count must be a non-negative number');
    }
    
    const response = await apiClient.put(`${FARMER_INFO_ENDPOINT}/tree-count`, { tree_count: treeCount });
    return response.data;
  } catch (error) {
    console.error('Update tree count error:', error);
    throw error;
  }
};

/**
 * Update multiple specific fields at once
 * Helper function for common field updates
 * 
 * @param {Object} fields - Fields to update
 * @returns {Promise<Object>} Updated farmer information
 * 
 * @example
 * const updated = await updateSpecificFields({
 *   tree_count: 200,
 *   farm_size: 3.0,
 *   avocado_type: "Hass"
 * });
 */
export const updateSpecificFields = async (fields) => {
  return updateFarmerInformation(fields);
};

/**
 * Update user basic information only
 * 
 * @param {Object} userData - User data to update
 * @param {string} [userData.full_name] - Full name
 * @param {string} [userData.phone] - Phone number
 * @param {string} [userData.email] - Email address
 * @returns {Promise<Object>} Updated farmer information
 * 
 * @example
 * const updated = await updateUserInfo({
 *   full_name: "John Doe",
 *   phone: "+250788123456"
 * });
 */
export const updateUserInfo = async (userData) => {
  const validFields = {};
  if (userData.full_name) validFields.full_name = userData.full_name;
  if (userData.phone) validFields.phone = userData.phone;
  if (userData.email) validFields.email = userData.email;
  
  return updateFarmerInformation(validFields);
};

/**
 * Update personal location information
 * 
 * @param {Object} location - Location data
 * @param {string} [location.province] - Province
 * @param {string} [location.district] - District
 * @param {string} [location.sector] - Sector
 * @param {string} [location.cell] - Cell
 * @param {string} [location.village] - Village
 * @returns {Promise<Object>} Updated farmer information
 * 
 * @example
 * const updated = await updatePersonalLocation({
 *   province: "Northern Province",
 *   district: "Gakenke",
 *   sector: "Ruli"
 * });
 */
export const updatePersonalLocation = async (location) => {
  return updateFarmerInformation(location);
};

/**
 * Update farm location information
 * 
 * @param {Object} farmLocation - Farm location data
 * @param {string} [farmLocation.farm_province] - Province
 * @param {string} [farmLocation.farm_district] - District
 * @param {string} [farmLocation.farm_sector] - Sector
 * @param {string} [farmLocation.farm_cell] - Cell
 * @param {string} [farmLocation.farm_village] - Village
 * @returns {Promise<Object>} Updated farmer information
 * 
 * @example
 * const updated = await updateFarmLocation({
 *   farm_province: "Eastern",
 *   farm_district: "Nyagatare",
 *   farm_sector: "Karangazi"
 * });
 */
export const updateFarmLocation = async (farmLocation) => {
  return updateFarmerInformation(farmLocation);
};

/**
 * Update farm information
 * 
 * @param {Object} farmInfo - Farm data
 * @param {number} [farmInfo.farm_age] - Age of farm in years
 * @param {string} [farmInfo.planted] - Year planted
 * @param {string} [farmInfo.avocado_type] - Type of avocado
 * @param {number} [farmInfo.mixed_percentage] - Percentage mixed (0-100)
 * @param {number} [farmInfo.farm_size] - Farm size in hectares
 * @param {number} [farmInfo.tree_count] - Number of trees
 * @param {string} [farmInfo.upi_number] - UPI identification number
 * @returns {Promise<Object>} Updated farmer information
 * 
 * @example
 * const updated = await updateFarmInfo({
 *   farm_age: 5,
 *   avocado_type: "Hass",
 *   farm_size: 3.5,
 *   tree_count: 200
 * });
 */
export const updateFarmInfo = async (farmInfo) => {
  return updateFarmerInformation(farmInfo);
};

/**
 * Add or update assistance types
 * 
 * @param {string[]} assistanceTypes - Array of assistance types
 * @returns {Promise<Object>} Updated farmer information
 * 
 * @example
 * const updated = await updateAssistance(["irrigation", "fertilizers", "training"]);
 */
export const updateAssistance = async (assistanceTypes) => {
  if (!Array.isArray(assistanceTypes)) {
    throw new Error('Assistance must be an array');
  }
  
  return updateFarmerInformation({ assistance: assistanceTypes });
};

/**
 * Update farmer/farm image
 * 
 * @param {string} imageUrl - URL or path to image
 * @returns {Promise<Object>} Updated farmer information
 * 
 * @example
 * const updated = await updateFarmerImage("https://example.com/farm-image.jpg");
 */
export const updateFarmerImage = async (imageUrl) => {
  return updateFarmerInformation({ image: imageUrl });
};

/**
 * Check if farmer has a profile
 * 
 * @returns {Promise<boolean>} True if profile exists, false otherwise
 * 
 * @example
 * const hasProfile = await hasFarmerProfile();
 * if (!hasProfile) {
 *   await createFarmerProfile({ age: 35, gender: "Male" });
 * }
 */
export const hasFarmerProfile = async () => {
  try {
    const response = await getFarmerInformation();
    return response.data.farmer_profile !== null;
  } catch (error) {
    console.error('Check farmer profile error:', error);
    return false;
  }
};

/**
 * Get specific farmer profile field
 * 
 * @param {string} fieldName - Name of the field to retrieve
 * @returns {Promise<any>} Field value or null if not found
 * 
 * @example
 * const treeCount = await getFarmerProfileField('tree_count');
 * console.log(treeCount); // 150
 */
export const getFarmerProfileField = async (fieldName) => {
  try {
    const response = await getFarmerInformation();
    return response.data.farmer_profile?.[fieldName] || null;
  } catch (error) {
    console.error('Get farmer profile field error:', error);
    return null;
  }
};

/**
 * Batch update multiple farmer information sections
 * 
 * @param {Object} updates - Object containing all updates
 * @param {Object} [updates.userInfo] - User information updates
 * @param {Object} [updates.personalInfo] - Personal information updates
 * @param {Object} [updates.personalLocation] - Personal location updates
 * @param {Object} [updates.farmInfo] - Farm information updates
 * @param {Object} [updates.farmLocation] - Farm location updates
 * @param {string[]} [updates.assistance] - Assistance types
 * @param {string} [updates.image] - Image URL
 * @returns {Promise<Object>} Updated farmer information
 * 
 * @example
 * const updated = await batchUpdateFarmerInfo({
 *   userInfo: { full_name: "John Doe", phone: "+250788123456" },
 *   farmInfo: { tree_count: 200, farm_size: 3.5 },
 *   assistance: ["irrigation", "fertilizers"]
 * });
 */
export const batchUpdateFarmerInfo = async (updates) => {
  const allUpdates = {
    ...updates.userInfo,
    ...updates.personalInfo,
    ...updates.personalLocation,
    ...updates.farmInfo,
    ...updates.farmLocation,
  };
  
  if (updates.assistance) {
    allUpdates.assistance = updates.assistance;
  }
  
  if (updates.image) {
    allUpdates.image = updates.image;
  }
  
  return updateFarmerInformation(allUpdates);
};

// Export all functions as default object
export default {
  testFarmerRoutes,
  getFarmerInformation,
  updateFarmerInformation,
  createFarmerProfile,
  updateTreeCount,
  updateSpecificFields,
  updateUserInfo,
  updatePersonalLocation,
  updateFarmLocation,
  updateFarmInfo,
  updateAssistance,
  updateFarmerImage,
  hasFarmerProfile,
  getFarmerProfileField,
  batchUpdateFarmerInfo,
};