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
  
  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json['id'] as int,
    email: json['email'] as String,
    name: json['name'] as String?,
    phone: json['phone'] as String?,
    role: json['role'] != null ? Role.fromJson(json['role'] as Map<String, dynamic>) : null,
    roleId: json['roleId'] as int?,
    isVerified: json['isVerified'] as bool? ?? false,
    createdAt: DateTime.parse(json['createdAt'] as String),
    updatedAt: DateTime.parse(json['updatedAt'] as String),
  );
  
  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    if (name != null) 'name': name,
    if (phone != null) 'phone': phone,
    if (role != null) 'role': role!.toJson(),
    if (roleId != null) 'roleId': roleId,
    'isVerified': isVerified,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };
  
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
  
  factory Role.fromJson(Map<String, dynamic> json) => Role(
    id: json['id'] as int,
    name: json['name'] as String,
    description: json['description'] as String?,
    createdAt: DateTime.parse(json['createdAt'] as String),
    updatedAt: DateTime.parse(json['updatedAt'] as String),
  );
  
  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    if (description != null) 'description': description,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };
  
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