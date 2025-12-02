# Binary Tree Implementation Methods for data_structures_visualizer_embedded.py
# Add these methods to the DataStructuresVisualizerFrame class

def insert_tree_node(self, value):
    """Insert a node into the binary tree"""
    if self.current_structure == "Binary Tree":
        self.binary_tree_root = self._insert_bst(self.binary_tree_root, value)
    elif self.current_structure == "AVL Tree":
        self.avl_tree_root = self._insert_avl(self.avl_tree_root, value)
    self.draw_structure()

def _insert_bst(self, root, value):
    """Helper to insert into BST"""
    if root is None:
        return TreeNode(value)
    if value < root.value:
        root.left = self._insert_bst(root.left, value)
    else:
        root.right = self._insert_bst(root.right, value)
    return root

def delete_tree_node(self, value):
    """Delete a node from the binary tree"""
    if self.current_structure == "Binary Tree":
        self.binary_tree_root = self._delete_bst(self.binary_tree_root, value)
    elif self.current_structure == "AVL Tree":
        self.avl_tree_root = self._delete_avl(self.avl_tree_root, value)
    self.draw_structure()

def _delete_bst(self, root, value):
    """Helper to delete from BST"""
    if root is None:
        return root
    if value < root.value:
        root.left = self._delete_bst(root.left, value)
    elif value > root.value:
        root.right = self._delete_bst(root.right, value)
    else:
        # Node with only one child or no child
        if root.left is None:
            return root.right
        elif root.right is None:
            return root.left
        # Node with two children
        min_node = self._find_min(root.right)
        root.value = min_node.value
        root.right = self._delete_bst(root.right, min_node.value)
    return root

def _find_min(self, root):
    """Find minimum value node"""
    while root.left:
        root = root.left
    return root

def draw_binary_tree(self):
    """Draw binary tree visualization"""
    if self.binary_tree_root is None:
        self.canvas.create_text(
            500, 300,
            text="Empty Binary Tree\\nInsert nodes to visualize",
            font=FONTS['heading'],
            fill=COLORS['text_secondary']
        )
        return
    
    # Calculate positions
    self._calculate_tree_positions(self.binary_tree_root, 500, 50, 200)
    # Draw tree
    self._draw_tree_recursive(self.binary_tree_root)

def _calculate_tree_positions(self, node, x, y, offset):
    """Calculate x,y positions for tree nodes"""
    if node is None:
        return
    node.x = x
    node.y = y
    if node.left:
        self._calculate_tree_positions(node.left, x - offset, y + 80, offset // 2)
    if node.right:
        self._calculate_tree_positions(node.right, x + offset, y + 80, offset // 2)

def _draw_tree_recursive(self, node):
    """Recursively draw tree nodes and edges"""
    if node is None:
        return
    
    # Draw edges first
    if node.left:
        self.canvas.create_line(
            node.x, node.y, node.left.x, node.left.y,
            fill=COLORS['edge_default'], width=2
        )
        self._draw_tree_recursive(node.left)
    if node.right:
        self.canvas.create_line(
            node.x, node.y, node.right.x, node.right.y,
            fill=COLORS['edge_default'], width=2
        )
        self._draw_tree_recursive(node.right)
    
    # Draw node
    radius = 25
    self.canvas.create_oval(
        node.x - radius, node.y - radius,
        node.x + radius, node.y + radius,
        fill=COLORS['node_default'],
        outline=COLORS['path'],
        width=2
    )
    self.canvas.create_text(
        node.x, node.y,
        text=str(node.value),
        font=FONTS['body'],
        fill=COLORS['text']
    )

# Graph Implementation
def add_graph_node(self, value):
    """Add a node to the graph"""
    node_id = len(self.graph_nodes)
    # Position nodes in a circle
    angle = (2 * 3.14159 * node_id) / max(len(self.graph_nodes) + 1, 8)
    x = 500 + 200 * math.cos(angle)
    y = 300 + 200 * math.sin(angle)
    self.graph_nodes[node_id] = GraphNode(node_id, value, x, y)
    self.draw_structure()

def add_graph_edge(self, from_id, to_id):
    """Add an edge between two nodes"""
    if from_id in self.graph_nodes and to_id in self.graph_nodes:
        if to_id not in self.graph_nodes[from_id].edges:
            self.graph_nodes[from_id].edges.append(to_id)
            self.graph_edges.append((from_id, to_id))
    self.draw_structure()

def draw_graph(self):
    """Draw graph visualization"""
    if not self.graph_nodes:
        self.canvas.create_text(
            500, 300,
            text="Empty Graph\\nAdd nodes to visualize",
            font=FONTS['heading'],
            fill=COLORS['text_secondary']
        )
        return
    
    # Draw edges
    for from_id, to_id in self.graph_edges:
        from_node = self.graph_nodes[from_id]
        to_node = self.graph_nodes[to_id]
        self.canvas.create_line(
            from_node.x, from_node.y,
            to_node.x, to_node.y,
            fill=COLORS['edge_default'],
            width=2,
            arrow=ctk.LAST
        )
    
    # Draw nodes
    for node in self.graph_nodes.values():
        radius = 30
        self.canvas.create_oval(
            node.x - radius, node.y - radius,
            node.x + radius, node.y + radius,
            fill=COLORS['node_default'],
            outline=COLORS['path'],
            width=2
        )
        self.canvas.create_text(
            node.x, node.y,
            text=str(node.value),
            font=FONTS['body'],
            fill=COLORS['text']
        )

# Heap Implementation
def heap_insert(self, value):
    """Insert into heap"""
    self.heap.append(value)
    self._bubble_up(len(self.heap) - 1)
    self.draw_structure()

def _bubble_up(self, index):
    """Bubble up element in heap"""
    while index > 0:
        parent = (index - 1) // 2
        if self.heap_type == "Min":
            if self.heap[index] < self.heap[parent]:
                self.heap[index], self.heap[parent] = self.heap[parent], self.heap[index]
                index = parent
            else:
                break
        else:  # Max heap
            if self.heap[index] > self.heap[parent]:
                self.heap[index], self.heap[parent] = self.heap[parent], self.heap[index]
                index = parent
            else:
                break

def heap_extract(self):
    """Extract min/max from heap"""
    if not self.heap:
        return None
    if len(self.heap) == 1:
        return self.heap.pop()
    root = self.heap[0]
    self.heap[0] = self.heap.pop()
    self._bubble_down(0)
    self.draw_structure()
    return root

def _bubble_down(self, index):
    """Bubble down element in heap"""
    while True:
        smallest = index
        left = 2 * index + 1
        right = 2 * index + 2
        
        if self.heap_type == "Min":
            if left < len(self.heap) and self.heap[left] < self.heap[smallest]:
                smallest = left
            if right < len(self.heap) and self.heap[right] < self.heap[smallest]:
                smallest = right
        else:  # Max heap
            if left < len(self.heap) and self.heap[left] > self.heap[smallest]:
                smallest = left
            if right < len(self.heap) and self.heap[right] > self.heap[smallest]:
                smallest = right
        
        if smallest != index:
            self.heap[index], self.heap[smallest] = self.heap[smallest], self.heap[index]
            index = smallest
        else:
            break

def draw_heap(self):
    """Draw heap as a tree"""
    if not self.heap:
        self.canvas.create_text(
            500, 300,
            text=f"Empty {self.heap_type} Heap\\nInsert elements to visualize",
            font=FONTS['heading'],
            fill=COLORS['text_secondary']
        )
        return
    
    # Draw heap as binary tree
    self._draw_heap_node(0, 500, 50, 200)

def _draw_heap_node(self, index, x, y, offset):
    """Recursively draw heap nodes"""
    if index >= len(self.heap):
        return
    
    # Draw children first
    left = 2 * index + 1
    right = 2 * index + 2
    
    if left < len(self.heap):
        left_x = x - offset
        left_y = y + 80
        self.canvas.create_line(x, y, left_x, left_y, fill=COLORS['edge_default'], width=2)
        self._draw_heap_node(left, left_x, left_y, offset // 2)
    
    if right < len(self.heap):
        right_x = x + offset
        right_y = y + 80
        self.canvas.create_line(x, y, right_x, right_y, fill=COLORS['edge_default'], width=2)
        self._draw_heap_node(right, right_x, right_y, offset // 2)
    
    # Draw node
    radius = 25
    self.canvas.create_oval(
        x - radius, y - radius,
        x + radius, y + radius,
        fill=COLORS['node_default'],
        outline=COLORS['path'],
        width=2
    )
    self.canvas.create_text(
        x, y,
        text=str(self.heap[index]),
        font=FONTS['body'],
        fill=COLORS['text']
    )
