/**
 * Utility functions for converting fixture data to DMX values
 */

/**
 * Convert 0-100 value to 0-255 DMX value
 */
export function valueToDMX(value) {
  return Math.round(Math.max(0, Math.min(100, value)) * 2.55);
}

/**
 * Convert 0-255 DMX value to 0-100 value
 */
export function dmxToValue(dmxValue) {
  return Math.round(Math.max(0, Math.min(255, dmxValue)) / 2.55);
}

/**
 * Create DMX channel map from fixtures
 * Returns an object with channel numbers as keys and DMX values (0-255) as values
 */
export function createDMXChannelMap(fixtures) {
  const channelMap = {};

  fixtures.forEach(fixture => {
    // For each attribute in the fixture
    Object.entries(fixture.attributes).forEach(([attributeName, channelNumber]) => {
      // Get the current value (0-100)
      const value = fixture.values[attributeName] || 0;
      
      // Convert to DMX (0-255)
      const dmxValue = valueToDMX(value);
      
      // Assign to the channel
      channelMap[channelNumber] = dmxValue;
    });
  });

  return channelMap;
}

/**
 * Create a full DMX universe array (512 channels)
 * Fills unused channels with 0
 */
export function createDMXUniverse(fixtures) {
  const universe = new Array(512).fill(0);
  const channelMap = createDMXChannelMap(fixtures);

  Object.entries(channelMap).forEach(([channel, value]) => {
    const channelIndex = parseInt(channel, 10) - 1; // DMX channels are 1-indexed
    if (channelIndex >= 0 && channelIndex < 512) {
      universe[channelIndex] = value;
    }
  });

  return universe;
}

/**
 * Validate that fixtures don't have overlapping channels
 */
export function validateChannelConflicts(fixtures) {
  const usedChannels = new Set();
  const conflicts = [];

  fixtures.forEach(fixture => {
    Object.entries(fixture.attributes).forEach(([attributeName, channelNumber]) => {
      if (usedChannels.has(channelNumber)) {
        conflicts.push({
          channel: channelNumber,
          fixture: fixture.name,
          attribute: attributeName
        });
      } else {
        usedChannels.add(channelNumber);
      }
    });
  });

  return {
    hasConflicts: conflicts.length > 0,
    conflicts
  };
}

/**
 * Get channel range info for a fixture
 */
export function getFixtureChannelInfo(fixture) {
  const channels = Object.values(fixture.attributes);
  
  if (channels.length === 0) {
    return {
      min: 0,
      max: 0,
      count: 0
    };
  }

  return {
    min: Math.min(...channels),
    max: Math.max(...channels),
    count: channels.length
  };
}
