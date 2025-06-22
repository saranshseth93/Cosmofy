// Comprehensive panchangJS Library Explorer
const panchang = require('panchang');

console.log('=== COMPREHENSIVE PANCHANGJS LIBRARY EXPLORATION ===\n');

// 1. Explore the main panchang object
console.log('📦 PANCHANG OBJECT STRUCTURE:');
console.log('Type:', typeof panchang);
console.log('Constructor:', panchang.constructor.name);
console.log('Available properties:', Object.getOwnPropertyNames(panchang));
console.log('Available methods:', Object.getOwnPropertyNames(panchang).filter(name => typeof panchang[name] === 'function'));

// 2. Test all static methods
console.log('\n📚 STATIC DATA METHODS:');

try {
  console.log('\n🌙 TITHI DATA:');
  const tithis = panchang.getTithiya();
  console.log('All Tithis:', JSON.stringify(tithis, null, 2));
  console.log('Total count:', tithis ? tithis.length : 'undefined');
} catch (e) {
  console.log('getTithiya() error:', e.message);
}

try {
  console.log('\n📅 PAKSH DATA:');
  const paksh = panchang.getAllPaksh();
  console.log('All Paksh:', JSON.stringify(paksh, null, 2));
} catch (e) {
  console.log('getAllPaksh() error:', e.message);
}

try {
  console.log('\n🕰️ YUG DATA:');
  const yugs = panchang.getAllYug();
  console.log('All Yugs:', JSON.stringify(yugs, null, 2));
} catch (e) {
  console.log('getAllYug() error:', e.message);
}

try {
  console.log('\n📆 MONTHS DATA:');
  const months = panchang.getMonths();
  console.log('All Months:', JSON.stringify(months, null, 2));
} catch (e) {
  console.log('getMonths() error:', e.message);
}

try {
  console.log('\n⏳ KAAL IKAI DATA:');
  const kaalIkai = panchang.getKaalIkai();
  console.log('Kaal Ikai elements:', JSON.stringify(kaalIkai, null, 2));
} catch (e) {
  console.log('getKaalIkai() error:', e.message);
}

try {
  console.log('\n📊 SAMVAT DATA:');
  const samvat2025 = panchang.getSamvat(2025);
  console.log('Samvat for 2025:', JSON.stringify(samvat2025, null, 2));
  console.log('Type:', typeof samvat2025);
  console.log('Is Array:', Array.isArray(samvat2025));
  if (Array.isArray(samvat2025)) {
    console.log('Count:', samvat2025.length);
  }
} catch (e) {
  console.log('getSamvat() error:', e.message);
}

// 3. Test date-specific methods
console.log('\n📅 DATE-SPECIFIC METHODS:');
const testDate = new Date('2025-06-22');
console.log('Testing with date:', testDate.toISOString());

// Try different possible method names for date-specific calculations
const methodsToTry = [
  'getPanchang',
  'getTithi', 
  'getNakshatra',
  'getYoga',
  'getKarana',
  'getVara',
  'getMasa',
  'getRashi',
  'getMuhurat',
  'getFestivals',
  'getVrats',
  'calculateTithi',
  'calculateNakshatra',
  'calculateYoga',
  'calculateKarana'
];

methodsToTry.forEach(methodName => {
  console.log(`\n🔍 Testing ${methodName}:`);
  try {
    if (typeof panchang[methodName] === 'function') {
      const result = panchang[methodName](testDate);
      console.log(`${methodName}() result:`, JSON.stringify(result, null, 2));
      if (result && typeof result === 'object') {
        console.log(`${methodName}() properties:`, Object.keys(result));
      }
    } else {
      console.log(`${methodName} is not a function or doesn't exist`);
    }
  } catch (e) {
    console.log(`${methodName}() error:`, e.message);
  }
});

// 4. Explore any nested objects or additional data
console.log('\n🔬 DEEP EXPLORATION:');
Object.getOwnPropertyNames(panchang).forEach(prop => {
  const value = panchang[prop];
  console.log(`${prop}:`, typeof value);
  if (typeof value === 'object' && value !== null) {
    console.log(`  ${prop} properties:`, Object.keys(value));
  }
});

console.log('\n=== EXPLORATION COMPLETE ===');