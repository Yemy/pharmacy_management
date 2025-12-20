import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class User {
  final int id;
  final String email;
  final String? name;
  final String? phone;
  final Role? role;
  final int? roleId;
  final bool isVerified;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  const User({
    required this.id,
    required this.email,
    this.name,
    this.phone,
    this.role,
    this.roleId,
    required this.isVerified,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
  
  String get displayName => name ?? email.split('@').first;
  
  bool get isAdmin => role?.name == 'ADMIN';
  bool get isPharmacist => role?.name == 'PHARMACIST';
  bool get isStaff => role?.name == 'STAFF';
  bool get isCustomer => role?.name == 'CUSTOMER';
  
  bool get canManageInventory => isAdmin || isPharmacist || isStaff;
  bool get canManageOrders => isAdmin || isPharmacist || isStaff;
  bool get canManageUsers => isAdmin;
  bool get canViewReports => isAdmin || isPharmacist;
  bool get canVerifyPrescriptions => isAdmin || isPharmacist;
  
  User copyWith({
    int? id,
    String? email,
    String? name,
    String? phone,
    Role? role,
    int? roleId,
    bool? isVerified,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      roleId: roleId ?? this.roleId,
      isVerified: isVerified ?? this.isVerified,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

@JsonSerializable()
class Role {
  final int id;
  final String name;
  final String? description;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  const Role({
    required this.id,
    required this.name,
    this.description,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory Role.fromJson(Map<String, dynamic> json) => _$RoleFromJson(json);
  Map<String, dynamic> toJson() => _$RoleToJson(this);
  
  String get displayName {
    switch (name) {
      case 'ADMIN':
        return 'Administrator';
      case 'PHARMACIST':
        return 'Pharmacist';
      case 'STAFF':
        return 'Staff';
      case 'CUSTOMER':
        return 'Customer';
      default:
        return name;
    }
  }
}