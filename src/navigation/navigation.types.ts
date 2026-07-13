export type AppRole = 'admin' | 'rm' | 'vendor' | 'client';

export type RootStackParamList = {
  Auth: undefined;
  Admin: undefined;
  RM: undefined;
  Vendor: undefined;
  Client: undefined;
};

export type SalonRouteData = {
  badge?: string;
  category?: string;
  chips?: string[];
  distance?: string;
  heroImage?: string;
  id: string;
  location: string;
  name: string;
  rating: string;
  reviewCount?: number;
};

export type AuthStackParamList = {
  SignIn: undefined;
  OtpVerify: {
    phone: string;
    countryCode: string;
    verificationId: string;
    // 'login' = existing verified customer, 'signup' = new number (account created after OTP)
    mode: 'login' | 'signup';
    customerName?: string;
  };
  Signup: {
    phone: string;
    countryCode: string;
    // Issued by /auth/signup/phone/verify-otp; proves the phone was just verified.
    verificationToken: string;
  };
  EmailLogin: undefined;
  ForgotPassword: undefined;
};

export type VendorTabParamList = {
  Dashboard: undefined;
  Bookings: undefined;
  Profile: undefined;
};

export type ClientTabParamList = {
  Home: undefined;
  // Discover can be opened plain (all salons) or pre-filtered from the home screen:
  //  - initialQuery: seed the search box (e.g. from the home search bar)
  //  - businessType: restrict the listing to one business_type (e.g. 'spa')
  //  - nearby: show salons near a coordinate instead of the full catalogue
  //  - title: heading/label override for the active filter
  Discover:
    | {
        initialQuery?: string;
        businessType?: string;
        nearby?: { lat: number; lon: number; radius?: number };
        title?: string;
      }
    | undefined;
  Bookings: undefined;
  // Launcher tab (labelled "Cart"): pressing it pushes the product Cart stack
  // screen rather than rendering its own screen, so the cart keeps its
  // pushed/back UX. Named distinctly from the stack's `Cart` route to avoid
  // duplicate-route-name ambiguity when navigating.
  CartTab: undefined;
  Shopping: undefined;
};

export type ClientStackParamList = {
  Tabs: undefined;
  Profile: undefined;
  // Saved salons/products. Opened from the Home heart icon (was a bottom tab).
  Saved: undefined;
  SalonDetails: {
    salon?: SalonRouteData;
  };
  SalonServices: {
    salonId: string;
    salonName?: string;
  };
  SelectTime: {
    salonId: string;
    salonName?: string;
  };
  Checkout: {
    salonId: string;
    salonName?: string;
    bookingDate: string;
    timeSlots: string[];
  };
  BookingConfirmed: {
    bookingNumber?: string;
    salonName?: string;
    bookingDate?: string;
    timeSlots?: string[];
  };
  ProductCatalog: {
    category?: string;
    search?: string;
  };
  ProductDetail: {
    productId?: string;
    productName?: string;
  };
  Cart: undefined;
  ServiceCart: undefined;
  MyReviews: undefined;
  Offers: undefined;
  WebPage: {
    title: string;
    // Path on the web app (e.g. "/privacy-policy") or an absolute URL.
    path: string;
  };
};

export type AdminStackParamList = {
  AdminHome: undefined;
};

export type RMStackParamList = {
  RMHome: undefined;
};
