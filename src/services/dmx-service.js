import { DMX, BufferedBackend } from 'dmx-web-api';

/**
 * DMX Service for managing DMX controller communication
 * Uses Web Serial API via dmx-web-api library
 */
class DMXService {
  constructor() {
    this.dmx = null;
    this.isConnected = false;
    this.currentDevice = null;
  }

  /**
   * Check if Web Serial API is supported
   */
  isSupported() {
    return 'serial' in navigator;
  }

  /**
   * Request and connect to a DMX device
   * This will show the browser's device picker
   */
  async connect() {
    if (!this.isSupported()) {
      throw new Error('Web Serial API no está soportada en este navegador. Usa Chrome o Edge.');
    }

    try {
      // Create DMX instance
      this.dmx = new DMX();
      
      // Connect to device (will show browser picker)
      // Pass null for onTick callback, BufferedBackend, and true to ask for permission
      const connected = await this.dmx.connect(null, BufferedBackend, true);
      
      if (!connected) {
        throw new Error('No se pudo conectar al dispositivo DMX');
      }
      
      this.isConnected = true;
      this.currentDevice = {
        name: 'DMX Controller',
        type: 'ENTTEC'
      };

      console.log('✅ DMX Controller conectado');
      return true;
    } catch (error) {
      console.error('❌ Error conectando DMX:', error);
      this.isConnected = false;
      this.dmx = null;
      
      if (error.name === 'NotFoundError') {
        throw new Error('No se seleccionó ningún dispositivo DMX');
      } else if (error.name === 'SecurityError') {
        throw new Error('Permiso denegado para acceder al dispositivo DMX');
      } else {
        throw new Error(`Error al conectar: ${error.message}`);
      }
    }
  }

  /**
   * Disconnect from the DMX device
   */
  async disconnect() {
    if (this.dmx) {
      try {
        await this.dmx.close();
        console.log('🔌 DMX Controller desconectado');
      } catch (error) {
        console.error('Error desconectando DMX:', error);
      }
    }

    this.dmx = null;
    this.isConnected = false;
    this.currentDevice = null;
  }

  /**
   * Send DMX values to the controller
   * @param {Array<number>} universe - Array of 512 DMX values (0-255)
   */
  async sendUniverse(universe) {
    if (!this.isConnected || !this.dmx) {
      throw new Error('DMX no está conectado');
    }

    if (!Array.isArray(universe) || universe.length !== 512) {
      throw new Error('El universo DMX debe ser un array de 512 valores');
    }

    try {
      // Convert array to object with 1-indexed channels
      const channelMap = {};
      universe.forEach((value, index) => {
        if (value > 0) { // Only send non-zero values for efficiency
          channelMap[index + 1] = value;
        }
      });
      
      await this.dmx.update(channelMap);
      console.log('📡 Valores DMX enviados');
      return true;
    } catch (error) {
      console.error('❌ Error enviando DMX:', error);
      
      // If device was disconnected, update state
      if (error.name === 'NetworkError' || error.message.includes('disconnected')) {
        this.isConnected = false;
        this.dmx = null;
        throw new Error('El dispositivo DMX se ha desconectado');
      }
      
      throw new Error(`Error enviando datos: ${error.message}`);
    }
  }

  /**
   * Send specific channel values
   * @param {Object} channelMap - Object with channel numbers as keys and values (0-255)
   */
  async sendChannels(channelMap) {
    if (!this.isConnected || !this.dmx) {
      throw new Error('DMX no está conectado');
    }

    try {
      // Validate and clamp values
      const validatedMap = {};
      Object.entries(channelMap).forEach(([channel, value]) => {
        const ch = parseInt(channel, 10);
        if (ch >= 1 && ch <= 512) {
          validatedMap[ch] = Math.max(0, Math.min(255, value));
        }
      });

      await this.dmx.update(validatedMap);
      console.log('📡 Valores DMX enviados');
      return true;
    } catch (error) {
      console.error('❌ Error enviando DMX:', error);
      throw new Error(`Error enviando datos: ${error.message}`);
    }
  }

  /**
   * Clear all DMX channels (set to 0)
   */
  async clearAll() {
    if (!this.isConnected || !this.dmx) {
      throw new Error('DMX no está conectado');
    }

    try {
      // Set all channels to 0
      const clearMap = {};
      for (let i = 1; i <= 512; i++) {
        clearMap[i] = 0;
      }
      await this.dmx.update(clearMap);
      console.log('🔌 Todos los canales DMX limpiados');
      return true;
    } catch (error) {
      console.error('❌ Error limpiando DMX:', error);
      throw new Error(`Error limpiando canales: ${error.message}`);
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      device: this.currentDevice,
      isSupported: this.isSupported()
    };
  }
}

// Export singleton instance
export const dmxService = new DMXService();
