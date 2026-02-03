import { useState, useEffect, useRef, useCallback } from 'react';
import { Download, Map, Sun, Moon, Monitor, Loader2, ChevronDown } from 'lucide-react';
import CustomSelect from './CustomSelect';
import { mapThemes } from '../constants/themes';
import { presets } from '../constants/presets';
import { getCoordinates } from '../utils/geocoding';
import { fetchMapData } from '../utils/mapData';
import { drawMap } from '../utils/canvas';
import '../styles/MapPosterGenerator.css';

const MapPosterGenerator = () => {
  const [theme, setTheme] = useState('system');
  const [city, setCity] = useState('Mumbai');
  const [country, setCountry] = useState('India');
  const [radius, setRadius] = useState(12);
  const [mapTheme, setMapTheme] = useState('feature_based');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(48);
  const [textPlacement, setTextPlacement] = useState('bottom');
  const [useThemeColor, setUseThemeColor] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showBuildings, setShowBuildings] = useState(false);
  const [showHighways, setShowHighways] = useState(true);
  const [showWater, setShowWater] = useState(true);
  const [showParks, setShowParks] = useState(true);
  const [showRailways, setShowRailways] = useState(false);
  const [showLanduse, setShowLanduse] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [posterData, setPosterData] = useState(null);
  const [mapDataCache, setMapDataCache] = useState(null);
  const [showPresets, setShowPresets] = useState(false);
  const [expandAdditionalSettings, setExpandAdditionalSettings] = useState(false);
  const canvasRef = useRef(null);
  const updateTimeoutRef = useRef(null);

  useEffect(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (theme === 'system') {
      document.documentElement.setAttribute('data-theme', systemTheme);
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const updatePreview = useCallback(() => {
    if (!mapDataCache) return;

    const selectedTheme = mapThemes.find(t => t.value === mapTheme);
    const themeColors = selectedTheme.colors;

    const canvas = canvasRef.current;
    const settings = {
      city,
      country,
      textColor: useThemeColor ? themeColors.text : textColor,
      fontSize,
      textPlacement,
      showRoads,
      showBuildings,
      showHighways,
      showWater,
      showParks,
      showRailways,
      showLanduse
    };

    drawMap(canvas, mapDataCache, themeColors, settings);
    
    const dataUrl = canvas.toDataURL('image/png', 1.0); // Full quality
    setPosterData(dataUrl);
  }, [mapDataCache, mapTheme, city, country, textColor, useThemeColor, fontSize, textPlacement, showRoads, showBuildings, showHighways, showWater, showParks, showRailways, showLanduse]);

  // Live preview update when settings change (with debouncing)
  useEffect(() => {
    if (mapDataCache) {
      // Clear existing timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      // Set new timeout for debounced update
      updateTimeoutRef.current = setTimeout(() => {
        updatePreview();
      }, 300); // 300ms debounce
    }
    
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [mapTheme, textColor, useThemeColor, fontSize, textPlacement, showRoads, showBuildings, showHighways, showWater, showParks, showRailways, showLanduse, mapDataCache, updatePreview]);

  // Auto-update text color when theme changes and useThemeColor is true
  useEffect(() => {
    if (useThemeColor) {
      const selectedTheme = mapThemes.find(t => t.value === mapTheme);
      if (selectedTheme) {
        setTextColor(selectedTheme.colors.text);
      }
    }
  }, [mapTheme, useThemeColor]);

  const applyPreset = (preset) => {
    setCity(preset.city);
    setCountry(preset.country);
    setRadius(preset.radius);
    setMapTheme(preset.theme);
    setShowPresets(false);
    // Clear cached data to force regeneration
    setMapDataCache(null);
    setPosterData(null);
  };

  const generatePoster = async () => {
    if (!city || !country) {
      alert('Please enter both city and country name');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Get coordinates
      const coords = await getCoordinates(city, country);
      console.log('Coordinates:', coords);

      // Fetch map data
      const mapData = await fetchMapData(coords.lat, coords.lon, radius * 1000);
      console.log('Map data fetched:', mapData.data.elements.length, 'elements');

      // Cache the map data for live updates
      setMapDataCache(mapData);

      // Get theme colors
      const selectedTheme = mapThemes.find(t => t.value === mapTheme);
      const themeColors = selectedTheme.colors;

      // Draw map
      const canvas = canvasRef.current;
      const settings = {
        city,
        country,
        textColor,
        fontSize,
        textPlacement,
        showRoads,
        showBuildings,
        showHighways,
        showWater,
        showParks
      };

      drawMap(canvas, mapData, themeColors, settings);
      
      // Convert to data URL for preview
      const dataUrl = canvas.toDataURL('image/png');
      setPosterData(dataUrl);

    } catch (error) {
      console.error('Error generating poster:', error);
      alert('Failed to generate poster. Please try again or check your location details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPoster = () => {
    if (!posterData) {
      alert('Please generate a poster first');
      return;
    }

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `${city.toLowerCase().replace(/\s+/g, '_')}_${mapTheme}_${timestamp}.png`;
    link.href = posterData;
    link.click();
  };

  return (
    <div className="app-container">
      <canvas ref={canvasRef} id="hiddenCanvas"></canvas>

      <nav className="navbar">
        <div className="nav-left flex gap-2 items-center">
          <Map size={24} className="logo-icon" />
          <span className="logo-text">MapToPoster</span>
        </div>
        <div className="nav-right">
          <div className="theme-switcher">
            <button
              className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
              title="Light theme"
            >
              <Sun size={18} />
            </button>
            <button
              className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
              title="Dark theme"
            >
              <Moon size={18} />
            </button>
            <button
              className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
              onClick={() => setTheme('system')}
              title="System theme"
            >
              <Monitor size={18} />
            </button>
          </div>
          <button 
            className="download-btn"
            onClick={downloadPoster}
            disabled={!posterData}
          >
            <Download size={18} />
            Download
          </button>
        </div>
      </nav>

      <div className="main-content">
        <div className="left-panel">
          <button 
            className="presets-button"
            onClick={() => setShowPresets(!showPresets)}
          >
            {showPresets ? '✕ Close Presets' : '⚡ Quick Presets'}
          </button>

          {showPresets && (
            <div className="presets-grid">
              {presets.map((preset) => (
                <div
                  key={preset.name}
                  className="preset-card"
                  onClick={() => applyPreset(preset)}
                >
                  <div className="preset-name">{preset.name}</div>
                  <div className="preset-desc">{preset.desc}</div>
                  <div className="preset-details">
                    {preset.radius}km · {mapThemes.find(t => t.value === preset.theme)?.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="section">
            <h3 className="section-title">Location</h3>
            <div className="input-group">
              <label className="label">City Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., San Francisco"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="label">Country Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., USA"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>

          <div className="section">
            <h3 className="section-title">Map Settings</h3>
            <div className="input-group">
              <label className="label">Radius: {radius}km</label>
              <div className="slider-container">
                <input
                  type="range"
                  className="slider"
                  min="4"
                  max="25"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                />
                <span className="slider-value">{radius} km</span>
              </div>
            </div>

            <div className="input-group">
              <label className="label">Map Theme</label>
              <CustomSelect
                options={mapThemes}
                value={mapTheme}
                onChange={setMapTheme}
              />
            </div>
          </div>

          {/* Accordion for Additional Settings */}
          <div className="accordion">
            <button
              className={`accordion-header ${expandAdditionalSettings ? 'active' : ''}`}
              onClick={() => setExpandAdditionalSettings(!expandAdditionalSettings)}
            >
              <span className="accordion-title">Additional Settings</span>
              <ChevronDown 
                size={20} 
                className={`accordion-icon ${expandAdditionalSettings ? 'rotated' : ''}`}
              />
            </button>

            {expandAdditionalSettings && (
              <div className="accordion-content">
                {/* Map Elements */}
                <div className="section">
                  <h3 className="section-title">Map Elements</h3>
                  <div className="checkbox-group">
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={showRoads}
                        onChange={(e) => setShowRoads(e.target.checked)}
                      />
                      <span className="checkbox-label">Roads</span>
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={showHighways}
                        onChange={(e) => setShowHighways(e.target.checked)}
                      />
                      <span className="checkbox-label">Highways</span>
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={showBuildings}
                        onChange={(e) => setShowBuildings(e.target.checked)}
                      />
                      <span className="checkbox-label">Buildings</span>
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={showWater}
                        onChange={(e) => setShowWater(e.target.checked)}
                      />
                      <span className="checkbox-label">Water Bodies</span>
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={showParks}
                        onChange={(e) => setShowParks(e.target.checked)}
                      />
                      <span className="checkbox-label">Parks & Green Spaces</span>
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={showRailways}
                        onChange={(e) => setShowRailways(e.target.checked)}
                      />
                      <span className="checkbox-label">Railways</span>
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={showLanduse}
                        onChange={(e) => setShowLanduse(e.target.checked)}
                      />
                      <span className="checkbox-label">Land Use Areas</span>
                    </label>
                  </div>
                </div>

                {/* Text Settings */}
                <div className="section">
                  <h3 className="section-title">Text Settings</h3>
                  <div className="input-group">
                    <label className="label">Text Color</label>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label className="checkbox-item" style={{ cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={useThemeColor}
                          onChange={(e) => setUseThemeColor(e.target.checked)}
                        />
                        <span className="checkbox-label">Use theme color automatically</span>
                      </label>
                    </div>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        className="color-input"
                        value={textColor}
                        onChange={(e) => {
                          setTextColor(e.target.value);
                          if (useThemeColor) {
                            setUseThemeColor(false);
                          }
                        }}
                        style={{ 
                          opacity: useThemeColor ? 0.6 : 1, 
                          cursor: useThemeColor ? 'not-allowed' : 'pointer',
                          pointerEvents: useThemeColor ? 'none' : 'auto'
                        }}
                      />
                      <input
                        type="text"
                        className="color-text"
                        value={textColor}
                        onChange={(e) => {
                          setTextColor(e.target.value);
                          if (useThemeColor) {
                            setUseThemeColor(false);
                          }
                        }}
                        readOnly={useThemeColor}
                        style={{ 
                          opacity: useThemeColor ? 0.7 : 1, 
                          cursor: useThemeColor ? 'not-allowed' : 'text',
                          backgroundColor: useThemeColor ? 'var(--bg-secondary)' : 'var(--input-bg)'
                        }}
                      />
                    </div>
                    {useThemeColor && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        ℹ️ Uncheck above to edit manually
                      </div>
                    )}
                  </div>

                  <div className="input-group">
                    <label className="label">Font Size: {fontSize}px</label>
                    <div className="slider-container">
                      <input
                        type="range"
                        className="slider"
                        min="24"
                        max="72"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                      />
                      <span className="slider-value">{fontSize}px</span>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="label">Text Placement</label>
                    <div className="radio-group">
                      <label className="radio-item">
                        <input
                          type="radio"
                          className="radio"
                          name="placement"
                          checked={textPlacement === 'top'}
                          onChange={() => setTextPlacement('top')}
                        />
                        <span className="radio-label">Top</span>
                      </label>
                      <label className="radio-item">
                        <input
                          type="radio"
                          className="radio"
                          name="placement"
                          checked={textPlacement === 'bottom'}
                          onChange={() => setTextPlacement('bottom')}
                        />
                        <span className="radio-label">Bottom</span>
                      </label>
                      <label className="radio-item">
                        <input
                          type="radio"
                          className="radio"
                          name="placement"
                          checked={textPlacement === 'center'}
                          onChange={() => setTextPlacement('center')}
                        />
                        <span className="radio-label">Center</span>
                      </label>
                    </div>
                    <div className="radio-group" style={{ marginTop: '0.5rem' }}>
                      <label className="radio-item">
                        <input
                          type="radio"
                          className="radio"
                          name="placement"
                          checked={textPlacement === 'left'}
                          onChange={() => setTextPlacement('left')}
                        />
                        <span className="radio-label">Left</span>
                      </label>
                      <label className="radio-item">
                        <input
                          type="radio"
                          className="radio"
                          name="placement"
                          checked={textPlacement === 'right'}
                          onChange={() => setTextPlacement('right')}
                        />
                        <span className="radio-label">Right</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            className="generate-btn" 
            onClick={generatePoster}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="spinner" />
                Generating...
              </>
            ) : (
              'Generate Poster'
            )}
          </button>
        </div>

        <div className="right-panel">
          <div className="preview-container">
            {isGenerating ? (
              <div className="loading-state">
                <div className="modern-loader">
                  <div className="loader-ring"></div>
                  <div className="loader-ring"></div>
                  <div className="loader-ring"></div>
                </div>
                <div className="loading-text">Generating your poster...</div>
              </div>
            ) : posterData ? (
              <img 
                src={posterData} 
                alt="Map Poster Preview" 
                className="preview-image"
              />
            ) : (
              <div className="preview-placeholder">
                <Map size={64} />
                <div className="preview-text">Map Poster Preview</div>
                <div className="preview-subtext">
                  Enter location details and click Generate
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPosterGenerator;
