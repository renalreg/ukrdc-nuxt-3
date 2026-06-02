export function getFirstOrValue(value: any | any[]): any {
  // Check if the input is an array
  if (Array.isArray(value)) {
    // Return the first element if it's an array
    return value[0];
  } else {
    // Return the value itself if it's not an array
    return value;
  }
}
