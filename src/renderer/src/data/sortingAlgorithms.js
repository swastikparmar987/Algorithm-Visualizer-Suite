export const SORTING_ALGO_DATA = {
    'Bubble Sort': {
        code: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
        explanation: 'Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.',
        complexity: { time: 'O(n²)', space: 'O(1)' }
    },
    'Quick Sort': {
        code: `function quickSort(arr, low, high) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = (low - 1);
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
        explanation: 'Quick Sort is a divide-and-conquer algorithm. It works by selecting a "pivot" element from the array and partitioning the other elements into two sub-arrays, according to whether they are less than or greater than the pivot.',
        complexity: { time: 'O(n log n)', space: 'O(log n)' }
    },
    'Merge Sort': {
        code: `function mergeSort(arr, l, r) {
  if (l >= r) return;
  const m = l + parseInt((r - l) / 2);
  mergeSort(arr, l, m);
  mergeSort(arr, m + 1, r);
  merge(arr, l, m, r);
}

function merge(arr, l, m, r) {
// ... merge logic
}`,
        explanation: 'Merge Sort is a divide-and-conquer algorithm that divides the input array into two halves, calls itself for the two halves, and then merges the two sorted halves.',
        complexity: { time: 'O(n log n)', space: 'O(n)' }
    }
}
