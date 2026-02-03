// get map features from Overpass API
export const fetchMapData = async (lat, lon, radiusMeters) => {
  const radiusKm = radiusMeters / 1000;
  const bbox = {
    south: lat - (radiusKm / 111),
    north: lat + (radiusKm / 111),
    west: lon - (radiusKm / (111 * Math.cos(lat * Math.PI / 180))),
    east: lon + (radiusKm / (111 * Math.cos(lat * Math.PI / 180)))
  };

  const query = `
    [out:json][timeout:90];
    (
      way["highway"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      way["waterway"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      way["natural"="water"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      relation["natural"="water"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      way["leisure"="park"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      way["landuse"="forest"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      way["landuse"="grass"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      way["railway"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      way["building"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
    );
    out geom;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });
    const data = await response.json();
    return { data, bbox, center: { lat, lon } };
  } catch (error) {
    console.error('Overpass API error:', error);
    throw error;
  }
};
