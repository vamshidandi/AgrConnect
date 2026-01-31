import axios from 'axios';

const API_URL = 'https://plantvillage.psu.edu/api/v1';

export const getCropRotationSuggestions = async (soilType, previousCrops) => {
  try {
    const cropsArray = Array.isArray(previousCrops)
      ? previousCrops
      : previousCrops.split(',').map(crop => crop.trim().toLowerCase());

    const response = await axios.get(`${API_URL}/crop_rotation`, {
      params: {
        soil_type: soilType,
        previous_crops: cropsArray.join(','),
        limit: 5
      }
    });

    return {
      success: true,
      soilType,
      previousCrops: cropsArray,
      recommended: response.data.recommendations || [],
      avoided: response.data.crops_to_avoid || [],
      message: response.data.message || 'Successfully generated rotation plan'
    };
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to get crop rotation suggestions');
  }
};

const FALLBACK_DATA = {
  clay: {
    recommended: [
      { name: 'beans', reason: 'Nitrogen fixation improves clay soil' },
      { name: 'cabbage', reason: 'Helps break up compacted clay' }
    ],
    avoided: ['potatoes', 'carrots']
  },
  sandy: {
    recommended: [
      { name: 'carrots', reason: 'Roots develop well in sandy soil' },
      { name: 'radishes', reason: 'Quick-growing in warm sandy soils' }
    ],
    avoided: ['lettuce', 'spinach']
  }
};

export const getMockRotationSuggestions = (soilType, previousCrops) => {
  return {
    success: false,
    ...FALLBACK_DATA[soilType] || FALLBACK_DATA.clay,
    soilType,
    previousCrops: Array.isArray(previousCrops) ? previousCrops : previousCrops.split(','),
    message: 'Using mock data - API unavailable'
  };
};