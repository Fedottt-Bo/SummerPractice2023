import { surface_format } from "./helper";

export function createCopy(device, main_group_layout) {
  return {
    pipeline: device.createRenderPipeline({
      layout: device.createPipelineLayout({bindGroupLayouts: [main_group_layout]}),
      vertex: {
        module: device.createShaderModule({ code:
`@vertex
fn main(@builtin(vertex_index) VertexIndex: u32) -> @builtin(position) vec4<f32> {
  var pos = array<vec2<f32>, 4>(vec2<f32>(-1.0, -1.0), vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0));
  return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
}`      }),
        entryPoint: "main"
      },
      fragment: {
        module: device.createShaderModule({ code:
`@group(0) @binding(1) var color_tex : texture_2d<f32>;

@fragment
fn main(@builtin(position) coord : vec4<f32>) -> @location(0) vec4<f32> {
  var icoord = vec2<i32>(floor(coord.xy));
  var color : vec3<f32> = textureLoad(color_tex, icoord, 0).rgb;
  
  return vec4<f32>(color, 1.0);
}`      }),
        entryPoint: "main",
        targets: [{
          format: surface_format,
          blend: {
            color: {dstFactor: "zero", operation: "add", srcFactor: "one"},
            alpha: {dstFactor: "zero", operation: "add", srcFactor: "one"}
          }
        }]
      },
      primitive: {
        topology: "triangle-strip",
        cullMode: 'none'
      },
    }),
    run: function(bind_group, renderPass) {
      renderPass.setPipeline(this.pipeline);
      renderPass.setBindGroup(0, bind_group);

      renderPass.draw(4, 1, 0, 0);
    }
  }
}

export function createToneMapping(device, main_group_layout) {  
  return {    
    pipeline: device.createRenderPipeline({
      layout: device.createPipelineLayout({bindGroupLayouts: [main_group_layout]}),
      vertex: {
        module: device.createShaderModule({ code:
`@vertex
fn main(@builtin(vertex_index) VertexIndex: u32) -> @builtin(position) vec4<f32> {
  var pos = array<vec2<f32>, 4>(vec2<f32>(-1.0, -1.0), vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0));
  return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
}`      }),
        entryPoint: "main"
      },
      fragment: {
        module: device.createShaderModule({ code:
`@group(0) @binding(1) var color_tex : texture_2d<f32>;

const aces_input_matrix = mat3x3<f32>(
  0.59719, 0.35458, 0.04823,
  0.07600, 0.90834, 0.01566,
  0.02840, 0.13383, 0.83777
);

const aces_output_matrix = mat3x3<f32>(
   1.60475, -0.53108, -0.07367,
  -0.10208,  1.10813, -0.00605,
  -0.00327, -0.07276,  1.07602
);

fn rtt_and_odt_fit(v : vec3<f32>) -> vec3<f32> {
    var a = v * (v + 0.0245786) - 0.000090537;
    var b = v * (0.983729 * v + 0.4329510) + 0.238081;
    return a / b;
}

fn aces_fitted(v : vec3<f32>) -> vec3<f32> {
  var tmp = v * aces_input_matrix;
  tmp = rtt_and_odt_fit(tmp);
  return tmp * aces_output_matrix;
}

@fragment
fn main(@builtin(position) coord : vec4<f32>) -> @location(0) vec4<f32> {
  var icoord = vec2<i32>(floor(coord.xy));
  var color : vec3<f32> = textureLoad(color_tex, icoord, 0).rgb;
  
  return vec4<f32>(aces_fitted(color), 1.0);
}`      }),
        entryPoint: "main",
        targets: [{
          format: surface_format,
          blend: {
            color: {dstFactor: "zero", operation: "add", srcFactor: "one"},
            alpha: {dstFactor: "zero", operation: "add", srcFactor: "one"}
          }
        }]
      },
      primitive: {
        topology: "triangle-strip",
        cullMode: 'none'
      },
    }),
    run: function(bind_group, renderPass) {
      renderPass.setPipeline(this.pipeline);
      renderPass.setBindGroup(0, bind_group);

      renderPass.draw(4, 1, 0, 0);
    }
  }
}
