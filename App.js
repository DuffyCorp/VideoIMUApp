import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import RecordScreen from './components/RecordScreen';
import PlaybackScreen from './components/PlaybackScreen';
import VideoDetailScreen from './components/VideoDetailScreen';
import CalibrationScreen from './components/CalibrationScreen';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function PlaybackStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Playback" component={PlaybackScreen} />
      <Stack.Screen name="VideoDetail" component={VideoDetailScreen} />
    </Stack.Navigator>
  );
}

function CustomTabBarButton({ children, onPress }) {
  return (
    <TouchableOpacity
      style={{
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
        ...styles.shadow
      }}
      onPress={onPress}
    >
      <View style={{
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#ff0000',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {children}
      </View>
    </TouchableOpacity>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
      initialRouteName='Record'
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Calibration') {
              iconName = focused ? 'camera' : 'camera-outline';
            } else if (route.name === 'Record') {
              iconName = 'ellipse';
            } else if (route.name === 'PlaybackStack') {
              iconName = focused ? 'images' : 'images-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#ff0000',
          tabBarInactiveTintColor: 'gray',
          tabBarShowLabel: false,
          headerShown: false,
        })}
      >
        <Tab.Screen name="Calibration" component={CalibrationScreen} />
        <Tab.Screen
          name="Record"
          component={RecordScreen}
          options={{
            tabBarButton: (props) => (
              <CustomTabBarButton {...props}>
                <Ionicons name="radio-button-on" size={40} color="white" />
              </CustomTabBarButton>
            ),
          }}
        />
        <Tab.Screen name="PlaybackStack" component={PlaybackStack} options={{ title: 'Playback' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#7F5DF0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
});
