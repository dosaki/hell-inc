// javascript-astar 0.4.1
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a Binary Heap.
// Includes Binary Heap (with modifications) from Marijn Haverbeke.
// http://eloquentjavascript.net/appendix2.html
//
// With some motifications.
// Original: https://github.com/bgrins/javascript-astar/blob/master/astar.js


function BinaryHeap(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
    push: function (element) {
        // Add the new element to the end of the array.
        this.content.push(element);

        // Allow it to sink down.
        this.sd(this.content.length - 1);
    },
    pop: function () {
        // Store the first element so we can return it later.
        var result = this.content[0];
        // Get the element at the end of the array.
        var end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it bubble up.
        if (this.content.length > 0) {
            this.content[0] = end;
            this.bu(0);
        }
        return result;
    },
    remove: function (node) {
        var i = this.content.indexOf(node);

        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();

        if (i !== this.content.length - 1) {
            this.content[i] = end;

            if (this.scoreFunction(end) < this.scoreFunction(node)) {
                this.sd(i);
            } else {
                this.bu(i);
            }
        }
    },
    sd: function (n) {
        // Fetch the element that has to be sunk.
        var element = this.content[n];

        // When at 0, an element can not sink any further.
        while (n > 0) {

            // Compute the parent element's index, and fetch it.
            var parentN = ((n + 1) >> 1) - 1;
            var parent = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            }
            // Found a parent that is less, no need to sink any further.
            else {
                break;
            }
        }
    },
    bu: function (n) {
        // Look up the target element and its score.
        var length = this.content.length;
        var element = this.content[n];
        var elemScore = this.scoreFunction(element);

        while (true) {
            // Compute the indices of the child elements.
            var child2N = (n + 1) << 1;
            var child1N = child2N - 1;
            // This is used to store the new position of the element, if any.
            var swap = null;
            var child1Score;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                var child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);

                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore) {
                    swap = child1N;
                }
            }

            // Do the same checks for the other child.
            if (child2N < length) {
                var child2 = this.content[child2N];
                var child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            // If the element needs to be moved, swap it, and continue.
            if (swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            }
            // Otherwise, we are done.
            else {
                break;
            }
        }
    }
};

function pathTo(node) {
    var curr = node;
    var path = [];
    while (curr.parent) {
        path.unshift(curr);
        curr = curr.parent;
    }
    return path;
}

const manhattan = (pos0, pos1) => Math.abs(pos1.x - pos0.x) + Math.abs(pos1.y - pos0.y);

export var astar = {
    /**
    * Perform an A* Search on a graph given a start and end node.
    * @param {Graph} graph
    * @param {GridNode} start
    * @param {GridNode} end
    */
    s: function (graph, start, end) {
        graph.clean(graph.dirtyNodes);
        this.dirtyNodes = [];

        var openHeap = new BinaryHeap(function (node) { return node.f; });
        var closestNode = start; // set the start node to be the closest if required

        start.h = manhattan(start, end);
        graph.dirtyNodes.push(start);

        openHeap.push(start);

        while (openHeap.content.length > 0) {

            // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
            var currentNode = openHeap.pop();

            // End case -- result has been found, return the traced path.
            if (currentNode === end) {
                return pathTo(currentNode);
            }

            // Normal case -- move currentNode from open to closed, process each of its neighbors.
            currentNode.closed = true;

            // Find all neighbors for the current node.
            var neighbors = graph.neighbors(currentNode);

            for (var i = 0, il = neighbors.length; i < il; ++i) {
                var neighbor = neighbors[i];

                if (neighbor.closed || (neighbor.w === 0)) {
                    // Not a valid node to process, skip to next neighbor.
                    continue;
                }

                // The g score is the shortest distance from start to current node.
                // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
                var gScore = currentNode.g + neighbor.w;
                var beenVisited = neighbor.visited;

                if (!beenVisited || gScore < neighbor.g) {

                    // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                    neighbor.visited = true;
                    neighbor.parent = currentNode;
                    neighbor.h = neighbor.h || manhattan(neighbor, end);
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;
                    graph.dirtyNodes.push(neighbor);
                    if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
                        closestNode = neighbor;
                    }

                    if (!beenVisited) {
                        // Pushing to heap will put it in proper place based on the 'f' value.
                        openHeap.push(neighbor);
                    } else {
                        // Already seen the node, but since it has been rescored we need to reorder it in the heap
                        openHeap.sd(openHeap.content.indexOf(neighbor));
                    }
                }
            }
        }

        return pathTo(closestNode);
    }
};

/**
 * A graph memory structure
 * @param {Array} gridIn 2D array of input weights
 */
export function Graph(gridIn) {
    this.n = [];
    this.g = [];
    for (var y = 0; y < gridIn.length; y++) {
        this.g[y] = [];
        for (var x = 0; x < gridIn[y].length; x++) {
            var node = new GridNode(x, y, gridIn[y][x]);
            this.g[y][x] = node;
            this.n.push(node);
        }
    }
    this.dirtyNodes = [];
    this.clean(this.n);
}

Graph.prototype.clean = function (nodes) {
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].f = 0;
        nodes[i].g = 0;
        nodes[i].h = 0;
        nodes[i].visited = false;
        nodes[i].closed = false;
        nodes[i].parent = null;
    }
};

Graph.prototype.neighbors = function (node) {
    var ret = [];

    // West
    if (this.g[node.y - 1] && this.g[node.y - 1][node.y]) {
        ret.push(this.g[node.y - 1][node.x]);
    }

    // East
    if (this.g[node.y + 1] && this.g[node.y + 1][node.x]) {
        ret.push(this.g[node.y + 1][node.x]);
    }

    // South
    if (this.g[node.y] && this.g[node.y][node.x - 1]) {
        ret.push(this.g[node.y][node.x - 1]);
    }

    // North
    if (this.g[node.y] && this.g[node.y][node.x + 1]) {
        ret.push(this.g[node.y][node.x + 1]);
    }

    return ret;
};

function GridNode(x, y, w) {
    this.x = x;
    this.y = y;
    this.w = w;
}