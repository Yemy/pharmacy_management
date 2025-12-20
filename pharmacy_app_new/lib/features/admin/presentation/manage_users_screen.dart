import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ManageUsersScreen extends ConsumerWidget {
  const ManageUsersScreen({Key? key}) : super(key: key);
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Users'),
      ),
      body: const Center(
        child: Text('Manage Users Screen - Coming Soon'),
      ),
    );
  }
}