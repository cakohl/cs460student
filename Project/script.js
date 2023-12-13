// Get the canvas element and WebGL rendering context
const canvas = document.getElementById('gameCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
  console.error('Unable to initialize WebGL. Your browser may not support it.');
}

// Set the canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Vertex shader program
const vsSource = `
  attribute vec4 aVertexPosition;
  uniform mat4 uModelViewMatrix;
  void main(void) {
    gl_Position = uModelViewMatrix * aVertexPosition;
  }
`;

// Fragment shader program
const fsSource = `
  precision mediump float;
  uniform vec4 uColor;
  void main(void) {
    gl_FragColor = uColor;
  }
`;

// Initialize shaders
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

// Load shaders
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

// Initialize shader program and buffer
const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
const programInfo = {
  program: shaderProgram,
  attribLocations: {
    vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
  },
  uniformLocations: {
    modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    color: gl.getUniformLocation(shaderProgram, 'uColor'),
  },
};

// Set up buffers
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const positions = [
  -1.0,  1.0,
   1.0,  1.0,
  -1.0, -1.0,
   1.0, -1.0,
];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// Main render function
function drawScene() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black
  gl.clear(gl.COLOR_BUFFER_BIT);

  const projectionMatrix = mat4.create();
  mat4.ortho(projectionMatrix, 0, canvas.width, canvas.height, 0, -1, 1);

  const modelViewMatrix = mat4.create();
  mat4.translate(modelViewMatrix, modelViewMatrix, [100, 100, 0]);

  gl.useProgram(programInfo.program);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
  gl.uniform4fv(programInfo.uniformLocations.color, [1.0, 1.0, 1.0, 1.0]);  // White color

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, positions.length / 2);
}

// Initialize matrices
const mat4 = glMatrix.mat4;

// Main game loop
function gameLoop() {
  drawScene();
  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();