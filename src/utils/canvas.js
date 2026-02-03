// convert geographic coordinates to canvas position
export const projectToCanvas = (lat, lon, bbox, canvasWidth, canvasHeight) => {
  const x = ((lon - bbox.west) / (bbox.east - bbox.west)) * canvasWidth;
  const y = ((bbox.north - lat) / (bbox.north - bbox.south)) * canvasHeight;
  return { x, y };
};

// road hierarchy - widths matched for 2400px canvas
const roadHierarchy = {
  motorway: { width: 4.5, color: 'motorway' },
  motorway_link: { width: 3, color: 'motorway' },
  trunk: { width: 4, color: 'primary' },
  trunk_link: { width: 2.8, color: 'primary' },
  primary: { width: 3.2, color: 'primary' },
  primary_link: { width: 2.3, color: 'primary' },
  secondary: { width: 2.5, color: 'secondary' },
  secondary_link: { width: 2, color: 'secondary' },
  tertiary: { width: 2, color: 'tertiary' },
  tertiary_link: { width: 1.6, color: 'tertiary' },
  residential: { width: 1.2, color: 'residential' },
  unclassified: { width: 1, color: 'residential' },
  service: { width: 0.8, color: 'residential' },
  default: { width: 0.8, color: 'residential' }
};

// renders map features and labels onto canvas
export const drawMap = (canvas, mapData, themeColors, settings) => {
  const ctx = canvas.getContext('2d');
  const { data, bbox, center } = mapData;
  
  // canvas dimensions - tuned for quality vs performance
  const width = 1800;
  const height = 2000;
  canvas.width = width;
  canvas.height = height;

  // Clear and fill background
  ctx.fillStyle = themeColors.bg;
  ctx.fillRect(0, 0, width, height);

  // smooth rendering for lines and edges
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // buckets for different map elements
  const roads = [];
  const waterways = [];
  const parks = [];
  const railways = [];
  const buildings = [];

  data.elements.forEach(element => {
    if (element.type === 'way' && element.geometry) {
      if (element.tags?.highway) {
        roads.push({ ...element, roadType: element.tags.highway });
      } else if (element.tags?.waterway || element.tags?.natural === 'water') {
        waterways.push(element);
      } else if (element.tags?.leisure === 'park' || element.tags?.landuse === 'forest' || element.tags?.landuse === 'grass') {
        parks.push(element);
      } else if (element.tags?.railway) {
        railways.push(element);
      } else if (element.tags?.building) {
        buildings.push(element);
      }
    }
  });

  // render waterways
  if (settings.showWater && waterways.length > 0) {
    ctx.fillStyle = themeColors.water;
    ctx.strokeStyle = themeColors.water;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    waterways.forEach(way => {
      if (way.geometry && way.geometry.length > 0) {
        ctx.beginPath();
        way.geometry.forEach((coord, i) => {
          const { x, y } = projectToCanvas(coord.lat, coord.lon, bbox, width, height);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        if (way.tags?.natural === 'water') {
          ctx.closePath();
          ctx.fill();
        }
        ctx.stroke();
      }
    });
  }

  // render parks and green spaces
  if (settings.showParks && parks.length > 0) {
    ctx.fillStyle = themeColors.parks;
    ctx.strokeStyle = themeColors.parks;
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    
    parks.forEach(park => {
      if (park.geometry && park.geometry.length > 0) {
        ctx.beginPath();
        park.geometry.forEach((coord, i) => {
          const { x, y } = projectToCanvas(coord.lat, coord.lon, bbox, width, height);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    });
  }

  // render building outlines
  if (settings.showBuildings && buildings.length > 0) {
    ctx.fillStyle = themeColors.text + '15'; // 15% opacity
    ctx.strokeStyle = themeColors.text + '30'; // 30% opacity
    ctx.lineWidth = 0.5;
    
    buildings.forEach(building => {
      if (building.geometry && building.geometry.length > 0) {
        ctx.beginPath();
        building.geometry.forEach((coord, i) => {
          const { x, y } = projectToCanvas(coord.lat, coord.lon, bbox, width, height);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    });
  }

  // draw major roads first, details last (prevents overlap)
  const roadOrder = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'residential', 'unclassified', 'service'];
  const sortedRoads = roads.sort((a, b) => {
    const aIndex = roadOrder.indexOf(a.roadType) === -1 ? 999 : roadOrder.indexOf(a.roadType);
    const bIndex = roadOrder.indexOf(b.roadType) === -1 ? 999 : roadOrder.indexOf(b.roadType);
    return aIndex - bIndex;
  });

  // render all roads in hierarchy order
  sortedRoads.forEach(road => {
    const isHighway = road.roadType.includes('motorway') || road.roadType.includes('trunk');
    
    if ((settings.showRoads || (isHighway && settings.showHighways)) && road.geometry) {
      const hierarchy = roadHierarchy[road.roadType] || roadHierarchy.default;
      const colorKey = hierarchy.color;
      
      ctx.strokeStyle = themeColors[colorKey];
      ctx.lineWidth = hierarchy.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      road.geometry.forEach((coord, i) => {
        const { x, y } = projectToCanvas(coord.lat, coord.lon, bbox, width, height);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  });

  // render railway lines with dashed pattern
  if (settings.showRailways && railways.length > 0) {
    ctx.strokeStyle = themeColors.text;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.setLineDash([5, 5]);
    
    railways.forEach(railway => {
      if (railway.geometry && railway.geometry.length > 0) {
        ctx.beginPath();
        railway.geometry.forEach((coord, i) => {
          const { x, y } = projectToCanvas(coord.lat, coord.lon, bbox, width, height);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
    });
    
    ctx.setLineDash([]);
  }

  // fade edges to prevent text cutoff
  const gradientHeight = height * 0.15;
  
  // fade at top
  const topGradient = ctx.createLinearGradient(0, 0, 0, gradientHeight);
  topGradient.addColorStop(0, themeColors.bg);
  topGradient.addColorStop(1, themeColors.bg + '00');
  ctx.fillStyle = topGradient;
  ctx.fillRect(0, 0, width, gradientHeight);

  // fade at bottom
  const bottomGradient = ctx.createLinearGradient(0, height - gradientHeight, 0, height);
  bottomGradient.addColorStop(0, themeColors.bg + '00');
  bottomGradient.addColorStop(1, themeColors.bg);
  ctx.fillStyle = bottomGradient;
  ctx.fillRect(0, height - gradientHeight, width, gradientHeight);

  // text positioning based on placement setting
  let textY, textAlign;
  
  if (settings.textPlacement === 'top') {
    textY = height * 0.14;
    textAlign = 'center';
  } else if (settings.textPlacement === 'bottom') {
    textY = height * 0.86;
    textAlign = 'center';
  } else if (settings.textPlacement === 'left') {
    textY = height * 0.5;
    textAlign = 'left';
  } else if (settings.textPlacement === 'right') {
    textY = height * 0.5;
    textAlign = 'right';
  } else if (settings.textPlacement === 'center') {
    textY = height * 0.5;
    textAlign = 'center';
  } else {
    textY = height * 0.86;
    textAlign = 'center';
  }
  
  ctx.fillStyle = settings.textColor;
  ctx.textAlign = textAlign;
  ctx.textBaseline = 'middle';
  
  const isVertical = settings.textPlacement === 'left' || settings.textPlacement === 'right';
  const xBase = settings.textPlacement === 'left' ? width * 0.08 : 
                settings.textPlacement === 'right' ? width * 0.92 : 
                width / 2;
  
  // City name with letter spacing
  const cityText = settings.city.toUpperCase();
  
  if (isVertical) {
    // Vertical text (left/right placement)
    ctx.save();
    ctx.translate(xBase, height / 2);
    ctx.rotate(-Math.PI / 2);
    
    const letterSpacing = settings.fontSize * 1.8;
    const totalWidth = cityText.length * letterSpacing;
    let xOffset = -totalWidth / 2;
    
    ctx.font = `700 ${settings.fontSize * 2}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = 'center';
    
    for (let i = 0; i < cityText.length; i++) {
      ctx.fillText(cityText[i], xOffset + (letterSpacing / 2), 0);
      xOffset += letterSpacing;
    }
    
    // Decorative line
    const lineY = settings.fontSize * 1.2;
    const lineWidth = totalWidth * 0.25;
    ctx.fillRect(-lineWidth / 2, lineY, lineWidth, 2.5);
    
    // Country name
    const countryY = lineY + settings.fontSize * 0.7;
    ctx.font = `400 ${settings.fontSize * 0.75}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(settings.country.toUpperCase(), 0, countryY);
    
    // Coordinates
    const coordY = countryY + settings.fontSize * 0.75;
    ctx.font = `300 ${settings.fontSize * 0.6}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = 'center';
    const latText = `${Math.abs(center.lat).toFixed(4)}° ${center.lat >= 0 ? 'N' : 'S'}`;
    const lonText = `${Math.abs(center.lon).toFixed(4)}° ${center.lon >= 0 ? 'E' : 'W'}`;
    ctx.fillText(`${latText}, ${lonText}`, 0, coordY);
    
    ctx.restore();
  } else {
    // Horizontal text (top/bottom/center placement)
    const letterSpacing = settings.fontSize * 1.8;
    const totalWidth = cityText.length * letterSpacing;
    let xOffset = xBase - (totalWidth / 2);
    
    ctx.font = `700 ${settings.fontSize * 2}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`;
    
    for (let i = 0; i < cityText.length; i++) {
      ctx.fillText(cityText[i], xOffset + (letterSpacing / 2), textY);
      xOffset += letterSpacing;
    }

    // Decorative line
    const lineY = textY + settings.fontSize * 1.2;
    const lineWidth = width * 0.08;
    ctx.fillRect(xBase - (lineWidth / 2), lineY, lineWidth, 2.5);

    // Country name
    const countryY = lineY + settings.fontSize * 0.7;
    ctx.font = `400 ${settings.fontSize * 0.75}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`;
    ctx.fillText(settings.country.toUpperCase(), xBase, countryY);

    // Coordinates
    const coordY = countryY + settings.fontSize * 0.75;
    ctx.font = `300 ${settings.fontSize * 0.6}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`;
    const latText = `${Math.abs(center.lat).toFixed(4)}° ${center.lat >= 0 ? 'N' : 'S'}`;
    const lonText = `${Math.abs(center.lon).toFixed(4)}° ${center.lon >= 0 ? 'E' : 'W'}`;
    ctx.fillText(`${latText}, ${lonText}`, xBase, coordY);
  }

  return canvas;
};
