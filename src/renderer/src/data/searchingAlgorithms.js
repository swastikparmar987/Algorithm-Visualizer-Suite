export const SEARCHING_ALGO_DATA = {
    'Linear Search': {
        code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // Found
    }
  }
  return -1; // Not found
}`,
        explanation: 'Linear Search iterates through the entire array one by one until the target element is found or the end of the array is reached. It is simple but inefficient for large datasets.',
        complexity: { time: 'O(n)', space: 'O(1)' }
    },
    'Binary Search': {
        code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
        explanation: 'Binary Search works on sorted arrays. It repeatedly divides the search interval in half. If the target value is less than the middle element, it narrows the interval to the lower half. Otherwise, to the upper half.',
        complexity: { time: 'O(log n)', space: 'O(1)' }
    },
    'Jump Search': {
        code: `function jumpSearch(arr, target) {
  const n = arr.length;
  let step = Math.floor(Math.sqrt(n));
  let prev = 0;
  while (arr[Math.min(step, n) - 1] < target) {
    prev = step;
    step += Math.floor(Math.sqrt(n));
    if (prev >= n) return -1;
  }
  // Linear search in block
  while (arr[prev] < target) {
    prev++;
    if (prev === Math.min(step, n)) return -1;
  }
  if (arr[prev] === target) return prev;
  return -1;
}`,
        explanation: 'Jump Search works on sorted arrays. It jumps ahead by fixed steps (usually √n) to find a block where the target might exist, then performs a linear search within that block.',
        complexity: { time: 'O(√n)', space: 'O(1)' }
    }
}
