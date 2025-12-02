/**
 * Fixture data model
 */
export class Fixture {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.name = data.name || 'Nuevo Foco';
    this.position = data.position || { x: 100, y: 100 };
    this.channels = data.channels || { start: 1, end: 1 };
    this.interface = data.interface || '';
    this.attributes = data.attributes || {};
    this.values = data.values || {};
    this.visualizations = data.visualizations || {};
    
    // Initialize values to 0 for all attributes
    Object.keys(this.attributes).forEach(attr => {
      if (!(attr in this.values)) {
        this.values[attr] = 0;
      }
    });
  }

  /**
   * Update fixture position
   */
  setPosition(x, y) {
    this.position = { x, y };
    return this;
  }

  /**
   * Update attribute value (0-100)
   */
  setValue(attribute, value) {
    if (attribute in this.attributes) {
      this.values[attribute] = Math.max(0, Math.min(100, value));
    }
    return this;
  }

  /**
   * Get attribute value
   */
  getValue(attribute) {
    return this.values[attribute] || 0;
  }

  /**
   * Clone fixture
   */
  clone() {
    return new Fixture({
      ...this,
      id: crypto.randomUUID(),
      position: { ...this.position }
    });
  }

  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      channels: this.channels,
      interface: this.interface,
      attributes: this.attributes,
      values: this.values,
      visualizations: this.visualizations
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json) {
    return new Fixture(json);
  }
}
