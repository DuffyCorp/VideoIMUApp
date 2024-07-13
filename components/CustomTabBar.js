import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const CustomTabBar = (props) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tab} onPress={() => props.navigation.navigate('Calibration')}>
          <Ionicons name="settings-outline" size={30} color="#4F8EF7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.recordButton} onPress={() => props.navigation.navigate('Record')}>
          <Ionicons name="add-circle" size={60} color="#FF6347" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => props.navigation.navigate('PlaybackStack')}>
          <Ionicons name="videocam-outline" size={30} color="#4F8EF7" />
        </TouchableOpacity>
      </View>
      <BottomTabBar {...props} style={{ display: 'none' }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#fff',
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  recordButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
});

export default CustomTabBar;
