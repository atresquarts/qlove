export const DEFAULT_PRESETS = [
  {
    id: 'preset-frontal',
    name: 'FRONTAL',
    fixtureData: {
      name: 'FRONTAL',
      channels: { start: 1, end: 1 },
      interface: 'USB - ENTTEC DMX USB PRO - EN346284, Universe 0',
      attributes: {
        'intensity': 1
      },
      values: {
        'intensity': 0
      }
    }
  },
  {
    id: 'preset-contra',
    name: 'CONTRA',
    fixtureData: {
      name: 'CONTRA',
      channels: { start: 1, end: 5 },
      interface: 'USB - ENTTEC DMX USB PRO - EN346284, Universe 0',
      attributes: {
        'Dimmer': 1,
        'R': 2,
        'G': 3,
        'B': 4,
        'Varios': 5
      },
      values: {
        'Dimmer': 0, 'R': 0, 'G': 0, 'B': 0, 'Varios': 0
      }
    }
  },
  {
    id: 'preset-bichito',
    name: 'BICHITO',
    fixtureData: {
      name: 'BICHITO',
      channels: { start: 1, end: 11 },
      interface: 'USB - ENTTEC DMX USB PRO - EN346284, Universe 0',
      attributes: {
        'Rotación': 1,
        'Inclinación': 2,
        'Rotación fina': 3,
        'Inclinación fina': 4,
        'Velocidad de motor': 5,
        'Colores': 6,
        'Gobos': 7,
        'Dimmer': 8,
        'Strobo': 9,
        'Escenas': 10,
        'Velocidad': 11
      },
      values: {}
    }
  },
  {
    id: 'preset-pc',
    name: 'PC',
    fixtureData: {
      name: 'PC',
      channels: { start: 1, end: 1 },
      interface: 'USB - ENTTEC DMX USB PRO - EN346284, Universe 0',
      attributes: {
        'intensity': 1
      },
      values: {}
    }
  },
  {
    id: 'preset-party',
    name: 'PARTY',
    fixtureData: {
      name: 'PARTY',
      channels: { start: 1, end: 5 },
      interface: 'USB - ENTTEC DMX USB PRO - EN346284, Universe 0',
      attributes: {
        'Red': 1,
        'Green': 2,
        'Blue': 3,
        'Brightness': 4,
        'Music Strobo': 5
      },
      values: {}
    }
  },
  {
    id: 'preset-paret',
    name: 'PARET',
    fixtureData: {
      name: 'PARET',
      channels: { start: 1, end: 5 },
      interface: 'USB - ENTTEC DMX USB PRO - EN346284, Universe 0',
      attributes: {
        'Red': 1,
        'Green': 2,
        'Blue': 3,
        'Brightness': 4,
        'Music Strobo': 5
      },
      values: {}
    }
  },
  {
    id: 'preset-frontal-led',
    name: 'FRONTAL LED',
    fixtureData: {
      name: 'FRONTAL LED',
      channels: { start: 1, end: 8 },
      interface: 'USB - ENTTEC DMX USB PRO - EN346284, Universe 0',
      attributes: {
        'Dimmer': 1,
        'Red': 2,
        'Green': 3,
        'Blue': 4,
        'White': 5,
        'Strobo': 6,
        'Function': 7,
        'Function speed': 8
      },
      values: {}
    }
  },
  {
    id: 'preset-par-mini',
    name: 'PAR MINI',
    fixtureData: {
      name: 'PAR MINI',
      channels: { start: 1, end: 1 },
      interface: 'USB - ENTTEC DMX USB PRO - EN346284, Universe 0',
      attributes: {
        'intensity': 1
      },
      values: {}
    }
  }
];
