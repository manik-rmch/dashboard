/* =====================================================================
   tools.js — টুলের তালিকা (নতুন টুল যোগ করতে শুধু এই ফাইল বদলান)
   =====================================================================

   নতুন টুল যোগ করার নিয়ম:
   ১. নিচের তালিকার শেষ টুলের পর কমা (,) দিন।
   ২. একটি নতুন { ... } ব্লক কপি করে বসান এবং তথ্য বদলান।
   ৩. ফাইল সেভ করে GitHub-এ আপলোড করুন। কার্ড নিজে থেকেই দেখা যাবে।

   প্রতিটি ঘরের অর্থ:
   id          → টুলের ছোট ইংরেজি নাম (অন্য টুলের সাথে মিলবে না)
   name        → কার্ডে যে নাম দেখাবে
   description → এক-দুই লাইনের বর্ণনা
   category    → নিচের CATEGORIES-এর id: 'salary', 'leave', 'date' অথবা 'govt'
   keywords    → সার্চে খোঁজার বাড়তি শব্দ (বাংলা ও ইংরেজি দুটোই দিন)
   icon        → কার্ডের ইমোজি আইকন
   url         → টুলের পূর্ণ ঠিকানা
   visibility  → সবসময় 'public' লিখুন

   badge       → (ঐচ্ছিক) কার্ডে ছোট লেবেল, যেমন '🔒 পাসওয়ার্ড সুরক্ষিত'
   newTab      → (ঐচ্ছিক) true দিলে লিংক নতুন ট্যাবে খুলবে (বাইরের/সরকারি সাইটের জন্য ভালো)
   actionText  → (ঐচ্ছিক) বাটনের লেখা (না দিলে 'টুলটি ব্যবহার করুন')

   ⚠️ গুরুত্বপূর্ণ সতর্কতা:
   এই ফাইলটি GitHub-এ সবাই দেখতে পারে। তাই এখানে কোনো পাসওয়ার্ড, ব্যক্তিগত
   তথ্য বা ঠিকানার গোপন অংশ লিখবেন না। কোনো টুলে পাসওয়ার্ড লাগলে সেই
   যাচাই অবশ্যই ওই টুলের সার্ভারে (যেমন Apps Script-এ) হতে হবে; কার্ডে
   'visibility' লেখা কোনো নিরাপত্তা নয়।
   ===================================================================== */

// ক্যাটাগরির তালিকা (বাটনগুলো এখান থেকে তৈরি হয়)
const CATEGORIES = [
  { id: 'all',    label: 'সব টুল' },
  { id: 'salary', label: 'বেতন ও পে-স্কেল' },
  { id: 'leave',  label: 'ছুটি ও চাকরির হিসাব' },
  { id: 'date',   label: 'বয়স ও তারিখ' },
  { id: 'govt',   label: 'সরকারি সেবা' },
  { id: 'skill',  label: 'দক্ষতা ও অনুশীলন' },
  { id: 'coaching', label: 'কোচিং ব্যবস্থাপনা' }
];

// টুলের তালিকা
const TOOLS = [
  {
    id: 'typing-test',
    name: 'টাইপিং টেস্ট',
    description: 'সরকারি চাকরির কম্পিউটার মুদ্রাক্ষরিক পদের প্রস্তুতির জন্য বাংলা ও ইংরেজি টাইপিং অনুশীলন। গতি (WPM), Accuracy ও ভুল শব্দসহ ফলাফল দেখুন।',
    category: 'skill',
    keywords: 'টাইপিং টেস্ট টাইপ গতি স্পিড অনুশীলন typing test speed wpm practice',
    icon: '⌨️',
    newTab: true,
    actionText: 'টাইপিং টেস্ট ওয়েবসাইটে যান ↗',
    url: 'https://manik-rmch.github.io/typing-test/',
    visibility: 'public'
  },
  {
    id: 'age-calculator',
    name: 'বয়স ক্যালকুলেটর',
    description: 'জন্মতারিখ থেকে বর্তমান তারিখ অনুযায়ী বয়স বছর, মাস ও দিনে হিসাব করুন। দুই তারিখ-সময়ের ব্যবধানও জানা যায়।',
    category: 'date',
    keywords: 'বয়স জন্মতারিখ জন্ম তারিখ ডেট age birth date calculator',
    icon: '🎂',
    url: 'https://manik-rmch.github.io/age-calculator/',
    visibility: 'public'
  },
  {
    id: 'karjokal',
    name: 'কার্যকাল ও সময়কাল গণনাকারী',
    description: 'দুই তারিখের মধ্যে সরকারি নিয়মে (১ মাস = ৩০ দিন) কত বছর, মাস ও দিন হলো তা হিসাব করুন। প্রিন্টসহ।',
    category: 'date',
    keywords: 'কার্যকাল সময়কাল চাকরিকাল চাকরির মেয়াদ সার্ভিস পিরিয়ড তারিখ ব্যবধান দিন মাস বছর গণনা ধার নিয়ম শুরুর দিনসহ service duration period length of service date difference calculator govt borrowing rule',
    icon: '⏳',
    url: 'https://manik-rmch.github.io/service-duration-calculator/',
    visibility: 'public'
  },
  {
    id: 'salary-8th',
    name: '৮ম পে-স্কেল স্যালারি ক্যালকুলেটর',
    description: '৮ম জাতীয় বেতন স্কেল অনুযায়ী প্রাসঙ্গিক বেতনের হিসাব দেখুন।',
    category: 'salary',
    keywords: 'বেতন স্যালারি ৮ম অষ্টম আট পে স্কেল পে-স্কেল 8th eighth salary pay scale',
    icon: '💰',
    url: 'https://manik-rmch.github.io/salary-calculator/',
    visibility: 'public'
  },
  {
    id: 'salary-9th',
    name: '৯ম পে-স্কেল স্যালারি ক্যালকুলেটর',
    description: '৯ম পে-স্কেলের প্রযোজ্য নিয়ম অনুযায়ী বেতন হিসাব করার টুল।',
    category: 'salary',
    keywords: 'বেতন স্যালারি ৯ম নবম নয় পে স্কেল পে-স্কেল 9th ninth salary pay scale',
    icon: '💵',
    url: 'https://manik-rmch.github.io/9th-pay-scale/',
    visibility: 'public'
  },
  {
    id: 'earned-leave',
    name: 'অর্জিত ছুটি ক্যালকুলেটর',
    description: 'যোগদানের তারিখ থেকে সরকারি কর্মচারী ছুটি বিধিমালা, ১৯৫৯ অনুযায়ী অর্জিত ছুটির হিসাব করুন।',
    category: 'leave',
    keywords: 'ছুটি অর্জিত ছুটির হিসাব leave earned leave calculator',
    icon: '🗓️',
    url: 'https://manik-rmch.github.io/leave-calculator/',
    visibility: 'public'
  },
  {
    id: 'earned-leave-online',
    name: 'অনলাইন অর্জিত ছুটি ক্যালকুলেটর',
    description: 'ডিউটি ও ছুটির তারিখ দিয়ে অর্জিত ছুটি হিসাব করে সার্ভিস বুকের মতো তালিকায় যোগ ও প্রিন্ট করুন।',
    category: 'leave',
    keywords: 'ছুটি অর্জিত অনলাইন online earned leave',
    icon: '📖',
    badge: '🔒 পাসওয়ার্ড সুরক্ষিত', 
    url: 'https://manik-rmch.github.io/earned-leave-online/',
    visibility: 'public'
  },
  {
    id: 'rest-recreation-leave',
    name: 'শ্রান্তি বিনোদন ছুটি ক্যালকুলেটর',
    description: 'জন্ম ও যোগদানের তারিখ থেকে শ্রান্তি বিনোদন ছুটি ও ভাতার প্রাপ্যতার তারিখ হিসাব করুন।',
    category: 'leave',
    keywords: 'ছুটি বিশ্রাম বিনোদন শ্রান্তি ও বিনোদন rest recreation leave',
    icon: '🌴',
    url: 'https://manik-rmch.github.io/rest-and-recreation-leave/',
    visibility: 'public'
  },
  {
    id: 'pension',
    name: 'সরকারি পেনশন ক্যালকুলেটর',
    description: 'নতুন ও পুরাতন পেনশনারের মাসিক পেনশন, আনুতোষিক, ছুটি নগদায়ন ও ভাতার হিসাব করুন।',
    category: 'salary',
    keywords: 'পেনশন অবসর আনুতোষিক গ্র্যাচুইটি ছুটি নগদায়ন পিআরএল নিট পেনশন pension gratuity retirement prl',
    icon: '🧓',
    url: 'https://manik-rmch.github.io/pension-calculator/',
    visibility: 'public'
  },
  {
    id: 'overtime-bill',
    name: 'অধিকাল ভাতার বিল তৈরি',
    description: 'গাড়িচালকদের অধিকাল ভাতার বিল তৈরি ও সংরক্ষণ করুন। প্রবেশের জন্য পাসওয়ার্ড লাগবে।',
    category: 'salary',
    keywords: 'অধিকাল অতিরিক্ত ওভারটাইম ভাতা বিল গাড়িচালক চালক overtime bill allowance driver',
    icon: '📝',
    badge: '🔒 পাসওয়ার্ড সুরক্ষিত',
    url: 'https://manik-rmch.github.io/overtime-bill/',
    visibility: 'public'
  },
  {
    id: 'tin-certificate',
    name: 'টিন সার্টিফিকেট খুলুন',
    description: 'জাতীয় রাজস্ব বোর্ডের (NBR) সরকারি ই-টিন পোর্টালে গিয়ে টিন সার্টিফিকেট খুলুন ও ডাউনলোড করুন। এটি সরকারি ওয়েবসাইটের লিংক।',
    category: 'govt',
    keywords: 'টিন সার্টিফিকেট ই-টিন ইটিন কর আয়কর রাজস্ব এনবিআর জাতীয় রাজস্ব বোর্ড tin etin certificate nbr income tax',
    icon: '🧾',
    badge: '🌐 সরকারি ওয়েবসাইট',
    newTab: true,
    actionText: 'সরকারি ওয়েবসাইটে যান ↗',
    url: 'https://secure.incometax.gov.bd/',
    visibility: 'public'
  },
  {
    id: 'salman-math-academy',
    name: 'সালমান গণিত একাডেমি — ম্যানেজমেন্ট',
    description: 'কোচিং সেন্টারের শিক্ষার্থী, মাসিক বেতন জমা, বকেয়া তালিকা, রশিদ ও রিপোর্ট ব্যবস্থাপনা। ইউজার আইডি-পাসওয়ার্ড বা ইমেইল-কোড দিয়ে লগইন করতে হয়।',
    category: 'coaching',
    keywords: 'কোচিং সালমান গণিত একাডেমি শিক্ষার্থী বেতন বকেয়া রশিদ রিপোর্ট ব্যবস্থাপনা coaching salman math academy student fee management receipt',
    icon: '🏫',
    newTab: true,
    actionText: 'ম্যানেজমেন্ট সাইটে যান ↗',
    url: 'https://manik-rmch.github.io/salman-math-academy/',
    visibility: 'public'
  }
];
