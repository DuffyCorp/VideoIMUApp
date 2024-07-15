import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, Button } from "react-native";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { Gyroscope, Accelerometer } from "expo-sensors";
import * as Location from "expo-location";
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

export default function RecordScreen({ navigation }) {
  const [facing, setFacing] = useState("back");
  const [proccessing, setProccessing] = useState(false);
  const [torch, setTorch] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [audioPermission, requestAudioPermission] = useMicrophonePermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();
  const [recording, setRecording] = useState(false);
  const [imuData, setImuData] = useState([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const cameraRef = useRef(null);
  const videoAssetRef = useRef(null);
  const gyroSubscription = useRef(null);
  const accelSubscription = useRef(null);
  const imuDataRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      await MediaLibrary.requestPermissionsAsync();
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

  useEffect(() => {
    const toggleCameraFacing = () => {
      setFacing((current) => (current === "back" ? "front" : "back"));
    };

    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={toggleCameraFacing} style={{ marginRight: 10 }}>
          <Ionicons name="camera-reverse-outline" size={30} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const startRecording = async () => {
    if (cameraRef.current && mediaPermission.granted && audioPermission.granted && permission.granted && locationPermission.granted) {
      setRecording(true);
      setRecordingDuration(0);
      imuDataRef.current = [];  // Clear previous IMU data
      const startTime = new Date().getTime();

      Gyroscope.setUpdateInterval(100);
      Accelerometer.setUpdateInterval(100);

      const imuListener = async (data, sensorType) => {
        const currentTime = new Date();
        const timestamp = new Date().getTime() - startTime;
        const formattedTime = formatTime(currentTime);
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const imuDataEntry = {
          ...data,
          latitude,
          longitude,
          timestamp,
          time: formattedTime,
          sensorType
        };

        //console.log(imuDataEntry);
        imuDataRef.current.push(imuDataEntry);
      };

      gyroSubscription.current = Gyroscope.addListener((data) => imuListener(data, 'gyro'));
      accelSubscription.current = Accelerometer.addListener((data) => imuListener(data, 'accel'));

      try {
        const video = await cameraRef.current.recordAsync();
        const videoUri = video.uri;
        const videoAsset = await MediaLibrary.createAssetAsync(videoUri);
        const imuFileUri = FileSystem.documentDirectory + `${videoAsset.filename}-imuData.json`;
        await FileSystem.writeAsStringAsync(imuFileUri, "");

        // Save metadata
        const metadata = {
          videoAssetId: videoAsset.id,
          imuUri: imuFileUri,
          creationTime: videoAsset.creationTime
        };

        videoAssetRef.current = videoAsset.filename


        const metadataFileUri = FileSystem.documentDirectory + 'metadata.json';
        let existingMetadata = [];
        try {
          const metadataJson = await FileSystem.readAsStringAsync(metadataFileUri);
          existingMetadata = JSON.parse(metadataJson);
        } catch (e) {
          console.log('No existing metadata found, creating new.');
        }
        existingMetadata.push(metadata);
        await FileSystem.writeAsStringAsync(metadataFileUri, JSON.stringify(existingMetadata));
      } finally {
        
        Gyroscope.removeAllListeners();
        Accelerometer.removeAllListeners();
        
        await new Promise(resolve => setTimeout(resolve, 10000));

        const imuFileUri = FileSystem.documentDirectory + `${videoAssetRef.current}-imuData.json`;

        setRecording(false);

        setProccessing(true)
        await FileSystem.writeAsStringAsync(imuFileUri, JSON.stringify(imuDataRef.current));
        
        gyroSubscription.current = null;
        accelSubscription.current = null;
        

        //console.log("IMU Data:", imuDataRef.current);  // Debugging line

        setImuData(imuDataRef.current);  // Update the state with the current IMU data
        clearInterval(timerRef.current);
        videoAssetRef.current = null
        setProccessing(false)
        Alert.alert("Recording Stopped", "The video and IMU data have been saved.");
      }
    } else {
      console.log("No Camera Ref or necessary permissions not granted");
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current) {
      await cameraRef.current.stopRecording();
      Gyroscope.removeAllListeners();
      Accelerometer.removeAllListeners();
      gyroSubscription.current = null;
      accelSubscription.current = null;
      setRecording(false);
      setImuData(imuDataRef.current);  // Update the state with the current IMU data
      clearInterval(timerRef.current);
    }
  };

  if (!permission || !mediaPermission || !audioPermission || !locationPermission) {
    return <View />;
  }

  if (!permission.granted || !mediaPermission.granted || !audioPermission.granted || !locationPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera, record audio, save photos, and access location data
        </Text>
        <Button onPress={requestPermission} title="Grant Camera Permission" />
        <Button onPress={requestAudioPermission} title="Grant Microphone Permission" />
        <Button onPress={requestMediaPermission} title="Grant Media Library Permission" />
        <Button onPress={requestLocationPermission} title="Grant Location Permission" />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const startRecordingTimer = () => {
    setRecordingDuration(0);
    timerRef.current = setInterval(() => {
      setRecordingDuration(prevDuration => prevDuration + 1);
    }, 1000);
  };

  const handleRecordingPress = async () => {
    if (recording) {
      await stopRecording();
    } else {
      startRecordingTimer();
      await startRecording();
    }
  };

  const toggleTorch = () => {
    setTorch(!torch);
  };

  const formatDuration = (duration) => {
    const minutes = String(Math.floor(duration / 60)).padStart(2, '0');
    const seconds = String(duration % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} mode="video" enableTorch={torch}>
        <View style={styles.headerIconsContainer}>
          <SafeAreaView style={{ flexDirection: "row", justifyContent: "space-between", width: '100%' }}>
            <TouchableOpacity onPress={toggleTorch} style={{ marginLeft: 10 }}>
              <Ionicons name={torch === false ? "flash-off" : "flash"} size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleCameraFacing} style={{ marginRight: 10 }}>
              <Ionicons name="camera-reverse-outline" size={30} color="white" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>
        <View style={styles.timerContainer}>
          {recording && (
            <>
              <Ionicons name="time-outline" size={50} color="red" />
              <Text style={styles.timerText}>{formatDuration(recordingDuration)}</Text>
            </>
          )}
        </View>
        <View style={styles.buttonContainer}>
          {proccessing ? <Text>Proccessing data...</Text>:<TouchableOpacity style={styles.recordButton} onPress={handleRecordingPress}>
            <Ionicons name={recording ? "stop-circle-outline" : "radio-button-on"} size={80} color="red" />
          </TouchableOpacity>}
          {recording && (
            <View style={styles.imuIndicatorContainer}>
              <Ionicons name="checkmark-circle-outline" size={30} color="green" />
              <Text style={styles.imuIndicatorText}>IMU Recording</Text>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  camera: {
    flex: 1,
  },
  headerIconsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    margin: 10,
  },
  timerContainer: {
    position: "absolute",
    top: 50,
    left: 50,
    flexDirection: "row",
    alignItems: "center",
  },
  timerText: {
    color: "red",
    fontSize: 24,
    marginLeft: 10,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  recordButton: {
    alignItems: "center",
  },
  imuIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  imuIndicatorText: {
    color: "green",
    fontSize: 18,
    marginLeft: 10,
  },
});
