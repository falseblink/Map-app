This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

`npm install`

2. Start the app

`npx expo start`

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory.  
This project uses [file-based routing](https://docs.expo.dev/router/introduction/).

## Get a fresh project

When you're ready, run:

`npm run reset-project`

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

---

## Installation Instructions

1. Make sure **Node.js** (LTS version) is installed.
2. Optionally install Expo CLI globally:

`npm install -g expo-cli`

3. Install project dependencies:

`npm install`

4. Run the development server:

`npx expo start`

5. Scan the QR code in the terminal via **Expo Go** app on your mobile device,  
or start the project via an emulator (Android Studio / Xcode Simulator).

---

## Implementation Decisions

- **TypeScript** is used for static type checking and better maintainability.
- **Expo Router** manages navigation using filesystem-based routing (`index.tsx`, `marker/[id].tsx`).
- **React Context (MarkerProvider)** is introduced for global marker state management.
- Users can **add markers** by long-pressing on the map and **view/edit marker details** on a separate screen.
- **expo-image-picker** is integrated for selecting images from the device gallery.
- Each image supports **delete confirmation dialogs (Alert)** to prevent accidental removals.
- Components are modularized for clarity:
- `Map.tsx` — карта и взаимодействие с маркерами.
- `ImageList.tsx` — список изображений с возможностью удаления.
- `MarkerList.tsx` — список созданных маркеров.
- The app structure follows best practices from Expo’s recommended patterns.

---

## Known Issues / Limitations

- Маркеры и изображения **не сохраняются при перезапуске** (нет интеграции с AsyncStorage / API).
- Уведомления об ошибках (например, при отклонении разрешений камеры/галереи) отображаются.

---

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.