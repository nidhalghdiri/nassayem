import { getCaptionFromPath } from "./imageUtils";
export const propertyImageData = {
  sadaa: [
    "/images/properties/sadaa/bedroom.jpg",
    "/images/properties/sadaa/living_room.jpg",
    "/images/properties/sadaa/living_room_2.jpg",
    "/images/properties/sadaa/room.jpg",
    "/images/properties/sadaa/kitchen.jpg",
  ],
  hay_tijari: [
    "/images/properties/hay_tijari/bedroom.jpg",
    "/images/properties/hay_tijari/living_room_1.jpg",
    "/images/properties/hay_tijari/living_room_2.jpg",
  ],
};

// Generate object with captions
export const propertyImages = Object.entries(propertyImageData).reduce(
  (acc, [propertyId, paths]) => {
    acc[propertyId] = paths.map((path) => ({
      path,
      caption: getCaptionFromPath(path),
    }));
    return acc;
  },
  {}
);
