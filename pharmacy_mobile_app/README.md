# Pharmacy Plus Mobile App

A comprehensive pharmacy management and e-commerce mobile application built with Flutter that consumes a Next.js backend API.

## Features

### Customer Features
- **User Authentication**: Secure login/register with JWT tokens
- **Medicine Catalog**: Browse medicines with search and filters
- **Shopping Cart**: Add medicines to cart and manage quantities
- **Order Management**: Place orders and track order status
- **Prescription Upload**: Upload and manage prescriptions
- **Profile Management**: Update personal information
- **Order History**: View past orders and reorder

### Staff/Pharmacist Features
- **Dashboard**: View sales, inventory, and key metrics
- **Inventory Management**: Add, update, and track medicine stock
- **Order Processing**: Manage customer orders and update status
- **Prescription Verification**: Verify uploaded prescriptions
- **Low Stock Alerts**: Monitor medicines running low
- **Expiry Tracking**: Track medicines nearing expiration

### Admin Features
- **User Management**: Manage user roles and permissions
- **Medicine Management**: Add, edit, and remove medicines
- **Category Management**: Organize medicines by categories
- **Reports**: Generate sales and inventory reports
- **System Administration**: Full system control

## Technology Stack

- **Framework**: Flutter (latest stable)
- **Language**: Dart (null-safe)
- **Architecture**: Clean Architecture (Presentation, Domain, Data)
- **State Management**: Riverpod
- **Networking**: Dio + Retrofit
- **Authentication**: JWT tokens
- **Local Storage**: Hive + Secure Storage
- **UI**: Material 3 Design
- **Charts**: fl_chart
- **File Handling**: Image Picker
- **Notifications**: Firebase Cloud Messaging

## Project Structure

```
lib/
├── core/
│   ├── config/           # App configuration
│   ├── network/          # API client and networking
│   ├── storage/          # Local storage services
│   ├── theme/            # App theme and styling
│   ├── router/           # Navigation and routing
│   ├── utils/            # Utilities and constants
│   ├── models/           # Core data models
│   └── exceptions/       # Custom exceptions
├── features/
│   ├── auth/             # Authentication
│   ├── home/             # Home screen
│   ├── catalog/          # Medicine catalog
│   ├── cart/             # Shopping cart
│   ├── orders/           # Order management
│   ├── prescriptions/    # Prescription management
│   ├── profile/          # User profile
│   ├── dashboard/        # Admin dashboard
│   ├── inventory/        # Inventory management
│   ├── admin/            # Admin features
│   └── reports/          # Reports and analytics
├── shared/
│   ├── providers/        # Global providers
│   └── widgets/          # Reusable widgets
└── main.dart
```

## Setup Instructions

### Prerequisites

1. **Flutter SDK**: Install Flutter 3.10.0 or later
2. **Dart SDK**: Comes with Flutter
3. **Android Studio/VS Code**: For development
4. **Android SDK**: For Android development
5. **Xcode**: For iOS development (macOS only)
6. **Firebase Project**: For push notifications

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pharmacy_mobile_app
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Generate code**
   ```bash
   flutter packages pub run build_runner build
   ```

4. **Configure Firebase**
   - Create a Firebase project
   - Add Android/iOS apps to the project
   - Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
   - Place them in the appropriate directories:
     - Android: `android/app/google-services.json`
     - iOS: `ios/Runner/GoogleService-Info.plist`

5. **Update API Configuration**
   - Open `lib/core/config/app_config.dart`
   - Update `baseUrl` to point to your Next.js API
   - Update other configuration values as needed

6. **Run the app**
   ```bash
   # For development
   flutter run
   
   # For specific platform
   flutter run -d android
   flutter run -d ios
   ```

### Build for Production

#### Android
```bash
# Build APK
flutter build apk --release

# Build App Bundle (recommended for Play Store)
flutter build appbundle --release
```

#### iOS
```bash
# Build for iOS
flutter build ios --release
```

## API Integration

The app is designed to work with the Next.js pharmacy backend. Ensure your backend API includes the following endpoints:

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh`
- `GET /api/auth/profile`

### Medicines
- `GET /api/medicines`
- `GET /api/medicines/:id`
- `POST /api/medicines` (Admin)
- `PUT /api/medicines/:id` (Admin)

### Orders
- `GET /api/orders`
- `POST /api/orders`
- `PUT /api/orders/:id/status` (Staff)

### Prescriptions
- `GET /api/prescriptions`
- `POST /api/prescriptions` (with file upload)
- `PUT /api/prescriptions/:id/verify` (Pharmacist)

### Inventory
- `GET /api/inventory`
- `POST /api/inventory` (Staff)
- `PUT /api/inventory/:id` (Staff)

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
API_BASE_URL=http://localhost:3000/api
FIREBASE_PROJECT_ID=your-firebase-project-id
```

### App Configuration

Update `lib/core/config/app_config.dart`:

```dart
class AppConfig {
  static const String baseUrl = 'https://your-api-domain.com/api';
  static const bool isDevelopment = false; // Set to false for production
  // ... other configurations
}
```

## User Roles and Permissions

The app supports four user roles:

1. **Customer**: Browse medicines, place orders, upload prescriptions
2. **Staff**: Manage inventory, process orders
3. **Pharmacist**: All staff permissions + verify prescriptions, view reports
4. **Admin**: Full system access, user management, system configuration

## Features Implementation Status

### ✅ Completed
- [x] Project structure and architecture
- [x] Authentication system
- [x] Navigation and routing
- [x] User role management
- [x] Basic UI components
- [x] Theme and styling

### 🚧 In Progress
- [ ] Medicine catalog with search/filters
- [ ] Shopping cart functionality
- [ ] Order management system
- [ ] Prescription upload and verification
- [ ] Inventory management
- [ ] Dashboard with analytics
- [ ] Push notifications
- [ ] Reports generation

### 📋 Planned
- [ ] Offline support
- [ ] Payment integration
- [ ] Barcode scanning
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced search filters
- [ ] Wishlist functionality
- [ ] Order tracking
- [ ] Medicine reminders

## Testing

```bash
# Run unit tests
flutter test

# Run integration tests
flutter test integration_test/

# Run tests with coverage
flutter test --coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Changelog

### Version 1.0.0
- Initial release
- Basic authentication and navigation
- User role management
- Core UI components
- API integration setup