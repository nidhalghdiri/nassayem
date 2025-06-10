export const formatLocationMessage = (buildingId) => {
  return `<LOCATION:${buildingId}>`;
};

export const formatContactMessage = (buildingId, contactType) => {
  return `<CONTACT:${buildingId}:${contactType}>`;
};

// Example usage in your code:
// const response = `Our location: ${formatLocationMessage('sadaa')}`
