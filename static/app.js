class GraphingCalculator {
    constructor() {
        this.canvas = document.getElementById('graphCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.functions = [];
        this.colors = ["#ff0000", "#0066cc", "#00cc66", "#ff9900", "#9900cc", "#cc0066", "#006666", "#cc6600"];
        this.maxFunctions = 10;

        // Graph settings
        this.scale = 40; // pixels per unit
        this.centerX = 0;
        this.centerY = 0;
        this.showGrid = true;
        this.showAxes = true;
        this.showLabels = true;

        // Mouse interaction
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.initializeCanvas();
        this.setupEventListeners();
        this.addFunction(); // Add first function input
        this.render();
    }

    initializeCanvas() {
        // Set canvas size to match container
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        this.canvas.width = Math.min(1000, rect.width - 40);
        this.canvas.height = Math.min(800, rect.height - 40);

        // Store actual dimensions for calculations
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
    }

    setupEventListeners() {
        // Canvas mouse events
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

        // Control buttons
        document.getElementById('addFunctionBtn').addEventListener('click', () => this.addFunction());
        document.getElementById('zoomInBtn').addEventListener('click', () => this.zoom(1.5));
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoom(0.75));
        document.getElementById('resetViewBtn').addEventListener('click', () => this.resetView());
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportImage());

        // Toggle controls
        document.getElementById('showGridToggle').addEventListener('change', (e) => {
            this.showGrid = e.target.checked;
            this.render();
        });

        document.getElementById('showAxesToggle').addEventListener('change', (e) => {
            this.showAxes = e.target.checked;
            this.render();
        });

        document.getElementById('showLabelsToggle').addEventListener('change', (e) => {
            this.showLabels = e.target.checked;
            this.render();
        });

        // Example buttons
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const expression = e.target.dataset.expression;
                this.loadExample(expression);
            });
        });
    }

    addFunction() {
        if (this.functions.length >= this.maxFunctions) return;

        const functionData = {
            id: Date.now(),
            expression: '',
            color: this.colors[this.functions.length % this.colors.length],
            visible: true,
            valid: false
        };

        this.functions.push(functionData);
        this.createFunctionInput(functionData);
        this.render();
    }

    createFunctionInput(functionData) {
        const container = document.getElementById('functionInputs');
        const div = document.createElement('div');
        div.className = 'function-input-group';
        div.dataset.id = functionData.id;

        div.innerHTML = `
            <div class="function-color" style="background-color: ${functionData.color}"></div>
            <input type="text"
                   class="function-input"
                   placeholder="Enter function (e.g., x^2, sin(x))"
                   data-id="${functionData.id}">
            <div class="function-visibility">
                <input type="checkbox" checked data-id="${functionData.id}">
            </div>
            <button class="function-remove" data-id="${functionData.id}">×</button>
        `;

        container.appendChild(div);

        // Add event listeners
        const input = div.querySelector('.function-input');
        const checkbox = div.querySelector('input[type="checkbox"]');
        const removeBtn = div.querySelector('.function-remove');

        input.addEventListener('input', (e) => this.updateFunction(functionData.id, e.target.value));
        checkbox.addEventListener('change', (e) => this.toggleFunction(functionData.id, e.target.checked));
        removeBtn.addEventListener('click', () => this.removeFunction(functionData.id));

        // Focus on new input
        input.focus();
    }

    updateFunction(id, expression) {
        const functionData = this.functions.find(f => f.id === id);
        if (!functionData) return;

        functionData.expression = expression;

        // Validate expression
        functionData.valid = this.validateExpression(expression);

        // Update input styling
        const input = document.querySelector(`input.function-input[data-id="${id}"]`);
        if (input) {
            input.classList.toggle('error', expression.trim() && !functionData.valid);
        }

        this.render();
    }

    validateExpression(expression) {
        if (!expression.trim()) return false;

        try {
            // Test with multiple x values to ensure validity
            const testValues = [0, 1, -1, 0.5, 2];
            for (let testX of testValues) {
                const result = this.evaluateExpression(expression, testX);
                if (typeof result !== 'number' || !isFinite(result)) {
                    // Allow some undefined results (like ln of negative numbers)
                    continue;
                }
            }
            return true;
        } catch (error) {
            console.log('Validation error:', error);
            return false;
        }
    }

    evaluateExpression(expression, xValue) {
        try {
            // Create a scope with x value
            const scope = { x: xValue };
            return math.evaluate(expression, scope);
        } catch (error) {
            throw error;
        }
    }

    toggleFunction(id, visible) {
        const functionData = this.functions.find(f => f.id === id);
        if (!functionData) return;

        functionData.visible = visible;
        this.render();
    }

    removeFunction(id) {
        this.functions = this.functions.filter(f => f.id !== id);
        const element = document.querySelector(`div[data-id="${id}"]`);
        if (element) {
            element.remove();
        }
        this.render();
    }

    loadExample(expression) {
        // Find first empty input or add new function
        let targetFunction = this.functions.find(f => !f.expression.trim());

        if (!targetFunction) {
            this.addFunction();
            targetFunction = this.functions[this.functions.length - 1];
        }

        // Set expression and update input
        const input = document.querySelector(`input.function-input[data-id="${targetFunction.id}"]`);
        if (input) {
            input.value = expression;
            this.updateFunction(targetFunction.id, expression);
        }
    }

    clearAll() {
        this.functions.forEach(f => {
            const element = document.querySelector(`div[data-id="${f.id}"]`);
            if (element) element.remove();
        });
        this.functions = [];
        this.addFunction(); // Add one empty function
    }

    // Canvas interaction methods
    handleMouseDown(e) {
        this.isDragging = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastMouseX = e.clientX - rect.left;
        this.lastMouseY = e.clientY - rect.top;
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Update coordinates display
        const worldCoords = this.screenToWorld(mouseX, mouseY);
        document.getElementById('coordinates').textContent =
            `x: ${worldCoords.x.toFixed(2)}, y: ${worldCoords.y.toFixed(2)}`;

        if (this.isDragging) {
            const dx = mouseX - this.lastMouseX;
            const dy = mouseY - this.lastMouseY;

            this.centerX -= dx / this.scale;
            this.centerY += dy / this.scale;

            this.lastMouseX = mouseX;
            this.lastMouseY = mouseY;

            this.render();
        }
    }

    handleMouseUp() {
        this.isDragging = false;
    }

    handleWheel(e) {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom(zoomFactor);
    }

    zoom(factor) {
        this.scale *= factor;
        this.scale = Math.max(5, Math.min(200, this.scale)); // Clamp zoom
        this.render();
    }

    resetView() {
        this.scale = 40;
        this.centerX = 0;
        this.centerY = 0;
        this.render();
    }

    // Coordinate transformation
    worldToScreen(x, y) {
        const screenX = (this.canvasWidth / 2) + (x - this.centerX) * this.scale;
        const screenY = (this.canvasHeight / 2) - (y - this.centerY) * this.scale;
        return { x: screenX, y: screenY };
    }

    screenToWorld(screenX, screenY) {
        const x = this.centerX + (screenX - this.canvasWidth / 2) / this.scale;
        const y = this.centerY - (screenY - this.canvasHeight / 2) / this.scale;
        return { x, y };
    }

    // Rendering methods
    render() {
        this.clearCanvas();

        if (this.showGrid) this.drawGrid();
        if (this.showAxes) this.drawAxes();
        if (this.showLabels) this.drawLabels();

        this.drawFunctions();
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Set background to white for better visibility
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    drawGrid() {
        const gridSpacing = this.getGridSpacing();

        this.ctx.strokeStyle = '#c0c0c0';
        this.ctx.lineWidth = 2.0;
        this.ctx.setLineDash([2, 2]);

        // Vertical lines
        const startX = Math.floor((this.centerX - this.canvasWidth / 2 / this.scale) / gridSpacing) * gridSpacing;
        for (let x = startX; x <= this.centerX + this.canvasWidth / 2 / this.scale; x += gridSpacing) {
            const screenPos = this.worldToScreen(x, 0);
            if (screenPos.x >= 0 && screenPos.x <= this.canvasWidth) {
                this.ctx.beginPath();
                this.ctx.moveTo(screenPos.x, 0);
                this.ctx.lineTo(screenPos.x, this.canvasHeight);
                this.ctx.stroke();
            }
        }

        // Horizontal lines
        const startY = Math.floor((this.centerY - this.canvasHeight / 2 / this.scale) / gridSpacing) * gridSpacing;
        for (let y = startY; y <= this.centerY + this.canvasHeight / 2 / this.scale; y += gridSpacing) {
            const screenPos = this.worldToScreen(0, y);
            if (screenPos.y >= 0 && screenPos.y <= this.canvasHeight) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, screenPos.y);
                this.ctx.lineTo(this.canvasWidth, screenPos.y);
                this.ctx.stroke();
            }
        }

        this.ctx.setLineDash([]);
    }

    drawAxes() {
        const origin = this.worldToScreen(0, 0);

        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1.5;

        // X-axis
        if (origin.y >= 0 && origin.y <= this.canvasHeight) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, origin.y);
            this.ctx.lineTo(this.canvasWidth, origin.y);
            this.ctx.stroke();
        }

        // Y-axis
        if (origin.x >= 0 && origin.x <= this.canvasWidth) {
            this.ctx.beginPath();
            this.ctx.moveTo(origin.x, 0);
            this.ctx.lineTo(origin.x, this.canvasHeight);
            this.ctx.stroke();
        }
    }

    drawLabels() {
        if (!this.showAxes) return;

        const origin = this.worldToScreen(0, 0);
        const gridSpacing = this.getGridSpacing();

        this.ctx.fillStyle = '#666666';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';

        // X-axis labels
        if (origin.y >= 0 && origin.y <= this.canvasHeight) {
            const startX = Math.floor((this.centerX - this.canvasWidth / 2 / this.scale) / gridSpacing) * gridSpacing;
            for (let x = startX; x <= this.centerX + this.canvasWidth / 2 / this.scale; x += gridSpacing) {
                if (Math.abs(x) < 0.001) continue; // Skip origin
                const screenPos = this.worldToScreen(x, 0);
                if (screenPos.x >= 20 && screenPos.x <= this.canvasWidth - 20) {
                    this.ctx.fillText(x.toFixed(gridSpacing < 1 ? 1 : 0),
                        screenPos.x, Math.min(origin.y + 5, this.canvasHeight - 15));
                }
            }
        }

        // Y-axis labels
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        if (origin.x >= 0 && origin.x <= this.canvasWidth) {
            const startY = Math.floor((this.centerY - this.canvasHeight / 2 / this.scale) / gridSpacing) * gridSpacing;
            for (let y = startY; y <= this.centerY + this.canvasHeight / 2 / this.scale; y += gridSpacing) {
                if (Math.abs(y) < 0.001) continue; // Skip origin
                const screenPos = this.worldToScreen(0, y);
                if (screenPos.y >= 20 && screenPos.y <= this.canvasHeight - 20) {
                    this.ctx.fillText(y.toFixed(gridSpacing < 1 ? 1 : 0),
                        Math.min(origin.x + 5, this.canvasWidth - 30), screenPos.y);
                }
            }
        }
    }

    drawFunctions() {
        this.functions.forEach(func => {
            if (!func.visible || !func.valid || !func.expression.trim()) return;

            this.ctx.strokeStyle = func.color;
            this.ctx.lineWidth = 2;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            const xMin = this.centerX - this.canvasWidth / 2 / this.scale;
            const xMax = this.centerX + this.canvasWidth / 2 / this.scale;
            const step = (xMax - xMin) / this.canvasWidth; // One evaluation per pixel

            this.ctx.beginPath();
            let firstPoint = true;
            let lastY = null;

            for (let x = xMin; x <= xMax; x += step) {
                try {
                    const y = this.evaluateExpression(func.expression, x);

                    if (typeof y === 'number' && isFinite(y)) {
                        const screenPos = this.worldToScreen(x, y);

                        // Check for discontinuities (large jumps in y value)
                        if (lastY !== null && Math.abs(y - lastY) > 100 / this.scale) {
                            firstPoint = true;
                        }

                        // Only draw points that are on or near the canvas
                        if (screenPos.y >= -100 && screenPos.y <= this.canvasHeight + 100) {
                            if (firstPoint) {
                                this.ctx.moveTo(screenPos.x, screenPos.y);
                                firstPoint = false;
                            } else {
                                this.ctx.lineTo(screenPos.x, screenPos.y);
                            }
                        } else {
                            firstPoint = true;
                        }

                        lastY = y;
                    } else {
                        firstPoint = true;
                        lastY = null;
                    }
                } catch (error) {
                    firstPoint = true;
                    lastY = null;
                }
            }

            this.ctx.stroke();
        });
    }

    getGridSpacing() {
        const pixelsPerUnit = this.scale;
        if (pixelsPerUnit > 100) return 0.5;
        if (pixelsPerUnit > 50) return 1;
        if (pixelsPerUnit > 20) return 2;
        if (pixelsPerUnit > 10) return 5;
        return 10;
    }

    exportImage() {
        const link = document.createElement('a');
        link.download = 'graph.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GraphingCalculator();
});
