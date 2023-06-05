import { surface_format as format } from './web_gpu_helper.js';

export const default_pipeline = (device) => { return {
    layout: 'auto',
    vertex: {
      module: device.createShaderModule({ code:
`struct Uniforms {
  mvpMatrix : mat4x4<f32>,
};
@binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct Output {
  @builtin(position) Position : vec4<f32>,
  @location(0) vColor : vec4<f32>,
};

@vertex
fn main(@location(0) pos: vec3<f32>, @location(1) color: vec4<f32>) -> Output {
  var output: Output;
  output.Position = uniforms.mvpMatrix * vec4<f32>(pos, 1.0);
  output.vColor = color;
  return output;
}`      }),
      buffers:
      [
        {
          arrayStride: 4 * (3 + 3),
          attributes:
          [
            {
              shaderLocation: 0,
              format: 'float32x3',
              offset: 0
            },
            {
              shaderLocation: 1,
              format: 'float32x3',
              offset: 12
            }
          ]
        }
      ],
      entryPoint: "main"
    },
    fragment: {
      module: device.createShaderModule({ code:
`@fragment
fn main(@location(0) vColor: vec4<f32>) -> @location(0) vec4<f32> {
  return vColor;
}`      }),
      entryPoint: "main",
      targets: [{ format: format }]
    },
    primitive: {
      topology: "triangle-list",
      cullMode: 'none'
    },
  };
}
