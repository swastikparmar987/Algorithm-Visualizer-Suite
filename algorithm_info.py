"""
Comprehensive Algorithm and Data Structure Information Database
Contains descriptions, explanations, complexity analysis, and code examples in C++ and Python
"""

ALGORITHM_INFO = {
    # ==================== SORTING ALGORITHMS ====================
    "Bubble Sort": {
        "description": "Bubble Sort is a simple comparison-based sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.",
        "how_it_works": """
🔄 How Bubble Sort Works:

1. Start at the beginning of the array
2. Compare each pair of adjacent elements
3. If they are in the wrong order, swap them
4. Continue until the end of the array (one pass complete)
5. Repeat the process for n-1 passes
6. After each pass, the largest unsorted element "bubbles up" to its correct position

⏱️ Time Complexity:
• Best Case: O(n) - when array is already sorted
• Average Case: O(n²)
• Worst Case: O(n²) - when array is reverse sorted

💾 Space Complexity: O(1) - in-place sorting

✅ Advantages:
• Simple to understand and implement
• No extra memory needed
• Stable sorting algorithm

❌ Disadvantages:
• Very slow for large datasets
• Not suitable for real-world applications
""",
        "cpp_code": """// Bubble Sort Implementation in C++
#include <iostream>
#include <vector>
using namespace std;

void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    
    // Outer loop for each pass
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        
        // Inner loop for comparisons
        for (int j = 0; j < n - i - 1; j++) {
            // Compare adjacent elements
            if (arr[j] > arr[j + 1]) {
                // Swap if in wrong order
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        
        // Optimization: break if no swaps occurred
        if (!swapped) break;
    }
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    
    cout << "Original array: ";
    for (int num : arr) cout << num << " ";
    
    bubbleSort(arr);
    
    cout << "\\nSorted array: ";
    for (int num : arr) cout << num << " ";
    
    return 0;
}""",
        "python_code": """# Bubble Sort Implementation in Python

def bubble_sort(arr):
    n = len(arr)
    
    # Outer loop for each pass
    for i in range(n - 1):
        swapped = False
        
        # Inner loop for comparisons
        for j in range(n - i - 1):
            # Compare adjacent elements
            if arr[j] > arr[j + 1]:
                # Swap if in wrong order
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        
        # Optimization: break if no swaps occurred
        if not swapped:
            break
    
    return arr

# Example usage
if __name__ == "__main__":
    arr = [64, 34, 25, 12, 22, 11, 90]
    
    print("Original array:", arr)
    bubble_sort(arr)
    print("Sorted array:", arr)
"""
    },
    
    "Selection Sort": {
        "description": "Selection Sort divides the array into sorted and unsorted regions. It repeatedly selects the smallest (or largest) element from the unsorted region and moves it to the sorted region.",
        "how_it_works": """
🎯 How Selection Sort Works:

1. Divide array into sorted (left) and unsorted (right) parts
2. Initially, sorted part is empty
3. Find the minimum element in unsorted part
4. Swap it with the first element of unsorted part
5. Move boundary between sorted and unsorted parts one position right
6. Repeat until entire array is sorted

⏱️ Time Complexity:
• Best Case: O(n²)
• Average Case: O(n²)
• Worst Case: O(n²)

💾 Space Complexity: O(1) - in-place sorting

✅ Advantages:
• Simple implementation
• Performs well on small lists
• Minimizes number of swaps (n-1 swaps maximum)

❌ Disadvantages:
• Inefficient for large datasets
• Not stable (may change relative order of equal elements)
""",
        "cpp_code": """// Selection Sort Implementation in C++
#include <iostream>
#include <vector>
using namespace std;

void selectionSort(vector<int>& arr) {
    int n = arr.size();
    
    // Move boundary of unsorted part
    for (int i = 0; i < n - 1; i++) {
        // Find minimum element in unsorted part
        int min_idx = i;
        
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_idx]) {
                min_idx = j;
            }
        }
        
        // Swap minimum with first unsorted element
        if (min_idx != i) {
            swap(arr[i], arr[min_idx]);
        }
    }
}

int main() {
    vector<int> arr = {64, 25, 12, 22, 11};
    
    cout << "Original array: ";
    for (int num : arr) cout << num << " ";
    
    selectionSort(arr);
    
    cout << "\\nSorted array: ";
    for (int num : arr) cout << num << " ";
    
    return 0;
}""",
        "python_code": """# Selection Sort Implementation in Python

def selection_sort(arr):
    n = len(arr)
    
    # Move boundary of unsorted part
    for i in range(n - 1):
        # Find minimum element in unsorted part
        min_idx = i
        
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        
        # Swap minimum with first unsorted element
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
    
    return arr

# Example usage
if __name__ == "__main__":
    arr = [64, 25, 12, 22, 11]
    
    print("Original array:", arr)
    selection_sort(arr)
    print("Sorted array:", arr)
"""
    },
    
    "Insertion Sort": {
        "description": "Insertion Sort builds the final sorted array one item at a time. It picks each element and inserts it into its correct position in the already sorted part of the array.",
        "how_it_works": """
📥 How Insertion Sort Works:

1. Start with second element (assume first is sorted)
2. Pick current element (key)
3. Compare key with elements in sorted part (moving right to left)
4. Shift all larger elements one position right
5. Insert key at correct position
6. Repeat for all elements

⏱️ Time Complexity:
• Best Case: O(n) - when array is already sorted
• Average Case: O(n²)
• Worst Case: O(n²) - when array is reverse sorted

💾 Space Complexity: O(1) - in-place sorting

✅ Advantages:
• Efficient for small datasets
• Adaptive: efficient for nearly sorted data
• Stable sorting algorithm
• Online: can sort as it receives data

❌ Disadvantages:
• Inefficient for large datasets
• Requires many comparisons and shifts
""",
        "cpp_code": """// Insertion Sort Implementation in C++
#include <iostream>
#include <vector>
using namespace std;

void insertionSort(vector<int>& arr) {
    int n = arr.size();
    
    // Start from second element
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        
        // Move elements greater than key one position ahead
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        
        // Insert key at correct position
        arr[j + 1] = key;
    }
}

int main() {
    vector<int> arr = {12, 11, 13, 5, 6};
    
    cout << "Original array: ";
    for (int num : arr) cout << num << " ";
    
    insertionSort(arr);
    
    cout << "\\nSorted array: ";
    for (int num : arr) cout << num << " ";
    
    return 0;
}""",
        "python_code": """# Insertion Sort Implementation in Python

def insertion_sort(arr):
    n = len(arr)
    
    # Start from second element
    for i in range(1, n):
        key = arr[i]
        j = i - 1
        
        # Move elements greater than key one position ahead
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        
        # Insert key at correct position
        arr[j + 1] = key
    
    return arr

# Example usage
if __name__ == "__main__":
    arr = [12, 11, 13, 5, 6]
    
    print("Original array:", arr)
    insertion_sort(arr)
    print("Sorted array:", arr)
"""
    },
    
    "Merge Sort": {
        "description": "Merge Sort is a divide-and-conquer algorithm that divides the array into halves, recursively sorts them, and then merges the sorted halves back together.",
        "how_it_works": """
🔀 How Merge Sort Works:

1. Divide: Split array into two halves
2. Conquer: Recursively sort both halves
3. Combine: Merge the two sorted halves

Merging Process:
• Compare elements from both halves
• Place smaller element in result
• Continue until all elements are merged

⏱️ Time Complexity:
• Best Case: O(n log n)
• Average Case: O(n log n)
• Worst Case: O(n log n)

💾 Space Complexity: O(n) - requires extra space for merging

✅ Advantages:
• Guaranteed O(n log n) performance
• Stable sorting algorithm
• Excellent for large datasets
• Works well with linked lists

❌ Disadvantages:
• Requires extra memory
• Slower than Quick Sort in practice
• Not in-place
""",
        "cpp_code": """// Merge Sort Implementation in C++
#include <iostream>
#include <vector>
using namespace std;

void merge(vector<int>& arr, int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    
    // Create temp arrays
    vector<int> L(n1), R(n2);
    
    // Copy data to temp arrays
    for (int i = 0; i < n1; i++)
        L[i] = arr[left + i];
    for (int j = 0; j < n2; j++)
        R[j] = arr[mid + 1 + j];
    
    // Merge temp arrays back
    int i = 0, j = 0, k = left;
    
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            arr[k++] = L[i++];
        } else {
            arr[k++] = R[j++];
        }
    }
    
    // Copy remaining elements
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}

void mergeSort(vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        
        // Sort first and second halves
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        
        // Merge sorted halves
        merge(arr, left, mid, right);
    }
}

int main() {
    vector<int> arr = {12, 11, 13, 5, 6, 7};
    
    cout << "Original array: ";
    for (int num : arr) cout << num << " ";
    
    mergeSort(arr, 0, arr.size() - 1);
    
    cout << "\\nSorted array: ";
    for (int num : arr) cout << num << " ";
    
    return 0;
}""",
        "python_code": """# Merge Sort Implementation in Python

def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    # Divide array into halves
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    # Merge sorted halves
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    # Merge while both have elements
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    # Add remaining elements
    result.extend(left[i:])
    result.extend(right[j:])
    
    return result

# Example usage
if __name__ == "__main__":
    arr = [12, 11, 13, 5, 6, 7]
    
    print("Original array:", arr)
    sorted_arr = merge_sort(arr)
    print("Sorted array:", sorted_arr)
"""
    },
    
    "Quick Sort": {
        "description": "Quick Sort is a highly efficient divide-and-conquer algorithm that selects a 'pivot' element and partitions the array around it, then recursively sorts the partitions.",
        "how_it_works": """
⚡ How Quick Sort Works:

1. Choose a pivot element (usually last element)
2. Partition: rearrange array so that:
   • Elements smaller than pivot are on left
   • Elements greater than pivot are on right
3. Recursively apply above steps to left and right partitions

Partitioning Process:
• Use two pointers: i (slow) and j (fast)
• j scans array, i tracks position for next small element
• When element < pivot found, swap with i and increment i

⏱️ Time Complexity:
• Best Case: O(n log n) - balanced partitions
• Average Case: O(n log n)
• Worst Case: O(n²) - already sorted array

💾 Space Complexity: O(log n) - recursion stack

✅ Advantages:
• Very fast in practice
• In-place sorting (minimal extra memory)
• Cache-friendly
• Widely used in production systems

❌ Disadvantages:
• Not stable
• Worst case O(n²) performance
• Recursive (stack overflow risk for large arrays)
""",
        "cpp_code": """// Quick Sort Implementation in C++
#include <iostream>
#include <vector>
using namespace std;

int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];  // Choose last element as pivot
    int i = low - 1;  // Index of smaller element
    
    for (int j = low; j < high; j++) {
        // If current element is smaller than pivot
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    
    // Place pivot in correct position
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        // Partition array and get pivot index
        int pi = partition(arr, low, high);
        
        // Recursively sort elements before and after partition
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int main() {
    vector<int> arr = {10, 7, 8, 9, 1, 5};
    
    cout << "Original array: ";
    for (int num : arr) cout << num << " ";
    
    quickSort(arr, 0, arr.size() - 1);
    
    cout << "\\nSorted array: ";
    for (int num : arr) cout << num << " ";
    
    return 0;
}""",
        "python_code": """# Quick Sort Implementation in Python

def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    
    if low < high:
        # Partition array and get pivot index
        pi = partition(arr, low, high)
        
        # Recursively sort elements before and after partition
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)
    
    return arr

def partition(arr, low, high):
    pivot = arr[high]  # Choose last element as pivot
    i = low - 1  # Index of smaller element
    
    for j in range(low, high):
        # If current element is smaller than pivot
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    # Place pivot in correct position
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

# Example usage
if __name__ == "__main__":
    arr = [10, 7, 8, 9, 1, 5]
    
    print("Original array:", arr)
    quick_sort(arr)
    print("Sorted array:", arr)
"""
    },
    
    "Heap Sort": {
        "description": "Heap Sort uses a binary heap data structure to sort elements. It builds a max heap from the array, then repeatedly extracts the maximum element and rebuilds the heap.",
        "how_it_works": """
🏔️ How Heap Sort Works:

1. Build Max Heap: Convert array into max heap
   • Max heap: parent ≥ children
   • Use heapify from bottom to top

2. Extract Maximum:
   • Swap root (max) with last element
   • Reduce heap size by 1
   • Heapify root to maintain heap property
   • Repeat until heap size = 1

Heapify Process:
• Compare parent with children
• Swap with larger child if needed
• Recursively heapify affected subtree

⏱️ Time Complexity:
• Best Case: O(n log n)
• Average Case: O(n log n)
• Worst Case: O(n log n)

💾 Space Complexity: O(1) - in-place sorting

✅ Advantages:
• Guaranteed O(n log n) performance
• In-place sorting
• No worst-case degradation
• Good for systems with limited memory

❌ Disadvantages:
• Not stable
• Slower than Quick Sort in practice
• Poor cache performance
""",
        "cpp_code": """// Heap Sort Implementation in C++
#include <iostream>
#include <vector>
using namespace std;

void heapify(vector<int>& arr, int n, int i) {
    int largest = i;      // Initialize largest as root
    int left = 2 * i + 1;  // Left child
    int right = 2 * i + 2; // Right child
    
    // If left child is larger than root
    if (left < n && arr[left] > arr[largest])
        largest = left;
    
    // If right child is larger than largest so far
    if (right < n && arr[right] > arr[largest])
        largest = right;
    
    // If largest is not root
    if (largest != i) {
        swap(arr[i], arr[largest]);
        
        // Recursively heapify affected subtree
        heapify(arr, n, largest);
    }
}

void heapSort(vector<int>& arr) {
    int n = arr.size();
    
    // Build max heap
    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(arr, n, i);
    
    // Extract elements from heap one by one
    for (int i = n - 1; i > 0; i--) {
        // Move current root to end
        swap(arr[0], arr[i]);
        
        // Heapify reduced heap
        heapify(arr, i, 0);
    }
}

int main() {
    vector<int> arr = {12, 11, 13, 5, 6, 7};
    
    cout << "Original array: ";
    for (int num : arr) cout << num << " ";
    
    heapSort(arr);
    
    cout << "\\nSorted array: ";
    for (int num : arr) cout << num << " ";
    
    return 0;
}""",
        "python_code": """# Heap Sort Implementation in Python

def heapify(arr, n, i):
    largest = i      # Initialize largest as root
    left = 2 * i + 1  # Left child
    right = 2 * i + 2 # Right child
    
    # If left child is larger than root
    if left < n and arr[left] > arr[largest]:
        largest = left
    
    # If right child is larger than largest so far
    if right < n and arr[right] > arr[largest]:
        largest = right
    
    # If largest is not root
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        
        # Recursively heapify affected subtree
        heapify(arr, n, largest)

def heap_sort(arr):
    n = len(arr)
    
    # Build max heap
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    
    # Extract elements from heap one by one
    for i in range(n - 1, 0, -1):
        # Move current root to end
        arr[0], arr[i] = arr[i], arr[0]
        
        # Heapify reduced heap
        heapify(arr, i, 0)
    
    return arr

# Example usage
if __name__ == "__main__":
    arr = [12, 11, 13, 5, 6, 7]
    
    print("Original array:", arr)
    heap_sort(arr)
    print("Sorted array:", arr)
"""
    },
    
    # ==================== SEARCHING ALGORITHMS ====================
    "Linear Search": {
        "description": "Linear Search is the simplest searching algorithm that sequentially checks each element in the list until the target element is found or the list ends.",
        "how_it_works": """
🔍 How Linear Search Works:

1. Start from the first element of the array
2. Compare current element with target value
3. If match found, return the index
4. If not, move to next element
5. Repeat until element is found or array ends
6. Return -1 if element not found

⏱️ Time Complexity:
• Best Case: O(1) - element is at first position
• Average Case: O(n) - element is in middle
• Worst Case: O(n) - element is at end or not present

💾 Space Complexity: O(1) - no extra space needed

✅ Advantages:
• Simple to implement
• Works on unsorted arrays
• No preprocessing required
• Good for small datasets

❌ Disadvantages:
• Very slow for large datasets
• Inefficient compared to other search algorithms
• Not suitable for sorted arrays
""",
        "cpp_code": """// Linear Search Implementation in C++
#include <iostream>
#include <vector>
using namespace std;

int linearSearch(vector<int>& arr, int target) {
    int n = arr.size();
    
    // Check each element sequentially
    for (int i = 0; i < n; i++) {
        // If element found, return index
        if (arr[i] == target) {
            return i;
        }
    }
    
    // Element not found
    return -1;
}

int main() {
    vector<int> arr = {10, 23, 45, 70, 11, 15};
    int target = 70;
    
    int result = linearSearch(arr, target);
    
    if (result != -1) {
        cout << "Element found at index: " << result << endl;
    } else {
        cout << "Element not found" << endl;
    }
    
    return 0;
}""",
        "python_code": """# Linear Search Implementation in Python

def linear_search(arr, target):
    # Check each element sequentially
    for i in range(len(arr)):
        # If element found, return index
        if arr[i] == target:
            return i
    
    # Element not found
    return -1

# Example usage
if __name__ == "__main__":
    arr = [10, 23, 45, 70, 11, 15]
    target = 70
    
    result = linear_search(arr, target)
    
    if result != -1:
        print(f"Element found at index: {result}")
    else:
        print("Element not found")
"""
    },
    
    "Binary Search": {
        "description": "Binary Search is an efficient algorithm for finding an item in a sorted array by repeatedly dividing the search interval in half.",
        "how_it_works": """
🎯 How Binary Search Works:

1. Start with entire sorted array
2. Find middle element
3. Compare middle element with target:
   • If equal: element found, return index
   • If target < middle: search left half
   • If target > middle: search right half
4. Repeat process on selected half
5. Continue until element found or search space empty

⏱️ Time Complexity:
• Best Case: O(1) - element is at middle
• Average Case: O(log n)
• Worst Case: O(log n)

💾 Space Complexity: 
• Iterative: O(1)
• Recursive: O(log n) - recursion stack

✅ Advantages:
• Very fast for large datasets
• Efficient O(log n) time complexity
• Simple to implement

❌ Disadvantages:
• Requires sorted array
• Not suitable for linked lists (no random access)
• Preprocessing (sorting) may be expensive
""",
        "cpp_code": """// Binary Search Implementation in C++
#include <iostream>
#include <vector>
using namespace std;

int binarySearch(vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    
    while (left <= right) {
        // Find middle index
        int mid = left + (right - left) / 2;
        
        // Check if target is at mid
        if (arr[mid] == target) {
            return mid;
        }
        
        // If target is greater, ignore left half
        if (arr[mid] < target) {
            left = mid + 1;
        }
        // If target is smaller, ignore right half
        else {
            right = mid - 1;
        }
    }
    
    // Element not found
    return -1;
}

int main() {
    vector<int> arr = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    int target = 23;
    
    int result = binarySearch(arr, target);
    
    if (result != -1) {
        cout << "Element found at index: " << result << endl;
    } else {
        cout << "Element not found" << endl;
    }
    
    return 0;
}""",
        "python_code": """# Binary Search Implementation in Python

def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        # Find middle index
        mid = left + (right - left) // 2
        
        # Check if target is at mid
        if arr[mid] == target:
            return mid
        
        # If target is greater, ignore left half
        if arr[mid] < target:
            left = mid + 1
        # If target is smaller, ignore right half
        else:
            right = mid - 1
    
    # Element not found
    return -1

# Example usage
if __name__ == "__main__":
    arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
    target = 23
    
    result = binary_search(arr, target)
    
    if result != -1:
        print(f"Element found at index: {result}")
    else:
        print("Element not found")
"""
    },
    
    "Jump Search": {
        "description": "Jump Search is an algorithm for sorted arrays that works by jumping ahead by fixed steps and then performing linear search in the identified block.",
        "how_it_works": """
🦘 How Jump Search Works:

1. Choose optimal jump size: √n (square root of array size)
2. Jump ahead by step size until:
   • Element at jump position ≥ target, OR
   • End of array reached
3. Perform linear search in the identified block
4. Return index if found, -1 otherwise

Why √n step size?
• Minimizes number of comparisons
• Balances between jumping and linear search

⏱️ Time Complexity:
• Best Case: O(1) - element at first jump
• Average Case: O(√n)
• Worst Case: O(√n)

💾 Space Complexity: O(1)

✅ Advantages:
• Better than linear search for sorted arrays
• Simpler than binary search
• Works well for sorted linked lists
• Good for systems where backward jumping is costly

❌ Disadvantages:
• Requires sorted array
• Slower than binary search
• Not optimal for very large datasets
""",
        "cpp_code": """// Jump Search Implementation in C++
#include <iostream>
#include <vector>
#include <cmath>
using namespace std;

int jumpSearch(vector<int>& arr, int target) {
    int n = arr.size();
    
    // Finding block size to jump
    int step = sqrt(n);
    int prev = 0;
    
    // Jump to find the block where element may be present
    while (arr[min(step, n) - 1] < target) {
        prev = step;
        step += sqrt(n);
        
        // If we reached end of array
        if (prev >= n) {
            return -1;
        }
    }
    
    // Linear search in the identified block
    while (arr[prev] < target) {
        prev++;
        
        // If we reached next block or end
        if (prev == min(step, n)) {
            return -1;
        }
    }
    
    // If element found
    if (arr[prev] == target) {
        return prev;
    }
    
    return -1;
}

int main() {
    vector<int> arr = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
    int target = 6;
    
    int result = jumpSearch(arr, target);
    
    if (result != -1) {
        cout << "Element found at index: " << result << endl;
    } else {
        cout << "Element not found" << endl;
    }
    
    return 0;
}""",
        "python_code": """# Jump Search Implementation in Python
import math

def jump_search(arr, target):
    n = len(arr)
    
    # Finding block size to jump
    step = int(math.sqrt(n))
    prev = 0
    
    # Jump to find the block where element may be present
    while arr[min(step, n) - 1] < target:
        prev = step
        step += int(math.sqrt(n))
        
        # If we reached end of array
        if prev >= n:
            return -1
    
    # Linear search in the identified block
    while arr[prev] < target:
        prev += 1
        
        # If we reached next block or end
        if prev == min(step, n):
            return -1
    
    # If element found
    if arr[prev] == target:
        return prev
    
    return -1

# Example usage
if __name__ == "__main__":
    arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    target = 6
    
    result = jump_search(arr, target)
    
    if result != -1:
        print(f"Element found at index: {result}")
    else:
        print("Element not found")
"""
    },
    
    "Interpolation Search": {
        "description": "Interpolation Search is an improved variant of binary search that works better on uniformly distributed sorted arrays by estimating the position of the target value.",
        "how_it_works": """
📐 How Interpolation Search Works:

1. Estimate position using interpolation formula:
   pos = low + [(target - arr[low]) * (high - low) / (arr[high] - arr[low])]

2. Compare element at estimated position with target:
   • If equal: element found
   • If target < element: search left part
   • If target > element: search right part

3. Repeat until element found or search space empty

Key Difference from Binary Search:
• Binary search always checks middle
• Interpolation estimates likely position based on value

⏱️ Time Complexity:
• Best Case: O(1)
• Average Case: O(log log n) - for uniformly distributed data
• Worst Case: O(n) - for non-uniform distribution

💾 Space Complexity: O(1)

✅ Advantages:
• Very fast for uniformly distributed sorted data
• Better than binary search in many cases
• Adaptive to data distribution

❌ Disadvantages:
• Requires sorted array
• Poor performance on non-uniform data
• More complex than binary search
• Can be slower than binary search for small arrays
""",
        "cpp_code": """// Interpolation Search Implementation in C++
#include <iostream>
#include <vector>
using namespace std;

int interpolationSearch(vector<int>& arr, int target) {
    int low = 0;
    int high = arr.size() - 1;
    
    while (low <= high && target >= arr[low] && target <= arr[high]) {
        // If only one element
        if (low == high) {
            if (arr[low] == target) return low;
            return -1;
        }
        
        // Estimate position using interpolation formula
        int pos = low + ((double)(high - low) / 
                        (arr[high] - arr[low])) * 
                        (target - arr[low]);
        
        // Ensure pos is within bounds
        pos = max(low, min(pos, high));
        
        // Target found
        if (arr[pos] == target) {
            return pos;
        }
        
        // If target is larger, search right part
        if (arr[pos] < target) {
            low = pos + 1;
        }
        // If target is smaller, search left part
        else {
            high = pos - 1;
        }
    }
    
    return -1;
}

int main() {
    vector<int> arr = {10, 20, 30, 40, 50, 60, 70, 80, 90};
    int target = 70;
    
    int result = interpolationSearch(arr, target);
    
    if (result != -1) {
        cout << "Element found at index: " << result << endl;
    } else {
        cout << "Element not found" << endl;
    }
    
    return 0;
}""",
        "python_code": """# Interpolation Search Implementation in Python

def interpolation_search(arr, target):
    low = 0
    high = len(arr) - 1
    
    while low <= high and target >= arr[low] and target <= arr[high]:
        # If only one element
        if low == high:
            if arr[low] == target:
                return low
            return -1
        
        # Estimate position using interpolation formula
        pos = low + int(((high - low) / 
                        (arr[high] - arr[low])) * 
                        (target - arr[low]))
        
        # Ensure pos is within bounds
        pos = max(low, min(pos, high))
        
        # Target found
        if arr[pos] == target:
            return pos
        
        # If target is larger, search right part
        if arr[pos] < target:
            low = pos + 1
        # If target is smaller, search left part
        else:
            high = pos - 1
    
    return -1

# Example usage
if __name__ == "__main__":
    arr = [10, 20, 30, 40, 50, 60, 70, 80, 90]
    target = 70
    
    result = interpolation_search(arr, target)
    
    if result != -1:
        print(f"Element found at index: {result}")
    else:
        print("Element not found")
"""
    },
}

# Add more algorithm categories as needed
# This is a comprehensive starting point that can be extended
