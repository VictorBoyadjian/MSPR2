const Platform = {
  OS: 'ios',
  select: (obj) => obj.ios ?? obj.default,
  isPad: false,
  isTVOS: false,
  Version: 0,
};

const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => style,
  hairlineWidth: 1,
};

const Dimensions = {
  get: () => ({ width: 390, height: 844, scale: 3, fontScale: 1 }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

const Alert = { alert: jest.fn() };
const Linking = { openURL: jest.fn(), canOpenURL: jest.fn() };
const Keyboard = { dismiss: jest.fn() };

module.exports = {
  Platform,
  StyleSheet,
  Dimensions,
  Alert,
  Linking,
  Keyboard,
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  Pressable: 'Pressable',
  TouchableOpacity: 'TouchableOpacity',
  ActivityIndicator: 'ActivityIndicator',
  ScrollView: 'ScrollView',
  Image: 'Image',
  FlatList: 'FlatList',
  Modal: 'Modal',
  Switch: 'Switch',
  Animated: {
    Value: jest.fn(() => ({ setValue: jest.fn(), _value: 0 })),
    View: 'Animated.View',
    Text: 'Animated.Text',
    timing: jest.fn(() => ({ start: jest.fn() })),
    spring: jest.fn(() => ({ start: jest.fn() })),
    createAnimatedComponent: (c) => c,
  },
};
