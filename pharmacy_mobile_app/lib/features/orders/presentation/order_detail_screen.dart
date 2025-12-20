import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class OrderDetailScreen extends ConsumerWidget {
  final int orderId;
  
  const OrderDetailScreen({
    Key? key,
    required this.orderId,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Order #$orderId'),
      ),
      body: Center(
        child: Text('Order Detail Screen for Order #$orderId'),
      ),
    );
  }
}