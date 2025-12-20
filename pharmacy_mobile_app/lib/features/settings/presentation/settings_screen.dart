import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../shared/providers/theme_provider.dart';
import '../../../shared/providers/auth_provider.dart';
import '../../../core/utils/app_constants.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({Key? key}) : super(key: key);
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeState = ref.watch(themeProvider);
    final user = ref.watch(currentUserProvider);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Appearance Section
            _buildSectionHeader(context, 'Appearance'),
            SizedBox(height: 8.h),
            
            _buildSettingsTile(
              context,
              'Theme',
              _getThemeDescription(themeState.themeMode),
              Icons.palette_outlined,
              onTap: () => _showThemeDialog(context, ref),
            ),
            
            SizedBox(height: 24.h),
            
            // Notifications Section
            _buildSectionHeader(context, 'Notifications'),
            SizedBox(height: 8.h),
            
            _buildSwitchTile(
              context,
              'Order Updates',
              'Get notified about order status changes',
              Icons.shopping_bag_outlined,
              true, // TODO: Connect to actual setting
              (value) {
                // TODO: Update notification preference
              },
            ),
            
            _buildSwitchTile(
              context,
              'Stock Alerts',
              'Receive low stock and expiry notifications',
              Icons.inventory_outlined,
              user?.canManageInventory ?? false,
              (value) {
                // TODO: Update notification preference
              },
              enabled: user?.canManageInventory ?? false,
            ),
            
            _buildSwitchTile(
              context,
              'Promotions',
              'Get notified about special offers',
              Icons.local_offer_outlined,
              true, // TODO: Connect to actual setting
              (value) {
                // TODO: Update notification preference
              },
            ),
            
            SizedBox(height: 24.h),
            
            // Account Section
            _buildSectionHeader(context, 'Account'),
            SizedBox(height: 8.h),
            
            _buildSettingsTile(
              context,
              'Profile',
              'Manage your personal information',
              Icons.person_outline,
              onTap: () {
                // TODO: Navigate to profile
              },
            ),
            
            _buildSettingsTile(
              context,
              'Privacy',
              'Privacy settings and data management',
              Icons.privacy_tip_outlined,
              onTap: () {
                // TODO: Navigate to privacy settings
              },
            ),
            
            _buildSettingsTile(
              context,
              'Security',
              'Password and security settings',
              Icons.security_outlined,
              onTap: () {
                // TODO: Navigate to security settings
              },
            ),
            
            SizedBox(height: 24.h),
            
            // Support Section
            _buildSectionHeader(context, 'Support'),
            SizedBox(height: 8.h),
            
            _buildSettingsTile(
              context,
              'Help Center',
              'Get help and support',
              Icons.help_outline,
              onTap: () {
                // TODO: Navigate to help center
              },
            ),
            
            _buildSettingsTile(
              context,
              'Contact Us',
              'Get in touch with our team',
              Icons.contact_support_outlined,
              onTap: () {
                // TODO: Navigate to contact
              },
            ),
            
            _buildSettingsTile(
              context,
              'About',
              'App version and information',
              Icons.info_outline,
              onTap: () => _showAboutDialog(context),
            ),
            
            SizedBox(height: 32.h),
            
            // Logout Button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => _showLogoutDialog(context, ref),
                icon: const Icon(Icons.logout, color: Colors.red),
                label: const Text(
                  'Logout',
                  style: TextStyle(color: Colors.red),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.red),
                  padding: EdgeInsets.symmetric(vertical: 16.h),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildSectionHeader(BuildContext context, String title) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
        fontWeight: FontWeight.bold,
        color: Theme.of(context).primaryColor,
      ),
    );
  }
  
  Widget _buildSettingsTile(
    BuildContext context,
    String title,
    String subtitle,
    IconData icon, {
    VoidCallback? onTap,
  }) {
    return Card(
      margin: EdgeInsets.only(bottom: 8.h),
      child: ListTile(
        leading: Icon(icon, color: Theme.of(context).primaryColor),
        title: Text(title),
        subtitle: Text(
          subtitle,
          style: Theme.of(context).textTheme.bodySmall,
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
  
  Widget _buildSwitchTile(
    BuildContext context,
    String title,
    String subtitle,
    IconData icon,
    bool value,
    ValueChanged<bool> onChanged, {
    bool enabled = true,
  }) {
    return Card(
      margin: EdgeInsets.only(bottom: 8.h),
      child: SwitchListTile(
        secondary: Icon(
          icon, 
          color: enabled 
            ? Theme.of(context).primaryColor 
            : Colors.grey,
        ),
        title: Text(
          title,
          style: TextStyle(
            color: enabled ? null : Colors.grey,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: enabled ? null : Colors.grey,
          ),
        ),
        value: value,
        onChanged: enabled ? onChanged : null,
        activeColor: Theme.of(context).primaryColor,
      ),
    );
  }
  
  String _getThemeDescription(AppThemeMode themeMode) {
    switch (themeMode) {
      case AppThemeMode.light:
        return 'Light mode';
      case AppThemeMode.dark:
        return 'Dark mode';
      case AppThemeMode.system:
        return 'Follow system setting';
    }
  }
  
  void _showThemeDialog(BuildContext context, WidgetRef ref) {
    final currentTheme = ref.read(themeProvider).themeMode;
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Choose Theme'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildThemeOption(
              context,
              ref,
              'Light',
              'Always use light theme',
              Icons.light_mode,
              AppThemeMode.light,
              currentTheme,
            ),
            _buildThemeOption(
              context,
              ref,
              'Dark',
              'Always use dark theme',
              Icons.dark_mode,
              AppThemeMode.dark,
              currentTheme,
            ),
            _buildThemeOption(
              context,
              ref,
              'System',
              'Follow system setting',
              Icons.settings_system_daydream,
              AppThemeMode.system,
              currentTheme,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }
  
  Widget _buildThemeOption(
    BuildContext context,
    WidgetRef ref,
    String title,
    String subtitle,
    IconData icon,
    AppThemeMode themeMode,
    AppThemeMode currentTheme,
  ) {
    final isSelected = themeMode == currentTheme;
    
    return ListTile(
      leading: Icon(
        icon,
        color: isSelected ? Theme.of(context).primaryColor : null,
      ),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: isSelected ? FontWeight.bold : null,
          color: isSelected ? Theme.of(context).primaryColor : null,
        ),
      ),
      subtitle: Text(subtitle),
      trailing: isSelected 
        ? Icon(Icons.check, color: Theme.of(context).primaryColor)
        : null,
      onTap: () {
        ref.read(themeProvider.notifier).setThemeMode(themeMode);
        Navigator.of(context).pop();
      },
    );
  }
  
  void _showAboutDialog(BuildContext context) {
    showAboutDialog(
      context: context,
      applicationName: AppConstants.appName,
      applicationVersion: '1.0.0',
      applicationIcon: Container(
        width: 64.w,
        height: 64.w,
        decoration: BoxDecoration(
          color: Theme.of(context).primaryColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16.r),
        ),
        child: Icon(
          Icons.local_pharmacy,
          size: 32.sp,
          color: Theme.of(context).primaryColor,
        ),
      ),
      children: [
        const Text('Your trusted partner for all healthcare needs.'),
        SizedBox(height: 16.h),
        const Text('© 2024 Pharmacy Plus. All rights reserved.'),
      ],
    );
  }
  
  void _showLogoutDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              ref.read(authProvider.notifier).logout();
            },
            style: TextButton.styleFrom(
              foregroundColor: Colors.red,
            ),
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }
}