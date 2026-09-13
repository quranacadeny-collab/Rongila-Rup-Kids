export interface District {
  id: string;
  nameBn: string;
  nameEn: string;
  isDhakaCity?: boolean;
}

export const BD_DISTRICTS: District[] = [
  { id: 'dhaka', nameBn: 'ঢাকা (Dhaka)', nameEn: 'Dhaka', isDhakaCity: true },
  { id: 'gazipur', nameBn: 'গাজীপুর (Gazipur)', nameEn: 'Gazipur' },
  { id: 'narayanganj', nameBn: 'নারায়ণগঞ্জ (Narayanganj)', nameEn: 'Narayanganj' },
  { id: 'tangail', nameBn: 'টাঙ্গাইল (Tangail)', nameEn: 'Tangail' },
  { id: 'kishoreganj', nameBn: 'কিশোরগঞ্জ (Kishoreganj)', nameEn: 'Kishoreganj' },
  { id: 'manikganj', nameBn: 'মানিকগঞ্জ (Manikganj)', nameEn: 'Manikganj' },
  { id: 'munshiganj', nameBn: 'মুন্সীগঞ্জ (Munshiganj)', nameEn: 'Munshiganj' },
  { id: 'narsingdi', nameBn: 'নরসিংদী (Narsingdi)', nameEn: 'Narsingdi' },
  { id: 'faridpur', nameBn: 'ফরিদপুর (Faridpur)', nameEn: 'Faridpur' },
  { id: 'gopalganj', nameBn: 'গোপালগঞ্জ (Gopalganj)', nameEn: 'Gopalganj' },
  { id: 'madaripur', nameBn: 'মাদারীপুর (Madaripur)', nameEn: 'Madaripur' },
  { id: 'rajbari', nameBn: 'রাজবাড়ী (Rajbari)', nameEn: 'Rajbari' },
  { id: 'shariatpur', nameBn: 'শরীয়তপুর (Shariatpur)', nameEn: 'Shariatpur' },
  
  // Chittagong Division
  { id: 'chattogram', nameBn: 'চট্টগ্রাম (Chattogram)', nameEn: 'Chattogram' },
  { id: 'coxsbazar', nameBn: 'কক্সবাজার (Cox\'s Bazar)', nameEn: 'Cox\'s Bazar' },
  { id: 'cumilla', nameBn: 'কুমিল্লা (Cumilla)', nameEn: 'Cumilla' },
  { id: 'feni', nameBn: 'ফেনী (Feni)', nameEn: 'Feni' },
  { id: 'brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া (Brahmanbaria)', nameEn: 'Brahmanbaria' },
  { id: 'noakhali', nameBn: 'নোয়াখালী (Noakhali)', nameEn: 'Noakhali' },
  { id: 'chandpur', nameBn: 'চাঁদপুর (Chandpur)', nameEn: 'Chandpur' },
  { id: 'lakshmipur', nameBn: 'লক্ষ্মীপুর (Lakshmipur)', nameEn: 'Lakshmipur' },
  { id: 'rangamati', nameBn: 'রাঙ্গামাটি (Rangamati)', nameEn: 'Rangamati' },
  { id: 'khagrachhari', nameBn: 'খাগড়াছড়ি (Khagrachhari)', nameEn: 'Khagrachhari' },
  { id: 'bandarban', nameBn: 'বান্দরবান (Bandarban)', nameEn: 'Bandarban' },

  // Rajshahi Division
  { id: 'rajshahi', nameBn: 'রাজশাহী (Rajshahi)', nameEn: 'Rajshahi' },
  { id: 'bogura', nameBn: 'বগুড়া (Bogura)', nameEn: 'Bogura' },
  { id: 'pabna', nameBn: 'পাবনা (Pabna)', nameEn: 'Pabna' },
  { id: 'sirajganj', nameBn: 'সিরাজগঞ্জ (Sirajganj)', nameEn: 'Sirajganj' },
  { id: 'naogaon', nameBn: 'নওগাঁ (Naogaon)', nameEn: 'Naogaon' },
  { id: 'natore', nameBn: 'নাটোর (Natore)', nameEn: 'Natore' },
  { id: 'chapainawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ (Chapainawabganj)', nameEn: 'Chapainawabganj' },
  { id: 'joypurhat', nameBn: 'জয়পুরহাট (Joypurhat)', nameEn: 'Joypurhat' },

  // Sylhet Division
  { id: 'sylhet', nameBn: 'সিলেট (Sylhet)', nameEn: 'Sylhet' },
  { id: 'moulvibazar', nameBn: 'মৌলভীবাজার (Moulvibazar)', nameEn: 'Moulvibazar' },
  { id: 'habiganj', nameBn: 'হবিগঞ্জ (Habiganj)', nameEn: 'Habiganj' },
  { id: 'sunamganj', nameBn: 'সুনামগঞ্জ (Sunamganj)', nameEn: 'Sunamganj' },

  // Khulna Division
  { id: 'khulna', nameBn: 'খুলনা (Khulna)', nameEn: 'Khulna' },
  { id: 'jashore', nameBn: 'যশোর (Jashore)', nameEn: 'Jashore' },
  { id: 'kushtia', nameBn: 'কুষ্টিয়া (Kushtia)', nameEn: 'Kushtia' },
  { id: 'jhenaidah', nameBn: 'ঝিনাইদহ (Jhenaidah)', nameEn: 'Jhenaidah' },
  { id: 'satkhira', nameBn: 'সাতক্ষীরা (Satkhira)', nameEn: 'Satkhira' },
  { id: 'bagerhat', nameBn: 'বাগেরহাট (Bagerhat)', nameEn: 'Bagerhat' },
  { id: 'chuadanga', nameBn: 'চুয়াডাঙ্গা (Chuadanga)', nameEn: 'Chuadanga' },
  { id: 'magura', nameBn: 'মাগুরা (Magura)', nameEn: 'Magura' },
  { id: 'meherpur', nameBn: 'মেহেরপুর (Meherpur)', nameEn: 'Meherpur' },
  { id: 'narail', nameBn: 'নড়াইল (Narail)', nameEn: 'Narail' },

  // Rangpur Division
  { id: 'rangpur', nameBn: 'রংপুর (Rangpur)', nameEn: 'Rangpur' },
  { id: 'dinajpur', nameBn: 'দিনাজপুর (Dinajpur)', nameEn: 'Dinajpur' },
  { id: 'kurigram', nameBn: 'কুড়িগ্রাম (Kurigram)', nameEn: 'Kurigram' },
  { id: 'gaibandha', nameBn: 'গাইবান্ধা (Gaibandha)', nameEn: 'Gaibandha' },
  { id: 'nilphamari', nameBn: 'নীলফামারী (Nilphamari)', nameEn: 'Nilphamari' },
  { id: 'lalmonirhat', nameBn: 'লালমনিরহাট (Lalmonirhat)', nameEn: 'Lalmonirhat' },
  { id: 'panchagarh', nameBn: 'পঞ্চগড় (Panchagarh)', nameEn: 'Panchagarh' },
  { id: 'thakurgaon', nameBn: 'ঠাকুরগাঁও (Thakurgaon)', nameEn: 'Thakurgaon' },

  // Barishal Division
  { id: 'barishal', nameBn: 'বরিশাল (Barishal)', nameEn: 'Barishal' },
  { id: 'patuakhali', nameBn: 'পটুয়াখালী (Patuakhali)', nameEn: 'Patuakhali' },
  { id: 'bhola', nameBn: 'ভোলা (Bhola)', nameEn: 'Bhola' },
  { id: 'pirojpur', nameBn: 'পিরোজপুর (Pirojpur)', nameEn: 'Pirojpur' },
  { id: 'barguna', nameBn: 'বরগুনা (Barguna)', nameEn: 'Barguna' },
  { id: 'jhalokathi', nameBn: 'ঝালকাঠি (Jhalokathi)', nameEn: 'Jhalokathi' },

  // Mymensingh Division
  { id: 'mymensingh', nameBn: 'ময়মনসিংহ (Mymensingh)', nameEn: 'Mymensingh' },
  { id: 'jamalpur', nameBn: 'জামালপুর (Jamalpur)', nameEn: 'Jamalpur' },
  { id: 'netrokona', nameBn: 'নেত্রকোণা (Netrokona)', nameEn: 'Netrokona' },
  { id: 'sherpur', nameBn: 'শেরপুর (Sherpur)', nameEn: 'Sherpur' }
];
