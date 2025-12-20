import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';

class MainNavigation extends ConsumerWidget {
  final Widget child;
  
  const MainNavigation({
    Key? key,
    required this.child,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    
    return Scaffold(
      body: child,
      bottomNavigationBar: _buildBottomNavigation(context, user),
    );
  }
  
  Widget _buildBottomNavigation(BuildContext context, user) {
    final currentLocation = GoRouter.of(context).routerDelegate.currentConfiguration.uri.toString();
    
    // Customer navigation items
    final customerItems = [
      _NavItem(
        icon: Icons.home,
        label: 'Home',
        route: '/home',
      ),
      _NavItem(
        icon: Icons.medication,
        label: 'Catalog',
        route: '/catalog',
      ),
      _NavItem(
        icon: Icons.shopping_cart,
        label: 'Cart',
        route: '/cart',
      ),
      _NavItem(
        icon: Icons.receipt_long,
        label: 'Orders',
        route: '/orders',
      ),
      _NavItem(
        icon: Icons.person,
        label: 'Profile',
        route: '/profile',
      ),
    ];
    
    // Staff/Admin navigation items
    final staffItems = [
      _NavItem(
        icon: Icons.dashboard,
        label: 'Dashboard',
        route: '/admin/dashboard',
      ),
      _NavItem(
        icon: Icons.qr_code_scanner,
        label: 'POS',
        route: '/admin/pos',
      ),
      _NavItem(
        icon: Icons.medication,
        label: 'Medicines',
        route: '/admin/medicines',
      ),
      _NavItem(
        icon: Icons.inventory,
        label: 'Inventory',
        route: '/admin/inventory',
      ),
      _NavItem(
        icon: Icons.receipt_long,
        label: 'Orders',
        route: '/admin/orders',
      ),
    ];
    
    // Choose navigation items based on user role
    final items = (user?.canViewReports == true) ? staffItems : customerItems;
    
    final currentIndex = items.indexWhere((item) => 
      currentLocation.startsWith(item.route));
    
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      currentIndex: currentIndex >= 0 ? currentIndex : 0,
      onTap: (index) {
        if (index < items.length) {
          context.go(items[index].route);
        }
      },
      items: items.map((item) => BottomNavigationBarItem(
        icon: Icon(item.icon),
        label: item.label,
      )).toList(),
    );
  }
}

class _NavItem {
  final IconData icon;
  final String label;
  final String route;
  
  _NavItem({
    required this.icon,
    required this.label,
    required this.route,
  });
}