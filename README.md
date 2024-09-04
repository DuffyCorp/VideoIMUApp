
# VIDEO IMU App

This is a simple Expo app built using React Native. Expo simplifies the process of building, running, and testing React Native apps on iOS and Android devices. it is designed to take calibration images, allow users to record video and IMU data at the same time, then to playback, review and share these recordings.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org) (version 14 or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A code editor (e.g., [VSCode](https://code.visualstudio.com/))

## Installation

Follow these steps to install and run the app locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/DuffyCorp/VideoIMUApp.git
   cd your-expo-app
   ```
   
2. **Install dependencies**:
   Inside the project directory, run:
   ```bash
   npm install
   ```

3. **Start the Expo server**:
   Start the development server:
   ```bash
   npm start
   ```

   This will start the Expo development server, and you should see a QR code in your terminal.

4. **Run the app on your device or emulator**:
   - **Expo Go App**: Download the Expo Go app on your iOS or Android device. Open the Expo Go app and scan the QR code in the terminal to load the app on your device.
   - **Emulator**: You can also run the app on an Android or iOS emulator (make sure you have Android Studio or Xcode installed for this).

## Available Scripts

- **`npm start`**: Starts the Expo development server.
- **`npm run android`**: Runs the app on an Android emulator (if set up).
- **`npm run ios`**: Runs the app on an iOS emulator (if set up).
- **`npm run web`**: Runs the app in a web browser.

## Folder Structure

```
📦your-expo-app
 ┣ 📂assets        # Assets like images, fonts
 ┣ 📂components    # Reusable components
 ┣ 📜App.js        # Main app entry file
 ┣ 📜App.js        # Configuration for EAS
 ┣ 📜package.json  # Project dependencies
 ┗ 📜README.md     # Project documentation
```

## Learn More

To learn more about Expo and React Native, check the following resources:

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
