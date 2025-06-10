// Create caption mappings
export const imageCaptions = {
  bedroom: "Bedroom",
  living_room_1: "Living Room",
  living_room_2: "Second Living Area",
  kitchen: "Modern Kitchen",
  // Add more mappings as needed
};

// Generate caption from filename
export const getCaptionFromPath = (path) => {
  const filename = path.split("/").pop().split(".")[0];
  return imageCaptions[filename] || filename.replace(/_/g, " ");
};
