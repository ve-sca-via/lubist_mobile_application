/**
 * GENERATED FILE - DO NOT EDIT.
 * Source: backend openapi/openapi.json. Regenerate with `npm run api:types`.
 * Use the helpers in src/services/api/types.ts rather than importing this directly.
 */

export interface paths {
    "/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Root
         * @description Root endpoint. Returns basic API information.
         */
        get: operations["root__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/bookings/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get All Bookings Admin
         * @description Get all bookings with filters
         */
        get: operations["admin_get_all_bookings"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get All Configs
         * @description Get all system configurations
         */
        get: operations["get_all_configs_api_v1_admin_config_get"];
        put?: never;
        /**
         * Create Config
         * @description Create a new system configuration
         */
        post: operations["create_config_api_v1_admin_config_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/config/{config_key}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Config
         * @description Get specific configuration
         */
        get: operations["get_config_api_v1_admin_config__config_key__get"];
        /**
         * Update Config
         * @description Update system configuration
         */
        put: operations["update_config_api_v1_admin_config__config_key__put"];
        post?: never;
        /**
         * Delete Config
         * @description Delete a system configuration
         */
        delete: operations["delete_config_api_v1_admin_config__config_key__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/config/available-keys": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Available Config Keys
         * @description Get predefined configuration keys available for admins to set.
         *     Filters out sensitive keys (e.g. API keys) which should remain in .env
         */
        get: operations["get_available_config_keys_api_v1_admin_config_available_keys_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/coupons": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Coupons
         * @description List all coupons (platform and vendor), optionally filtered.
         */
        get: operations["list_coupons_api_v1_admin_coupons_get"];
        put?: never;
        /**
         * Create Coupon
         * @description Create a coupon. Defaults to a platform-wide coupon usable on any salon;
         *     set scope='vendor' + salon_id to scope it to one salon.
         */
        post: operations["create_coupon_api_v1_admin_coupons_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/coupons/{coupon_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Coupon
         * @description Get a single coupon by id.
         */
        get: operations["get_coupon_api_v1_admin_coupons__coupon_id__get"];
        put?: never;
        post?: never;
        /**
         * Deactivate Coupon
         * @description Deactivate a coupon (kept for redemption history).
         */
        delete: operations["deactivate_coupon_api_v1_admin_coupons__coupon_id__delete"];
        options?: never;
        head?: never;
        /**
         * Update Coupon
         * @description Update a coupon (code and scope are immutable).
         */
        patch: operations["update_coupon_api_v1_admin_coupons__coupon_id__patch"];
        trace?: never;
    };
    "/api/v1/admin/product-orders/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get All Orders
         * @description Get all product orders for admin
         */
        get: operations["get_all_orders_api_v1_admin_product_orders__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/product-orders/{order_id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Update Order Status
         * @description Update order status
         */
        patch: operations["update_order_status_api_v1_admin_product_orders__order_id__status_patch"];
        trace?: never;
    };
    "/api/v1/admin/recent-activity": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Recent Activity
         * @description Get recent activity logs for dashboard
         *     - Admin only
         *     - Returns last N activity logs with user details
         */
        get: operations["get_recent_activity_api_v1_admin_recent_activity_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/rms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get All Rms
         * @description Get all Relationship Managers
         */
        get: operations["get_all_rms_api_v1_admin_rms_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/rms/{rm_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update Rm Profile
         * @description Update RM profile (admin only)
         *
         *     Updates both profile fields (name, phone, email, is_active) and
         *     RM-specific fields (territories, joining_date, manager_notes).
         *     employee_id is system-generated and not editable.
         */
        put: operations["update_rm_profile_api_v1_admin_rms__rm_id__put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/salons/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get All Salons Admin
         * @description Get all salons with optional filtering
         */
        get: operations["admin_get_all_salons"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/salons/{salon_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update Salon
         * @description Update salon (protected fields excluded)
         */
        put: operations["admin_update_salon"];
        post?: never;
        /**
         * Delete Salon
         * @description Delete salon (soft delete by default, hard delete if specified)
         */
        delete: operations["admin_delete_salon"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/salons/{salon_id}/send-payment-reminder": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Send Payment Reminder
         * @description Send payment reminder email to salon owner for pending registration fee
         *
         *     Only applicable to salons with registration_fee_paid = false
         */
        post: operations["admin_send_payment_reminder"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/salons/{salon_id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Toggle Salon Status
         * @description Toggle salon active/inactive status
         */
        put: operations["admin_toggle_salon_status"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/service-categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get All Service Categories
         * @description Get all service categories with optional filtering
         */
        get: operations["admin_get_all_service_categories"];
        put?: never;
        /**
         * Create Service Category
         * @description Create a new service category
         */
        post: operations["admin_create_service_category"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/service-categories/{category_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Service Category
         * @description Get a specific service category by ID
         */
        get: operations["admin_get_service_category"];
        /**
         * Update Service Category
         * @description Update a service category
         */
        put: operations["admin_update_service_category"];
        post?: never;
        /**
         * Delete Service Category
         * @description Delete a service category
         */
        delete: operations["admin_delete_service_category"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/service-categories/{category_id}/subcategories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Subcategories By Category
         * @description Get the top-level (level-2) subcategories for a category.
         *
         *     Level-3 sub-subcategories (rows with a parent_subcategory_id, typically
         *     created by vendors) are NOT returned as flat siblings. Each level-2 row
         *     instead carries a `sub_subcategory_count`; pass include_nested=true to get
         *     the children themselves under `sub_subcategories`.
         */
        get: operations["admin_get_subcategories"];
        put?: never;
        /**
         * Create Subcategory
         * @description Create a new subcategory under a parent category
         */
        post: operations["admin_create_subcategory"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/service-categories/{category_id}/toggle-status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Toggle Service Category Status
         * @description Toggle service category active status
         */
        patch: operations["admin_toggle_service_category_status"];
        trace?: never;
    };
    "/api/v1/admin/service-categories/all-subcategories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get All Subcategories
         * @description Get top-level (level-2) subcategories with their parent category info
         *     (useful for admin overview / per-category counts). Level-3 sub-subcategories
         *     are excluded so counts reflect curated subcategories, not vendor sub-types.
         */
        get: operations["admin_get_all_subcategories"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/service-categories/reorder": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reorder Service Categories
         * @description Bulk reorder service categories
         *
         *     Expects: [{"id": "uuid", "display_order": 1}, {"id": "uuid", "display_order": 2}, ...]
         */
        post: operations["admin_reorder_service_categories"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/service-categories/subcategories/{subcategory_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update Subcategory
         * @description Update a subcategory
         */
        put: operations["admin_update_subcategory"];
        post?: never;
        /**
         * Delete Subcategory
         * @description Delete a subcategory — prevents deletion if services use it or any of its sub-subcategories
         */
        delete: operations["admin_delete_subcategory"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/service-categories/subcategories/{subcategory_id}/toggle-status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Toggle Subcategory Status
         * @description Toggle subcategory active status
         */
        patch: operations["admin_toggle_subcategory_status"];
        trace?: never;
    };
    "/api/v1/admin/service-categories/upload-icon": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Upload Service Category Icon
         * @description Upload an icon image for a service category
         */
        post: operations["admin_upload_service_category_icon"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Dashboard Stats
         * @description Get admin dashboard statistics
         *     - Admin only
         *     - Returns comprehensive system statistics
         */
        get: operations["get_dashboard_stats_api_v1_admin_stats_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get All Users
         * @description Get all users with pagination and filters
         */
        get: operations["admin_get_all_users"];
        put?: never;
        /**
         * Create User
         * @description Create a new user (Relationship Manager or Customer only)
         */
        post: operations["admin_create_user"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/users/{user_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update User
         * @description Update user profile
         */
        put: operations["update_user_api_v1_admin_users__user_id__put"];
        post?: never;
        /**
         * Delete User
         * @description Hard-delete a user (removes auth user + profile; frees the email for reuse)
         */
        delete: operations["delete_user_api_v1_admin_users__user_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/vendor-requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Vendor Requests
         * @description Get vendor join requests
         *     - Admin only
         *     - Filter by status: pending, approved, rejected
         */
        get: operations["admin_get_vendor_requests"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/vendor-requests/{request_id}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Approve Vendor Request
         * @description Approve vendor join request
         *     - Creates salon entry
         *     - Updates RM score
         *     - Queues the vendor registration email and RM notification
         *
         *     Emails are sent *after* the response so that a slow or failing email provider
         *     can no longer hold the request open past the admin panel's timeout (which made a
         *     successful approval look like a failure). Delivery failures are recorded as
         *     `email_failed` activity and can be retried via `/resend-approval-email`.
         */
        post: operations["admin_approve_vendor_request"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/vendor-requests/{request_id}/reject": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reject Vendor Request
         * @description Reject vendor join request
         *     - Updates status
         *     - Sends rejection email
         */
        post: operations["admin_reject_vendor_request"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/admin/vendor-requests/{request_id}/resend-approval-email": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Resend Approval Email
         * @description Re-send the registration-link email for an already approved vendor request.
         *
         *     Unlike `/approve`, this waits for the Resend result and reports the real error,
         *     so it doubles as the way to diagnose "the vendor never got the email".
         */
        post: operations["admin_resend_approval_email"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/app-config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get App Config
         * @description Version policy for a native app build.
         *
         *     Query parameters win; the X-Client-App / X-App-Platform / X-App-Version
         *     headers are the fallback. Unknown app or platform is a 422. No policy
         *     configured means nulls and both booleans false.
         */
        get: operations["get_app_config_api_v1_app_config_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Login
         * @description Authenticate user and return JWT tokens
         *     - Validates credentials with Supabase Auth
         *     - Returns access token and refresh token
         *     - Includes user profile data
         *     - Rate limited: 5 attempts per minute to prevent brute-force
         */
        post: operations["login_api_v1_auth_login_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/login/phone/send-otp": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Send Phone Login Otp
         * @description Send OTP to phone number for login (customers and regular buyers only)
         *
         *     - Validates that phone exists on an account in the database
         *     - An unverified number still gets an OTP; a correct code verifies it at the
         *       verify-otp step, since receiving the SMS proves the caller holds the number
         *     - Validates user is a customer or regular_buyer (other roles must use email login)
         *     - Sends 6-digit OTP via MessageCentral SMS
         *     - Returns verification_id for OTP verification step
         *     - Rate limited: 3 OTP sends per 5 minutes per IP
         *
         *     **Note**: Only customer and regular_buyer accounts can log in via phone.
         *     Admin, RM, and Vendor users must use email login.
         */
        post: operations["send_phone_login_otp_api_v1_auth_login_phone_send_otp_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/login/phone/verify-otp": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Verify Phone Login Otp
         * @description Verify OTP and login user via phone (customers and regular buyers only)
         *
         *     - Verifies OTP with MessageCentral
         *     - Validates user is customer or regular_buyer and account is active
         *     - Generates JWT tokens (access + refresh)
         *     - Returns same response as email login
         *     - Rate limited: 5 verification attempts per 5 minutes
         *
         *     **Note**: Only customer and regular_buyer accounts can log in via phone.
         */
        post: operations["verify_phone_login_otp_api_v1_auth_login_phone_verify_otp_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Logout
         * @description Logout user by revoking their access token
         *
         *     - Adds current token to blacklist to prevent reuse
         *     - Client should also delete refresh token
         *     - Returns success message
         */
        post: operations["logout_api_v1_auth_logout_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Logout All Devices
         * @description Logout user from all devices by revoking all their tokens
         *
         *     - Requires password confirmation for security
         *     - Revokes current token and invalidates all sessions
         *     - User must login again on all devices
         */
        post: operations["logout_all_devices_api_v1_auth_logout_all_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Current User Profile
         * @description Get current authenticated user profile
         *     - Requires valid JWT token
         *     - Returns user data
         */
        get: operations["get_current_user_profile_api_v1_auth_me_get"];
        /**
         * Update Current User Profile
         * @description Update current authenticated user profile
         *     - Requires valid JWT token
         *     - Restricted to 'customer' role
         *     - Returns updated user data
         */
        put: operations["update_current_user_profile_api_v1_auth_me_put"];
        post?: never;
        /**
         * Delete Own Account
         * @description Permanently delete the signed-in user's own account (Google Play requirement)
         *
         *     - Requires the literal text "DELETE" plus identity proof: either the password,
         *       or an OTP from /auth/me/delete/send-otp (phone-first signups have no password
         *       they know)
         *     - Erases personal data; booking/payment records are kept anonymised where
         *       retention is legally required
         *     - Irreversible: the user must sign up again to use Lubist
         */
        delete: operations["delete_own_account_api_v1_auth_me_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/me/delete/send-otp": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Send Account Deletion Otp
         * @description Send an account-deletion confirmation OTP to the phone on file
         *
         *     For users who signed up with a phone number and therefore have no password
         *     they know. The number is read from the profile, never taken from the caller.
         */
        post: operations["send_account_deletion_otp_api_v1_auth_me_delete_send_otp_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/password-reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Initiate Password Reset
         * @description Initiate password reset process
         *
         *     Sends password reset email to user if account exists
         *     Returns success message regardless for security
         *     Rate limited: 3 attempts per hour to prevent abuse
         */
        post: operations["initiate_password_reset_api_v1_auth_password_reset_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/password-reset/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Confirm Password Reset
         * @description Confirm password reset with token
         *
         *     Validates reset token and updates password
         *     Returns new access tokens for immediate login
         */
        post: operations["confirm_password_reset_api_v1_auth_password_reset_confirm_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Refresh Access Token
         * @description Refresh access token using refresh token
         *     - Validates refresh token
         *     - Returns new access token
         *     - Extends session
         *     - Rate limited: 10 refreshes per minute
         */
        post: operations["refresh_access_token_api_v1_auth_refresh_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/resend-verification": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Resend Verification Email
         * @description Resend email verification link
         *
         *     Sends a new verification email to the user if their email is not yet confirmed
         *     Rate limited: 3 attempts per hour to prevent abuse
         */
        post: operations["resend_verification_email_api_v1_auth_resend_verification_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/signup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Signup
         * @description Register new user (customer only)
         *     - Creates Supabase auth user
         *     - Creates profile entry
         *     - Role defaults to 'customer'
         *     - Rate limited: 3 signups per minute to prevent abuse
         */
        post: operations["signup_api_v1_auth_signup_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/signup/phone/send-otp": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Send Phone Signup Otp
         * @description Send OTP to phone number for unauthenticated signup
         */
        post: operations["send_phone_signup_otp_api_v1_auth_signup_phone_send_otp_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/signup/phone/verify-otp": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Verify Phone Signup Otp
         * @description Verify OTP during phone signup process
         */
        post: operations["verify_phone_signup_otp_api_v1_auth_signup_phone_verify_otp_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/verify-phone/confirm-otp": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Confirm Phone Verification Otp
         * @description Verify phone number with OTP and update profile
         *
         *     - User must be logged in (JWT token required)
         *     - Validates 6-digit OTP with MessageCentral
         *     - Updates user profile with verified phone
         *     - Sets phone_verified = true and phone_verification_method = "otp"
         *     - Rate limited: 5 attempts per 5 minutes
         *
         *     **Use Case**: Completing phone verification after OTP sent
         */
        post: operations["confirm_phone_verification_otp_api_v1_auth_verify_phone_confirm_otp_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/verify-phone/send-otp": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Send Phone Verification Otp
         * @description Send OTP for phone verification (for authenticated users)
         *
         *     - User must be logged in (JWT token required)
         *     - Sends 6-digit OTP to new phone number
         *     - Returns verification_id for OTP verification step
         *     - Rate limited: 3 sends per 5 minutes
         *
         *     **Use Case**: When user wants to update their phone number and verify it
         */
        post: operations["send_phone_verification_otp_api_v1_auth_verify_phone_send_otp_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/banners": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Banners
         * @description List active home-carousel banners.
         *
         *     **Public endpoint** — no auth required (the home screen loads this for
         *     anonymous users). Returns only active banners currently within their
         *     schedule window, ordered by `sort_order` ascending.
         */
        get: operations["list_banners_api_v1_banners_get"];
        put?: never;
        /**
         * Create Banner
         * @description Create a new carousel banner.
         *
         *     **Admin only.** `image_url` should come from the
         *     `/upload/cloudinary-banner-image` endpoint.
         */
        post: operations["create_banner_api_v1_banners_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/banners/{banner_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update Banner
         * @description Update an existing banner.
         *
         *     **Admin only.** Only the fields present in the body are updated; a field
         *     sent as `null` is cleared, and one sent as `""` is treated as untouched.
         */
        put: operations["update_banner_api_v1_banners__banner_id__put"];
        post?: never;
        /**
         * Delete Banner
         * @description Delete a banner.
         *
         *     **Admin only.** Default is a soft-delete (`is_active = false`); `hard=true`
         *     removes the row permanently.
         */
        delete: operations["delete_banner_api_v1_banners__banner_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/banners/admin/all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Admin List All Banners
         * @description List ALL banners including inactive ones.
         *
         *     **Admin only** — for the banner management panel.
         */
        get: operations["admin_list_all_banners_api_v1_banners_admin_all_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/banners/reorder": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Reorder Banners
         * @description Bulk-update the display order of banners.
         *
         *     **Admin only.** Send the full ordered set as `{ orders: [{id, sort_order}] }`.
         */
        put: operations["reorder_banners_api_v1_banners_reorder_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/blog": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Blog Posts
         * @description List published blog posts, newest first.
         *
         *     **Public endpoint** — no auth required. Returns only posts that are
         *     published and whose publish date has passed, so scheduled posts stay hidden
         *     until their time. Article bodies are omitted; use the detail route for those.
         */
        get: operations["list_blog_posts_api_v1_blog_get"];
        put?: never;
        /**
         * Create Blog Post
         * @description Create a blog post.
         *
         *     **Admin only.** The slug is generated from the title when omitted, the body
         *     is sanitised against the editor allowlist, and read time is computed on save.
         *     `cover_image_url` should come from `/upload/cloudinary-blog-image`.
         */
        post: operations["create_blog_post_api_v1_blog_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/blog/{post_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update Blog Post
         * @description Update an existing post.
         *
         *     **Admin only.** Only the fields present in the body are updated; a field
         *     sent as `null` is cleared, and one sent as `""` is treated as untouched.
         *     Changing a published post's slug breaks any link search engines have
         *     already indexed — the admin UI warns before allowing it.
         */
        put: operations["update_blog_post_api_v1_blog__post_id__put"];
        post?: never;
        /**
         * Delete Blog Post
         * @description Delete a post.
         *
         *     **Admin only.** Default archives the post (`status='archived'`), which keeps
         *     the slug reserved so an indexed URL is never reused by a different article.
         *     `hard=true` removes the row permanently.
         */
        delete: operations["delete_blog_post_api_v1_blog__post_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/blog/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Blog Post
         * @description Get a single published post by slug, with up to three related posts.
         *
         *     **Public endpoint** — this is what the website's server-rendering function
         *     calls to build the article HTML, meta tags and structured data. Drafts and
         *     scheduled posts return 404, indistinguishable from a nonexistent slug.
         */
        get: operations["get_blog_post_api_v1_blog__slug__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/blog/admin/{post_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Admin Get Post
         * @description Fetch any post by UUID regardless of status, for the editor screen.
         *
         *     **Admin only.** The public `/blog/{slug}` route 404s on drafts, so the
         *     editor needs this id-based route to load work in progress.
         */
        get: operations["admin_get_post_api_v1_blog_admin__post_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/blog/admin/all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Admin List All Posts
         * @description List ALL posts including drafts, scheduled and archived.
         *
         *     **Admin only** — for the blog management table.
         */
        get: operations["admin_list_all_posts_api_v1_blog_admin_all_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/blog/sitemap-data": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Blog Sitemap Data
         * @description Slug and timestamp feed for every live post.
         *
         *     **Public endpoint** — consumed by the website's `sitemap.xml` serverless
         *     function. Kept separate from the list endpoint so the sitemap is not
         *     constrained by pagination.
         */
        get: operations["blog_sitemap_data_api_v1_blog_sitemap_data_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/blog/tags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Blog Tags
         * @description Distinct tags across all live posts.
         *
         *     **Public endpoint** — drives the filter bar on the blog index page.
         */
        get: operations["list_blog_tags_api_v1_blog_tags_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/careers/applications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Career Applications
         * @description Get all career applications (Admin only)
         *
         *     Requires: Admin authentication
         *
         *     Query params:
         *     - status: Filter by status (pending, under_review, etc.)
         *     - position: Filter by position
         *     - search: Search name, email, phone, application number, or city
         *     - skip: Pagination offset
         *     - limit: Results per page
         */
        get: operations["get_career_applications_api_v1_careers_applications_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/careers/applications/{application_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Update Career Application Status
         * @description Update career application status (Admin only)
         *
         *     Requires: Admin authentication
         *
         *     Can update:
         *     - status
         *     - admin_notes
         *     - rejection_reason
         *     - interview details
         */
        patch: operations["update_career_application_status_api_v1_careers_applications__application_id__patch"];
        trace?: never;
    };
    "/api/v1/careers/applications/{application_id}/download/{document_type}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Download Document
         * @description Download a specific document from career application (Admin only)
         *
         *     Requires: Admin authentication
         *
         *     document_type: resume, aadhaar_card, photo
         */
        get: operations["download_document_api_v1_careers_applications__application_id__download__document_type__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/careers/apply": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Submit Career Application
         * @description Submit a career application for RM or other positions
         *
         *     Accepts:
         *     - Personal and job details as form fields
         *     - Required documents: resume, aadhaar, photo
         *
         *     Returns:
         *     - Application ID, application number, and confirmation message
         */
        post: operations["submit_career_application_api_v1_careers_apply_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/available-coupons": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Available Coupons
         * @description Coupons the customer can currently discover ("available offers").
         *
         *     Always returns active, in-window platform coupons (usable at any salon). When
         *     `salon_id` is supplied (e.g. on the checkout screen), that salon's active
         *     vendor coupons are added too. Ineligible coupons — expired, usage-exhausted,
         *     already used, or first-time offers the customer no longer qualifies for — are
         *     filtered out. The authoritative eligibility check still runs on apply.
         */
        get: operations["list_available_coupons_api_v1_customers_available_coupons_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/bookings/{booking_id}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Cancel Booking
         * @description Cancel a booking
         *     Only allows canceling if booking is not already completed or cancelled.
         *     Sends cancellation emails to customer and vendor, and logs activity for admin panel.
         */
        put: operations["customer_cancel_booking"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/bookings/my-bookings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get My Bookings
         * @description Get all bookings for the current customer
         *     Returns bookings with salon and service details
         */
        get: operations["get_my_bookings_api_v1_customers_bookings_my_bookings_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/cart": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Cart
         * @description Get all cart items for the current customer
         *     Returns items grouped by salon with totals
         */
        get: operations["get_cart_api_v1_customers_cart_get"];
        put?: never;
        /**
         * Add To Cart
         * @description Add item to cart or increment quantity if already exists
         *     Fetches salon/service details from database, no denormalization
         */
        post: operations["add_to_cart_api_v1_customers_cart_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/cart/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update Cart Item
         * @description Update cart item quantity
         */
        put: operations["update_cart_item_api_v1_customers_cart__item_id__put"];
        post?: never;
        /**
         * Remove From Cart
         * @description Remove item from cart
         */
        delete: operations["remove_from_cart_api_v1_customers_cart__item_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/cart/checkout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Checkout Cart
         * @description Create booking from cart items with date/time selection and payment verification.
         *
         *     Complete Cart Checkout Flow:
         *     1. Frontend: User adds services to cart (POST /customers/cart)
         *     2. Frontend: User proceeds to checkout page
         *     3. Frontend: User selects date and time slots (max 3)
         *     4. Frontend: Clicks "Proceed to Payment"
         *     5. Frontend: Calls POST /payments/cart/create-order
         *        - Backend creates Razorpay order with convenience_fee + GST
         *        - Returns order_id, amount, key_id
         *     6. Frontend: Opens Razorpay modal with order_id
         *     7. Customer: Completes payment on Razorpay
         *     8. Razorpay: Returns payment_id, signature to frontend
         *     9. Frontend: Calls this endpoint (POST /customers/cart/checkout) with:
         *        - booking_date, time_slots
         *        - razorpay_order_id, razorpay_payment_id, razorpay_signature
         *     10. Backend: Verifies payment signature with Razorpay
         *     11. Backend: Creates booking with all cart services
         *     12. Backend: Creates booking_payment record
         *     13. Backend: Clears cart
         *     14. Backend: Returns booking details
         *     15. After the response: confirmation emails to customer and vendor
         *
         *     Step 15 is deliberately not awaited. The customer has already been charged by
         *     the time this endpoint runs, so nothing that cannot change the outcome of the
         *     booking belongs in front of the response (audit C-1).
         *
         *     Payment Split Model:
         *     - Convenience Fee (10% + GST): Paid ONLINE during checkout
         *     - Service Amount (100%): Paid AT SALON after service completion
         *
         *     Validates salon is accepting bookings and clears cart after successful booking.
         */
        post: operations["checkout_cart_api_v1_customers_cart_checkout_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/cart/clear/all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Clear Cart
         * @description Clear all items from cart
         */
        delete: operations["clear_cart_api_v1_customers_cart_clear_all_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/cart/validate-coupon": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Validate Cart Coupon
         * @description Preview a coupon against the current cart ("Apply coupon" button).
         *
         *     Returns whether the coupon is valid for this cart and the resulting price
         *     breakdown. Does NOT redeem the coupon — redemption happens at checkout.
         */
        post: operations["validate_cart_coupon_api_v1_customers_cart_validate_coupon_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/favorites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Favorites
         * @description Get all favorite salons for the current customer.
         */
        get: operations["get_favorites_api_v1_customers_favorites_get"];
        put?: never;
        /**
         * Add Favorite
         * @description Add a salon to the current customer's favorites.
         */
        post: operations["add_favorite_api_v1_customers_favorites_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/favorites/{salon_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Remove Favorite
         * @description Remove a salon from the current customer's favorites.
         */
        delete: operations["remove_favorite_api_v1_customers_favorites__salon_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/favorites/products": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Favorite Products
         * @description Get all favorite (saved) products for the current customer.
         */
        get: operations["get_favorite_products_api_v1_customers_favorites_products_get"];
        put?: never;
        /**
         * Add Favorite Product
         * @description Add a product to the current customer's favorites.
         */
        post: operations["add_favorite_product_api_v1_customers_favorites_products_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/favorites/products/{product_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Remove Favorite Product
         * @description Remove a product from the current customer's favorites.
         */
        delete: operations["remove_favorite_product_api_v1_customers_favorites_products__product_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/product-cart": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Product Cart
         * @description Get all product cart items for the current customer
         */
        get: operations["get_product_cart_api_v1_customers_product_cart_get"];
        put?: never;
        /**
         * Add To Product Cart
         * @description Add product to cart
         */
        post: operations["add_to_product_cart_api_v1_customers_product_cart_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/product-cart/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update Product Cart Item
         * @description Update product cart item quantity
         */
        put: operations["update_product_cart_item_api_v1_customers_product_cart__item_id__put"];
        post?: never;
        /**
         * Remove From Product Cart
         * @description Remove item from product cart
         */
        delete: operations["remove_from_product_cart_api_v1_customers_product_cart__item_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/product-cart/clear/all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Clear Product Cart
         * @description Clear all items from product cart
         */
        delete: operations["clear_product_cart_api_v1_customers_product_cart_clear_all_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/reviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create Review
         * @description Create a review for a completed booking.
         */
        post: operations["create_review_api_v1_customers_reviews_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/reviews/{review_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update Review
         * @description Update an existing review written by the current customer.
         */
        put: operations["update_review_api_v1_customers_reviews__review_id__put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/customers/reviews/my-reviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get My Reviews
         * @description Get all reviews written by the current customer.
         */
        get: operations["get_my_reviews_api_v1_customers_reviews_my_reviews_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/features": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get My Features
         * @description The feature map for the calling user.
         *
         *     The admin panel calls this once on load to decide which nav items and
         *     routes to render. Client admins receive only entitled features; internal
         *     staff additionally receive features still at 'internal'.
         *
         *     This is a convenience for the UI, never the security boundary — each gated
         *     endpoint enforces its own RequireFeature check.
         */
        get: operations["get_my_features_api_v1_features_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/features/admin/{key}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Update Feature Status
         * @description Change a feature's entitlement status — this is the "client paid" switch.
         *
         *     **Internal only.** Takes effect immediately in this worker; other workers
         *     pick it up within the 60s flag cache TTL.
         */
        patch: operations["update_feature_status_api_v1_features_admin__key__patch"];
        trace?: never;
    };
    "/api/v1/features/admin/all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List All Features
         * @description Every registered feature with its status and audit fields.
         *
         *     **Internal only.** 404s for the client.
         */
        get: operations["list_all_features_api_v1_features_admin_all_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/location/pincode/{pincode}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Verify Pincode
         * @description Resolve an Indian PIN to its district and state (via India Post).
         *
         *     Public and unauthenticated, like the other lookups here: the RM salon form
         *     calls it while the owner is still typing, to fill in City/State and to warn
         *     when the entered city doesn't match the PIN.
         *
         *     Always 200 except for a malformed PIN. `valid` is the answer:
         *     `true` (known), `false` (no such PIN), or `null` when India Post could not be
         *     reached - in which case the form carries on rather than blocking a submission
         *     on a third party's uptime.
         */
        get: operations["verify_pincode_api_v1_location_pincode__pincode__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/location/reverse-geocode": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Reverse Geocode
         * @description Convert coordinates to address
         */
        get: operations["reverse_geocode_api_v1_location_reverse_geocode_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/location/salons/nearby": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Salons Nearby
         * @description Get salons near the specified location (canonical nearby-salons endpoint).
         *
         *     Delegates to SalonService.get_nearby_salons, which uses the PostGIS
         *     `get_nearby_salons` function, excludes regular_buyer salons, and attaches
         *     discount flags.
         */
        get: operations["get_salons_nearby_api_v1_location_salons_nearby_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/notifications/devices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Register Device
         * @description Register (or move to the signed-in user) a phone's push token.
         */
        post: operations["register_device_api_v1_notifications_devices_post"];
        /**
         * Unregister Device
         * @description Remove a push token for the signed-in user (call before signing out).
         */
        delete: operations["unregister_device_api_v1_notifications_devices_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/partners/apply": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Submit Partner Request
         * @description Submit a 'Partner with us' onboarding inquiry (public).
         *
         *     Collects basic vendor info: owner name, shop name, shop type,
         *     email, phone, and location.
         */
        post: operations["submit_partner_request_api_v1_partners_apply_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/partners/requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Partner Requests
         * @description Get all partner requests (Admin only).
         *
         *     Query params:
         *     - status: Filter by status (new, contacted, approved, rejected)
         *     - shop_type: Filter by shop type
         *     - search: Search owner name, shop name, email, phone, or location
         *     - skip / limit: Pagination
         */
        get: operations["get_partner_requests_api_v1_partners_requests_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/partners/requests/{request_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Update Partner Request
         * @description Update a partner request's status and admin notes (Admin only).
         */
        patch: operations["update_partner_request_api_v1_partners_requests__request_id__patch"];
        trace?: never;
    };
    "/api/v1/payments/cart/create-order": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create Cart Payment Order
         * @description Create Razorpay order for cart checkout (convenience fee payment)
         *
         *     Cart Payment Flow - Step 5 of checkout:
         *     1. Frontend calls this endpoint before opening Razorpay modal
         *     2. Backend calculates total from cart items
         *     3. Backend calculates booking_fee (% of service total - configured by admin)
         *     4. Backend creates Razorpay order for total payment amount
         *     5. Backend returns order_id, amount, key_id
         *     6. Frontend uses this data to open Razorpay checkout modal
         *     7. After payment, frontend calls /customers/cart/checkout with payment details
         *
         *     Note: This does NOT create a booking. It only initiates the payment.
         *     The booking is created in /customers/cart/checkout after payment verification.
         *
         *     Optional body: {"coupon_code": "SAVE20"} to apply a coupon to this order,
         *     and `booking_date` / `time_slots` for the appointment already chosen on the
         *     page. The appointment is not priced or validated here — it is pinned onto the
         *     payment intent so the `payment.captured` webhook can finish the booking if
         *     the browser never returns with the success callback (audit C-3).
         */
        post: operations["create_cart_payment_order_api_v1_payments_cart_create_order_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/payments/registration/create-order": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create Vendor Registration Order
         * @description Create Razorpay order for vendor registration fee
         */
        post: operations["create_vendor_registration_order_api_v1_payments_registration_create_order_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/payments/registration/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Verify Vendor Registration Payment
         * @description Verify vendor registration payment and activate salon.
         *
         *     Safe to call again: activation is idempotent and a repeat call will complete
         *     an activation that a previous one couldn't (audit H-6). The receipt email is
         *     queued, not awaited — the vendor has already paid.
         */
        post: operations["verify_vendor_registration_payment_api_v1_payments_registration_verify_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/product-orders/{order_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Order
         * @description Get a single product order belonging to the current user.
         *
         *     Defined after /my-orders: a path-param route registered before a literal one
         *     would shadow it (FastAPI/Starlette match in registration order).
         */
        get: operations["get_order_api_v1_product_orders__order_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/product-orders/available-coupons": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Available Coupons
         * @description Platform coupons the current customer can discover and apply on the
         *     product checkout page ("available offers"). Always platform-wide — there
         *     is no vendor-owned product catalog to scope a coupon to.
         */
        get: operations["list_available_coupons_api_v1_product_orders_available_coupons_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/product-orders/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create Order
         * @description Create a new product order and get Razorpay order details
         */
        post: operations["create_order_api_v1_product_orders_create_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/product-orders/dev-verify/{order_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Dev Verify Payment
         * @description DEV ONLY: Simulate a successful payment without real Razorpay credentials.
         *     Marks the order as paid directly. Returns 403 in production.
         */
        post: operations["dev_verify_payment_api_v1_product_orders_dev_verify__order_id__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/product-orders/my-orders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get My Orders
         * @description Get all orders for the current user
         */
        get: operations["get_my_orders_api_v1_product_orders_my_orders_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/product-orders/validate-coupon": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Validate Coupon
         * @description Preview a platform coupon against a would-be product order ("Apply coupon"
         *     button on /checkout/products). Does NOT redeem — redemption happens once
         *     the order is actually paid.
         */
        post: operations["validate_coupon_api_v1_product_orders_validate_coupon_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/product-orders/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Verify Payment
         * @description Verify Razorpay payment and mark order as paid
         */
        post: operations["verify_payment_api_v1_product_orders_verify_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/products": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Products
         * @description List products with optional filtering and pagination.
         *
         *     **Public endpoint** — only returns active products.
         *
         *     **Filters:**
         *     - category: Exact match on product category
         *     - is_featured: Filter featured/non-featured products
         *     - search: Case-insensitive partial match on product name
         *     - limit/offset: Pagination controls
         *
         *     **Returns:**
         *     - products: Array of product objects
         *     - count: Number of results in current page
         *     - total: Total matching products (for pagination UI)
         */
        get: operations["list_products_api_v1_products_get"];
        put?: never;
        /**
         * Create Product
         * @description Create a new product.
         *
         *     **Admin only** — requires admin authentication.
         *
         *     **Features:**
         *     - Auto-generates slug from name if not provided
         *     - Ensures slug uniqueness (appends suffix if needed)
         *     - Auto-calculates discount_percentage from price/discount_price
         */
        post: operations["create_product_api_v1_products_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/products/{product_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Product By Id
         * @description Get a single product by UUID.
         *
         *     **Public endpoint** — anonymous/non-admin callers only see active products.
         *     Admins may fetch inactive products by ID (e.g. to manage soft-deleted items).
         */
        get: operations["get_product_by_id_api_v1_products__product_id__get"];
        /**
         * Update Product
         * @description Update an existing product.
         *
         *     **Admin only** — requires admin authentication.
         *
         *     Only the fields present in the body are updated; a field sent as `null` is
         *     cleared, and one sent as `""` is treated as untouched.
         *     Auto-recalculates discount_percentage when price or discount_price changes.
         */
        put: operations["update_product_api_v1_products__product_id__put"];
        post?: never;
        /**
         * Delete Product
         * @description Delete a product.
         *
         *     **Admin only** — requires admin authentication.
         *
         *     **Behavior:**
         *     - Default: Soft-delete (sets is_active = false, product still exists in DB)
         *     - hard=true: Permanently removes from database (irreversible)
         */
        delete: operations["delete_product_api_v1_products__product_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/products/{product_id}/related": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Related Products
         * @description Get products related to the given product, for the "Related Products"
         *     section shown at the bottom of the product detail page.
         *
         *     Relevance is tiered (same category → same brand → any active product),
         *     featured first then newest, and always excludes the source product. Only
         *     active products are returned. B2B pricing is applied for B2B roles.
         *
         *     **Returns:**
         *     - products: Array of related product objects
         *     - count: Number of results returned
         */
        get: operations["get_related_products_api_v1_products__product_id__related_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/products/admin/all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Admin List All Products
         * @description List ALL products including inactive ones.
         *
         *     **Admin only** — for product management panel.
         */
        get: operations["admin_list_all_products_api_v1_products_admin_all_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/products/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Product Categories
         * @description Get all distinct product categories.
         *
         *     **Public endpoint** — returns categories from active products only.
         *     Useful for filter dropdowns on frontend.
         */
        get: operations["get_product_categories_api_v1_products_categories_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/products/slug/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Product By Slug
         * @description Get a single product by its URL-friendly slug.
         *
         *     **Public endpoint** — only returns active products.
         *
         *     **Use Cases:**
         *     - Product detail page (SEO-friendly URL)
         *     - e.g. /products/slug/hair-serum-250ml
         */
        get: operations["get_product_by_slug_api_v1_products_slug__slug__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rm/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Rm Dashboard
         * @description Get RM dashboard statistics with comprehensive metrics
         */
        get: operations["get_rm_dashboard_api_v1_rm_dashboard_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rm/leaderboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Rm Leaderboard
         * @description Get RM leaderboard - top RMs by score
         */
        get: operations["get_rm_leaderboard_api_v1_rm_leaderboard_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rm/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update Own Profile
         * @description Update own RM profile - limited fields allowed
         */
        put: operations["update_own_profile_api_v1_rm_profile_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rm/salons": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Rm Salons
         * @description Get all salons associated with this RM
         */
        get: operations["get_rm_salons_api_v1_rm_salons_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rm/score-history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Own Score History
         * @description Get own score history
         */
        get: operations["get_own_score_history_api_v1_rm_score_history_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rm/vendor-requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Own Vendor Requests
         * @description Get all vendor requests submitted by this RM
         */
        get: operations["get_own_vendor_requests_api_v1_rm_vendor_requests_get"];
        put?: never;
        /**
         * Create Vendor Request
         * @description Create new vendor join request - can be draft or submitted for approval
         */
        post: operations["create_vendor_request_api_v1_rm_vendor_requests_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/rm/vendor-requests/{request_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Vendor Request
         * @description Get single vendor request by ID
         */
        get: operations["rm_get_vendor_request"];
        /**
         * Update Vendor Request
         * @description Update draft vendor request or submit it for approval
         */
        put: operations["update_vendor_request_api_v1_rm_vendor_requests__request_id__put"];
        post?: never;
        /**
         * Delete Vendor Request
         * @description Delete draft vendor request with automatic image cleanup
         */
        delete: operations["delete_vendor_request_api_v1_rm_vendor_requests__request_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/salons/{salon_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Salon
         * @description Get single salon by ID (UUID).
         *
         *     Returns detailed salon information including:
         *     - Basic salon info (name, address, contact, images)
         *     - Business hours
         *     - Average rating and review count
         *     - Optional: Services list
         *
         *     **Visibility:**
         *     Only returns salons that are:
         *     - is_active = true
         *     - is_verified = true
         *     - registration_fee_paid = true
         *
         *     **Parameters:**
         *     - salon_id: Salon UUID
         *     - include_services: Include full services list (default: false)
         *
         *     **Use Cases:**
         *     - Salon detail page (public view)
         *     - Booking flow (get salon info before booking)
         *     - Service selection (with include_services=true)
         *
         *     **Returns:**
         *     - salon: Complete salon object
         *     - services: Array (if include_services=true)
         */
        get: operations["get_salon_api_v1_salons__salon_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/salons/{salon_id}/available-slots": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Available Slots
         * @description Get available time slots for booking.
         *
         *     Calculates available slots based on:
         *     - Salon business hours for the given date
         *     - Service duration
         *
         *     Slots are not consumed by existing bookings: a salon can serve several
         *     customers at the same time, so the same slot stays offered to everyone.
         *
         *
         *     **Parameters:**
         *     - salon_id: Salon UUID
         *     - date: Booking date (YYYY-MM-DD)
         *     - service_ids: Optional comma-separated service IDs for duration calculation
         *
         *     **Returns:**
         *     - slots: Array of available time slots
         *     - date: Echo of requested date
         */
        get: operations["get_available_slots_api_v1_salons__salon_id__available_slots_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/salons/{salon_id}/feedback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Salon Feedback Context
         * @description Validate a signed review link and return the feedback page context.
         */
        get: operations["get_salon_feedback_context_api_v1_salons__salon_id__feedback_get"];
        put?: never;
        /**
         * Submit Salon Feedback
         * @description Submit a salon review from the public feedback flow.
         */
        post: operations["submit_salon_feedback_api_v1_salons__salon_id__feedback_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/salons/{salon_id}/related": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Related Salons
         * @description Get salons related to the given salon, for the "Related Salons" section
         *     shown at the bottom of the salon detail page.
         *
         *     Relevance is tiered (same city → same state → any public salon), ordered by
         *     rating, and always excludes the source salon. Only public-visible salons are
         *     returned, so the same cards as the public listing can render the results.
         *
         *     **Returns:**
         *     - salons: Array of related salon objects
         *     - count: Number of results returned
         */
        get: operations["get_related_salons_api_v1_salons__salon_id__related_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/salons/{salon_id}/reviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Salon Reviews
         * @description Get publicly visible reviews for a salon.
         */
        get: operations["get_salon_reviews_api_v1_salons__salon_id__reviews_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/salons/{salon_id}/services": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Salon Services
         * @description Get all services for a specific salon.
         *
         *     Returns services grouped by category with pricing and duration.
         *     Includes category information (name, icon_url) via join.
         *
         *     **Use Cases:**
         *     - Salon detail page service listing
         *     - Service selection for booking
         *     - Service browsing
         *
         *     **Returns:**
         *     - services: Array of service objects with category info
         *     - count: Total number of services
         */
        get: operations["get_salon_services_api_v1_salons__salon_id__services_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/salons/config/public": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Public Configs
         * @description Get public system configurations (non-sensitive values)
         *
         *     Returns configuration values that are safe to expose to frontend:
         *     - Fee percentages
         *     - Booking limits
         *     - Cancellation policies
         *
         *     Does NOT return sensitive values like API keys
         */
        get: operations["get_public_configs_api_v1_salons_config_public_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/salons/popular-cities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Popular Cities
         * @description Get top cities by salon count (aggregated at database level).
         *
         *     **Performance:**
         *     - Uses database-level aggregation (efficient for large datasets)
         *     - Returns only aggregated counts, not full salon data
         *     - Case-insensitive city matching (Mumbai = mumbai = MUMBAI)
         *     - Automatic whitespace trimming
         *
         *     **Use Cases:**
         *     - Homepage popular locations section
         *     - City filter dropdowns
         *     - Analytics dashboards
         *
         *     **Only includes salons that are:**
         *     - is_active = true
         *     - is_verified = true
         *     - registration_fee_paid = true
         *
         *     **Returns:**
         *     - cities: Array of {city: string, salon_count: int}
         *     - total: Number of cities returned
         */
        get: operations["get_popular_cities_api_v1_salons_popular_cities_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/salons/public": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Public Salons
         * @description Get all public salons (active, verified, and registration fee paid).
         *
         *     This endpoint returns only salons that are:
         *     - is_active = true (salon is operational)
         *     - is_verified = true (admin approved)
         *     - registration_fee_paid = true (payment completed)
         *
         *     **Use Cases:**
         *     - Public salon listing page
         *     - Customer browsing salons
         *     - Marketplace display
         *
         *     **Filters:**
         *     - city: Optional city filter
         *     - limit: Results per page (1-100)
         *     - offset: Pagination offset
         *
         *     **Returns:**
         *     - salons: Array of salon objects
         *     - count: Number of results returned
         *     - offset: Current offset
         *     - limit: Current limit
         */
        get: operations["get_public_salons_api_v1_salons_public_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/salons/search/query": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Search Salons
         * @description Search salons by text query and filters.
         *
         *     **Search Criteria:**
         *     - Only active, verified, and paid salons
         *     - Text search in business_name field (case-insensitive)
         *     - Multiple filters can be combined
         *
         *     **Parameters:**
         *     - q: Search term (searches in salon name)
         *     - city: Filter by city name (exact match)
         *     - state: Filter by state name
         *     - service_type: Filter by business type (salon, spa, etc.)
         *     - limit: Maximum results (1-100)
         *
         *     **Examples:**
         *     - Search: `/search/query?q=glamour`
         *     - Filter: `/search/query?city=Aligarh`
         *     - Combined: `/search/query?q=spa&city=Mumbai&limit=20`
         *
         *     **Returns:**
         *     - salons: Array of matching salons
         *     - count: Number of results
         *     - query: Echo of search term
         */
        get: operations["public_search_salons"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/upload/agreement-document": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Upload Agreement Document
         * @description Upload salon agreement document (PDF or image) to Cloudinary (private).
         *     Requires authentication. For use by Relationship Managers during salon registration.
         *
         *     Stored on Cloudinary rather than Supabase Storage to avoid the recurring
         *     storage RLS / service-role failures the salon-agreement bucket suffered in
         *     production. View documents via the signed-url endpoint below.
         *
         *     Args:
         *         file: Document file to upload (PDF or image)
         *         current_user: Authenticated user from JWT (already verified by dependency)
         *
         *     Returns:
         *         JSON with the Cloudinary URL (persist it and pass to the signed-url endpoint to view)
         */
        post: operations["upload_agreement_document_api_v1_upload_agreement_document_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/upload/agreement-document/signed-url": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Agreement Document Signed Url
         * @description Generate a signed URL for viewing a private agreement document.
         *
         *     Dual-read: new documents live on Cloudinary (private) and are served via a
         *     Cloudinary signed download URL; legacy documents still in the Supabase
         *     salon-agreement bucket are served via a Supabase signed URL.
         *
         *     Args:
         *         path: Cloudinary URL or legacy Supabase storage path
         *         current_user: Authenticated user (RMs and admins can access, verified at API level)
         *
         *     Returns:
         *         JSON with a time-limited signed URL
         */
        get: operations["get_agreement_document_signed_url_api_v1_upload_agreement_document_signed_url_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/upload/cloudinary-banner-image": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Upload Cloudinary Banner Image
         * @description Upload a home-carousel banner image to Cloudinary.
         *     Requires authentication (admin manages banners; auth is enforced here, and
         *     the banner create/update endpoints additionally require_admin).
         *
         *     Mirrors the product image upload — same CloudinaryService path, so banner
         *     delivery behaves identically to product images.
         *
         *     Args:
         *         file: Image file to upload
         *         current_user: Authenticated user from JWT
         *
         *     Returns:
         *         JSON with the Cloudinary URL to persist on the banner row
         */
        post: operations["upload_cloudinary_banner_image_api_v1_upload_cloudinary_banner_image_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/upload/cloudinary-blog-image": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Upload Cloudinary Blog Image
         * @description Upload a blog cover or in-article image to Cloudinary.
         *
         *     Gated on admin role + the 'blog' feature entitlement, matching the blog
         *     create/update endpoints. Without this the upload route would stay reachable
         *     while the feature is hidden, which both leaks the feature's existence and
         *     lets any authenticated caller push files into the Cloudinary blog folder.
         *
         *     Mirrors the banner image upload — same CloudinaryService path, so blog
         *     images are delivered identically to banner and product images.
         *
         *     Args:
         *         file: Image file to upload
         *         current_user: Authenticated user from JWT
         *
         *     Returns:
         *         JSON with the Cloudinary URL to persist on the blog post row
         */
        post: operations["upload_cloudinary_blog_image_api_v1_upload_cloudinary_blog_image_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/upload/cloudinary-product-image": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Upload Cloudinary Product Image
         * @description Upload a product image to Cloudinary.
         *     Requires authentication.
         *
         *     Args:
         *         file: Image file to upload
         *         current_user: Authenticated user from JWT
         *
         *     Returns:
         *         JSON with public URL of uploaded image
         */
        post: operations["upload_cloudinary_product_image_api_v1_upload_cloudinary_product_image_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/upload/salon-image": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Upload Salon Image
         * @description Upload a salon image to Cloudinary.
         *     Requires authentication.
         *
         *     Stored on Cloudinary rather than Supabase Storage to avoid the recurring
         *     storage RLS / service-role failures the Supabase 'salon-images' bucket
         *     suffered in production (the same reason agreement documents were moved
         *     off Supabase Storage below).
         *
         *     Args:
         *         file: Image file to upload
         *         folder: Destination folder (covers/logos/gallery)
         *         current_user: Authenticated user from JWT
         *
         *     Returns:
         *         JSON with public URL of uploaded image
         */
        post: operations["upload_salon_image_upload"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/vendors/analytics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Vendor Analytics
         * @description Get vendor analytics for dashboard.
         *
         *     Returns bookings, revenue, active services, and ratings.
         */
        get: operations["get_vendor_analytics_api_v1_vendors_analytics_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/vendors/bookings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Salon Bookings
         * @description Get all bookings for own salon.
         *
         *     Supports filtering by status, date range, and pagination.
         */
        get: operations["vendor_get_salon_bookings"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/vendors/bookings/{booking_id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update Booking Status
         * @description Update booking status (confirm, complete, no-show).
         *
         *     Valid statuses: confirmed, completed, no_show
         *
         *     Request body: {"status": "completed"}
         */
        put: operations["vendor_update_booking_status"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/vendors/complete-registration": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Complete Registration
         * @description Complete vendor registration after admin approval
         *     - Verify token
         *     - Create auth user
         *     - Create profile
         *     - Link to salon
         */
        post: operations["complete_registration_api_v1_vendors_complete_registration_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/vendors/coupons": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Vendor Coupons
         * @description List coupons created by this vendor for their salon.
         */
        get: operations["vendor_list_coupons"];
        put?: never;
        /**
         * Create Vendor Coupon
         * @description Create a coupon code for this salon. Customers enter the code at checkout.
         *     Supports service or convenience-fee discounts (flat/percentage), caps,
         *     minimum order, first-time-user restriction and usage limits.
         */
        post: operations["vendor_create_coupon"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/vendors/coupons/{coupon_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Deactivate Vendor Coupon
         * @description Deactivate one of this vendor's coupons (kept for redemption history).
         */
        delete: operations["vendor_deactivate_coupon"];
        options?: never;
        head?: never;
        /**
         * Update Vendor Coupon
         * @description Update one of this vendor's coupons (code and scope are immutable).
         */
        patch: operations["vendor_update_coupon"];
        trace?: never;
    };
    "/api/v1/vendors/process-payment": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Process Payment
         * @description DEV ONLY: mark the registration fee paid and activate the salon without
         *     taking any money (DEMO MODE). Real payments go through
         *     /payments/registration/create-order + /verify.
         *
         *     Refused outside ENVIRONMENT=development: on any deployed environment it let
         *     a vendor/regular_buyer skip the registration fee with one empty POST.
         *     Allow-listed on `development` rather than deny-listed on `production` so an
         *     environment named e.g. "staging" can't reopen it. Only the legacy SPA ever
         *     called this; no live client does.
         */
        post: operations["process_payment_api_v1_vendors_process_payment_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/vendors/promotions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Promotions
         * @description Every promotion ever applied to this salon, newest first.
         */
        get: operations["vendor_list_promotions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/vendors/promotions/active": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Active Promotion
         * @description Get the vendor's current active or scheduled salon-wide promotion.
         */
        get: operations["vendor_get_active_promotion"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/vendors/promotions/apply": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Apply Promotion
         * @description Apply a discount promotion to all salon services.
         *
         *     Discount applies to every service (no per-service targeting).
         *     Supports percentage or flat-amount-off per service price.
         */
        post: operations["vendor_apply_promotion"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/vendors/salon": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Own Salon
         * @description Get own salon details.
         *
         *     Returns complete salon information including verification status and subscription.
         */
        get: operations["get_own_salon_api_v1_vendors_salon_get"];
        /**
         * Update Own Salon
         * @description Update own salon details.
         *
         *     Allows updating salon information like name, address, contact details, etc.
         */
        put: operations["update_own_salon_api_v1_vendors_salon_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/vendors/service-categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Service Categories
         * @description Get all active service categories
         */
        get: operations["vendor_get_service_categories"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/vendors/services": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Own Services
         * @description Get all services for own salon.
         *
         *     Returns services with category details, ordered by creation date (newest first).
         */
        get: operations["get_own_services_api_v1_vendors_services_get"];
        put?: never;
        /**
         * Create Service
         * @description Create new service for vendor's salon.
         *
         *     **Required Fields:**
         *     - name: Service name (2-255 chars)
         *     - duration_minutes: Duration in minutes (> 0)
         *     - price: Price (>= 0)
         *
         *     **Optional Fields:**
         *     - description: Service description
         *     - category_id: Service category UUID (recommended for category grouping)
         *     - image_url: Service image URL
         *
         *     **Note:** category_id is optional but highly recommended.
         *     Services without categories won't appear in category-grouped displays.
         */
        post: operations["create_service_api_v1_vendors_services_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/vendors/services/{service_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Update Service
         * @description Update existing service.
         *
         *     **Updatable Fields:**
         *     - name: Service name
         *     - description: Service description
         *     - duration_minutes: Duration
         *     - price: Price
         *     - category_id: Service category UUID
         *     - image_url: Image URL
         *     - is_active: Active status
         *     - available_for_booking: Booking availability
         *
         *     **Note:** All fields are optional. Only provided fields will be updated.
         */
        put: operations["update_service_api_v1_vendors_services__service_id__put"];
        post?: never;
        /**
         * Delete Service
         * @description Delete service.
         *
         *     Returns success message on successful deletion.
         */
        delete: operations["delete_service_api_v1_vendors_services__service_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Health Check
         * @description Health check endpoint. Returns detailed diagnostics in development,
         *     minimal response in production to avoid information disclosure.
         */
        get: operations["health_check_health_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /**
         * AccountDeleteRequest
         * @description Request to permanently delete the caller's own account.
         *
         *     Identity must be re-proven, but phone-first signups never choose a password
         *     (the client generates a throwaway), so an OTP sent to the number on file is
         *     accepted instead. Supply EITHER `password` OR `verification_id` + `otp`.
         */
        AccountDeleteRequest: {
            /**
             * Confirmation
             * @description Must be the literal string "DELETE" to guard against accidental calls
             */
            confirmation: string;
            /**
             * Otp
             * @description 6-digit code sent to the registered phone
             */
            otp?: string | null;
            /** Password */
            password?: string | null;
            /**
             * Verification Id
             * @description From POST /auth/me/delete/send-otp
             */
            verification_id?: string | null;
        };
        /**
         * AccountDeleteResponse
         * @description Response after a user deletes their own account
         */
        AccountDeleteResponse: {
            /** Deleted At */
            deleted_at: string;
            /** Message */
            message: string;
            /**
             * Retained Records
             * @default {}
             */
            retained_records?: {
                [key: string]: number;
            };
            /** Success */
            success: boolean;
        };
        /**
         * AdminCouponCreate
         * @description Coupon created by an admin. Can be platform-wide or scoped to a salon.
         */
        AdminCouponCreate: {
            /**
             * Applies To
             * @description service | convenience_fee | product
             */
            applies_to: string;
            /**
             * Code
             * @description Shareable coupon code
             */
            code: string;
            /**
             * Discount Type
             * @description percentage | flat_amount
             */
            discount_type: string;
            /** Discount Value */
            discount_value: number;
            /**
             * First Time Scope
             * @description Restrict to first-time users: 'platform' (first booking ever) or 'vendor' (first with this salon). Null = anyone.
             */
            first_time_scope?: string | null;
            /**
             * Funded By
             * @default platform
             */
            funded_by?: string;
            /**
             * Max Discount Cap
             * @description Cap for 'upto X%' style discounts
             */
            max_discount_cap?: number | null;
            /**
             * Min Order Amount
             * @description Minimum service subtotal to qualify
             */
            min_order_amount?: number | null;
            /**
             * Salon Id
             * @description Required when scope='vendor'
             */
            salon_id?: string | null;
            /**
             * Scope
             * @default platform
             */
            scope?: string;
            /** Title */
            title: string;
            /**
             * Usage Limit Per User
             * @description Redemptions allowed per user (null = unlimited)
             * @default 1
             */
            usage_limit_per_user?: number | null;
            /**
             * Usage Limit Total
             * @description Total redemptions allowed (null = unlimited)
             */
            usage_limit_total?: number | null;
            /**
             * Valid From
             * @description ISO datetime; defaults to now
             */
            valid_from?: string | null;
            /**
             * Valid Until
             * @description ISO datetime; null = no expiry
             */
            valid_until?: string | null;
        };
        /**
         * UserProfileUpdate
         * @description Request to update user profile details
         */
        app__schemas__request__auth__UserProfileUpdate: {
            /** Age */
            age?: number | null;
            /** Full Name */
            full_name?: string | null;
            /**
             * Gender
             * @description male, female, or other
             */
            gender?: string | null;
            /** Phone */
            phone?: string | null;
        };
        /**
         * UserProfileUpdate
         * @description Self-service profile edit for staff (`PUT /rm/profile`).
         */
        app__schemas__user__UserProfileUpdate: {
            /** Address */
            address?: string | null;
            /** City */
            city?: string | null;
            /** Full Name */
            full_name?: string | null;
            /**
             * Phone
             * @description Enter a 10-digit Indian mobile number starting with 6-9 (a +91 or 91 prefix is accepted and stripped)
             * @example 9876543210
             */
            phone?: string | null;
            /** Pincode */
            pincode?: string | null;
            /** State */
            state?: string | null;
        };
        /** AppConfigResponse */
        AppConfigResponse: {
            /**
             * Client App
             * @description customer-app | partner-app
             */
            client_app: string;
            /**
             * Current Version
             * @description The version the caller reported, echoed back
             */
            current_version?: string | null;
            /**
             * Latest Version
             * @description Newest release in the store
             */
            latest_version?: string | null;
            /** Message */
            message?: string | null;
            /**
             * Min Supported Version
             * @description Builds below this are blocked with HTTP 426
             */
            min_supported_version?: string | null;
            /**
             * Platform
             * @description ios | android
             */
            platform: string;
            /** Store Url */
            store_url?: string | null;
            /**
             * Success
             * @default true
             */
            success?: boolean;
            /**
             * Update Available
             * @description current_version < latest_version
             */
            update_available: boolean;
            /**
             * Update Required
             * @description current_version < min_supported_version
             */
            update_required: boolean;
        };
        /**
         * ApplicationStatusUpdate
         * @description Schema for updating application status
         */
        ApplicationStatusUpdate: {
            /** Admin Notes */
            admin_notes?: string | null;
            /** Interview Location */
            interview_location?: string | null;
            /** Interview Scheduled At */
            interview_scheduled_at?: string | null;
            /** Rejection Reason */
            rejection_reason?: string | null;
            /**
             * Status
             * @enum {string}
             */
            status: "pending" | "under_review" | "shortlisted" | "interview_scheduled" | "rejected" | "hired";
        };
        /**
         * AvailableCouponResponse
         * @description A customer-discoverable coupon (the 'available offers' list).
         */
        AvailableCouponResponse: {
            /** Applies To */
            applies_to: string;
            /** Code */
            code: string;
            /** Discount Type */
            discount_type: string;
            /** Discount Value */
            discount_value: number;
            /** First Time Scope */
            first_time_scope?: string | null;
            /** Id */
            id: string;
            /** Max Discount Cap */
            max_discount_cap?: number | null;
            /** Min Order Amount */
            min_order_amount?: number | null;
            /** Salon Id */
            salon_id?: string | null;
            /** Scope */
            scope: string;
            /** Subtitle */
            subtitle?: string | null;
            /** Summary */
            summary: string;
            /** Title */
            title?: string | null;
            /** Valid Until */
            valid_until?: string | null;
        };
        /**
         * AvailableSlotsResponse
         * @description Response for available booking slots
         */
        AvailableSlotsResponse: {
            /** Available Slots */
            available_slots: string[];
            /** Date */
            date: string;
            /** Salon Id */
            salon_id: string;
        };
        /**
         * BannerCreate
         * @description Schema for creating a new carousel banner.
         */
        BannerCreate: {
            /**
             * Ends At
             * @description Optional schedule window end (UTC)
             */
            ends_at?: string | null;
            /**
             * Image Url
             * @description Banner image URL (from the upload endpoint)
             */
            image_url: string;
            /**
             * Is Active
             * @description Whether the banner is shown in the app
             * @default true
             */
            is_active?: boolean;
            /**
             * Link Url
             * @description Optional tap target (deep link or external URL)
             */
            link_url?: string | null;
            /**
             * Sort Order
             * @description Ascending display order in the carousel
             * @default 0
             */
            sort_order?: number;
            /**
             * Starts At
             * @description Optional schedule window start (UTC)
             */
            starts_at?: string | null;
            /**
             * Title
             * @description Optional caption / alt text / admin label
             */
            title?: string | null;
        };
        /**
         * BannerDeleteResponse
         * @description Banner deletion response.
         */
        BannerDeleteResponse: {
            /** Banner Id */
            banner_id: string;
            /** Message */
            message: string;
            /**
             * Success
             * @default true
             */
            success?: boolean;
        };
        /**
         * BannerListResponse
         * @description Banner list response.
         */
        BannerListResponse: {
            /** Banners */
            banners: Record<string, never>[];
            /** Count */
            count: number;
            /**
             * Success
             * @default true
             */
            success?: boolean;
        };
        /**
         * BannerOperationResponse
         * @description Generic create/update/reorder acknowledgement.
         */
        BannerOperationResponse: {
            /** Banner */
            banner?: Record<string, never> | null;
            /** Message */
            message: string;
            /**
             * Success
             * @default true
             */
            success?: boolean;
        };
        /**
         * BannerOrderItem
         * @description A single (id, sort_order) pair used by the bulk reorder endpoint.
         */
        BannerOrderItem: {
            /**
             * Id
             * @description Banner UUID
             */
            id: string;
            /**
             * Sort Order
             * @description New ascending position
             */
            sort_order: number;
        };
        /**
         * BannerReorder
         * @description Bulk reorder payload — the full ordered set of banners from the admin UI.
         */
        BannerReorder: {
            /**
             * Orders
             * @description Banner id -> sort_order mapping
             */
            orders: components["schemas"]["BannerOrderItem"][];
        };
        /**
         * BannerUpdate
         * @description Schema for updating a banner (all fields optional).
         */
        BannerUpdate: {
            /** Ends At */
            ends_at?: string | null;
            /** Image Url */
            image_url?: string | null;
            /** Is Active */
            is_active?: boolean | null;
            /** Link Url */
            link_url?: string | null;
            /** Sort Order */
            sort_order?: number | null;
            /** Starts At */
            starts_at?: string | null;
            /** Title */
            title?: string | null;
        };
        /**
         * BlogPostCreate
         * @description Schema for creating a blog post.
         */
        BlogPostCreate: {
            /**
             * Author Name
             * @description Display byline
             */
            author_name?: string | null;
            /**
             * Content
             * @description Article body as HTML from the editor (sanitised server-side)
             * @default
             */
            content?: string;
            /**
             * Cover Image Alt
             * @description Cover image alt text (required when a cover is set)
             */
            cover_image_alt?: string | null;
            /**
             * Cover Image Url
             * @description Cover image URL from the upload endpoint
             */
            cover_image_url?: string | null;
            /**
             * Excerpt
             * @description Listing-card summary
             */
            excerpt?: string | null;
            /**
             * Faqs
             * @description Collapsible FAQ entries shown at the bottom of the article
             */
            faqs?: components["schemas"]["FaqItem"][] | null;
            /**
             * Focus Keyword
             * @description The term this article targets
             */
            focus_keyword?: string | null;
            /**
             * Meta Description
             * @description Search-result snippet; falls back to excerpt
             */
            meta_description?: string | null;
            /**
             * Meta Title
             * @description Search-result title; falls back to title
             */
            meta_title?: string | null;
            /**
             * Published At
             * @description Publication timestamp. A future value schedules the post; defaults to now when publishing
             */
            published_at?: string | null;
            /**
             * Slug
             * @description URL segment. Auto-generated from the title when omitted; uniqueness is enforced server-side
             */
            slug?: string | null;
            /**
             * Status
             * @description draft | published | archived
             * @default draft
             */
            status?: string;
            /**
             * Tags
             * @description Flat taxonomy; normalized to lowercase
             */
            tags?: string[] | null;
            /**
             * Title
             * @description Article headline
             */
            title: string;
        };
        /**
         * BlogPostDeleteResponse
         * @description Blog post deletion response.
         */
        BlogPostDeleteResponse: {
            /** Message */
            message: string;
            /** Post Id */
            post_id: string;
            /**
             * Success
             * @default true
             */
            success?: boolean;
        };
        /**
         * BlogPostListResponse
         * @description Paginated blog post list response.
         */
        BlogPostListResponse: {
            /** Count */
            count: number;
            /** Limit */
            limit: number;
            /** Offset */
            offset: number;
            /** Posts */
            posts: Record<string, never>[];
            /**
             * Success
             * @default true
             */
            success?: boolean;
            /** Total */
            total: number;
        };
        /**
         * BlogPostOperationResponse
         * @description Generic create/update acknowledgement.
         */
        BlogPostOperationResponse: {
            /** Message */
            message: string;
            /** Post */
            post?: Record<string, never> | null;
            /**
             * Success
             * @default true
             */
            success?: boolean;
        };
        /**
         * BlogPostUpdate
         * @description Schema for updating a blog post (all fields optional).
         */
        BlogPostUpdate: {
            /** Author Name */
            author_name?: string | null;
            /** Content */
            content?: string | null;
            /** Cover Image Alt */
            cover_image_alt?: string | null;
            /** Cover Image Url */
            cover_image_url?: string | null;
            /** Excerpt */
            excerpt?: string | null;
            /** Faqs */
            faqs?: components["schemas"]["FaqItem"][] | null;
            /** Focus Keyword */
            focus_keyword?: string | null;
            /** Meta Description */
            meta_description?: string | null;
            /** Meta Title */
            meta_title?: string | null;
            /** Published At */
            published_at?: string | null;
            /** Slug */
            slug?: string | null;
            /** Status */
            status?: string | null;
            /** Tags */
            tags?: string[] | null;
            /** Title */
            title?: string | null;
        };
        /**
         * BlogSitemapEntry
         * @description One URL entry for sitemap.xml generation.
         */
        BlogSitemapEntry: {
            /** Published At */
            published_at?: string | null;
            /** Slug */
            slug: string;
            /** Updated At */
            updated_at?: string | null;
        };
        /**
         * BlogSitemapResponse
         * @description Slug + timestamp feed consumed by the website's sitemap.xml function.
         */
        BlogSitemapResponse: {
            /** Count */
            count: number;
            /** Entries */
            entries: components["schemas"]["BlogSitemapEntry"][];
            /**
             * Success
             * @default true
             */
            success?: boolean;
        };
        /**
         * BlogTagsResponse
         * @description Distinct tags across published posts, for the blog index filter bar.
         */
        BlogTagsResponse: {
            /** Count */
            count: number;
            /**
             * Success
             * @default true
             */
            success?: boolean;
            /** Tags */
            tags: string[];
        };
        /** Body_admin_upload_service_category_icon */
        Body_admin_upload_service_category_icon: {
            /**
             * File
             * Format: binary
             */
            file: string;
        };
        /** Body_submit_career_application_api_v1_careers_apply_post */
        Body_submit_career_application_api_v1_careers_apply_post: {
            /**
             * Aadhaar Card
             * Format: binary
             */
            aadhaar_card: string;
            /** Age */
            age?: number | null;
            /** Cover Letter */
            cover_letter?: string | null;
            /** Current Address */
            current_address?: string | null;
            /**
             * Email
             * Format: email
             */
            email: string;
            /**
             * Experience Years
             * @default 0
             */
            experience_years?: number;
            /** Full Name */
            full_name: string;
            /** Highest Qualification */
            highest_qualification?: string | null;
            /** Permanent Address */
            permanent_address?: string | null;
            /** Phone */
            phone: string;
            /**
             * Photo
             * Format: binary
             */
            photo: string;
            /**
             * Position
             * @default Relationship Manager
             */
            position?: string;
            /**
             * Resume
             * Format: binary
             */
            resume: string;
        };
        /** Body_upload_agreement_document_api_v1_upload_agreement_document_post */
        Body_upload_agreement_document_api_v1_upload_agreement_document_post: {
            /**
             * File
             * Format: binary
             */
            file: string;
        };
        /** Body_upload_cloudinary_banner_image_api_v1_upload_cloudinary_banner_image_post */
        Body_upload_cloudinary_banner_image_api_v1_upload_cloudinary_banner_image_post: {
            /**
             * File
             * Format: binary
             */
            file: string;
        };
        /** Body_upload_cloudinary_blog_image_api_v1_upload_cloudinary_blog_image_post */
        Body_upload_cloudinary_blog_image_api_v1_upload_cloudinary_blog_image_post: {
            /**
             * File
             * Format: binary
             */
            file: string;
        };
        /** Body_upload_cloudinary_product_image_api_v1_upload_cloudinary_product_image_post */
        Body_upload_cloudinary_product_image_api_v1_upload_cloudinary_product_image_post: {
            /**
             * File
             * Format: binary
             */
            file: string;
        };
        /** Body_upload_salon_image_upload */
        Body_upload_salon_image_upload: {
            /**
             * File
             * Format: binary
             */
            file: string;
        };
        /** Body_vendor_update_booking_status */
        Body_vendor_update_booking_status: {
            /** Status */
            status: string;
        };
        /**
         * BookingCancelResponse
         * @description Booking cancel response
         */
        BookingCancelResponse: {
            /** Booking */
            booking?: Record<string, never> | null;
            /** Message */
            message: string;
            /** Success */
            success: boolean;
        };
        /**
         * BookingResponse
         * @description Booking response schema with multi-service support.
         *
         *     Notes on removed fields:
         *     - booking_time: Removed (use time_slots array)
         *     - customer_name/phone/email: Removed (fetched via profiles JOIN)
         *
         *     Customer data is returned in nested 'profiles' object when using JOIN query.
         */
        BookingResponse: {
            /**
             * Booking Date
             * Format: date
             */
            booking_date: string;
            /** Booking Number */
            booking_number: string;
            /** Cancellation Reason */
            cancellation_reason?: string | null;
            /** Cancelled At */
            cancelled_at?: string | null;
            /** Convenience Fee */
            convenience_fee: number;
            /**
             * Convenience Fee Discount
             * @description Coupon discount on the convenience fee
             * @default 0
             */
            convenience_fee_discount?: number;
            /**
             * Coupon Code
             * @description Snapshot of the applied coupon code
             */
            coupon_code?: string | null;
            /**
             * Coupon Id
             * @description Applied coupon id, if any
             */
            coupon_id?: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Created By */
            created_by?: string | null;
            /**
             * Customer
             * @description Customer profile data (aliased JOIN)
             */
            customer?: Record<string, never> | null;
            /**
             * Customer Email
             * @description Customer email (enriched)
             */
            customer_email?: string | null;
            /** Customer Id */
            customer_id: string;
            /**
             * Customer Name
             * @description Customer full name (enriched)
             */
            customer_name?: string | null;
            /**
             * Customer Phone
             * @description Customer phone (enriched)
             */
            customer_phone?: string | null;
            /** Deleted At */
            deleted_at?: string | null;
            /** Deleted By */
            deleted_by?: string | null;
            /**
             * Discount Amount
             * @description Coupon discount on the service price
             * @default 0
             */
            discount_amount?: number;
            /**
             * Duration Minutes
             * @default 60
             */
            duration_minutes?: number;
            /** Id */
            id: string;
            /** Notes */
            notes?: string | null;
            /**
             * Payment Method
             * @description Payment method (enriched)
             */
            payment_method?: string | null;
            /**
             * Payment Status
             * @description Payment status (enriched)
             */
            payment_status?: string | null;
            /**
             * Payments
             * @description Payment records from JOIN
             */
            payments?: Record<string, never>[] | null;
            /**
             * Profiles
             * @description Customer profile data from JOIN
             */
            profiles?: Record<string, never> | null;
            /** Salon Id */
            salon_id: string;
            /**
             * Salons
             * @description Salon data from JOIN
             */
            salons?: Record<string, never> | null;
            /** Service Price */
            service_price: number;
            /**
             * Services
             * @description Services JSONB array
             */
            services?: Record<string, never>[];
            /** Status */
            status: string;
            /**
             * Subtotal Service Price
             * @description Service total before coupon discount
             */
            subtotal_service_price?: number | null;
            /**
             * Time Slots
             * @description Appointment time slots (1-3)
             */
            time_slots?: string[];
            /** Total Amount */
            total_amount: number;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Updated By */
            updated_by?: string | null;
        };
        /**
         * BusinessType
         * @enum {string}
         */
        BusinessType: "salon" | "spa" | "clinic" | "unisex_salon" | "barber_shop" | "beauty_parlor" | "retail_shop" | "wholesale_buyer";
        /**
         * CareerApplicationResponse
         * @description Response after successful career application submission
         */
        CareerApplicationResponse: {
            /** Application Number */
            application_number: string;
            /**
             * Email Sent
             * @default true
             */
            email_sent?: boolean;
            /** Id */
            id: string;
            /** Message */
            message: string;
            /** Warning */
            warning?: string | null;
        };
        /**
         * CareerApplicationUpdateResponse
         * @description Response after updating career application status
         * @example {
         *       "application": {
         *         "admin_notes": "Good candidate",
         *         "application_number": "CA-20260112-A1B2C3D4",
         *         "email": "john@example.com",
         *         "full_name": "John Doe",
         *         "id": "a1b2c3d4-...",
         *         "status": "shortlisted",
         *         "updated_at": "2026-01-12T10:30:00Z"
         *       },
         *       "message": "Application updated successfully"
         *     }
         */
        CareerApplicationUpdateResponse: {
            /** Application */
            application: Record<string, never>;
            /** Message */
            message: string;
        };
        /**
         * CartCheckoutCreate
         * @description Schema for creating a booking from cart items
         */
        CartCheckoutCreate: {
            /**
             * Booking Date
             * @description Booking date (YYYY-MM-DD)
             */
            booking_date: string;
            /**
             * Coupon Code
             * @description Optional coupon code applied to this booking
             */
            coupon_code?: string | null;
            /** Notes */
            notes?: string | null;
            /**
             * Payment Method
             * @default razorpay
             */
            payment_method?: string | null;
            /** Razorpay Order Id */
            razorpay_order_id?: string | null;
            /** Razorpay Payment Id */
            razorpay_payment_id?: string | null;
            /** Razorpay Signature */
            razorpay_signature?: string | null;
            /**
             * Time Slots
             * @description Time slots (max 3)
             */
            time_slots: string[];
        };
        /**
         * CartClearResponse
         * @description Response for cart clear operation
         */
        CartClearResponse: {
            /** Deleted Count */
            deleted_count: number;
            /** Message */
            message: string;
            /** Success */
            success: boolean;
        };
        /**
         * CartItem
         * @description Cart item schema
         */
        CartItem: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Id */
            id: string;
            /** Line Total */
            line_total: number;
            /** Metadata */
            metadata: Record<string, never>;
            /** Quantity */
            quantity: number;
            /** Salon Details */
            salon_details: Record<string, never>;
            /** Salon Id */
            salon_id: string;
            /** Service Details */
            service_details: Record<string, never>;
            /** Service Id */
            service_id: string;
            /** Unit Price */
            unit_price: number;
        };
        /**
         * CartItemCreate
         * @description Normalized cart item - no denormalized fields.
         *     Note: salon_id is optional since it's derived from the service.
         */
        CartItemCreate: {
            /** Metadata */
            metadata?: Record<string, never> | null;
            /**
             * Quantity
             * @default 1
             */
            quantity?: number;
            /** Salon Id */
            salon_id?: string | null;
            /** Service Id */
            service_id: string;
        };
        /** CartItemUpdate */
        CartItemUpdate: {
            /** Quantity */
            quantity: number;
        };
        /**
         * CartOperationResponse
         * @description Response for cart add/update operations
         */
        CartOperationResponse: {
            /** Cart Item */
            cart_item?: Record<string, never> | null;
            /** Message */
            message: string;
            /** Success */
            success: boolean;
        };
        /**
         * CartOrderCreate
         * @description Optional body for creating a cart convenience-fee order.
         */
        CartOrderCreate: {
            /**
             * Booking Date
             * @description Chosen appointment date (YYYY-MM-DD), for webhook recovery only
             */
            booking_date?: string | null;
            /**
             * Coupon Code
             * @description Optional coupon code to apply
             */
            coupon_code?: string | null;
            /**
             * Time Slots
             * @description Chosen time slots (max 3), for webhook recovery only
             */
            time_slots?: string[] | null;
        };
        /**
         * CartResponse
         * @description Cart response schema
         */
        CartResponse: {
            /** Item Count */
            item_count: number;
            /** Items */
            items: components["schemas"]["CartItem"][];
            /** Salon Details */
            salon_details?: Record<string, never> | null;
            /** Salon Id */
            salon_id?: string | null;
            /** Salon Name */
            salon_name?: string | null;
            /** Success */
            success: boolean;
            /** Total Amount */
            total_amount: number;
        };
        /**
         * CompleteRegistrationRequest
         * @description Schema for vendor registration completion
         */
        CompleteRegistrationRequest: {
            /**
             * Age
             * @description Age must be between 18 and 120
             */
            age: number;
            /** Confirm Password */
            confirm_password: string;
            /** Full Name */
            full_name: string;
            /**
             * Gender
             * @description Gender: male, female, or other
             */
            gender: string;
            /** Password */
            password: string;
            /** Token */
            token: string;
        };
        /**
         * CompleteRegistrationResponse
         * @description Response for vendor registration completion
         */
        CompleteRegistrationResponse: {
            /** Data */
            data: Record<string, never>;
            /** Message */
            message: string;
            /**
             * Success
             * @default true
             */
            success?: boolean;
        } & {
            [key: string]: unknown;
        };
        /**
         * CouponDiscountBreakdown
         * @description Pricing breakdown returned when a coupon is validated/applied.
         */
        CouponDiscountBreakdown: {
            /** Convenience Fee Base */
            convenience_fee_base: number;
            /** Convenience Fee Discount */
            convenience_fee_discount: number;
            /** Convenience Fee Due */
            convenience_fee_due: number;
            /** Discount Amount */
            discount_amount: number;
            /** Discount Source */
            discount_source?: string | null;
            /** Service Total Due */
            service_total_due: number;
            /** Subtotal Service Price */
            subtotal_service_price: number;
            /** Total Amount */
            total_amount: number;
        };
        /** CouponResponse */
        CouponResponse: {
            /** Applies To */
            applies_to: string;
            /** Code */
            code: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Created By */
            created_by?: string | null;
            /** Discount Type */
            discount_type: string;
            /** Discount Value */
            discount_value: number;
            /** First Time Scope */
            first_time_scope?: string | null;
            /** Funded By */
            funded_by: string;
            /** Id */
            id: string;
            /** Is Active */
            is_active: boolean;
            /** Max Discount Cap */
            max_discount_cap?: number | null;
            /** Min Order Amount */
            min_order_amount?: number | null;
            /** Salon Id */
            salon_id?: string | null;
            /** Scope */
            scope: string;
            /** Title */
            title: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Usage Limit Per User */
            usage_limit_per_user?: number | null;
            /** Usage Limit Total */
            usage_limit_total?: number | null;
            /**
             * Used Count
             * @default 0
             */
            used_count?: number;
            /** Valid From */
            valid_from?: string | null;
            /** Valid Until */
            valid_until?: string | null;
        } & {
            [key: string]: unknown;
        };
        /**
         * CouponUpdate
         * @description Partial update for a coupon. Code/scope are immutable post-creation.
         */
        CouponUpdate: {
            /** Discount Value */
            discount_value?: number | null;
            /** Is Active */
            is_active?: boolean | null;
            /** Max Discount Cap */
            max_discount_cap?: number | null;
            /** Min Order Amount */
            min_order_amount?: number | null;
            /** Title */
            title?: string | null;
            /** Usage Limit Per User */
            usage_limit_per_user?: number | null;
            /** Usage Limit Total */
            usage_limit_total?: number | null;
            /** Valid Until */
            valid_until?: string | null;
        };
        /**
         * CouponValidateRequest
         * @description Preview a coupon against the caller's current cart ('Apply coupon' button).
         */
        CouponValidateRequest: {
            /** Code */
            code: string;
        };
        /**
         * CouponValidationResult
         * @description Result of validating a coupon against a cart.
         */
        CouponValidationResult: {
            breakdown?: components["schemas"]["CouponDiscountBreakdown"] | null;
            /** Coupon Code */
            coupon_code?: string | null;
            /** Coupon Id */
            coupon_id?: string | null;
            /** Reason */
            reason?: string | null;
            /** Valid */
            valid: boolean;
        };
        /** CreateOrderRequest */
        CreateOrderRequest: {
            /** Coupon Code */
            coupon_code?: string | null;
            /** Items */
            items: components["schemas"]["OrderItemSchema"][];
            /** Shipping Address */
            shipping_address: Record<string, never>;
        };
        /**
         * CustomerBookingsResponse
         * @description Customer bookings list response
         */
        CustomerBookingsResponse: {
            /** Count */
            count: number;
            /** Data */
            data: Record<string, never>[];
            /** Success */
            success: boolean;
        };
        /**
         * CustomerReviewsResponse
         * @description Customer reviews response
         */
        CustomerReviewsResponse: {
            /** Count */
            count: number;
            /** Reviews */
            reviews: Record<string, never>[];
            /** Success */
            success: boolean;
        };
        /**
         * DeviceRegister
         * @description A phone's Expo push token, sent by the mobile app after sign-in.
         */
        DeviceRegister: {
            /**
             * App
             * @enum {string}
             */
            app: "partner-app" | "customer-app";
            /** Device Id */
            device_id?: string | null;
            /**
             * Expo Push Token
             * @description ExponentPushToken[...] from expo-notifications
             */
            expo_push_token: string;
            /**
             * Platform
             * @enum {string}
             */
            platform: "android" | "ios";
        };
        /** DeviceUnregister */
        DeviceUnregister: {
            /** Expo Push Token */
            expo_push_token: string;
        };
        /**
         * FaqItem
         * @description One collapsible question/answer pair. Plain text — no HTML allowed.
         */
        FaqItem: {
            /** Answer */
            answer: string;
            /** Question */
            question: string;
        };
        /**
         * FavoriteCreate
         * @description Add salon to favorites
         */
        FavoriteCreate: {
            /** Salon Id */
            salon_id: string;
        };
        /**
         * FavoriteOperationResponse
         * @description Favorite add/remove response
         */
        FavoriteOperationResponse: {
            /** Favorite */
            favorite?: Record<string, never> | null;
            /** Message */
            message: string;
            /** Success */
            success: boolean;
        };
        /**
         * FavoritesResponse
         * @description Customer favorites response
         */
        FavoritesResponse: {
            /** Count */
            count: number;
            /** Favorites */
            favorites: Record<string, never>[];
            /** Success */
            success: boolean;
        };
        /**
         * FeatureListResponse
         * @description Full registry with metadata. Internal staff only.
         */
        FeatureListResponse: {
            /** Features */
            features: Record<string, never>[];
            /**
             * Success
             * @default true
             */
            success?: boolean;
        };
        /**
         * FeatureMapResponse
         * @description {key: status} map driving what the admin panel renders.
         *
         *     For a client admin this contains ONLY entitled features — unsold ones are
         *     absent rather than present-and-false, so the payload never hints that a
         *     hidden feature exists.
         */
        FeatureMapResponse: {
            /** Features */
            features: {
                [key: string]: string;
            };
            /**
             * Is Internal
             * @default false
             */
            is_internal?: boolean;
            /**
             * Success
             * @default true
             */
            success?: boolean;
        };
        /**
         * FeatureOperationResponse
         * @description Acknowledgement for a status change.
         */
        FeatureOperationResponse: {
            /** Feature */
            feature?: Record<string, never> | null;
            /** Message */
            message: string;
            /**
             * Success
             * @default true
             */
            success?: boolean;
        };
        /**
         * FeatureStatusUpdate
         * @description Flip a feature's entitlement status.
         */
        FeatureStatusUpdate: {
            /**
             * Status
             * @description internal = staff only (built, unsold) | enabled = client has it | disabled = off for everyone (kill switch)
             * @example enabled
             */
            status: string;
        };
        /** FeedbackReviewCreate */
        FeedbackReviewCreate: {
            /** Comment */
            comment: string;
            /** Rating */
            rating: number;
            /** Token */
            token: string;
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /**
         * ImageUploadResponse
         * @description Response for single image upload
         */
        ImageUploadResponse: {
            /** Filename */
            filename: string;
            /** Path */
            path: string;
            /**
             * Success
             * @default true
             */
            success?: boolean;
            /** Url */
            url: string;
        };
        /** LoginRequest */
        LoginRequest: {
            /**
             * Email
             * Format: email
             */
            email: string;
            /** Password */
            password: string;
        };
        /** LoginResponse */
        LoginResponse: {
            /** Access Token */
            access_token: string;
            /** Refresh Token */
            refresh_token: string;
            /** Success */
            success: boolean;
            /**
             * Token Type
             * @default bearer
             */
            token_type?: string;
            /** User */
            user: Record<string, never>;
        };
        /**
         * LogoutAllRequest
         * @description Request to logout from all devices
         */
        LogoutAllRequest: {
            /** Password */
            password: string;
        };
        /**
         * NearbySalonsResponse
         * @description Response containing nearby salons.
         *
         *     Rows are typed as SalonListResponse so this endpoint publishes the same
         *     vetted public field set as the other listings — the PostGIS
         *     `get_nearby_salons` function selects whole salon rows (vendor_id and
         *     assigned_rm included), which untyped dict rows would have passed straight
         *     through to anonymous callers.
         */
        NearbySalonsResponse: {
            /** Count */
            count: number;
            /** Query */
            query: Record<string, never>;
            /** Salons */
            salons: components["schemas"]["SalonListResponse"][];
        };
        /** OrderItemSchema */
        OrderItemSchema: {
            /** Product Id */
            product_id: string;
            /**
             * Quantity
             * @default 1
             */
            quantity?: number;
        };
        /**
         * OutletType
         * @enum {string}
         */
        OutletType: "franchisee" | "Company owned";
        /**
         * PartnerRequestCreate
         * @description Schema for submitting a 'Partner with us' onboarding inquiry
         */
        PartnerRequestCreate: {
            /**
             * Email
             * Format: email
             */
            email: string;
            /** Location */
            location: string;
            /** Owner Name */
            owner_name: string;
            /** Phone */
            phone: string;
            /** Shop Name */
            shop_name: string;
            /**
             * Shop Type
             * @enum {string}
             */
            shop_type: "Salon" | "Spa" | "Clinic" | "Other";
        };
        /**
         * PartnerRequestResponse
         * @description Response after a successful partner request submission
         */
        PartnerRequestResponse: {
            /** Id */
            id: string;
            /** Message */
            message: string;
        };
        /**
         * PartnerRequestStatusUpdate
         * @description Schema for updating a partner request's status (admin only)
         */
        PartnerRequestStatusUpdate: {
            /** Admin Notes */
            admin_notes?: string | null;
            /**
             * Status
             * @enum {string}
             */
            status: "new" | "contacted" | "approved" | "rejected";
        };
        /**
         * PartnerRequestUpdateResponse
         * @description Response after updating a partner request (admin)
         */
        PartnerRequestUpdateResponse: {
            /** Message */
            message: string;
            /** Request */
            request: Record<string, never>;
        };
        /**
         * PasswordResetConfirm
         * @description Request to confirm password reset with token
         */
        PasswordResetConfirm: {
            /** New Password */
            new_password: string;
            /** Token */
            token: string;
        };
        /** PasswordResetConfirmResponse */
        PasswordResetConfirmResponse: {
            /** Access Token */
            access_token?: string | null;
            /** Message */
            message: string;
            /** Refresh Token */
            refresh_token?: string | null;
            /** Success */
            success: boolean;
            /** User */
            user?: Record<string, never> | null;
        };
        /**
         * PasswordResetRequest
         * @description Request to initiate password reset
         */
        PasswordResetRequest: {
            /**
             * Email
             * Format: email
             */
            email: string;
        };
        /** PasswordResetResponse */
        PasswordResetResponse: {
            /** Message */
            message: string;
            /** Success */
            success: boolean;
        };
        /** PaymentVerification */
        PaymentVerification: {
            /** Razorpay Order Id */
            razorpay_order_id: string;
            /** Razorpay Payment Id */
            razorpay_payment_id: string;
            /** Razorpay Signature */
            razorpay_signature: string;
        };
        /**
         * PhoneLoginSendOTPRequest
         * @description Request to send OTP to phone number for login
         */
        PhoneLoginSendOTPRequest: {
            /**
             * Country Code
             * @description Country code (default: 91 for India)
             * @default 91
             */
            country_code?: string | null;
            /**
             * Phone
             * @description Phone number (10 digits for India, or with country code like +919876543210)
             */
            phone: string;
        };
        /**
         * PhoneLoginSendOTPResponse
         * @description Response after sending OTP to phone
         */
        PhoneLoginSendOTPResponse: {
            /** Customer Name */
            customer_name?: string | null;
            /**
             * Expires In
             * @default 300
             */
            expires_in?: number;
            /** Message */
            message: string;
            /** Phone */
            phone: string;
            /** Success */
            success: boolean;
            /** Verification Id */
            verification_id: string;
        };
        /**
         * PhoneLoginVerifyOTPRequest
         * @description Request to verify OTP and login via phone
         */
        PhoneLoginVerifyOTPRequest: {
            /**
             * Country Code
             * @description Country code (default: 91 for India)
             * @default 91
             */
            country_code?: string | null;
            /**
             * Otp
             * @description 6-digit OTP code
             */
            otp: string;
            /**
             * Phone
             * @description Phone number used to receive OTP
             */
            phone: string;
            /**
             * Verification Id
             * @description Verification ID returned from send-otp endpoint
             */
            verification_id: string;
        };
        /**
         * PhoneLoginVerifyOTPResponse
         * @description Response after successful OTP verification and login
         */
        PhoneLoginVerifyOTPResponse: {
            /** Access Token */
            access_token: string;
            /** Message */
            message: string;
            /** Refresh Token */
            refresh_token: string;
            /** Success */
            success: boolean;
            /**
             * Token Type
             * @default bearer
             */
            token_type?: string;
            /** User */
            user: Record<string, never>;
        };
        /**
         * PhoneSignupSendOTPRequest
         * @description Request to send OTP to phone number for signup
         */
        PhoneSignupSendOTPRequest: {
            /**
             * Country Code
             * @description Country code (default: 91 for India)
             * @default 91
             */
            country_code?: string | null;
            /**
             * Phone
             * @description Phone number (10 digits for India, or with country code like +919876543210)
             */
            phone: string;
        };
        /**
         * PhoneSignupVerifyOTPRequest
         * @description Request to verify OTP for phone signup
         */
        PhoneSignupVerifyOTPRequest: {
            /**
             * Otp
             * @description 6-digit OTP code
             */
            otp: string;
            /**
             * Phone
             * @description Phone number used to receive OTP
             */
            phone: string;
            /**
             * Verification Id
             * @description Verification ID returned from send-otp endpoint
             */
            verification_id: string;
        };
        /**
         * PhoneVerificationConfirmRequest
         * @description Request to confirm phone verification with OTP
         */
        PhoneVerificationConfirmRequest: {
            /**
             * Otp
             * @description 6-digit OTP code
             */
            otp: string;
            /**
             * Phone
             * @description Phone number being verified
             */
            phone: string;
            /**
             * Verification Id
             * @description Verification ID from send-otp endpoint
             */
            verification_id: string;
        };
        /**
         * PhoneVerificationConfirmResponse
         * @description Response after confirming phone verification
         */
        PhoneVerificationConfirmResponse: {
            /** Message */
            message: string;
            /** Phone */
            phone: string;
            /** Phone Verified */
            phone_verified: boolean;
            /** Success */
            success: boolean;
        };
        /**
         * PhoneVerificationSendOTPRequest
         * @description Request to send OTP for phone verification (for authenticated users)
         */
        PhoneVerificationSendOTPRequest: {
            /**
             * Country Code
             * @description Country code (default: 91 for India)
             * @default 91
             */
            country_code?: string | null;
            /**
             * Phone
             * @description New or existing phone number to verify in E.164 format
             */
            phone: string;
        };
        /**
         * PhoneVerificationSendOTPResponse
         * @description Response after sending OTP for phone verification (during signup/profile update)
         */
        PhoneVerificationSendOTPResponse: {
            /**
             * Expires In
             * @default 300
             */
            expires_in?: number;
            /** Message */
            message: string;
            /** Phone */
            phone: string;
            /** Success */
            success: boolean;
            /** Verification Id */
            verification_id: string;
        };
        /**
         * PopularCitiesResponse
         * @description Response for popular cities endpoint
         * @example {
         *       "cities": [
         *         {
         *           "city": "Mumbai",
         *           "salon_count": 124
         *         },
         *         {
         *           "city": "Delhi",
         *           "salon_count": 98
         *         },
         *         {
         *           "city": "Bangalore",
         *           "salon_count": 87
         *         }
         *       ],
         *       "total": 3
         *     }
         */
        PopularCitiesResponse: {
            /**
             * Cities
             * @description List of cities sorted by salon count
             */
            cities: components["schemas"]["PopularCityResponse"][];
            /**
             * Total
             * @description Total number of cities returned
             */
            total: number;
        };
        /**
         * PopularCityResponse
         * @description Single city with salon count
         * @example {
         *       "city": "Mumbai",
         *       "salon_count": 124
         *     }
         */
        PopularCityResponse: {
            /**
             * City
             * @description City name (normalized to Title Case)
             */
            city: string;
            /**
             * Salon Count
             * @description Number of salons in this city
             */
            salon_count: number;
        };
        /**
         * ProductCartItem
         * @description A single processed product-cart line item.
         */
        ProductCartItem: {
            /** Id */
            id: string;
            /** Image Url */
            image_url?: string | null;
            /**
             * Image Urls
             * @default []
             */
            image_urls?: string[];
            /**
             * Is Active
             * @default true
             */
            is_active?: boolean;
            /**
             * Is B2B Price
             * @default false
             */
            is_b2b_price?: boolean;
            /** Name */
            name?: string | null;
            /** Price */
            price: number;
            /** Product Id */
            product_id: string;
            /** Quantity */
            quantity: number;
            /** Total */
            total: number;
        };
        /** ProductCartItemAdd */
        ProductCartItemAdd: {
            /** Product Id */
            product_id: string;
            /**
             * Quantity
             * @default 1
             */
            quantity?: number;
        };
        /** ProductCartItemUpdate */
        ProductCartItemUpdate: {
            /** Quantity */
            quantity: number;
        };
        /**
         * ProductCartOperationResponse
         * @description Generic add/update/remove/clear acknowledgement.
         */
        ProductCartOperationResponse: {
            /** Message */
            message: string;
            /**
             * Success
             * @default true
             */
            success?: boolean;
        };
        /**
         * ProductCartResponse
         * @description Full product cart with computed totals.
         */
        ProductCartResponse: {
            /** Item Count */
            item_count: number;
            /** Items */
            items: components["schemas"]["ProductCartItem"][];
            /**
             * Success
             * @default true
             */
            success?: boolean;
            /** Total Amount */
            total_amount: number;
        };
        /**
         * ProductCouponDiscountBreakdown
         * @description Pricing breakdown returned when a product-order coupon is validated/applied.
         */
        ProductCouponDiscountBreakdown: {
            /** Discount Amount */
            discount_amount: number;
            /** Subtotal */
            subtotal: number;
            /** Total Amount */
            total_amount: number;
        };
        /**
         * ProductCouponValidationResult
         * @description Result of validating a coupon against a product order.
         */
        ProductCouponValidationResult: {
            breakdown?: components["schemas"]["ProductCouponDiscountBreakdown"] | null;
            /** Coupon Code */
            coupon_code?: string | null;
            /** Coupon Id */
            coupon_id?: string | null;
            /** Reason */
            reason?: string | null;
            /** Valid */
            valid: boolean;
        };
        /**
         * ProductCreate
         * @description Schema for creating a new product
         */
        ProductCreate: {
            /**
             * B2B Discount Percentage
             * @description Wholesale discount percentage
             */
            b2b_discount_percentage?: number | null;
            /**
             * B2B Discount Price
             * @description Wholesale discounted price for vendors
             */
            b2b_discount_price?: number | null;
            /**
             * Brand
             * @description Brand name
             */
            brand?: string | null;
            /**
             * Category
             * @description Product category
             * @default general
             */
            category?: string;
            /**
             * Description
             * @description Full product description
             */
            description?: string | null;
            /**
             * Discount Percentage
             * @description Discount percentage
             */
            discount_percentage?: number | null;
            /**
             * Discount Price
             * @description Discounted sale price
             */
            discount_price?: number | null;
            /**
             * Image Urls
             * @description Array of image URLs
             */
            image_urls?: string[];
            /**
             * Is Active
             * @description Whether product is visible
             * @default true
             */
            is_active?: boolean;
            /**
             * Is Featured
             * @description Whether product appears in featured carousel
             * @default false
             */
            is_featured?: boolean;
            /**
             * Name
             * @description Product name
             */
            name: string;
            /**
             * Price
             * @description Product price
             */
            price: number;
            /**
             * Short Description
             * @description Short description for catalog cards
             */
            short_description?: string | null;
            /**
             * Sku
             * @description Stock keeping unit
             */
            sku?: string | null;
            /**
             * Slug
             * @description URL-friendly slug (auto-generated if not provided)
             */
            slug?: string | null;
            /**
             * Stock Quantity
             * @description Available stock quantity
             * @default 0
             */
            stock_quantity?: number;
            /**
             * Tags
             * @description Searchable tags
             */
            tags?: string[];
            /**
             * Weight
             * @description Weight/volume (e.g. 250ml, 100g)
             */
            weight?: string | null;
        };
        /**
         * ProductDeleteResponse
         * @description Product deletion response
         */
        ProductDeleteResponse: {
            /** Message */
            message: string;
            /** Product Id */
            product_id: string;
            /**
             * Success
             * @default true
             */
            success?: boolean;
        };
        /**
         * ProductFavoriteCreate
         * @description Add product to favorites
         */
        ProductFavoriteCreate: {
            /** Product Id */
            product_id: string;
        };
        /**
         * ProductListResponse
         * @description Product list response with pagination
         */
        ProductListResponse: {
            /** Count */
            count: number;
            /**
             * Limit
             * @default 50
             */
            limit?: number;
            /**
             * Offset
             * @default 0
             */
            offset?: number;
            /** Products */
            products: Record<string, never>[];
            /**
             * Success
             * @default true
             */
            success?: boolean;
            /** Total */
            total?: number | null;
        };
        /**
         * ProductOperationResponse
         * @description Generic product operation response
         */
        ProductOperationResponse: {
            /** Message */
            message: string;
            /** Product */
            product?: Record<string, never> | null;
            /**
             * Success
             * @default true
             */
            success?: boolean;
        };
        /**
         * ProductResponse
         * @description Single product response
         */
        ProductResponse: {
            /** Product */
            product: Record<string, never>;
            /**
             * Success
             * @default true
             */
            success?: boolean;
        };
        /**
         * ProductUpdate
         * @description Schema for updating a product (all fields optional)
         */
        ProductUpdate: {
            /** B2B Discount Percentage */
            b2b_discount_percentage?: number | null;
            /** B2B Discount Price */
            b2b_discount_price?: number | null;
            /** Brand */
            brand?: string | null;
            /** Category */
            category?: string | null;
            /** Description */
            description?: string | null;
            /** Discount Percentage */
            discount_percentage?: number | null;
            /** Discount Price */
            discount_price?: number | null;
            /** Image Urls */
            image_urls?: string[] | null;
            /** Is Active */
            is_active?: boolean | null;
            /** Is Featured */
            is_featured?: boolean | null;
            /** Name */
            name?: string | null;
            /** Price */
            price?: number | null;
            /** Short Description */
            short_description?: string | null;
            /** Sku */
            sku?: string | null;
            /** Slug */
            slug?: string | null;
            /** Stock Quantity */
            stock_quantity?: number | null;
            /** Tags */
            tags?: string[] | null;
            /** Weight */
            weight?: string | null;
        };
        /** ProfileResponse */
        ProfileResponse: {
            /** Address Line1 */
            address_line1?: string | null;
            /** Address Line2 */
            address_line2?: string | null;
            /** Avatar Url */
            avatar_url?: string | null;
            /** City */
            city?: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Deleted At */
            deleted_at?: string | null;
            /**
             * Email
             * Format: email
             */
            email: string;
            /** Full Name */
            full_name: string;
            /** Id */
            id: string;
            /** Is Active */
            is_active: boolean;
            /** Phone */
            phone?: string | null;
            /** Phone Verification Method */
            phone_verification_method?: string | null;
            /** Phone Verified */
            phone_verified: boolean;
            /** Phone Verified At */
            phone_verified_at?: string | null;
            /** Pincode */
            pincode?: string | null;
            /** State */
            state?: string | null;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            user_role: components["schemas"]["UserRole"];
        };
        /**
         * PublicConfigResponse
         * @description Response for public system configuration
         */
        PublicConfigResponse: {
            /** Configs */
            configs: Record<string, never>;
            /** Error */
            error?: string | null;
            /** Success */
            success: boolean;
        };
        /**
         * PublicSalonResponse
         * @description Public detail view of a salon (`GET /salons/{id}`).
         *
         *     Same security boundary as SalonListResponse, plus the fields a detail page
         *     needs. `phone` and `email` are the salon's published contact details: the
         *     web app renders them as `tel:` / `mailto:` links and the mobile app dials
         *     `phone`, so they are public by design — but only here, never on the cards.
         */
        PublicSalonResponse: {
            /**
             * Accepting Bookings
             * @default true
             */
            accepting_bookings?: boolean | null;
            /** Address */
            address?: string | null;
            /** Average Rating */
            average_rating?: number | null;
            /** Business Hours */
            business_hours?: Record<string, never> | null;
            /** Business Name */
            business_name: string;
            business_type?: components["schemas"]["BusinessType"] | null;
            /** City */
            city: string;
            /** Closing Time */
            closing_time?: string | null;
            /** Coupons */
            coupons?: components["schemas"]["AvailableCouponResponse"][] | null;
            /** Cover Images */
            cover_images?: string[] | null;
            /** Created At */
            created_at?: string | null;
            /** Description */
            description?: string | null;
            /** Distance Km */
            distance_km?: number | null;
            /** Email */
            email?: string | null;
            /** Facilities */
            facilities?: {
                [key: string]: boolean;
            } | null;
            /** Has Discounted Services */
            has_discounted_services?: boolean | null;
            /** Id */
            id: string;
            /** Is Active */
            is_active: boolean;
            /** Latitude */
            latitude?: number | null;
            /** Logo Url */
            logo_url?: string | null;
            /** Longitude */
            longitude?: number | null;
            /** Max Discount Percentage */
            max_discount_percentage?: number | null;
            /** Opening Time */
            opening_time?: string | null;
            outlet?: components["schemas"]["OutletType"] | null;
            /** Phone */
            phone?: string | null;
            /** Pincode */
            pincode?: string | null;
            /** Platform Coupons */
            platform_coupons?: components["schemas"]["AvailableCouponResponse"][] | null;
            /** Salon Type */
            salon_type?: string | null;
            /** State */
            state: string;
            /** Total Reviews */
            total_reviews?: number | null;
            /** Working Days */
            working_days?: string[] | null;
        };
        /**
         * PublicSalonReviewsResponse
         * @description Public salon reviews response
         */
        PublicSalonReviewsResponse: {
            /** Count */
            count: number;
            /** Reviews */
            reviews: Record<string, never>[];
            /** Success */
            success: boolean;
        };
        /**
         * PublicSalonsResponse
         * @description Response for public salons listing with pagination
         */
        PublicSalonsResponse: {
            /** Count */
            count: number;
            /** Limit */
            limit: number;
            /** Offset */
            offset: number;
            /** Salons */
            salons: components["schemas"]["SalonListResponse"][];
        };
        /** RazorpayOrderResponse */
        RazorpayOrderResponse: {
            /** Amount */
            amount: number;
            /** Amount Paise */
            amount_paise: number;
            /** Booking Id */
            booking_id?: string | null;
            /** Breakdown */
            breakdown?: Record<string, never> | null;
            /** Currency */
            currency: string;
            /** Key Id */
            key_id: string;
            /** Order Id */
            order_id: string;
        };
        /**
         * RefreshTokenRequest
         * @description Request to refresh access token
         */
        RefreshTokenRequest: {
            /** Refresh Token */
            refresh_token: string;
        };
        /**
         * RequestStatus
         * @enum {string}
         */
        RequestStatus: "draft" | "pending" | "approved" | "rejected";
        /** ReviewCreate */
        ReviewCreate: {
            /** Booking Id */
            booking_id?: string | null;
            /** Comment */
            comment: string;
            /** Rating */
            rating: number;
            /** Salon Id */
            salon_id: string;
        };
        /**
         * ReviewFeedbackContextResponse
         * @description Public feedback page context loaded from a signed email token
         */
        ReviewFeedbackContextResponse: {
            /** Booking */
            booking: Record<string, never>;
            /** Existing Review */
            existing_review?: Record<string, never> | null;
            /** Salon */
            salon: Record<string, never>;
            /** Success */
            success: boolean;
        };
        /**
         * ReviewOperationResponse
         * @description Review create/update response
         */
        ReviewOperationResponse: {
            /** Message */
            message: string;
            /** Review */
            review?: Record<string, never> | null;
            /** Success */
            success: boolean;
        };
        /** ReviewUpdate */
        ReviewUpdate: {
            /** Comment */
            comment?: string | null;
            /** Rating */
            rating?: number | null;
        };
        /**
         * RMDashboardResponse
         * @description Response for RM dashboard
         */
        RMDashboardResponse: {
            /**
             * Profile
             * @description RM profile information
             */
            profile: Record<string, never>;
            /**
             * Recent Scores
             * @description Recent score changes
             */
            recent_scores: Record<string, never>[];
            /** @description Dashboard statistics */
            statistics: components["schemas"]["RMDashboardStatistics"];
        };
        /**
         * RMDashboardStatistics
         * @description RM dashboard statistics
         */
        RMDashboardStatistics: {
            /**
             * Active Salons
             * @description Currently active salons
             */
            active_salons: number;
            /**
             * Approved Requests
             * @description Approved vendor requests
             */
            approved_requests: number;
            /**
             * Pending Requests
             * @description Pending vendor requests
             */
            pending_requests: number;
            /**
             * Rejected Requests
             * @description Rejected vendor requests
             */
            rejected_requests: number;
            /**
             * Total Approved Salons
             * @description Total approved salons
             */
            total_approved_salons: number;
            /**
             * Total Salons Added
             * @description Total salons added by RM
             */
            total_salons_added: number;
            /**
             * Total Score
             * @description Total performance score
             */
            total_score: number;
        };
        /**
         * RMLeaderboardResponse
         * @description Response for RM leaderboard
         */
        RMLeaderboardResponse: {
            /**
             * Data
             * @description List of top RMs with rankings
             */
            data: Record<string, never>[];
            /** Message */
            message: string;
            /**
             * Success
             * @default true
             */
            success?: boolean;
            /**
             * Total
             * @description Total number of RMs in leaderboard
             */
            total: number;
        };
        /**
         * RMProfileResponse
         * @description RM profile response with user profile joined
         */
        RMProfileResponse: {
            /** Assigned Territories */
            assigned_territories?: string[] | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Employee Id */
            employee_id?: string | null;
            /** Id */
            id: string;
            /** Joining Date */
            joining_date?: string | null;
            /** Manager Notes */
            manager_notes?: string | null;
            /** Performance Score */
            performance_score: number;
            /** @description User profile data (name, email, phone, etc) */
            profiles?: components["schemas"]["ProfileResponse"] | null;
            /**
             * Total Approved Salons
             * @default 0
             */
            total_approved_salons?: number | null;
            /**
             * Total Salons Added
             * @default 0
             */
            total_salons_added?: number | null;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * RMProfileUpdate
         * @description Update RM profile. Profile fields (name, phone, email, is_active) update profiles table.
         *     RM-specific fields update rm_profiles table.
         */
        RMProfileUpdate: {
            /**
             * Assigned Territories
             * @description Updates rm_profiles.assigned_territories
             */
            assigned_territories?: string[] | null;
            /**
             * Email
             * @description Updates profiles.email
             */
            email?: string | null;
            /**
             * Full Name
             * @description Updates profiles.full_name
             */
            full_name?: string | null;
            /**
             * Is Active
             * @description Updates profiles.is_active
             */
            is_active?: boolean | null;
            /**
             * Joining Date
             * @description Updates rm_profiles.joining_date - ISO date string (YYYY-MM-DD)
             */
            joining_date?: string | null;
            /**
             * Manager Notes
             * @description Updates rm_profiles.manager_notes
             */
            manager_notes?: string | null;
            /**
             * Phone
             * @description Updates profiles.phone (stored E.164)
             * @example 9876543210
             */
            phone?: string | null;
        };
        /**
         * RMProfileUpdateResponse
         * @description Response for RM profile updates
         */
        RMProfileUpdateResponse: {
            /**
             * Data
             * @description Updated RM profile data
             */
            data: Record<string, never>;
            /** Message */
            message: string;
            /**
             * Success
             * @default true
             */
            success?: boolean;
        };
        /**
         * RMSalonsListResponse
         * @description Response for RM's salons list
         */
        RMSalonsListResponse: {
            /**
             * Count
             * @description Total number of salons
             */
            count: number;
            /**
             * Data
             * @description List of salons managed by RM
             */
            data: Record<string, never>[];
            /** Message */
            message: string;
            /**
             * Success
             * @default true
             */
            success?: boolean;
        };
        /** RMScoreHistoryResponse */
        RMScoreHistoryResponse: {
            /** Action */
            action: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Description */
            description?: string | null;
            /** Id */
            id: string;
            /** Points */
            points: number;
            /** Rm Id */
            rm_id: string;
        };
        /**
         * SalonDetailResponse
         * @description Detailed salon information for the public single-salon view.
         *
         *     Uses PublicSalonResponse, NOT SalonResponse: SalonResponse is the vendor's
         *     own view of their salon and carries tax, ownership and registration fields
         *     that must never reach an anonymous caller.
         */
        SalonDetailResponse: {
            /** Available Slots */
            available_slots?: Record<string, never>[] | null;
            salon: components["schemas"]["PublicSalonResponse"];
            /** Services */
            services?: Record<string, never>[] | null;
        };
        /**
         * SalonListResponse
         * @description Public list view of a salon — the salon-card shape.
         *
         *     This model is a SECURITY BOUNDARY, not just a convenience shape. The public
         *     listing endpoints read whole salon rows from the database (`select("*")`),
         *     so anything declared here is published to anonymous callers. It therefore
         *     does NOT set `extra = "allow"`: unknown keys must be dropped, not passed
         *     through.
         *
         *     Deliberately absent, and not to be re-added: the owner's contact details
         *     (`phone`, `email` — those are detail-page only, see PublicSalonResponse),
         *     tax identifiers (`gst_number`, `pan_number`, `is_gst`), internal ownership
         *     and workflow references (`vendor_id`, `rm_id`, `assigned_rm`,
         *     `join_request_id`, `verified_by`, `created_by`, `updated_by`), and the
         *     registration/agreement trail (`registration_fee_paid`,
         *     `registration_fee_amount`, `registration_payment_id`,
         *     `agreement_document_url`).
         */
        SalonListResponse: {
            /**
             * Accepting Bookings
             * @default true
             */
            accepting_bookings?: boolean | null;
            /** Address */
            address?: string | null;
            /** Average Rating */
            average_rating?: number | null;
            /** Business Hours */
            business_hours?: Record<string, never> | null;
            /** Business Name */
            business_name: string;
            business_type?: components["schemas"]["BusinessType"] | null;
            /** City */
            city: string;
            /** Closing Time */
            closing_time?: string | null;
            /** Coupons */
            coupons?: components["schemas"]["AvailableCouponResponse"][] | null;
            /** Cover Images */
            cover_images?: string[] | null;
            /** Description */
            description?: string | null;
            /** Distance Km */
            distance_km?: number | null;
            /** Facilities */
            facilities?: {
                [key: string]: boolean;
            } | null;
            /** Has Discounted Services */
            has_discounted_services?: boolean | null;
            /** Id */
            id: string;
            /** Is Active */
            is_active: boolean;
            /** Latitude */
            latitude?: number | null;
            /** Logo Url */
            logo_url?: string | null;
            /** Longitude */
            longitude?: number | null;
            /** Max Discount Percentage */
            max_discount_percentage?: number | null;
            /** Opening Time */
            opening_time?: string | null;
            /** Salon Type */
            salon_type?: string | null;
            /** State */
            state: string;
            /** Total Reviews */
            total_reviews?: number | null;
            /** Working Days */
            working_days?: string[] | null;
        };
        /**
         * SalonPromoApplyRequest
         * @description Apply a salon-wide discount promotion to all services.
         */
        SalonPromoApplyRequest: {
            /** Discount Type */
            discount_type: string;
            /** Discount Value */
            discount_value: number;
            /**
             * End Date
             * @description ISO date YYYY-MM-DD, optional
             */
            end_date?: string | null;
            /** Max Discount Limit */
            max_discount_limit?: number | null;
            /** Min Booking Amount */
            min_booking_amount?: number | null;
            /**
             * Start Date
             * @description ISO date YYYY-MM-DD
             */
            start_date: string;
            /** Title */
            title: string;
        };
        /** SalonPromoResponse */
        SalonPromoResponse: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Discount Type */
            discount_type: string;
            /** Discount Value */
            discount_value: number;
            /** End Date */
            end_date?: string | null;
            /** Id */
            id: string;
            /** Is Active */
            is_active: boolean;
            /** Max Discount Limit */
            max_discount_limit?: number | null;
            /** Min Booking Amount */
            min_booking_amount?: number | null;
            /** Salon Id */
            salon_id: string;
            /**
             * Services Updated
             * @default 0
             */
            services_updated?: number;
            /** Start Date */
            start_date: string;
            /** Status */
            status: string;
            /** Title */
            title: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** SalonResponse */
        SalonResponse: {
            /**
             * Accepting Bookings
             * @default true
             */
            accepting_bookings?: boolean;
            /** Address */
            address: string;
            /** Agreement Document Url */
            agreement_document_url?: string | null;
            /** Assigned Rm */
            assigned_rm?: string | null;
            /** Average Rating */
            average_rating: number;
            /** Business Hours */
            business_hours?: Record<string, never> | null;
            /** Business Name */
            business_name: string;
            business_type?: components["schemas"]["BusinessType"] | null;
            /** City */
            city: string;
            /** Closing Time */
            closing_time?: string | null;
            /** Coupons */
            coupons?: components["schemas"]["AvailableCouponResponse"][] | null;
            /** Cover Images */
            cover_images?: string[] | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Created By */
            created_by?: string | null;
            /** Deleted At */
            deleted_at?: string | null;
            /** Description */
            description?: string | null;
            /** Email */
            email?: string | null;
            /** Facilities */
            facilities?: {
                [key: string]: boolean;
            } | null;
            /** Gst Number */
            gst_number?: string | null;
            /** Has Discounted Services */
            has_discounted_services?: boolean | null;
            /** Id */
            id: string;
            /** Is Active */
            is_active: boolean;
            /**
             * Is Gst
             * @default false
             */
            is_gst?: boolean | null;
            /** Is Verified */
            is_verified: boolean;
            /** Join Request Id */
            join_request_id?: string | null;
            /** Latitude */
            latitude?: number | null;
            /** Logo Url */
            logo_url?: string | null;
            /** Longitude */
            longitude?: number | null;
            /** Max Discount Percentage */
            max_discount_percentage?: number | null;
            /** Opening Time */
            opening_time?: string | null;
            outlet?: components["schemas"]["OutletType"] | null;
            /** Pan Number */
            pan_number?: string | null;
            /** Phone */
            phone: string;
            /**
             * Pincode
             * @description 6 or 10 digit pincode
             */
            pincode: string;
            /** Platform Coupons */
            platform_coupons?: components["schemas"]["AvailableCouponResponse"][] | null;
            /** Registration Fee Amount */
            registration_fee_amount?: number | null;
            /** Registration Fee Paid */
            registration_fee_paid: boolean;
            /** Registration Payment Id */
            registration_payment_id?: string | null;
            /** Rm Id */
            rm_id?: string | null;
            /**
             * Salon Type
             * @default salon
             */
            salon_type?: string;
            /** State */
            state: string;
            /** Total Reviews */
            total_reviews: number;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Updated By */
            updated_by?: string | null;
            /** Vendor Id */
            vendor_id?: string | null;
            /** Verified At */
            verified_at?: string | null;
            /** Verified By */
            verified_by?: string | null;
            /** Working Days */
            working_days?: string[] | null;
        };
        /**
         * SalonServicesResponse
         * @description Response for salon services listing
         */
        SalonServicesResponse: {
            /** Count */
            count: number;
            /** Services */
            services: Record<string, never>[];
        };
        /** SalonUpdate */
        SalonUpdate: {
            /** Accepting Bookings */
            accepting_bookings?: boolean | null;
            /** Address */
            address?: string | null;
            /** Agreement Document Url */
            agreement_document_url?: string | null;
            /**
             * Business Hours
             * @description Day-wise business hours {monday: '9:00 AM - 6:00 PM', ...}
             */
            business_hours?: Record<string, never> | null;
            /** Business Name */
            business_name?: string | null;
            /** City */
            city?: string | null;
            /** Closing Time */
            closing_time?: string | null;
            /** Cover Images */
            cover_images?: string[] | null;
            /**
             * Custom Registration Fee Amount
             * @description One-off registration fee override for this account. Send null to clear it and fall back to the global default for this salon_type.
             */
            custom_registration_fee_amount?: number | null;
            /** Description */
            description?: string | null;
            /** Email */
            email?: string | null;
            /** Facilities */
            facilities?: {
                [key: string]: boolean;
            } | null;
            /** Gst Number */
            gst_number?: string | null;
            /** Is Active */
            is_active?: boolean | null;
            /**
             * Is Gst
             * @description Whether the salon has GST registration
             */
            is_gst?: boolean | null;
            /** Is Verified */
            is_verified?: boolean | null;
            /** Latitude */
            latitude?: number | null;
            /** Logo Url */
            logo_url?: string | null;
            /** Longitude */
            longitude?: number | null;
            /** Opening Time */
            opening_time?: string | null;
            /** @description Type of outlet: franchisee or Company owned */
            outlet?: components["schemas"]["OutletType"] | null;
            /** Pan Number */
            pan_number?: string | null;
            /**
             * Phone
             * @description Enter a 10-digit Indian mobile number starting with 6-9 (a +91 or 91 prefix is accepted and stripped)
             * @example 9876543210
             */
            phone?: string | null;
            /**
             * Pincode
             * @description 6-digit Indian pincode
             * @example 400001
             */
            pincode?: string | null;
            /** State */
            state?: string | null;
            /** Working Days */
            working_days?: string[] | null;
        };
        /**
         * SearchSalonsResponse
         * @description Response for text-based salon search
         */
        SearchSalonsResponse: {
            /** Count */
            count: number;
            /** Limit */
            limit: number;
            /** Offset */
            offset: number;
            /** Query */
            query: string;
            /** Salons */
            salons: components["schemas"]["SalonListResponse"][];
        };
        /** ServiceCategoryCreate */
        ServiceCategoryCreate: {
            /** Description */
            description?: string | null;
            /**
             * Display Order
             * @default 0
             */
            display_order?: number;
            /** Icon Url */
            icon_url?: string | null;
            /**
             * Is Active
             * @default true
             */
            is_active?: boolean;
            /** Name */
            name: string;
        };
        /** ServiceCategoryUpdate */
        ServiceCategoryUpdate: {
            /** Description */
            description?: string | null;
            /** Display Order */
            display_order?: number | null;
            /** Icon Url */
            icon_url?: string | null;
            /** Is Active */
            is_active?: boolean | null;
            /** Name */
            name?: string | null;
        };
        /** ServiceCreate */
        ServiceCreate: {
            /** Category Id */
            category_id?: string | null;
            /** Category Name */
            category_name?: string | null;
            /** Description */
            description?: string | null;
            /** Discount Percentage */
            discount_percentage?: number | null;
            /** Duration Minutes */
            duration_minutes: number;
            /**
             * Gender Category
             * @default both
             */
            gender_category?: string | null;
            /** Image Url */
            image_url?: string | null;
            /**
             * Is Active
             * @default true
             */
            is_active?: boolean | null;
            /** Name */
            name: string;
            /** Price */
            price: number;
            /** Sub Subcategory Id */
            sub_subcategory_id?: string | null;
            /** Sub Subcategory Name */
            sub_subcategory_name?: string | null;
            /** Subcategory Id */
            subcategory_id?: string | null;
            /** Subcategory Name */
            subcategory_name?: string | null;
        };
        /** ServiceResponse */
        ServiceResponse: {
            /** Category Id */
            category_id?: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Description */
            description?: string | null;
            /** Discount Percentage */
            discount_percentage?: number | null;
            /** Discounted Price */
            discounted_price?: number | null;
            /** Duration Minutes */
            duration_minutes: number;
            /**
             * Gender Category
             * @default both
             */
            gender_category?: string;
            /** Id */
            id: string;
            /** Image Url */
            image_url?: string | null;
            /** Is Active */
            is_active: boolean;
            /** Name */
            name: string;
            /** Price */
            price: number;
            /** Salon Id */
            salon_id: string;
            /** Subcategory Id */
            subcategory_id?: string | null;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** ServiceSubcategoryCreate */
        ServiceSubcategoryCreate: {
            /** Description */
            description?: string | null;
            /**
             * Display Order
             * @default 0
             */
            display_order?: number;
            /** Icon Url */
            icon_url?: string | null;
            /**
             * Is Active
             * @default true
             */
            is_active?: boolean;
            /** Name */
            name: string;
            /** Parent Subcategory Id */
            parent_subcategory_id?: string | null;
        };
        /** ServiceSubcategoryUpdate */
        ServiceSubcategoryUpdate: {
            /** Description */
            description?: string | null;
            /** Display Order */
            display_order?: number | null;
            /** Icon Url */
            icon_url?: string | null;
            /** Is Active */
            is_active?: boolean | null;
            /** Name */
            name?: string | null;
        };
        /** ServiceUpdate */
        ServiceUpdate: {
            /** Category Id */
            category_id?: string | null;
            /** Category Name */
            category_name?: string | null;
            /** Description */
            description?: string | null;
            /** Discount Percentage */
            discount_percentage?: number | null;
            /** Duration Minutes */
            duration_minutes?: number | null;
            /** Gender Category */
            gender_category?: string | null;
            /** Image Url */
            image_url?: string | null;
            /** Is Active */
            is_active?: boolean | null;
            /** Name */
            name?: string | null;
            /** Price */
            price?: number | null;
            /** Sub Subcategory Id */
            sub_subcategory_id?: string | null;
            /** Sub Subcategory Name */
            sub_subcategory_name?: string | null;
            /** Subcategory Id */
            subcategory_id?: string | null;
            /** Subcategory Name */
            subcategory_name?: string | null;
        };
        /** SignupRequest */
        SignupRequest: {
            /**
             * Age
             * @description User age (13-120 years, required)
             */
            age: number;
            /**
             * Email
             * Format: email
             */
            email: string;
            /** Full Name */
            full_name: string;
            /**
             * Gender
             * @description User gender: male, female, or other (required)
             */
            gender: string;
            /** Password */
            password: string;
            /** Phone */
            phone?: string | null;
            /**
             * User Role
             * @default customer
             */
            user_role?: string;
            /**
             * Verification Token
             * @description JWT token obtained from phone OTP verification
             */
            verification_token?: string | null;
        };
        /** SignupResponse */
        SignupResponse: {
            /** Access Token */
            access_token?: string | null;
            /** Message */
            message: string;
            /** Refresh Token */
            refresh_token?: string | null;
            /** Success */
            success: boolean;
            /** User */
            user?: Record<string, never> | null;
            /** User Id */
            user_id?: string | null;
        };
        /** StatusToggle */
        StatusToggle: {
            /** Is Active */
            is_active: boolean;
        };
        /** SuccessResponse */
        SuccessResponse: {
            /** Data */
            data?: unknown | null;
            /** Message */
            message: string;
            /**
             * Success
             * @default true
             */
            success?: boolean;
        };
        /** SystemConfigCreate */
        SystemConfigCreate: {
            /**
             * Config Key
             * @description Unique configuration key
             */
            config_key: string;
            /**
             * Config Type
             * @description Type: string, number, boolean, json
             * @default string
             */
            config_type?: string;
            /**
             * Config Value
             * @description Configuration value
             */
            config_value: string;
            /**
             * Description
             * @description Optional description
             */
            description?: string | null;
            /**
             * Is Active
             * @description Whether config is active
             * @default true
             */
            is_active?: boolean | null;
        };
        /** SystemConfigResponse */
        SystemConfigResponse: {
            /** Config Key */
            config_key: string;
            /** Config Type */
            config_type: string;
            /** Config Value */
            config_value: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Description */
            description?: string | null;
            /** Id */
            id: string;
            /** Is Active */
            is_active: boolean;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Updated By */
            updated_by?: string | null;
        };
        /** SystemConfigUpdate */
        SystemConfigUpdate: {
            /** Config Type */
            config_type?: string | null;
            /** Config Value */
            config_value?: string | null;
            /** Description */
            description?: string | null;
            /** Is Active */
            is_active?: boolean | null;
        };
        /** UpdateStatusRequest */
        UpdateStatusRequest: {
            /**
             * Status
             * @enum {string}
             */
            status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
        };
        /** UserCreate */
        UserCreate: {
            /**
             * Age
             * @description User age, must be between 18 and 100
             */
            age: number;
            /**
             * Email
             * Format: email
             */
            email: string;
            /** Full Name */
            full_name: string;
            /**
             * Gender
             * @description User gender: male, female, or other
             */
            gender: string;
            /** Password */
            password: string;
            /**
             * Phone
             * @description Enter a 10-digit Indian mobile number starting with 6-9 (a +91 or 91 prefix is accepted and stripped)
             * @example 9876543210
             */
            phone?: string | null;
            /**
             * Role
             * @description relationship_manager or customer
             */
            role: string;
        };
        /**
         * UserRole
         * @enum {string}
         */
        UserRole: "admin" | "relationship_manager" | "vendor" | "customer";
        /** UserUpdate */
        UserUpdate: {
            /** Full Name */
            full_name?: string | null;
            /** Is Active */
            is_active?: boolean | null;
            /**
             * Phone
             * @description Enter a 10-digit Indian mobile number starting with 6-9 (a +91 or 91 prefix is accepted and stripped)
             * @example 9876543210
             */
            phone?: string | null;
        };
        /** ValidateCouponRequest */
        ValidateCouponRequest: {
            /** Code */
            code: string;
            /** Items */
            items: components["schemas"]["OrderItemSchema"][];
        };
        /** ValidationError */
        ValidationError: {
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
        };
        /**
         * VendorAnalyticsResponse
         * @description Response for vendor analytics endpoint
         */
        VendorAnalyticsResponse: {
            /** Active Services */
            active_services: number;
            /** Average Rating */
            average_rating: number;
            /** Pending Bookings */
            pending_bookings: number;
            /**
             * Pending Product Orders
             * @default 0
             */
            pending_product_orders?: number;
            /** Total Bookings */
            total_bookings: number;
            /**
             * Total Product Orders
             * @default 0
             */
            total_product_orders?: number;
            /**
             * Total Product Spending
             * @default 0
             */
            total_product_spending?: number;
            /** Total Revenue */
            total_revenue: number;
        } & {
            [key: string]: unknown;
        };
        /**
         * VendorApprovalRequest
         * @description Request body for approving vendor
         */
        VendorApprovalRequest: {
            /**
             * Admin Notes
             * @description Optional notes from admin
             */
            admin_notes?: string | null;
            /**
             * Custom Registration Fee Amount
             * @description One-off registration fee for this account, overriding the global default for its type. 0 waives the fee.
             */
            custom_registration_fee_amount?: number | null;
        };
        /**
         * VendorCouponCreate
         * @description Coupon created by a vendor (always scoped to their own salon).
         */
        VendorCouponCreate: {
            /**
             * Applies To
             * @description service | convenience_fee | product
             */
            applies_to: string;
            /**
             * Code
             * @description Shareable coupon code
             */
            code: string;
            /**
             * Discount Type
             * @description percentage | flat_amount
             */
            discount_type: string;
            /** Discount Value */
            discount_value: number;
            /**
             * First Time Scope
             * @description Restrict to first-time users: 'platform' (first booking ever) or 'vendor' (first with this salon). Null = anyone.
             */
            first_time_scope?: string | null;
            /**
             * Max Discount Cap
             * @description Cap for 'upto X%' style discounts
             */
            max_discount_cap?: number | null;
            /**
             * Min Order Amount
             * @description Minimum service subtotal to qualify
             */
            min_order_amount?: number | null;
            /** Title */
            title: string;
            /**
             * Usage Limit Per User
             * @description Redemptions allowed per user (null = unlimited)
             * @default 1
             */
            usage_limit_per_user?: number | null;
            /**
             * Usage Limit Total
             * @description Total redemptions allowed (null = unlimited)
             */
            usage_limit_total?: number | null;
            /**
             * Valid From
             * @description ISO datetime; defaults to now
             */
            valid_from?: string | null;
            /**
             * Valid Until
             * @description ISO datetime; null = no expiry
             */
            valid_until?: string | null;
        };
        /** VendorJoinRequestCreate */
        VendorJoinRequestCreate: {
            /**
             * Business Address
             * @description Full business address (minimum 10 characters)
             */
            business_address: string;
            /**
             * Business License
             * @description Business license document URL
             */
            business_license?: string | null;
            /** Business Name */
            business_name: string;
            /** @description Type of business: salon, spa, clinic, unisex_salon, barber_shop, beauty_parlor, retail_shop, wholesale_buyer */
            business_type: components["schemas"]["BusinessType"];
            /** City */
            city: string;
            /** Closing Time */
            closing_time?: string | null;
            /** Cover Image Url */
            cover_image_url?: string | null;
            /**
             * Documents
             * @description Additional documents {doc_type: url}
             */
            documents?: Record<string, never> | null;
            /**
             * Facilities
             * @description Salon facilities availability
             */
            facilities?: {
                [key: string]: boolean;
            } | null;
            /** Gallery Images */
            gallery_images?: string[] | null;
            /** Gst Number */
            gst_number?: string | null;
            /**
             * Is Gst
             * @description Whether the business has GST registration
             * @default false
             */
            is_gst?: boolean | null;
            /** Latitude */
            latitude?: number | null;
            /** Longitude */
            longitude?: number | null;
            /** Opening Time */
            opening_time?: string | null;
            /** @description Type of outlet: franchisee or Company owned */
            outlet?: components["schemas"]["OutletType"] | null;
            /**
             * Owner Age
             * @description Owner's age (required for regular_buyer)
             */
            owner_age?: number | null;
            /** Owner Email */
            owner_email?: string | null;
            /**
             * Owner Gender
             * @description Owner's gender: male, female, or other (required for regular_buyer)
             */
            owner_gender?: string | null;
            /** Owner Name */
            owner_name: string;
            /**
             * Owner Phone
             * @description Enter a 10-digit Indian mobile number starting with 6-9 (a +91 or 91 prefix is accepted and stripped)
             * @example 9876543210
             */
            owner_phone: string;
            /**
             * Owner Phone Verification Token
             * @description Proof owner_phone was OTP-verified at intake, from POST /auth/signup/phone/verify-otp's verification_token (required for regular_buyer)
             */
            owner_phone_verification_token?: string | null;
            /**
             * Pan Number
             * @description PAN format: ABCDE1234F
             */
            pan_number?: string | null;
            /**
             * Pincode
             * @description 6-digit Indian pincode
             * @example 400001
             */
            pincode: string;
            /**
             * Registration Certificate
             * @description Registration certificate URL
             */
            registration_certificate?: string | null;
            /**
             * Request Type
             * @description Type of request: salon or regular_buyer
             * @default salon
             */
            request_type?: string | null;
            /**
             * Services Offered
             * @description Services by category
             */
            services_offered?: Record<string, never> | null;
            /** State */
            state: string;
            /** Working Days */
            working_days?: string[] | null;
        };
        /** VendorJoinRequestResponse */
        VendorJoinRequestResponse: {
            /** Admin Notes */
            admin_notes?: string | null;
            /** Business Address */
            business_address: string;
            /** Business License */
            business_license?: string | null;
            /** Business Name */
            business_name: string;
            business_type: components["schemas"]["BusinessType"];
            /** City */
            city: string;
            /** Closing Time */
            closing_time?: string | null;
            /** Cover Image Url */
            cover_image_url?: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Documents */
            documents?: Record<string, never> | null;
            /** Facilities */
            facilities?: {
                [key: string]: boolean;
            } | null;
            /** Gallery Images */
            gallery_images?: string[] | null;
            /** Gst Number */
            gst_number?: string | null;
            /** Id */
            id: string;
            /**
             * Is Gst
             * @default false
             */
            is_gst?: boolean | null;
            /** Latitude */
            latitude?: number | null;
            /** Longitude */
            longitude?: number | null;
            /** Opening Time */
            opening_time?: string | null;
            outlet?: components["schemas"]["OutletType"] | null;
            /** Owner Age */
            owner_age?: number | null;
            /** Owner Email */
            owner_email?: string | null;
            /** Owner Gender */
            owner_gender?: string | null;
            /** Owner Name */
            owner_name: string;
            /** Owner Phone */
            owner_phone: string;
            /** Owner Phone Verification Method */
            owner_phone_verification_method?: string | null;
            /**
             * Owner Phone Verified
             * @default false
             */
            owner_phone_verified?: boolean | null;
            /** Owner Phone Verified At */
            owner_phone_verified_at?: string | null;
            /** Pan Number */
            pan_number?: string | null;
            /**
             * Pincode
             * @description 6 or 10 digit pincode
             */
            pincode: string;
            /** Registration Certificate */
            registration_certificate?: string | null;
            /**
             * Request Type
             * @default salon
             */
            request_type?: string;
            /** Reviewed At */
            reviewed_at?: string | null;
            /** Reviewed By */
            reviewed_by?: string | null;
            /** Rm Id */
            rm_id: string;
            /** Rm Profile */
            rm_profile?: Record<string, never> | null;
            /** Services Offered */
            services_offered?: Record<string, never> | null;
            /** State */
            state: string;
            status: components["schemas"]["RequestStatus"];
            /** Submitted At */
            submitted_at?: string | null;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** User Id */
            user_id?: string | null;
            /** Working Days */
            working_days?: string[] | null;
        } & {
            [key: string]: unknown;
        };
        /**
         * VendorRegistrationVerificationResponse
         * @description Response for vendor registration payment verification
         */
        VendorRegistrationVerificationResponse: {
            /**
             * Activated
             * @default true
             */
            activated?: boolean;
            /** Message */
            message: string;
            /** Payment Id */
            payment_id: string;
            /** Salon Id */
            salon_id?: string | null;
            /** Salon Name */
            salon_name?: string | null;
            /** Success */
            success: boolean;
            /** Vendor Request Id */
            vendor_request_id?: string | null;
        };
        /**
         * VendorRejectionRequest
         * @description Request body for rejecting vendor
         */
        VendorRejectionRequest: {
            /**
             * Admin Notes
             * @description Rejection reason (required)
             */
            admin_notes: string;
        };
        /**
         * VendorRequestOperationResponse
         * @description Response for vendor request operations (update/delete)
         */
        VendorRequestOperationResponse: {
            /**
             * Data
             * @description Updated vendor request data (for updates only)
             */
            data?: Record<string, never> | null;
            /** Message */
            message: string;
            /**
             * Success
             * @default true
             */
            success?: boolean;
        };
        /**
         * VendorRequestsListResponse
         * @description Response for listing RM's vendor requests
         */
        VendorRequestsListResponse: {
            /**
             * Count
             * @description Total number of requests
             */
            count: number;
            /**
             * Data
             * @description List of vendor requests
             */
            data: Record<string, never>[];
            /** Message */
            message: string;
            /**
             * Success
             * @default true
             */
            success?: boolean;
        };
        /** VerifyPaymentRequest */
        VerifyPaymentRequest: {
            /** Razorpay Order Id */
            razorpay_order_id: string;
            /** Razorpay Payment Id */
            razorpay_payment_id: string;
            /** Razorpay Signature */
            razorpay_signature: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    root__get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    admin_get_all_bookings: {
        parameters: {
            query?: {
                date_from?: string | null;
                date_to?: string | null;
                /** @description Results per page (max 100) */
                limit?: number;
                /** @description Page number (1-indexed) */
                page?: number;
                status?: ("pending" | "confirmed" | "cancelled" | "completed" | "no_show") | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_all_configs_api_v1_admin_config_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SystemConfigResponse"][];
                };
            };
        };
    };
    create_config_api_v1_admin_config_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SystemConfigCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SystemConfigResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_config_api_v1_admin_config__config_key__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                config_key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SystemConfigResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_config_api_v1_admin_config__config_key__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                config_key: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SystemConfigUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_config_api_v1_admin_config__config_key__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                config_key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_available_config_keys_api_v1_admin_config_available_keys_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    list_coupons_api_v1_admin_coupons_get: {
        parameters: {
            query?: {
                /** @description Filter by salon */
                salon_id?: string | null;
                /** @description Filter by scope: platform | vendor */
                scope?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CouponResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_coupon_api_v1_admin_coupons_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdminCouponCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CouponResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_coupon_api_v1_admin_coupons__coupon_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                coupon_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CouponResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    deactivate_coupon_api_v1_admin_coupons__coupon_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                coupon_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CouponResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_coupon_api_v1_admin_coupons__coupon_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                coupon_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CouponUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CouponResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_all_orders_api_v1_admin_product_orders__get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    update_order_status_api_v1_admin_product_orders__order_id__status_patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                order_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateStatusRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_recent_activity_api_v1_admin_recent_activity_get: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_all_rms_api_v1_admin_rms_get: {
        parameters: {
            query?: {
                is_active?: boolean | null;
                limit?: number;
                offset?: number;
                order_by?: string;
                order_desc?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RMProfileResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_rm_profile_api_v1_admin_rms__rm_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                rm_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RMProfileUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RMProfileResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_get_all_salons: {
        parameters: {
            query?: {
                city?: string | null;
                is_active?: boolean | null;
                is_verified?: boolean | null;
                limit?: number;
                offset?: number;
                state?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_update_salon: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                salon_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SalonUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_delete_salon: {
        parameters: {
            query?: {
                hard_delete?: boolean;
            };
            header?: never;
            path: {
                /** @description Resource UUID */
                salon_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_send_payment_reminder: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                salon_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_toggle_salon_status: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                salon_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StatusToggle"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_get_all_service_categories: {
        parameters: {
            query?: {
                is_active?: boolean | null;
                limit?: number;
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_create_service_category: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ServiceCategoryCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_get_service_category: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                category_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_update_service_category: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                category_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ServiceCategoryUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_delete_service_category: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                category_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_get_subcategories: {
        parameters: {
            query?: {
                /** @description Attach level-3 sub-subcategories under each subcategory */
                include_nested?: boolean;
                is_active?: boolean | null;
            };
            header?: never;
            path: {
                /** @description Resource UUID */
                category_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_create_subcategory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                category_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ServiceSubcategoryCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_toggle_service_category_status: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                category_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StatusToggle"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_get_all_subcategories: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    admin_reorder_service_categories: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": Record<string, never>[];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_update_subcategory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                subcategory_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ServiceSubcategoryUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_delete_subcategory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                subcategory_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_toggle_subcategory_status: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                subcategory_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StatusToggle"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_upload_service_category_icon: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_admin_upload_service_category_icon"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_dashboard_stats_api_v1_admin_stats_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    admin_get_all_users: {
        parameters: {
            query?: {
                is_active?: boolean | null;
                /** @description Results per page (max 100) */
                limit?: number;
                /** @description Page number (1-indexed) */
                page?: number;
                role?: ("admin" | "relationship_manager" | "vendor" | "customer" | "regular_buyer") | null;
                search?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_create_user: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UserCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_user_api_v1_admin_users__user_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                user_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UserUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_user_api_v1_admin_users__user_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                user_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_get_vendor_requests: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
                status_filter?: ("draft" | "pending" | "approved" | "rejected") | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VendorJoinRequestResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_approve_vendor_request: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                request_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VendorApprovalRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_reject_vendor_request: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                request_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VendorRejectionRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_resend_approval_email: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                request_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_app_config_api_v1_app_config_get: {
        parameters: {
            query?: {
                /** @description customer-app | partner-app. Falls back to the X-Client-App header. */
                client_app?: string | null;
                /** @description ios | android. Falls back to the X-App-Platform header. */
                platform?: string | null;
                /** @description Semver of the running build. Falls back to the X-App-Version header. */
                version?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AppConfigResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    login_api_v1_auth_login_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    send_phone_login_otp_api_v1_auth_login_phone_send_otp_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PhoneLoginSendOTPRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PhoneLoginSendOTPResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    verify_phone_login_otp_api_v1_auth_login_phone_verify_otp_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PhoneLoginVerifyOTPRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PhoneLoginVerifyOTPResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    logout_api_v1_auth_logout_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    logout_all_devices_api_v1_auth_logout_all_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LogoutAllRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_current_user_profile_api_v1_auth_me_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    update_current_user_profile_api_v1_auth_me_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["app__schemas__request__auth__UserProfileUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_own_account_api_v1_auth_me_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AccountDeleteRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccountDeleteResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    send_account_deletion_otp_api_v1_auth_me_delete_send_otp_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PhoneVerificationSendOTPResponse"];
                };
            };
        };
    };
    initiate_password_reset_api_v1_auth_password_reset_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordResetRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PasswordResetResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    confirm_password_reset_api_v1_auth_password_reset_confirm_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordResetConfirm"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PasswordResetConfirmResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    refresh_access_token_api_v1_auth_refresh_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshTokenRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    resend_verification_email_api_v1_auth_resend_verification_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    signup_api_v1_auth_signup_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SignupRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SignupResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    send_phone_signup_otp_api_v1_auth_signup_phone_send_otp_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PhoneSignupSendOTPRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PhoneLoginSendOTPResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    verify_phone_signup_otp_api_v1_auth_signup_phone_verify_otp_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PhoneSignupVerifyOTPRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    confirm_phone_verification_otp_api_v1_auth_verify_phone_confirm_otp_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PhoneVerificationConfirmRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PhoneVerificationConfirmResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    send_phone_verification_otp_api_v1_auth_verify_phone_send_otp_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PhoneVerificationSendOTPRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PhoneVerificationSendOTPResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_banners_api_v1_banners_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BannerListResponse"];
                };
            };
        };
    };
    create_banner_api_v1_banners_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BannerCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BannerOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_banner_api_v1_banners__banner_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                banner_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BannerUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BannerOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_banner_api_v1_banners__banner_id__delete: {
        parameters: {
            query?: {
                /** @description If true, permanently delete instead of soft-delete */
                hard?: boolean;
            };
            header?: never;
            path: {
                /** @description Resource UUID */
                banner_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BannerDeleteResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_list_all_banners_api_v1_banners_admin_all_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BannerListResponse"];
                };
            };
        };
    };
    reorder_banners_api_v1_banners_reorder_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BannerReorder"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BannerListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_blog_posts_api_v1_blog_get: {
        parameters: {
            query?: {
                /** @description Maximum results per page */
                limit?: number;
                /** @description Pagination offset */
                offset?: number;
                /** @description Search title, excerpt and focus keyword */
                search?: string | null;
                /** @description Filter to posts carrying this tag */
                tag?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BlogPostListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_blog_post_api_v1_blog_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BlogPostCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BlogPostOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_blog_post_api_v1_blog__post_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                post_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BlogPostUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BlogPostOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_blog_post_api_v1_blog__post_id__delete: {
        parameters: {
            query?: {
                /** @description If true, permanently delete instead of archiving */
                hard?: boolean;
            };
            header?: never;
            path: {
                /** @description Resource UUID */
                post_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BlogPostDeleteResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_blog_post_api_v1_blog__slug__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BlogPostOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_get_post_api_v1_blog_admin__post_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                post_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BlogPostOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_list_all_posts_api_v1_blog_admin_all_get: {
        parameters: {
            query?: {
                /** @description Maximum results per page */
                limit?: number;
                /** @description Pagination offset */
                offset?: number;
                /** @description Search title, excerpt and focus keyword */
                search?: string | null;
                /** @description Narrow to draft, published or archived */
                status?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BlogPostListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    blog_sitemap_data_api_v1_blog_sitemap_data_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BlogSitemapResponse"];
                };
            };
        };
    };
    list_blog_tags_api_v1_blog_tags_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BlogTagsResponse"];
                };
            };
        };
    };
    get_career_applications_api_v1_careers_applications_get: {
        parameters: {
            query?: {
                limit?: number;
                position?: string | null;
                search?: string | null;
                skip?: number;
                status?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_career_application_status_api_v1_careers_applications__application_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                application_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApplicationStatusUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CareerApplicationUpdateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    download_document_api_v1_careers_applications__application_id__download__document_type__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                application_id: string;
                document_type: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    submit_career_application_api_v1_careers_apply_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_submit_career_application_api_v1_careers_apply_post"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CareerApplicationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_available_coupons_api_v1_customers_available_coupons_get: {
        parameters: {
            query?: {
                salon_id?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AvailableCouponResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    customer_cancel_booking: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                booking_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BookingCancelResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_my_bookings_api_v1_customers_bookings_my_bookings_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CustomerBookingsResponse"];
                };
            };
        };
    };
    get_cart_api_v1_customers_cart_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CartResponse"];
                };
            };
        };
    };
    add_to_cart_api_v1_customers_cart_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CartItemCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CartOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_cart_item_api_v1_customers_cart__item_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CartItemUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CartOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    remove_from_cart_api_v1_customers_cart__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    checkout_cart_api_v1_customers_cart_checkout_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CartCheckoutCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BookingResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    clear_cart_api_v1_customers_cart_clear_all_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CartClearResponse"];
                };
            };
        };
    };
    validate_cart_coupon_api_v1_customers_cart_validate_coupon_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CouponValidateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CouponValidationResult"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_favorites_api_v1_customers_favorites_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FavoritesResponse"];
                };
            };
        };
    };
    add_favorite_api_v1_customers_favorites_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FavoriteCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FavoriteOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    remove_favorite_api_v1_customers_favorites__salon_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                salon_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FavoriteOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_favorite_products_api_v1_customers_favorites_products_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FavoritesResponse"];
                };
            };
        };
    };
    add_favorite_product_api_v1_customers_favorites_products_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProductFavoriteCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FavoriteOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    remove_favorite_product_api_v1_customers_favorites_products__product_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                product_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FavoriteOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_product_cart_api_v1_customers_product_cart_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductCartResponse"];
                };
            };
        };
    };
    add_to_product_cart_api_v1_customers_product_cart_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProductCartItemAdd"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductCartOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_product_cart_item_api_v1_customers_product_cart__item_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                item_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProductCartItemUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductCartOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    remove_from_product_cart_api_v1_customers_product_cart__item_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductCartOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    clear_product_cart_api_v1_customers_product_cart_clear_all_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductCartOperationResponse"];
                };
            };
        };
    };
    create_review_api_v1_customers_reviews_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReviewCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReviewOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_review_api_v1_customers_reviews__review_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                review_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReviewUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReviewOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_my_reviews_api_v1_customers_reviews_my_reviews_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CustomerReviewsResponse"];
                };
            };
        };
    };
    get_my_features_api_v1_features_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FeatureMapResponse"];
                };
            };
        };
    };
    update_feature_status_api_v1_features_admin__key__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                key: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FeatureStatusUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FeatureOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_all_features_api_v1_features_admin_all_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FeatureListResponse"];
                };
            };
        };
    };
    verify_pincode_api_v1_location_pincode__pincode__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                pincode: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    reverse_geocode_api_v1_location_reverse_geocode_get: {
        parameters: {
            query: {
                /** @description Latitude */
                lat: number;
                /** @description Longitude */
                lon: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_salons_nearby_api_v1_location_salons_nearby_get: {
        parameters: {
            query: {
                /** @description User latitude */
                lat: number;
                /** @description Maximum results */
                limit?: number;
                /** @description User longitude */
                lon: number;
                /** @description Search radius in kilometers */
                radius?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NearbySalonsResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    register_device_api_v1_notifications_devices_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeviceRegister"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    unregister_device_api_v1_notifications_devices_delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeviceUnregister"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    submit_partner_request_api_v1_partners_apply_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PartnerRequestCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PartnerRequestResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_partner_requests_api_v1_partners_requests_get: {
        parameters: {
            query?: {
                limit?: number;
                search?: string | null;
                shop_type?: string | null;
                skip?: number;
                status?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_partner_request_api_v1_partners_requests__request_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                request_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PartnerRequestStatusUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PartnerRequestUpdateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_cart_payment_order_api_v1_payments_cart_create_order_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["CartOrderCreate"] | null;
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RazorpayOrderResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_vendor_registration_order_api_v1_payments_registration_create_order_post: {
        parameters: {
            query: {
                vendor_request_id: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RazorpayOrderResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    verify_vendor_registration_payment_api_v1_payments_registration_verify_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PaymentVerification"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VendorRegistrationVerificationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_order_api_v1_product_orders__order_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                order_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_available_coupons_api_v1_product_orders_available_coupons_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AvailableCouponResponse"][];
                };
            };
        };
    };
    create_order_api_v1_product_orders_create_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateOrderRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    dev_verify_payment_api_v1_product_orders_dev_verify__order_id__post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                order_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_my_orders_api_v1_product_orders_my_orders_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    validate_coupon_api_v1_product_orders_validate_coupon_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ValidateCouponRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductCouponValidationResult"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    verify_payment_api_v1_product_orders_verify_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyPaymentRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_products_api_v1_products_get: {
        parameters: {
            query?: {
                /** @description Filter by category */
                category?: string | null;
                /** @description Filter by featured flag */
                is_featured?: boolean | null;
                /** @description Maximum results per page */
                limit?: number;
                /** @description Pagination offset */
                offset?: number;
                /** @description Search in product name */
                search?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_product_api_v1_products_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProductCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_product_by_id_api_v1_products__product_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                product_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_product_api_v1_products__product_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                product_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProductUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_product_api_v1_products__product_id__delete: {
        parameters: {
            query?: {
                /** @description If true, permanently delete instead of soft-delete */
                hard?: boolean;
            };
            header?: never;
            path: {
                /** @description Resource UUID */
                product_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductDeleteResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_related_products_api_v1_products__product_id__related_get: {
        parameters: {
            query?: {
                /** @description Maximum number of related products */
                limit?: number;
            };
            header?: never;
            path: {
                /** @description Resource UUID */
                product_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    admin_list_all_products_api_v1_products_admin_all_get: {
        parameters: {
            query?: {
                /** @description Filter by category */
                category?: string | null;
                /** @description Filter by featured flag */
                is_featured?: boolean | null;
                /** @description Maximum results per page */
                limit?: number;
                /** @description Pagination offset */
                offset?: number;
                /** @description Search in product name */
                search?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_product_categories_api_v1_products_categories_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": Record<string, never>;
                };
            };
        };
    };
    get_product_by_slug_api_v1_products_slug__slug__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_rm_dashboard_api_v1_rm_dashboard_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RMDashboardResponse"];
                };
            };
        };
    };
    get_rm_leaderboard_api_v1_rm_leaderboard_get: {
        parameters: {
            query?: {
                /** @description Results per page (max 100) */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RMLeaderboardResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_own_profile_api_v1_rm_profile_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["app__schemas__user__UserProfileUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RMProfileUpdateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_rm_salons_api_v1_rm_salons_get: {
        parameters: {
            query?: {
                include_inactive?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RMSalonsListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_own_score_history_api_v1_rm_score_history_get: {
        parameters: {
            query?: {
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RMScoreHistoryResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_own_vendor_requests_api_v1_rm_vendor_requests_get: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
                /** @description Filter by status */
                status_filter?: ("draft" | "pending" | "approved" | "rejected") | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VendorRequestsListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_vendor_request_api_v1_rm_vendor_requests_post: {
        parameters: {
            query?: {
                is_draft?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VendorJoinRequestCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VendorJoinRequestResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    rm_get_vendor_request: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                request_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VendorJoinRequestResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_vendor_request_api_v1_rm_vendor_requests__request_id__put: {
        parameters: {
            query?: {
                submit_for_approval?: boolean;
            };
            header?: never;
            path: {
                /** @description Resource UUID */
                request_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VendorJoinRequestCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VendorRequestOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_vendor_request_api_v1_rm_vendor_requests__request_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                request_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VendorRequestOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_salon_api_v1_salons__salon_id__get: {
        parameters: {
            query?: {
                /** @description Include salon services */
                include_services?: boolean;
            };
            header?: never;
            path: {
                /** @description Resource UUID */
                salon_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SalonDetailResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_available_slots_api_v1_salons__salon_id__available_slots_get: {
        parameters: {
            query: {
                /** @description Date in YYYY-MM-DD format */
                date: string;
                /** @description Comma-separated service IDs */
                service_ids?: string | null;
            };
            header?: never;
            path: {
                /** @description Resource UUID */
                salon_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AvailableSlotsResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_salon_feedback_context_api_v1_salons__salon_id__feedback_get: {
        parameters: {
            query: {
                /** @description Signed review link token */
                token: string;
            };
            header?: never;
            path: {
                /** @description Resource UUID */
                salon_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReviewFeedbackContextResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    submit_salon_feedback_api_v1_salons__salon_id__feedback_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                salon_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FeedbackReviewCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReviewOperationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_related_salons_api_v1_salons__salon_id__related_get: {
        parameters: {
            query?: {
                /** @description Maximum number of related salons */
                limit?: number;
            };
            header?: never;
            path: {
                /** @description Resource UUID */
                salon_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicSalonsResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_salon_reviews_api_v1_salons__salon_id__reviews_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                salon_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicSalonReviewsResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_salon_services_api_v1_salons__salon_id__services_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                salon_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SalonServicesResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_public_configs_api_v1_salons_config_public_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicConfigResponse"];
                };
            };
        };
    };
    get_popular_cities_api_v1_salons_popular_cities_get: {
        parameters: {
            query?: {
                /** @description Number of cities to return */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PopularCitiesResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_public_salons_api_v1_salons_public_get: {
        parameters: {
            query?: {
                /** @description Filter by city name */
                city?: string | null;
                /** @description Maximum number of results */
                limit?: number;
                /** @description Pagination offset */
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicSalonsResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    public_search_salons: {
        parameters: {
            query?: {
                /** @description Filter by city */
                city?: string | null;
                /** @description Maximum results */
                limit?: number;
                /** @description Search term for salon name */
                q?: string | null;
                /** @description Filter by service type */
                service_type?: string | null;
                /** @description Filter by state */
                state?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SearchSalonsResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    upload_agreement_document_api_v1_upload_agreement_document_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_upload_agreement_document_api_v1_upload_agreement_document_post"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImageUploadResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_agreement_document_signed_url_api_v1_upload_agreement_document_signed_url_get: {
        parameters: {
            query: {
                /** @description Cloudinary URL (new) or legacy Supabase storage path (e.g., 'agreements/abc123.pdf') */
                path: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    upload_cloudinary_banner_image_api_v1_upload_cloudinary_banner_image_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_upload_cloudinary_banner_image_api_v1_upload_cloudinary_banner_image_post"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImageUploadResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    upload_cloudinary_blog_image_api_v1_upload_cloudinary_blog_image_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_upload_cloudinary_blog_image_api_v1_upload_cloudinary_blog_image_post"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImageUploadResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    upload_cloudinary_product_image_api_v1_upload_cloudinary_product_image_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_upload_cloudinary_product_image_api_v1_upload_cloudinary_product_image_post"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImageUploadResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    upload_salon_image_upload: {
        parameters: {
            query?: {
                folder?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_upload_salon_image_upload"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImageUploadResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_vendor_analytics_api_v1_vendors_analytics_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VendorAnalyticsResponse"];
                };
            };
        };
    };
    vendor_get_salon_bookings: {
        parameters: {
            query?: {
                date_from?: string | null;
                date_to?: string | null;
                limit?: number;
                offset?: number;
                status_filter?: ("pending" | "confirmed" | "cancelled" | "completed" | "no_show") | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BookingResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    vendor_update_booking_status: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                booking_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Body_vendor_update_booking_status"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    complete_registration_api_v1_vendors_complete_registration_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CompleteRegistrationRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CompleteRegistrationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    vendor_list_coupons: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CouponResponse"][];
                };
            };
        };
    };
    vendor_create_coupon: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VendorCouponCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CouponResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    vendor_deactivate_coupon: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                coupon_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CouponResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    vendor_update_coupon: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                coupon_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CouponUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CouponResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    process_payment_api_v1_vendors_process_payment_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponse"];
                };
            };
        };
    };
    vendor_list_promotions: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SalonPromoResponse"][];
                };
            };
        };
    };
    vendor_get_active_promotion: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SalonPromoResponse"] | null;
                };
            };
        };
    };
    vendor_apply_promotion: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SalonPromoApplyRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SalonPromoResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_own_salon_api_v1_vendors_salon_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SalonResponse"];
                };
            };
        };
    };
    update_own_salon_api_v1_vendors_salon_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SalonUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SalonResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    vendor_get_service_categories: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    get_own_services_api_v1_vendors_services_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ServiceResponse"][];
                };
            };
        };
    };
    create_service_api_v1_vendors_services_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ServiceCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ServiceResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_service_api_v1_vendors_services__service_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                service_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ServiceUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ServiceResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_service_api_v1_vendors_services__service_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Resource UUID */
                service_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    health_check_health_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
}
