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


