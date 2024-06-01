document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const rows = 20;
    const cols = 20;
    const gridArray = [];
    const delay = 100; // Delay in milliseconds
    
    let startNode = null;
    let endNode = null;

    for (let r = 0; r < rows; r++) {
        const rowArray = [];
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', () => {
                if (!startNode) {
                    startNode = cell;
                    cell.classList.add('start');
                } else if (!endNode) {
                    endNode = cell;
                    cell.classList.add('end');
                } else {
                    cell.classList.toggle('wall');
                }
            });
            grid.appendChild(cell);
            rowArray.push(cell);
        }
        gridArray.push(rowArray);
    }

    function getNeighbors(node) {
        const neighbors = [];
        const row = parseInt(node.dataset.row);
        const col = parseInt(node.dataset.col);

        if (row > 0) neighbors.push(gridArray[row - 1][col]);
        if (row < rows - 1) neighbors.push(gridArray[row + 1][col]);
        if (col > 0) neighbors.push(gridArray[row][col - 1]);
        if (col < cols - 1) neighbors.push(gridArray[row][col + 1]);

        return neighbors.filter(neighbor => !neighbor.classList.contains('wall'));
    }

    function heuristic(nodeA, nodeB) {
        const dx = Math.abs(nodeA.dataset.row - nodeB.dataset.row);
        const dy = Math.abs(nodeA.dataset.col - nodeB.dataset.col);
        return dx + dy;
    }

    async function aStar() {
        const openSet = [startNode];
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        gScore.set(startNode, 0);
        fScore.set(startNode, heuristic(startNode, endNode));

        while (openSet.length > 0) {
            let current = openSet.reduce((a, b) => fScore.get(a) < fScore.get(b) ? a : b);

            if (current === endNode) {
                reconstructPath(cameFrom, current);
                return;
            }

            openSet.splice(openSet.indexOf(current), 1);
            current.classList.add('visited');

            for (const neighbor of getNeighbors(current)) {
                const tentative_gScore = gScore.get(current) + 1;

                if (!gScore.has(neighbor) || tentative_gScore < gScore.get(neighbor)) {
                    cameFrom.set(neighbor, current);
                    gScore.set(neighbor, tentative_gScore);
                    fScore.set(neighbor, tentative_gScore + heuristic(neighbor, endNode));

                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    async function dijkstra() {
        const openSet = [startNode];
        const cameFrom = new Map();
        const gScore = new Map();

        gScore.set(startNode, 0);

        while (openSet.length > 0) {
            let current = openSet.reduce((a, b) => gScore.get(a) < gScore.get(b) ? a : b);

            if (current === endNode) {
                reconstructPath(cameFrom, current);
                return;
            }

            openSet.splice(openSet.indexOf(current), 1);
            current.classList.add('visited');

            for (const neighbor of getNeighbors(current)) {
                const tentative_gScore = gScore.get(current) + 1;

                if (!gScore.has(neighbor) || tentative_gScore < gScore.get(neighbor)) {
                    cameFrom.set(neighbor, current);
                    gScore.set(neighbor, tentative_gScore);

                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    function reconstructPath(cameFrom, current) {
        while (cameFrom.has(current)) {
            current = cameFrom.get(current);
            current.classList.add('path');
        }
    }

    document.addEventListener('keypress', (event) => {
        if (event.key === 'a') {
            resetGrid();
            aStar();
        } else if (event.key === 'd') {
            resetGrid();
            dijkstra();
        }
    });

    function resetGrid() {
        gridArray.flat().forEach(cell => {
            if (!cell.classList.contains('start') && !cell.classList.contains('end') && !cell.classList.contains('wall')) {
                cell.classList.remove('visited', 'path');
            }
        });
    }
});
