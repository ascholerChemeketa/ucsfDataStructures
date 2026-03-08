# Data Structures and Algorithms Visualization

This is a fork of David Galles' JavaScript visualization library for data structures and algorithms. The original library can be found at:

<https://www.cs.usfca.edu/~galles/visualization/>

Significant UI modifications have been made to the original library, and some algorithms have been added or removed.

Algorithms that have not been updated to use the new animation system have been moved to the `AlgorithmLibrary/Legacy` directory.

Below are links to animations that are updated and (mostly) working.

## Use

The [Github pages](https://ascholerchemeketa.github.io/ucsfDataStructures/) version of this repository is only intended for demonstration purposes.

If you are planning on making use of the animations for a course or project, it is recommended that you clone the repository
and serve your own copies of the files. <https://github.com/ascholerChemeketa/ucsfDataStructures>

Most of the animations can be configured with initial data and can be configured to start a particular operation (e.g. insert, delete, search).

```html
  <script type="module">
    import { RedBlack } from "./dist/entry.js";

    let anim = new RedBlack({ initialData: [250, 225, 275, 260, 180, 235, 230], title: "Red Black Insertion" });
    anim.doInsert(265);  // queue up an insertion animation for 265
    // Following would invisibly finish the 265 insertion and queue up a subsequent operation
    // anim.animationManager.skipForward();  // skip to end of animation
    // anim.animationManager.clearHistory();  // clear history
    // anim.doInsert(25);  // prepare a new animation
  </script>
```

For what is possible in a given animation, see the source code for that animation. Look for `doX` function bindings.

## Animations

If you are viewing this on Github, switch to Github pages to see the animations instead of the source code.

[Github pages](https://ascholerchemeketa.github.io/ucsfDataStructures/)

- [AVLtree.html](AVLtree.html)
- [BFS.html](BFS.html)
- [BST.html](BST.html)
- [BSTCopy.html](BSTCopy.html)
- [BSTIterator.html](BSTIterator.html)
- [BTree.html](BTree.html)
- [ClosedHash.html](ClosedHash.html)
- [ConnectedComponent.html](ConnectedComponent.html)
- [DFS.html](DFS.html)
- [Dijkstra.html](Dijkstra.html)
- [DoublyLinkedList.html](DoublyLinkedList.html)
- [ExpressionTree.html](ExpressionTree.html)
- [Heap.html](Heap.html)
- [HeapSort.html](HeapSort.html)
- [iframeTest.html](iframeTest.html)
- [Kruskal.html](Kruskal.html)
- [LinkedList.html](LinkedList.html)
- [LinkedListSimple.html](LinkedListSimple.html)
- [LinkedListTailPtr.html](LinkedListTailPtr.html)
- [OpenHash.html](OpenHash.html)
- [Prim.html](Prim.html)
- [QueueArray.html](QueueArray.html)
- [QueueLL.html](QueueLL.html)
- [RedBlack.html](RedBlack.html)
- [SkipList.html](SkipList.html)
- [SplayTree.html](SplayTree.html)
- [StackArray.html](StackArray.html)
- [StackLL.html](StackLL.html)
- [StringHash.html](StringHash.html)
- [TopoSortDFS.html](TopoSortDFS.html)
- [Treap.html](Treap.html)
- [Trie.html](Trie.html)
- [TST.html](TST.html)

```text
// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL  OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco
```
