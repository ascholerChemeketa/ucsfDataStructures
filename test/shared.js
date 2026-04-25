import { Algorithm } from "../AlgorithmLibrary/Algorithm.js";
import { normalizeAnimation } from "../AnimationLibrary/AnimationSchema.js";
import { replayAnimation } from "../AnimationLibrary/AnimationState.js";
import { AVL } from "../AlgorithmLibrary/AVL.js";
import { BFS } from "../AlgorithmLibrary/BFS.js";
import { BPlusTree } from "../AlgorithmLibrary/BPlusTree.js";
import { BST } from "../AlgorithmLibrary/BST.js";
import { BSTCopy } from "../AlgorithmLibrary/BSTCopy.js";
import { BSTIterator } from "../AlgorithmLibrary/BSTIterator.js";
import { BTree } from "../AlgorithmLibrary/BTree.js";
import { ClosedHash } from "../AlgorithmLibrary/ClosedHash.js";
import { ConnectedComponent } from "../AlgorithmLibrary/ConnectedComponent.js";
import { DetectCycle } from "../AlgorithmLibrary/DetectCycle.js";
import { DFS } from "../AlgorithmLibrary/DFS.js";
import { DijkstraPrim } from "../AlgorithmLibrary/DijkstraPrim.js";
import { DoublyLinkedList } from "../AlgorithmLibrary/DoublyLinkedList.js";
import { ExpressionTree } from "../AlgorithmLibrary/ExpressionTree.js";
import { Graph } from "../AlgorithmLibrary/Graph.js";
import { Heap } from "../AlgorithmLibrary/Heap.js";
import { HeapMax } from "../AlgorithmLibrary/HeapMax.js";
import { HeapSort } from "../AlgorithmLibrary/HeapSort.js";
import { Kruskal } from "../AlgorithmLibrary/Kruskal.js";
import { LinkedList } from "../AlgorithmLibrary/LinkedList.js";
import { LinkedListSimple } from "../AlgorithmLibrary/LinkedListSimple.js";
import { LinkedListTail } from "../AlgorithmLibrary/LinkedListTail.js";
import { OpenHash } from "../AlgorithmLibrary/OpenHash.js";
import { Prim } from "../AlgorithmLibrary/Prim.js";
import { QueueArray } from "../AlgorithmLibrary/QueueArray.js";
import { QueueLL } from "../AlgorithmLibrary/QueueLL.js";
import { RadixTree } from "../AlgorithmLibrary/RadixTree.js";
import { RedBlack } from "../AlgorithmLibrary/RedBlack.js";
import { Search } from "../AlgorithmLibrary/Search.js";
import { SkipList } from "../AlgorithmLibrary/SkipList.js";
import { SplayTree } from "../AlgorithmLibrary/SplayTree.js";
import { StackArray } from "../AlgorithmLibrary/StackArray.js";
import { StackLL } from "../AlgorithmLibrary/StackLL.js";
import { StringHash } from "../AlgorithmLibrary/StringHash.js";
import { TopoSortDFS } from "../AlgorithmLibrary/TopoSortDFS.js";
import { Treap } from "../AlgorithmLibrary/Treap.js";
import { Trie } from "../AlgorithmLibrary/Trie.js";

function createBareBST() {
  const bst = Object.create(BST.prototype);
  bst.recordAnimation = true;
  bst.commands = [];
  bst.pendingBlock = null;
  bst.currentAnimationOperation = null;
  bst.nextIndex = 2;
  bst.rootIndex = 0;
  bst.startingX = 200;
  bst.treeRoot = null;
  return bst;
}

function createBareAVL() {
  const avl = Object.create(AVL.prototype);
  avl.recordAnimation = true;
  avl.commands = [];
  avl.pendingBlock = null;
  avl.currentAnimationOperation = null;
  avl.nextIndex = 2;
  avl.rootIndex = 0;
  avl.startingX = 150;
  avl.treeRoot = null;
  return avl;
}

function createBareBFS() {
  const bfs = Object.create(BFS.prototype);
  bfs.recordAnimation = true;
  bfs.commands = [];
  bfs.pendingBlock = null;
  bfs.currentAnimationOperation = null;
  bfs.size = 3;
  bfs.nextIndex = 400;
  bfs.directed = true;
  bfs.showEdgeCosts = false;
  bfs.messageID = [];
  bfs.adj_matrix = [
    [-1, 1, 1],
    [-1, -1, 1],
    [-1, -1, -1],
  ];
  bfs.curve = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  bfs.circleID = [100, 101, 102];
  bfs.visitedID = [200, 201, 202];
  bfs.parentID = [210, 211, 212];
  bfs.adj_list_edges = [
    [null, 300, 301],
    [null, null, 302],
    [null, null, null],
  ];
  bfs.adj_matrixID = [
    [310, 311, 312],
    [313, 314, 315],
    [316, 317, 318],
  ];
  bfs.x_pos_logical = [80, 180, 280];
  bfs.y_pos_logical = [120, 120, 120];
  bfs.adj_list_x_start = 500;
  bfs.adj_list_y_start = 100;
  bfs.adj_list_width = 40;
  bfs.adj_list_height = 30;
  bfs.adj_matrix_x_start = 650;
  bfs.adj_matrix_y_start = 100;
  bfs.adj_matrix_width = 25;
  bfs.adj_matrix_height = 25;
  bfs.highlightCircleL = 350;
  bfs.highlightCircleAL = 351;
  bfs.highlightCircleAM = 352;
  return bfs;
}

function createBPlusNode({
  graphicID,
  keys,
  x = 0,
  y = 30,
  isLeaf = true,
  children = [],
  next = null,
  parent = null,
}) {
  return {
    widths: [],
    keys: [...keys],
    children: [...children],
    x,
    y,
    graphicID,
    numKeys: keys.length,
    isLeaf,
    parent,
    leftWidth: 0,
    rightWidth: 0,
    next,
  };
}

function createBareBPlusTree() {
  const tree = Object.create(BPlusTree.prototype);
  tree.recordAnimation = true;
  tree.commands = [];
  tree.pendingBlock = null;
  tree.currentAnimationOperation = null;
  tree.nextIndex = 3;
  tree.messageID = 0;
  tree.moveLabel1ID = 1;
  tree.moveLabel2ID = 2;
  tree.starting_x = 200;
  tree.max_degree = 3;
  tree.max_keys = 2;
  tree.min_keys = 1;
  tree.split_index = 1;
  tree.preemptiveSplit = false;
  tree.treeRoot = null;
  tree.first_print_pos_y = 140;
  tree.xPosOfNextLabel = 100;
  tree.yPosOfNextLabel = 200;
  return tree;
}

function createBareBSTCopy() {
  const bst = Object.create(BSTCopy.prototype);
  bst.recordAnimation = true;
  bst.commands = [];
  bst.pendingBlock = null;
  bst.currentAnimationOperation = null;
  bst.nextIndex = 4;
  bst.startingX = 50;
  bst.copyStartingX = 300;
  bst.rootIndex = 0;
  bst.rootCopyIndex = 2;
  bst.treeRoot = null;
  bst.rootCopy = null;
  bst.copyDone = false;
  bst.sourceToCopyID = new Map();
  return bst;
}

function createBareBSTIterator() {
  const bst = Object.create(BSTIterator.prototype);
  bst.recordAnimation = true;
  bst.commands = [];
  bst.pendingBlock = null;
  bst.currentAnimationOperation = null;
  bst.nextIndex = 4;
  bst.startingX = 250;
  bst.rootIndex = 0;
  bst.stackTitleID = 2;
  bst.treeRoot = null;
  bst.iteratorReady = false;
  bst.iteratorStack = [];
  bst.iteratorCurrentNode = null;
  bst.advanceIteratorButton = { disabled: true };
  bst.syncControlState = BSTIterator.prototype.syncControlState.bind(bst);
  return bst;
}

function createBTreeNode({
  graphicID,
  keys,
  x = 100,
  y = 30,
  isLeaf = true,
  children = [],
  parent = null,
}) {
  return {
    widths: [],
    keys: [...keys],
    children: [...children],
    x,
    y,
    graphicID,
    numKeys: keys.length,
    isLeaf,
    parent,
    leftWidth: 0,
    rightWidth: 0,
  };
}

function createBareBTree() {
  const tree = Object.create(BTree.prototype);
  tree.recordAnimation = true;
  tree.commands = [];
  tree.pendingBlock = null;
  tree.currentAnimationOperation = null;
  tree.nextIndex = 3;
  tree.messageID = 0;
  tree.moveLabel1ID = 1;
  tree.moveLabel2ID = 2;
  tree.starting_x = 100;
  tree.max_degree = 3;
  tree.max_keys = 2;
  tree.min_keys = 1;
  tree.split_index = 1;
  tree.preemptiveSplit = false;
  tree.treeRoot = null;
  tree.first_print_pos_y = 140;
  tree.xPosOfNextLabel = 100;
  tree.yPosOfNextLabel = 200;
  return tree;
}

function createBareClosedHash() {
  const hash = Object.create(ClosedHash.prototype);
  hash.recordAnimation = true;
  hash.commands = [];
  hash.pendingBlock = null;
  hash.currentAnimationOperation = null;
  hash.nextIndex = 100;
  hash.hasGrown = false;
  hash.elements_per_row = 8;
  hash.table_size = 8;
  hash.hashingIntegers = true;
  hash.animateStringHashing = true;
  hash.skipDist = Array.from({ length: 8 }, (_, i) => i);
  hash.hashTableVisual = Array.from({ length: 8 }, (_, i) => 200 + i);
  hash.hashTableIndices = Array.from({ length: 8 }, (_, i) => 300 + i);
  hash.hashTableValues = new Array(8);
  hash.indexXPos = Array.from({ length: 8 }, (_, i) => 50 + i * 90);
  hash.indexYPos = Array.from({ length: 8 }, () => 130);
  hash.empty = Array.from({ length: 8 }, () => true);
  hash.deleted = Array.from({ length: 8 }, () => false);
  hash.linearProblingButton = { name: "linear" };
  hash.quadraticProbingButton = { name: "quadratic" };
  hash.doubleHashingButton = { name: "double" };
  hash.currentHashingTypeButtonState = hash.linearProblingButton;
  hash.growButton = { disabled: false };
  return hash;
}

function createGraphMatrix(size, edges) {
  const matrix = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => -1),
  );
  for (const [from, to] of edges) {
    matrix[from][to] = 1;
  }
  return matrix;
}

function createGraphEdgeIds(size, baseId) {
  let next = baseId;
  const ids = Array.from({ length: size }, () => Array.from({ length: size }, () => null));
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      ids[i][j] = next++;
    }
  }
  return ids;
}

function createBareDetectCycle(edges = [[0, 1], [1, 2], [2, 1]]) {
  const algo = Object.create(DetectCycle.prototype);
  algo.recordAnimation = true;
  algo.commands = [];
  algo.pendingBlock = null;
  algo.currentAnimationOperation = null;
  algo.size = 3;
  algo.nextIndex = 500;
  algo.directed = true;
  algo.showEdgeCosts = false;
  algo.messageID = [];
  algo.visitedID = [200, 201, 202];
  algo.visitedIndexID = [210, 211, 212];
  algo.onStackID = [220, 221, 222];
  algo.onStackIndexID = [230, 231, 232];
  algo.circleID = [100, 101, 102];
  algo.adj_matrix = createGraphMatrix(3, edges);
  algo.adj_list_edges = createGraphEdgeIds(3, 300);
  algo.adj_matrixID = createGraphEdgeIds(3, 400);
  algo.x_pos_logical = [80, 180, 280];
  algo.y_pos_logical = [120, 120, 120];
  algo.adj_list_x_start = 500;
  algo.adj_list_y_start = 100;
  algo.adj_list_width = 40;
  algo.adj_list_height = 30;
  algo.adj_matrix_x_start = 650;
  algo.adj_matrix_y_start = 100;
  algo.adj_matrix_width = 25;
  algo.adj_matrix_height = 25;
  algo.highlightCircleL = 350;
  algo.highlightCircleAL = 351;
  algo.highlightCircleAM = 352;
  algo.animationManager = { animatedObjects: { Nodes: {} } };
  algo.rebuildEdges = function () {};
  algo.highlightEdge = Graph.prototype.highlightEdge.bind(algo);
  algo.setEdgeColor = Graph.prototype.setEdgeColor.bind(algo);
  return algo;
}

function createBareConnectedComponent(edges = [[0, 1], [1, 0]]) {
  const algo = Object.create(ConnectedComponent.prototype);
  algo.recordAnimation = true;
  algo.commands = [];
  algo.pendingBlock = null;
  algo.currentAnimationOperation = null;
  algo.size = 3;
  algo.nextIndex = 600;
  algo.directed = true;
  algo.showEdgeCosts = false;
  algo.currentLayer = 0;
  algo.runLocked = false;
  algo.circleID = [100, 101, 102];
  algo.adj_matrix = createGraphMatrix(3, edges);
  algo.adj_list_edges = createGraphEdgeIds(3, 300);
  algo.adj_matrixID = createGraphEdgeIds(3, 400);
  algo.adj_list_list = [[], [], []];
  algo.adj_list_index = [0, 1, 2];
  algo.old_adj_matrix = algo.adj_matrix.map((row) => row.slice());
  algo.old_adj_list_list = algo.adj_list_list.slice();
  algo.old_adj_list_index = algo.adj_list_index.slice();
  algo.old_adj_list_edges = algo.adj_list_edges.map((row) => row.slice());
  algo.x_pos_logical = [80, 180, 280];
  algo.y_pos_logical = [120, 120, 120];
  algo.curve = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  algo.adj_list_x_start = 500;
  algo.adj_list_y_start = 100;
  algo.adj_list_width = 40;
  algo.adj_list_height = 30;
  algo.adj_matrix_x_start = 650;
  algo.adj_matrix_y_start = 100;
  algo.adj_matrix_width = 25;
  algo.adj_matrix_height = 25;
  algo.highlightCircleL = 350;
  algo.highlightCircleAL = 351;
  algo.highlightCircleAM = 352;
  algo.initialIndex = 600;
  algo.stackBaseX = 40;
  algo.stackBaseY = 30;
  algo.stackSectionY = algo.stackBaseY;
  algo.stackIndent = 10;
  algo.stackLineHeight = 20;
  algo.stackSectionGap = 12;
  algo.stackLabelIDs = [];
  algo.callStackDepth = 0;
  algo.stackRowCount = 0;
  algo.d_x_pos = [560, 660, 760];
  algo.d_y_pos = [37, 37, 37];
  algo.f_x_pos = [560, 660, 760];
  algo.f_y_pos = [62, 62, 62];
  algo.ccColors = ["#cc3333", "#33aa33", "#3366cc"];
  algo.currentComponentColor = "#0000FF";
  algo.sortedColumnX = 200;
  algo.sortedColumnYStart = 30;
  algo.sortedRowHeight = 20;
  algo.sortedLabelsIDs = new Array(3);
  algo.rebuildEdges = function () {};
  algo.clearEdges = function () {};
  algo.removeAdjList = function () {};
  algo.buildAdjList = function () {};
  algo.buildEdges = function () {};
  algo.highlightEdge = Graph.prototype.highlightEdge.bind(algo);
  return algo;
}

function createBareDFS({ iterative = false, edges = [[0, 1], [1, 2]] } = {}) {
  const algo = Object.create(DFS.prototype);
  algo.recordAnimation = true;
  algo.commands = [];
  algo.pendingBlock = null;
  algo.currentAnimationOperation = null;
  algo.useIterative = iterative;
  algo.size = 3;
  algo.nextIndex = 500;
  algo.directed = true;
  algo.showEdgeCosts = false;
  algo.messageID = [];
  algo.visitedID = [200, 201, 202];
  algo.visitedIndexID = [210, 211, 212];
  algo.parentID = [220, 221, 222];
  algo.parentIndexID = [230, 231, 232];
  algo.circleID = [100, 101, 102];
  algo.adj_matrix = createGraphMatrix(3, edges);
  algo.adj_list_edges = createGraphEdgeIds(3, 300);
  algo.adj_matrixID = createGraphEdgeIds(3, 400);
  algo.x_pos_logical = [80, 180, 280];
  algo.y_pos_logical = [120, 120, 120];
  algo.adj_list_x_start = 500;
  algo.adj_list_y_start = 100;
  algo.adj_list_width = 40;
  algo.adj_list_height = 30;
  algo.adj_matrix_x_start = 650;
  algo.adj_matrix_y_start = 100;
  algo.adj_matrix_width = 25;
  algo.adj_matrix_height = 25;
  algo.highlightCircleL = 350;
  algo.highlightCircleAL = 351;
  algo.highlightCircleAM = 352;
  algo.rebuildEdges = function () {};
  algo.highlightEdge = Graph.prototype.highlightEdge.bind(algo);
  algo.setEdgeColor = Graph.prototype.setEdgeColor.bind(algo);
  algo.messageY = 30;
  return algo;
}

function createBareDijkstraPrim({
  runningDijkstra = true,
  edges = [
    [0, 1, 4],
    [0, 2, 1],
    [2, 1, 2],
  ],
} = {}) {
  const algo = Object.create(DijkstraPrim.prototype);
  algo.recordAnimation = true;
  algo.commands = [];
  algo.pendingBlock = null;
  algo.currentAnimationOperation = null;
  algo.runningDijkstra = runningDijkstra;
  algo.size = 3;
  algo.nextIndex = 600;
  algo.directed = false;
  algo.showEdgeCosts = true;
  algo.message1ID = 0;
  algo.comparisonMessageID = 700;
  algo.messageID = [];
  algo.circleID = [100, 101, 102];
  algo.vertexID = [200, 201, 202];
  algo.knownID = [210, 211, 212];
  algo.distanceID = [220, 221, 222];
  algo.pathID = [230, 231, 232];
  algo.known = new Array(3);
  algo.distance = new Array(3);
  algo.path = new Array(3);
  algo.adj_list_edges = createGraphEdgeIds(3, 300);
  algo.adj_matrixID = createGraphEdgeIds(3, 400);
  algo.adj_matrix = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => -1));
  for (const [from, to, weight] of edges) {
    algo.adj_matrix[from][to] = weight;
    algo.adj_matrix[to][from] = weight;
  }
  algo.highlightEdge = Graph.prototype.highlightEdge.bind(algo);
  algo.setEdgeColor = Graph.prototype.setEdgeColor.bind(algo);
  algo.recolorGraph = function () {};
  return algo;
}

function createBareDoublyLinkedList() {
  const list = Object.create(DoublyLinkedList.prototype);
  list.recordAnimation = true;
  list.commands = [];
  list.pendingBlock = null;
  list.currentAnimationOperation = null;
  list.nextIndex = 20;
  list.nodeIDs = [];
  list.values = [];
  list.hasCurrentPointer = false;
  list.currentNodeID = null;
  list.sizeID = 0;
  list.headID = 1;
  list.tailID = 2;
  list.tempID = 3;
  list.tempLabelID = 4;
  list.currentID = 5;
  list.currentLabelID = 6;
  list.dummyHeadID = 7;
  list.dummyTailID = 8;
  list.animationManager = {
    animatedObjects: {
      getNodeX(id) {
        return id === 8 ? 180 : 100;
      },
      getNodeY() {
        return 150;
      },
    },
  };
  return list;
}

function createBareExpressionTree() {
  const tree = Object.create(ExpressionTree.prototype);
  tree.recordAnimation = true;
  tree.commands = [];
  tree.pendingBlock = null;
  tree.currentAnimationOperation = null;
  tree.nextIndex = 1;
  tree.treeRoot = null;
  tree.evalLabelIDs = [];
  tree.printOutput = "";
  tree.printOutputLabelID = -1;
  tree.canvasWidth = 1000;
  tree.parensInorderCheckbox = { checked: false };
  return tree;
}

function createBareHeap() {
  const heap = Object.create(Heap.prototype);
  heap.recordAnimation = true;
  heap.commands = [];
  heap.pendingBlock = null;
  heap.currentAnimationOperation = null;
  heap.nextIndex = 100;
  heap.currentHeapSize = 0;
  heap.HeapXPositions = Array.from({ length: 15 }, (_, i) => 100 + i * 20);
  heap.HeapYPositions = Array.from({ length: 15 }, (_, i) => 120 + Math.floor(Math.log2(i + 1)) * 50);
  heap.ArrayXPositions = Array.from({ length: 15 }, (_, i) => 30 + i * 30);
  heap.arrayData = new Array(15).fill("");
  heap.arrayRects = Array.from({ length: 15 }, (_, i) => 200 + i);
  heap.circleObjs = Array.from({ length: 15 }, (_, i) => 300 + i);
  heap.arrayLabels = Array.from({ length: 15 }, (_, i) => 400 + i);
  heap.swapLabel1 = 500;
  heap.swapLabel2 = 501;
  heap.swapLabel3 = 502;
  heap.swapLabel4 = 503;
  heap.descriptLabel1 = 504;
  heap.descriptLabel2 = 505;
  return heap;
}

function createBareHeapMax() {
  const heap = Object.create(HeapMax.prototype);
  heap.recordAnimation = true;
  heap.commands = [];
  heap.pendingBlock = null;
  heap.currentAnimationOperation = null;
  heap.nextIndex = 100;
  heap.currentHeapSize = 0;
  heap.HeapXPositions = Array.from({ length: 15 }, (_, i) => 100 + i * 20);
  heap.HeapYPositions = Array.from({ length: 15 }, (_, i) => 120 + Math.floor(Math.log2(i + 1)) * 50);
  heap.ArrayXPositions = Array.from({ length: 15 }, (_, i) => 30 + i * 30);
  heap.arrayData = new Array(15).fill("");
  heap.arrayRects = Array.from({ length: 15 }, (_, i) => 200 + i);
  heap.circleObjs = Array.from({ length: 15 }, (_, i) => 300 + i);
  heap.arrayLabels = Array.from({ length: 15 }, (_, i) => 400 + i);
  heap.swapLabel1 = 500;
  heap.swapLabel2 = 501;
  heap.swapLabel3 = 502;
  heap.swapLabel4 = 503;
  heap.descriptLabel1 = 504;
  heap.descriptLabel2 = 505;
  return heap;
}

function createBareHeapSort(values = [9, 4, 7, 1, 3]) {
  const heap = Object.create(HeapSort.prototype);
  heap.recordAnimation = true;
  heap.commands = [];
  heap.pendingBlock = null;
  heap.currentAnimationOperation = null;
  heap.nextIndex = 100;
  heap.currentHeapSize = 0;
  heap.heapDrawn = false;
  heap.isHeapified = false;
  heap.heapsortButton = { disabled: true };
  heap.randomizeArrayButton = { disabled: false };
  heap.heapifyButton = { disabled: false };
  heap.HeapXPositions = Array.from({ length: 15 }, (_, i) => 100 + i * 20);
  heap.HeapYPositions = Array.from({ length: 15 }, (_, i) => 120 + Math.floor(Math.log2(i + 1)) * 50);
  heap.ArrayXPositions = Array.from({ length: 15 }, (_, i) => 30 + i * 30);
  heap.arrayData = new Array(15).fill(0);
  heap.oldData = new Array(15).fill(0);
  for (let i = 0; i < values.length; i++) {
    heap.arrayData[i] = values[i];
    heap.oldData[i] = values[i];
  }
  heap.arrayRects = Array.from({ length: 15 }, (_, i) => 200 + i);
  heap.circleObjs = Array.from({ length: 15 }, (_, i) => 300 + i);
  heap.arrayLabels = Array.from({ length: 15 }, (_, i) => 400 + i);
  heap.swapLabel1 = 500;
  heap.swapLabel2 = 501;
  heap.swapLabel3 = 502;
  heap.swapLabel4 = 503;
  heap.descriptLabel1 = 504;
  heap.descriptLabel2 = 505;
  return heap;
}

function createBareKruskal() {
  const algo = Object.create(Kruskal.prototype);
  algo.recordAnimation = true;
  algo.commands = [];
  algo.pendingBlock = null;
  algo.currentAnimationOperation = null;
  algo.size = 3;
  algo.nextIndex = 600;
  algo.directed = false;
  algo.showEdgeCosts = true;
  algo.currentLayer = 0;
  algo.circleID = [100, 101, 102];
  algo.setID = [200, 201, 202];
  algo.setIndexID = [210, 211, 212];
  algo.setData = new Array(3).fill(-1);
  algo.adj_matrix = [
    [-1, 1, 3],
    [1, -1, 2],
    [3, 2, -1],
  ];
  algo.adj_list_edges = createGraphEdgeIds(3, 300);
  algo.adj_matrixID = createGraphEdgeIds(3, 400);
  algo.highlightEdge = Graph.prototype.highlightEdge.bind(algo);
  algo.setEdgeColor = Graph.prototype.setEdgeColor.bind(algo);
  algo.recolorGraph = Graph.prototype.recolorGraph.bind(algo);
  return algo;
}

function createBareLinkedList() {
  const list = Object.create(LinkedList.prototype);
  list.recordAnimation = true;
  list.commands = [];
  list.pendingBlock = null;
  list.currentAnimationOperation = null;
  list.nextIndex = 50;
  list.linkedListElemID = Array.from({ length: 32 }, (_, i) => 100 + i);
  list.headID = 1;
  list.tailID = 2;
  list.tempID = 3;
  list.tempLabelID = 4;
  list.leftoverLabelID = 5;
  list.arrayData = new Array(32);
  list.top = 0;
  list.createdNodeCount = 0;
  return list;
}

function createBareLinkedListSimple() {
  const list = Object.create(LinkedListSimple.prototype);
  list.recordAnimation = true;
  list.commands = [];
  list.pendingBlock = null;
  list.currentAnimationOperation = null;
  list.nextIndex = 50;
  list.linkedListElemID = Array.from({ length: 32 }, (_, i) => 100 + i);
  list.headID = 1;
  list.tempID = 2;
  list.tempLabelID = 3;
  list.currentID = 4;
  list.currentLabelID = 5;
  list.leftoverLabelID = 6;
  list.arrayData = new Array(32);
  list.top = 0;
  list.createdNodeCount = 0;
  list.nodeXByID = new Map();
  list.leftMostX = 150;
  list.hasCurrentPointer = false;
  list.currentNodeID = null;
  list.animationManager = {
    animatedObjects: {
      getNodeX(id) {
        return list.nodeXByID.get(id) ?? 150;
      },
      getNodeY() {
        return 150;
      },
    },
  };
  return list;
}

function createBareLinkedListTail() {
  const list = Object.create(LinkedListTail.prototype);
  list.recordAnimation = true;
  list.commands = [];
  list.pendingBlock = null;
  list.currentAnimationOperation = null;
  list.nextIndex = 50;
  list.LinkedListTailElemID = Array.from({ length: 32 }, (_, i) => 100 + i);
  list.sizeID = 1;
  list.headID = 2;
  list.tailID = 3;
  list.tempID = 4;
  list.tempLabelID = 5;
  list.currentID = 6;
  list.currentLabelID = 7;
  list.leftoverLabelID = 8;
  list.arrayData = new Array(32);
  list.top = 0;
  list.createdNodeCount = 0;
  list.nodeXByID = new Map();
  list.leftMostX = 150;
  list.hasCurrentPointer = false;
  list.currentNodeID = null;
  list.animationManager = {
    animatedObjects: {
      getNodeX(id) {
        return list.nodeXByID.get(id) ?? 150;
      },
      getNodeY() {
        return 150;
      },
    },
  };
  return list;
}

function createBareOpenHash() {
  const hash = Object.create(OpenHash.prototype);
  hash.recordAnimation = true;
  hash.commands = [];
  hash.pendingBlock = null;
  hash.currentAnimationOperation = null;
  hash.nextIndex = 500;
  hash.table_size = 13;
  hash.hashingIntegers = true;
  hash.animateStringHashing = false;
  hash.hashTableVisual = Array.from({ length: 13 }, (_, i) => 100 + i);
  hash.hashTableIndices = Array.from({ length: 13 }, (_, i) => 200 + i);
  hash.hashTableValues = new Array(13).fill(null);
  hash.indexXPos = Array.from({ length: 13 }, (_, i) => 30 + i * 50);
  hash.indexYPos = Array.from({ length: 13 }, () => 300);
  hash.POINTER_ARRAY_ELEM_Y = 300;
  hash.doHash = OpenHash.superclass.doHash.bind(hash);
  return hash;
}

function createBareQueueArray() {
  const queue = Object.create(QueueArray.prototype);
  queue.recordAnimation = true;
  queue.commands = [];
  queue.pendingBlock = null;
  queue.currentAnimationOperation = null;
  queue.nextIndex = 0;
  queue.animationManager = {
    StartNewAnimation() {},
    skipForward() {},
    clearHistory() {},
  };
  QueueArray.prototype.setup.call(queue);
  queue.commands = [];
  queue.pendingBlock = null;
  return queue;
}

function createBareQueueLL() {
  const queue = Object.create(QueueLL.prototype);
  queue.recordAnimation = true;
  queue.commands = [];
  queue.pendingBlock = null;
  queue.currentAnimationOperation = null;
  queue.nextIndex = 0;
  queue.animationManager = {
    StartNewAnimation() {},
    skipForward() {},
    clearHistory() {},
  };
  QueueLL.prototype.setup.call(queue);
  queue.commands = [];
  queue.pendingBlock = null;
  queue.createdNodeCount = 0;
  return queue;
}

function createBareRadixTree() {
  const tree = Object.create(RadixTree.prototype);
  tree.recordAnimation = true;
  tree.commands = [];
  tree.pendingBlock = null;
  tree.currentAnimationOperation = null;
  tree.nextIndex = 3;
  tree.root = null;
  tree.first_print_pos_y = 180;
  tree.print_max = 500;
  return tree;
}

function createBareRedBlack() {
  const tree = Object.create(RedBlack.prototype);
  tree.recordAnimation = true;
  tree.commands = [];
  tree.pendingBlock = null;
  tree.currentAnimationOperation = null;
  tree.nextIndex = 2;
  tree.rootIndex = 0;
  tree.startingX = 100;
  tree.first_print_pos_y = 220;
  tree.print_max = 500;
  tree.treeRoot = null;
  tree.groupBoxes = {};
  tree.showNullLeaves = { checked: false };
  return tree;
}

function createBareSearch() {
  const search = Object.create(Search.prototype);
  search.recordAnimation = true;
  search.commands = [];
  search.pendingBlock = null;
  search.currentAnimationOperation = null;
  search.animationManager = {
    StartNewAnimation() {},
    skipForward() {},
    clearHistory() {},
    resetAll() {},
  };
  Search.prototype.setup_small.call(search);
  search.commands = [];
  search.pendingBlock = null;
  search.currentAnimationOperation = null;
  search.arrayData = [10, 20, 30, 40, 50];
  for (let i = 0; i < search.arrayData.length; i++) {
    search.commands.push({
      label: `seed ${search.arrayData[i]}`,
      meta: { source: "Search", operation: "seed" },
      steps: [{ type: "setText", id: search.arrayID[i], text: search.arrayData[i] }],
    });
  }
  return search;
}

function createBareSkipList() {
  const list = Object.create(SkipList.prototype);
  list.recordAnimation = true;
  list.commands = [];
  list.pendingBlock = null;
  list.currentAnimationOperation = null;
  list.nextIndex = 1000;
  list.nodesByLevel = [];
  list.valueSet = new Set();
  list.towerByValue = new Map();
  list.knownIDs = new Set();
  list.levelMembers = [];
  list.nextByLevel = [];
  list.animationManager = {
    StartNewAnimation() {},
    skipForward() {},
    clearHistory() {},
    animatedObjects: {
      getNodeX(id) {
        return id;
      },
      getNodeY(id) {
        return id;
      },
    },
  };
  SkipList.prototype.ensureLevel.call(list, 0);
  list.commands = [];
  list.pendingBlock = null;
  return list;
}

function createBareSplayTree() {
  const tree = Object.create(SplayTree.prototype);
  tree.recordAnimation = true;
  tree.commands = [];
  tree.pendingBlock = null;
  tree.currentAnimationOperation = null;
  tree.nextIndex = 1;
  tree.treeRoot = null;
  tree.startingX = 100;
  tree.first_print_pos_y = 220;
  tree.print_max = 500;
  return tree;
}

function createBareStackArray() {
  const stack = Object.create(StackArray.prototype);
  stack.recordAnimation = true;
  stack.commands = [];
  stack.pendingBlock = null;
  stack.currentAnimationOperation = null;
  stack.nextIndex = 0;
  stack.animationManager = {
    StartNewAnimation() {},
    skipForward() {},
    clearHistory() {},
  };
  StackArray.prototype.setup.call(stack);
  stack.commands = [];
  stack.pendingBlock = null;
  return stack;
}

function createBareStackLL() {
  const stack = Object.create(StackLL.prototype);
  stack.recordAnimation = true;
  stack.commands = [];
  stack.pendingBlock = null;
  stack.currentAnimationOperation = null;
  stack.nextIndex = 0;
  stack.animationManager = {
    StartNewAnimation() {},
    skipForward() {},
    clearHistory() {},
    animatedObjects: {
      getNodeX(id) {
        return id;
      },
      getNodeY(id) {
        return id;
      },
    },
  };
  StackLL.prototype.setup.call(stack);
  stack.commands = [];
  stack.pendingBlock = null;
  return stack;
}

function createBareStringHash() {
  const hash = Object.create(StringHash.prototype);
  hash.recordAnimation = true;
  hash.commands = [];
  hash.pendingBlock = null;
  hash.currentAnimationOperation = null;
  hash.nextIndex = 0;
  hash.hashingIntegers = false;
  hash.animateStringHashing = false;
  hash.table_size = 13;
  hash.indexXPos = Array.from({ length: 13 }, (_, i) => 30 + i * 50);
  hash.indexYPos = Array.from({ length: 13 }, () => 300);
  return hash;
}

function createBareTopoSortDFS(edges = [[0, 1], [0, 2], [1, 2]]) {
  const algo = Object.create(TopoSortDFS.prototype);
  algo.recordAnimation = true;
  algo.commands = [];
  algo.pendingBlock = null;
  algo.currentAnimationOperation = null;
  algo.size = 3;
  algo.nextIndex = 700;
  algo.directed = true;
  algo.showEdgeCosts = false;
  algo.currentLayer = 0;
  algo.runLocked = false;
  algo.messageID = [];
  algo.circleID = [100, 101, 102];
  algo.adj_matrix = createGraphMatrix(3, edges);
  algo.adj_list_edges = createGraphEdgeIds(3, 300);
  algo.adj_matrixID = createGraphEdgeIds(3, 400);
  algo.x_pos_logical = [80, 180, 280];
  algo.y_pos_logical = [120, 120, 120];
  algo.curve = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  algo.adj_list_x_start = 500;
  algo.adj_list_y_start = 100;
  algo.adj_list_width = 40;
  algo.adj_list_height = 30;
  algo.adj_matrix_x_start = 650;
  algo.adj_matrix_y_start = 100;
  algo.adj_matrix_width = 25;
  algo.adj_matrix_height = 25;
  algo.highlightCircleL = 350;
  algo.highlightCircleAL = 351;
  algo.highlightCircleAM = 352;
  algo.initialIndex = 700;
  algo.stackBaseX = 40;
  algo.stackBaseY = 30;
  algo.stackSectionY = algo.stackBaseY;
  algo.stackIndent = 10;
  algo.stackLineHeight = 20;
  algo.stackSectionGap = 12;
  algo.stackLabelIDs = [];
  algo.callStackDepth = 0;
  algo.stackRowCount = 0;
  algo.d_x_pos = [560, 660, 760];
  algo.d_y_pos = [37, 37, 37];
  algo.f_x_pos = [560, 660, 760];
  algo.f_y_pos = [62, 62, 62];
  algo.rebuildEdges = function () {};
  algo.highlightEdge = Graph.prototype.highlightEdge.bind(algo);
  algo.setEdgeColor = Graph.prototype.setEdgeColor.bind(algo);
  return algo;
}

function createBareTreap() {
  const tree = Object.create(Treap.prototype);
  tree.recordAnimation = true;
  tree.commands = [];
  tree.pendingBlock = null;
  tree.currentAnimationOperation = null;
  tree.nextIndex = 2;
  tree.rootIndex = 0;
  tree.startingX = 150;
  tree.treeRoot = null;
  return tree;
}

function createBareTrie() {
  const trie = Object.create(Trie.prototype);
  trie.recordAnimation = true;
  trie.commands = [];
  trie.pendingBlock = null;
  trie.currentAnimationOperation = null;
  trie.nextIndex = 3;
  trie.root = null;
  trie.startingX = 200;
  trie.first_print_pos_y = 180;
  trie.print_max = 500;
  return trie;
}

function blockLabels(animation) {
  return animation.map((block) => block.label).filter(Boolean);
}

export {
  Algorithm,
  AVL,
  BFS,
  BPlusTree,
  BSTCopy,
  BSTIterator,
  BST,
  BTree,
  ClosedHash,
  ConnectedComponent,
  DetectCycle,
  DFS,
  DijkstraPrim,
  DoublyLinkedList,
  ExpressionTree,
  Heap,
  HeapMax,
  HeapSort,
  Kruskal,
  LinkedList,
  LinkedListSimple,
  LinkedListTail,
  OpenHash,
  Prim,
  QueueArray,
  QueueLL,
  RadixTree,
  RedBlack,
  Search,
  SkipList,
  SplayTree,
  StackArray,
  StackLL,
  StringHash,
  TopoSortDFS,
  Treap,
  Trie,
  blockLabels,
  createBareBSTCopy,
  createBareBSTIterator,
  createBareBPlusTree,
  createBareAVL,
  createBareBFS,
  createBareBST,
  createBareBTree,
  createBareClosedHash,
  createBareConnectedComponent,
  createBareDetectCycle,
  createBareDFS,
  createBareDijkstraPrim,
  createBareDoublyLinkedList,
  createBareExpressionTree,
  createBareHeap,
  createBareHeapMax,
  createBareHeapSort,
  createBareKruskal,
  createBareLinkedList,
  createBareLinkedListSimple,
  createBareLinkedListTail,
  createBareOpenHash,
  createBareQueueArray,
  createBareQueueLL,
  createBareRadixTree,
  createBareRedBlack,
  createBareSearch,
  createBareSkipList,
  createBareSplayTree,
  createBareStackArray,
  createBareStackLL,
  createBareStringHash,
  createBareTopoSortDFS,
  createBareTreap,
  createBareTrie,
  createBPlusNode,
  createBTreeNode,
  normalizeAnimation,
  replayAnimation,
};
