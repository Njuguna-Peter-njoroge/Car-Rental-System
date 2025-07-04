export enum Permission {
    // User Management
    CREATE_USER = 'create_user',
    READ_USER = 'read_user',
    UPDATE_USER = 'update_user',
    DELETE_USER = 'delete_user',
    LIST_USERS = 'list_users',
    
    // Vehicle Management
    CREATE_VEHICLE = 'create_vehicle',
    READ_VEHICLE = 'read_vehicle',
    UPDATE_VEHICLE = 'update_vehicle',
    DELETE_VEHICLE = 'delete_vehicle',
    LIST_VEHICLES = 'list_vehicles',
    MANAGE_VEHICLE_AVAILABILITY = 'manage_vehicle_availability',
    
    // Booking Management
    CREATE_BOOKING = 'create_booking',
    READ_BOOKING = 'read_booking',
    UPDATE_BOOKING = 'update_booking',
    DELETE_BOOKING = 'delete_booking',
    LIST_BOOKINGS = 'list_bookings',
    APPROVE_BOOKING = 'approve_booking',
    REJECT_BOOKING = 'reject_booking',
    CANCEL_BOOKING = 'cancel_booking',
    
    // Payment Management
    CREATE_PAYMENT = 'create_payment',
    READ_PAYMENT = 'read_payment',
    UPDATE_PAYMENT = 'update_payment',
    LIST_PAYMENTS = 'list_payments',
    PROCESS_REFUND = 'process_refund',
    
    // Review Management
    CREATE_REVIEW = 'create_review',
    READ_REVIEW = 'read_review',
    UPDATE_REVIEW = 'update_review',
    DELETE_REVIEW = 'delete_review',
    LIST_REVIEWS = 'list_reviews',
    MODERATE_REVIEW = 'moderate_review',
    
    // System Management
    VIEW_DASHBOARD = 'view_dashboard',
    MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',
    VIEW_ANALYTICS = 'view_analytics',
    MANAGE_COUPONS = 'manage_coupons',
    
    // Location Management
    CREATE_LOCATION = 'create_location',
    READ_LOCATION = 'read_location',
    UPDATE_LOCATION = 'update_location',
    DELETE_LOCATION = 'delete_location',
    LIST_LOCATIONS = 'list_locations',
}

export const RolePermissions = {
    ADMIN: [
        Permission.CREATE_USER,
        Permission.READ_USER,
        Permission.UPDATE_USER,
        Permission.DELETE_USER,
        Permission.LIST_USERS,
        Permission.CREATE_VEHICLE,
        Permission.READ_VEHICLE,
        Permission.UPDATE_VEHICLE,
        Permission.DELETE_VEHICLE,
        Permission.LIST_VEHICLES,
        Permission.MANAGE_VEHICLE_AVAILABILITY,
        Permission.CREATE_BOOKING,
        Permission.READ_BOOKING,
        Permission.UPDATE_BOOKING,
        Permission.DELETE_BOOKING,
        Permission.LIST_BOOKINGS,
        Permission.APPROVE_BOOKING,
        Permission.REJECT_BOOKING,
        Permission.CANCEL_BOOKING,
        Permission.CREATE_PAYMENT,
        Permission.READ_PAYMENT,
        Permission.UPDATE_PAYMENT,
        Permission.LIST_PAYMENTS,
        Permission.PROCESS_REFUND,
        Permission.CREATE_REVIEW,
        Permission.READ_REVIEW,
        Permission.UPDATE_REVIEW,
        Permission.DELETE_REVIEW,
        Permission.LIST_REVIEWS,
        Permission.MODERATE_REVIEW,
        Permission.VIEW_DASHBOARD,
        Permission.MANAGE_SYSTEM_SETTINGS,
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_COUPONS,
        Permission.CREATE_LOCATION,
        Permission.READ_LOCATION,
        Permission.UPDATE_LOCATION,
        Permission.DELETE_LOCATION,
        Permission.LIST_LOCATIONS,
    ],
    AGENT: [
        Permission.READ_USER,
        Permission.LIST_USERS,
        Permission.CREATE_VEHICLE,
        Permission.READ_VEHICLE,
        Permission.UPDATE_VEHICLE,
        Permission.LIST_VEHICLES,
        Permission.MANAGE_VEHICLE_AVAILABILITY,
        Permission.CREATE_BOOKING,
        Permission.READ_BOOKING,
        Permission.UPDATE_BOOKING,
        Permission.LIST_BOOKINGS,
        Permission.APPROVE_BOOKING,
        Permission.REJECT_BOOKING,
        Permission.CANCEL_BOOKING,
        Permission.READ_PAYMENT,
        Permission.LIST_PAYMENTS,
        Permission.PROCESS_REFUND,
        Permission.READ_REVIEW,
        Permission.LIST_REVIEWS,
        Permission.MODERATE_REVIEW,
        Permission.VIEW_DASHBOARD,
        Permission.READ_LOCATION,
        Permission.LIST_LOCATIONS,
    ],
    CUSTOMER: [
        Permission.READ_USER,
        Permission.UPDATE_USER,
        Permission.CREATE_BOOKING,
        Permission.READ_BOOKING,
        Permission.LIST_BOOKINGS,
        Permission.CANCEL_BOOKING,
        Permission.CREATE_PAYMENT,
        Permission.READ_PAYMENT,
        Permission.LIST_PAYMENTS,
        Permission.CREATE_REVIEW,
        Permission.READ_REVIEW,
        Permission.UPDATE_REVIEW,
        Permission.LIST_REVIEWS,
        Permission.READ_VEHICLE,
        Permission.LIST_VEHICLES,
        Permission.READ_LOCATION,
        Permission.LIST_LOCATIONS,
    ],
};
