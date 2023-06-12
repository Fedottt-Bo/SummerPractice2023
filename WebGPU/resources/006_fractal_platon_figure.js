var bundle;(()=>{"use strict";var e={d:(t,n)=>{for(var r in n)e.o(n,r)&&!e.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:n[r]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};e.r(t),e.d(t,{selectModel:()=>b,start:()=>_});var n,r=1e-6,a="undefined"!=typeof Float32Array?Float32Array:Array;function o(e,t,n){return e[0]=t[0]+n[0],e[1]=t[1]+n[1],e[2]=t[2]+n[2],e}function i(e,t,n){return e[0]=t[0]*n[0],e[1]=t[1]*n[1],e[2]=t[2]*n[2],e}function u(e,t){var n=t[0],r=t[1],a=t[2],o=n*n+r*r+a*a;return o>0&&(o=1/Math.sqrt(o)),e[0]=t[0]*o,e[1]=t[1]*o,e[2]=t[2]*o,e}function s(){var e=new a(16);return a!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0),e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function c(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}Math.random,Math.PI,Math.hypot||(Math.hypot=function(){for(var e=0,t=arguments.length;t--;)e+=arguments[t]*arguments[t];return Math.sqrt(e)}),n=new a(3),a!=Float32Array&&(n[0]=0,n[1]=0,n[2]=0);const d=(e,t,n)=>Math.min(Math.max(e,t),n),l={tetrahedron:{vert:new Float32Array([.6666666666666666,-.3333333333333333,.6666666666666666,-.07735026918962584,1,1,1,0,.24401693585629247,-.3333333333333333,-.9106836025229591,1.0773502691896257,1,0,1,0,0,1,0,.5,0,0,1,1,-.910683602522959,-.3333333333333333,.24401693585629244,-.07735026918962584,1,1,0,1,.6666666666666666,-.3333333333333333,.6666666666666666,1.0773502691896257,1,1,1,0,0,1,0,.5,0,0,1,1,.24401693585629247,-.3333333333333333,-.9106836025229591,-.07735026918962584,1,0,1,0,-.910683602522959,-.3333333333333333,.24401693585629244,1.0773502691896257,1,1,0,1,0,1,0,.5,0,0,1,1,-.910683602522959,-.3333333333333333,.24401693585629244,-.07735026918962584,1,1,0,1,.24401693585629247,-.3333333333333333,-.9106836025229591,1.0773502691896257,1,0,1,0,.6666666666666666,-.3333333333333333,.6666666666666666,.5,0,1,1,0])},cube:{vert:new Float32Array([-.57735026919,.57735026919,.57735026919,0,0,1,0,1,-.57735026919,-.57735026919,.57735026919,0,1,.5,.5,.5,.57735026919,.57735026919,.57735026919,1,0,1,0,0,.57735026919,-.57735026919,.57735026919,1,1,1,1,0,.57735026919,.57735026919,.57735026919,0,0,1,0,0,.57735026919,-.57735026919,.57735026919,0,1,1,1,0,.57735026919,.57735026919,-.57735026919,1,0,.5,.5,.5,.57735026919,-.57735026919,-.57735026919,1,1,0,1,1,.57735026919,.57735026919,-.57735026919,0,0,.5,.5,.5,.57735026919,-.57735026919,-.57735026919,0,1,0,1,1,-.57735026919,.57735026919,-.57735026919,1,0,0,0,1,-.57735026919,-.57735026919,-.57735026919,1,1,0,1,0,-.57735026919,.57735026919,-.57735026919,0,0,0,0,1,-.57735026919,-.57735026919,-.57735026919,0,1,0,1,0,-.57735026919,.57735026919,.57735026919,1,0,1,0,1,-.57735026919,-.57735026919,.57735026919,1,1,.5,.5,.5,-.57735026919,.57735026919,-.57735026919,0,0,0,0,1,-.57735026919,.57735026919,.57735026919,0,1,1,0,1,.57735026919,.57735026919,-.57735026919,1,0,.5,.5,.5,.57735026919,.57735026919,.57735026919,1,1,1,0,0,-.57735026919,-.57735026919,.57735026919,0,0,.5,.5,.5,-.57735026919,-.57735026919,-.57735026919,0,1,0,1,0,.57735026919,-.57735026919,.57735026919,1,0,1,1,0,.57735026919,-.57735026919,-.57735026919,1,1,0,1,1]),ind:new Uint16Array([0,1,2,2,1,3,4,5,6,6,5,7,8,9,10,10,9,11,12,13,14,14,13,15,16,17,18,18,17,19,20,21,22,22,21,23,24,25,26,26,25,27,28,29,30,30,29,31])},octahedron:{vert:new Float32Array([1,0,0,1.0773502691896257,1,1,0,0,0,1,0,.5,0,1,0,1,0,0,1,-.07735026918962584,1,1,1,0,0,0,1,1.0773502691896257,1,1,1,0,0,1,0,.5,0,1,0,1,-1,0,0,-.07735026918962584,1,1,0,1,-1,0,0,1.0773502691896257,1,1,0,1,0,1,0,.5,0,1,0,1,0,0,-1,-.07735026918962584,1,0,1,1,0,0,-1,1.0773502691896257,1,0,1,1,0,1,0,.5,0,1,0,1,1,0,0,-.07735026918962584,1,1,0,0,0,0,1,-.07735026918962584,0,1,1,0,0,-1,0,.5,1,0,0,1,1,0,0,1.0773502691896257,0,1,0,0,-1,0,0,-.07735026918962584,0,1,0,1,0,-1,0,.5,1,0,0,1,0,0,1,1.0773502691896257,0,1,1,0,0,0,-1,-.07735026918962584,0,0,1,1,0,-1,0,.5,1,0,0,1,-1,0,0,1.0773502691896257,0,1,0,1,1,0,0,-.07735026918962584,0,1,0,0,0,-1,0,.5,1,0,0,1,0,0,-1,1.0773502691896257,0,0,1,1])},dodecahedron:{vert:new Float32Array([0,.9341723589627158,-.35682208977309,.8249196962329063,0,.5,.5,0,0,.9341723589627158,.35682208977309,.17508030376709371,0,.75,.25,0,.5773502691896258,.5773502691896258,.5773502691896258,-.025731112119133592,.6180339887498948,1,0,0,.9341723589627158,.35682208977309,0,.5,1,1,0,.25,.5773502691896258,.5773502691896258,-.5773502691896258,1.0257311121191335,.6180339887498948,.75,.5,.25,0,.9341723589627158,.35682208977309,.8249196962329063,0,.75,.25,0,0,.9341723589627158,-.35682208977309,.17508030376709371,0,.5,.5,0,-.5773502691896258,.5773502691896258,-.5773502691896258,-.025731112119133592,.6180339887498948,.25,.75,.25,-.9341723589627158,.35682208977309,0,.5,1,0,1,0,-.5773502691896258,.5773502691896258,.5773502691896258,1.0257311121191335,.6180339887498948,1,.5,0,0,-.9341723589627158,.35682208977309,.17508030376709371,1,.5,.5,.5,0,-.9341723589627158,-.35682208977309,.8249196962329063,1,0,.75,.75,.5773502691896258,-.5773502691896258,-.5773502691896258,1.0257311121191335,.3819660112501052,0,0,1,.9341723589627158,-.35682208977309,0,.5,0,.5,0,1,.5773502691896258,-.5773502691896258,.5773502691896258,-.025731112119133592,.3819660112501052,1,0,1,0,-.9341723589627158,-.35682208977309,.17508030376709371,1,0,.75,.75,0,-.9341723589627158,.35682208977309,.8249196962329063,1,.5,.5,.5,-.5773502691896258,-.5773502691896258,.5773502691896258,1.0257311121191335,.3819660112501052,.25,.75,0,-.9341723589627158,-.35682208977309,0,.5,0,.25,1,0,-.5773502691896258,-.5773502691896258,-.5773502691896258,-.025731112119133592,.3819660112501052,0,.75,.5,-.35682208977309,0,.9341723589627158,.17508030376709371,1,.5,.75,0,.35682208977309,0,.9341723589627158,.8249196962329063,1,1,0,.25,.5773502691896258,.5773502691896258,.5773502691896258,1.0257311121191335,.3819660112501052,1,0,0,0,.9341723589627158,.35682208977309,.5,0,.75,.25,0,-.5773502691896258,.5773502691896258,.5773502691896258,-.025731112119133592,.3819660112501052,1,.5,0,.35682208977309,0,-.9341723589627158,.17508030376709371,1,0,.25,.75,-.35682208977309,0,-.9341723589627158,.8249196962329063,1,0,.5,.5,-.5773502691896258,.5773502691896258,-.5773502691896258,1.0257311121191335,.3819660112501052,.25,.75,.25,0,.9341723589627158,-.35682208977309,.5,0,.5,.5,0,.5773502691896258,.5773502691896258,-.5773502691896258,-.025731112119133592,.3819660112501052,.75,.5,.25,.35682208977309,0,.9341723589627158,.8249196962329063,0,1,0,.25,-.35682208977309,0,.9341723589627158,.17508030376709371,0,.5,.75,0,-.5773502691896258,-.5773502691896258,.5773502691896258,-.025731112119133592,.6180339887498948,.25,.75,0,0,-.9341723589627158,.35682208977309,.5,1,.5,.5,.5,.5773502691896258,-.5773502691896258,.5773502691896258,1.0257311121191335,.6180339887498948,1,0,1,-.35682208977309,0,-.9341723589627158,.8249196962329063,0,0,.5,.5,.35682208977309,0,-.9341723589627158,.17508030376709371,0,0,.25,.75,.5773502691896258,-.5773502691896258,-.5773502691896258,-.025731112119133592,.6180339887498948,0,0,1,0,-.9341723589627158,-.35682208977309,.5,1,0,.75,.75,-.5773502691896258,-.5773502691896258,-.5773502691896258,1.0257311121191335,.6180339887498948,0,.75,.5,.9341723589627158,-.35682208977309,0,1,.8249196962329063,.5,0,1,.9341723589627158,.35682208977309,0,1,.17508030376709371,1,0,.25,.5773502691896258,.5773502691896258,.5773502691896258,.3819660112501052,-.025731112119133592,1,0,0,.35682208977309,0,.9341723589627158,0,.5,1,0,.25,.5773502691896258,-.5773502691896258,.5773502691896258,.3819660112501052,1.0257311121191335,1,0,1,.9341723589627158,.35682208977309,0,0,.17508030376709371,1,0,.25,.9341723589627158,-.35682208977309,0,0,.8249196962329063,.5,0,1,.5773502691896258,-.5773502691896258,-.5773502691896258,.6180339887498948,1.0257311121191335,0,0,1,.35682208977309,0,-.9341723589627158,1,.5,0,.25,.75,.5773502691896258,.5773502691896258,-.5773502691896258,.6180339887498948,-.025731112119133592,.75,.5,.25,-.9341723589627158,.35682208977309,0,0,.17508030376709371,0,1,0,-.9341723589627158,-.35682208977309,0,0,.8249196962329063,.25,1,0,-.5773502691896258,-.5773502691896258,.5773502691896258,.6180339887498948,1.0257311121191335,.25,.75,0,-.35682208977309,0,.9341723589627158,1,.5,.5,.75,0,-.5773502691896258,.5773502691896258,.5773502691896258,.6180339887498948,-.025731112119133592,1,.5,0,-.9341723589627158,-.35682208977309,0,1,.8249196962329063,.25,1,0,-.9341723589627158,.35682208977309,0,1,.17508030376709371,0,1,0,-.5773502691896258,.5773502691896258,-.5773502691896258,.3819660112501052,-.025731112119133592,.25,.75,.25,-.35682208977309,0,-.9341723589627158,0,.5,0,.5,.5,-.5773502691896258,-.5773502691896258,-.5773502691896258,.3819660112501052,1.0257311121191335,0,.75,.5]),ind:new Uint16Array([0,1,2,4,0,2,3,4,2,5,6,7,9,5,7,8,9,7,10,11,12,14,10,12,13,14,12,15,16,17,19,15,17,18,19,17,20,21,22,24,20,22,23,24,22,25,26,27,29,25,27,28,29,27,30,31,32,34,30,32,33,34,32,35,36,37,39,35,37,38,39,37,40,41,42,44,40,42,43,44,42,45,46,47,49,45,47,48,49,47,50,51,52,54,50,52,53,54,52,55,56,57,59,55,57,58,59,57])},icosahedron:{vert:new Float32Array([0,1.68,-1,1.07,0,1,0,0,0,1.68,1,-.07,0,0,1,0,1.68,1,0,.5,1,1,1,0,0,1.68,1,1.07,0,1,0,0,0,1.68,-1,-.07,0,0,1,0,-1.68,1,0,.5,1,1,1,1,1.68,1,0,.5,1,1,1,0,0,1.68,1,-.07,0,1,0,0,1,0,1.68,.5,1,1,1,0,0,1.68,1,-.07,0,1,0,0,-1.68,1,0,.5,1,1,1,0,-1,0,1.68,.5,1,1,1,0,1,0,1.68,.5,1,1,1,0,0,1.68,1,-.07,0,1,0,0,-1,0,1.68,.5,1,1,1,0,0,1.68,-1,-.07,0,1,0,0,1.68,1,0,.5,1,1,1,0,1,0,-1.68,.5,1,1,1,0,-1.68,1,0,.5,1,1,1,0,0,1.68,-1,-.07,0,1,0,0,-1,0,-1.68,.5,1,1,1,0,0,1.68,-1,-.07,0,1,0,0,1,0,-1.68,.5,1,1,1,0,-1,0,-1.68,.5,1,1,1,0,0,-1.68,1,-.07,1,1,0,0,0,-1.68,-1,1.07,1,0,1,0,1.68,-1,0,.5,0,1,1,1,0,-1.68,-1,-.07,1,0,1,0,0,-1.68,1,1.07,1,1,0,0,-1.68,-1,0,.5,0,1,1,1,0,-1.68,1,-.07,0,1,0,0,1.68,-1,0,.5,1,1,1,0,1,0,1.68,.5,1,1,1,0,-1.68,-1,0,.5,1,1,1,0,0,-1.68,1,-.07,0,1,0,0,-1,0,1.68,.5,1,1,1,0,0,-1.68,1,-.07,0,1,0,0,1,0,1.68,.5,1,1,1,0,-1,0,1.68,.5,1,1,1,0,1.68,-1,0,.5,1,1,1,0,0,-1.68,-1,-.07,0,1,0,0,1,0,-1.68,.5,1,1,1,0,0,-1.68,-1,-.07,0,1,0,0,-1.68,-1,0,.5,1,1,1,0,-1,0,-1.68,.5,1,1,1,0,1,0,-1.68,.5,1,1,1,0,0,-1.68,-1,-.07,0,1,0,0,-1,0,-1.68,.5,1,1,1,0,1.68,1,0,.5,1,1,1,0,1.68,-1,0,.5,1,1,1,0,1,0,-1.68,.5,1,1,1,0,1.68,-1,0,.5,1,1,1,0,1.68,1,0,.5,1,1,1,0,1,0,1.68,.5,1,1,1,0,-1.68,-1,0,.5,1,1,1,0,-1.68,1,0,.5,1,1,1,0,-1,0,-1.68,.5,1,1,1,0,-1.68,1,0,.5,1,1,1,0,-1.68,-1,0,.5,1,1,1,0,-1,0,1.68,.5,1,1,1,0])}};let p,f=[],g=0;function h(e,t){if(t.vert===undefined||t.vert.length%8!=0)throw"Invalid vertex buffer";let n=t.vert.length/8,r=e.createBuffer({size:32*n,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,mappedAtCreation:!0});if(new Float32Array(r.getMappedRange()).set(t.vert),r.unmap(),t.ind===undefined)return{vert_buffer:r,count:n,draw:function(e,t){e.setPipeline(p.pipeline),e.setBindGroup(0,p.bind_groups[t]),e.setVertexBuffer(0,this.vert_buffer),e.draw(this.count,1,0,0)}};{if(t.ind.length%3!=0)throw"Invalid index buffer";n=t.ind.length;let a=2*(n+n%2),o=e.createBuffer({size:a,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST,mappedAtCreation:!0});return new Uint16Array(o.getMappedRange(0,a)).set(t.ind),o.unmap(),{vert_buffer:r,ind_buffer:o,count:n,draw:function(e,t){e.setPipeline(p.pipeline),e.setBindGroup(0,p.bind_groups[t]),e.setVertexBuffer(0,this.vert_buffer),e.setIndexBuffer(this.ind_buffer,"uint16"),e.drawIndexed(this.count,1,0,0)}}}}function v(e,t){let n=f.length;f.push(e);let r=document.createElement("option");r.value=n,r.innerHTML=t.length<30?t:t.slice(0,28)+"...",document.getElementById("models_list").appendChild(r)}function b(e){g=e}let m,y={};async function _(){m=await async function(){if(!navigator.gpu){let e="Your current browser does not support WebGPU!";throw window.self!==window.top&&(e+="\nThis page seems to be opened as embedded, which can block WebGPU access. Try to open it in separate tab."),console.log(e),alert(e),e}const e=document.getElementById("canvas-webgpu"),t=await navigator.gpu.requestAdapter(),n=await t.requestDevice(),r=e.getContext("webgpu");return r.configure({device:n,format:"bgra8unorm",alphaMode:"opaque"}),{gpu:navigator.gpu,canvas:e,adapter:t,device:n,context:r}}(),function(e){let t=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{viewDimension:"2d"}},{binding:2,visibility:GPUShaderStage.FRAGMENT,sampler:{type:"filtering"}}]}),n=e.createRenderPipeline({layout:e.createPipelineLayout({bindGroupLayouts:[t]}),vertex:{module:e.createShaderModule({code:"struct Uniforms {\n  ModelMatr : mat4x4<f32>,\n  VPMatr : mat4x4<f32>,\n};\n@group(0) @binding(0) var<uniform> uniforms : Uniforms;\n\nstruct in {\n  @location(0) pos : vec3<f32>,\n  @location(1) tex0 : vec2<f32>,\n  @location(2) color : vec3<f32>\n}\n\nstruct out {\n  @builtin(position) pos : vec4<f32>,\n  @location(0) tex0 : vec2<f32>,\n  @location(1) color : vec3<f32>  \n}\n\n@vertex\nfn main(input : in) -> out {\n  var output : out;\n\n  output.pos = uniforms.VPMatr * (uniforms.ModelMatr * vec4<f32>(input.pos, 1.0));\n  output.tex0 = input.tex0;\n  output.color = input.color;\n\n  return output;\n}"}),entryPoint:"main",buffers:[{arrayStride:32,attributes:[{shaderLocation:0,format:"float32x3",offset:0},{shaderLocation:1,format:"float32x2",offset:12},{shaderLocation:2,format:"float32x3",offset:20}]}]},fragment:{module:e.createShaderModule({code:"@group(0) @binding(1) var color_tex : texture_2d<f32>;\n@group(0) @binding(2) var color_sampler : sampler;\n\nstruct in {\n  @builtin(position) pos : vec4<f32>,\n  @location(0) tex0 : vec2<f32>,\n  @location(1) color : vec3<f32>\n}\n\n@fragment\nfn main(input : in) -> @location(0) vec4<f32> {\n  var color = textureSample(color_tex, color_sampler, input.tex0).rgba;\n\n  return vec4<f32>(mix(input.color, color.rgb, color.a), 1.0);\n}"}),entryPoint:"main",targets:[{format:"rgba8unorm"}]},primitive:{topology:"triangle-list",cullMode:"back"},depthStencil:{format:"depth24plus",depthWriteEnabled:!0,depthCompare:"less"}}),r=e.createBuffer({size:128,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,mappedAtCreation:!1}),a={layout:t,entries:[{binding:0,resource:{buffer:r,offset:0,size:128}},{binding:1,resource:null},{binding:2,resource:e.createSampler({addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge",magFilter:"linear",minFilter:"linear",mipmapFilter:"linear"})}]};p={bind_group_layout:t,pipeline:n,uniform_buffer_size:128,uniform_buffer:r,bind_group_desc:a,bind_groups:[null,null],createBindGroup:function(t,n){let r={...this.bind_group_desc};r.entries[1].resource=t,this.bind_groups[n]=e.createBindGroup(r)}},v(h(e,l.tetrahedron),"Tetrahedron"),v(h(e,l.cube),"Cube"),v(h(e,l.octahedron),"Octahedron"),v(h(e,l.dodecahedron),"Dodecahedron"),v(h(e,l.icosahedron),"Icosahedron")}(m.device),function(e,t){t.addEventListener("mousemove",(e=>{let t={x:e.clientX-m.canvas.offsetLeft,y:e.clientY-m.canvas.offsetTop};switch(w){case 0:T.XAngle=(T.XAngle+-.01*(t.x-x.pos.x))%(2*Math.PI),T.YAngle=d(T.YAngle+.01*(t.y-x.pos.y),.5*-Math.PI,.5*Math.PI);break;case 2:let e=[-Math.cos(T.XAngle),0,Math.sin(T.XAngle)];u(e,e),i(e,e,Array(3).fill(1*(t.x-x.pos.x)*T.dist/m.canvas.width)),o(T.origin,T.origin,e),e=[-Math.sin(T.XAngle)*Math.sin(T.YAngle),Math.cos(T.YAngle),-Math.cos(T.XAngle)*Math.sin(T.YAngle)],u(e,e),i(e,e,Array(3).fill(1*(t.y-x.pos.y)*T.dist/m.canvas.height)),o(T.origin,T.origin,e)}x.pos=t,x.page_pos={x:t.x/m.canvas.width,y:t.y/m.canvas.height}})),e.oncontextmenu=e=>{e.preventDefault(),e.stopPropagation()},e.addEventListener("mousedown",(e=>{w=-1==w?e.button:-1})),t.addEventListener("mouseup",(e=>{w=-1})),e.addEventListener("wheel",(e=>{e.preventDefault(),T.dist*=1+.001*e.deltaY}),{capture:!0,passive:!1})}(m.canvas,window),function(){let e=m.device;y.depth_tex=e.createTexture({size:[m.canvas.width,m.canvas.height,1],format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),y.gbuffers=[e.createTexture({size:[m.canvas.width,m.canvas.height,1],format:"rgba8unorm",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING}),e.createTexture({size:[m.canvas.width,m.canvas.height,1],format:"rgba8unorm",usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING})],y.ind=0,p.createBindGroup(y.gbuffers[1].createView(),0),p.createBindGroup(y.gbuffers[0].createView(),1),y.main_render_pass_descs=[{colorAttachments:[{view:y.gbuffers[0].createView(),clearValue:{r:.3,g:.47,b:.8,a:0},loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:y.depth_tex.createView(),depthLoadValue:1,depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}},{colorAttachments:[{view:y.gbuffers[1].createView(),clearValue:{r:.3,g:.47,b:.8,a:0},loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:y.depth_tex.createView(),depthLoadValue:1,depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}}],y.gbuffer_bind_group_layout=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,texture:{viewDimension:"2d"}}]}),y.gbuffer_bind_groups=[e.createBindGroup({layout:y.gbuffer_bind_group_layout,entries:[{binding:0,resource:y.gbuffers[0].createView()}]}),e.createBindGroup({layout:y.gbuffer_bind_group_layout,entries:[{binding:0,resource:y.gbuffers[1].createView()}]})],y.copy_pipeline=e.createRenderPipeline({layout:e.createPipelineLayout({bindGroupLayouts:[y.gbuffer_bind_group_layout]}),vertex:{module:e.createShaderModule({code:"@vertex\nfn main(@builtin(vertex_index) VertexIndex: u32) -> @builtin(position) vec4<f32> {\nvar pos = array<vec2<f32>, 4>(vec2<f32>(-1.0, -1.0), vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0));\nreturn vec4<f32>(pos[VertexIndex], 0.0, 1.0);\n}"}),entryPoint:"main"},fragment:{module:e.createShaderModule({code:"@group(0) @binding(0) var color_tex : texture_2d<f32>;\n\n@fragment\nfn main(@builtin(position) coord : vec4<f32>) -> @location(0) vec4<f32> {\nvar icoord = vec2<i32>(floor(coord.xy));\nvar color : vec3<f32> = textureLoad(color_tex, icoord, 0).rgb;\n\nreturn vec4<f32>(color, 1.0);\n}"}),entryPoint:"main",targets:[{format:"bgra8unorm",blend:{color:{dstFactor:"zero",operation:"add",srcFactor:"one"},alpha:{dstFactor:"zero",operation:"add",srcFactor:"one"}}}]},primitive:{topology:"triangle-strip",cullMode:"none"}}),y.copy_render_pass_desc={colorAttachments:[{clearValue:{r:0,g:0,b:0,a:0},loadOp:"clear",storeOp:"store"}]}}(),U()}var w=-1,x={pos:{},page_pos:{}},M=Date.now()/1e3,A=M,P=1,T={XAngle:0,YAngle:.3,origin:[0,0,0],dist:8,view:s(),proj:s(),vp:s()};function U(){window.requestAnimationFrame(U),function(){let e=Date.now()/1e3;M+=(e-A)*P,A=e;let t=[Math.sin(T.XAngle)*Math.cos(T.YAngle),Math.sin(T.YAngle),Math.cos(T.XAngle)*Math.cos(T.YAngle)].map(((e,t)=>T.origin[t]+e*T.dist));!function(e,t,n,a){var o,i,u,s,d,l,p,f,g,h,v=t[0],b=t[1],m=t[2],y=a[0],_=a[1],w=a[2],x=n[0],M=n[1],A=n[2];Math.abs(v-x)<r&&Math.abs(b-M)<r&&Math.abs(m-A)<r?c(e):(p=v-x,f=b-M,g=m-A,o=_*(g*=h=1/Math.hypot(p,f,g))-w*(f*=h),i=w*(p*=h)-y*g,u=y*f-_*p,(h=Math.hypot(o,i,u))?(o*=h=1/h,i*=h,u*=h):(o=0,i=0,u=0),s=f*u-g*i,d=g*o-p*u,l=p*i-f*o,(h=Math.hypot(s,d,l))?(s*=h=1/h,d*=h,l*=h):(s=0,d=0,l=0),e[0]=o,e[1]=s,e[2]=p,e[3]=0,e[4]=i,e[5]=d,e[6]=f,e[7]=0,e[8]=u,e[9]=l,e[10]=g,e[11]=0,e[12]=-(o*v+i*b+u*m),e[13]=-(s*v+d*b+l*m),e[14]=-(p*v+f*b+g*m),e[15]=1)}(T.view,t,T.origin,[0,1,0]);let n=.01*Math.max(1,m.canvas.width/m.canvas.height),a=.01*Math.max(1,m.canvas.height/m.canvas.width);!function(e,t,n,r,a,o,i){var u=1/(n-t),s=1/(a-r),c=1/-99.99;e[0]=.02*u,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=.02*s,e[6]=0,e[7]=0,e[8]=(n+t)*u,e[9]=(a+r)*s,e[10]=100.01*c,e[11]=-1,e[12]=0,e[13]=0,e[14]=2*c,e[15]=0}(T.proj,-n,n,-a,a),function(e,t,n){var r=t[0],a=t[1],o=t[2],i=t[3],u=t[4],s=t[5],c=t[6],d=t[7],l=t[8],p=t[9],f=t[10],g=t[11],h=t[12],v=t[13],b=t[14],m=t[15],y=n[0],_=n[1],w=n[2],x=n[3];e[0]=y*r+_*u+w*l+x*h,e[1]=y*a+_*s+w*p+x*v,e[2]=y*o+_*c+w*f+x*b,e[3]=y*i+_*d+w*g+x*m,y=n[4],_=n[5],w=n[6],x=n[7],e[4]=y*r+_*u+w*l+x*h,e[5]=y*a+_*s+w*p+x*v,e[6]=y*o+_*c+w*f+x*b,e[7]=y*i+_*d+w*g+x*m,y=n[8],_=n[9],w=n[10],x=n[11],e[8]=y*r+_*u+w*l+x*h,e[9]=y*a+_*s+w*p+x*v,e[10]=y*o+_*c+w*f+x*b,e[11]=y*i+_*d+w*g+x*m,y=n[12],_=n[13],w=n[14],x=n[15],e[12]=y*r+_*u+w*l+x*h,e[13]=y*a+_*s+w*p+x*v,e[14]=y*o+_*c+w*f+x*b,e[15]=y*i+_*d+w*g+x*m}(T.vp,T.proj,T.view);let o=new Float32Array(32);o.set(c(s()),0),o.set(T.vp,16),m.device.queue.writeBuffer(p.uniform_buffer,0,o)}(),function(){let e=m.device.createCommandEncoder();{let t=e.beginRenderPass(y.main_render_pass_descs[y.ind]);t.setScissorRect(1,1,m.canvas.width-2,m.canvas.height-2),f[g].draw(t,y.ind),t.end()}{y.copy_render_pass_desc.colorAttachments[0].view=m.context.getCurrentTexture().createView();let t=e.beginRenderPass(y.copy_render_pass_desc);t.setPipeline(y.copy_pipeline),t.setBindGroup(0,y.gbuffer_bind_groups[y.ind]),t.draw(4,1,0,0),t.end()}y.ind=(y.ind+1)%2,m.device.queue.submit([e.finish()])}()}bundle=t})();