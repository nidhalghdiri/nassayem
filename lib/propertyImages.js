import { getCaptionFromPath } from "./imageUtils";
export const propertyImageData = {
  alwadi: [
    "/images/properties/alwadi/reception.jpeg",
    "/images/properties/alwadi/living_room.jpeg",
    "/images/properties/alwadi/room_1.jpeg",
    "/images/properties/alwadi/room_2.jpeg",
    "/images/properties/alwadi/bathroom.jpeg",
  ],
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
