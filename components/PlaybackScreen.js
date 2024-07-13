import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Button,
  Image,
  StyleSheet,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as MailComposer from 'expo-mail-composer';
import { useFocusEffect } from "@react-navigation/native";
import * as VideoThumbnails from "expo-video-thumbnails";

export default function PlaybackScreen({ navigation }) {
  const [metadata, setMetadata] = useState([]);

  const loadMetadata = async () => {
    try {
      const metadataFileUri = FileSystem.documentDirectory + "metadata.json";
      const fileInfo = await FileSystem.getInfoAsync(metadataFileUri);

      if (!fileInfo.exists) {
        Alert.alert("Error", "No metadata found. Record some videos first.");
        return;
      }

      const metadataJson = await FileSystem.readAsStringAsync(metadataFileUri);
      const metadata = JSON.parse(metadataJson);

      for (const item of metadata) {
        if (!item.thumbnailUri) {
          const asset = await MediaLibrary.getAssetInfoAsync(item.videoAssetId);
          console.log(asset)
          const { uri } = await VideoThumbnails.getThumbnailAsync(
            asset.localUri,
            {
              time: 15000, // Generate thumbnail at 15 seconds
            }
          );
          item.thumbnailUri = uri;
          item.duration = formatDuration(asset.duration); // Add duration to metadata
        }
      }

      setMetadata(metadata);

      await FileSystem.writeAsStringAsync(
        metadataFileUri,
        JSON.stringify(metadata)
      );
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Unable to read metadata. " + error);
    }
  };

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useFocusEffect(
    React.useCallback(() => {
      loadMetadata();
    }, [])
  );

  const deleteVideo = async (videoAssetId, imuUri) => {
    try {
      await MediaLibrary.deleteAssetsAsync([videoAssetId]);
      await FileSystem.deleteAsync(imuUri);

      const metadataFileUri = FileSystem.documentDirectory + "metadata.json";
      const metadataJson = await FileSystem.readAsStringAsync(metadataFileUri);
      const parsedMetadata = JSON.parse(metadataJson);

      const updatedMetadata = parsedMetadata.filter(
        (item) => item.videoAssetId !== videoAssetId
      );
      await FileSystem.writeAsStringAsync(
        metadataFileUri,
        JSON.stringify(updatedMetadata)
      );
      setMetadata(updatedMetadata);

      Alert.alert("Deleted", "The video and IMU data have been deleted.");
    } catch (error) {
      Alert.alert("Error", "Unable to delete video and IMU data. " + error);
    }
  };

  const sendEmail = async (videoAssetId, imuUri) => {
    try {
      const asset = await MediaLibrary.getAssetInfoAsync(videoAssetId);
      const videoFileName = asset.filename;
      const newVideoUri = FileSystem.documentDirectory + videoFileName;
      try{
        await FileSystem.deleteAsync(newVideoUri); // Copy the video to the document directory
      } catch (error){
        console.log("No copy of video")
      }
      
      await FileSystem.copyAsync({ from: asset.uri, to: newVideoUri });
      const options = {
        recipients: [],
        subject: "Video and IMU Data",
        body: "Please find the attached video and IMU data.",
        attachments: [newVideoUri, imuUri],
      };
      await MailComposer.composeAsync(options);
      Alert.alert("Success", "Email sent successfully.");
      await FileSystem.deleteAsync(newVideoUri);
    } catch (error) {
      Alert.alert("Error", "Unable to send email. " + error);
    }
  };

  const selectVideo = (videoAssetId, imuUri) => {
    navigation.navigate("VideoDetail", { videoAssetId, imuUri });
  };

  return (
    <View style={styles.container}>
      {metadata.length > 0 ? (
        <FlatList
          data={metadata}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <TouchableOpacity
                onPress={() => selectVideo(item.videoAssetId, item.imuUri)}
                style={styles.thumbnailContainer}
              >
                {item.thumbnailUri && (
                  <>
                    <Image
                      source={{ uri: item.thumbnailUri }}
                      style={styles.thumbnail}
                    />
                    <View style={styles.durationContainer}>
                      <Text style={styles.durationText}>{item.duration}</Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => selectVideo(item.videoAssetId, item.imuUri)}
                style={styles.itemContent}
              >
                <Text style={styles.itemText}>
                  {new Date(item.creationTime).toLocaleString()}
                </Text>
              </TouchableOpacity>
              <View style={styles.buttonContainer}>
                <Button
                  title="Delete"
                  onPress={() => deleteVideo(item.videoAssetId, item.imuUri)}
                  color="#ff6347"
                />
                <Button
                  title="Email"
                  onPress={() => sendEmail(item.videoAssetId, item.imuUri)}
                  color="#4682b4"
                />
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No Videos Recorded!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  thumbnailContainer: {
    position: "relative",
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  durationContainer: {
    position: "absolute",
    bottom: 5,
    left: 5,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  durationText: {
    color: "#fff",
    fontSize: 12,
  },
  itemContent: {
    flex: 1,
    marginLeft: 10,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 18,
    color: "#999",
  },
});
