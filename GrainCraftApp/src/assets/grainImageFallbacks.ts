import { ImageSourcePropType } from 'react-native';

/** Bundled product photos used whenever a remote image is unavailable. */
const grainImageFallbacks: Record<string, ImageSourcePropType> = {
  'w-mp-sharbati': require('./images/w-mp-sharbati.jpg'),
  'w-mp-lokwan': require('./images/w-mp-lokwan.jpg'),
  'w-punjab': require('./images/w-punjab.jpg'),
  'w-rajasthan': require('./images/w-rajasthan.jpg'),
  'w-up': require('./images/w-up.jpg'),
  g3: require('./images/g3.jpg'),
  g4: require('./images/g4.jpg'),
  g5: require('./images/g5.jpg'),
  g6: require('./images/g6.jpg'),
  g7: require('./images/g7.png'),
  g8: require('./images/g8.jpg'),
  g9: require('./images/g9.jpg'),
  g10: require('./images/g10.jpg'),
  g11: require('./images/g11.jpg'),
  g12: require('./images/g12.jpg'),
};

export default grainImageFallbacks;
