# Firebase Setup Instructions

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "Pharmacy Plus"
4. Follow the setup wizard

## Step 2: Add Android App

1. In Firebase Console, click "Add app" and select Android
2. Enter package name: `com.pharmacy.plus`
3. Download `google-services.json`
4. Place it in: `android/app/google-services.json`

### Android Configuration

The following files are already configured:
- `android/build.gradle` - Google services plugin added
- `android/app/build.gradle` - Firebase dependencies added
- `android/app/src/main/AndroidManifest.xml` - Permissions and services configured

## Step 3: Add iOS App (Optional)

1. In Firebase Console, click "Add app" and select iOS
2. Enter bundle ID: `com.pharmacy.plus`
3. Download `GoogleService-Info.plist`
4. Place it in: `ios/Runner/GoogleService-Info.plist`

### iOS Configuration

Add the following to `ios/Runner/Info.plist`:

```xml
<key>FirebaseAppDelegateProxyEnabled</key>
<false/>
```

## Step 4: Enable Firebase Services

### Cloud Messaging (FCM)
1. In Firebase Console, go to "Cloud Messaging"
2. Enable Cloud Messaging API
3. No additional configuration needed - the app will handle token generation

### Analytics (Optional)
1. In Firebase Console, go to "Analytics"
2. Enable Google Analytics
3. Follow the setup wizard

## Step 5: Test Firebase Integration

Run the app and check the console for:
```
🔥 Firebase services initialized successfully
📱 FCM Token: [your-token-here]
```

## Notification Channels

The app creates the following notification channels:

1. **Order Updates** (`order_updates`)
   - High importance
   - For order status changes

2. **Stock Alerts** (`stock_alerts`)
   - Default importance
   - For low stock and expiry warnings

3. **Promotions** (`promotions`)
   - Low importance
   - For promotional offers

## Sending Test Notifications

### From Firebase Console
1. Go to "Cloud Messaging"
2. Click "Send your first message"
3. Enter notification details
4. Select target (test device or topic)
5. Send

### From Backend API

```typescript
// Example: Send notification from Next.js backend
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Send notification
await admin.messaging().send({
  token: userFcmToken,
  notification: {
    title: 'Order Update',
    body: 'Your order #123 has been shipped',
  },
  data: {
    type: 'order_update',
    orderId: '123',
  },
  android: {
    notification: {
      channelId: 'order_updates',
    },
  },
});
```

## Topics for Role-Based Notifications

Subscribe users to topics based on their role:

```dart
// In your app after login
final role = user.role?.name;
if (role != null) {
  await FirebaseService.subscribeToTopic(role.toLowerCase());
}
```

Topics:
- `customer` - All customers
- `staff` - Staff members
- `pharmacist` - Pharmacists
- `admin` - Administrators
- `all` - Everyone

## Troubleshooting

### Android: google-services.json not found
- Ensure the file is in `android/app/google-services.json`
- Run `flutter clean` and rebuild

### iOS: GoogleService-Info.plist not found
- Ensure the file is in `ios/Runner/GoogleService-Info.plist`
- Open Xcode and verify the file is in the project

### Notifications not received
- Check notification permissions are granted
- Verify FCM token is generated
- Check Firebase Console for delivery status
- Ensure notification channels are created (Android)

### Token not generated
- Verify Firebase is initialized before requesting token
- Check internet connection
- Verify Firebase project configuration

## Security Rules

### Firestore (if using)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Storage (if using)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /prescriptions/{userId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Next Steps

1. ✅ Complete Firebase setup
2. ✅ Test notifications
3. ✅ Integrate with backend API
4. ✅ Subscribe users to role-based topics
5. ✅ Implement notification handling in app
6. ✅ Test on physical devices