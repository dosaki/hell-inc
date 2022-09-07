


W={mdl:{},reset:e=>{W.canvas=e,W.objs=0,W.current={},W.next={},W.textures={},W.gl=e.getContext("webgl2"),W.gl.blendFunc(770,771),W.gl.activeTexture(33984),W.program=W.gl.createProgram(),W.gl.enable(2884),W.gl.shaderSource(t=W.gl.createShader(35633),"#version 300 es\nprecision highp float;in vec4 pos,col,uv,normal;uniform mat4 pv,eye,m,im;uniform vec4 bb;out vec4 v_pos,v_col,v_uv,v_normal;void main(){gl_Position=pv*(v_pos=bb.z>0.?m[3]+eye*(pos*bb):m*pos);v_col=col;v_uv=uv;v_normal=transpose(inverse(m))*normal;}"),W.gl.compileShader(t),W.gl.attachShader(W.program,t),W.gl.shaderSource(t=W.gl.createShader(35632),"#version 300 es\nprecision highp float;in vec4 v_pos,v_col,v_uv,v_normal;uniform vec3 light;uniform vec4 o;uniform sampler2D sampler;out vec4 c;void main(){c=mix(texture(sampler,v_uv.xy),v_col,o[3]);if(o[1]>0.){c=vec4(c.rgb*(dot(light,-normalize(o[0]>0.?vec3(v_normal.xyz):cross(dFdx(v_pos.xyz),dFdy(v_pos.xyz))))+o[2]),c.a);}\nif(c.a<0.1){discard;}}"),W.gl.compileShader(t),W.gl.attachShader(W.program,t),W.gl.linkProgram(W.program),W.gl.useProgram(W.program),W.gl.clearColor(1,1,1,1),W.clearColor=e=>W.gl.clearColor(...W.col(e)),W.clearColor("fff"),W.gl.enable(2929),W.light({y:-1}),W.camera({fov:30}),W.draw()},ss:(e,t,r,o,a=[],n,l,i,s,m,d,g,c)=>{e.n||="o"+W.objs++,e.size&&(e.w=e.h=e.d=e.size),e.t&&e.t.width&&!W.textures[e.t.id]&&(r=W.gl.createTexture(),W.gl.pixelStorei(37441,!0),W.gl.bindTexture(3553,r),W.gl.pixelStorei(37440,1),W.gl.texParameteri(3553, 10240, 9728),W.gl.texParameteri(3553, 10241, 9728),W.gl.texImage2D(3553,0,6408,6408,5121,e.t),W.gl.generateMipmap(3553),W.textures[e.t.id]=r),e.fov&&(W.projection=new DOMMatrix([1/Math.tan(e.fov*Math.PI/180)/(W.canvas.width/W.canvas.height),0,0,0,0,1/Math.tan(e.fov*Math.PI/180),0,0,0,0,-1001/999,-1,0,0,-2e3/999,0])),e={type:t,...W.current[e.n]=W.next[e.n]||{w:1,h:1,d:1,x:0,y:0,z:0,rx:0,ry:0,rz:0,b:"888",mode:4,mix:0},...e,f:0},W.mdl[e.type]?.vertices&&!W.mdl?.[e.type].verticesBuffer&&(W.gl.bindBuffer(34962,W.mdl[e.type].verticesBuffer=W.gl.createBuffer()),W.gl.bufferData(34962,new Float32Array(W.mdl[e.type].vertices),35044),W.mdl[e.type].normals&&(W.gl.bindBuffer(34962,W.mdl[e.type].normalsBuffer=W.gl.createBuffer()),W.gl.bufferData(34962,new Float32Array(W.mdl[e.type].normals.flat()),35044))),W.mdl[e.type]?.uv&&!W.mdl[e.type].uvBuffer&&(W.gl.bindBuffer(34962,W.mdl[e.type].uvBuffer=W.gl.createBuffer()),W.gl.bufferData(34962,new Float32Array(W.mdl[e.type].uv),35044)),W.mdl[e.type]?.indices&&!W.mdl[e.type].indicesBuffer&&(W.gl.bindBuffer(34963,W.mdl[e.type].indicesBuffer=W.gl.createBuffer()),W.gl.bufferData(34963,new Uint16Array(W.mdl[e.type].indices),35044)),e.t?e.t&&!e.mix&&(e.mix=0):e.mix=1,W.next[e.n]=e},draw:(e,t,r,o,a=[])=>{for(o in t=e-W.lastFrame,W.lastFrame=e,requestAnimationFrame(W.draw),W.gl.clear(16640),r=W.animation("camera"),W.v=r,W.gl.uniformMatrix4fv(W.gl.getUniformLocation(W.program,"eye"),!1,r.toFloat32Array()),r.invertSelf(),r.preMultiplySelf(W.projection),W.gl.uniformMatrix4fv(W.gl.getUniformLocation(W.program,"pv"),!1,r.toFloat32Array()),W.gl.uniform3f(W.gl.getUniformLocation(W.program,"light"),W.lerp("light","x"),W.lerp("light","y"),W.lerp("light","z")),W.next)W.next[o].t||1!=W.col(W.next[o].b)[3]?a.push(W.next[o]):W.rr(W.next[o],t);for(o in a.sort(((e,t)=>W.dist(t)-W.dist(e))).sort((e)=>e.g==="map"?-1:1),W.gl.enable(3042),a)W.rr(a[o],t);W.gl.disable(3042)},rr:(e,t,r)=>{e.t&&(W.gl.bindTexture(3553,W.textures[e.t.id]),W.gl.uniform1i(W.gl.getUniformLocation(W.program,"sampler"),0)),e.f<e.a&&(e.f+=t),e.f>e.a&&(e.f=e.a),W.next[e.n].m=W.animation(e.n),W.next[e.g]&&W.next[e.n].m.preMultiplySelf(W.next[e.g].M||W.next[e.g].m),W.gl.uniformMatrix4fv(W.gl.getUniformLocation(W.program,"m"),!1,(W.next[e.n].M||W.next[e.n].m).toFloat32Array()),W.gl.uniformMatrix4fv(W.gl.getUniformLocation(W.program,"im"),!1,new DOMMatrix(W.next[e.n].M||W.next[e.n].m).invertSelf().toFloat32Array()),["camera","light","group"].includes(e.type)||(W.gl.bindBuffer(34962,W.mdl[e.type].verticesBuffer),W.gl.vertexAttribPointer(r=W.gl.getAttribLocation(W.program,"pos"),3,5126,!1,0,0),W.gl.enableVertexAttribArray(r),W.mdl[e.type].uvBuffer&&(W.gl.bindBuffer(34962,W.mdl[e.type].uvBuffer),W.gl.vertexAttribPointer(r=W.gl.getAttribLocation(W.program,"uv"),2,5126,!1,0,0),W.gl.enableVertexAttribArray(r)),(e.s||W.mdl[e.type].customNormals)&&W.mdl[e.type].normalsBuffer&&(W.gl.bindBuffer(34962,W.mdl[e.type].normalsBuffer),W.gl.vertexAttribPointer(r=W.gl.getAttribLocation(W.program,"normal"),3,5126,!1,0,0),W.gl.enableVertexAttribArray(r)),W.gl.uniform4f(W.gl.getUniformLocation(W.program,"o"),e.s,(e.mode>3||W.gl[e.mode]>3)&&!e.ns?1:0,W.ambientLight||.2,e.mix),W.gl.uniform4f(W.gl.getUniformLocation(W.program,"bb"),e.w,e.h,e.type=='bb',0),W.mdl[e.type].indicesBuffer&&W.gl.bindBuffer(34963,W.mdl[e.type].indicesBuffer),W.gl.vertexAttrib4fv(W.gl.getAttribLocation(W.program,"col"),W.col(e.b)),W.mdl[e.type].indicesBuffer?W.gl.drawElements(+e.mode||W.gl[e.mode],W.mdl[e.type].indices.length,5123,0):W.gl.drawArrays(+e.mode||W.gl[e.mode],0,W.mdl[e.type].vertices.length/3))},lerp:(e,t)=>W.next[e]?.a?W.current[e][t]+(W.next[e][t]-W.current[e][t])*(W.next[e].f/W.next[e].a):W.next[e][t],animation:(e,t=new DOMMatrix)=>W.next[e]?t.translateSelf(W.lerp(e,"x"),W.lerp(e,"y"),W.lerp(e,"z")).rotateSelf(W.lerp(e,"rx"),W.lerp(e,"ry"),W.lerp(e,"rz")).scaleSelf(W.lerp(e,"w"),W.lerp(e,"h"),W.lerp(e,"d")):t,dist:(e,t=W.next.camera)=>e?.m&&t?.m?(t.m.m41-e.m.m41)**2+(t.m.m42-e.m.m42)**2+(t.m.m43-e.m.m43)**2:0,ambient:e=>W.ambientLight=e,col:e=>[...e.replace("#","").match(e.length<5?/./g:/../g).map((t=>("0x"+t)/(e.length<5?15:255))),1],add:(e,t)=>{W.mdl[e]=t,t.normals&&(W.mdl[e].customNormals=1),W[e]=t=>W.ss(t,e)},group:e=>W.ss(e,"group"),move:(e,t)=>setTimeout((()=>{W.next[e.n]&&W.ss(e)}),t||1),delete:(e,t)=>setTimeout((()=>{delete W.next[e]}),t||1),camera:(e,t)=>setTimeout((()=>{W.ss(e,e.n="camera")}),t||1),light:(e,t)=>t?setTimeout((()=>{W.ss(e,e.n="light")}),t):W.ss(e,e.n="light")}