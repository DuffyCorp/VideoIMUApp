import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Dimensions, Alert, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { LineChart } from 'react-native-chart-kit';
import MapView, { Marker } from 'react-native-maps';

const screenWidth = Dimensions.get('window').width;

export default function VideoDetailScreen({ route, navigation }) {
  const { videoAssetId, imuUri } = route.params;
  const [imuData, setImuData] = useState([]);
  const [gpsCoordinates, setGpsCoordinates] = useState({ latitude: 0, longitude: 0 });
  const [selectedVideoUri, setSelectedVideoUri] = useState(null);
  const videoRef = useRef(null);
  const [chartDataX, setChartDataX] = useState({ labels: [], datasets: [{ data: [] }] });
  const [chartDataY, setChartDataY] = useState({ labels: [], datasets: [{ data: [] }] });
  const [chartDataZ, setChartDataZ] = useState({ labels: [], datasets: [{ data: [] }] });

  useEffect(() => {
    (async () => {
      try {
        const asset = await MediaLibrary.getAssetInfoAsync(videoAssetId);
        const imuDataJson = await FileSystem.readAsStringAsync(imuUri);
        setImuData(JSON.parse(imuDataJson));
        setSelectedVideoUri(asset.localUri);
        navigation.setOptions({ title: new Date(asset.creationTime).toLocaleString() });
      } catch (error) {
        Alert.alert('Error', 'Unable to read IMU data. ' + error);
      }
    })();
  }, [videoAssetId, imuUri]);

  const updateChartData = currentTime => {
    try {
      const currentImuData = imuData.filter(data => data.timestamp <= currentTime * 1000);
      if (currentImuData.length > 0) {
        const latestData = currentImuData[currentImuData.length - 1];
        setGpsCoordinates({ latitude: latestData.latitude, longitude: latestData.longitude });
      } else {
        setGpsCoordinates({ latitude: 0, longitude: 0 });
      }
      setChartDataX({
        labels: currentImuData.map((_, index) => index.toString()),
        datasets: [{ data: currentImuData.map(data => data.x || 0) }]
      });
      setChartDataY({
        labels: currentImuData.map((_, index) => index.toString()),
        datasets: [{ data: currentImuData.map(data => data.y || 0) }]
      });
      setChartDataZ({
        labels: currentImuData.map((_, index) => index.toString()),
        datasets: [{ data: currentImuData.map(data => data.z || 0) }]
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to load chart ' + error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {selectedVideoUri && (
        <ScrollView>
          <Video
            ref={videoRef}
            source={{ uri: selectedVideoUri }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            shouldPlay
            useNativeControls
            style={styles.video}
            onPlaybackStatusUpdate={status => {
              if (status.isPlaying) {
                updateChartData(status.positionMillis / 1000);
              }
            }}
          />
          <Text style={styles.chartTitle}>X Axis IMU Data</Text>
          {chartDataX.labels.length >= 1 && (
            <LineChart
              data={chartDataX}
              width={screenWidth - 20}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Red color
              }}
              bezier
              style={styles.chart}
            />
          )}
          <Text style={styles.chartTitle}>Y Axis IMU Data</Text>
          {chartDataY.labels.length >= 1 && (
            <LineChart
              data={chartDataY}
              width={screenWidth - 20}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`, // Green color
              }}
              bezier
              style={styles.chart}
            />
          )}
          <Text style={styles.chartTitle}>Z Axis IMU Data</Text>
          {chartDataZ.labels.length >= 1 && (
            <LineChart
              data={chartDataZ}
              width={screenWidth - 20}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // Blue color
              }}
              bezier
              style={styles.chart}
            />
          )}
          <Text style={styles.chartTitle}>Coordinates</Text>
          <View style={styles.gpsContainer}>
            <Text style={styles.gpsText}>Latitude: {gpsCoordinates.latitude}</Text>
            <Text style={styles.gpsText}>Longitude: {gpsCoordinates.longitude}</Text>
          </View>
          <MapView
            style={styles.map}
            region={{
              latitude: gpsCoordinates.latitude,
              longitude: gpsCoordinates.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={gpsCoordinates} />
          </MapView>
        </ScrollView>
      )}
    </View>
  );
}

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  yAxis: {
    min: -5,
    max: 5,
  },
  propsForBackgroundLines: {
    strokeDasharray: "", // solid lines
    stroke: "transparent" // transparent grid lines
  },
  propsForLabels: {
    xAxisLabel: "", // Hide X-axis labels
    xLabelsOffset: -9999, // Hide X-axis labels by moving them off-screen
    labelColor: (opacity = 0) => `transparent`, // Hide X-axis labels
  }
};

const styles = StyleSheet.create({
  video: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 10,
  },
  gpsContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  gpsText: {
    fontSize: 16,
  },
  map: {
    width: screenWidth - 20,
    height: 200,
    marginVertical: 20,
    alignSelf: 'center',
  },
});
