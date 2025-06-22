const { MhahPanchang } = require('mhah-panchang');

console.log('Testing mhah-panchang package...');

try {
  const obj = new MhahPanchang();
  console.log('MhahPanchang instance created successfully');
  
  // Test with current date
  const testDate = new Date('2025-06-22T12:00:00.000Z');
  console.log('Test date:', testDate);
  
  // Test basic calculate method
  console.log('\n--- Testing calculate() method ---');
  const basicResult = obj.calculate(testDate);
  console.log('Basic result:', JSON.stringify(basicResult, null, 2));
  
  // Test calendar method with coordinates
  console.log('\n--- Testing calendar() method ---');
  const calendarResult = obj.calendar(testDate, 28.6139, 77.2090);
  console.log('Calendar result:', JSON.stringify(calendarResult, null, 2));
  
} catch (error) {
  console.error('Error testing mhah-panchang:', error);
  console.error('Stack:', error.stack);
}