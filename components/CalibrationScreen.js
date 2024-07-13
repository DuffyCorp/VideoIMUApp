import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Button, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from '@expo/vector-icons';  // Import Ionicons for the camera flip icon

export default function CalibrationScreen({ navigation }) {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [calibrationData, setCalibrationData] = useState(null);
  const [calibrating, setCalibrating] = useState(false);
  const [photosTaken, setPhotosTaken] = useState(0);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      await MediaLibrary.requestPermissionsAsync();
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

  const startCalibration = async () => {
    if (cameraRef.current && mediaPermission.granted) {
      setCalibrating(true);
      const albumName = `Calibration Images - ${new Date().toLocaleString()}`;
      let album = await MediaLibrary.getAlbumAsync(albumName);
      if (!album) {
        album = await MediaLibrary.createAlbumAsync(albumName);
      }

      for (let i = 0; i < 30; i++) {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 1, // Highest quality
          exif: false, // Exclude EXIF data
        });

        setPhotosTaken(i + 1);

        // Save the image to the camera roll
        const asset = await MediaLibrary.createAssetAsync(photo.uri);
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);

        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds between captures
      }

      setCalibrating(false);  // Set calibrating to false after all photos are taken
      Alert.alert("Calibration Complete", `All photos have been saved to the album: ${albumName}`);
    } else {
      console.log("No Camera Ref");
    }
  };

  if (!permission || !mediaPermission) {
    return <View />;
  }

  if (!permission.granted || !mediaPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera and save photos
        </Text>
        <Button onPress={requestPermission} title="Grant Camera Permission" />
        <Button onPress={requestMediaPermission} title="Grant Media Library Permission" />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  return (
    <View style={styles.container}>
      {calibrationData ? (
        <View style={styles.calibrationData}>
          <Text>Calibration Data:</Text>
          <Text>{JSON.stringify(calibrationData, null, 2)}</Text>
        </View>
      ) : (
        <CameraView ref={cameraRef} style={styles.camera} facing={facing} mode="picture">
          <View style={styles.headerIconsContainer}>
            <SafeAreaView>
              <TouchableOpacity onPress={toggleCameraFacing}>
                <Ionicons name="camera-reverse-outline" size={30} color="white" />
              </TouchableOpacity>
            </SafeAreaView>
          </View>
          {calibrating ? (
            <View style={styles.buttonContainer}>
              <ActivityIndicator size="large" color="#ff0000" />
              <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Taking pictures: {photosTaken} / 30</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={startCalibration}>
                <Text style={styles.text}>Start Calibration</Text>
              </TouchableOpacity>
            </View>
          )}
        </CameraView>
      )}
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
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
    padding: 10,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  calibrationData: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
  },
  calibrationDataContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    textAlign: "center",
    alignItems: "center",
  },
});
