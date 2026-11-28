(()=>{var $p=0,Zh=1,jp=2;var hd=1,uu=2,di=3,Qn=0,ln=1,an=2,Yi=0,Zi=1,Wn=2,Kh=3,Jh=4,hu=5,vs=100,Qp=101,em=102,tm=103,nm=104,im=200,sm=201,rm=202,om=203,so=204,ro=205,am=206,cm=207,lm=208,um=209,hm=210,fm=211,dm=212,pm=213,mm=214,Qc=0,oo=1,el=2,lr=3,tl=4,nl=5,il=6,sl=7,fd=0,gm=1,xm=2,Ki=0,_m=1,vm=2,ym=3,fu=4,Am=5,Mm=6,Sm=7,$h="attached",bm="detached",dd=300,ur=301,hr=302,rl=303,ol=304,Za=306,ei=1e3,mi=1001,ao=1002,zt=1003,du=1004;var nr=1005;var Kt=1006,eo=1007;var jn=1008;var _i=1009,pd=1010,md=1011,co=1012,pu=1013,Ms=1014,Vn=1015,Mo=1016,mu=1017,gu=1018,fr=1020,gd=35902,xd=1021,_d=1022,Cn=1023,vd=1024,yd=1025,or=1026,dr=1027,xu=1028,_u=1029,Ad=1030,vu=1031;var yu=1033,_a=33776,va=33777,ya=33778,Aa=33779,al=35840,cl=35841,ll=35842,ul=35843,hl=36196,fl=37492,dl=37496,pl=37808,ml=37809,gl=37810,xl=37811,_l=37812,vl=37813,yl=37814,Al=37815,Ml=37816,Sl=37817,bl=37818,El=37819,Tl=37820,wl=37821,Ma=36492,Rl=36494,Cl=36495,Md=36283,Il=36284,Pl=36285,Ll=36286,So=2200,Em=2201,Tm=2202,pr=2300,mr=2301,yc=2302,ir=2400,sr=2401,Sa=2402,Au=2500,Sd=2501,bd=0,Ka=1,bo=2,wm=3200,Rm=3201;var Ed=0,Cm=1,cn="",Tt="srgb",un="srgb-linear",Ja="linear",pt="srgb";var Fs=7680;var jh=519,Im=512,Pm=513,Lm=514,Td=515,Dm=516,Um=517,Nm=518,Om=519,Dl=35044;var Qh="300 es",gi=2e3,ba=2001,vi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let s=this._listeners[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let n=this._listeners[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},sn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],ef=1234567,to=Math.PI/180,gr=180/Math.PI;function Gn(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(sn[i&255]+sn[i>>8&255]+sn[i>>16&255]+sn[i>>24&255]+"-"+sn[e&255]+sn[e>>8&255]+"-"+sn[e>>16&15|64]+sn[e>>24&255]+"-"+sn[t&63|128]+sn[t>>8&255]+"-"+sn[t>>16&255]+sn[t>>24&255]+sn[n&255]+sn[n>>8&255]+sn[n>>16&255]+sn[n>>24&255]).toLowerCase()}function on(i,e,t){return Math.max(e,Math.min(t,i))}function Mu(i,e){return(i%e+e)%e}function Fm(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function Bm(i,e,t){return i!==e?(t-i)/(e-i):0}function no(i,e,t){return(1-t)*i+t*e}function zm(i,e,t,n){return no(i,e,1-Math.exp(-t*n))}function Hm(i,e=1){return e-Math.abs(Mu(i,e*2)-e)}function km(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Vm(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Gm(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Wm(i,e){return i+Math.random()*(e-i)}function Xm(i){return i*(.5-Math.random())}function qm(i){i!==void 0&&(ef=i);let e=ef+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Ym(i){return i*to}function Zm(i){return i*gr}function Km(i){return(i&i-1)===0&&i!==0}function Jm(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function $m(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function jm(i,e,t,n,s){let r=Math.cos,o=Math.sin,a=r(t/2),c=o(t/2),l=r((e+n)/2),u=o((e+n)/2),h=r((e-n)/2),f=o((e-n)/2),p=r((n-e)/2),g=o((n-e)/2);switch(s){case"XYX":i.set(a*u,c*h,c*f,a*l);break;case"YZY":i.set(c*f,a*u,c*h,a*l);break;case"ZXZ":i.set(c*h,c*f,a*u,a*l);break;case"XZX":i.set(a*u,c*g,c*p,a*l);break;case"YXY":i.set(c*p,a*u,c*g,a*l);break;case"ZYZ":i.set(c*g,c*p,a*u,a*l);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function kn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function ht(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var wd={DEG2RAD:to,RAD2DEG:gr,generateUUID:Gn,clamp:on,euclideanModulo:Mu,mapLinear:Fm,inverseLerp:Bm,lerp:no,damp:zm,pingpong:Hm,smoothstep:km,smootherstep:Vm,randInt:Gm,randFloat:Wm,randFloatSpread:Xm,seededRandom:qm,degToRad:Ym,radToDeg:Zm,isPowerOfTwo:Km,ceilPowerOfTwo:Jm,floorPowerOfTwo:$m,setQuaternionFromProperEuler:jm,normalize:ht,denormalize:kn},Ue=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(on(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Xe=class i{constructor(e,t,n,s,r,o,a,c,l){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,c,l)}set(e,t,n,s,r,o,a,c,l){let u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=c,u[6]=n,u[7]=o,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],u=n[4],h=n[7],f=n[2],p=n[5],g=n[8],x=s[0],m=s[3],d=s[6],E=s[1],b=s[4],v=s[7],N=s[2],R=s[5],C=s[8];return r[0]=o*x+a*E+c*N,r[3]=o*m+a*b+c*R,r[6]=o*d+a*v+c*C,r[1]=l*x+u*E+h*N,r[4]=l*m+u*b+h*R,r[7]=l*d+u*v+h*C,r[2]=f*x+p*E+g*N,r[5]=f*m+p*b+g*R,r[8]=f*d+p*v+g*C,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8];return t*o*u-t*a*l-n*r*u+n*a*c+s*r*l-s*o*c}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=u*o-a*l,f=a*c-u*r,p=l*r-o*c,g=t*h+n*f+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/g;return e[0]=h*x,e[1]=(s*l-u*n)*x,e[2]=(a*n-s*o)*x,e[3]=f*x,e[4]=(u*t-s*c)*x,e[5]=(s*r-a*t)*x,e[6]=p*x,e[7]=(n*c-l*t)*x,e[8]=(o*t-n*r)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){let c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*o+l*a)+o+e,-s*l,s*c,-s*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Ac.makeScale(e,t)),this}rotate(e){return this.premultiply(Ac.makeRotation(-e)),this}translate(e,t){return this.premultiply(Ac.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Ac=new Xe;function Rd(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function lo(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Qm(){let i=lo("canvas");return i.style.display="block",i}var tf={};function jr(i){i in tf||(tf[i]=!0,console.warn(i))}function e0(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}function t0(i){let e=i.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function n0(i){let e=i.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}var $e={enabled:!0,workingColorSpace:un,spaces:{},convert:function(i,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===pt&&(i.r=xi(i.r),i.g=xi(i.g),i.b=xi(i.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(i.applyMatrix3(this.spaces[e].toXYZ),i.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===pt&&(i.r=ar(i.r),i.g=ar(i.g),i.b=ar(i.b))),i},fromWorkingColorSpace:function(i,e){return this.convert(i,this.workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===cn?Ja:this.spaces[i].transfer},getLuminanceCoefficients:function(i,e=this.workingColorSpace){return i.fromArray(this.spaces[e].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,e,t){return i.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function xi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function ar(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var nf=[.64,.33,.3,.6,.15,.06],sf=[.2126,.7152,.0722],rf=[.3127,.329],of=new Xe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),af=new Xe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);$e.define({[un]:{primaries:nf,whitePoint:rf,transfer:Ja,toXYZ:of,fromXYZ:af,luminanceCoefficients:sf,workingColorSpaceConfig:{unpackColorSpace:Tt},outputColorSpaceConfig:{drawingBufferColorSpace:Tt}},[Tt]:{primaries:nf,whitePoint:rf,transfer:pt,toXYZ:of,fromXYZ:af,luminanceCoefficients:sf,outputColorSpaceConfig:{drawingBufferColorSpace:Tt}}});var Bs,Ul=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Bs===void 0&&(Bs=lo("canvas")),Bs.width=e.width,Bs.height=e.height;let n=Bs.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Bs}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=lo("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=xi(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(xi(t[n]/255)*255):t[n]=xi(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},i0=0,Ea=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:i0++}),this.uuid=Gn(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Mc(s[o].image)):r.push(Mc(s[o]))}else r=Mc(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function Mc(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Ul.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var s0=0,Ht=class i extends vi{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=mi,s=mi,r=Kt,o=jn,a=Cn,c=_i,l=i.DEFAULT_ANISOTROPY,u=cn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:s0++}),this.uuid=Gn(),this.name="",this.source=new Ea(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new Ue(0,0),this.repeat=new Ue(1,1),this.center=new Ue(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Xe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==dd)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ei:e.x=e.x-Math.floor(e.x);break;case mi:e.x=e.x<0?0:1;break;case ao:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ei:e.y=e.y-Math.floor(e.y);break;case mi:e.y=e.y<0?0:1;break;case ao:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Ht.DEFAULT_IMAGE=null;Ht.DEFAULT_MAPPING=dd;Ht.DEFAULT_ANISOTROPY=1;var ze=class i{constructor(e=0,t=0,n=0,s=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,c=e.elements,l=c[0],u=c[4],h=c[8],f=c[1],p=c[5],g=c[9],x=c[2],m=c[6],d=c[10];if(Math.abs(u-f)<.01&&Math.abs(h-x)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+f)<.1&&Math.abs(h+x)<.1&&Math.abs(g+m)<.1&&Math.abs(l+p+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let b=(l+1)/2,v=(p+1)/2,N=(d+1)/2,R=(u+f)/4,C=(h+x)/4,I=(g+m)/4;return b>v&&b>N?b<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(b),s=R/n,r=C/n):v>N?v<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),n=R/s,r=I/s):N<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(N),n=C/r,s=I/r),this.set(n,s,r,t),this}let E=Math.sqrt((m-g)*(m-g)+(h-x)*(h-x)+(f-u)*(f-u));return Math.abs(E)<.001&&(E=1),this.x=(m-g)/E,this.y=(h-x)/E,this.z=(f-u)/E,this.w=Math.acos((l+p+d-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Nl=class extends vi{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new ze(0,0,e,t),this.scissorTest=!1,this.viewport=new ze(0,0,e,t);let s={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Kt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);let r=new Ht(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];let o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,s=e.textures.length;n<s;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new Ea(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},yi=class extends Nl{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Ta=class extends Ht{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=zt,this.minFilter=zt,this.wrapR=mi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Ol=class extends Ht{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=zt,this.minFilter=zt,this.wrapR=mi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ot=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let c=n[s+0],l=n[s+1],u=n[s+2],h=n[s+3],f=r[o+0],p=r[o+1],g=r[o+2],x=r[o+3];if(a===0){e[t+0]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=f,e[t+1]=p,e[t+2]=g,e[t+3]=x;return}if(h!==x||c!==f||l!==p||u!==g){let m=1-a,d=c*f+l*p+u*g+h*x,E=d>=0?1:-1,b=1-d*d;if(b>Number.EPSILON){let N=Math.sqrt(b),R=Math.atan2(N,d*E);m=Math.sin(m*R)/N,a=Math.sin(a*R)/N}let v=a*E;if(c=c*m+f*v,l=l*m+p*v,u=u*m+g*v,h=h*m+x*v,m===1-a){let N=1/Math.sqrt(c*c+l*l+u*u+h*h);c*=N,l*=N,u*=N,h*=N}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,s,r,o){let a=n[s],c=n[s+1],l=n[s+2],u=n[s+3],h=r[o],f=r[o+1],p=r[o+2],g=r[o+3];return e[t]=a*g+u*h+c*p-l*f,e[t+1]=c*g+u*f+l*h-a*p,e[t+2]=l*g+u*p+a*f-c*h,e[t+3]=u*g-a*h-c*f-l*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(n/2),u=a(s/2),h=a(r/2),f=c(n/2),p=c(s/2),g=c(r/2);switch(o){case"XYZ":this._x=f*u*h+l*p*g,this._y=l*p*h-f*u*g,this._z=l*u*g+f*p*h,this._w=l*u*h-f*p*g;break;case"YXZ":this._x=f*u*h+l*p*g,this._y=l*p*h-f*u*g,this._z=l*u*g-f*p*h,this._w=l*u*h+f*p*g;break;case"ZXY":this._x=f*u*h-l*p*g,this._y=l*p*h+f*u*g,this._z=l*u*g+f*p*h,this._w=l*u*h-f*p*g;break;case"ZYX":this._x=f*u*h-l*p*g,this._y=l*p*h+f*u*g,this._z=l*u*g-f*p*h,this._w=l*u*h+f*p*g;break;case"YZX":this._x=f*u*h+l*p*g,this._y=l*p*h+f*u*g,this._z=l*u*g-f*p*h,this._w=l*u*h-f*p*g;break;case"XZY":this._x=f*u*h-l*p*g,this._y=l*p*h-f*u*g,this._z=l*u*g+f*p*h,this._w=l*u*h+f*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],c=t[9],l=t[2],u=t[6],h=t[10],f=n+a+h;if(f>0){let p=.5/Math.sqrt(f+1);this._w=.25/p,this._x=(u-c)*p,this._y=(r-l)*p,this._z=(o-s)*p}else if(n>a&&n>h){let p=2*Math.sqrt(1+n-a-h);this._w=(u-c)/p,this._x=.25*p,this._y=(s+o)/p,this._z=(r+l)/p}else if(a>h){let p=2*Math.sqrt(1+a-n-h);this._w=(r-l)/p,this._x=(s+o)/p,this._y=.25*p,this._z=(c+u)/p}else{let p=2*Math.sqrt(1+h-n-a);this._w=(o-s)/p,this._x=(r+l)/p,this._y=(c+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(on(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,c=t._y,l=t._z,u=t._w;return this._x=n*u+o*a+s*l-r*c,this._y=s*u+o*c+r*a-n*l,this._z=r*u+o*l+n*c-s*a,this._w=o*u-n*a-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,s=this._y,r=this._z,o=this._w,a=o*e._w+n*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;let c=1-a*a;if(c<=Number.EPSILON){let p=1-t;return this._w=p*o+t*this._w,this._x=p*n+t*this._x,this._y=p*s+t*this._y,this._z=p*r+t*this._z,this.normalize(),this}let l=Math.sqrt(c),u=Math.atan2(l,a),h=Math.sin((1-t)*u)/l,f=Math.sin(t*u)/l;return this._w=o*h+this._w*f,this._x=n*h+this._x*f,this._y=s*h+this._y*f,this._z=r*h+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},w=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(cf.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(cf.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*s-a*n),u=2*(a*t-r*s),h=2*(r*n-o*t);return this.x=t+c*l+o*h-a*u,this.y=n+c*u+a*l-r*h,this.z=s+c*h+r*u-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,c=t.z;return this.x=s*c-r*a,this.y=r*o-n*c,this.z=n*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Sc.copy(this).projectOnVector(e),this.sub(Sc)}reflect(e){return this.sub(Sc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(on(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Sc=new w,cf=new ot,In=class{constructor(e=new w(1/0,1/0,1/0),t=new w(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Bn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Bn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Bn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Bn):Bn.fromBufferAttribute(r,o),Bn.applyMatrix4(e.matrixWorld),this.expandByPoint(Bn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Go.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Go.copy(n.boundingBox)),Go.applyMatrix4(e.matrixWorld),this.union(Go)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Bn),Bn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(kr),Wo.subVectors(this.max,kr),zs.subVectors(e.a,kr),Hs.subVectors(e.b,kr),ks.subVectors(e.c,kr),zi.subVectors(Hs,zs),Hi.subVectors(ks,Hs),fs.subVectors(zs,ks);let t=[0,-zi.z,zi.y,0,-Hi.z,Hi.y,0,-fs.z,fs.y,zi.z,0,-zi.x,Hi.z,0,-Hi.x,fs.z,0,-fs.x,-zi.y,zi.x,0,-Hi.y,Hi.x,0,-fs.y,fs.x,0];return!bc(t,zs,Hs,ks,Wo)||(t=[1,0,0,0,1,0,0,0,1],!bc(t,zs,Hs,ks,Wo))?!1:(Xo.crossVectors(zi,Hi),t=[Xo.x,Xo.y,Xo.z],bc(t,zs,Hs,ks,Wo))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Bn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Bn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ai[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ai[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ai[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ai[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ai[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ai[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ai[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ai[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ai),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},ai=[new w,new w,new w,new w,new w,new w,new w,new w],Bn=new w,Go=new In,zs=new w,Hs=new w,ks=new w,zi=new w,Hi=new w,fs=new w,kr=new w,Wo=new w,Xo=new w,ds=new w;function bc(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){ds.fromArray(i,r);let a=s.x*Math.abs(ds.x)+s.y*Math.abs(ds.y)+s.z*Math.abs(ds.z),c=e.dot(ds),l=t.dot(ds),u=n.dot(ds);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>a)return!1}return!0}var r0=new In,Vr=new w,Ec=new w,Mn=class{constructor(e=new w,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):r0.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Vr.subVectors(e,this.center);let t=Vr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Vr,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ec.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Vr.copy(e.center).add(Ec)),this.expandByPoint(Vr.copy(e.center).sub(Ec))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},ci=new w,Tc=new w,qo=new w,ki=new w,wc=new w,Yo=new w,Rc=new w,xr=class{constructor(e=new w,t=new w(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ci)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=ci.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ci.copy(this.origin).addScaledVector(this.direction,t),ci.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Tc.copy(e).add(t).multiplyScalar(.5),qo.copy(t).sub(e).normalize(),ki.copy(this.origin).sub(Tc);let r=e.distanceTo(t)*.5,o=-this.direction.dot(qo),a=ki.dot(this.direction),c=-ki.dot(qo),l=ki.lengthSq(),u=Math.abs(1-o*o),h,f,p,g;if(u>0)if(h=o*c-a,f=o*a-c,g=r*u,h>=0)if(f>=-g)if(f<=g){let x=1/u;h*=x,f*=x,p=h*(h+o*f+2*a)+f*(o*h+f+2*c)+l}else f=r,h=Math.max(0,-(o*f+a)),p=-h*h+f*(f+2*c)+l;else f=-r,h=Math.max(0,-(o*f+a)),p=-h*h+f*(f+2*c)+l;else f<=-g?(h=Math.max(0,-(-o*r+a)),f=h>0?-r:Math.min(Math.max(-r,-c),r),p=-h*h+f*(f+2*c)+l):f<=g?(h=0,f=Math.min(Math.max(-r,-c),r),p=f*(f+2*c)+l):(h=Math.max(0,-(o*r+a)),f=h>0?r:Math.min(Math.max(-r,-c),r),p=-h*h+f*(f+2*c)+l);else f=o>0?-r:r,h=Math.max(0,-(o*f+a)),p=-h*h+f*(f+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(Tc).addScaledVector(qo,f),p}intersectSphere(e,t){ci.subVectors(e.center,this.origin);let n=ci.dot(this.direction),s=ci.dot(ci)-n*n,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,c,l=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,f=this.origin;return l>=0?(n=(e.min.x-f.x)*l,s=(e.max.x-f.x)*l):(n=(e.max.x-f.x)*l,s=(e.min.x-f.x)*l),u>=0?(r=(e.min.y-f.y)*u,o=(e.max.y-f.y)*u):(r=(e.max.y-f.y)*u,o=(e.min.y-f.y)*u),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(e.min.z-f.z)*h,c=(e.max.z-f.z)*h):(a=(e.max.z-f.z)*h,c=(e.min.z-f.z)*h),n>c||a>s)||((a>n||n!==n)&&(n=a),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,ci)!==null}intersectTriangle(e,t,n,s,r){wc.subVectors(t,e),Yo.subVectors(n,e),Rc.crossVectors(wc,Yo);let o=this.direction.dot(Rc),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;ki.subVectors(this.origin,e);let c=a*this.direction.dot(Yo.crossVectors(ki,Yo));if(c<0)return null;let l=a*this.direction.dot(wc.cross(ki));if(l<0||c+l>o)return null;let u=-a*ki.dot(Rc);return u<0?null:this.at(u/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},we=class i{constructor(e,t,n,s,r,o,a,c,l,u,h,f,p,g,x,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,c,l,u,h,f,p,g,x,m)}set(e,t,n,s,r,o,a,c,l,u,h,f,p,g,x,m){let d=this.elements;return d[0]=e,d[4]=t,d[8]=n,d[12]=s,d[1]=r,d[5]=o,d[9]=a,d[13]=c,d[2]=l,d[6]=u,d[10]=h,d[14]=f,d[3]=p,d[7]=g,d[11]=x,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,s=1/Vs.setFromMatrixColumn(e,0).length(),r=1/Vs.setFromMatrixColumn(e,1).length(),o=1/Vs.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(s),l=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){let f=o*u,p=o*h,g=a*u,x=a*h;t[0]=c*u,t[4]=-c*h,t[8]=l,t[1]=p+g*l,t[5]=f-x*l,t[9]=-a*c,t[2]=x-f*l,t[6]=g+p*l,t[10]=o*c}else if(e.order==="YXZ"){let f=c*u,p=c*h,g=l*u,x=l*h;t[0]=f+x*a,t[4]=g*a-p,t[8]=o*l,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=p*a-g,t[6]=x+f*a,t[10]=o*c}else if(e.order==="ZXY"){let f=c*u,p=c*h,g=l*u,x=l*h;t[0]=f-x*a,t[4]=-o*h,t[8]=g+p*a,t[1]=p+g*a,t[5]=o*u,t[9]=x-f*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){let f=o*u,p=o*h,g=a*u,x=a*h;t[0]=c*u,t[4]=g*l-p,t[8]=f*l+x,t[1]=c*h,t[5]=x*l+f,t[9]=p*l-g,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){let f=o*c,p=o*l,g=a*c,x=a*l;t[0]=c*u,t[4]=x-f*h,t[8]=g*h+p,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-l*u,t[6]=p*h+g,t[10]=f-x*h}else if(e.order==="XZY"){let f=o*c,p=o*l,g=a*c,x=a*l;t[0]=c*u,t[4]=-h,t[8]=l*u,t[1]=f*h+x,t[5]=o*u,t[9]=p*h-g,t[2]=g*h-p,t[6]=a*u,t[10]=x*h+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(o0,e,a0)}lookAt(e,t,n){let s=this.elements;return yn.subVectors(e,t),yn.lengthSq()===0&&(yn.z=1),yn.normalize(),Vi.crossVectors(n,yn),Vi.lengthSq()===0&&(Math.abs(n.z)===1?yn.x+=1e-4:yn.z+=1e-4,yn.normalize(),Vi.crossVectors(n,yn)),Vi.normalize(),Zo.crossVectors(yn,Vi),s[0]=Vi.x,s[4]=Zo.x,s[8]=yn.x,s[1]=Vi.y,s[5]=Zo.y,s[9]=yn.y,s[2]=Vi.z,s[6]=Zo.z,s[10]=yn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],u=n[1],h=n[5],f=n[9],p=n[13],g=n[2],x=n[6],m=n[10],d=n[14],E=n[3],b=n[7],v=n[11],N=n[15],R=s[0],C=s[4],I=s[8],S=s[12],A=s[1],P=s[5],k=s[9],B=s[13],G=s[2],J=s[6],X=s[10],Q=s[14],V=s[3],ie=s[7],pe=s[11],Re=s[15];return r[0]=o*R+a*A+c*G+l*V,r[4]=o*C+a*P+c*J+l*ie,r[8]=o*I+a*k+c*X+l*pe,r[12]=o*S+a*B+c*Q+l*Re,r[1]=u*R+h*A+f*G+p*V,r[5]=u*C+h*P+f*J+p*ie,r[9]=u*I+h*k+f*X+p*pe,r[13]=u*S+h*B+f*Q+p*Re,r[2]=g*R+x*A+m*G+d*V,r[6]=g*C+x*P+m*J+d*ie,r[10]=g*I+x*k+m*X+d*pe,r[14]=g*S+x*B+m*Q+d*Re,r[3]=E*R+b*A+v*G+N*V,r[7]=E*C+b*P+v*J+N*ie,r[11]=E*I+b*k+v*X+N*pe,r[15]=E*S+b*B+v*Q+N*Re,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],c=e[9],l=e[13],u=e[2],h=e[6],f=e[10],p=e[14],g=e[3],x=e[7],m=e[11],d=e[15];return g*(+r*c*h-s*l*h-r*a*f+n*l*f+s*a*p-n*c*p)+x*(+t*c*p-t*l*f+r*o*f-s*o*p+s*l*u-r*c*u)+m*(+t*l*h-t*a*p-r*o*h+n*o*p+r*a*u-n*l*u)+d*(-s*a*u-t*c*h+t*a*f+s*o*h-n*o*f+n*c*u)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=e[9],f=e[10],p=e[11],g=e[12],x=e[13],m=e[14],d=e[15],E=h*m*l-x*f*l+x*c*p-a*m*p-h*c*d+a*f*d,b=g*f*l-u*m*l-g*c*p+o*m*p+u*c*d-o*f*d,v=u*x*l-g*h*l+g*a*p-o*x*p-u*a*d+o*h*d,N=g*h*c-u*x*c-g*a*f+o*x*f+u*a*m-o*h*m,R=t*E+n*b+s*v+r*N;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let C=1/R;return e[0]=E*C,e[1]=(x*f*r-h*m*r-x*s*p+n*m*p+h*s*d-n*f*d)*C,e[2]=(a*m*r-x*c*r+x*s*l-n*m*l-a*s*d+n*c*d)*C,e[3]=(h*c*r-a*f*r-h*s*l+n*f*l+a*s*p-n*c*p)*C,e[4]=b*C,e[5]=(u*m*r-g*f*r+g*s*p-t*m*p-u*s*d+t*f*d)*C,e[6]=(g*c*r-o*m*r-g*s*l+t*m*l+o*s*d-t*c*d)*C,e[7]=(o*f*r-u*c*r+u*s*l-t*f*l-o*s*p+t*c*p)*C,e[8]=v*C,e[9]=(g*h*r-u*x*r-g*n*p+t*x*p+u*n*d-t*h*d)*C,e[10]=(o*x*r-g*a*r+g*n*l-t*x*l-o*n*d+t*a*d)*C,e[11]=(u*a*r-o*h*r-u*n*l+t*h*l+o*n*p-t*a*p)*C,e[12]=N*C,e[13]=(u*x*s-g*h*s+g*n*f-t*x*f-u*n*m+t*h*m)*C,e[14]=(g*a*s-o*x*s-g*n*c+t*x*c+o*n*m-t*a*m)*C,e[15]=(o*h*s-u*a*s+u*n*c-t*h*c-o*n*f+t*a*f)*C,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,c=e.z,l=r*o,u=r*a;return this.set(l*o+n,l*a-s*c,l*c+s*a,0,l*a+s*c,u*a+n,u*c-s*o,0,l*c-s*a,u*c+s*o,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,o=t._y,a=t._z,c=t._w,l=r+r,u=o+o,h=a+a,f=r*l,p=r*u,g=r*h,x=o*u,m=o*h,d=a*h,E=c*l,b=c*u,v=c*h,N=n.x,R=n.y,C=n.z;return s[0]=(1-(x+d))*N,s[1]=(p+v)*N,s[2]=(g-b)*N,s[3]=0,s[4]=(p-v)*R,s[5]=(1-(f+d))*R,s[6]=(m+E)*R,s[7]=0,s[8]=(g+b)*C,s[9]=(m-E)*C,s[10]=(1-(f+x))*C,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements,r=Vs.set(s[0],s[1],s[2]).length(),o=Vs.set(s[4],s[5],s[6]).length(),a=Vs.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],zn.copy(this);let l=1/r,u=1/o,h=1/a;return zn.elements[0]*=l,zn.elements[1]*=l,zn.elements[2]*=l,zn.elements[4]*=u,zn.elements[5]*=u,zn.elements[6]*=u,zn.elements[8]*=h,zn.elements[9]*=h,zn.elements[10]*=h,t.setFromRotationMatrix(zn),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,s,r,o,a=gi){let c=this.elements,l=2*r/(t-e),u=2*r/(n-s),h=(t+e)/(t-e),f=(n+s)/(n-s),p,g;if(a===gi)p=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===ba)p=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=l,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=g,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=gi){let c=this.elements,l=1/(t-e),u=1/(n-s),h=1/(o-r),f=(t+e)*l,p=(n+s)*u,g,x;if(a===gi)g=(o+r)*h,x=-2*h;else if(a===ba)g=r*h,x=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=2*l,c[4]=0,c[8]=0,c[12]=-f,c[1]=0,c[5]=2*u,c[9]=0,c[13]=-p,c[2]=0,c[6]=0,c[10]=x,c[14]=-g,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Vs=new w,zn=new we,o0=new w(0,0,0),a0=new w(1,1,1),Vi=new w,Zo=new w,yn=new w,lf=new we,uf=new ot,ti=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],c=s[1],l=s[5],u=s[9],h=s[2],f=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(on(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(f,l),this._z=0);break;case"YXZ":this._x=Math.asin(-on(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(on(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,p),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-on(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(on(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-on(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return lf.makeRotationFromQuaternion(e),this.setFromRotationMatrix(lf,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return uf.setFromEuler(this),this.setFromQuaternion(uf,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};ti.DEFAULT_ORDER="XYZ";var wa=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},c0=0,hf=new w,Gs=new ot,li=new we,Ko=new w,Gr=new w,l0=new w,u0=new ot,ff=new w(1,0,0),df=new w(0,1,0),pf=new w(0,0,1),mf={type:"added"},h0={type:"removed"},Ws={type:"childadded",child:null},Cc={type:"childremoved",child:null},Rt=class i extends vi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:c0++}),this.uuid=Gn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new w,t=new ti,n=new ot,s=new w(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new we},normalMatrix:{value:new Xe}}),this.matrix=new we,this.matrixWorld=new we,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new wa,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Gs.setFromAxisAngle(e,t),this.quaternion.multiply(Gs),this}rotateOnWorldAxis(e,t){return Gs.setFromAxisAngle(e,t),this.quaternion.premultiply(Gs),this}rotateX(e){return this.rotateOnAxis(ff,e)}rotateY(e){return this.rotateOnAxis(df,e)}rotateZ(e){return this.rotateOnAxis(pf,e)}translateOnAxis(e,t){return hf.copy(e).applyQuaternion(this.quaternion),this.position.add(hf.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(ff,e)}translateY(e){return this.translateOnAxis(df,e)}translateZ(e){return this.translateOnAxis(pf,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(li.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Ko.copy(e):Ko.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Gr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?li.lookAt(Gr,Ko,this.up):li.lookAt(Ko,Gr,this.up),this.quaternion.setFromRotationMatrix(li),s&&(li.extractRotation(s.matrixWorld),Gs.setFromRotationMatrix(li),this.quaternion.premultiply(Gs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(mf),Ws.child=e,this.dispatchEvent(Ws),Ws.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(h0),Cc.child=e,this.dispatchEvent(Cc),Cc.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),li.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),li.multiply(e.parent.matrixWorld)),e.applyMatrix4(li),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(mf),Ws.child=e,this.dispatchEvent(Ws),Ws.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gr,e,l0),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gr,u0,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let c=a.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){let h=c[l];r(e.shapes,h)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(e.materials,this.material[c]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let c=this.animations[a];s.animations.push(r(e.animations,c))}}if(t){let a=o(e.geometries),c=o(e.materials),l=o(e.textures),u=o(e.images),h=o(e.shapes),f=o(e.skeletons),p=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),f.length>0&&(n.skeletons=f),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){let c=[];for(let l in a){let u=a[l];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}};Rt.DEFAULT_UP=new w(0,1,0);Rt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Rt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Hn=new w,ui=new w,Ic=new w,hi=new w,Xs=new w,qs=new w,gf=new w,Pc=new w,Lc=new w,Dc=new w,Uc=new ze,Nc=new ze,Oc=new ze,Xi=class i{constructor(e=new w,t=new w,n=new w){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Hn.subVectors(e,t),s.cross(Hn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Hn.subVectors(s,t),ui.subVectors(n,t),Ic.subVectors(e,t);let o=Hn.dot(Hn),a=Hn.dot(ui),c=Hn.dot(Ic),l=ui.dot(ui),u=ui.dot(Ic),h=o*l-a*a;if(h===0)return r.set(0,0,0),null;let f=1/h,p=(l*c-a*u)*f,g=(o*u-a*c)*f;return r.set(1-p-g,g,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,hi)===null?!1:hi.x>=0&&hi.y>=0&&hi.x+hi.y<=1}static getInterpolation(e,t,n,s,r,o,a,c){return this.getBarycoord(e,t,n,s,hi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,hi.x),c.addScaledVector(o,hi.y),c.addScaledVector(a,hi.z),c)}static getInterpolatedAttribute(e,t,n,s,r,o){return Uc.setScalar(0),Nc.setScalar(0),Oc.setScalar(0),Uc.fromBufferAttribute(e,t),Nc.fromBufferAttribute(e,n),Oc.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Uc,r.x),o.addScaledVector(Nc,r.y),o.addScaledVector(Oc,r.z),o}static isFrontFacing(e,t,n,s){return Hn.subVectors(n,t),ui.subVectors(e,t),Hn.cross(ui).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Hn.subVectors(this.c,this.b),ui.subVectors(this.a,this.b),Hn.cross(ui).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,o,a;Xs.subVectors(s,n),qs.subVectors(r,n),Pc.subVectors(e,n);let c=Xs.dot(Pc),l=qs.dot(Pc);if(c<=0&&l<=0)return t.copy(n);Lc.subVectors(e,s);let u=Xs.dot(Lc),h=qs.dot(Lc);if(u>=0&&h<=u)return t.copy(s);let f=c*h-u*l;if(f<=0&&c>=0&&u<=0)return o=c/(c-u),t.copy(n).addScaledVector(Xs,o);Dc.subVectors(e,r);let p=Xs.dot(Dc),g=qs.dot(Dc);if(g>=0&&p<=g)return t.copy(r);let x=p*l-c*g;if(x<=0&&l>=0&&g<=0)return a=l/(l-g),t.copy(n).addScaledVector(qs,a);let m=u*g-p*h;if(m<=0&&h-u>=0&&p-g>=0)return gf.subVectors(r,s),a=(h-u)/(h-u+(p-g)),t.copy(s).addScaledVector(gf,a);let d=1/(m+x+f);return o=x*d,a=f*d,t.copy(n).addScaledVector(Xs,o).addScaledVector(qs,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Cd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Gi={h:0,s:0,l:0},Jo={h:0,s:0,l:0};function Fc(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Ee=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Tt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,$e.toWorkingColorSpace(this,t),this}setRGB(e,t,n,s=$e.workingColorSpace){return this.r=e,this.g=t,this.b=n,$e.toWorkingColorSpace(this,s),this}setHSL(e,t,n,s=$e.workingColorSpace){if(e=Mu(e,1),t=on(t,0,1),n=on(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=Fc(o,r,e+1/3),this.g=Fc(o,r,e),this.b=Fc(o,r,e-1/3)}return $e.toWorkingColorSpace(this,s),this}setStyle(e,t=Tt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Tt){let n=Cd[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=xi(e.r),this.g=xi(e.g),this.b=xi(e.b),this}copyLinearToSRGB(e){return this.r=ar(e.r),this.g=ar(e.g),this.b=ar(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Tt){return $e.fromWorkingColorSpace(rn.copy(this),e),Math.round(on(rn.r*255,0,255))*65536+Math.round(on(rn.g*255,0,255))*256+Math.round(on(rn.b*255,0,255))}getHexString(e=Tt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=$e.workingColorSpace){$e.fromWorkingColorSpace(rn.copy(this),t);let n=rn.r,s=rn.g,r=rn.b,o=Math.max(n,s,r),a=Math.min(n,s,r),c,l,u=(a+o)/2;if(a===o)c=0,l=0;else{let h=o-a;switch(l=u<=.5?h/(o+a):h/(2-o-a),o){case n:c=(s-r)/h+(s<r?6:0);break;case s:c=(r-n)/h+2;break;case r:c=(n-s)/h+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=$e.workingColorSpace){return $e.fromWorkingColorSpace(rn.copy(this),t),e.r=rn.r,e.g=rn.g,e.b=rn.b,e}getStyle(e=Tt){$e.fromWorkingColorSpace(rn.copy(this),e);let t=rn.r,n=rn.g,s=rn.b;return e!==Tt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Gi),this.setHSL(Gi.h+e,Gi.s+t,Gi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Gi),e.getHSL(Jo);let n=no(Gi.h,Jo.h,t),s=no(Gi.s,Jo.s,t),r=no(Gi.l,Jo.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},rn=new Ee;Ee.NAMES=Cd;var f0=0,mn=class extends vi{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:f0++}),this.uuid=Gn(),this.name="",this.blending=Zi,this.side=Qn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=so,this.blendDst=ro,this.blendEquation=vs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ee(0,0,0),this.blendAlpha=0,this.depthFunc=lr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=jh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Fs,this.stencilZFail=Fs,this.stencilZPass=Fs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Zi&&(n.blending=this.blending),this.side!==Qn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==so&&(n.blendSrc=this.blendSrc),this.blendDst!==ro&&(n.blendDst=this.blendDst),this.blendEquation!==vs&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==lr&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==jh&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Fs&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Fs&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Fs&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let c=r[a];delete c.metadata,o.push(c)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},It=class extends mn{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new Ee(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ti,this.combine=fd,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var Ot=new w,$o=new Ue,wt=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Dl,this.updateRanges=[],this.gpuType=Vn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)$o.fromBufferAttribute(this,t),$o.applyMatrix3(e),this.setXY(t,$o.x,$o.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Ot.fromBufferAttribute(this,t),Ot.applyMatrix3(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Ot.fromBufferAttribute(this,t),Ot.applyMatrix4(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ot.fromBufferAttribute(this,t),Ot.applyNormalMatrix(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ot.fromBufferAttribute(this,t),Ot.transformDirection(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=kn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ht(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=kn(t,this.array)),t}setX(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=kn(t,this.array)),t}setY(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=kn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=kn(t,this.array)),t}setW(e,t){return this.normalized&&(t=ht(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),s=ht(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),s=ht(s,this.array),r=ht(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Dl&&(e.usage=this.usage),e}};var Ra=class extends wt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Ca=class extends wt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Jt=class extends wt{constructor(e,t,n){super(new Float32Array(e),t,n)}},d0=0,Rn=new we,Bc=new Rt,Ys=new w,An=new In,Wr=new In,Zt=new w,$t=class i extends vi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:d0++}),this.uuid=Gn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Rd(e)?Ca:Ra)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Xe().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Rn.makeRotationFromQuaternion(e),this.applyMatrix4(Rn),this}rotateX(e){return Rn.makeRotationX(e),this.applyMatrix4(Rn),this}rotateY(e){return Rn.makeRotationY(e),this.applyMatrix4(Rn),this}rotateZ(e){return Rn.makeRotationZ(e),this.applyMatrix4(Rn),this}translate(e,t,n){return Rn.makeTranslation(e,t,n),this.applyMatrix4(Rn),this}scale(e,t,n){return Rn.makeScale(e,t,n),this.applyMatrix4(Rn),this}lookAt(e){return Bc.lookAt(e),Bc.updateMatrix(),this.applyMatrix4(Bc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ys).negate(),this.translate(Ys.x,Ys.y,Ys.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Jt(n,3))}else{for(let n=0,s=t.count;n<s;n++){let r=e[n];t.setXYZ(n,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new In);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new w(-1/0,-1/0,-1/0),new w(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];An.setFromBufferAttribute(r),this.morphTargetsRelative?(Zt.addVectors(this.boundingBox.min,An.min),this.boundingBox.expandByPoint(Zt),Zt.addVectors(this.boundingBox.max,An.max),this.boundingBox.expandByPoint(Zt)):(this.boundingBox.expandByPoint(An.min),this.boundingBox.expandByPoint(An.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Mn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new w,1/0);return}if(e){let n=this.boundingSphere.center;if(An.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];Wr.setFromBufferAttribute(a),this.morphTargetsRelative?(Zt.addVectors(An.min,Wr.min),An.expandByPoint(Zt),Zt.addVectors(An.max,Wr.max),An.expandByPoint(Zt)):(An.expandByPoint(Wr.min),An.expandByPoint(Wr.max))}An.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)Zt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Zt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],c=this.morphTargetsRelative;for(let l=0,u=a.count;l<u;l++)Zt.fromBufferAttribute(a,l),c&&(Ys.fromBufferAttribute(e,l),Zt.add(Ys)),s=Math.max(s,n.distanceToSquared(Zt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new wt(new Float32Array(4*n.count),4));let o=this.getAttribute("tangent"),a=[],c=[];for(let I=0;I<n.count;I++)a[I]=new w,c[I]=new w;let l=new w,u=new w,h=new w,f=new Ue,p=new Ue,g=new Ue,x=new w,m=new w;function d(I,S,A){l.fromBufferAttribute(n,I),u.fromBufferAttribute(n,S),h.fromBufferAttribute(n,A),f.fromBufferAttribute(r,I),p.fromBufferAttribute(r,S),g.fromBufferAttribute(r,A),u.sub(l),h.sub(l),p.sub(f),g.sub(f);let P=1/(p.x*g.y-g.x*p.y);isFinite(P)&&(x.copy(u).multiplyScalar(g.y).addScaledVector(h,-p.y).multiplyScalar(P),m.copy(h).multiplyScalar(p.x).addScaledVector(u,-g.x).multiplyScalar(P),a[I].add(x),a[S].add(x),a[A].add(x),c[I].add(m),c[S].add(m),c[A].add(m))}let E=this.groups;E.length===0&&(E=[{start:0,count:e.count}]);for(let I=0,S=E.length;I<S;++I){let A=E[I],P=A.start,k=A.count;for(let B=P,G=P+k;B<G;B+=3)d(e.getX(B+0),e.getX(B+1),e.getX(B+2))}let b=new w,v=new w,N=new w,R=new w;function C(I){N.fromBufferAttribute(s,I),R.copy(N);let S=a[I];b.copy(S),b.sub(N.multiplyScalar(N.dot(S))).normalize(),v.crossVectors(R,S);let P=v.dot(c[I])<0?-1:1;o.setXYZW(I,b.x,b.y,b.z,P)}for(let I=0,S=E.length;I<S;++I){let A=E[I],P=A.start,k=A.count;for(let B=P,G=P+k;B<G;B+=3)C(e.getX(B+0)),C(e.getX(B+1)),C(e.getX(B+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new wt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,p=n.count;f<p;f++)n.setXYZ(f,0,0,0);let s=new w,r=new w,o=new w,a=new w,c=new w,l=new w,u=new w,h=new w;if(e)for(let f=0,p=e.count;f<p;f+=3){let g=e.getX(f+0),x=e.getX(f+1),m=e.getX(f+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,x),o.fromBufferAttribute(t,m),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),a.fromBufferAttribute(n,g),c.fromBufferAttribute(n,x),l.fromBufferAttribute(n,m),a.add(u),c.add(u),l.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(x,c.x,c.y,c.z),n.setXYZ(m,l.x,l.y,l.z)}else for(let f=0,p=t.count;f<p;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),n.setXYZ(f+0,u.x,u.y,u.z),n.setXYZ(f+1,u.x,u.y,u.z),n.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Zt.fromBufferAttribute(e,t),Zt.normalize(),e.setXYZ(t,Zt.x,Zt.y,Zt.z)}toNonIndexed(){function e(a,c){let l=a.array,u=a.itemSize,h=a.normalized,f=new l.constructor(c.length*u),p=0,g=0;for(let x=0,m=c.length;x<m;x++){a.isInterleavedBufferAttribute?p=c[x]*a.data.stride+a.offset:p=c[x]*u;for(let d=0;d<u;d++)f[g++]=l[p++]}return new wt(f,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let a in s){let c=s[a],l=e(c,n);t.setAttribute(a,l)}let r=this.morphAttributes;for(let a in r){let c=[],l=r[a];for(let u=0,h=l.length;u<h;u++){let f=l[u],p=e(f,n);c.push(p)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,c=o.length;a<c;a++){let l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let c in n){let l=n[c];e.data.attributes[c]=l.toJSON(e.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],u=[];for(let h=0,f=l.length;h<f;h++){let p=l[h];u.push(p.toJSON(e.data))}u.length>0&&(s[c]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone(t));let s=e.attributes;for(let l in s){let u=s[l];this.setAttribute(l,u.clone(t))}let r=e.morphAttributes;for(let l in r){let u=[],h=r[l];for(let f=0,p=h.length;f<p;f++)u.push(h[f].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let l=0,u=o.length;l<u;l++){let h=o[l];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},xf=new we,ps=new xr,jo=new Mn,_f=new w,Qo=new w,ea=new w,ta=new w,zc=new w,na=new w,vf=new w,ia=new w,Te=class extends Rt{constructor(e=new $t,t=new It){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){na.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let u=a[c],h=r[c];u!==0&&(zc.fromBufferAttribute(h,e),o?na.addScaledVector(zc,u):na.addScaledVector(zc.sub(t),u))}t.add(na)}return t}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),jo.copy(n.boundingSphere),jo.applyMatrix4(r),ps.copy(e.ray).recast(e.near),!(jo.containsPoint(ps.origin)===!1&&(ps.intersectSphere(jo,_f)===null||ps.origin.distanceToSquared(_f)>(e.far-e.near)**2))&&(xf.copy(r).invert(),ps.copy(e.ray).applyMatrix4(xf),!(n.boundingBox!==null&&ps.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ps)))}_computeIntersections(e,t,n){let s,r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,f=r.groups,p=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,x=f.length;g<x;g++){let m=f[g],d=o[m.materialIndex],E=Math.max(m.start,p.start),b=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let v=E,N=b;v<N;v+=3){let R=a.getX(v),C=a.getX(v+1),I=a.getX(v+2);s=sa(this,d,e,n,l,u,h,R,C,I),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),x=Math.min(a.count,p.start+p.count);for(let m=g,d=x;m<d;m+=3){let E=a.getX(m),b=a.getX(m+1),v=a.getX(m+2);s=sa(this,o,e,n,l,u,h,E,b,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,x=f.length;g<x;g++){let m=f[g],d=o[m.materialIndex],E=Math.max(m.start,p.start),b=Math.min(c.count,Math.min(m.start+m.count,p.start+p.count));for(let v=E,N=b;v<N;v+=3){let R=v,C=v+1,I=v+2;s=sa(this,d,e,n,l,u,h,R,C,I),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),x=Math.min(c.count,p.start+p.count);for(let m=g,d=x;m<d;m+=3){let E=m,b=m+1,v=m+2;s=sa(this,o,e,n,l,u,h,E,b,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function p0(i,e,t,n,s,r,o,a){let c;if(e.side===ln?c=n.intersectTriangle(o,r,s,!0,a):c=n.intersectTriangle(s,r,o,e.side===Qn,a),c===null)return null;ia.copy(a),ia.applyMatrix4(i.matrixWorld);let l=t.ray.origin.distanceTo(ia);return l<t.near||l>t.far?null:{distance:l,point:ia.clone(),object:i}}function sa(i,e,t,n,s,r,o,a,c,l){i.getVertexPosition(a,Qo),i.getVertexPosition(c,ea),i.getVertexPosition(l,ta);let u=p0(i,e,t,n,Qo,ea,ta,vf);if(u){let h=new w;Xi.getBarycoord(vf,Qo,ea,ta,h),s&&(u.uv=Xi.getInterpolatedAttribute(s,a,c,l,h,new Ue)),r&&(u.uv1=Xi.getInterpolatedAttribute(r,a,c,l,h,new Ue)),o&&(u.normal=Xi.getInterpolatedAttribute(o,a,c,l,h,new w),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let f={a,b:c,c:l,normal:new w,materialIndex:0};Xi.getNormal(Qo,ea,ta,f.normal),u.face=f,u.barycoord=h}return u}var ni=class i extends $t{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let c=[],l=[],u=[],h=[],f=0,p=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,s,o,2),g("x","z","y",1,-1,e,n,-t,s,o,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new Jt(l,3)),this.setAttribute("normal",new Jt(u,3)),this.setAttribute("uv",new Jt(h,2));function g(x,m,d,E,b,v,N,R,C,I,S){let A=v/C,P=N/I,k=v/2,B=N/2,G=R/2,J=C+1,X=I+1,Q=0,V=0,ie=new w;for(let pe=0;pe<X;pe++){let Re=pe*P-B;for(let Ze=0;Ze<J;Ze++){let xt=Ze*A-k;ie[x]=xt*E,ie[m]=Re*b,ie[d]=G,l.push(ie.x,ie.y,ie.z),ie[x]=0,ie[m]=0,ie[d]=R>0?1:-1,u.push(ie.x,ie.y,ie.z),h.push(Ze/C),h.push(1-pe/I),Q+=1}}for(let pe=0;pe<I;pe++)for(let Re=0;Re<C;Re++){let Ze=f+Re+J*pe,xt=f+Re+J*(pe+1),Y=f+(Re+1)+J*(pe+1),ne=f+(Re+1)+J*pe;c.push(Ze,xt,ne),c.push(xt,Y,ne),V+=6}a.addGroup(p,V,S),p+=V,f+=Q}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function _r(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function pn(i){let e={};for(let t=0;t<i.length;t++){let n=_r(i[t]);for(let s in n)e[s]=n[s]}return e}function m0(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Id(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:$e.workingColorSpace}var g0={clone:_r,merge:pn},x0=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,_0=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Qt=class extends mn{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=x0,this.fragmentShader=_0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=_r(e.uniforms),this.uniformsGroups=m0(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},Ia=class extends Rt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new we,this.projectionMatrix=new we,this.projectionMatrixInverse=new we,this.coordinateSystem=gi}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Wi=new w,yf=new Ue,Af=new Ue,Bt=class extends Ia{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=gr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(to*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return gr*2*Math.atan(Math.tan(to*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Wi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Wi.x,Wi.y).multiplyScalar(-e/Wi.z),Wi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Wi.x,Wi.y).multiplyScalar(-e/Wi.z)}getViewSize(e,t){return this.getViewBounds(e,yf,Af),t.subVectors(Af,yf)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(to*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*s/c,t-=o.offsetY*n/l,s*=o.width/c,n*=o.height/l}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Zs=-90,Ks=1,Fl=class extends Rt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Bt(Zs,Ks,e,t);s.layers=this.layers,this.add(s);let r=new Bt(Zs,Ks,e,t);r.layers=this.layers,this.add(r);let o=new Bt(Zs,Ks,e,t);o.layers=this.layers,this.add(o);let a=new Bt(Zs,Ks,e,t);a.layers=this.layers,this.add(a);let c=new Bt(Zs,Ks,e,t);c.layers=this.layers,this.add(c);let l=new Bt(Zs,Ks,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,c]=t;for(let l of t)this.remove(l);if(e===gi)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===ba)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,c,l,u]=this.children,h=e.getRenderTarget(),f=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,o),e.setRenderTarget(n,2,s),e.render(t,a),e.setRenderTarget(n,3,s),e.render(t,c),e.setRenderTarget(n,4,s),e.render(t,l),n.texture.generateMipmaps=x,e.setRenderTarget(n,5,s),e.render(t,u),e.setRenderTarget(h,f,p),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},Pa=class extends Ht{constructor(e,t,n,s,r,o,a,c,l,u){e=e!==void 0?e:[],t=t!==void 0?t:ur,super(e,t,n,s,r,o,a,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Bl=class extends yi{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Pa(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Kt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new ni(5,5,5),r=new Qt({name:"CubemapFromEquirect",uniforms:_r(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:ln,blending:Yi});r.uniforms.tEquirect.value=t;let o=new Te(s,r),a=t.minFilter;return t.minFilter===jn&&(t.minFilter=Kt),new Fl(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,s){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}},Hc=new w,v0=new w,y0=new Xe,pi=class{constructor(e=new w(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=Hc.subVectors(n,t).cross(v0.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Hc),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||y0.getNormalMatrix(e),s=this.coplanarPoint(Hc).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},ms=new Mn,ra=new w,uo=class{constructor(e=new pi,t=new pi,n=new pi,s=new pi,r=new pi,o=new pi){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=gi){let n=this.planes,s=e.elements,r=s[0],o=s[1],a=s[2],c=s[3],l=s[4],u=s[5],h=s[6],f=s[7],p=s[8],g=s[9],x=s[10],m=s[11],d=s[12],E=s[13],b=s[14],v=s[15];if(n[0].setComponents(c-r,f-l,m-p,v-d).normalize(),n[1].setComponents(c+r,f+l,m+p,v+d).normalize(),n[2].setComponents(c+o,f+u,m+g,v+E).normalize(),n[3].setComponents(c-o,f-u,m-g,v-E).normalize(),n[4].setComponents(c-a,f-h,m-x,v-b).normalize(),t===gi)n[5].setComponents(c+a,f+h,m+x,v+b).normalize();else if(t===ba)n[5].setComponents(a,h,x,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ms.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ms.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ms)}intersectsSprite(e){return ms.center.set(0,0,0),ms.radius=.7071067811865476,ms.applyMatrix4(e.matrixWorld),this.intersectsSphere(ms)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(ra.x=s.normal.x>0?e.max.x:e.min.x,ra.y=s.normal.y>0?e.max.y:e.min.y,ra.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(ra)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function Pd(){let i=null,e=!1,t=null,n=null;function s(r,o){t(r,o),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function A0(i){let e=new WeakMap;function t(a,c){let l=a.array,u=a.usage,h=l.byteLength,f=i.createBuffer();i.bindBuffer(c,f),i.bufferData(c,l,u),a.onUploadCallback();let p;if(l instanceof Float32Array)p=i.FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)p=i.SHORT;else if(l instanceof Uint32Array)p=i.UNSIGNED_INT;else if(l instanceof Int32Array)p=i.INT;else if(l instanceof Int8Array)p=i.BYTE;else if(l instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:f,type:p,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:h}}function n(a,c,l){let u=c.array,h=c.updateRanges;if(i.bindBuffer(l,a),h.length===0)i.bufferSubData(l,0,u);else{h.sort((p,g)=>p.start-g.start);let f=0;for(let p=1;p<h.length;p++){let g=h[f],x=h[p];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++f,h[f]=x)}h.length=f+1;for(let p=0,g=h.length;p<g;p++){let x=h[p];i.bufferSubData(l,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let c=e.get(a);c&&(i.deleteBuffer(c.buffer),e.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,a,c),l.version=a.version}}return{get:s,remove:r,update:o}}var Nt=class i extends $t{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(n),c=Math.floor(s),l=a+1,u=c+1,h=e/a,f=t/c,p=[],g=[],x=[],m=[];for(let d=0;d<u;d++){let E=d*f-o;for(let b=0;b<l;b++){let v=b*h-r;g.push(v,-E,0),x.push(0,0,1),m.push(b/a),m.push(1-d/c)}}for(let d=0;d<c;d++)for(let E=0;E<a;E++){let b=E+l*d,v=E+l*(d+1),N=E+1+l*(d+1),R=E+1+l*d;p.push(b,v,R),p.push(v,N,R)}this.setIndex(p),this.setAttribute("position",new Jt(g,3)),this.setAttribute("normal",new Jt(x,3)),this.setAttribute("uv",new Jt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},M0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,S0=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,b0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,E0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,T0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,w0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,R0=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,C0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,I0=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,P0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,L0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,D0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,U0=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,N0=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,O0=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,F0=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,B0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,z0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,H0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,k0=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,V0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,G0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,W0=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,X0=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,q0=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Y0=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Z0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,K0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,J0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,$0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,j0="gl_FragColor = linearToOutputTexel( gl_FragColor );",Q0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,eg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,tg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,ng=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,ig=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,sg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,rg=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,og=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,ag=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,cg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,lg=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,ug=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,hg=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,fg=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,dg=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,pg=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,mg=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,gg=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,xg=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,_g=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,vg=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,yg=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Ag=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Mg=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Sg=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,bg=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Eg=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Tg=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,wg=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Rg=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Cg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ig=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Pg=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Lg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Dg=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Ug=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Ng=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Og=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Fg=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Bg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,zg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Hg=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,kg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Vg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Gg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Wg=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Xg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,qg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Yg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Zg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Kg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Jg=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,$g=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,jg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Qg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,ex=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,tx=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,nx=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,ix=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,sx=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,rx=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,ox=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,ax=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,cx=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,lx=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,ux=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,hx=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,fx=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,dx=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,px=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,mx=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,gx=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,xx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,_x=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,vx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,yx=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Ax=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Mx=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Sx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,bx=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ex=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Tx=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,wx=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Rx=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Cx=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Ix=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Px=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Lx=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Dx=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ux=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Nx=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Ox=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Fx=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Bx=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,zx=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Hx=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,kx=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Vx=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Gx=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Wx=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Xx=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,qx=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Yx=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Zx=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Kx=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Jx=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,$x=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,jx=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Qx=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,e_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ve={alphahash_fragment:M0,alphahash_pars_fragment:S0,alphamap_fragment:b0,alphamap_pars_fragment:E0,alphatest_fragment:T0,alphatest_pars_fragment:w0,aomap_fragment:R0,aomap_pars_fragment:C0,batching_pars_vertex:I0,batching_vertex:P0,begin_vertex:L0,beginnormal_vertex:D0,bsdfs:U0,iridescence_fragment:N0,bumpmap_pars_fragment:O0,clipping_planes_fragment:F0,clipping_planes_pars_fragment:B0,clipping_planes_pars_vertex:z0,clipping_planes_vertex:H0,color_fragment:k0,color_pars_fragment:V0,color_pars_vertex:G0,color_vertex:W0,common:X0,cube_uv_reflection_fragment:q0,defaultnormal_vertex:Y0,displacementmap_pars_vertex:Z0,displacementmap_vertex:K0,emissivemap_fragment:J0,emissivemap_pars_fragment:$0,colorspace_fragment:j0,colorspace_pars_fragment:Q0,envmap_fragment:eg,envmap_common_pars_fragment:tg,envmap_pars_fragment:ng,envmap_pars_vertex:ig,envmap_physical_pars_fragment:pg,envmap_vertex:sg,fog_vertex:rg,fog_pars_vertex:og,fog_fragment:ag,fog_pars_fragment:cg,gradientmap_pars_fragment:lg,lightmap_pars_fragment:ug,lights_lambert_fragment:hg,lights_lambert_pars_fragment:fg,lights_pars_begin:dg,lights_toon_fragment:mg,lights_toon_pars_fragment:gg,lights_phong_fragment:xg,lights_phong_pars_fragment:_g,lights_physical_fragment:vg,lights_physical_pars_fragment:yg,lights_fragment_begin:Ag,lights_fragment_maps:Mg,lights_fragment_end:Sg,logdepthbuf_fragment:bg,logdepthbuf_pars_fragment:Eg,logdepthbuf_pars_vertex:Tg,logdepthbuf_vertex:wg,map_fragment:Rg,map_pars_fragment:Cg,map_particle_fragment:Ig,map_particle_pars_fragment:Pg,metalnessmap_fragment:Lg,metalnessmap_pars_fragment:Dg,morphinstance_vertex:Ug,morphcolor_vertex:Ng,morphnormal_vertex:Og,morphtarget_pars_vertex:Fg,morphtarget_vertex:Bg,normal_fragment_begin:zg,normal_fragment_maps:Hg,normal_pars_fragment:kg,normal_pars_vertex:Vg,normal_vertex:Gg,normalmap_pars_fragment:Wg,clearcoat_normal_fragment_begin:Xg,clearcoat_normal_fragment_maps:qg,clearcoat_pars_fragment:Yg,iridescence_pars_fragment:Zg,opaque_fragment:Kg,packing:Jg,premultiplied_alpha_fragment:$g,project_vertex:jg,dithering_fragment:Qg,dithering_pars_fragment:ex,roughnessmap_fragment:tx,roughnessmap_pars_fragment:nx,shadowmap_pars_fragment:ix,shadowmap_pars_vertex:sx,shadowmap_vertex:rx,shadowmask_pars_fragment:ox,skinbase_vertex:ax,skinning_pars_vertex:cx,skinning_vertex:lx,skinnormal_vertex:ux,specularmap_fragment:hx,specularmap_pars_fragment:fx,tonemapping_fragment:dx,tonemapping_pars_fragment:px,transmission_fragment:mx,transmission_pars_fragment:gx,uv_pars_fragment:xx,uv_pars_vertex:_x,uv_vertex:vx,worldpos_vertex:yx,background_vert:Ax,background_frag:Mx,backgroundCube_vert:Sx,backgroundCube_frag:bx,cube_vert:Ex,cube_frag:Tx,depth_vert:wx,depth_frag:Rx,distanceRGBA_vert:Cx,distanceRGBA_frag:Ix,equirect_vert:Px,equirect_frag:Lx,linedashed_vert:Dx,linedashed_frag:Ux,meshbasic_vert:Nx,meshbasic_frag:Ox,meshlambert_vert:Fx,meshlambert_frag:Bx,meshmatcap_vert:zx,meshmatcap_frag:Hx,meshnormal_vert:kx,meshnormal_frag:Vx,meshphong_vert:Gx,meshphong_frag:Wx,meshphysical_vert:Xx,meshphysical_frag:qx,meshtoon_vert:Yx,meshtoon_frag:Zx,points_vert:Kx,points_frag:Jx,shadow_vert:$x,shadow_frag:jx,sprite_vert:Qx,sprite_frag:e_},se={common:{diffuse:{value:new Ee(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Xe},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Xe}},envmap:{envMap:{value:null},envMapRotation:{value:new Xe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Xe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Xe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Xe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Xe},normalScale:{value:new Ue(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Xe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Xe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Xe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Xe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ee(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ee(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0},uvTransform:{value:new Xe}},sprite:{diffuse:{value:new Ee(16777215)},opacity:{value:1},center:{value:new Ue(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Xe},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0}}},$n={basic:{uniforms:pn([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.fog]),vertexShader:Ve.meshbasic_vert,fragmentShader:Ve.meshbasic_frag},lambert:{uniforms:pn([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.fog,se.lights,{emissive:{value:new Ee(0)}}]),vertexShader:Ve.meshlambert_vert,fragmentShader:Ve.meshlambert_frag},phong:{uniforms:pn([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.fog,se.lights,{emissive:{value:new Ee(0)},specular:{value:new Ee(1118481)},shininess:{value:30}}]),vertexShader:Ve.meshphong_vert,fragmentShader:Ve.meshphong_frag},standard:{uniforms:pn([se.common,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.roughnessmap,se.metalnessmap,se.fog,se.lights,{emissive:{value:new Ee(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ve.meshphysical_vert,fragmentShader:Ve.meshphysical_frag},toon:{uniforms:pn([se.common,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.gradientmap,se.fog,se.lights,{emissive:{value:new Ee(0)}}]),vertexShader:Ve.meshtoon_vert,fragmentShader:Ve.meshtoon_frag},matcap:{uniforms:pn([se.common,se.bumpmap,se.normalmap,se.displacementmap,se.fog,{matcap:{value:null}}]),vertexShader:Ve.meshmatcap_vert,fragmentShader:Ve.meshmatcap_frag},points:{uniforms:pn([se.points,se.fog]),vertexShader:Ve.points_vert,fragmentShader:Ve.points_frag},dashed:{uniforms:pn([se.common,se.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ve.linedashed_vert,fragmentShader:Ve.linedashed_frag},depth:{uniforms:pn([se.common,se.displacementmap]),vertexShader:Ve.depth_vert,fragmentShader:Ve.depth_frag},normal:{uniforms:pn([se.common,se.bumpmap,se.normalmap,se.displacementmap,{opacity:{value:1}}]),vertexShader:Ve.meshnormal_vert,fragmentShader:Ve.meshnormal_frag},sprite:{uniforms:pn([se.sprite,se.fog]),vertexShader:Ve.sprite_vert,fragmentShader:Ve.sprite_frag},background:{uniforms:{uvTransform:{value:new Xe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ve.background_vert,fragmentShader:Ve.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Xe}},vertexShader:Ve.backgroundCube_vert,fragmentShader:Ve.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ve.cube_vert,fragmentShader:Ve.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ve.equirect_vert,fragmentShader:Ve.equirect_frag},distanceRGBA:{uniforms:pn([se.common,se.displacementmap,{referencePosition:{value:new w},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ve.distanceRGBA_vert,fragmentShader:Ve.distanceRGBA_frag},shadow:{uniforms:pn([se.lights,se.fog,{color:{value:new Ee(0)},opacity:{value:1}}]),vertexShader:Ve.shadow_vert,fragmentShader:Ve.shadow_frag}};$n.physical={uniforms:pn([$n.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Xe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Xe},clearcoatNormalScale:{value:new Ue(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Xe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Xe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Xe},sheen:{value:0},sheenColor:{value:new Ee(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Xe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Xe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Xe},transmissionSamplerSize:{value:new Ue},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Xe},attenuationDistance:{value:0},attenuationColor:{value:new Ee(0)},specularColor:{value:new Ee(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Xe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Xe},anisotropyVector:{value:new Ue},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Xe}}]),vertexShader:Ve.meshphysical_vert,fragmentShader:Ve.meshphysical_frag};var oa={r:0,b:0,g:0},gs=new ti,t_=new we;function n_(i,e,t,n,s,r,o){let a=new Ee(0),c=r===!0?0:1,l,u,h=null,f=0,p=null;function g(E){let b=E.isScene===!0?E.background:null;return b&&b.isTexture&&(b=(E.backgroundBlurriness>0?t:e).get(b)),b}function x(E){let b=!1,v=g(E);v===null?d(a,c):v&&v.isColor&&(d(v,1),b=!0);let N=i.xr.getEnvironmentBlendMode();N==="additive"?n.buffers.color.setClear(0,0,0,1,o):N==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||b)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(E,b){let v=g(b);v&&(v.isCubeTexture||v.mapping===Za)?(u===void 0&&(u=new Te(new ni(1,1,1),new Qt({name:"BackgroundCubeMaterial",uniforms:_r($n.backgroundCube.uniforms),vertexShader:$n.backgroundCube.vertexShader,fragmentShader:$n.backgroundCube.fragmentShader,side:ln,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(N,R,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),gs.copy(b.backgroundRotation),gs.x*=-1,gs.y*=-1,gs.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(gs.y*=-1,gs.z*=-1),u.material.uniforms.envMap.value=v,u.material.uniforms.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(t_.makeRotationFromEuler(gs)),u.material.toneMapped=$e.getTransfer(v.colorSpace)!==pt,(h!==v||f!==v.version||p!==i.toneMapping)&&(u.material.needsUpdate=!0,h=v,f=v.version,p=i.toneMapping),u.layers.enableAll(),E.unshift(u,u.geometry,u.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new Te(new Nt(2,2),new Qt({name:"BackgroundMaterial",uniforms:_r($n.background.uniforms),vertexShader:$n.background.vertexShader,fragmentShader:$n.background.fragmentShader,side:Qn,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,l.material.toneMapped=$e.getTransfer(v.colorSpace)!==pt,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),(h!==v||f!==v.version||p!==i.toneMapping)&&(l.material.needsUpdate=!0,h=v,f=v.version,p=i.toneMapping),l.layers.enableAll(),E.unshift(l,l.geometry,l.material,0,0,null))}function d(E,b){E.getRGB(oa,Id(i)),n.buffers.color.setClear(oa.r,oa.g,oa.b,b,o)}return{getClearColor:function(){return a},setClearColor:function(E,b=1){a.set(E),c=b,d(a,c)},getClearAlpha:function(){return c},setClearAlpha:function(E){c=E,d(a,c)},render:x,addToRenderList:m}}function i_(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null),r=s,o=!1;function a(A,P,k,B,G){let J=!1,X=h(B,k,P);r!==X&&(r=X,l(r.object)),J=p(A,B,k,G),J&&g(A,B,k,G),G!==null&&e.update(G,i.ELEMENT_ARRAY_BUFFER),(J||o)&&(o=!1,v(A,P,k,B),G!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(G).buffer))}function c(){return i.createVertexArray()}function l(A){return i.bindVertexArray(A)}function u(A){return i.deleteVertexArray(A)}function h(A,P,k){let B=k.wireframe===!0,G=n[A.id];G===void 0&&(G={},n[A.id]=G);let J=G[P.id];J===void 0&&(J={},G[P.id]=J);let X=J[B];return X===void 0&&(X=f(c()),J[B]=X),X}function f(A){let P=[],k=[],B=[];for(let G=0;G<t;G++)P[G]=0,k[G]=0,B[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:k,attributeDivisors:B,object:A,attributes:{},index:null}}function p(A,P,k,B){let G=r.attributes,J=P.attributes,X=0,Q=k.getAttributes();for(let V in Q)if(Q[V].location>=0){let pe=G[V],Re=J[V];if(Re===void 0&&(V==="instanceMatrix"&&A.instanceMatrix&&(Re=A.instanceMatrix),V==="instanceColor"&&A.instanceColor&&(Re=A.instanceColor)),pe===void 0||pe.attribute!==Re||Re&&pe.data!==Re.data)return!0;X++}return r.attributesNum!==X||r.index!==B}function g(A,P,k,B){let G={},J=P.attributes,X=0,Q=k.getAttributes();for(let V in Q)if(Q[V].location>=0){let pe=J[V];pe===void 0&&(V==="instanceMatrix"&&A.instanceMatrix&&(pe=A.instanceMatrix),V==="instanceColor"&&A.instanceColor&&(pe=A.instanceColor));let Re={};Re.attribute=pe,pe&&pe.data&&(Re.data=pe.data),G[V]=Re,X++}r.attributes=G,r.attributesNum=X,r.index=B}function x(){let A=r.newAttributes;for(let P=0,k=A.length;P<k;P++)A[P]=0}function m(A){d(A,0)}function d(A,P){let k=r.newAttributes,B=r.enabledAttributes,G=r.attributeDivisors;k[A]=1,B[A]===0&&(i.enableVertexAttribArray(A),B[A]=1),G[A]!==P&&(i.vertexAttribDivisor(A,P),G[A]=P)}function E(){let A=r.newAttributes,P=r.enabledAttributes;for(let k=0,B=P.length;k<B;k++)P[k]!==A[k]&&(i.disableVertexAttribArray(k),P[k]=0)}function b(A,P,k,B,G,J,X){X===!0?i.vertexAttribIPointer(A,P,k,G,J):i.vertexAttribPointer(A,P,k,B,G,J)}function v(A,P,k,B){x();let G=B.attributes,J=k.getAttributes(),X=P.defaultAttributeValues;for(let Q in J){let V=J[Q];if(V.location>=0){let ie=G[Q];if(ie===void 0&&(Q==="instanceMatrix"&&A.instanceMatrix&&(ie=A.instanceMatrix),Q==="instanceColor"&&A.instanceColor&&(ie=A.instanceColor)),ie!==void 0){let pe=ie.normalized,Re=ie.itemSize,Ze=e.get(ie);if(Ze===void 0)continue;let xt=Ze.buffer,Y=Ze.type,ne=Ze.bytesPerElement,Ae=Y===i.INT||Y===i.UNSIGNED_INT||ie.gpuType===pu;if(ie.isInterleavedBufferAttribute){let ce=ie.data,Oe=ce.stride,ke=ie.offset;if(ce.isInstancedInterleavedBuffer){for(let Ke=0;Ke<V.locationSize;Ke++)d(V.location+Ke,ce.meshPerAttribute);A.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=ce.meshPerAttribute*ce.count)}else for(let Ke=0;Ke<V.locationSize;Ke++)m(V.location+Ke);i.bindBuffer(i.ARRAY_BUFFER,xt);for(let Ke=0;Ke<V.locationSize;Ke++)b(V.location+Ke,Re/V.locationSize,Y,pe,Oe*ne,(ke+Re/V.locationSize*Ke)*ne,Ae)}else{if(ie.isInstancedBufferAttribute){for(let ce=0;ce<V.locationSize;ce++)d(V.location+ce,ie.meshPerAttribute);A.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=ie.meshPerAttribute*ie.count)}else for(let ce=0;ce<V.locationSize;ce++)m(V.location+ce);i.bindBuffer(i.ARRAY_BUFFER,xt);for(let ce=0;ce<V.locationSize;ce++)b(V.location+ce,Re/V.locationSize,Y,pe,Re*ne,Re/V.locationSize*ce*ne,Ae)}}else if(X!==void 0){let pe=X[Q];if(pe!==void 0)switch(pe.length){case 2:i.vertexAttrib2fv(V.location,pe);break;case 3:i.vertexAttrib3fv(V.location,pe);break;case 4:i.vertexAttrib4fv(V.location,pe);break;default:i.vertexAttrib1fv(V.location,pe)}}}}E()}function N(){I();for(let A in n){let P=n[A];for(let k in P){let B=P[k];for(let G in B)u(B[G].object),delete B[G];delete P[k]}delete n[A]}}function R(A){if(n[A.id]===void 0)return;let P=n[A.id];for(let k in P){let B=P[k];for(let G in B)u(B[G].object),delete B[G];delete P[k]}delete n[A.id]}function C(A){for(let P in n){let k=n[P];if(k[A.id]===void 0)continue;let B=k[A.id];for(let G in B)u(B[G].object),delete B[G];delete k[A.id]}}function I(){S(),o=!0,r!==s&&(r=s,l(r.object))}function S(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:I,resetDefaultState:S,dispose:N,releaseStatesOfGeometry:R,releaseStatesOfProgram:C,initAttributes:x,enableAttribute:m,disableUnusedAttributes:E}}function s_(i,e,t){let n;function s(l){n=l}function r(l,u){i.drawArrays(n,l,u),t.update(u,n,1)}function o(l,u,h){h!==0&&(i.drawArraysInstanced(n,l,u,h),t.update(u,n,h))}function a(l,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,u,0,h);let p=0;for(let g=0;g<h;g++)p+=u[g];t.update(p,n,1)}function c(l,u,h,f){if(h===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<l.length;g++)o(l[g],u[g],f[g]);else{p.multiDrawArraysInstancedWEBGL(n,l,0,u,0,f,0,h);let g=0;for(let x=0;x<h;x++)g+=u[x]*f[x];t.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=c}function r_(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let C=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(C){return!(C!==Cn&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(C){let I=C===Mo&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(C!==_i&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==Vn&&!I)}function c(C){if(C==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",u=c(l);u!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);let h=t.logarithmicDepthBuffer===!0,f=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),E=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),b=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),N=g>0,R=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:h,reverseDepthBuffer:f,maxTextures:p,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:E,maxVaryings:b,maxFragmentUniforms:v,vertexTextures:N,maxSamples:R}}function o_(i){let e=this,t=null,n=0,s=!1,r=!1,o=new pi,a=new Xe,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){let p=h.length!==0||f||n!==0||s;return s=f,n=h.length,p},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,f){t=u(h,f,0)},this.setState=function(h,f,p){let g=h.clippingPlanes,x=h.clipIntersection,m=h.clipShadows,d=i.get(h);if(!s||g===null||g.length===0||r&&!m)r?u(null):l();else{let E=r?0:n,b=E*4,v=d.clippingState||null;c.value=v,v=u(g,f,b,p);for(let N=0;N!==b;++N)v[N]=t[N];d.clippingState=v,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=E}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,f,p,g){let x=h!==null?h.length:0,m=null;if(x!==0){if(m=c.value,g!==!0||m===null){let d=p+x*4,E=f.matrixWorldInverse;a.getNormalMatrix(E),(m===null||m.length<d)&&(m=new Float32Array(d));for(let b=0,v=p;b!==x;++b,v+=4)o.copy(h[b]).applyMatrix4(E,a),o.normal.toArray(m,v),m[v+3]=o.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}function a_(i){let e=new WeakMap;function t(o,a){return a===rl?o.mapping=ur:a===ol&&(o.mapping=hr),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===rl||a===ol)if(e.has(o)){let c=e.get(o).texture;return t(c,o.mapping)}else{let c=o.image;if(c&&c.height>0){let l=new Bl(c.height);return l.fromEquirectangularTexture(i,o),e.set(o,l),o.addEventListener("dispose",s),t(l.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let c=e.get(a);c!==void 0&&(e.delete(a),c.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}var Ji=class extends Ia{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,o=n+e,a=s+t,c=s-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=u*this.view.offsetY,c=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},rr=4,Mf=[.125,.215,.35,.446,.526,.582],ys=20,kc=new Ji,Sf=new Ee,Vc=null,Gc=0,Wc=0,Xc=!1,_s=(1+Math.sqrt(5))/2,Js=1/_s,bf=[new w(-_s,Js,0),new w(_s,Js,0),new w(-Js,0,_s),new w(Js,0,_s),new w(0,_s,-Js),new w(0,_s,Js),new w(-1,1,-1),new w(1,1,-1),new w(-1,1,1),new w(1,1,1)],Ss=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100){Vc=this._renderer.getRenderTarget(),Gc=this._renderer.getActiveCubeFace(),Wc=this._renderer.getActiveMipmapLevel(),Xc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,n,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=wf(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Tf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Vc,Gc,Wc),this._renderer.xr.enabled=Xc,e.scissorTest=!1,aa(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ur||e.mapping===hr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Vc=this._renderer.getRenderTarget(),Gc=this._renderer.getActiveCubeFace(),Wc=this._renderer.getActiveMipmapLevel(),Xc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Kt,minFilter:Kt,generateMipmaps:!1,type:Mo,format:Cn,colorSpace:un,depthBuffer:!1},s=Ef(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Ef(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=c_(r)),this._blurMaterial=l_(r,e,t)}return s}_compileMaterial(e){let t=new Te(this._lodPlanes[0],e);this._renderer.compile(t,kc)}_sceneToCubeUV(e,t,n,s){let a=new Bt(90,1,t,n),c=[1,-1,1,1,1,1],l=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,f=u.toneMapping;u.getClearColor(Sf),u.toneMapping=Ki,u.autoClear=!1;let p=new It({name:"PMREM.Background",side:ln,depthWrite:!1,depthTest:!1}),g=new Te(new ni,p),x=!1,m=e.background;m?m.isColor&&(p.color.copy(m),e.background=null,x=!0):(p.color.copy(Sf),x=!0);for(let d=0;d<6;d++){let E=d%3;E===0?(a.up.set(0,c[d],0),a.lookAt(l[d],0,0)):E===1?(a.up.set(0,0,c[d]),a.lookAt(0,l[d],0)):(a.up.set(0,c[d],0),a.lookAt(0,0,l[d]));let b=this._cubeSize;aa(s,E*b,d>2?b:0,b,b),u.setRenderTarget(s),x&&u.render(g,a),u.render(e,a)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=f,u.autoClear=h,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===ur||e.mapping===hr;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=wf()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Tf());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new Te(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;let c=this._cubeSize;aa(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(o,kc)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=bf[(s-r-1)%bf.length];this._blur(e,r-1,r,o,a)}t.autoClear=n}_blur(e,t,n,s,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,s,"latitudinal",r),this._halfBlur(o,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,o,a){let c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new Te(this._lodPlanes[s],l),f=l.uniforms,p=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*ys-1),x=r/g,m=isFinite(r)?1+Math.floor(u*x):ys;m>ys&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ys}`);let d=[],E=0;for(let C=0;C<ys;++C){let I=C/x,S=Math.exp(-I*I/2);d.push(S),C===0?E+=S:C<m&&(E+=2*S)}for(let C=0;C<d.length;C++)d[C]=d[C]/E;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=d,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);let{_lodMax:b}=this;f.dTheta.value=g,f.mipInt.value=b-n;let v=this._sizeLods[s],N=3*v*(s>b-rr?s-b+rr:0),R=4*(this._cubeSize-v);aa(t,N,R,3*v,2*v),c.setRenderTarget(t),c.render(h,kc)}};function c_(i){let e=[],t=[],n=[],s=i,r=i-rr+1+Mf.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);t.push(a);let c=1/a;o>i-rr?c=Mf[o-i+rr-1]:o===0&&(c=0),n.push(c);let l=1/(a-2),u=-l,h=1+l,f=[u,u,h,u,h,h,u,u,h,h,u,h],p=6,g=6,x=3,m=2,d=1,E=new Float32Array(x*g*p),b=new Float32Array(m*g*p),v=new Float32Array(d*g*p);for(let R=0;R<p;R++){let C=R%3*2/3-1,I=R>2?0:-1,S=[C,I,0,C+2/3,I,0,C+2/3,I+1,0,C,I,0,C+2/3,I+1,0,C,I+1,0];E.set(S,x*g*R),b.set(f,m*g*R);let A=[R,R,R,R,R,R];v.set(A,d*g*R)}let N=new $t;N.setAttribute("position",new wt(E,x)),N.setAttribute("uv",new wt(b,m)),N.setAttribute("faceIndex",new wt(v,d)),e.push(N),s>rr&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Ef(i,e,t){let n=new yi(i,e,t);return n.texture.mapping=Za,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function aa(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function l_(i,e,t){let n=new Float32Array(ys),s=new w(0,1,0);return new Qt({name:"SphericalGaussianBlur",defines:{n:ys,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Su(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Yi,depthTest:!1,depthWrite:!1})}function Tf(){return new Qt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Su(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Yi,depthTest:!1,depthWrite:!1})}function wf(){return new Qt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Su(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Yi,depthTest:!1,depthWrite:!1})}function Su(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function u_(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){let c=a.mapping,l=c===rl||c===ol,u=c===ur||c===hr;if(l||u){let h=e.get(a),f=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==f)return t===null&&(t=new Ss(i)),h=l?t.fromEquirectangular(a,h):t.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),h.texture;if(h!==void 0)return h.texture;{let p=a.image;return l&&p&&p.height>0||u&&p&&s(p)?(t===null&&(t=new Ss(i)),h=l?t.fromEquirectangular(a):t.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),a.addEventListener("dispose",r),h.texture):null}}}return a}function s(a){let c=0,l=6;for(let u=0;u<l;u++)a[u]!==void 0&&c++;return c===l}function r(a){let c=a.target;c.removeEventListener("dispose",r);let l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function h_(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&jr("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function f_(i,e,t,n){let s={},r=new WeakMap;function o(h){let f=h.target;f.index!==null&&e.remove(f.index);for(let g in f.attributes)e.remove(f.attributes[g]);for(let g in f.morphAttributes){let x=f.morphAttributes[g];for(let m=0,d=x.length;m<d;m++)e.remove(x[m])}f.removeEventListener("dispose",o),delete s[f.id];let p=r.get(f);p&&(e.remove(p),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(h,f){return s[f.id]===!0||(f.addEventListener("dispose",o),s[f.id]=!0,t.memory.geometries++),f}function c(h){let f=h.attributes;for(let g in f)e.update(f[g],i.ARRAY_BUFFER);let p=h.morphAttributes;for(let g in p){let x=p[g];for(let m=0,d=x.length;m<d;m++)e.update(x[m],i.ARRAY_BUFFER)}}function l(h){let f=[],p=h.index,g=h.attributes.position,x=0;if(p!==null){let E=p.array;x=p.version;for(let b=0,v=E.length;b<v;b+=3){let N=E[b+0],R=E[b+1],C=E[b+2];f.push(N,R,R,C,C,N)}}else if(g!==void 0){let E=g.array;x=g.version;for(let b=0,v=E.length/3-1;b<v;b+=3){let N=b+0,R=b+1,C=b+2;f.push(N,R,R,C,C,N)}}else return;let m=new(Rd(f)?Ca:Ra)(f,1);m.version=x;let d=r.get(h);d&&e.remove(d),r.set(h,m)}function u(h){let f=r.get(h);if(f){let p=h.index;p!==null&&f.version<p.version&&l(h)}else l(h);return r.get(h)}return{get:a,update:c,getWireframeAttribute:u}}function d_(i,e,t){let n;function s(f){n=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function c(f,p){i.drawElements(n,p,r,f*o),t.update(p,n,1)}function l(f,p,g){g!==0&&(i.drawElementsInstanced(n,p,r,f*o,g),t.update(p,n,g))}function u(f,p,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,f,0,g);let m=0;for(let d=0;d<g;d++)m+=p[d];t.update(m,n,1)}function h(f,p,g,x){if(g===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<f.length;d++)l(f[d]/o,p[d],x[d]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,r,f,0,x,0,g);let d=0;for(let E=0;E<g;E++)d+=p[E]*x[E];t.update(d,n,1)}}this.setMode=s,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function p_(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function m_(i,e,t){let n=new WeakMap,s=new ze;function r(o,a,c){let l=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0,f=n.get(a);if(f===void 0||f.count!==h){let S=function(){C.dispose(),n.delete(a),a.removeEventListener("dispose",S)};f!==void 0&&f.texture.dispose();let p=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],d=a.morphAttributes.normal||[],E=a.morphAttributes.color||[],b=0;p===!0&&(b=1),g===!0&&(b=2),x===!0&&(b=3);let v=a.attributes.position.count*b,N=1;v>e.maxTextureSize&&(N=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let R=new Float32Array(v*N*4*h),C=new Ta(R,v,N,h);C.type=Vn,C.needsUpdate=!0;let I=b*4;for(let A=0;A<h;A++){let P=m[A],k=d[A],B=E[A],G=v*N*4*A;for(let J=0;J<P.count;J++){let X=J*I;p===!0&&(s.fromBufferAttribute(P,J),R[G+X+0]=s.x,R[G+X+1]=s.y,R[G+X+2]=s.z,R[G+X+3]=0),g===!0&&(s.fromBufferAttribute(k,J),R[G+X+4]=s.x,R[G+X+5]=s.y,R[G+X+6]=s.z,R[G+X+7]=0),x===!0&&(s.fromBufferAttribute(B,J),R[G+X+8]=s.x,R[G+X+9]=s.y,R[G+X+10]=s.z,R[G+X+11]=B.itemSize===4?s.w:1)}}f={count:h,texture:C,size:new Ue(v,N)},n.set(a,f),a.addEventListener("dispose",S)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let p=0;for(let x=0;x<l.length;x++)p+=l[x];let g=a.morphTargetsRelative?1:1-p;c.getUniforms().setValue(i,"morphTargetBaseInfluence",g),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",f.texture,t),c.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function g_(i,e,t,n){let s=new WeakMap;function r(c){let l=n.render.frame,u=c.geometry,h=e.get(c,u);if(s.get(h)!==l&&(e.update(h),s.set(h,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",a)===!1&&c.addEventListener("dispose",a),s.get(c)!==l&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),s.set(c,l))),c.isSkinnedMesh){let f=c.skeleton;s.get(f)!==l&&(f.update(),s.set(f,l))}return h}function o(){s=new WeakMap}function a(c){let l=c.target;l.removeEventListener("dispose",a),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:r,dispose:o}}var La=class extends Ht{constructor(e,t,n,s,r,o,a,c,l,u=or){if(u!==or&&u!==dr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===or&&(n=Ms),n===void 0&&u===dr&&(n=fr),super(null,s,r,o,a,c,u,n,l),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:zt,this.minFilter=c!==void 0?c:zt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Ld=new Ht,Rf=new La(1,1),Dd=new Ta,Ud=new Ol,Nd=new Pa,Cf=[],If=[],Pf=new Float32Array(16),Lf=new Float32Array(9),Df=new Float32Array(4);function Er(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=Cf[s];if(r===void 0&&(r=new Float32Array(s),Cf[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function kt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Vt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function $a(i,e){let t=If[e];t===void 0&&(t=new Int32Array(e),If[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function x_(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function __(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(kt(t,e))return;i.uniform2fv(this.addr,e),Vt(t,e)}}function v_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(kt(t,e))return;i.uniform3fv(this.addr,e),Vt(t,e)}}function y_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(kt(t,e))return;i.uniform4fv(this.addr,e),Vt(t,e)}}function A_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(kt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Vt(t,e)}else{if(kt(t,n))return;Df.set(n),i.uniformMatrix2fv(this.addr,!1,Df),Vt(t,n)}}function M_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(kt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Vt(t,e)}else{if(kt(t,n))return;Lf.set(n),i.uniformMatrix3fv(this.addr,!1,Lf),Vt(t,n)}}function S_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(kt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Vt(t,e)}else{if(kt(t,n))return;Pf.set(n),i.uniformMatrix4fv(this.addr,!1,Pf),Vt(t,n)}}function b_(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function E_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(kt(t,e))return;i.uniform2iv(this.addr,e),Vt(t,e)}}function T_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(kt(t,e))return;i.uniform3iv(this.addr,e),Vt(t,e)}}function w_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(kt(t,e))return;i.uniform4iv(this.addr,e),Vt(t,e)}}function R_(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function C_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(kt(t,e))return;i.uniform2uiv(this.addr,e),Vt(t,e)}}function I_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(kt(t,e))return;i.uniform3uiv(this.addr,e),Vt(t,e)}}function P_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(kt(t,e))return;i.uniform4uiv(this.addr,e),Vt(t,e)}}function L_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Rf.compareFunction=Td,r=Rf):r=Ld,t.setTexture2D(e||r,s)}function D_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Ud,s)}function U_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Nd,s)}function N_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Dd,s)}function O_(i){switch(i){case 5126:return x_;case 35664:return __;case 35665:return v_;case 35666:return y_;case 35674:return A_;case 35675:return M_;case 35676:return S_;case 5124:case 35670:return b_;case 35667:case 35671:return E_;case 35668:case 35672:return T_;case 35669:case 35673:return w_;case 5125:return R_;case 36294:return C_;case 36295:return I_;case 36296:return P_;case 35678:case 36198:case 36298:case 36306:case 35682:return L_;case 35679:case 36299:case 36307:return D_;case 35680:case 36300:case 36308:case 36293:return U_;case 36289:case 36303:case 36311:case 36292:return N_}}function F_(i,e){i.uniform1fv(this.addr,e)}function B_(i,e){let t=Er(e,this.size,2);i.uniform2fv(this.addr,t)}function z_(i,e){let t=Er(e,this.size,3);i.uniform3fv(this.addr,t)}function H_(i,e){let t=Er(e,this.size,4);i.uniform4fv(this.addr,t)}function k_(i,e){let t=Er(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function V_(i,e){let t=Er(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function G_(i,e){let t=Er(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function W_(i,e){i.uniform1iv(this.addr,e)}function X_(i,e){i.uniform2iv(this.addr,e)}function q_(i,e){i.uniform3iv(this.addr,e)}function Y_(i,e){i.uniform4iv(this.addr,e)}function Z_(i,e){i.uniform1uiv(this.addr,e)}function K_(i,e){i.uniform2uiv(this.addr,e)}function J_(i,e){i.uniform3uiv(this.addr,e)}function $_(i,e){i.uniform4uiv(this.addr,e)}function j_(i,e,t){let n=this.cache,s=e.length,r=$a(t,s);kt(n,r)||(i.uniform1iv(this.addr,r),Vt(n,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||Ld,r[o])}function Q_(i,e,t){let n=this.cache,s=e.length,r=$a(t,s);kt(n,r)||(i.uniform1iv(this.addr,r),Vt(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Ud,r[o])}function ev(i,e,t){let n=this.cache,s=e.length,r=$a(t,s);kt(n,r)||(i.uniform1iv(this.addr,r),Vt(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||Nd,r[o])}function tv(i,e,t){let n=this.cache,s=e.length,r=$a(t,s);kt(n,r)||(i.uniform1iv(this.addr,r),Vt(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Dd,r[o])}function nv(i){switch(i){case 5126:return F_;case 35664:return B_;case 35665:return z_;case 35666:return H_;case 35674:return k_;case 35675:return V_;case 35676:return G_;case 5124:case 35670:return W_;case 35667:case 35671:return X_;case 35668:case 35672:return q_;case 35669:case 35673:return Y_;case 5125:return Z_;case 36294:return K_;case 36295:return J_;case 36296:return $_;case 35678:case 36198:case 36298:case 36306:case 35682:return j_;case 35679:case 36299:case 36307:return Q_;case 35680:case 36300:case 36308:case 36293:return ev;case 36289:case 36303:case 36311:case 36292:return tv}}var zl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=O_(t.type)}},Hl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=nv(t.type)}},kl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],n)}}},qc=/(\w+)(\])?(\[|\.)?/g;function Uf(i,e){i.seq.push(e),i.map[e.id]=e}function iv(i,e,t){let n=i.name,s=n.length;for(qc.lastIndex=0;;){let r=qc.exec(n),o=qc.lastIndex,a=r[1],c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===s){Uf(t,l===void 0?new zl(a,i,e):new Hl(a,i,e));break}else{let h=t.map[a];h===void 0&&(h=new kl(a),Uf(t,h)),t=h}}}var cr=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);iv(r,o,this)}}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],c=n[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&n.push(o)}return n}};function Nf(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var sv=37297,rv=0;function ov(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var Of=new Xe;function av(i){$e._getMatrix(Of,$e.workingColorSpace,i);let e=`mat3( ${Of.elements.map(t=>t.toFixed(4))} )`;switch($e.getTransfer(i)){case Ja:return[e,"LinearTransferOETF"];case pt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Ff(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),s=i.getShaderInfoLog(e).trim();if(n&&s==="")return"";let r=/ERROR: 0:(\d+)/.exec(s);if(r){let o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+ov(i.getShaderSource(e),o)}else return s}function cv(i,e){let t=av(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function lv(i,e){let t;switch(e){case _m:t="Linear";break;case vm:t="Reinhard";break;case ym:t="Cineon";break;case fu:t="ACESFilmic";break;case Mm:t="AgX";break;case Sm:t="Neutral";break;case Am:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var ca=new w;function uv(){$e.getLuminanceCoefficients(ca);let i=ca.x.toFixed(4),e=ca.y.toFixed(4),t=ca.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function hv(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Qr).join(`
`)}function fv(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function dv(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function Qr(i){return i!==""}function Bf(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function zf(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var pv=/^[ \t]*#include +<([\w\d./]+)>/gm;function Vl(i){return i.replace(pv,gv)}var mv=new Map;function gv(i,e){let t=Ve[e];if(t===void 0){let n=mv.get(e);if(n!==void 0)t=Ve[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Vl(t)}var xv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Hf(i){return i.replace(xv,_v)}function _v(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function kf(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function vv(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===hd?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===uu?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===di&&(e="SHADOWMAP_TYPE_VSM"),e}function yv(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case ur:case hr:e="ENVMAP_TYPE_CUBE";break;case Za:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Av(i){let e="ENVMAP_MODE_REFLECTION";return i.envMap&&i.envMapMode===hr&&(e="ENVMAP_MODE_REFRACTION"),e}function Mv(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case fd:e="ENVMAP_BLENDING_MULTIPLY";break;case gm:e="ENVMAP_BLENDING_MIX";break;case xm:e="ENVMAP_BLENDING_ADD";break}return e}function Sv(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function bv(i,e,t,n){let s=i.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,c=vv(t),l=yv(t),u=Av(t),h=Mv(t),f=Sv(t),p=hv(t),g=fv(r),x=s.createProgram(),m,d,E=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Qr).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Qr).join(`
`),d.length>0&&(d+=`
`)):(m=[kf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Qr).join(`
`),d=[kf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Ki?"#define TONE_MAPPING":"",t.toneMapping!==Ki?Ve.tonemapping_pars_fragment:"",t.toneMapping!==Ki?lv("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ve.colorspace_pars_fragment,cv("linearToOutputTexel",t.outputColorSpace),uv(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Qr).join(`
`)),o=Vl(o),o=Bf(o,t),o=zf(o,t),a=Vl(a),a=Bf(a,t),a=zf(a,t),o=Hf(o),a=Hf(a),t.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",t.glslVersion===Qh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Qh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);let b=E+m+o,v=E+d+a,N=Nf(s,s.VERTEX_SHADER,b),R=Nf(s,s.FRAGMENT_SHADER,v);s.attachShader(x,N),s.attachShader(x,R),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function C(P){if(i.debug.checkShaderErrors){let k=s.getProgramInfoLog(x).trim(),B=s.getShaderInfoLog(N).trim(),G=s.getShaderInfoLog(R).trim(),J=!0,X=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(J=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,x,N,R);else{let Q=Ff(s,N,"vertex"),V=Ff(s,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+k+`
`+Q+`
`+V)}else k!==""?console.warn("THREE.WebGLProgram: Program Info Log:",k):(B===""||G==="")&&(X=!1);X&&(P.diagnostics={runnable:J,programLog:k,vertexShader:{log:B,prefix:m},fragmentShader:{log:G,prefix:d}})}s.deleteShader(N),s.deleteShader(R),I=new cr(s,x),S=dv(s,x)}let I;this.getUniforms=function(){return I===void 0&&C(this),I};let S;this.getAttributes=function(){return S===void 0&&C(this),S};let A=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return A===!1&&(A=s.getProgramParameter(x,sv)),A},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=rv++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=N,this.fragmentShader=R,this}var Ev=0,Gl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Wl(e),t.set(e,n)),n}},Wl=class{constructor(e){this.id=Ev++,this.code=e,this.usedTimes=0}};function Tv(i,e,t,n,s,r,o){let a=new wa,c=new Gl,l=new Set,u=[],h=s.logarithmicDepthBuffer,f=s.vertexTextures,p=s.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(S){return l.add(S),S===0?"uv":`uv${S}`}function m(S,A,P,k,B){let G=k.fog,J=B.geometry,X=S.isMeshStandardMaterial?k.environment:null,Q=(S.isMeshStandardMaterial?t:e).get(S.envMap||X),V=Q&&Q.mapping===Za?Q.image.height:null,ie=g[S.type];S.precision!==null&&(p=s.getMaxPrecision(S.precision),p!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",p,"instead."));let pe=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,Re=pe!==void 0?pe.length:0,Ze=0;J.morphAttributes.position!==void 0&&(Ze=1),J.morphAttributes.normal!==void 0&&(Ze=2),J.morphAttributes.color!==void 0&&(Ze=3);let xt,Y,ne,Ae;if(ie){let ut=$n[ie];xt=ut.vertexShader,Y=ut.fragmentShader}else xt=S.vertexShader,Y=S.fragmentShader,c.update(S),ne=c.getVertexShaderID(S),Ae=c.getFragmentShaderID(S);let ce=i.getRenderTarget(),Oe=i.state.buffers.depth.getReversed(),ke=B.isInstancedMesh===!0,Ke=B.isBatchedMesh===!0,Ct=!!S.map,tt=!!S.matcap,Ut=!!Q,O=!!S.aoMap,Tn=!!S.lightMap,je=!!S.bumpMap,Qe=!!S.normalMap,De=!!S.displacementMap,St=!!S.emissiveMap,Pe=!!S.metalnessMap,T=!!S.roughnessMap,_=S.anisotropy>0,F=S.clearcoat>0,Z=S.dispersion>0,$=S.iridescence>0,q=S.sheen>0,Se=S.transmission>0,le=_&&!!S.anisotropyMap,me=F&&!!S.clearcoatMap,nt=F&&!!S.clearcoatNormalMap,ee=F&&!!S.clearcoatRoughnessMap,ge=$&&!!S.iridescenceMap,Ne=$&&!!S.iridescenceThicknessMap,Be=q&&!!S.sheenColorMap,xe=q&&!!S.sheenRoughnessMap,et=!!S.specularMap,qe=!!S.specularColorMap,vt=!!S.specularIntensityMap,L=Se&&!!S.transmissionMap,ae=Se&&!!S.thicknessMap,W=!!S.gradientMap,K=!!S.alphaMap,fe=S.alphaTest>0,ue=!!S.alphaHash,Ge=!!S.extensions,Pt=Ki;S.toneMapped&&(ce===null||ce.isXRRenderTarget===!0)&&(Pt=i.toneMapping);let nn={shaderID:ie,shaderType:S.type,shaderName:S.name,vertexShader:xt,fragmentShader:Y,defines:S.defines,customVertexShaderID:ne,customFragmentShaderID:Ae,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:p,batching:Ke,batchingColor:Ke&&B._colorsTexture!==null,instancing:ke,instancingColor:ke&&B.instanceColor!==null,instancingMorph:ke&&B.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:ce===null?i.outputColorSpace:ce.isXRRenderTarget===!0?ce.texture.colorSpace:un,alphaToCoverage:!!S.alphaToCoverage,map:Ct,matcap:tt,envMap:Ut,envMapMode:Ut&&Q.mapping,envMapCubeUVHeight:V,aoMap:O,lightMap:Tn,bumpMap:je,normalMap:Qe,displacementMap:f&&De,emissiveMap:St,normalMapObjectSpace:Qe&&S.normalMapType===Cm,normalMapTangentSpace:Qe&&S.normalMapType===Ed,metalnessMap:Pe,roughnessMap:T,anisotropy:_,anisotropyMap:le,clearcoat:F,clearcoatMap:me,clearcoatNormalMap:nt,clearcoatRoughnessMap:ee,dispersion:Z,iridescence:$,iridescenceMap:ge,iridescenceThicknessMap:Ne,sheen:q,sheenColorMap:Be,sheenRoughnessMap:xe,specularMap:et,specularColorMap:qe,specularIntensityMap:vt,transmission:Se,transmissionMap:L,thicknessMap:ae,gradientMap:W,opaque:S.transparent===!1&&S.blending===Zi&&S.alphaToCoverage===!1,alphaMap:K,alphaTest:fe,alphaHash:ue,combine:S.combine,mapUv:Ct&&x(S.map.channel),aoMapUv:O&&x(S.aoMap.channel),lightMapUv:Tn&&x(S.lightMap.channel),bumpMapUv:je&&x(S.bumpMap.channel),normalMapUv:Qe&&x(S.normalMap.channel),displacementMapUv:De&&x(S.displacementMap.channel),emissiveMapUv:St&&x(S.emissiveMap.channel),metalnessMapUv:Pe&&x(S.metalnessMap.channel),roughnessMapUv:T&&x(S.roughnessMap.channel),anisotropyMapUv:le&&x(S.anisotropyMap.channel),clearcoatMapUv:me&&x(S.clearcoatMap.channel),clearcoatNormalMapUv:nt&&x(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ee&&x(S.clearcoatRoughnessMap.channel),iridescenceMapUv:ge&&x(S.iridescenceMap.channel),iridescenceThicknessMapUv:Ne&&x(S.iridescenceThicknessMap.channel),sheenColorMapUv:Be&&x(S.sheenColorMap.channel),sheenRoughnessMapUv:xe&&x(S.sheenRoughnessMap.channel),specularMapUv:et&&x(S.specularMap.channel),specularColorMapUv:qe&&x(S.specularColorMap.channel),specularIntensityMapUv:vt&&x(S.specularIntensityMap.channel),transmissionMapUv:L&&x(S.transmissionMap.channel),thicknessMapUv:ae&&x(S.thicknessMap.channel),alphaMapUv:K&&x(S.alphaMap.channel),vertexTangents:!!J.attributes.tangent&&(Qe||_),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!J.attributes.uv&&(Ct||K),fog:!!G,useFog:S.fog===!0,fogExp2:!!G&&G.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:Oe,skinning:B.isSkinnedMesh===!0,morphTargets:J.morphAttributes.position!==void 0,morphNormals:J.morphAttributes.normal!==void 0,morphColors:J.morphAttributes.color!==void 0,morphTargetsCount:Re,morphTextureStride:Ze,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:Pt,decodeVideoTexture:Ct&&S.map.isVideoTexture===!0&&$e.getTransfer(S.map.colorSpace)===pt,decodeVideoTextureEmissive:St&&S.emissiveMap.isVideoTexture===!0&&$e.getTransfer(S.emissiveMap.colorSpace)===pt,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===an,flipSided:S.side===ln,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:Ge&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ge&&S.extensions.multiDraw===!0||Ke)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return nn.vertexUv1s=l.has(1),nn.vertexUv2s=l.has(2),nn.vertexUv3s=l.has(3),l.clear(),nn}function d(S){let A=[];if(S.shaderID?A.push(S.shaderID):(A.push(S.customVertexShaderID),A.push(S.customFragmentShaderID)),S.defines!==void 0)for(let P in S.defines)A.push(P),A.push(S.defines[P]);return S.isRawShaderMaterial===!1&&(E(A,S),b(A,S),A.push(i.outputColorSpace)),A.push(S.customProgramCacheKey),A.join()}function E(S,A){S.push(A.precision),S.push(A.outputColorSpace),S.push(A.envMapMode),S.push(A.envMapCubeUVHeight),S.push(A.mapUv),S.push(A.alphaMapUv),S.push(A.lightMapUv),S.push(A.aoMapUv),S.push(A.bumpMapUv),S.push(A.normalMapUv),S.push(A.displacementMapUv),S.push(A.emissiveMapUv),S.push(A.metalnessMapUv),S.push(A.roughnessMapUv),S.push(A.anisotropyMapUv),S.push(A.clearcoatMapUv),S.push(A.clearcoatNormalMapUv),S.push(A.clearcoatRoughnessMapUv),S.push(A.iridescenceMapUv),S.push(A.iridescenceThicknessMapUv),S.push(A.sheenColorMapUv),S.push(A.sheenRoughnessMapUv),S.push(A.specularMapUv),S.push(A.specularColorMapUv),S.push(A.specularIntensityMapUv),S.push(A.transmissionMapUv),S.push(A.thicknessMapUv),S.push(A.combine),S.push(A.fogExp2),S.push(A.sizeAttenuation),S.push(A.morphTargetsCount),S.push(A.morphAttributeCount),S.push(A.numDirLights),S.push(A.numPointLights),S.push(A.numSpotLights),S.push(A.numSpotLightMaps),S.push(A.numHemiLights),S.push(A.numRectAreaLights),S.push(A.numDirLightShadows),S.push(A.numPointLightShadows),S.push(A.numSpotLightShadows),S.push(A.numSpotLightShadowsWithMaps),S.push(A.numLightProbes),S.push(A.shadowMapType),S.push(A.toneMapping),S.push(A.numClippingPlanes),S.push(A.numClipIntersection),S.push(A.depthPacking)}function b(S,A){a.disableAll(),A.supportsVertexTextures&&a.enable(0),A.instancing&&a.enable(1),A.instancingColor&&a.enable(2),A.instancingMorph&&a.enable(3),A.matcap&&a.enable(4),A.envMap&&a.enable(5),A.normalMapObjectSpace&&a.enable(6),A.normalMapTangentSpace&&a.enable(7),A.clearcoat&&a.enable(8),A.iridescence&&a.enable(9),A.alphaTest&&a.enable(10),A.vertexColors&&a.enable(11),A.vertexAlphas&&a.enable(12),A.vertexUv1s&&a.enable(13),A.vertexUv2s&&a.enable(14),A.vertexUv3s&&a.enable(15),A.vertexTangents&&a.enable(16),A.anisotropy&&a.enable(17),A.alphaHash&&a.enable(18),A.batching&&a.enable(19),A.dispersion&&a.enable(20),A.batchingColor&&a.enable(21),S.push(a.mask),a.disableAll(),A.fog&&a.enable(0),A.useFog&&a.enable(1),A.flatShading&&a.enable(2),A.logarithmicDepthBuffer&&a.enable(3),A.reverseDepthBuffer&&a.enable(4),A.skinning&&a.enable(5),A.morphTargets&&a.enable(6),A.morphNormals&&a.enable(7),A.morphColors&&a.enable(8),A.premultipliedAlpha&&a.enable(9),A.shadowMapEnabled&&a.enable(10),A.doubleSided&&a.enable(11),A.flipSided&&a.enable(12),A.useDepthPacking&&a.enable(13),A.dithering&&a.enable(14),A.transmission&&a.enable(15),A.sheen&&a.enable(16),A.opaque&&a.enable(17),A.pointsUvs&&a.enable(18),A.decodeVideoTexture&&a.enable(19),A.decodeVideoTextureEmissive&&a.enable(20),A.alphaToCoverage&&a.enable(21),S.push(a.mask)}function v(S){let A=g[S.type],P;if(A){let k=$n[A];P=g0.clone(k.uniforms)}else P=S.uniforms;return P}function N(S,A){let P;for(let k=0,B=u.length;k<B;k++){let G=u[k];if(G.cacheKey===A){P=G,++P.usedTimes;break}}return P===void 0&&(P=new bv(i,A,S,r),u.push(P)),P}function R(S){if(--S.usedTimes===0){let A=u.indexOf(S);u[A]=u[u.length-1],u.pop(),S.destroy()}}function C(S){c.remove(S)}function I(){c.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:v,acquireProgram:N,releaseProgram:R,releaseShaderCache:C,programs:u,dispose:I}}function wv(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,c){i.get(o)[a]=c}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function Rv(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Vf(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Gf(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(h,f,p,g,x,m){let d=i[e];return d===void 0?(d={id:h.id,object:h,geometry:f,material:p,groupOrder:g,renderOrder:h.renderOrder,z:x,group:m},i[e]=d):(d.id=h.id,d.object=h,d.geometry=f,d.material=p,d.groupOrder=g,d.renderOrder=h.renderOrder,d.z=x,d.group=m),e++,d}function a(h,f,p,g,x,m){let d=o(h,f,p,g,x,m);p.transmission>0?n.push(d):p.transparent===!0?s.push(d):t.push(d)}function c(h,f,p,g,x,m){let d=o(h,f,p,g,x,m);p.transmission>0?n.unshift(d):p.transparent===!0?s.unshift(d):t.unshift(d)}function l(h,f){t.length>1&&t.sort(h||Rv),n.length>1&&n.sort(f||Vf),s.length>1&&s.sort(f||Vf)}function u(){for(let h=e,f=i.length;h<f;h++){let p=i[h];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:a,unshift:c,finish:u,sort:l}}function Cv(){let i=new WeakMap;function e(n,s){let r=i.get(n),o;return r===void 0?(o=new Gf,i.set(n,[o])):s>=r.length?(o=new Gf,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function Iv(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new w,color:new Ee};break;case"SpotLight":t={position:new w,direction:new w,color:new Ee,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new w,color:new Ee,distance:0,decay:0};break;case"HemisphereLight":t={direction:new w,skyColor:new Ee,groundColor:new Ee};break;case"RectAreaLight":t={color:new Ee,position:new w,halfWidth:new w,halfHeight:new w};break}return i[e.id]=t,t}}}function Pv(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var Lv=0;function Dv(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Uv(i){let e=new Iv,t=Pv(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new w);let s=new w,r=new we,o=new we;function a(l){let u=0,h=0,f=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let p=0,g=0,x=0,m=0,d=0,E=0,b=0,v=0,N=0,R=0,C=0;l.sort(Dv);for(let S=0,A=l.length;S<A;S++){let P=l[S],k=P.color,B=P.intensity,G=P.distance,J=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)u+=k.r*B,h+=k.g*B,f+=k.b*B;else if(P.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(P.sh.coefficients[X],B);C++}else if(P.isDirectionalLight){let X=e.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let Q=P.shadow,V=t.get(P);V.shadowIntensity=Q.intensity,V.shadowBias=Q.bias,V.shadowNormalBias=Q.normalBias,V.shadowRadius=Q.radius,V.shadowMapSize=Q.mapSize,n.directionalShadow[p]=V,n.directionalShadowMap[p]=J,n.directionalShadowMatrix[p]=P.shadow.matrix,E++}n.directional[p]=X,p++}else if(P.isSpotLight){let X=e.get(P);X.position.setFromMatrixPosition(P.matrixWorld),X.color.copy(k).multiplyScalar(B),X.distance=G,X.coneCos=Math.cos(P.angle),X.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),X.decay=P.decay,n.spot[x]=X;let Q=P.shadow;if(P.map&&(n.spotLightMap[N]=P.map,N++,Q.updateMatrices(P),P.castShadow&&R++),n.spotLightMatrix[x]=Q.matrix,P.castShadow){let V=t.get(P);V.shadowIntensity=Q.intensity,V.shadowBias=Q.bias,V.shadowNormalBias=Q.normalBias,V.shadowRadius=Q.radius,V.shadowMapSize=Q.mapSize,n.spotShadow[x]=V,n.spotShadowMap[x]=J,v++}x++}else if(P.isRectAreaLight){let X=e.get(P);X.color.copy(k).multiplyScalar(B),X.halfWidth.set(P.width*.5,0,0),X.halfHeight.set(0,P.height*.5,0),n.rectArea[m]=X,m++}else if(P.isPointLight){let X=e.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),X.distance=P.distance,X.decay=P.decay,P.castShadow){let Q=P.shadow,V=t.get(P);V.shadowIntensity=Q.intensity,V.shadowBias=Q.bias,V.shadowNormalBias=Q.normalBias,V.shadowRadius=Q.radius,V.shadowMapSize=Q.mapSize,V.shadowCameraNear=Q.camera.near,V.shadowCameraFar=Q.camera.far,n.pointShadow[g]=V,n.pointShadowMap[g]=J,n.pointShadowMatrix[g]=P.shadow.matrix,b++}n.point[g]=X,g++}else if(P.isHemisphereLight){let X=e.get(P);X.skyColor.copy(P.color).multiplyScalar(B),X.groundColor.copy(P.groundColor).multiplyScalar(B),n.hemi[d]=X,d++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=se.LTC_FLOAT_1,n.rectAreaLTC2=se.LTC_FLOAT_2):(n.rectAreaLTC1=se.LTC_HALF_1,n.rectAreaLTC2=se.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=f;let I=n.hash;(I.directionalLength!==p||I.pointLength!==g||I.spotLength!==x||I.rectAreaLength!==m||I.hemiLength!==d||I.numDirectionalShadows!==E||I.numPointShadows!==b||I.numSpotShadows!==v||I.numSpotMaps!==N||I.numLightProbes!==C)&&(n.directional.length=p,n.spot.length=x,n.rectArea.length=m,n.point.length=g,n.hemi.length=d,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.pointShadow.length=b,n.pointShadowMap.length=b,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=E,n.pointShadowMatrix.length=b,n.spotLightMatrix.length=v+N-R,n.spotLightMap.length=N,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=C,I.directionalLength=p,I.pointLength=g,I.spotLength=x,I.rectAreaLength=m,I.hemiLength=d,I.numDirectionalShadows=E,I.numPointShadows=b,I.numSpotShadows=v,I.numSpotMaps=N,I.numLightProbes=C,n.version=Lv++)}function c(l,u){let h=0,f=0,p=0,g=0,x=0,m=u.matrixWorldInverse;for(let d=0,E=l.length;d<E;d++){let b=l[d];if(b.isDirectionalLight){let v=n.directional[h];v.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(m),h++}else if(b.isSpotLight){let v=n.spot[p];v.position.setFromMatrixPosition(b.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(m),p++}else if(b.isRectAreaLight){let v=n.rectArea[g];v.position.setFromMatrixPosition(b.matrixWorld),v.position.applyMatrix4(m),o.identity(),r.copy(b.matrixWorld),r.premultiply(m),o.extractRotation(r),v.halfWidth.set(b.width*.5,0,0),v.halfHeight.set(0,b.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),g++}else if(b.isPointLight){let v=n.point[f];v.position.setFromMatrixPosition(b.matrixWorld),v.position.applyMatrix4(m),f++}else if(b.isHemisphereLight){let v=n.hemi[x];v.direction.setFromMatrixPosition(b.matrixWorld),v.direction.transformDirection(m),x++}}}return{setup:a,setupView:c,state:n}}function Wf(i){let e=new Uv(i),t=[],n=[];function s(u){l.camera=u,t.length=0,n.length=0}function r(u){t.push(u)}function o(u){n.push(u)}function a(){e.setup(t)}function c(u){e.setupView(t,u)}let l={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:l,setupLights:a,setupLightsView:c,pushLight:r,pushShadow:o}}function Nv(i){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new Wf(i),e.set(s,[a])):r>=o.length?(a=new Wf(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var Xl=class extends mn{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=wm,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},ql=class extends mn{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},Ov=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Fv=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Bv(i,e,t){let n=new uo,s=new Ue,r=new Ue,o=new ze,a=new Xl({depthPacking:Rm}),c=new ql,l={},u=t.maxTextureSize,h={[Qn]:ln,[ln]:Qn,[an]:an},f=new Qt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ue},radius:{value:4}},vertexShader:Ov,fragmentShader:Fv}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let g=new $t;g.setAttribute("position",new wt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new Te(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=hd;let d=this.type;this.render=function(R,C,I){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||R.length===0)return;let S=i.getRenderTarget(),A=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),k=i.state;k.setBlending(Yi),k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);let B=d!==di&&this.type===di,G=d===di&&this.type!==di;for(let J=0,X=R.length;J<X;J++){let Q=R[J],V=Q.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",Q,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);let ie=V.getFrameExtents();if(s.multiply(ie),r.copy(V.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/ie.x),s.x=r.x*ie.x,V.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/ie.y),s.y=r.y*ie.y,V.mapSize.y=r.y)),V.map===null||B===!0||G===!0){let Re=this.type!==di?{minFilter:zt,magFilter:zt}:{};V.map!==null&&V.map.dispose(),V.map=new yi(s.x,s.y,Re),V.map.texture.name=Q.name+".shadowMap",V.camera.updateProjectionMatrix()}i.setRenderTarget(V.map),i.clear();let pe=V.getViewportCount();for(let Re=0;Re<pe;Re++){let Ze=V.getViewport(Re);o.set(r.x*Ze.x,r.y*Ze.y,r.x*Ze.z,r.y*Ze.w),k.viewport(o),V.updateMatrices(Q,Re),n=V.getFrustum(),v(C,I,V.camera,Q,this.type)}V.isPointLightShadow!==!0&&this.type===di&&E(V,I),V.needsUpdate=!1}d=this.type,m.needsUpdate=!1,i.setRenderTarget(S,A,P)};function E(R,C){let I=e.update(x);f.defines.VSM_SAMPLES!==R.blurSamples&&(f.defines.VSM_SAMPLES=R.blurSamples,p.defines.VSM_SAMPLES=R.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new yi(s.x,s.y)),f.uniforms.shadow_pass.value=R.map.texture,f.uniforms.resolution.value=R.mapSize,f.uniforms.radius.value=R.radius,i.setRenderTarget(R.mapPass),i.clear(),i.renderBufferDirect(C,null,I,f,x,null),p.uniforms.shadow_pass.value=R.mapPass.texture,p.uniforms.resolution.value=R.mapSize,p.uniforms.radius.value=R.radius,i.setRenderTarget(R.map),i.clear(),i.renderBufferDirect(C,null,I,p,x,null)}function b(R,C,I,S){let A=null,P=I.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(P!==void 0)A=P;else if(A=I.isPointLight===!0?c:a,i.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0){let k=A.uuid,B=C.uuid,G=l[k];G===void 0&&(G={},l[k]=G);let J=G[B];J===void 0&&(J=A.clone(),G[B]=J,C.addEventListener("dispose",N)),A=J}if(A.visible=C.visible,A.wireframe=C.wireframe,S===di?A.side=C.shadowSide!==null?C.shadowSide:C.side:A.side=C.shadowSide!==null?C.shadowSide:h[C.side],A.alphaMap=C.alphaMap,A.alphaTest=C.alphaTest,A.map=C.map,A.clipShadows=C.clipShadows,A.clippingPlanes=C.clippingPlanes,A.clipIntersection=C.clipIntersection,A.displacementMap=C.displacementMap,A.displacementScale=C.displacementScale,A.displacementBias=C.displacementBias,A.wireframeLinewidth=C.wireframeLinewidth,A.linewidth=C.linewidth,I.isPointLight===!0&&A.isMeshDistanceMaterial===!0){let k=i.properties.get(A);k.light=I}return A}function v(R,C,I,S,A){if(R.visible===!1)return;if(R.layers.test(C.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&A===di)&&(!R.frustumCulled||n.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,R.matrixWorld);let B=e.update(R),G=R.material;if(Array.isArray(G)){let J=B.groups;for(let X=0,Q=J.length;X<Q;X++){let V=J[X],ie=G[V.materialIndex];if(ie&&ie.visible){let pe=b(R,ie,S,A);R.onBeforeShadow(i,R,C,I,B,pe,V),i.renderBufferDirect(I,null,B,pe,R,V),R.onAfterShadow(i,R,C,I,B,pe,V)}}}else if(G.visible){let J=b(R,G,S,A);R.onBeforeShadow(i,R,C,I,B,J,null),i.renderBufferDirect(I,null,B,J,R,null),R.onAfterShadow(i,R,C,I,B,J,null)}}let k=R.children;for(let B=0,G=k.length;B<G;B++)v(k[B],C,I,S,A)}function N(R){R.target.removeEventListener("dispose",N);for(let I in l){let S=l[I],A=R.target.uuid;A in S&&(S[A].dispose(),delete S[A])}}}var zv={[Qc]:oo,[el]:il,[tl]:sl,[lr]:nl,[oo]:Qc,[il]:el,[sl]:tl,[nl]:lr};function Hv(i,e){function t(){let L=!1,ae=new ze,W=null,K=new ze(0,0,0,0);return{setMask:function(fe){W!==fe&&!L&&(i.colorMask(fe,fe,fe,fe),W=fe)},setLocked:function(fe){L=fe},setClear:function(fe,ue,Ge,Pt,nn){nn===!0&&(fe*=Pt,ue*=Pt,Ge*=Pt),ae.set(fe,ue,Ge,Pt),K.equals(ae)===!1&&(i.clearColor(fe,ue,Ge,Pt),K.copy(ae))},reset:function(){L=!1,W=null,K.set(-1,0,0,0)}}}function n(){let L=!1,ae=!1,W=null,K=null,fe=null;return{setReversed:function(ue){if(ae!==ue){let Ge=e.get("EXT_clip_control");ae?Ge.clipControlEXT(Ge.LOWER_LEFT_EXT,Ge.ZERO_TO_ONE_EXT):Ge.clipControlEXT(Ge.LOWER_LEFT_EXT,Ge.NEGATIVE_ONE_TO_ONE_EXT);let Pt=fe;fe=null,this.setClear(Pt)}ae=ue},getReversed:function(){return ae},setTest:function(ue){ue?ce(i.DEPTH_TEST):Oe(i.DEPTH_TEST)},setMask:function(ue){W!==ue&&!L&&(i.depthMask(ue),W=ue)},setFunc:function(ue){if(ae&&(ue=zv[ue]),K!==ue){switch(ue){case Qc:i.depthFunc(i.NEVER);break;case oo:i.depthFunc(i.ALWAYS);break;case el:i.depthFunc(i.LESS);break;case lr:i.depthFunc(i.LEQUAL);break;case tl:i.depthFunc(i.EQUAL);break;case nl:i.depthFunc(i.GEQUAL);break;case il:i.depthFunc(i.GREATER);break;case sl:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}K=ue}},setLocked:function(ue){L=ue},setClear:function(ue){fe!==ue&&(ae&&(ue=1-ue),i.clearDepth(ue),fe=ue)},reset:function(){L=!1,W=null,K=null,fe=null,ae=!1}}}function s(){let L=!1,ae=null,W=null,K=null,fe=null,ue=null,Ge=null,Pt=null,nn=null;return{setTest:function(ut){L||(ut?ce(i.STENCIL_TEST):Oe(i.STENCIL_TEST))},setMask:function(ut){ae!==ut&&!L&&(i.stencilMask(ut),ae=ut)},setFunc:function(ut,On,ri){(W!==ut||K!==On||fe!==ri)&&(i.stencilFunc(ut,On,ri),W=ut,K=On,fe=ri)},setOp:function(ut,On,ri){(ue!==ut||Ge!==On||Pt!==ri)&&(i.stencilOp(ut,On,ri),ue=ut,Ge=On,Pt=ri)},setLocked:function(ut){L=ut},setClear:function(ut){nn!==ut&&(i.clearStencil(ut),nn=ut)},reset:function(){L=!1,ae=null,W=null,K=null,fe=null,ue=null,Ge=null,Pt=null,nn=null}}}let r=new t,o=new n,a=new s,c=new WeakMap,l=new WeakMap,u={},h={},f=new WeakMap,p=[],g=null,x=!1,m=null,d=null,E=null,b=null,v=null,N=null,R=null,C=new Ee(0,0,0),I=0,S=!1,A=null,P=null,k=null,B=null,G=null,J=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),X=!1,Q=0,V=i.getParameter(i.VERSION);V.indexOf("WebGL")!==-1?(Q=parseFloat(/^WebGL (\d)/.exec(V)[1]),X=Q>=1):V.indexOf("OpenGL ES")!==-1&&(Q=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),X=Q>=2);let ie=null,pe={},Re=i.getParameter(i.SCISSOR_BOX),Ze=i.getParameter(i.VIEWPORT),xt=new ze().fromArray(Re),Y=new ze().fromArray(Ze);function ne(L,ae,W,K){let fe=new Uint8Array(4),ue=i.createTexture();i.bindTexture(L,ue),i.texParameteri(L,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(L,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ge=0;Ge<W;Ge++)L===i.TEXTURE_3D||L===i.TEXTURE_2D_ARRAY?i.texImage3D(ae,0,i.RGBA,1,1,K,0,i.RGBA,i.UNSIGNED_BYTE,fe):i.texImage2D(ae+Ge,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,fe);return ue}let Ae={};Ae[i.TEXTURE_2D]=ne(i.TEXTURE_2D,i.TEXTURE_2D,1),Ae[i.TEXTURE_CUBE_MAP]=ne(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Ae[i.TEXTURE_2D_ARRAY]=ne(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Ae[i.TEXTURE_3D]=ne(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ce(i.DEPTH_TEST),o.setFunc(lr),je(!1),Qe(Zh),ce(i.CULL_FACE),O(Yi);function ce(L){u[L]!==!0&&(i.enable(L),u[L]=!0)}function Oe(L){u[L]!==!1&&(i.disable(L),u[L]=!1)}function ke(L,ae){return h[L]!==ae?(i.bindFramebuffer(L,ae),h[L]=ae,L===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=ae),L===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=ae),!0):!1}function Ke(L,ae){let W=p,K=!1;if(L){W=f.get(ae),W===void 0&&(W=[],f.set(ae,W));let fe=L.textures;if(W.length!==fe.length||W[0]!==i.COLOR_ATTACHMENT0){for(let ue=0,Ge=fe.length;ue<Ge;ue++)W[ue]=i.COLOR_ATTACHMENT0+ue;W.length=fe.length,K=!0}}else W[0]!==i.BACK&&(W[0]=i.BACK,K=!0);K&&i.drawBuffers(W)}function Ct(L){return g!==L?(i.useProgram(L),g=L,!0):!1}let tt={[vs]:i.FUNC_ADD,[Qp]:i.FUNC_SUBTRACT,[em]:i.FUNC_REVERSE_SUBTRACT};tt[tm]=i.MIN,tt[nm]=i.MAX;let Ut={[im]:i.ZERO,[sm]:i.ONE,[rm]:i.SRC_COLOR,[so]:i.SRC_ALPHA,[hm]:i.SRC_ALPHA_SATURATE,[lm]:i.DST_COLOR,[am]:i.DST_ALPHA,[om]:i.ONE_MINUS_SRC_COLOR,[ro]:i.ONE_MINUS_SRC_ALPHA,[um]:i.ONE_MINUS_DST_COLOR,[cm]:i.ONE_MINUS_DST_ALPHA,[fm]:i.CONSTANT_COLOR,[dm]:i.ONE_MINUS_CONSTANT_COLOR,[pm]:i.CONSTANT_ALPHA,[mm]:i.ONE_MINUS_CONSTANT_ALPHA};function O(L,ae,W,K,fe,ue,Ge,Pt,nn,ut){if(L===Yi){x===!0&&(Oe(i.BLEND),x=!1);return}if(x===!1&&(ce(i.BLEND),x=!0),L!==hu){if(L!==m||ut!==S){if((d!==vs||v!==vs)&&(i.blendEquation(i.FUNC_ADD),d=vs,v=vs),ut)switch(L){case Zi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Wn:i.blendFunc(i.ONE,i.ONE);break;case Kh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Jh:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}else switch(L){case Zi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Wn:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Kh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Jh:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}E=null,b=null,N=null,R=null,C.set(0,0,0),I=0,m=L,S=ut}return}fe=fe||ae,ue=ue||W,Ge=Ge||K,(ae!==d||fe!==v)&&(i.blendEquationSeparate(tt[ae],tt[fe]),d=ae,v=fe),(W!==E||K!==b||ue!==N||Ge!==R)&&(i.blendFuncSeparate(Ut[W],Ut[K],Ut[ue],Ut[Ge]),E=W,b=K,N=ue,R=Ge),(Pt.equals(C)===!1||nn!==I)&&(i.blendColor(Pt.r,Pt.g,Pt.b,nn),C.copy(Pt),I=nn),m=L,S=!1}function Tn(L,ae){L.side===an?Oe(i.CULL_FACE):ce(i.CULL_FACE);let W=L.side===ln;ae&&(W=!W),je(W),L.blending===Zi&&L.transparent===!1?O(Yi):O(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),o.setFunc(L.depthFunc),o.setTest(L.depthTest),o.setMask(L.depthWrite),r.setMask(L.colorWrite);let K=L.stencilWrite;a.setTest(K),K&&(a.setMask(L.stencilWriteMask),a.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),a.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),St(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?ce(i.SAMPLE_ALPHA_TO_COVERAGE):Oe(i.SAMPLE_ALPHA_TO_COVERAGE)}function je(L){A!==L&&(L?i.frontFace(i.CW):i.frontFace(i.CCW),A=L)}function Qe(L){L!==$p?(ce(i.CULL_FACE),L!==P&&(L===Zh?i.cullFace(i.BACK):L===jp?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Oe(i.CULL_FACE),P=L}function De(L){L!==k&&(X&&i.lineWidth(L),k=L)}function St(L,ae,W){L?(ce(i.POLYGON_OFFSET_FILL),(B!==ae||G!==W)&&(i.polygonOffset(ae,W),B=ae,G=W)):Oe(i.POLYGON_OFFSET_FILL)}function Pe(L){L?ce(i.SCISSOR_TEST):Oe(i.SCISSOR_TEST)}function T(L){L===void 0&&(L=i.TEXTURE0+J-1),ie!==L&&(i.activeTexture(L),ie=L)}function _(L,ae,W){W===void 0&&(ie===null?W=i.TEXTURE0+J-1:W=ie);let K=pe[W];K===void 0&&(K={type:void 0,texture:void 0},pe[W]=K),(K.type!==L||K.texture!==ae)&&(ie!==W&&(i.activeTexture(W),ie=W),i.bindTexture(L,ae||Ae[L]),K.type=L,K.texture=ae)}function F(){let L=pe[ie];L!==void 0&&L.type!==void 0&&(i.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function Z(){try{i.compressedTexImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function $(){try{i.compressedTexImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function q(){try{i.texSubImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Se(){try{i.texSubImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function le(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function me(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function nt(){try{i.texStorage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ee(){try{i.texStorage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ge(){try{i.texImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ne(){try{i.texImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Be(L){xt.equals(L)===!1&&(i.scissor(L.x,L.y,L.z,L.w),xt.copy(L))}function xe(L){Y.equals(L)===!1&&(i.viewport(L.x,L.y,L.z,L.w),Y.copy(L))}function et(L,ae){let W=l.get(ae);W===void 0&&(W=new WeakMap,l.set(ae,W));let K=W.get(L);K===void 0&&(K=i.getUniformBlockIndex(ae,L.name),W.set(L,K))}function qe(L,ae){let K=l.get(ae).get(L);c.get(ae)!==K&&(i.uniformBlockBinding(ae,K,L.__bindingPointIndex),c.set(ae,K))}function vt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),u={},ie=null,pe={},h={},f=new WeakMap,p=[],g=null,x=!1,m=null,d=null,E=null,b=null,v=null,N=null,R=null,C=new Ee(0,0,0),I=0,S=!1,A=null,P=null,k=null,B=null,G=null,xt.set(0,0,i.canvas.width,i.canvas.height),Y.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:ce,disable:Oe,bindFramebuffer:ke,drawBuffers:Ke,useProgram:Ct,setBlending:O,setMaterial:Tn,setFlipSided:je,setCullFace:Qe,setLineWidth:De,setPolygonOffset:St,setScissorTest:Pe,activeTexture:T,bindTexture:_,unbindTexture:F,compressedTexImage2D:Z,compressedTexImage3D:$,texImage2D:ge,texImage3D:Ne,updateUBOMapping:et,uniformBlockBinding:qe,texStorage2D:nt,texStorage3D:ee,texSubImage2D:q,texSubImage3D:Se,compressedTexSubImage2D:le,compressedTexSubImage3D:me,scissor:Be,viewport:xe,reset:vt}}function Xf(i,e,t,n){let s=kv(n);switch(t){case xd:return i*e;case vd:return i*e;case yd:return i*e*2;case xu:return i*e/s.components*s.byteLength;case _u:return i*e/s.components*s.byteLength;case Ad:return i*e*2/s.components*s.byteLength;case vu:return i*e*2/s.components*s.byteLength;case _d:return i*e*3/s.components*s.byteLength;case Cn:return i*e*4/s.components*s.byteLength;case yu:return i*e*4/s.components*s.byteLength;case _a:case va:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case ya:case Aa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case cl:case ul:return Math.max(i,16)*Math.max(e,8)/4;case al:case ll:return Math.max(i,8)*Math.max(e,8)/2;case hl:case fl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case dl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case pl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ml:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case gl:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case xl:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case _l:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case vl:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case yl:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Al:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Ml:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Sl:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case bl:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case El:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Tl:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case wl:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Ma:case Rl:case Cl:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Md:case Il:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Pl:case Ll:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function kv(i){switch(i){case _i:case pd:return{byteLength:1,components:1};case co:case md:case Mo:return{byteLength:2,components:1};case mu:case gu:return{byteLength:2,components:4};case Ms:case pu:case Vn:return{byteLength:4,components:1};case gd:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function Vv(i,e,t,n,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Ue,u=new WeakMap,h,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(T,_){return p?new OffscreenCanvas(T,_):lo("canvas")}function x(T,_,F){let Z=1,$=Pe(T);if(($.width>F||$.height>F)&&(Z=F/Math.max($.width,$.height)),Z<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){let q=Math.floor(Z*$.width),Se=Math.floor(Z*$.height);h===void 0&&(h=g(q,Se));let le=_?g(q,Se):h;return le.width=q,le.height=Se,le.getContext("2d").drawImage(T,0,0,q,Se),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+$.width+"x"+$.height+") to ("+q+"x"+Se+")."),le}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+$.width+"x"+$.height+")."),T;return T}function m(T){return T.generateMipmaps}function d(T){i.generateMipmap(T)}function E(T){return T.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?i.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function b(T,_,F,Z,$=!1){if(T!==null){if(i[T]!==void 0)return i[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let q=_;if(_===i.RED&&(F===i.FLOAT&&(q=i.R32F),F===i.HALF_FLOAT&&(q=i.R16F),F===i.UNSIGNED_BYTE&&(q=i.R8)),_===i.RED_INTEGER&&(F===i.UNSIGNED_BYTE&&(q=i.R8UI),F===i.UNSIGNED_SHORT&&(q=i.R16UI),F===i.UNSIGNED_INT&&(q=i.R32UI),F===i.BYTE&&(q=i.R8I),F===i.SHORT&&(q=i.R16I),F===i.INT&&(q=i.R32I)),_===i.RG&&(F===i.FLOAT&&(q=i.RG32F),F===i.HALF_FLOAT&&(q=i.RG16F),F===i.UNSIGNED_BYTE&&(q=i.RG8)),_===i.RG_INTEGER&&(F===i.UNSIGNED_BYTE&&(q=i.RG8UI),F===i.UNSIGNED_SHORT&&(q=i.RG16UI),F===i.UNSIGNED_INT&&(q=i.RG32UI),F===i.BYTE&&(q=i.RG8I),F===i.SHORT&&(q=i.RG16I),F===i.INT&&(q=i.RG32I)),_===i.RGB_INTEGER&&(F===i.UNSIGNED_BYTE&&(q=i.RGB8UI),F===i.UNSIGNED_SHORT&&(q=i.RGB16UI),F===i.UNSIGNED_INT&&(q=i.RGB32UI),F===i.BYTE&&(q=i.RGB8I),F===i.SHORT&&(q=i.RGB16I),F===i.INT&&(q=i.RGB32I)),_===i.RGBA_INTEGER&&(F===i.UNSIGNED_BYTE&&(q=i.RGBA8UI),F===i.UNSIGNED_SHORT&&(q=i.RGBA16UI),F===i.UNSIGNED_INT&&(q=i.RGBA32UI),F===i.BYTE&&(q=i.RGBA8I),F===i.SHORT&&(q=i.RGBA16I),F===i.INT&&(q=i.RGBA32I)),_===i.RGB&&F===i.UNSIGNED_INT_5_9_9_9_REV&&(q=i.RGB9_E5),_===i.RGBA){let Se=$?Ja:$e.getTransfer(Z);F===i.FLOAT&&(q=i.RGBA32F),F===i.HALF_FLOAT&&(q=i.RGBA16F),F===i.UNSIGNED_BYTE&&(q=Se===pt?i.SRGB8_ALPHA8:i.RGBA8),F===i.UNSIGNED_SHORT_4_4_4_4&&(q=i.RGBA4),F===i.UNSIGNED_SHORT_5_5_5_1&&(q=i.RGB5_A1)}return(q===i.R16F||q===i.R32F||q===i.RG16F||q===i.RG32F||q===i.RGBA16F||q===i.RGBA32F)&&e.get("EXT_color_buffer_float"),q}function v(T,_){let F;return T?_===null||_===Ms||_===fr?F=i.DEPTH24_STENCIL8:_===Vn?F=i.DEPTH32F_STENCIL8:_===co&&(F=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===Ms||_===fr?F=i.DEPTH_COMPONENT24:_===Vn?F=i.DEPTH_COMPONENT32F:_===co&&(F=i.DEPTH_COMPONENT16),F}function N(T,_){return m(T)===!0||T.isFramebufferTexture&&T.minFilter!==zt&&T.minFilter!==Kt?Math.log2(Math.max(_.width,_.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?_.mipmaps.length:1}function R(T){let _=T.target;_.removeEventListener("dispose",R),I(_),_.isVideoTexture&&u.delete(_)}function C(T){let _=T.target;_.removeEventListener("dispose",C),A(_)}function I(T){let _=n.get(T);if(_.__webglInit===void 0)return;let F=T.source,Z=f.get(F);if(Z){let $=Z[_.__cacheKey];$.usedTimes--,$.usedTimes===0&&S(T),Object.keys(Z).length===0&&f.delete(F)}n.remove(T)}function S(T){let _=n.get(T);i.deleteTexture(_.__webglTexture);let F=T.source,Z=f.get(F);delete Z[_.__cacheKey],o.memory.textures--}function A(T){let _=n.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),n.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(_.__webglFramebuffer[Z]))for(let $=0;$<_.__webglFramebuffer[Z].length;$++)i.deleteFramebuffer(_.__webglFramebuffer[Z][$]);else i.deleteFramebuffer(_.__webglFramebuffer[Z]);_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer[Z])}else{if(Array.isArray(_.__webglFramebuffer))for(let Z=0;Z<_.__webglFramebuffer.length;Z++)i.deleteFramebuffer(_.__webglFramebuffer[Z]);else i.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&i.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let Z=0;Z<_.__webglColorRenderbuffer.length;Z++)_.__webglColorRenderbuffer[Z]&&i.deleteRenderbuffer(_.__webglColorRenderbuffer[Z]);_.__webglDepthRenderbuffer&&i.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let F=T.textures;for(let Z=0,$=F.length;Z<$;Z++){let q=n.get(F[Z]);q.__webglTexture&&(i.deleteTexture(q.__webglTexture),o.memory.textures--),n.remove(F[Z])}n.remove(T)}let P=0;function k(){P=0}function B(){let T=P;return T>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+s.maxTextures),P+=1,T}function G(T){let _=[];return _.push(T.wrapS),_.push(T.wrapT),_.push(T.wrapR||0),_.push(T.magFilter),_.push(T.minFilter),_.push(T.anisotropy),_.push(T.internalFormat),_.push(T.format),_.push(T.type),_.push(T.generateMipmaps),_.push(T.premultiplyAlpha),_.push(T.flipY),_.push(T.unpackAlignment),_.push(T.colorSpace),_.join()}function J(T,_){let F=n.get(T);if(T.isVideoTexture&&De(T),T.isRenderTargetTexture===!1&&T.version>0&&F.__version!==T.version){let Z=T.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(F,T,_);return}}t.bindTexture(i.TEXTURE_2D,F.__webglTexture,i.TEXTURE0+_)}function X(T,_){let F=n.get(T);if(T.version>0&&F.__version!==T.version){Y(F,T,_);return}t.bindTexture(i.TEXTURE_2D_ARRAY,F.__webglTexture,i.TEXTURE0+_)}function Q(T,_){let F=n.get(T);if(T.version>0&&F.__version!==T.version){Y(F,T,_);return}t.bindTexture(i.TEXTURE_3D,F.__webglTexture,i.TEXTURE0+_)}function V(T,_){let F=n.get(T);if(T.version>0&&F.__version!==T.version){ne(F,T,_);return}t.bindTexture(i.TEXTURE_CUBE_MAP,F.__webglTexture,i.TEXTURE0+_)}let ie={[ei]:i.REPEAT,[mi]:i.CLAMP_TO_EDGE,[ao]:i.MIRRORED_REPEAT},pe={[zt]:i.NEAREST,[du]:i.NEAREST_MIPMAP_NEAREST,[nr]:i.NEAREST_MIPMAP_LINEAR,[Kt]:i.LINEAR,[eo]:i.LINEAR_MIPMAP_NEAREST,[jn]:i.LINEAR_MIPMAP_LINEAR},Re={[Im]:i.NEVER,[Om]:i.ALWAYS,[Pm]:i.LESS,[Td]:i.LEQUAL,[Lm]:i.EQUAL,[Nm]:i.GEQUAL,[Dm]:i.GREATER,[Um]:i.NOTEQUAL};function Ze(T,_){if(_.type===Vn&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===Kt||_.magFilter===eo||_.magFilter===nr||_.magFilter===jn||_.minFilter===Kt||_.minFilter===eo||_.minFilter===nr||_.minFilter===jn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(T,i.TEXTURE_WRAP_S,ie[_.wrapS]),i.texParameteri(T,i.TEXTURE_WRAP_T,ie[_.wrapT]),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,ie[_.wrapR]),i.texParameteri(T,i.TEXTURE_MAG_FILTER,pe[_.magFilter]),i.texParameteri(T,i.TEXTURE_MIN_FILTER,pe[_.minFilter]),_.compareFunction&&(i.texParameteri(T,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(T,i.TEXTURE_COMPARE_FUNC,Re[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===zt||_.minFilter!==nr&&_.minFilter!==jn||_.type===Vn&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||n.get(_).__currentAnisotropy){let F=e.get("EXT_texture_filter_anisotropic");i.texParameterf(T,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),n.get(_).__currentAnisotropy=_.anisotropy}}}function xt(T,_){let F=!1;T.__webglInit===void 0&&(T.__webglInit=!0,_.addEventListener("dispose",R));let Z=_.source,$=f.get(Z);$===void 0&&($={},f.set(Z,$));let q=G(_);if(q!==T.__cacheKey){$[q]===void 0&&($[q]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,F=!0),$[q].usedTimes++;let Se=$[T.__cacheKey];Se!==void 0&&($[T.__cacheKey].usedTimes--,Se.usedTimes===0&&S(_)),T.__cacheKey=q,T.__webglTexture=$[q].texture}return F}function Y(T,_,F){let Z=i.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(Z=i.TEXTURE_2D_ARRAY),_.isData3DTexture&&(Z=i.TEXTURE_3D);let $=xt(T,_),q=_.source;t.bindTexture(Z,T.__webglTexture,i.TEXTURE0+F);let Se=n.get(q);if(q.version!==Se.__version||$===!0){t.activeTexture(i.TEXTURE0+F);let le=$e.getPrimaries($e.workingColorSpace),me=_.colorSpace===cn?null:$e.getPrimaries(_.colorSpace),nt=_.colorSpace===cn||le===me?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,nt);let ee=x(_.image,!1,s.maxTextureSize);ee=St(_,ee);let ge=r.convert(_.format,_.colorSpace),Ne=r.convert(_.type),Be=b(_.internalFormat,ge,Ne,_.colorSpace,_.isVideoTexture);Ze(Z,_);let xe,et=_.mipmaps,qe=_.isVideoTexture!==!0,vt=Se.__version===void 0||$===!0,L=q.dataReady,ae=N(_,ee);if(_.isDepthTexture)Be=v(_.format===dr,_.type),vt&&(qe?t.texStorage2D(i.TEXTURE_2D,1,Be,ee.width,ee.height):t.texImage2D(i.TEXTURE_2D,0,Be,ee.width,ee.height,0,ge,Ne,null));else if(_.isDataTexture)if(et.length>0){qe&&vt&&t.texStorage2D(i.TEXTURE_2D,ae,Be,et[0].width,et[0].height);for(let W=0,K=et.length;W<K;W++)xe=et[W],qe?L&&t.texSubImage2D(i.TEXTURE_2D,W,0,0,xe.width,xe.height,ge,Ne,xe.data):t.texImage2D(i.TEXTURE_2D,W,Be,xe.width,xe.height,0,ge,Ne,xe.data);_.generateMipmaps=!1}else qe?(vt&&t.texStorage2D(i.TEXTURE_2D,ae,Be,ee.width,ee.height),L&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ee.width,ee.height,ge,Ne,ee.data)):t.texImage2D(i.TEXTURE_2D,0,Be,ee.width,ee.height,0,ge,Ne,ee.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){qe&&vt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ae,Be,et[0].width,et[0].height,ee.depth);for(let W=0,K=et.length;W<K;W++)if(xe=et[W],_.format!==Cn)if(ge!==null)if(qe){if(L)if(_.layerUpdates.size>0){let fe=Xf(xe.width,xe.height,_.format,_.type);for(let ue of _.layerUpdates){let Ge=xe.data.subarray(ue*fe/xe.data.BYTES_PER_ELEMENT,(ue+1)*fe/xe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,W,0,0,ue,xe.width,xe.height,1,ge,Ge)}_.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,W,0,0,0,xe.width,xe.height,ee.depth,ge,xe.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,W,Be,xe.width,xe.height,ee.depth,0,xe.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else qe?L&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,W,0,0,0,xe.width,xe.height,ee.depth,ge,Ne,xe.data):t.texImage3D(i.TEXTURE_2D_ARRAY,W,Be,xe.width,xe.height,ee.depth,0,ge,Ne,xe.data)}else{qe&&vt&&t.texStorage2D(i.TEXTURE_2D,ae,Be,et[0].width,et[0].height);for(let W=0,K=et.length;W<K;W++)xe=et[W],_.format!==Cn?ge!==null?qe?L&&t.compressedTexSubImage2D(i.TEXTURE_2D,W,0,0,xe.width,xe.height,ge,xe.data):t.compressedTexImage2D(i.TEXTURE_2D,W,Be,xe.width,xe.height,0,xe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):qe?L&&t.texSubImage2D(i.TEXTURE_2D,W,0,0,xe.width,xe.height,ge,Ne,xe.data):t.texImage2D(i.TEXTURE_2D,W,Be,xe.width,xe.height,0,ge,Ne,xe.data)}else if(_.isDataArrayTexture)if(qe){if(vt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ae,Be,ee.width,ee.height,ee.depth),L)if(_.layerUpdates.size>0){let W=Xf(ee.width,ee.height,_.format,_.type);for(let K of _.layerUpdates){let fe=ee.data.subarray(K*W/ee.data.BYTES_PER_ELEMENT,(K+1)*W/ee.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,K,ee.width,ee.height,1,ge,Ne,fe)}_.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ee.width,ee.height,ee.depth,ge,Ne,ee.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Be,ee.width,ee.height,ee.depth,0,ge,Ne,ee.data);else if(_.isData3DTexture)qe?(vt&&t.texStorage3D(i.TEXTURE_3D,ae,Be,ee.width,ee.height,ee.depth),L&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ee.width,ee.height,ee.depth,ge,Ne,ee.data)):t.texImage3D(i.TEXTURE_3D,0,Be,ee.width,ee.height,ee.depth,0,ge,Ne,ee.data);else if(_.isFramebufferTexture){if(vt)if(qe)t.texStorage2D(i.TEXTURE_2D,ae,Be,ee.width,ee.height);else{let W=ee.width,K=ee.height;for(let fe=0;fe<ae;fe++)t.texImage2D(i.TEXTURE_2D,fe,Be,W,K,0,ge,Ne,null),W>>=1,K>>=1}}else if(et.length>0){if(qe&&vt){let W=Pe(et[0]);t.texStorage2D(i.TEXTURE_2D,ae,Be,W.width,W.height)}for(let W=0,K=et.length;W<K;W++)xe=et[W],qe?L&&t.texSubImage2D(i.TEXTURE_2D,W,0,0,ge,Ne,xe):t.texImage2D(i.TEXTURE_2D,W,Be,ge,Ne,xe);_.generateMipmaps=!1}else if(qe){if(vt){let W=Pe(ee);t.texStorage2D(i.TEXTURE_2D,ae,Be,W.width,W.height)}L&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ge,Ne,ee)}else t.texImage2D(i.TEXTURE_2D,0,Be,ge,Ne,ee);m(_)&&d(Z),Se.__version=q.version,_.onUpdate&&_.onUpdate(_)}T.__version=_.version}function ne(T,_,F){if(_.image.length!==6)return;let Z=xt(T,_),$=_.source;t.bindTexture(i.TEXTURE_CUBE_MAP,T.__webglTexture,i.TEXTURE0+F);let q=n.get($);if($.version!==q.__version||Z===!0){t.activeTexture(i.TEXTURE0+F);let Se=$e.getPrimaries($e.workingColorSpace),le=_.colorSpace===cn?null:$e.getPrimaries(_.colorSpace),me=_.colorSpace===cn||Se===le?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,me);let nt=_.isCompressedTexture||_.image[0].isCompressedTexture,ee=_.image[0]&&_.image[0].isDataTexture,ge=[];for(let K=0;K<6;K++)!nt&&!ee?ge[K]=x(_.image[K],!0,s.maxCubemapSize):ge[K]=ee?_.image[K].image:_.image[K],ge[K]=St(_,ge[K]);let Ne=ge[0],Be=r.convert(_.format,_.colorSpace),xe=r.convert(_.type),et=b(_.internalFormat,Be,xe,_.colorSpace),qe=_.isVideoTexture!==!0,vt=q.__version===void 0||Z===!0,L=$.dataReady,ae=N(_,Ne);Ze(i.TEXTURE_CUBE_MAP,_);let W;if(nt){qe&&vt&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ae,et,Ne.width,Ne.height);for(let K=0;K<6;K++){W=ge[K].mipmaps;for(let fe=0;fe<W.length;fe++){let ue=W[fe];_.format!==Cn?Be!==null?qe?L&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe,0,0,ue.width,ue.height,Be,ue.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe,et,ue.width,ue.height,0,ue.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):qe?L&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe,0,0,ue.width,ue.height,Be,xe,ue.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe,et,ue.width,ue.height,0,Be,xe,ue.data)}}}else{if(W=_.mipmaps,qe&&vt){W.length>0&&ae++;let K=Pe(ge[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,ae,et,K.width,K.height)}for(let K=0;K<6;K++)if(ee){qe?L&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,ge[K].width,ge[K].height,Be,xe,ge[K].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,et,ge[K].width,ge[K].height,0,Be,xe,ge[K].data);for(let fe=0;fe<W.length;fe++){let Ge=W[fe].image[K].image;qe?L&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe+1,0,0,Ge.width,Ge.height,Be,xe,Ge.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe+1,et,Ge.width,Ge.height,0,Be,xe,Ge.data)}}else{qe?L&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,Be,xe,ge[K]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,et,Be,xe,ge[K]);for(let fe=0;fe<W.length;fe++){let ue=W[fe];qe?L&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe+1,0,0,Be,xe,ue.image[K]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe+1,et,Be,xe,ue.image[K])}}}m(_)&&d(i.TEXTURE_CUBE_MAP),q.__version=$.version,_.onUpdate&&_.onUpdate(_)}T.__version=_.version}function Ae(T,_,F,Z,$,q){let Se=r.convert(F.format,F.colorSpace),le=r.convert(F.type),me=b(F.internalFormat,Se,le,F.colorSpace),nt=n.get(_),ee=n.get(F);if(ee.__renderTarget=_,!nt.__hasExternalTextures){let ge=Math.max(1,_.width>>q),Ne=Math.max(1,_.height>>q);$===i.TEXTURE_3D||$===i.TEXTURE_2D_ARRAY?t.texImage3D($,q,me,ge,Ne,_.depth,0,Se,le,null):t.texImage2D($,q,me,ge,Ne,0,Se,le,null)}t.bindFramebuffer(i.FRAMEBUFFER,T),Qe(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Z,$,ee.__webglTexture,0,je(_)):($===i.TEXTURE_2D||$>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,Z,$,ee.__webglTexture,q),t.bindFramebuffer(i.FRAMEBUFFER,null)}function ce(T,_,F){if(i.bindRenderbuffer(i.RENDERBUFFER,T),_.depthBuffer){let Z=_.depthTexture,$=Z&&Z.isDepthTexture?Z.type:null,q=v(_.stencilBuffer,$),Se=_.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,le=je(_);Qe(_)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,le,q,_.width,_.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,le,q,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,q,_.width,_.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Se,i.RENDERBUFFER,T)}else{let Z=_.textures;for(let $=0;$<Z.length;$++){let q=Z[$],Se=r.convert(q.format,q.colorSpace),le=r.convert(q.type),me=b(q.internalFormat,Se,le,q.colorSpace),nt=je(_);F&&Qe(_)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,nt,me,_.width,_.height):Qe(_)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,nt,me,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,me,_.width,_.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Oe(T,_){if(_&&_.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,T),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let Z=n.get(_.depthTexture);Z.__renderTarget=_,(!Z.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),J(_.depthTexture,0);let $=Z.__webglTexture,q=je(_);if(_.depthTexture.format===or)Qe(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,$,0,q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,$,0);else if(_.depthTexture.format===dr)Qe(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,$,0,q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,$,0);else throw new Error("Unknown depthTexture format")}function ke(T){let _=n.get(T),F=T.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==T.depthTexture){let Z=T.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),Z){let $=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,Z.removeEventListener("dispose",$)};Z.addEventListener("dispose",$),_.__depthDisposeCallback=$}_.__boundDepthTexture=Z}if(T.depthTexture&&!_.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");Oe(_.__webglFramebuffer,T)}else if(F){_.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[Z]),_.__webglDepthbuffer[Z]===void 0)_.__webglDepthbuffer[Z]=i.createRenderbuffer(),ce(_.__webglDepthbuffer[Z],T,!1);else{let $=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,q=_.__webglDepthbuffer[Z];i.bindRenderbuffer(i.RENDERBUFFER,q),i.framebufferRenderbuffer(i.FRAMEBUFFER,$,i.RENDERBUFFER,q)}}else if(t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=i.createRenderbuffer(),ce(_.__webglDepthbuffer,T,!1);else{let Z=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,$=_.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,$),i.framebufferRenderbuffer(i.FRAMEBUFFER,Z,i.RENDERBUFFER,$)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ke(T,_,F){let Z=n.get(T);_!==void 0&&Ae(Z.__webglFramebuffer,T,T.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),F!==void 0&&ke(T)}function Ct(T){let _=T.texture,F=n.get(T),Z=n.get(_);T.addEventListener("dispose",C);let $=T.textures,q=T.isWebGLCubeRenderTarget===!0,Se=$.length>1;if(Se||(Z.__webglTexture===void 0&&(Z.__webglTexture=i.createTexture()),Z.__version=_.version,o.memory.textures++),q){F.__webglFramebuffer=[];for(let le=0;le<6;le++)if(_.mipmaps&&_.mipmaps.length>0){F.__webglFramebuffer[le]=[];for(let me=0;me<_.mipmaps.length;me++)F.__webglFramebuffer[le][me]=i.createFramebuffer()}else F.__webglFramebuffer[le]=i.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){F.__webglFramebuffer=[];for(let le=0;le<_.mipmaps.length;le++)F.__webglFramebuffer[le]=i.createFramebuffer()}else F.__webglFramebuffer=i.createFramebuffer();if(Se)for(let le=0,me=$.length;le<me;le++){let nt=n.get($[le]);nt.__webglTexture===void 0&&(nt.__webglTexture=i.createTexture(),o.memory.textures++)}if(T.samples>0&&Qe(T)===!1){F.__webglMultisampledFramebuffer=i.createFramebuffer(),F.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let le=0;le<$.length;le++){let me=$[le];F.__webglColorRenderbuffer[le]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,F.__webglColorRenderbuffer[le]);let nt=r.convert(me.format,me.colorSpace),ee=r.convert(me.type),ge=b(me.internalFormat,nt,ee,me.colorSpace,T.isXRRenderTarget===!0),Ne=je(T);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ne,ge,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+le,i.RENDERBUFFER,F.__webglColorRenderbuffer[le])}i.bindRenderbuffer(i.RENDERBUFFER,null),T.depthBuffer&&(F.__webglDepthRenderbuffer=i.createRenderbuffer(),ce(F.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(q){t.bindTexture(i.TEXTURE_CUBE_MAP,Z.__webglTexture),Ze(i.TEXTURE_CUBE_MAP,_);for(let le=0;le<6;le++)if(_.mipmaps&&_.mipmaps.length>0)for(let me=0;me<_.mipmaps.length;me++)Ae(F.__webglFramebuffer[le][me],T,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+le,me);else Ae(F.__webglFramebuffer[le],T,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+le,0);m(_)&&d(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Se){for(let le=0,me=$.length;le<me;le++){let nt=$[le],ee=n.get(nt);t.bindTexture(i.TEXTURE_2D,ee.__webglTexture),Ze(i.TEXTURE_2D,nt),Ae(F.__webglFramebuffer,T,nt,i.COLOR_ATTACHMENT0+le,i.TEXTURE_2D,0),m(nt)&&d(i.TEXTURE_2D)}t.unbindTexture()}else{let le=i.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(le=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(le,Z.__webglTexture),Ze(le,_),_.mipmaps&&_.mipmaps.length>0)for(let me=0;me<_.mipmaps.length;me++)Ae(F.__webglFramebuffer[me],T,_,i.COLOR_ATTACHMENT0,le,me);else Ae(F.__webglFramebuffer,T,_,i.COLOR_ATTACHMENT0,le,0);m(_)&&d(le),t.unbindTexture()}T.depthBuffer&&ke(T)}function tt(T){let _=T.textures;for(let F=0,Z=_.length;F<Z;F++){let $=_[F];if(m($)){let q=E(T),Se=n.get($).__webglTexture;t.bindTexture(q,Se),d(q),t.unbindTexture()}}}let Ut=[],O=[];function Tn(T){if(T.samples>0){if(Qe(T)===!1){let _=T.textures,F=T.width,Z=T.height,$=i.COLOR_BUFFER_BIT,q=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Se=n.get(T),le=_.length>1;if(le)for(let me=0;me<_.length;me++)t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Se.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Se.__webglFramebuffer);for(let me=0;me<_.length;me++){if(T.resolveDepthBuffer&&(T.depthBuffer&&($|=i.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&($|=i.STENCIL_BUFFER_BIT)),le){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Se.__webglColorRenderbuffer[me]);let nt=n.get(_[me]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,nt,0)}i.blitFramebuffer(0,0,F,Z,0,0,F,Z,$,i.NEAREST),c===!0&&(Ut.length=0,O.length=0,Ut.push(i.COLOR_ATTACHMENT0+me),T.depthBuffer&&T.resolveDepthBuffer===!1&&(Ut.push(q),O.push(q),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,O)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Ut))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),le)for(let me=0;me<_.length;me++){t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.RENDERBUFFER,Se.__webglColorRenderbuffer[me]);let nt=n.get(_[me]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.TEXTURE_2D,nt,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Se.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&c){let _=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[_])}}}function je(T){return Math.min(s.maxSamples,T.samples)}function Qe(T){let _=n.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function De(T){let _=o.render.frame;u.get(T)!==_&&(u.set(T,_),T.update())}function St(T,_){let F=T.colorSpace,Z=T.format,$=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||F!==un&&F!==cn&&($e.getTransfer(F)===pt?(Z!==Cn||$!==_i)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",F)),_}function Pe(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(l.width=T.naturalWidth||T.width,l.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(l.width=T.displayWidth,l.height=T.displayHeight):(l.width=T.width,l.height=T.height),l}this.allocateTextureUnit=B,this.resetTextureUnits=k,this.setTexture2D=J,this.setTexture2DArray=X,this.setTexture3D=Q,this.setTextureCube=V,this.rebindTextures=Ke,this.setupRenderTarget=Ct,this.updateRenderTargetMipmap=tt,this.updateMultisampleRenderTarget=Tn,this.setupDepthRenderbuffer=ke,this.setupFrameBufferTexture=Ae,this.useMultisampledRTT=Qe}function Gv(i,e){function t(n,s=cn){let r,o=$e.getTransfer(s);if(n===_i)return i.UNSIGNED_BYTE;if(n===mu)return i.UNSIGNED_SHORT_4_4_4_4;if(n===gu)return i.UNSIGNED_SHORT_5_5_5_1;if(n===gd)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===pd)return i.BYTE;if(n===md)return i.SHORT;if(n===co)return i.UNSIGNED_SHORT;if(n===pu)return i.INT;if(n===Ms)return i.UNSIGNED_INT;if(n===Vn)return i.FLOAT;if(n===Mo)return i.HALF_FLOAT;if(n===xd)return i.ALPHA;if(n===_d)return i.RGB;if(n===Cn)return i.RGBA;if(n===vd)return i.LUMINANCE;if(n===yd)return i.LUMINANCE_ALPHA;if(n===or)return i.DEPTH_COMPONENT;if(n===dr)return i.DEPTH_STENCIL;if(n===xu)return i.RED;if(n===_u)return i.RED_INTEGER;if(n===Ad)return i.RG;if(n===vu)return i.RG_INTEGER;if(n===yu)return i.RGBA_INTEGER;if(n===_a||n===va||n===ya||n===Aa)if(o===pt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===_a)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===va)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===ya)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Aa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===_a)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===va)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===ya)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Aa)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===al||n===cl||n===ll||n===ul)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===al)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===cl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ll)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ul)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===hl||n===fl||n===dl)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===hl||n===fl)return o===pt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===dl)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===pl||n===ml||n===gl||n===xl||n===_l||n===vl||n===yl||n===Al||n===Ml||n===Sl||n===bl||n===El||n===Tl||n===wl)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===pl)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ml)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===gl)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===xl)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===_l)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===vl)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===yl)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Al)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ml)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Sl)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===bl)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===El)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Tl)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===wl)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ma||n===Rl||n===Cl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Ma)return o===pt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Rl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Cl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Md||n===Il||n===Pl||n===Ll)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Ma)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Il)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Pl)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ll)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===fr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var Yl=class extends Bt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},Lt=class extends Rt{constructor(){super(),this.isGroup=!0,this.type="Group"}},Wv={type:"move"},io=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Lt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Lt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new w,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new w),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Lt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new w,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new w),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null,a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(let x of e.hand.values()){let m=t.getJointPose(x,n),d=this._getHandJoint(l,x);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}let u=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],f=u.position.distanceTo(h.position),p=.02,g=.005;l.inputState.pinching&&f>p+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&f<=p-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Wv)))}return a!==null&&(a.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Lt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Xv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,qv=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Zl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){let s=new Ht,r=e.properties.get(s);r.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Qt({vertexShader:Xv,fragmentShader:qv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Te(new Nt(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Kl=class extends vi{constructor(e,t){super();let n=this,s=null,r=1,o=null,a="local-floor",c=1,l=null,u=null,h=null,f=null,p=null,g=null,x=new Zl,m=t.getContextAttributes(),d=null,E=null,b=[],v=[],N=new Ue,R=null,C=new Bt;C.viewport=new ze;let I=new Bt;I.viewport=new ze;let S=[C,I],A=new Yl,P=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let ne=b[Y];return ne===void 0&&(ne=new io,b[Y]=ne),ne.getTargetRaySpace()},this.getControllerGrip=function(Y){let ne=b[Y];return ne===void 0&&(ne=new io,b[Y]=ne),ne.getGripSpace()},this.getHand=function(Y){let ne=b[Y];return ne===void 0&&(ne=new io,b[Y]=ne),ne.getHandSpace()};function B(Y){let ne=v.indexOf(Y.inputSource);if(ne===-1)return;let Ae=b[ne];Ae!==void 0&&(Ae.update(Y.inputSource,Y.frame,l||o),Ae.dispatchEvent({type:Y.type,data:Y.inputSource}))}function G(){s.removeEventListener("select",B),s.removeEventListener("selectstart",B),s.removeEventListener("selectend",B),s.removeEventListener("squeeze",B),s.removeEventListener("squeezestart",B),s.removeEventListener("squeezeend",B),s.removeEventListener("end",G),s.removeEventListener("inputsourceschange",J);for(let Y=0;Y<b.length;Y++){let ne=v[Y];ne!==null&&(v[Y]=null,b[Y].disconnect(ne))}P=null,k=null,x.reset(),e.setRenderTarget(d),p=null,f=null,h=null,s=null,E=null,xt.stop(),n.isPresenting=!1,e.setPixelRatio(R),e.setSize(N.width,N.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){a=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(Y){l=Y},this.getBaseLayer=function(){return f!==null?f:p},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(d=e.getRenderTarget(),s.addEventListener("select",B),s.addEventListener("selectstart",B),s.addEventListener("selectend",B),s.addEventListener("squeeze",B),s.addEventListener("squeezestart",B),s.addEventListener("squeezeend",B),s.addEventListener("end",G),s.addEventListener("inputsourceschange",J),m.xrCompatible!==!0&&await t.makeXRCompatible(),R=e.getPixelRatio(),e.getSize(N),s.renderState.layers===void 0){let ne={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,ne),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),E=new yi(p.framebufferWidth,p.framebufferHeight,{format:Cn,type:_i,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let ne=null,Ae=null,ce=null;m.depth&&(ce=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ne=m.stencil?dr:or,Ae=m.stencil?fr:Ms);let Oe={colorFormat:t.RGBA8,depthFormat:ce,scaleFactor:r};h=new XRWebGLBinding(s,t),f=h.createProjectionLayer(Oe),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),E=new yi(f.textureWidth,f.textureHeight,{format:Cn,type:_i,depthTexture:new La(f.textureWidth,f.textureHeight,Ae,void 0,void 0,void 0,void 0,void 0,void 0,ne),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}E.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await s.requestReferenceSpace(a),xt.setContext(s),xt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function J(Y){for(let ne=0;ne<Y.removed.length;ne++){let Ae=Y.removed[ne],ce=v.indexOf(Ae);ce>=0&&(v[ce]=null,b[ce].disconnect(Ae))}for(let ne=0;ne<Y.added.length;ne++){let Ae=Y.added[ne],ce=v.indexOf(Ae);if(ce===-1){for(let ke=0;ke<b.length;ke++)if(ke>=v.length){v.push(Ae),ce=ke;break}else if(v[ke]===null){v[ke]=Ae,ce=ke;break}if(ce===-1)break}let Oe=b[ce];Oe&&Oe.connect(Ae)}}let X=new w,Q=new w;function V(Y,ne,Ae){X.setFromMatrixPosition(ne.matrixWorld),Q.setFromMatrixPosition(Ae.matrixWorld);let ce=X.distanceTo(Q),Oe=ne.projectionMatrix.elements,ke=Ae.projectionMatrix.elements,Ke=Oe[14]/(Oe[10]-1),Ct=Oe[14]/(Oe[10]+1),tt=(Oe[9]+1)/Oe[5],Ut=(Oe[9]-1)/Oe[5],O=(Oe[8]-1)/Oe[0],Tn=(ke[8]+1)/ke[0],je=Ke*O,Qe=Ke*Tn,De=ce/(-O+Tn),St=De*-O;if(ne.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(St),Y.translateZ(De),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),Oe[10]===-1)Y.projectionMatrix.copy(ne.projectionMatrix),Y.projectionMatrixInverse.copy(ne.projectionMatrixInverse);else{let Pe=Ke+De,T=Ct+De,_=je-St,F=Qe+(ce-St),Z=tt*Ct/T*Pe,$=Ut*Ct/T*Pe;Y.projectionMatrix.makePerspective(_,F,Z,$,Pe,T),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function ie(Y,ne){ne===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(ne.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let ne=Y.near,Ae=Y.far;x.texture!==null&&(x.depthNear>0&&(ne=x.depthNear),x.depthFar>0&&(Ae=x.depthFar)),A.near=I.near=C.near=ne,A.far=I.far=C.far=Ae,(P!==A.near||k!==A.far)&&(s.updateRenderState({depthNear:A.near,depthFar:A.far}),P=A.near,k=A.far),C.layers.mask=Y.layers.mask|2,I.layers.mask=Y.layers.mask|4,A.layers.mask=C.layers.mask|I.layers.mask;let ce=Y.parent,Oe=A.cameras;ie(A,ce);for(let ke=0;ke<Oe.length;ke++)ie(Oe[ke],ce);Oe.length===2?V(A,C,I):A.projectionMatrix.copy(C.projectionMatrix),pe(Y,A,ce)};function pe(Y,ne,Ae){Ae===null?Y.matrix.copy(ne.matrixWorld):(Y.matrix.copy(Ae.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(ne.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(ne.projectionMatrix),Y.projectionMatrixInverse.copy(ne.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=gr*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return A},this.getFoveation=function(){if(!(f===null&&p===null))return c},this.setFoveation=function(Y){c=Y,f!==null&&(f.fixedFoveation=Y),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Y)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(A)};let Re=null;function Ze(Y,ne){if(u=ne.getViewerPose(l||o),g=ne,u!==null){let Ae=u.views;p!==null&&(e.setRenderTargetFramebuffer(E,p.framebuffer),e.setRenderTarget(E));let ce=!1;Ae.length!==A.cameras.length&&(A.cameras.length=0,ce=!0);for(let ke=0;ke<Ae.length;ke++){let Ke=Ae[ke],Ct=null;if(p!==null)Ct=p.getViewport(Ke);else{let Ut=h.getViewSubImage(f,Ke);Ct=Ut.viewport,ke===0&&(e.setRenderTargetTextures(E,Ut.colorTexture,f.ignoreDepthValues?void 0:Ut.depthStencilTexture),e.setRenderTarget(E))}let tt=S[ke];tt===void 0&&(tt=new Bt,tt.layers.enable(ke),tt.viewport=new ze,S[ke]=tt),tt.matrix.fromArray(Ke.transform.matrix),tt.matrix.decompose(tt.position,tt.quaternion,tt.scale),tt.projectionMatrix.fromArray(Ke.projectionMatrix),tt.projectionMatrixInverse.copy(tt.projectionMatrix).invert(),tt.viewport.set(Ct.x,Ct.y,Ct.width,Ct.height),ke===0&&(A.matrix.copy(tt.matrix),A.matrix.decompose(A.position,A.quaternion,A.scale)),ce===!0&&A.cameras.push(tt)}let Oe=s.enabledFeatures;if(Oe&&Oe.includes("depth-sensing")){let ke=h.getDepthInformation(Ae[0]);ke&&ke.isValid&&ke.texture&&x.init(e,ke,s.renderState)}}for(let Ae=0;Ae<b.length;Ae++){let ce=v[Ae],Oe=b[Ae];ce!==null&&Oe!==void 0&&Oe.update(ce,ne,l||o)}Re&&Re(Y,ne),ne.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ne}),g=null}let xt=new Pd;xt.setAnimationLoop(Ze),this.setAnimationLoop=function(Y){Re=Y},this.dispose=function(){}}},xs=new ti,Yv=new we;function Zv(i,e){function t(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function n(m,d){d.color.getRGB(m.fogColor.value,Id(i)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function s(m,d,E,b,v){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(m,d):d.isMeshToonMaterial?(r(m,d),h(m,d)):d.isMeshPhongMaterial?(r(m,d),u(m,d)):d.isMeshStandardMaterial?(r(m,d),f(m,d),d.isMeshPhysicalMaterial&&p(m,d,v)):d.isMeshMatcapMaterial?(r(m,d),g(m,d)):d.isMeshDepthMaterial?r(m,d):d.isMeshDistanceMaterial?(r(m,d),x(m,d)):d.isMeshNormalMaterial?r(m,d):d.isLineBasicMaterial?(o(m,d),d.isLineDashedMaterial&&a(m,d)):d.isPointsMaterial?c(m,d,E,b):d.isSpriteMaterial?l(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,t(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===ln&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,t(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===ln&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,t(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,t(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);let E=e.get(d),b=E.envMap,v=E.envMapRotation;b&&(m.envMap.value=b,xs.copy(v),xs.x*=-1,xs.y*=-1,xs.z*=-1,b.isCubeTexture&&b.isRenderTargetTexture===!1&&(xs.y*=-1,xs.z*=-1),m.envMapRotation.value.setFromMatrix4(Yv.makeRotationFromEuler(xs)),m.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,m.aoMapTransform))}function o(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform))}function a(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function c(m,d,E,b){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*E,m.scale.value=b*.5,d.map&&(m.map.value=d.map,t(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function l(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function u(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function h(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function f(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function p(m,d,E){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===ln&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=E.texture,m.transmissionSamplerSize.value.set(E.width,E.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,d){d.matcap&&(m.matcap.value=d.matcap)}function x(m,d){let E=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(E.matrixWorld),m.nearDistance.value=E.shadow.camera.near,m.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Kv(i,e,t,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(E,b){let v=b.program;n.uniformBlockBinding(E,v)}function l(E,b){let v=s[E.id];v===void 0&&(g(E),v=u(E),s[E.id]=v,E.addEventListener("dispose",m));let N=b.program;n.updateUBOMapping(E,N);let R=e.render.frame;r[E.id]!==R&&(f(E),r[E.id]=R)}function u(E){let b=h();E.__bindingPointIndex=b;let v=i.createBuffer(),N=E.__size,R=E.usage;return i.bindBuffer(i.UNIFORM_BUFFER,v),i.bufferData(i.UNIFORM_BUFFER,N,R),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,b,v),v}function h(){for(let E=0;E<a;E++)if(o.indexOf(E)===-1)return o.push(E),E;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(E){let b=s[E.id],v=E.uniforms,N=E.__cache;i.bindBuffer(i.UNIFORM_BUFFER,b);for(let R=0,C=v.length;R<C;R++){let I=Array.isArray(v[R])?v[R]:[v[R]];for(let S=0,A=I.length;S<A;S++){let P=I[S];if(p(P,R,S,N)===!0){let k=P.__offset,B=Array.isArray(P.value)?P.value:[P.value],G=0;for(let J=0;J<B.length;J++){let X=B[J],Q=x(X);typeof X=="number"||typeof X=="boolean"?(P.__data[0]=X,i.bufferSubData(i.UNIFORM_BUFFER,k+G,P.__data)):X.isMatrix3?(P.__data[0]=X.elements[0],P.__data[1]=X.elements[1],P.__data[2]=X.elements[2],P.__data[3]=0,P.__data[4]=X.elements[3],P.__data[5]=X.elements[4],P.__data[6]=X.elements[5],P.__data[7]=0,P.__data[8]=X.elements[6],P.__data[9]=X.elements[7],P.__data[10]=X.elements[8],P.__data[11]=0):(X.toArray(P.__data,G),G+=Q.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,k,P.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(E,b,v,N){let R=E.value,C=b+"_"+v;if(N[C]===void 0)return typeof R=="number"||typeof R=="boolean"?N[C]=R:N[C]=R.clone(),!0;{let I=N[C];if(typeof R=="number"||typeof R=="boolean"){if(I!==R)return N[C]=R,!0}else if(I.equals(R)===!1)return I.copy(R),!0}return!1}function g(E){let b=E.uniforms,v=0,N=16;for(let C=0,I=b.length;C<I;C++){let S=Array.isArray(b[C])?b[C]:[b[C]];for(let A=0,P=S.length;A<P;A++){let k=S[A],B=Array.isArray(k.value)?k.value:[k.value];for(let G=0,J=B.length;G<J;G++){let X=B[G],Q=x(X),V=v%N,ie=V%Q.boundary,pe=V+ie;v+=ie,pe!==0&&N-pe<Q.storage&&(v+=N-pe),k.__data=new Float32Array(Q.storage/Float32Array.BYTES_PER_ELEMENT),k.__offset=v,v+=Q.storage}}}let R=v%N;return R>0&&(v+=N-R),E.__size=v,E.__cache={},this}function x(E){let b={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(b.boundary=4,b.storage=4):E.isVector2?(b.boundary=8,b.storage=8):E.isVector3||E.isColor?(b.boundary=16,b.storage=12):E.isVector4?(b.boundary=16,b.storage=16):E.isMatrix3?(b.boundary=48,b.storage=48):E.isMatrix4?(b.boundary=64,b.storage=64):E.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",E),b}function m(E){let b=E.target;b.removeEventListener("dispose",m);let v=o.indexOf(b.__bindingPointIndex);o.splice(v,1),i.deleteBuffer(s[b.id]),delete s[b.id],delete r[b.id]}function d(){for(let E in s)i.deleteBuffer(s[E]);o=[],s={},r={}}return{bind:c,update:l,dispose:d}}var Da=class{constructor(e={}){let{canvas:t=Qm(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reverseDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=o;let g=new Uint32Array(4),x=new Int32Array(4),m=null,d=null,E=[],b=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Tt,this.toneMapping=Ki,this.toneMappingExposure=1;let v=this,N=!1,R=0,C=0,I=null,S=-1,A=null,P=new ze,k=new ze,B=null,G=new Ee(0),J=0,X=t.width,Q=t.height,V=1,ie=null,pe=null,Re=new ze(0,0,X,Q),Ze=new ze(0,0,X,Q),xt=!1,Y=new uo,ne=!1,Ae=!1,ce=new we,Oe=new we,ke=new w,Ke=new ze,Ct={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},tt=!1;function Ut(){return I===null?V:1}let O=n;function Tn(M,D){return t.getContext(M,D)}try{let M={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r170"),t.addEventListener("webglcontextlost",K,!1),t.addEventListener("webglcontextrestored",fe,!1),t.addEventListener("webglcontextcreationerror",ue,!1),O===null){let D="webgl2";if(O=Tn(D,M),O===null)throw Tn(D)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(M){throw console.error("THREE.WebGLRenderer: "+M.message),M}let je,Qe,De,St,Pe,T,_,F,Z,$,q,Se,le,me,nt,ee,ge,Ne,Be,xe,et,qe,vt,L;function ae(){je=new h_(O),je.init(),qe=new Gv(O,je),Qe=new r_(O,je,e,qe),De=new Hv(O,je),Qe.reverseDepthBuffer&&f&&De.buffers.depth.setReversed(!0),St=new p_(O),Pe=new wv,T=new Vv(O,je,De,Pe,Qe,qe,St),_=new a_(v),F=new u_(v),Z=new A0(O),vt=new i_(O,Z),$=new f_(O,Z,St,vt),q=new g_(O,$,Z,St),Be=new m_(O,Qe,T),ee=new o_(Pe),Se=new Tv(v,_,F,je,Qe,vt,ee),le=new Zv(v,Pe),me=new Cv,nt=new Nv(je),Ne=new n_(v,_,F,De,q,p,c),ge=new Bv(v,q,Qe),L=new Kv(O,St,Qe,De),xe=new s_(O,je,St),et=new d_(O,je,St),St.programs=Se.programs,v.capabilities=Qe,v.extensions=je,v.properties=Pe,v.renderLists=me,v.shadowMap=ge,v.state=De,v.info=St}ae();let W=new Kl(v,O);this.xr=W,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){let M=je.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){let M=je.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return V},this.setPixelRatio=function(M){M!==void 0&&(V=M,this.setSize(X,Q,!1))},this.getSize=function(M){return M.set(X,Q)},this.setSize=function(M,D,z=!0){if(W.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}X=M,Q=D,t.width=Math.floor(M*V),t.height=Math.floor(D*V),z===!0&&(t.style.width=M+"px",t.style.height=D+"px"),this.setViewport(0,0,M,D)},this.getDrawingBufferSize=function(M){return M.set(X*V,Q*V).floor()},this.setDrawingBufferSize=function(M,D,z){X=M,Q=D,V=z,t.width=Math.floor(M*z),t.height=Math.floor(D*z),this.setViewport(0,0,M,D)},this.getCurrentViewport=function(M){return M.copy(P)},this.getViewport=function(M){return M.copy(Re)},this.setViewport=function(M,D,z,H){M.isVector4?Re.set(M.x,M.y,M.z,M.w):Re.set(M,D,z,H),De.viewport(P.copy(Re).multiplyScalar(V).round())},this.getScissor=function(M){return M.copy(Ze)},this.setScissor=function(M,D,z,H){M.isVector4?Ze.set(M.x,M.y,M.z,M.w):Ze.set(M,D,z,H),De.scissor(k.copy(Ze).multiplyScalar(V).round())},this.getScissorTest=function(){return xt},this.setScissorTest=function(M){De.setScissorTest(xt=M)},this.setOpaqueSort=function(M){ie=M},this.setTransparentSort=function(M){pe=M},this.getClearColor=function(M){return M.copy(Ne.getClearColor())},this.setClearColor=function(){Ne.setClearColor.apply(Ne,arguments)},this.getClearAlpha=function(){return Ne.getClearAlpha()},this.setClearAlpha=function(){Ne.setClearAlpha.apply(Ne,arguments)},this.clear=function(M=!0,D=!0,z=!0){let H=0;if(M){let U=!1;if(I!==null){let te=I.texture.format;U=te===yu||te===vu||te===_u}if(U){let te=I.texture.type,he=te===_i||te===Ms||te===co||te===fr||te===mu||te===gu,_e=Ne.getClearColor(),ve=Ne.getClearAlpha(),He=_e.r,We=_e.g,ye=_e.b;he?(g[0]=He,g[1]=We,g[2]=ye,g[3]=ve,O.clearBufferuiv(O.COLOR,0,g)):(x[0]=He,x[1]=We,x[2]=ye,x[3]=ve,O.clearBufferiv(O.COLOR,0,x))}else H|=O.COLOR_BUFFER_BIT}D&&(H|=O.DEPTH_BUFFER_BIT),z&&(H|=O.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),O.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",K,!1),t.removeEventListener("webglcontextrestored",fe,!1),t.removeEventListener("webglcontextcreationerror",ue,!1),me.dispose(),nt.dispose(),Pe.dispose(),_.dispose(),F.dispose(),q.dispose(),vt.dispose(),L.dispose(),Se.dispose(),W.dispose(),W.removeEventListener("sessionstart",Hh),W.removeEventListener("sessionend",kh),hs.stop()};function K(M){M.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),N=!0}function fe(){console.log("THREE.WebGLRenderer: Context Restored."),N=!1;let M=St.autoReset,D=ge.enabled,z=ge.autoUpdate,H=ge.needsUpdate,U=ge.type;ae(),St.autoReset=M,ge.enabled=D,ge.autoUpdate=z,ge.needsUpdate=H,ge.type=U}function ue(M){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function Ge(M){let D=M.target;D.removeEventListener("dispose",Ge),Pt(D)}function Pt(M){nn(M),Pe.remove(M)}function nn(M){let D=Pe.get(M).programs;D!==void 0&&(D.forEach(function(z){Se.releaseProgram(z)}),M.isShaderMaterial&&Se.releaseShaderCache(M))}this.renderBufferDirect=function(M,D,z,H,U,te){D===null&&(D=Ct);let he=U.isMesh&&U.matrixWorld.determinant()<0,_e=Zp(M,D,z,H,U);De.setMaterial(H,he);let ve=z.index,He=1;if(H.wireframe===!0){if(ve=$.getWireframeAttribute(z),ve===void 0)return;He=2}let We=z.drawRange,ye=z.attributes.position,st=We.start*He,yt=(We.start+We.count)*He;te!==null&&(st=Math.max(st,te.start*He),yt=Math.min(yt,(te.start+te.count)*He)),ve!==null?(st=Math.max(st,0),yt=Math.min(yt,ve.count)):ye!=null&&(st=Math.max(st,0),yt=Math.min(yt,ye.count));let bt=yt-st;if(bt<0||bt===1/0)return;vt.setup(U,H,_e,z,ve);let xn,ct=xe;if(ve!==null&&(xn=Z.get(ve),ct=et,ct.setIndex(xn)),U.isMesh)H.wireframe===!0?(De.setLineWidth(H.wireframeLinewidth*Ut()),ct.setMode(O.LINES)):ct.setMode(O.TRIANGLES);else if(U.isLine){let be=H.linewidth;be===void 0&&(be=1),De.setLineWidth(be*Ut()),U.isLineSegments?ct.setMode(O.LINES):U.isLineLoop?ct.setMode(O.LINE_LOOP):ct.setMode(O.LINE_STRIP)}else U.isPoints?ct.setMode(O.POINTS):U.isSprite&&ct.setMode(O.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)ct.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(je.get("WEBGL_multi_draw"))ct.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{let be=U._multiDrawStarts,oi=U._multiDrawCounts,lt=U._multiDrawCount,Fn=ve?Z.get(ve).bytesPerElement:1,Os=Pe.get(H).currentProgram.getUniforms();for(let vn=0;vn<lt;vn++)Os.setValue(O,"_gl_DrawID",vn),ct.render(be[vn]/Fn,oi[vn])}else if(U.isInstancedMesh)ct.renderInstances(st,bt,U.count);else if(z.isInstancedBufferGeometry){let be=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,oi=Math.min(z.instanceCount,be);ct.renderInstances(st,bt,oi)}else ct.render(st,bt)};function ut(M,D,z){M.transparent===!0&&M.side===an&&M.forceSinglePass===!1?(M.side=ln,M.needsUpdate=!0,Vo(M,D,z),M.side=Qn,M.needsUpdate=!0,Vo(M,D,z),M.side=an):Vo(M,D,z)}this.compile=function(M,D,z=null){z===null&&(z=M),d=nt.get(z),d.init(D),b.push(d),z.traverseVisible(function(U){U.isLight&&U.layers.test(D.layers)&&(d.pushLight(U),U.castShadow&&d.pushShadow(U))}),M!==z&&M.traverseVisible(function(U){U.isLight&&U.layers.test(D.layers)&&(d.pushLight(U),U.castShadow&&d.pushShadow(U))}),d.setupLights();let H=new Set;return M.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;let te=U.material;if(te)if(Array.isArray(te))for(let he=0;he<te.length;he++){let _e=te[he];ut(_e,z,U),H.add(_e)}else ut(te,z,U),H.add(te)}),b.pop(),d=null,H},this.compileAsync=function(M,D,z=null){let H=this.compile(M,D,z);return new Promise(U=>{function te(){if(H.forEach(function(he){Pe.get(he).currentProgram.isReady()&&H.delete(he)}),H.size===0){U(M);return}setTimeout(te,10)}je.get("KHR_parallel_shader_compile")!==null?te():setTimeout(te,10)})};let On=null;function ri(M){On&&On(M)}function Hh(){hs.stop()}function kh(){hs.start()}let hs=new Pd;hs.setAnimationLoop(ri),typeof self<"u"&&hs.setContext(self),this.setAnimationLoop=function(M){On=M,W.setAnimationLoop(M),M===null?hs.stop():hs.start()},W.addEventListener("sessionstart",Hh),W.addEventListener("sessionend",kh),this.render=function(M,D){if(D!==void 0&&D.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(N===!0)return;if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),W.enabled===!0&&W.isPresenting===!0&&(W.cameraAutoUpdate===!0&&W.updateCamera(D),D=W.getCamera()),M.isScene===!0&&M.onBeforeRender(v,M,D,I),d=nt.get(M,b.length),d.init(D),b.push(d),Oe.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),Y.setFromProjectionMatrix(Oe),Ae=this.localClippingEnabled,ne=ee.init(this.clippingPlanes,Ae),m=me.get(M,E.length),m.init(),E.push(m),W.enabled===!0&&W.isPresenting===!0){let te=v.xr.getDepthSensingMesh();te!==null&&vc(te,D,-1/0,v.sortObjects)}vc(M,D,0,v.sortObjects),m.finish(),v.sortObjects===!0&&m.sort(ie,pe),tt=W.enabled===!1||W.isPresenting===!1||W.hasDepthSensing()===!1,tt&&Ne.addToRenderList(m,M),this.info.render.frame++,ne===!0&&ee.beginShadows();let z=d.state.shadowsArray;ge.render(z,M,D),ne===!0&&ee.endShadows(),this.info.autoReset===!0&&this.info.reset();let H=m.opaque,U=m.transmissive;if(d.setupLights(),D.isArrayCamera){let te=D.cameras;if(U.length>0)for(let he=0,_e=te.length;he<_e;he++){let ve=te[he];Gh(H,U,M,ve)}tt&&Ne.render(M);for(let he=0,_e=te.length;he<_e;he++){let ve=te[he];Vh(m,M,ve,ve.viewport)}}else U.length>0&&Gh(H,U,M,D),tt&&Ne.render(M),Vh(m,M,D);I!==null&&(T.updateMultisampleRenderTarget(I),T.updateRenderTargetMipmap(I)),M.isScene===!0&&M.onAfterRender(v,M,D),vt.resetDefaultState(),S=-1,A=null,b.pop(),b.length>0?(d=b[b.length-1],ne===!0&&ee.setGlobalState(v.clippingPlanes,d.state.camera)):d=null,E.pop(),E.length>0?m=E[E.length-1]:m=null};function vc(M,D,z,H){if(M.visible===!1)return;if(M.layers.test(D.layers)){if(M.isGroup)z=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(D);else if(M.isLight)d.pushLight(M),M.castShadow&&d.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||Y.intersectsSprite(M)){H&&Ke.setFromMatrixPosition(M.matrixWorld).applyMatrix4(Oe);let he=q.update(M),_e=M.material;_e.visible&&m.push(M,he,_e,z,Ke.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||Y.intersectsObject(M))){let he=q.update(M),_e=M.material;if(H&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),Ke.copy(M.boundingSphere.center)):(he.boundingSphere===null&&he.computeBoundingSphere(),Ke.copy(he.boundingSphere.center)),Ke.applyMatrix4(M.matrixWorld).applyMatrix4(Oe)),Array.isArray(_e)){let ve=he.groups;for(let He=0,We=ve.length;He<We;He++){let ye=ve[He],st=_e[ye.materialIndex];st&&st.visible&&m.push(M,he,st,z,Ke.z,ye)}}else _e.visible&&m.push(M,he,_e,z,Ke.z,null)}}let te=M.children;for(let he=0,_e=te.length;he<_e;he++)vc(te[he],D,z,H)}function Vh(M,D,z,H){let U=M.opaque,te=M.transmissive,he=M.transparent;d.setupLightsView(z),ne===!0&&ee.setGlobalState(v.clippingPlanes,z),H&&De.viewport(P.copy(H)),U.length>0&&ko(U,D,z),te.length>0&&ko(te,D,z),he.length>0&&ko(he,D,z),De.buffers.depth.setTest(!0),De.buffers.depth.setMask(!0),De.buffers.color.setMask(!0),De.setPolygonOffset(!1)}function Gh(M,D,z,H){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[H.id]===void 0&&(d.state.transmissionRenderTarget[H.id]=new yi(1,1,{generateMipmaps:!0,type:je.has("EXT_color_buffer_half_float")||je.has("EXT_color_buffer_float")?Mo:_i,minFilter:jn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:$e.workingColorSpace}));let te=d.state.transmissionRenderTarget[H.id],he=H.viewport||P;te.setSize(he.z,he.w);let _e=v.getRenderTarget();v.setRenderTarget(te),v.getClearColor(G),J=v.getClearAlpha(),J<1&&v.setClearColor(16777215,.5),v.clear(),tt&&Ne.render(z);let ve=v.toneMapping;v.toneMapping=Ki;let He=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),d.setupLightsView(H),ne===!0&&ee.setGlobalState(v.clippingPlanes,H),ko(M,z,H),T.updateMultisampleRenderTarget(te),T.updateRenderTargetMipmap(te),je.has("WEBGL_multisampled_render_to_texture")===!1){let We=!1;for(let ye=0,st=D.length;ye<st;ye++){let yt=D[ye],bt=yt.object,xn=yt.geometry,ct=yt.material,be=yt.group;if(ct.side===an&&bt.layers.test(H.layers)){let oi=ct.side;ct.side=ln,ct.needsUpdate=!0,Wh(bt,z,H,xn,ct,be),ct.side=oi,ct.needsUpdate=!0,We=!0}}We===!0&&(T.updateMultisampleRenderTarget(te),T.updateRenderTargetMipmap(te))}v.setRenderTarget(_e),v.setClearColor(G,J),He!==void 0&&(H.viewport=He),v.toneMapping=ve}function ko(M,D,z){let H=D.isScene===!0?D.overrideMaterial:null;for(let U=0,te=M.length;U<te;U++){let he=M[U],_e=he.object,ve=he.geometry,He=H===null?he.material:H,We=he.group;_e.layers.test(z.layers)&&Wh(_e,D,z,ve,He,We)}}function Wh(M,D,z,H,U,te){M.onBeforeRender(v,D,z,H,U,te),M.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),U.onBeforeRender(v,D,z,H,M,te),U.transparent===!0&&U.side===an&&U.forceSinglePass===!1?(U.side=ln,U.needsUpdate=!0,v.renderBufferDirect(z,D,H,U,M,te),U.side=Qn,U.needsUpdate=!0,v.renderBufferDirect(z,D,H,U,M,te),U.side=an):v.renderBufferDirect(z,D,H,U,M,te),M.onAfterRender(v,D,z,H,U,te)}function Vo(M,D,z){D.isScene!==!0&&(D=Ct);let H=Pe.get(M),U=d.state.lights,te=d.state.shadowsArray,he=U.state.version,_e=Se.getParameters(M,U.state,te,D,z),ve=Se.getProgramCacheKey(_e),He=H.programs;H.environment=M.isMeshStandardMaterial?D.environment:null,H.fog=D.fog,H.envMap=(M.isMeshStandardMaterial?F:_).get(M.envMap||H.environment),H.envMapRotation=H.environment!==null&&M.envMap===null?D.environmentRotation:M.envMapRotation,He===void 0&&(M.addEventListener("dispose",Ge),He=new Map,H.programs=He);let We=He.get(ve);if(We!==void 0){if(H.currentProgram===We&&H.lightsStateVersion===he)return qh(M,_e),We}else _e.uniforms=Se.getUniforms(M),M.onBeforeCompile(_e,v),We=Se.acquireProgram(_e,ve),He.set(ve,We),H.uniforms=_e.uniforms;let ye=H.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(ye.clippingPlanes=ee.uniform),qh(M,_e),H.needsLights=Jp(M),H.lightsStateVersion=he,H.needsLights&&(ye.ambientLightColor.value=U.state.ambient,ye.lightProbe.value=U.state.probe,ye.directionalLights.value=U.state.directional,ye.directionalLightShadows.value=U.state.directionalShadow,ye.spotLights.value=U.state.spot,ye.spotLightShadows.value=U.state.spotShadow,ye.rectAreaLights.value=U.state.rectArea,ye.ltc_1.value=U.state.rectAreaLTC1,ye.ltc_2.value=U.state.rectAreaLTC2,ye.pointLights.value=U.state.point,ye.pointLightShadows.value=U.state.pointShadow,ye.hemisphereLights.value=U.state.hemi,ye.directionalShadowMap.value=U.state.directionalShadowMap,ye.directionalShadowMatrix.value=U.state.directionalShadowMatrix,ye.spotShadowMap.value=U.state.spotShadowMap,ye.spotLightMatrix.value=U.state.spotLightMatrix,ye.spotLightMap.value=U.state.spotLightMap,ye.pointShadowMap.value=U.state.pointShadowMap,ye.pointShadowMatrix.value=U.state.pointShadowMatrix),H.currentProgram=We,H.uniformsList=null,We}function Xh(M){if(M.uniformsList===null){let D=M.currentProgram.getUniforms();M.uniformsList=cr.seqWithValue(D.seq,M.uniforms)}return M.uniformsList}function qh(M,D){let z=Pe.get(M);z.outputColorSpace=D.outputColorSpace,z.batching=D.batching,z.batchingColor=D.batchingColor,z.instancing=D.instancing,z.instancingColor=D.instancingColor,z.instancingMorph=D.instancingMorph,z.skinning=D.skinning,z.morphTargets=D.morphTargets,z.morphNormals=D.morphNormals,z.morphColors=D.morphColors,z.morphTargetsCount=D.morphTargetsCount,z.numClippingPlanes=D.numClippingPlanes,z.numIntersection=D.numClipIntersection,z.vertexAlphas=D.vertexAlphas,z.vertexTangents=D.vertexTangents,z.toneMapping=D.toneMapping}function Zp(M,D,z,H,U){D.isScene!==!0&&(D=Ct),T.resetTextureUnits();let te=D.fog,he=H.isMeshStandardMaterial?D.environment:null,_e=I===null?v.outputColorSpace:I.isXRRenderTarget===!0?I.texture.colorSpace:un,ve=(H.isMeshStandardMaterial?F:_).get(H.envMap||he),He=H.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,We=!!z.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),ye=!!z.morphAttributes.position,st=!!z.morphAttributes.normal,yt=!!z.morphAttributes.color,bt=Ki;H.toneMapped&&(I===null||I.isXRRenderTarget===!0)&&(bt=v.toneMapping);let xn=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,ct=xn!==void 0?xn.length:0,be=Pe.get(H),oi=d.state.lights;if(ne===!0&&(Ae===!0||M!==A)){let wn=M===A&&H.id===S;ee.setState(H,M,wn)}let lt=!1;H.version===be.__version?(be.needsLights&&be.lightsStateVersion!==oi.state.version||be.outputColorSpace!==_e||U.isBatchedMesh&&be.batching===!1||!U.isBatchedMesh&&be.batching===!0||U.isBatchedMesh&&be.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&be.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&be.instancing===!1||!U.isInstancedMesh&&be.instancing===!0||U.isSkinnedMesh&&be.skinning===!1||!U.isSkinnedMesh&&be.skinning===!0||U.isInstancedMesh&&be.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&be.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&be.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&be.instancingMorph===!1&&U.morphTexture!==null||be.envMap!==ve||H.fog===!0&&be.fog!==te||be.numClippingPlanes!==void 0&&(be.numClippingPlanes!==ee.numPlanes||be.numIntersection!==ee.numIntersection)||be.vertexAlphas!==He||be.vertexTangents!==We||be.morphTargets!==ye||be.morphNormals!==st||be.morphColors!==yt||be.toneMapping!==bt||be.morphTargetsCount!==ct)&&(lt=!0):(lt=!0,be.__version=H.version);let Fn=be.currentProgram;lt===!0&&(Fn=Vo(H,D,U));let Os=!1,vn=!1,zr=!1,Et=Fn.getUniforms(),Jn=be.uniforms;if(De.useProgram(Fn.program)&&(Os=!0,vn=!0,zr=!0),H.id!==S&&(S=H.id,vn=!0),Os||A!==M){De.buffers.depth.getReversed()?(ce.copy(M.projectionMatrix),t0(ce),n0(ce),Et.setValue(O,"projectionMatrix",ce)):Et.setValue(O,"projectionMatrix",M.projectionMatrix),Et.setValue(O,"viewMatrix",M.matrixWorldInverse);let Fi=Et.map.cameraPosition;Fi!==void 0&&Fi.setValue(O,ke.setFromMatrixPosition(M.matrixWorld)),Qe.logarithmicDepthBuffer&&Et.setValue(O,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&Et.setValue(O,"isOrthographic",M.isOrthographicCamera===!0),A!==M&&(A=M,vn=!0,zr=!0)}if(U.isSkinnedMesh){Et.setOptional(O,U,"bindMatrix"),Et.setOptional(O,U,"bindMatrixInverse");let wn=U.skeleton;wn&&(wn.boneTexture===null&&wn.computeBoneTexture(),Et.setValue(O,"boneTexture",wn.boneTexture,T))}U.isBatchedMesh&&(Et.setOptional(O,U,"batchingTexture"),Et.setValue(O,"batchingTexture",U._matricesTexture,T),Et.setOptional(O,U,"batchingIdTexture"),Et.setValue(O,"batchingIdTexture",U._indirectTexture,T),Et.setOptional(O,U,"batchingColorTexture"),U._colorsTexture!==null&&Et.setValue(O,"batchingColorTexture",U._colorsTexture,T));let Hr=z.morphAttributes;if((Hr.position!==void 0||Hr.normal!==void 0||Hr.color!==void 0)&&Be.update(U,z,Fn),(vn||be.receiveShadow!==U.receiveShadow)&&(be.receiveShadow=U.receiveShadow,Et.setValue(O,"receiveShadow",U.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(Jn.envMap.value=ve,Jn.flipEnvMap.value=ve.isCubeTexture&&ve.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&D.environment!==null&&(Jn.envMapIntensity.value=D.environmentIntensity),vn&&(Et.setValue(O,"toneMappingExposure",v.toneMappingExposure),be.needsLights&&Kp(Jn,zr),te&&H.fog===!0&&le.refreshFogUniforms(Jn,te),le.refreshMaterialUniforms(Jn,H,V,Q,d.state.transmissionRenderTarget[M.id]),cr.upload(O,Xh(be),Jn,T)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(cr.upload(O,Xh(be),Jn,T),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&Et.setValue(O,"center",U.center),Et.setValue(O,"modelViewMatrix",U.modelViewMatrix),Et.setValue(O,"normalMatrix",U.normalMatrix),Et.setValue(O,"modelMatrix",U.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){let wn=H.uniformsGroups;for(let Fi=0,Bi=wn.length;Fi<Bi;Fi++){let Yh=wn[Fi];L.update(Yh,Fn),L.bind(Yh,Fn)}}return Fn}function Kp(M,D){M.ambientLightColor.needsUpdate=D,M.lightProbe.needsUpdate=D,M.directionalLights.needsUpdate=D,M.directionalLightShadows.needsUpdate=D,M.pointLights.needsUpdate=D,M.pointLightShadows.needsUpdate=D,M.spotLights.needsUpdate=D,M.spotLightShadows.needsUpdate=D,M.rectAreaLights.needsUpdate=D,M.hemisphereLights.needsUpdate=D}function Jp(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return I},this.setRenderTargetTextures=function(M,D,z){Pe.get(M.texture).__webglTexture=D,Pe.get(M.depthTexture).__webglTexture=z;let H=Pe.get(M);H.__hasExternalTextures=!0,H.__autoAllocateDepthBuffer=z===void 0,H.__autoAllocateDepthBuffer||je.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(M,D){let z=Pe.get(M);z.__webglFramebuffer=D,z.__useDefaultFramebuffer=D===void 0},this.setRenderTarget=function(M,D=0,z=0){I=M,R=D,C=z;let H=!0,U=null,te=!1,he=!1;if(M){let ve=Pe.get(M);if(ve.__useDefaultFramebuffer!==void 0)De.bindFramebuffer(O.FRAMEBUFFER,null),H=!1;else if(ve.__webglFramebuffer===void 0)T.setupRenderTarget(M);else if(ve.__hasExternalTextures)T.rebindTextures(M,Pe.get(M.texture).__webglTexture,Pe.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let ye=M.depthTexture;if(ve.__boundDepthTexture!==ye){if(ye!==null&&Pe.has(ye)&&(M.width!==ye.image.width||M.height!==ye.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");T.setupDepthRenderbuffer(M)}}let He=M.texture;(He.isData3DTexture||He.isDataArrayTexture||He.isCompressedArrayTexture)&&(he=!0);let We=Pe.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(We[D])?U=We[D][z]:U=We[D],te=!0):M.samples>0&&T.useMultisampledRTT(M)===!1?U=Pe.get(M).__webglMultisampledFramebuffer:Array.isArray(We)?U=We[z]:U=We,P.copy(M.viewport),k.copy(M.scissor),B=M.scissorTest}else P.copy(Re).multiplyScalar(V).floor(),k.copy(Ze).multiplyScalar(V).floor(),B=xt;if(De.bindFramebuffer(O.FRAMEBUFFER,U)&&H&&De.drawBuffers(M,U),De.viewport(P),De.scissor(k),De.setScissorTest(B),te){let ve=Pe.get(M.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+D,ve.__webglTexture,z)}else if(he){let ve=Pe.get(M.texture),He=D||0;O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,ve.__webglTexture,z||0,He)}S=-1},this.readRenderTargetPixels=function(M,D,z,H,U,te,he){if(!(M&&M.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let _e=Pe.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&he!==void 0&&(_e=_e[he]),_e){De.bindFramebuffer(O.FRAMEBUFFER,_e);try{let ve=M.texture,He=ve.format,We=ve.type;if(!Qe.textureFormatReadable(He)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Qe.textureTypeReadable(We)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=M.width-H&&z>=0&&z<=M.height-U&&O.readPixels(D,z,H,U,qe.convert(He),qe.convert(We),te)}finally{let ve=I!==null?Pe.get(I).__webglFramebuffer:null;De.bindFramebuffer(O.FRAMEBUFFER,ve)}}},this.readRenderTargetPixelsAsync=async function(M,D,z,H,U,te,he){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let _e=Pe.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&he!==void 0&&(_e=_e[he]),_e){let ve=M.texture,He=ve.format,We=ve.type;if(!Qe.textureFormatReadable(He))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Qe.textureTypeReadable(We))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(D>=0&&D<=M.width-H&&z>=0&&z<=M.height-U){De.bindFramebuffer(O.FRAMEBUFFER,_e);let ye=O.createBuffer();O.bindBuffer(O.PIXEL_PACK_BUFFER,ye),O.bufferData(O.PIXEL_PACK_BUFFER,te.byteLength,O.STREAM_READ),O.readPixels(D,z,H,U,qe.convert(He),qe.convert(We),0);let st=I!==null?Pe.get(I).__webglFramebuffer:null;De.bindFramebuffer(O.FRAMEBUFFER,st);let yt=O.fenceSync(O.SYNC_GPU_COMMANDS_COMPLETE,0);return O.flush(),await e0(O,yt,4),O.bindBuffer(O.PIXEL_PACK_BUFFER,ye),O.getBufferSubData(O.PIXEL_PACK_BUFFER,0,te),O.deleteBuffer(ye),O.deleteSync(yt),te}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(M,D=null,z=0){M.isTexture!==!0&&(jr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),D=arguments[0]||null,M=arguments[1]);let H=Math.pow(2,-z),U=Math.floor(M.image.width*H),te=Math.floor(M.image.height*H),he=D!==null?D.x:0,_e=D!==null?D.y:0;T.setTexture2D(M,0),O.copyTexSubImage2D(O.TEXTURE_2D,z,0,0,he,_e,U,te),De.unbindTexture()},this.copyTextureToTexture=function(M,D,z=null,H=null,U=0){M.isTexture!==!0&&(jr("WebGLRenderer: copyTextureToTexture function signature has changed."),H=arguments[0]||null,M=arguments[1],D=arguments[2],U=arguments[3]||0,z=null);let te,he,_e,ve,He,We,ye,st,yt,bt=M.isCompressedTexture?M.mipmaps[U]:M.image;z!==null?(te=z.max.x-z.min.x,he=z.max.y-z.min.y,_e=z.isBox3?z.max.z-z.min.z:1,ve=z.min.x,He=z.min.y,We=z.isBox3?z.min.z:0):(te=bt.width,he=bt.height,_e=bt.depth||1,ve=0,He=0,We=0),H!==null?(ye=H.x,st=H.y,yt=H.z):(ye=0,st=0,yt=0);let xn=qe.convert(D.format),ct=qe.convert(D.type),be;D.isData3DTexture?(T.setTexture3D(D,0),be=O.TEXTURE_3D):D.isDataArrayTexture||D.isCompressedArrayTexture?(T.setTexture2DArray(D,0),be=O.TEXTURE_2D_ARRAY):(T.setTexture2D(D,0),be=O.TEXTURE_2D),O.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,D.flipY),O.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),O.pixelStorei(O.UNPACK_ALIGNMENT,D.unpackAlignment);let oi=O.getParameter(O.UNPACK_ROW_LENGTH),lt=O.getParameter(O.UNPACK_IMAGE_HEIGHT),Fn=O.getParameter(O.UNPACK_SKIP_PIXELS),Os=O.getParameter(O.UNPACK_SKIP_ROWS),vn=O.getParameter(O.UNPACK_SKIP_IMAGES);O.pixelStorei(O.UNPACK_ROW_LENGTH,bt.width),O.pixelStorei(O.UNPACK_IMAGE_HEIGHT,bt.height),O.pixelStorei(O.UNPACK_SKIP_PIXELS,ve),O.pixelStorei(O.UNPACK_SKIP_ROWS,He),O.pixelStorei(O.UNPACK_SKIP_IMAGES,We);let zr=M.isDataArrayTexture||M.isData3DTexture,Et=D.isDataArrayTexture||D.isData3DTexture;if(M.isRenderTargetTexture||M.isDepthTexture){let Jn=Pe.get(M),Hr=Pe.get(D),wn=Pe.get(Jn.__renderTarget),Fi=Pe.get(Hr.__renderTarget);De.bindFramebuffer(O.READ_FRAMEBUFFER,wn.__webglFramebuffer),De.bindFramebuffer(O.DRAW_FRAMEBUFFER,Fi.__webglFramebuffer);for(let Bi=0;Bi<_e;Bi++)zr&&O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Pe.get(M).__webglTexture,U,We+Bi),M.isDepthTexture?(Et&&O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Pe.get(D).__webglTexture,U,yt+Bi),O.blitFramebuffer(ve,He,te,he,ye,st,te,he,O.DEPTH_BUFFER_BIT,O.NEAREST)):Et?O.copyTexSubImage3D(be,U,ye,st,yt+Bi,ve,He,te,he):O.copyTexSubImage2D(be,U,ye,st,yt+Bi,ve,He,te,he);De.bindFramebuffer(O.READ_FRAMEBUFFER,null),De.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else Et?M.isDataTexture||M.isData3DTexture?O.texSubImage3D(be,U,ye,st,yt,te,he,_e,xn,ct,bt.data):D.isCompressedArrayTexture?O.compressedTexSubImage3D(be,U,ye,st,yt,te,he,_e,xn,bt.data):O.texSubImage3D(be,U,ye,st,yt,te,he,_e,xn,ct,bt):M.isDataTexture?O.texSubImage2D(O.TEXTURE_2D,U,ye,st,te,he,xn,ct,bt.data):M.isCompressedTexture?O.compressedTexSubImage2D(O.TEXTURE_2D,U,ye,st,bt.width,bt.height,xn,bt.data):O.texSubImage2D(O.TEXTURE_2D,U,ye,st,te,he,xn,ct,bt);O.pixelStorei(O.UNPACK_ROW_LENGTH,oi),O.pixelStorei(O.UNPACK_IMAGE_HEIGHT,lt),O.pixelStorei(O.UNPACK_SKIP_PIXELS,Fn),O.pixelStorei(O.UNPACK_SKIP_ROWS,Os),O.pixelStorei(O.UNPACK_SKIP_IMAGES,vn),U===0&&D.generateMipmaps&&O.generateMipmap(be),De.unbindTexture()},this.copyTextureToTexture3D=function(M,D,z=null,H=null,U=0){return M.isTexture!==!0&&(jr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),z=arguments[0]||null,H=arguments[1]||null,M=arguments[2],D=arguments[3],U=arguments[4]||0),jr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(M,D,z,H,U)},this.initRenderTarget=function(M){Pe.get(M).__webglFramebuffer===void 0&&T.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?T.setTextureCube(M,0):M.isData3DTexture?T.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?T.setTexture2DArray(M,0):T.setTexture2D(M,0),De.unbindTexture()},this.resetState=function(){R=0,C=0,I=null,De.reset(),vt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return gi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorspace=$e._getDrawingBufferColorSpace(e),t.unpackColorSpace=$e._getUnpackColorSpace()}};var vr=class extends Rt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ti,this.environmentIntensity=1,this.environmentRotation=new ti,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},yr=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Dl,this.updateRanges=[],this.version=0,this.uuid=Gn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Gn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Gn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},dn=new w,bs=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)dn.fromBufferAttribute(this,t),dn.applyMatrix4(e),this.setXYZ(t,dn.x,dn.y,dn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)dn.fromBufferAttribute(this,t),dn.applyNormalMatrix(e),this.setXYZ(t,dn.x,dn.y,dn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)dn.fromBufferAttribute(this,t),dn.transformDirection(e),this.setXYZ(t,dn.x,dn.y,dn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=kn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ht(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ht(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=kn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=kn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=kn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=kn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),s=ht(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=ht(t,this.array),n=ht(n,this.array),s=ht(s,this.array),r=ht(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new wt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},ho=class extends mn{static get type(){return"SpriteMaterial"}constructor(e){super(),this.isSpriteMaterial=!0,this.color=new Ee(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},$s,Xr=new w,js=new w,Qs=new w,er=new Ue,qr=new Ue,Od=new we,la=new w,Yr=new w,ua=new w,qf=new Ue,Yc=new Ue,Yf=new Ue,Ua=class extends Rt{constructor(e=new ho){if(super(),this.isSprite=!0,this.type="Sprite",$s===void 0){$s=new $t;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new yr(t,5);$s.setIndex([0,1,2,0,2,3]),$s.setAttribute("position",new bs(n,3,0,!1)),$s.setAttribute("uv",new bs(n,2,3,!1))}this.geometry=$s,this.material=e,this.center=new Ue(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),js.setFromMatrixScale(this.matrixWorld),Od.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Qs.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&js.multiplyScalar(-Qs.z);let n=this.material.rotation,s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));let o=this.center;ha(la.set(-.5,-.5,0),Qs,o,js,s,r),ha(Yr.set(.5,-.5,0),Qs,o,js,s,r),ha(ua.set(.5,.5,0),Qs,o,js,s,r),qf.set(0,0),Yc.set(1,0),Yf.set(1,1);let a=e.ray.intersectTriangle(la,Yr,ua,!1,Xr);if(a===null&&(ha(Yr.set(-.5,.5,0),Qs,o,js,s,r),Yc.set(0,1),a=e.ray.intersectTriangle(la,ua,Yr,!1,Xr),a===null))return;let c=e.ray.origin.distanceTo(Xr);c<e.near||c>e.far||t.push({distance:c,point:Xr.clone(),uv:Xi.getInterpolation(Xr,la,Yr,ua,qf,Yc,Yf,new Ue),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function ha(i,e,t,n,s,r){er.subVectors(i,t).addScalar(.5).multiply(n),s!==void 0?(qr.x=r*er.x-s*er.y,qr.y=s*er.x+r*er.y):qr.copy(er),i.copy(e),i.x+=qr.x,i.y+=qr.y,i.applyMatrix4(Od)}var Zf=new w,Kf=new ze,Jf=new ze,Jv=new w,$f=new we,fa=new w,Zc=new Mn,jf=new we,Kc=new xr,Na=class extends Te{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=$h,this.bindMatrix=new we,this.bindMatrixInverse=new we,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new In),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,fa),this.boundingBox.expandByPoint(fa)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Mn),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,fa),this.boundingSphere.expandByPoint(fa)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Zc.copy(this.boundingSphere),Zc.applyMatrix4(s),e.ray.intersectsSphere(Zc)!==!1&&(jf.copy(s).invert(),Kc.copy(e.ray).applyMatrix4(jf),!(this.boundingBox!==null&&Kc.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Kc)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new ze,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===$h?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===bm?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,s=this.geometry;Kf.fromBufferAttribute(s.attributes.skinIndex,e),Jf.fromBufferAttribute(s.attributes.skinWeight,e),Zf.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){let o=Jf.getComponent(r);if(o!==0){let a=Kf.getComponent(r);$f.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(Jv.copy(Zf).applyMatrix4($f),o)}}return t.applyMatrix4(this.bindMatrixInverse)}},fo=class extends Rt{constructor(){super(),this.isBone=!0,this.type="Bone"}},Oa=class extends Ht{constructor(e=null,t=1,n=1,s,r,o,a,c,l=zt,u=zt,h,f){super(null,o,a,c,l,u,s,r,h,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Qf=new we,$v=new we,Fa=class i{constructor(e=[],t=[]){this.uuid=Gn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new we)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new we;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){let a=e[r]?e[r].matrixWorld:$v;Qf.multiplyMatrices(a,t[r]),Qf.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new Oa(t,e,e,Cn,Vn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){let r=e.bones[n],o=t[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new fo),this.bones.push(o),this.boneInverses.push(new we().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let o=t[s];e.bones.push(o.uuid);let a=n[s];e.boneInverses.push(a.toArray())}return e}},Es=class extends wt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},tr=new we,ed=new we,da=[],td=new In,jv=new we,Zr=new Te,Kr=new Mn,Ba=class extends Te{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Es(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,jv)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new In),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,tr),td.copy(e.boundingBox).applyMatrix4(tr),this.boundingBox.union(td)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Mn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,tr),Kr.copy(e.boundingSphere).applyMatrix4(tr),this.boundingSphere.union(Kr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(Zr.geometry=this.geometry,Zr.material=this.material,Zr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Kr.copy(this.boundingSphere),Kr.applyMatrix4(n),e.ray.intersectsSphere(Kr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,tr),ed.multiplyMatrices(n,tr),Zr.matrixWorld=ed,Zr.raycast(e,da);for(let o=0,a=da.length;o<a;o++){let c=da[o];c.instanceId=r,c.object=this,t.push(c)}da.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Es(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Oa(new Float32Array(s*this.count),s,this.count,xu,Vn));let r=this.morphTexture.source.data.data,o=0;for(let l=0;l<n.length;l++)o+=n[l];let a=this.geometry.morphTargetsRelative?1:1-o,c=s*e;r[c]=a,r.set(n,c+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}};var po=class extends mn{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new Ee(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},za=new w,Ha=new w,nd=new we,Jr=new xr,pa=new Mn,Jc=new w,id=new w,Ar=class extends Rt{constructor(e=new $t,t=new po){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)za.fromBufferAttribute(t,s-1),Ha.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=za.distanceTo(Ha);e.setAttribute("lineDistance",new Jt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),pa.copy(n.boundingSphere),pa.applyMatrix4(s),pa.radius+=r,e.ray.intersectsSphere(pa)===!1)return;nd.copy(s).invert(),Jr.copy(e.ray).applyMatrix4(nd);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,u=n.index,f=n.attributes.position;if(u!==null){let p=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let x=p,m=g-1;x<m;x+=l){let d=u.getX(x),E=u.getX(x+1),b=ma(this,e,Jr,c,d,E);b&&t.push(b)}if(this.isLineLoop){let x=u.getX(g-1),m=u.getX(p),d=ma(this,e,Jr,c,x,m);d&&t.push(d)}}else{let p=Math.max(0,o.start),g=Math.min(f.count,o.start+o.count);for(let x=p,m=g-1;x<m;x+=l){let d=ma(this,e,Jr,c,x,x+1);d&&t.push(d)}if(this.isLineLoop){let x=ma(this,e,Jr,c,g-1,p);x&&t.push(x)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function ma(i,e,t,n,s,r){let o=i.geometry.attributes.position;if(za.fromBufferAttribute(o,s),Ha.fromBufferAttribute(o,r),t.distanceSqToSegment(za,Ha,Jc,id)>n)return;Jc.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(Jc);if(!(c<e.near||c>e.far))return{distance:c,point:id.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:i}}var sd=new w,rd=new w,ka=class extends Ar{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)sd.fromBufferAttribute(t,s),rd.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+sd.distanceTo(rd);e.setAttribute("lineDistance",new Jt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},Va=class extends Ar{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},mo=class extends mn{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new Ee(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},od=new we,Jl=new xr,ga=new Mn,xa=new w,Ga=class extends Rt{constructor(e=new $t,t=new mo){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ga.copy(n.boundingSphere),ga.applyMatrix4(s),ga.radius+=r,e.ray.intersectsSphere(ga)===!1)return;od.copy(s).invert(),Jl.copy(e.ray).applyMatrix4(od);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=n.index,h=n.attributes.position;if(l!==null){let f=Math.max(0,o.start),p=Math.min(l.count,o.start+o.count);for(let g=f,x=p;g<x;g++){let m=l.getX(g);xa.fromBufferAttribute(h,m),ad(xa,m,c,s,e,t,this)}}else{let f=Math.max(0,o.start),p=Math.min(h.count,o.start+o.count);for(let g=f,x=p;g<x;g++)xa.fromBufferAttribute(h,g),ad(xa,g,c,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function ad(i,e,t,n,s,r,o){let a=Jl.distanceSqToPoint(i);if(a<t){let c=new w;Jl.closestPointToPoint(i,c),c.applyMatrix4(n);let l=s.ray.origin.distanceTo(c);if(l<s.near||l>s.far)return;r.push({distance:l,distanceToRay:Math.sqrt(a),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}var Mr=class extends Ht{constructor(e,t,n,s,r,o,a,c,l){super(e,t,n,s,r,o,a,c,l),this.isVideoTexture=!0,this.minFilter=o!==void 0?o:Kt,this.magFilter=r!==void 0?r:Kt,this.generateMipmaps=!1;let u=this;function h(){u.needsUpdate=!0,e.requestVideoFrameCallback(h)}"requestVideoFrameCallback"in e&&e.requestVideoFrameCallback(h)}clone(){return new this.constructor(this.image).copy(this)}update(){let e=this.image;"requestVideoFrameCallback"in e===!1&&e.readyState>=e.HAVE_CURRENT_DATA&&(this.needsUpdate=!0)}};var Wa=class extends Ht{constructor(e,t,n,s,r,o,a,c,l){super(e,t,n,s,r,o,a,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Ts=class i extends $t{constructor(e=1,t=1,n=1,s=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};let l=this;s=Math.floor(s),r=Math.floor(r);let u=[],h=[],f=[],p=[],g=0,x=[],m=n/2,d=0;E(),o===!1&&(e>0&&b(!0),t>0&&b(!1)),this.setIndex(u),this.setAttribute("position",new Jt(h,3)),this.setAttribute("normal",new Jt(f,3)),this.setAttribute("uv",new Jt(p,2));function E(){let v=new w,N=new w,R=0,C=(t-e)/n;for(let I=0;I<=r;I++){let S=[],A=I/r,P=A*(t-e)+e;for(let k=0;k<=s;k++){let B=k/s,G=B*c+a,J=Math.sin(G),X=Math.cos(G);N.x=P*J,N.y=-A*n+m,N.z=P*X,h.push(N.x,N.y,N.z),v.set(J,C,X).normalize(),f.push(v.x,v.y,v.z),p.push(B,1-A),S.push(g++)}x.push(S)}for(let I=0;I<s;I++)for(let S=0;S<r;S++){let A=x[S][I],P=x[S+1][I],k=x[S+1][I+1],B=x[S][I+1];(e>0||S!==0)&&(u.push(A,P,B),R+=3),(t>0||S!==r-1)&&(u.push(P,k,B),R+=3)}l.addGroup(d,R,0),d+=R}function b(v){let N=g,R=new Ue,C=new w,I=0,S=v===!0?e:t,A=v===!0?1:-1;for(let k=1;k<=s;k++)h.push(0,m*A,0),f.push(0,A,0),p.push(.5,.5),g++;let P=g;for(let k=0;k<=s;k++){let G=k/s*c+a,J=Math.cos(G),X=Math.sin(G);C.x=S*X,C.y=m*A,C.z=S*J,h.push(C.x,C.y,C.z),f.push(0,A,0),R.x=J*.5+.5,R.y=X*.5*A+.5,p.push(R.x,R.y),g++}for(let k=0;k<s;k++){let B=N+k,G=P+k;v===!0?u.push(G,G+1,B):u.push(G+1,G,B),I+=3}l.addGroup(d,I,v===!0?1:2),d+=I}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var go=class i extends $t{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let c=Math.min(o+a,Math.PI),l=0,u=[],h=new w,f=new w,p=[],g=[],x=[],m=[];for(let d=0;d<=n;d++){let E=[],b=d/n,v=0;d===0&&o===0?v=.5/t:d===n&&c===Math.PI&&(v=-.5/t);for(let N=0;N<=t;N++){let R=N/t;h.x=-e*Math.cos(s+R*r)*Math.sin(o+b*a),h.y=e*Math.cos(o+b*a),h.z=e*Math.sin(s+R*r)*Math.sin(o+b*a),g.push(h.x,h.y,h.z),f.copy(h).normalize(),x.push(f.x,f.y,f.z),m.push(R+v,1-b),E.push(l++)}u.push(E)}for(let d=0;d<n;d++)for(let E=0;E<t;E++){let b=u[d][E+1],v=u[d][E],N=u[d+1][E],R=u[d+1][E+1];(d!==0||o>0)&&p.push(b,v,R),(d!==n-1||c<Math.PI)&&p.push(v,N,R)}this.setIndex(p),this.setAttribute("position",new Jt(g,3)),this.setAttribute("normal",new Jt(x,3)),this.setAttribute("uv",new Jt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var xo=class extends mn{static get type(){return"ShadowMaterial"}constructor(e){super(),this.isShadowMaterial=!0,this.color=new Ee(0),this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.fog=e.fog,this}};var Gt=class extends mn{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new Ee(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ee(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ed,this.normalScale=new Ue(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ti,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Sn=class extends Gt{static get type(){return"MeshPhysicalMaterial"}constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Ue(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return on(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ee(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ee(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ee(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};function As(i,e,t){return!i||!t&&i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Fd(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Bd(i){function e(s,r){return i[s]-i[r]}let t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function $l(i,e,t){let n=i.length,s=new i.constructor(n);for(let r=0,o=0;o!==n;++r){let a=t[r]*e;for(let c=0;c!==e;++c)s[o++]=i[a+c]}return s}function bu(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push.apply(t,o)),r=i[s++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=i[s++];while(r!==void 0)}function Qv(i,e,t,n,s=30){let r=i.clone();r.name=e;let o=[];for(let c=0;c<r.tracks.length;++c){let l=r.tracks[c],u=l.getValueSize(),h=[],f=[];for(let p=0;p<l.times.length;++p){let g=l.times[p]*s;if(!(g<t||g>=n)){h.push(l.times[p]);for(let x=0;x<u;++x)f.push(l.values[p*u+x])}}h.length!==0&&(l.times=As(h,l.times.constructor),l.values=As(f,l.values.constructor),o.push(l))}r.tracks=o;let a=1/0;for(let c=0;c<r.tracks.length;++c)a>r.tracks[c].times[0]&&(a=r.tracks[c].times[0]);for(let c=0;c<r.tracks.length;++c)r.tracks[c].shift(-1*a);return r.resetDuration(),r}function ey(i,e=0,t=i,n=30){n<=0&&(n=30);let s=t.tracks.length,r=e/n;for(let o=0;o<s;++o){let a=t.tracks[o],c=a.ValueTypeName;if(c==="bool"||c==="string")continue;let l=i.tracks.find(function(d){return d.name===a.name&&d.ValueTypeName===c});if(l===void 0)continue;let u=0,h=a.getValueSize();a.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(u=h/3);let f=0,p=l.getValueSize();l.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(f=p/3);let g=a.times.length-1,x;if(r<=a.times[0]){let d=u,E=h-u;x=a.values.slice(d,E)}else if(r>=a.times[g]){let d=g*h+u,E=d+h-u;x=a.values.slice(d,E)}else{let d=a.createInterpolant(),E=u,b=h-u;d.evaluate(r),x=d.resultBuffer.slice(E,b)}c==="quaternion"&&new ot().fromArray(x).normalize().conjugate().toArray(x);let m=l.times.length;for(let d=0;d<m;++d){let E=d*p+f;if(c==="quaternion")ot.multiplyQuaternionsFlat(l.values,E,x,0,l.values,E);else{let b=p-f*2;for(let v=0;v<b;++v)l.values[E+v]-=x[v]}}}return i.blendMode=Sd,i}var zd={convertArray:As,isTypedArray:Fd,getKeyframeOrder:Bd,sortedArray:$l,flattenJSON:bu,subclip:Qv,makeClipAdditive:ey},$i=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];e:{t:{let o;n:{i:if(!(e<s)){for(let a=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=t[++n],e<s)break t}o=t.length;break n}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=t[--n-1],e>=r)break t}o=n,n=0;break n}break e}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},jl=class extends $i{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ir,endingEnd:ir}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],c=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case sr:r=e,a=2*t-n;break;case Sa:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=n}if(c===void 0)switch(this.getSettings_().endingEnd){case sr:o=e,c=2*n-t;break;case Sa:o=1,c=n+s[1]-s[0];break;default:o=e-1,c=t}let l=(n-t)*.5,u=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(c-n),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=this._offsetPrev,h=this._offsetNext,f=this._weightPrev,p=this._weightNext,g=(n-t)/(s-t),x=g*g,m=x*g,d=-f*m+2*f*x-f*g,E=(1+f)*m+(-1.5-2*f)*x+(-.5+f)*g+1,b=(-1-p)*m+(1.5+p)*x+.5*g,v=p*m-p*x;for(let N=0;N!==a;++N)r[N]=d*o[u+N]+E*o[l+N]+b*o[c+N]+v*o[h+N];return r}},Xa=class extends $i{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=(n-t)/(s-t),h=1-u;for(let f=0;f!==a;++f)r[f]=o[l+f]*h+o[c+f]*u;return r}},Ql=class extends $i{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},Pn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=As(t,this.TimeBufferType),this.values=As(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:As(e.times,Array),values:As(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Ql(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Xa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new jl(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case pr:t=this.InterpolantFactoryMethodDiscrete;break;case mr:t=this.InterpolantFactoryMethodLinear;break;case yc:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return pr;case this.InterpolantFactoryMethodLinear:return mr;case this.InterpolantFactoryMethodSmooth:return yc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let c=n[a];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,c),e=!1;break}if(o!==null&&o>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,c,o),e=!1;break}o=c}if(s!==void 0&&Fd(s))for(let a=0,c=s.length;a!==c;++a){let l=s[a];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===yc,r=e.length-1,o=1;for(let a=1;a<r;++a){let c=!1,l=e[a],u=e[a+1];if(l!==u&&(a!==1||l!==e[0]))if(s)c=!0;else{let h=a*n,f=h-n,p=h+n;for(let g=0;g!==n;++g){let x=t[h+g];if(x!==t[f+g]||x!==t[p+g]){c=!0;break}}}if(c){if(a!==o){e[o]=e[a];let h=a*n,f=o*n;for(let p=0;p!==n;++p)t[f+p]=t[h+p]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,c=o*n,l=0;l!==n;++l)t[c+l]=t[a+l];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};Pn.prototype.TimeBufferType=Float32Array;Pn.prototype.ValueBufferType=Float32Array;Pn.prototype.DefaultInterpolation=mr;var ji=class extends Pn{constructor(e,t,n){super(e,t,n)}};ji.prototype.ValueTypeName="bool";ji.prototype.ValueBufferType=Array;ji.prototype.DefaultInterpolation=pr;ji.prototype.InterpolantFactoryMethodLinear=void 0;ji.prototype.InterpolantFactoryMethodSmooth=void 0;var qa=class extends Pn{};qa.prototype.ValueTypeName="color";var Ai=class extends Pn{};Ai.prototype.ValueTypeName="number";var eu=class extends $i{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(n-t)/(s-t),l=e*a;for(let u=l+a;l!==u;l+=4)ot.slerpFlat(r,0,o,l-a,o,l,c);return r}},Mi=class extends Pn{InterpolantFactoryMethodLinear(e){return new eu(this.times,this.values,this.getValueSize(),e)}};Mi.prototype.ValueTypeName="quaternion";Mi.prototype.InterpolantFactoryMethodSmooth=void 0;var Qi=class extends Pn{constructor(e,t,n){super(e,t,n)}};Qi.prototype.ValueTypeName="string";Qi.prototype.ValueBufferType=Array;Qi.prototype.DefaultInterpolation=pr;Qi.prototype.InterpolantFactoryMethodLinear=void 0;Qi.prototype.InterpolantFactoryMethodSmooth=void 0;var Si=class extends Pn{};Si.prototype.ValueTypeName="vector";var Sr=class{constructor(e="",t=-1,n=[],s=Au){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=Gn(),this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,s=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(ny(n[o]).scale(s));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r}static toJSON(e){let t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let r=0,o=n.length;r!==o;++r)t.push(Pn.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){let r=t.length,o=[];for(let a=0;a<r;a++){let c=[],l=[];c.push((a+r-1)%r,a,(a+1)%r),l.push(0,1,0);let u=Bd(c);c=$l(c,1,u),l=$l(l,1,u),!s&&c[0]===0&&(c.push(r),l.push(l[0])),o.push(new Ai(".morphTargetInfluences["+t[a].name+"]",c,l).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let s={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,c=e.length;a<c;a++){let l=e[a],u=l.name.match(r);if(u&&u.length>1){let h=u[1],f=s[h];f||(s[h]=f=[]),f.push(l)}}let o=[];for(let a in s)o.push(this.CreateFromMorphTargetSequence(a,s[a],t,n));return o}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;let n=function(h,f,p,g,x){if(p.length!==0){let m=[],d=[];bu(p,m,d,g),m.length!==0&&x.push(new h(f,m,d))}},s=[],r=e.name||"default",o=e.fps||30,a=e.blendMode,c=e.length||-1,l=e.hierarchy||[];for(let h=0;h<l.length;h++){let f=l[h].keys;if(!(!f||f.length===0))if(f[0].morphTargets){let p={},g;for(g=0;g<f.length;g++)if(f[g].morphTargets)for(let x=0;x<f[g].morphTargets.length;x++)p[f[g].morphTargets[x]]=-1;for(let x in p){let m=[],d=[];for(let E=0;E!==f[g].morphTargets.length;++E){let b=f[g];m.push(b.time),d.push(b.morphTarget===x?1:0)}s.push(new Ai(".morphTargetInfluence["+x+"]",m,d))}c=p.length*o}else{let p=".bones["+t[h].name+"]";n(Si,p+".position",f,"pos",s),n(Mi,p+".quaternion",f,"rot",s),n(Si,p+".scale",f,"scl",s)}}return s.length===0?null:new this(r,c,s,a)}resetDuration(){let e=this.tracks,t=0;for(let n=0,s=e.length;n!==s;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}};function ty(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Ai;case"vector":case"vector2":case"vector3":case"vector4":return Si;case"color":return qa;case"quaternion":return Mi;case"bool":case"boolean":return ji;case"string":return Qi}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function ny(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=ty(i.type);if(i.times===void 0){let t=[],n=[];bu(i.keys,t,n,"value"),i.times=t,i.values=n}return e.parse!==void 0?e.parse(i):new e(i.name,i.times,i.values,i.interpolation)}var qi={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(this.files[i]=e)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}},tu=class{constructor(e,t,n){let s=this,r=!1,o=0,a=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(u){a++,r===!1&&s.onStart!==void 0&&s.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,s.onProgress!==void 0&&s.onProgress(u,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,h){return l.push(u,h),this},this.removeHandler=function(u){let h=l.indexOf(u);return h!==-1&&l.splice(h,2),this},this.getHandler=function(u){for(let h=0,f=l.length;h<f;h+=2){let p=l[h],g=l[h+1];if(p.global&&(p.lastIndex=0),p.test(u))return g}return null}}},iy=new tu,bi=class{constructor(e){this.manager=e!==void 0?e:iy,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};bi.DEFAULT_MATERIAL_NAME="__DEFAULT";var fi={},nu=class extends Error{constructor(e,t){super(e),this.response=t}},_o=class extends bi{constructor(e){super(e)}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=qi.get(e);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(fi[e]!==void 0){fi[e].push({onLoad:t,onProgress:n,onError:s});return}fi[e]=[],fi[e].push({onLoad:t,onProgress:n,onError:s});let o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,c=this.responseType;fetch(o).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;let u=fi[e],h=l.body.getReader(),f=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),p=f?parseInt(f):0,g=p!==0,x=0,m=new ReadableStream({start(d){E();function E(){h.read().then(({done:b,value:v})=>{if(b)d.close();else{x+=v.byteLength;let N=new ProgressEvent("progress",{lengthComputable:g,loaded:x,total:p});for(let R=0,C=u.length;R<C;R++){let I=u[R];I.onProgress&&I.onProgress(N)}d.enqueue(v),E()}},b=>{d.error(b)})}}});return new Response(m)}else throw new nu(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(u=>new DOMParser().parseFromString(u,a));case"json":return l.json();default:if(a===void 0)return l.text();{let h=/charset="?([^;"\s]*)"?/i.exec(a),f=h&&h[1]?h[1].toLowerCase():void 0,p=new TextDecoder(f);return l.arrayBuffer().then(g=>p.decode(g))}}}).then(l=>{qi.add(e,l);let u=fi[e];delete fi[e];for(let h=0,f=u.length;h<f;h++){let p=u[h];p.onLoad&&p.onLoad(l)}}).catch(l=>{let u=fi[e];if(u===void 0)throw this.manager.itemError(e),l;delete fi[e];for(let h=0,f=u.length;h<f;h++){let p=u[h];p.onError&&p.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}};var iu=class extends bi{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=qi.get(e);if(o!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o;let a=lo("img");function c(){u(),qi.add(e,this),t&&t(this),r.manager.itemEnd(e)}function l(h){u(),s&&s(h),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){a.removeEventListener("load",c,!1),a.removeEventListener("error",l,!1)}return a.addEventListener("load",c,!1),a.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),r.manager.itemStart(e),a.src=e,a}};var ws=class extends bi{constructor(e){super(e)}load(e,t,n,s){let r=new Ht,o=new iu(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},br=class extends Rt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ee(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},vo=class extends br{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Rt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ee(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},$c=new we,cd=new w,ld=new w,yo=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ue(512,512),this.map=null,this.mapPass=null,this.matrix=new we,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new uo,this._frameExtents=new Ue(1,1),this._viewportCount=1,this._viewports=[new ze(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;cd.setFromMatrixPosition(e.matrixWorld),t.position.copy(cd),ld.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(ld),t.updateMatrixWorld(),$c.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix($c),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply($c)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},su=class extends yo{constructor(){super(new Bt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){let t=this.camera,n=gr*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},Rs=class extends br{constructor(e,t,n=0,s=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Rt.DEFAULT_UP),this.updateMatrix(),this.target=new Rt,this.distance=n,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new su}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},ud=new we,$r=new w,jc=new w,ru=class extends yo{constructor(){super(new Bt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Ue(4,2),this._viewportCount=6,this._viewports=[new ze(2,1,1,1),new ze(0,1,1,1),new ze(3,1,1,1),new ze(1,1,1,1),new ze(3,0,1,1),new ze(1,0,1,1)],this._cubeDirections=[new w(1,0,0),new w(-1,0,0),new w(0,0,1),new w(0,0,-1),new w(0,1,0),new w(0,-1,0)],this._cubeUps=[new w(0,1,0),new w(0,1,0),new w(0,1,0),new w(0,1,0),new w(0,0,1),new w(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),$r.setFromMatrixPosition(e.matrixWorld),n.position.copy($r),jc.copy(n.position),jc.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(jc),n.updateMatrixWorld(),s.makeTranslation(-$r.x,-$r.y,-$r.z),ud.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ud)}},jt=class extends br{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new ru}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},ou=class extends yo{constructor(){super(new Ji(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},es=class extends br{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Rt.DEFAULT_UP),this.updateMatrix(),this.target=new Rt,this.shadow=new ou}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var ts=class{static decodeText(e){if(console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."),typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let n=0,s=e.length;n<s;n++)t+=String.fromCharCode(e[n]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var Ya=class extends bi{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=qi.get(e);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(l=>{t&&t(l),r.manager.itemEnd(e)}).catch(l=>{s&&s(l)});return}return setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o}let a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader;let c=fetch(e,a).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(l){return qi.add(e,l),t&&t(l),r.manager.itemEnd(e),l}).catch(function(l){s&&s(l),qi.remove(e),r.manager.itemError(e),r.manager.itemEnd(e)});qi.add(e,c),r.manager.itemStart(e)}};var au=class{constructor(e,t,n){this.binding=e,this.valueSize=n;let s,r,o;switch(t){case"quaternion":s=this._slerp,r=this._slerpAdditive,o=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":s=this._select,r=this._select,o=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:s=this._lerp,r=this._lerpAdditive,o=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=s,this._mixBufferRegionAdditive=r,this._setIdentity=o,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){let n=this.buffer,s=this.valueSize,r=e*s+s,o=this.cumulativeWeight;if(o===0){for(let a=0;a!==s;++a)n[r+a]=n[a];o=t}else{o+=t;let a=t/o;this._mixBufferRegion(n,r,0,a,s)}this.cumulativeWeight=o}accumulateAdditive(e){let t=this.buffer,n=this.valueSize,s=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,s,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){let t=this.valueSize,n=this.buffer,s=e*t+t,r=this.cumulativeWeight,o=this.cumulativeWeightAdditive,a=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){let c=t*this._origIndex;this._mixBufferRegion(n,s,c,1-r,t)}o>0&&this._mixBufferRegionAdditive(n,s,this._addIndex*t,1,t);for(let c=t,l=t+t;c!==l;++c)if(n[c]!==n[c+t]){a.setValue(n,s);break}}saveOriginalState(){let e=this.binding,t=this.buffer,n=this.valueSize,s=n*this._origIndex;e.getValue(t,s);for(let r=n,o=s;r!==o;++r)t[r]=t[s+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){let e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,s,r){if(s>=.5)for(let o=0;o!==r;++o)e[t+o]=e[n+o]}_slerp(e,t,n,s){ot.slerpFlat(e,t,e,t,e,n,s)}_slerpAdditive(e,t,n,s,r){let o=this._workIndex*r;ot.multiplyQuaternionsFlat(e,o,e,t,e,n),ot.slerpFlat(e,t,e,t,e,o,s)}_lerp(e,t,n,s,r){let o=1-s;for(let a=0;a!==r;++a){let c=t+a;e[c]=e[c]*o+e[n+a]*s}}_lerpAdditive(e,t,n,s,r){for(let o=0;o!==r;++o){let a=t+o;e[a]=e[a]+e[n+o]*s}}},Eu="\\[\\]\\.:\\/",sy=new RegExp("["+Eu+"]","g"),Tu="[^"+Eu+"]",ry="[^"+Eu.replace("\\.","")+"]",oy=/((?:WC+[\/:])*)/.source.replace("WC",Tu),ay=/(WCOD+)?/.source.replace("WCOD",ry),cy=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Tu),ly=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Tu),uy=new RegExp("^"+oy+ay+cy+ly+"$"),hy=["material","materials","bones","map"],cu=class{constructor(e,t,n){let s=n||_t.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},_t=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(sy,"")}static parseTrackName(e){let t=uy.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);hy.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let c=n(a.children);if(c)return c}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===l){l=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let o=e[s];if(o===void 0){let l=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};_t.Composite=cu;_t.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};_t.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};_t.prototype.GetterByBindingType=[_t.prototype._getValue_direct,_t.prototype._getValue_array,_t.prototype._getValue_arrayElement,_t.prototype._getValue_toArray];_t.prototype.SetterByBindingTypeAndVersioning=[[_t.prototype._setValue_direct,_t.prototype._setValue_direct_setNeedsUpdate,_t.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_array,_t.prototype._setValue_array_setNeedsUpdate,_t.prototype._setValue_array_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_arrayElement,_t.prototype._setValue_arrayElement_setNeedsUpdate,_t.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_fromArray,_t.prototype._setValue_fromArray_setNeedsUpdate,_t.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var lu=class{constructor(e,t,n=null,s=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=s;let r=t.tracks,o=r.length,a=new Array(o),c={endingStart:ir,endingEnd:ir};for(let l=0;l!==o;++l){let u=r[l].createInterpolant(null);a[l]=u,u.settings=c}this._interpolantSettings=c,this._interpolants=a,this._propertyBindings=new Array(o),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=Em,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n){if(e.fadeOut(t),this.fadeIn(t),n){let s=this._clip.duration,r=e._clip.duration,o=r/s,a=s/r;e.warp(1,o,t),this.warp(a,1,t)}return this}crossFadeTo(e,t,n){return e.crossFadeFrom(this,t,n)}stopFading(){let e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){let s=this._mixer,r=s.time,o=this.timeScale,a=this._timeScaleInterpolant;a===null&&(a=s._lendControlInterpolant(),this._timeScaleInterpolant=a);let c=a.parameterPositions,l=a.sampleValues;return c[0]=r,c[1]=r+n,l[0]=e/o,l[1]=t/o,this}stopWarping(){let e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,s){if(!this.enabled){this._updateWeight(e);return}let r=this._startTime;if(r!==null){let c=(e-r)*n;c<0||n===0?t=0:(this._startTime=null,t=n*c)}t*=this._updateTimeScale(e);let o=this._updateTime(t),a=this._updateWeight(e);if(a>0){let c=this._interpolants,l=this._propertyBindings;switch(this.blendMode){case Sd:for(let u=0,h=c.length;u!==h;++u)c[u].evaluate(o),l[u].accumulateAdditive(a);break;case Au:default:for(let u=0,h=c.length;u!==h;++u)c[u].evaluate(o),l[u].accumulate(s,a)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;let n=this._weightInterpolant;if(n!==null){let s=n.evaluate(e)[0];t*=s,e>n.parameterPositions[1]&&(this.stopFading(),s===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;let n=this._timeScaleInterpolant;if(n!==null){let s=n.evaluate(e)[0];t*=s,e>n.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t)}}return this._effectiveTimeScale=t,t}_updateTime(e){let t=this._clip.duration,n=this.loop,s=this.time+e,r=this._loopCount,o=n===Tm;if(e===0)return r===-1?s:o&&(r&1)===1?t-s:s;if(n===So){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(s>=t)s=t;else if(s<0)s=0;else{this.time=s;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=s,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,o)):this._setEndings(this.repetitions===0,!0,o)),s>=t||s<0){let a=Math.floor(s/t);s-=t*a,r+=Math.abs(a);let c=this.repetitions-r;if(c<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,s=e>0?t:0,this.time=s,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(c===1){let l=e<0;this._setEndings(l,!l,o)}else this._setEndings(!1,!1,o);this._loopCount=r,this.time=s,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:a})}}else this.time=s;if(o&&(r&1)===1)return t-s}return s}_setEndings(e,t,n){let s=this._interpolantSettings;n?(s.endingStart=sr,s.endingEnd=sr):(e?s.endingStart=this.zeroSlopeAtStart?sr:ir:s.endingStart=Sa,t?s.endingEnd=this.zeroSlopeAtEnd?sr:ir:s.endingEnd=Sa)}_scheduleFading(e,t,n){let s=this._mixer,r=s.time,o=this._weightInterpolant;o===null&&(o=s._lendControlInterpolant(),this._weightInterpolant=o);let a=o.parameterPositions,c=o.sampleValues;return a[0]=r,c[0]=t,a[1]=r+e,c[1]=n,this}},fy=new Float32Array(1),Ao=class extends vi{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){let n=e._localRoot||this._root,s=e._clip.tracks,r=s.length,o=e._propertyBindings,a=e._interpolants,c=n.uuid,l=this._bindingsByRootAndName,u=l[c];u===void 0&&(u={},l[c]=u);for(let h=0;h!==r;++h){let f=s[h],p=f.name,g=u[p];if(g!==void 0)++g.referenceCount,o[h]=g;else{if(g=o[h],g!==void 0){g._cacheIndex===null&&(++g.referenceCount,this._addInactiveBinding(g,c,p));continue}let x=t&&t._propertyBindings[h].binding.parsedPath;g=new au(_t.create(n,p,x),f.ValueTypeName,f.getValueSize()),++g.referenceCount,this._addInactiveBinding(g,c,p),o[h]=g}a[h].resultBuffer=g.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){let n=(e._localRoot||this._root).uuid,s=e._clip.uuid,r=this._actionsByClip[s];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,s,n)}let t=e._propertyBindings;for(let n=0,s=t.length;n!==s;++n){let r=t[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){let t=e._propertyBindings;for(let n=0,s=t.length;n!==s;++n){let r=t[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){let t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){let s=this._actions,r=this._actionsByClip,o=r[t];if(o===void 0)o={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=o;else{let a=o.knownActions;e._byClipCacheIndex=a.length,a.push(e)}e._cacheIndex=s.length,s.push(e),o.actionByRoot[n]=e}_removeInactiveAction(e){let t=this._actions,n=t[t.length-1],s=e._cacheIndex;n._cacheIndex=s,t[s]=n,t.pop(),e._cacheIndex=null;let r=e._clip.uuid,o=this._actionsByClip,a=o[r],c=a.knownActions,l=c[c.length-1],u=e._byClipCacheIndex;l._byClipCacheIndex=u,c[u]=l,c.pop(),e._byClipCacheIndex=null;let h=a.actionByRoot,f=(e._localRoot||this._root).uuid;delete h[f],c.length===0&&delete o[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){let t=e._propertyBindings;for(let n=0,s=t.length;n!==s;++n){let r=t[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){let t=this._actions,n=e._cacheIndex,s=this._nActiveActions++,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){let t=this._actions,n=e._cacheIndex,s=--this._nActiveActions,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){let s=this._bindingsByRootAndName,r=this._bindings,o=s[t];o===void 0&&(o={},s[t]=o),o[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){let t=this._bindings,n=e.binding,s=n.rootNode.uuid,r=n.path,o=this._bindingsByRootAndName,a=o[s],c=t[t.length-1],l=e._cacheIndex;c._cacheIndex=l,t[l]=c,t.pop(),delete a[r],Object.keys(a).length===0&&delete o[s]}_lendBinding(e){let t=this._bindings,n=e._cacheIndex,s=this._nActiveBindings++,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){let t=this._bindings,n=e._cacheIndex,s=--this._nActiveBindings,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){let e=this._controlInterpolants,t=this._nActiveControlInterpolants++,n=e[t];return n===void 0&&(n=new Xa(new Float32Array(2),new Float32Array(2),1,fy),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){let t=this._controlInterpolants,n=e.__cacheIndex,s=--this._nActiveControlInterpolants,r=t[s];e.__cacheIndex=s,t[s]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){let s=t||this._root,r=s.uuid,o=typeof e=="string"?Sr.findByName(s,e):e,a=o!==null?o.uuid:e,c=this._actionsByClip[a],l=null;if(n===void 0&&(o!==null?n=o.blendMode:n=Au),c!==void 0){let h=c.actionByRoot[r];if(h!==void 0&&h.blendMode===n)return h;l=c.knownActions[0],o===null&&(o=l._clip)}if(o===null)return null;let u=new lu(this,o,t,n);return this._bindAction(u,l),this._addInactiveAction(u,a,r),u}existingAction(e,t){let n=t||this._root,s=n.uuid,r=typeof e=="string"?Sr.findByName(n,e):e,o=r?r.uuid:e,a=this._actionsByClip[o];return a!==void 0&&a.actionByRoot[s]||null}stopAllAction(){let e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;let t=this._actions,n=this._nActiveActions,s=this.time+=e,r=Math.sign(e),o=this._accuIndex^=1;for(let l=0;l!==n;++l)t[l]._update(s,e,r,o);let a=this._bindings,c=this._nActiveBindings;for(let l=0;l!==c;++l)a[l].apply(o);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){let t=this._actions,n=e.uuid,s=this._actionsByClip,r=s[n];if(r!==void 0){let o=r.knownActions;for(let a=0,c=o.length;a!==c;++a){let l=o[a];this._deactivateAction(l);let u=l._cacheIndex,h=t[t.length-1];l._cacheIndex=null,l._byClipCacheIndex=null,h._cacheIndex=u,t[u]=h,t.pop(),this._removeInactiveBindingsForAction(l)}delete s[n]}}uncacheRoot(e){let t=e.uuid,n=this._actionsByClip;for(let o in n){let a=n[o].actionByRoot,c=a[t];c!==void 0&&(this._deactivateAction(c),this._removeInactiveAction(c))}let s=this._bindingsByRootAndName,r=s[t];if(r!==void 0)for(let o in r){let a=r[o];a.restoreOriginalState(),this._removeInactiveBinding(a)}}uncacheAction(e,t){let n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"170"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="170");function wu(i,e){if(e===bd)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===bo||e===Ka){let t=i.getIndex();if(t===null){let o=[],a=i.getAttribute("position");if(a!==void 0){for(let c=0;c<a.count;c++)o.push(c);i.setIndex(o),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}let n=t.count-2,s=[];if(e===bo)for(let o=1;o<=n;o++)s.push(t.getX(0)),s.push(t.getX(o)),s.push(t.getX(o+1));else for(let o=0;o<n;o++)o%2===0?(s.push(t.getX(o)),s.push(t.getX(o+1)),s.push(t.getX(o+2))):(s.push(t.getX(o+2)),s.push(t.getX(o+1)),s.push(t.getX(o)));s.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let r=i.clone();return r.setIndex(s),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}var ja=class extends bi{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Uu(t)}),this.register(function(t){return new Nu(t)}),this.register(function(t){return new Wu(t)}),this.register(function(t){return new Xu(t)}),this.register(function(t){return new qu(t)}),this.register(function(t){return new Fu(t)}),this.register(function(t){return new Bu(t)}),this.register(function(t){return new zu(t)}),this.register(function(t){return new Hu(t)}),this.register(function(t){return new Du(t)}),this.register(function(t){return new ku(t)}),this.register(function(t){return new Ou(t)}),this.register(function(t){return new Gu(t)}),this.register(function(t){return new Vu(t)}),this.register(function(t){return new Pu(t)}),this.register(function(t){return new Yu(t)}),this.register(function(t){return new Zu(t)})}load(e,t,n,s){let r=this,o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){let l=ts.extractUrlBase(e);o=ts.resolveURL(l,this.path)}else o=ts.extractUrlBase(e);this.manager.itemStart(e);let a=function(l){s?s(l):console.error(l),r.manager.itemError(e),r.manager.itemEnd(e)},c=new _o(this.manager);c.setPath(this.path),c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(l){try{r.parse(l,o,function(u){t(u),r.manager.itemEnd(e)},a)}catch(u){a(u)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,s){let r,o={},a={},c=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(c.decode(new Uint8Array(e,0,4))===Wd){try{o[Je.KHR_BINARY_GLTF]=new Ku(e)}catch(h){s&&s(h);return}r=JSON.parse(o[Je.KHR_BINARY_GLTF].content)}else r=JSON.parse(c.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){s&&s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let l=new nh(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){let h=this.pluginCallbacks[u](l);h.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[h.name]=h,o[h.name]=!0}if(r.extensionsUsed)for(let u=0;u<r.extensionsUsed.length;++u){let h=r.extensionsUsed[u],f=r.extensionsRequired||[];switch(h){case Je.KHR_MATERIALS_UNLIT:o[h]=new Lu;break;case Je.KHR_DRACO_MESH_COMPRESSION:o[h]=new Ju(r,this.dracoLoader);break;case Je.KHR_TEXTURE_TRANSFORM:o[h]=new $u;break;case Je.KHR_MESH_QUANTIZATION:o[h]=new ju;break;default:f.indexOf(h)>=0&&a[h]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+h+'".')}}l.setExtensions(o),l.setPlugins(a),l.parse(n,s)}parseAsync(e,t){let n=this;return new Promise(function(s,r){n.parse(e,t,s,r)})}};function py(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}var Je={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},Pu=class{constructor(e){this.parser=e,this.name=Je.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,s=t.length;n<s;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,s=t.cache.get(n);if(s)return s;let r=t.json,c=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],l,u=new Ee(16777215);c.color!==void 0&&u.setRGB(c.color[0],c.color[1],c.color[2],un);let h=c.range!==void 0?c.range:0;switch(c.type){case"directional":l=new es(u),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new jt(u),l.distance=h;break;case"spot":l=new Rs(u),l.distance=h,c.spot=c.spot||{},c.spot.innerConeAngle=c.spot.innerConeAngle!==void 0?c.spot.innerConeAngle:0,c.spot.outerConeAngle=c.spot.outerConeAngle!==void 0?c.spot.outerConeAngle:Math.PI/4,l.angle=c.spot.outerConeAngle,l.penumbra=1-c.spot.innerConeAngle/c.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+c.type)}return l.position.set(0,0,0),l.decay=2,Ei(l,c),c.intensity!==void 0&&(l.intensity=c.intensity),l.name=t.createUniqueName(c.name||"light_"+e),s=Promise.resolve(l),t.cache.add(n,s),s}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(c){return n._getNodeRef(t.cache,a,c)})}},Lu=class{constructor(){this.name=Je.KHR_MATERIALS_UNLIT}getMaterialType(){return It}extendParams(e,t,n){let s=[];e.color=new Ee(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],un),e.opacity=o[3]}r.baseColorTexture!==void 0&&s.push(n.assignTexture(e,"map",r.baseColorTexture,Tt))}return Promise.all(s)}},Du=class{constructor(e){this.parser=e,this.name=Je.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}},Uu=class{constructor(e){this.parser=e,this.name=Je.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Sn}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){let a=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new Ue(a,a)}return Promise.all(r)}},Nu=class{constructor(e){this.parser=e,this.name=Je.KHR_MATERIALS_DISPERSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Sn}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}},Ou=class{constructor(e){this.parser=e,this.name=Je.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Sn}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(r)}},Fu=class{constructor(e){this.parser=e,this.name=Je.KHR_MATERIALS_SHEEN}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Sn}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[];t.sheenColor=new Ee(0,0,0),t.sheenRoughness=0,t.sheen=1;let o=s.extensions[this.name];if(o.sheenColorFactor!==void 0){let a=o.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],un)}return o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",o.sheenColorTexture,Tt)),o.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(r)}},Bu=class{constructor(e){this.parser=e,this.name=Je.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Sn}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(r)}},zu=class{constructor(e){this.parser=e,this.name=Je.KHR_MATERIALS_VOLUME}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Sn}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;let a=o.attenuationColor||[1,1,1];return t.attenuationColor=new Ee().setRGB(a[0],a[1],a[2],un),Promise.all(r)}},Hu=class{constructor(e){this.parser=e,this.name=Je.KHR_MATERIALS_IOR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Sn}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}},ku=class{constructor(e){this.parser=e,this.name=Je.KHR_MATERIALS_SPECULAR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Sn}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",o.specularTexture));let a=o.specularColorFactor||[1,1,1];return t.specularColor=new Ee().setRGB(a[0],a[1],a[2],un),o.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",o.specularColorTexture,Tt)),Promise.all(r)}},Vu=class{constructor(e){this.parser=e,this.name=Je.EXT_MATERIALS_BUMP}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Sn}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return t.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",o.bumpTexture)),Promise.all(r)}},Gu=class{constructor(e){this.parser=e,this.name=Je.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Sn}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return o.anisotropyStrength!==void 0&&(t.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(t.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",o.anisotropyTexture)),Promise.all(r)}},Wu=class{constructor(e){this.parser=e,this.name=Je.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,s=n.textures[e];if(!s.extensions||!s.extensions[this.name])return null;let r=s.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}},Xu=class{constructor(e){this.parser=e,this.name=Je.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=s.images[o.source],c=n.textureLoader;if(a.uri){let l=n.options.manager.getHandler(a.uri);l!==null&&(c=l)}return this.detectSupport().then(function(l){if(l)return n.loadTextureImage(e,o.source,c);if(s.extensionsRequired&&s.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){let t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}},qu=class{constructor(e){this.parser=e,this.name=Je.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=s.images[o.source],c=n.textureLoader;if(a.uri){let l=n.options.manager.getHandler(a.uri);l!==null&&(c=l)}return this.detectSupport().then(function(l){if(l)return n.loadTextureImage(e,o.source,c);if(s.extensionsRequired&&s.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){let t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}},Yu=class{constructor(e){this.name=Je.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let s=n.extensions[this.name],r=this.parser.getDependency("buffer",s.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){let c=s.byteOffset||0,l=s.byteLength||0,u=s.count,h=s.byteStride,f=new Uint8Array(a,c,l);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(u,h,f,s.mode,s.filter).then(function(p){return p.buffer}):o.ready.then(function(){let p=new ArrayBuffer(u*h);return o.decodeGltfBuffer(new Uint8Array(p),u,h,f,s.mode,s.filter),p})})}else return null}},Zu=class{constructor(e){this.name=Je.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let s=t.meshes[n.mesh];for(let l of s.primitives)if(l.mode!==Ln.TRIANGLES&&l.mode!==Ln.TRIANGLE_STRIP&&l.mode!==Ln.TRIANGLE_FAN&&l.mode!==void 0)return null;let o=n.extensions[this.name].attributes,a=[],c={};for(let l in o)a.push(this.parser.getDependency("accessor",o[l]).then(u=>(c[l]=u,c[l])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(l=>{let u=l.pop(),h=u.isGroup?u.children:[u],f=l[0].count,p=[];for(let g of h){let x=new we,m=new w,d=new ot,E=new w(1,1,1),b=new Ba(g.geometry,g.material,f);for(let v=0;v<f;v++)c.TRANSLATION&&m.fromBufferAttribute(c.TRANSLATION,v),c.ROTATION&&d.fromBufferAttribute(c.ROTATION,v),c.SCALE&&E.fromBufferAttribute(c.SCALE,v),b.setMatrixAt(v,x.compose(m,d,E));for(let v in c)if(v==="_COLOR_0"){let N=c[v];b.instanceColor=new Es(N.array,N.itemSize,N.normalized)}else v!=="TRANSLATION"&&v!=="ROTATION"&&v!=="SCALE"&&g.geometry.setAttribute(v,c[v]);Rt.prototype.copy.call(b,g),this.parser.assignFinalMaterial(b),p.push(b)}return u.isGroup?(u.clear(),u.add(...p),u):p[0]}))}},Wd="glTF",Eo=12,Hd={JSON:1313821514,BIN:5130562},Ku=class{constructor(e){this.name=Je.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,Eo),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Wd)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let s=this.header.length-Eo,r=new DataView(e,Eo),o=0;for(;o<s;){let a=r.getUint32(o,!0);o+=4;let c=r.getUint32(o,!0);if(o+=4,c===Hd.JSON){let l=new Uint8Array(e,Eo+o,a);this.content=n.decode(l)}else if(c===Hd.BIN){let l=Eo+o;this.body=e.slice(l,l+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},Ju=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=Je.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,s=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},c={},l={};for(let u in o){let h=eh[u]||u.toLowerCase();a[h]=o[u]}for(let u in e.attributes){let h=eh[u]||u.toLowerCase();if(o[u]!==void 0){let f=n.accessors[e.attributes[u]],p=Tr[f.componentType];l[h]=p.name,c[h]=f.normalized===!0}}return t.getDependency("bufferView",r).then(function(u){return new Promise(function(h,f){s.decodeDracoFile(u,function(p){for(let g in p.attributes){let x=p.attributes[g],m=c[g];m!==void 0&&(x.normalized=m)}h(p)},a,l,un,f)})})}},$u=class{constructor(){this.name=Je.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}},ju=class{constructor(){this.name=Je.KHR_MESH_QUANTIZATION}},Qa=class extends $i{constructor(e,t,n,s){super(e,t,n,s)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s*3+s;for(let o=0;o!==s;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=a*2,l=a*3,u=s-t,h=(n-t)/u,f=h*h,p=f*h,g=e*l,x=g-l,m=-2*p+3*f,d=p-f,E=1-m,b=d-f+h;for(let v=0;v!==a;v++){let N=o[x+v+a],R=o[x+v+c]*u,C=o[g+v+a],I=o[g+v]*u;r[v]=E*N+b*R+m*C+d*I}return r}},my=new ot,Qu=class extends Qa{interpolate_(e,t,n,s){let r=super.interpolate_(e,t,n,s);return my.fromArray(r).normalize().toArray(r),r}},Ln={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},Tr={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},kd={9728:zt,9729:Kt,9984:du,9985:eo,9986:nr,9987:jn},Vd={33071:mi,33648:ao,10497:ei},Ru={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},eh={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},ns={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},gy={CUBICSPLINE:void 0,LINEAR:mr,STEP:pr},Cu={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function xy(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new Gt({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Qn})),i.DefaultMaterial}function Cs(i,e,t){for(let n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function Ei(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function _y(i,e,t){let n=!1,s=!1,r=!1;for(let l=0,u=e.length;l<u;l++){let h=e[l];if(h.POSITION!==void 0&&(n=!0),h.NORMAL!==void 0&&(s=!0),h.COLOR_0!==void 0&&(r=!0),n&&s&&r)break}if(!n&&!s&&!r)return Promise.resolve(i);let o=[],a=[],c=[];for(let l=0,u=e.length;l<u;l++){let h=e[l];if(n){let f=h.POSITION!==void 0?t.getDependency("accessor",h.POSITION):i.attributes.position;o.push(f)}if(s){let f=h.NORMAL!==void 0?t.getDependency("accessor",h.NORMAL):i.attributes.normal;a.push(f)}if(r){let f=h.COLOR_0!==void 0?t.getDependency("accessor",h.COLOR_0):i.attributes.color;c.push(f)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(c)]).then(function(l){let u=l[0],h=l[1],f=l[2];return n&&(i.morphAttributes.position=u),s&&(i.morphAttributes.normal=h),r&&(i.morphAttributes.color=f),i.morphTargetsRelative=!0,i})}function vy(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,s=t.length;n<s;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function yy(i){let e,t=i.extensions&&i.extensions[Je.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Iu(t.attributes):e=i.indices+":"+Iu(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,s=i.targets.length;n<s;n++)e+=":"+Iu(i.targets[n]);return e}function Iu(i){let e="",t=Object.keys(i).sort();for(let n=0,s=t.length;n<s;n++)e+=t[n]+":"+i[t[n]]+";";return e}function th(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function Ay(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var My=new we,nh=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new py,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,s=-1,r=!1,o=-1;if(typeof navigator<"u"){let a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;let c=a.match(/Version\/(\d+)/);s=n&&c?parseInt(c[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&s<17||r&&o<98?this.textureLoader=new ws(this.options.manager):this.textureLoader=new Ya(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new _o(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,s=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){let a={scene:o[0][s.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:s.asset,parser:n,userData:{}};return Cs(r,a,s),Ei(a,s),Promise.all(n._invokeAll(function(c){return c.afterRoot&&c.afterRoot(a)})).then(function(){for(let c of a.scenes)c.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){let o=t[s].joints;for(let a=0,c=o.length;a<c;a++)e[o[a]].isBone=!0}for(let s=0,r=e.length;s<r;s++){let o=e[s];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let s=n.clone(),r=(o,a)=>{let c=this.associations.get(o);c!=null&&this.associations.set(a,c);for(let[l,u]of o.children.entries())r(u,a.children[l])};return r(n,s),s.name+="_instance_"+e.uses[t]++,s}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let s=e(t[n]);if(s)return s}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let s=0;s<t.length;s++){let r=e(t[s]);r&&n.push(r)}return n}getDependency(e,t){let n=e+":"+t,s=this.cache.get(n);if(!s){switch(e){case"scene":s=this.loadScene(t);break;case"node":s=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":s=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":s=this.loadAccessor(t);break;case"bufferView":s=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":s=this.loadBuffer(t);break;case"material":s=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":s=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":s=this.loadSkin(t);break;case"animation":s=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":s=this.loadCamera(t);break;default:if(s=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!s)throw new Error("Unknown type: "+e);break}this.cache.add(n,s)}return s}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,s=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(s.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Je.KHR_BINARY_GLTF].body);let s=this.options;return new Promise(function(r,o){n.load(ts.resolveURL(t.uri,s.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let s=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+s)})}loadAccessor(e){let t=this,n=this.json,s=this.json.accessors[e];if(s.bufferView===void 0&&s.sparse===void 0){let o=Ru[s.type],a=Tr[s.componentType],c=s.normalized===!0,l=new a(s.count*o);return Promise.resolve(new wt(l,o,c))}let r=[];return s.bufferView!==void 0?r.push(this.getDependency("bufferView",s.bufferView)):r.push(null),s.sparse!==void 0&&(r.push(this.getDependency("bufferView",s.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",s.sparse.values.bufferView))),Promise.all(r).then(function(o){let a=o[0],c=Ru[s.type],l=Tr[s.componentType],u=l.BYTES_PER_ELEMENT,h=u*c,f=s.byteOffset||0,p=s.bufferView!==void 0?n.bufferViews[s.bufferView].byteStride:void 0,g=s.normalized===!0,x,m;if(p&&p!==h){let d=Math.floor(f/p),E="InterleavedBuffer:"+s.bufferView+":"+s.componentType+":"+d+":"+s.count,b=t.cache.get(E);b||(x=new l(a,d*p,s.count*p/u),b=new yr(x,p/u),t.cache.add(E,b)),m=new bs(b,c,f%p/u,g)}else a===null?x=new l(s.count*c):x=new l(a,f,s.count*c),m=new wt(x,c,g);if(s.sparse!==void 0){let d=Ru.SCALAR,E=Tr[s.sparse.indices.componentType],b=s.sparse.indices.byteOffset||0,v=s.sparse.values.byteOffset||0,N=new E(o[1],b,s.sparse.count*d),R=new l(o[2],v,s.sparse.count*c);a!==null&&(m=new wt(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let C=0,I=N.length;C<I;C++){let S=N[C];if(m.setX(S,R[C*c]),c>=2&&m.setY(S,R[C*c+1]),c>=3&&m.setZ(S,R[C*c+2]),c>=4&&m.setW(S,R[C*c+3]),c>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=g}return m})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r],a=this.textureLoader;if(o.uri){let c=n.manager.getHandler(o.uri);c!==null&&(a=c)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){let s=this,r=this.json,o=r.textures[e],a=r.images[t],c=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[c])return this.textureCache[c];let l=this.loadImageSource(t,n).then(function(u){u.flipY=!1,u.name=o.name||a.name||"",u.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(u.name=a.uri);let f=(r.samplers||{})[o.sampler]||{};return u.magFilter=kd[f.magFilter]||Kt,u.minFilter=kd[f.minFilter]||jn,u.wrapS=Vd[f.wrapS]||ei,u.wrapT=Vd[f.wrapT]||ei,u.generateMipmaps=!u.isCompressedTexture&&u.minFilter!==zt&&u.minFilter!==Kt,s.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[c]=l,l}loadImageSource(e,t){let n=this,s=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());let o=s.images[e],a=self.URL||self.webkitURL,c=o.uri||"",l=!1;if(o.bufferView!==void 0)c=n.getDependency("bufferView",o.bufferView).then(function(h){l=!0;let f=new Blob([h],{type:o.mimeType});return c=a.createObjectURL(f),c});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let u=Promise.resolve(c).then(function(h){return new Promise(function(f,p){let g=f;t.isImageBitmapLoader===!0&&(g=function(x){let m=new Ht(x);m.needsUpdate=!0,f(m)}),t.load(ts.resolveURL(h,r.path),g,void 0,p)})}).then(function(h){return l===!0&&a.revokeObjectURL(c),Ei(h,o),h.userData.mimeType=o.mimeType||Ay(o.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",c),h});return this.sourceCache[e]=u,u}assignTexture(e,t,n,s){let r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[Je.KHR_TEXTURE_TRANSFORM]){let a=n.extensions!==void 0?n.extensions[Je.KHR_TEXTURE_TRANSFORM]:void 0;if(a){let c=r.associations.get(o);o=r.extensions[Je.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,c)}}return s!==void 0&&(o.colorSpace=s),e[t]=o,o})}assignFinalMaterial(e){let t=e.geometry,n=e.material,s=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){let a="PointsMaterial:"+n.uuid,c=this.cache.get(a);c||(c=new mo,mn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,c.sizeAttenuation=!1,this.cache.add(a,c)),n=c}else if(e.isLine){let a="LineBasicMaterial:"+n.uuid,c=this.cache.get(a);c||(c=new po,mn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,this.cache.add(a,c)),n=c}if(s||r||o){let a="ClonedMaterial:"+n.uuid+":";s&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let c=this.cache.get(a);c||(c=n.clone(),r&&(c.vertexColors=!0),o&&(c.flatShading=!0),s&&(c.normalScale&&(c.normalScale.y*=-1),c.clearcoatNormalScale&&(c.clearcoatNormalScale.y*=-1)),this.cache.add(a,c),this.associations.set(c,this.associations.get(n))),n=c}e.material=n}getMaterialType(){return Gt}loadMaterial(e){let t=this,n=this.json,s=this.extensions,r=n.materials[e],o,a={},c=r.extensions||{},l=[];if(c[Je.KHR_MATERIALS_UNLIT]){let h=s[Je.KHR_MATERIALS_UNLIT];o=h.getMaterialType(),l.push(h.extendParams(a,r,t))}else{let h=r.pbrMetallicRoughness||{};if(a.color=new Ee(1,1,1),a.opacity=1,Array.isArray(h.baseColorFactor)){let f=h.baseColorFactor;a.color.setRGB(f[0],f[1],f[2],un),a.opacity=f[3]}h.baseColorTexture!==void 0&&l.push(t.assignTexture(a,"map",h.baseColorTexture,Tt)),a.metalness=h.metallicFactor!==void 0?h.metallicFactor:1,a.roughness=h.roughnessFactor!==void 0?h.roughnessFactor:1,h.metallicRoughnessTexture!==void 0&&(l.push(t.assignTexture(a,"metalnessMap",h.metallicRoughnessTexture)),l.push(t.assignTexture(a,"roughnessMap",h.metallicRoughnessTexture))),o=this._invokeOne(function(f){return f.getMaterialType&&f.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(f){return f.extendMaterialParams&&f.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=an);let u=r.alphaMode||Cu.OPAQUE;if(u===Cu.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,u===Cu.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==It&&(l.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new Ue(1,1),r.normalTexture.scale!==void 0)){let h=r.normalTexture.scale;a.normalScale.set(h,h)}if(r.occlusionTexture!==void 0&&o!==It&&(l.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==It){let h=r.emissiveFactor;a.emissive=new Ee().setRGB(h[0],h[1],h[2],un)}return r.emissiveTexture!==void 0&&o!==It&&l.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,Tt)),Promise.all(l).then(function(){let h=new o(a);return r.name&&(h.name=r.name),Ei(h,r),t.associations.set(h,{materials:e}),r.extensions&&Cs(s,h,r),h})}createUniqueName(e){let t=_t.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,s=this.primitiveCache;function r(a){return n[Je.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(c){return Gd(c,a,t)})}let o=[];for(let a=0,c=e.length;a<c;a++){let l=e[a],u=yy(l),h=s[u];if(h)o.push(h.promise);else{let f;l.extensions&&l.extensions[Je.KHR_DRACO_MESH_COMPRESSION]?f=r(l):f=Gd(new $t,l,t),s[u]={primitive:l,promise:f},o.push(f)}}return Promise.all(o)}loadMesh(e){let t=this,n=this.json,s=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let c=0,l=o.length;c<l;c++){let u=o[c].material===void 0?xy(this.cache):this.getDependency("material",o[c].material);a.push(u)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(c){let l=c.slice(0,c.length-1),u=c[c.length-1],h=[];for(let p=0,g=u.length;p<g;p++){let x=u[p],m=o[p],d,E=l[p];if(m.mode===Ln.TRIANGLES||m.mode===Ln.TRIANGLE_STRIP||m.mode===Ln.TRIANGLE_FAN||m.mode===void 0)d=r.isSkinnedMesh===!0?new Na(x,E):new Te(x,E),d.isSkinnedMesh===!0&&d.normalizeSkinWeights(),m.mode===Ln.TRIANGLE_STRIP?d.geometry=wu(d.geometry,Ka):m.mode===Ln.TRIANGLE_FAN&&(d.geometry=wu(d.geometry,bo));else if(m.mode===Ln.LINES)d=new ka(x,E);else if(m.mode===Ln.LINE_STRIP)d=new Ar(x,E);else if(m.mode===Ln.LINE_LOOP)d=new Va(x,E);else if(m.mode===Ln.POINTS)d=new Ga(x,E);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(d.geometry.morphAttributes).length>0&&vy(d,r),d.name=t.createUniqueName(r.name||"mesh_"+e),Ei(d,r),m.extensions&&Cs(s,d,m),t.assignFinalMaterial(d),h.push(d)}for(let p=0,g=h.length;p<g;p++)t.associations.set(h[p],{meshes:e,primitives:p});if(h.length===1)return r.extensions&&Cs(s,h[0],r),h[0];let f=new Lt;r.extensions&&Cs(s,f,r),t.associations.set(f,{meshes:e});for(let p=0,g=h.length;p<g;p++)f.add(h[p]);return f})}loadCamera(e){let t,n=this.json.cameras[e],s=n[n.type];if(!s){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Bt(wd.radToDeg(s.yfov),s.aspectRatio||1,s.znear||1,s.zfar||2e6):n.type==="orthographic"&&(t=new Ji(-s.xmag,s.xmag,s.ymag,-s.ymag,s.znear,s.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Ei(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let s=0,r=t.joints.length;s<r;s++)n.push(this._loadNodeShallow(t.joints[s]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(s){let r=s.pop(),o=s,a=[],c=[];for(let l=0,u=o.length;l<u;l++){let h=o[l];if(h){a.push(h);let f=new we;r!==null&&f.fromArray(r.array,l*16),c.push(f)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new Fa(a,c)})}loadAnimation(e){let t=this.json,n=this,s=t.animations[e],r=s.name?s.name:"animation_"+e,o=[],a=[],c=[],l=[],u=[];for(let h=0,f=s.channels.length;h<f;h++){let p=s.channels[h],g=s.samplers[p.sampler],x=p.target,m=x.node,d=s.parameters!==void 0?s.parameters[g.input]:g.input,E=s.parameters!==void 0?s.parameters[g.output]:g.output;x.node!==void 0&&(o.push(this.getDependency("node",m)),a.push(this.getDependency("accessor",d)),c.push(this.getDependency("accessor",E)),l.push(g),u.push(x))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(c),Promise.all(l),Promise.all(u)]).then(function(h){let f=h[0],p=h[1],g=h[2],x=h[3],m=h[4],d=[];for(let E=0,b=f.length;E<b;E++){let v=f[E],N=p[E],R=g[E],C=x[E],I=m[E];if(v===void 0)continue;v.updateMatrix&&v.updateMatrix();let S=n._createAnimationTracks(v,N,R,C,I);if(S)for(let A=0;A<S.length;A++)d.push(S[A])}return new Sr(r,void 0,d)})}createNodeMesh(e){let t=this.json,n=this,s=t.nodes[e];return s.mesh===void 0?null:n.getDependency("mesh",s.mesh).then(function(r){let o=n._getNodeRef(n.meshCache,s.mesh,r);return s.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let c=0,l=s.weights.length;c<l;c++)a.morphTargetInfluences[c]=s.weights[c]}),o})}loadNode(e){let t=this.json,n=this,s=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=s.children||[];for(let l=0,u=a.length;l<u;l++)o.push(n.getDependency("node",a[l]));let c=s.skin===void 0?Promise.resolve(null):n.getDependency("skin",s.skin);return Promise.all([r,Promise.all(o),c]).then(function(l){let u=l[0],h=l[1],f=l[2];f!==null&&u.traverse(function(p){p.isSkinnedMesh&&p.bind(f,My)});for(let p=0,g=h.length;p<g;p++)u.add(h[p]);return u})}_loadNodeShallow(e){let t=this.json,n=this.extensions,s=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],o=r.name?s.createUniqueName(r.name):"",a=[],c=s._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});return c&&a.push(c),r.camera!==void 0&&a.push(s.getDependency("camera",r.camera).then(function(l){return s._getNodeRef(s.cameraCache,r.camera,l)})),s._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){a.push(l)}),this.nodeCache[e]=Promise.all(a).then(function(l){let u;if(r.isBone===!0?u=new fo:l.length>1?u=new Lt:l.length===1?u=l[0]:u=new Rt,u!==l[0])for(let h=0,f=l.length;h<f;h++)u.add(l[h]);if(r.name&&(u.userData.name=r.name,u.name=o),Ei(u,r),r.extensions&&Cs(n,u,r),r.matrix!==void 0){let h=new we;h.fromArray(r.matrix),u.applyMatrix4(h)}else r.translation!==void 0&&u.position.fromArray(r.translation),r.rotation!==void 0&&u.quaternion.fromArray(r.rotation),r.scale!==void 0&&u.scale.fromArray(r.scale);return s.associations.has(u)||s.associations.set(u,{}),s.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],s=this,r=new Lt;n.name&&(r.name=s.createUniqueName(n.name)),Ei(r,n),n.extensions&&Cs(t,r,n);let o=n.nodes||[],a=[];for(let c=0,l=o.length;c<l;c++)a.push(s.getDependency("node",o[c]));return Promise.all(a).then(function(c){for(let u=0,h=c.length;u<h;u++)r.add(c[u]);let l=u=>{let h=new Map;for(let[f,p]of s.associations)(f instanceof mn||f instanceof Ht)&&h.set(f,p);return u.traverse(f=>{let p=s.associations.get(f);p!=null&&h.set(f,p)}),h};return s.associations=l(r),r})}_createAnimationTracks(e,t,n,s,r){let o=[],a=e.name?e.name:e.uuid,c=[];ns[r.path]===ns.weights?e.traverse(function(f){f.morphTargetInfluences&&c.push(f.name?f.name:f.uuid)}):c.push(a);let l;switch(ns[r.path]){case ns.weights:l=Ai;break;case ns.rotation:l=Mi;break;case ns.position:case ns.scale:l=Si;break;default:n.itemSize===1?l=Ai:l=Si;break}let u=s.interpolation!==void 0?gy[s.interpolation]:mr,h=this._getArrayFromAccessor(n);for(let f=0,p=c.length;f<p;f++){let g=new l(c[f]+"."+ns[r.path],t.array,h,u);s.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(g),o.push(g)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=th(t.constructor),s=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)s[r]=t[r]*n;t=s}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let s=this instanceof Mi?Qu:Qa;return new s(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function Sy(i,e,t){let n=e.attributes,s=new In;if(n.POSITION!==void 0){let a=t.json.accessors[n.POSITION],c=a.min,l=a.max;if(c!==void 0&&l!==void 0){if(s.set(new w(c[0],c[1],c[2]),new w(l[0],l[1],l[2])),a.normalized){let u=th(Tr[a.componentType]);s.min.multiplyScalar(u),s.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let a=new w,c=new w;for(let l=0,u=r.length;l<u;l++){let h=r[l];if(h.POSITION!==void 0){let f=t.json.accessors[h.POSITION],p=f.min,g=f.max;if(p!==void 0&&g!==void 0){if(c.setX(Math.max(Math.abs(p[0]),Math.abs(g[0]))),c.setY(Math.max(Math.abs(p[1]),Math.abs(g[1]))),c.setZ(Math.max(Math.abs(p[2]),Math.abs(g[2]))),f.normalized){let x=th(Tr[f.componentType]);c.multiplyScalar(x)}a.max(c)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(a)}i.boundingBox=s;let o=new Mn;s.getCenter(o.center),o.radius=s.min.distanceTo(s.max)/2,i.boundingSphere=o}function Gd(i,e,t){let n=e.attributes,s=[];function r(o,a){return t.getDependency("accessor",o).then(function(c){i.setAttribute(a,c)})}for(let o in n){let a=eh[o]||o.toLowerCase();a in i.attributes||s.push(r(n[o],a))}if(e.indices!==void 0&&!i.index){let o=t.getDependency("accessor",e.indices).then(function(a){i.setIndex(a)});s.push(o)}return $e.workingColorSpace!==un&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${$e.workingColorSpace}" not supported.`),Ei(i,e),Sy(i,e,t),Promise.all(s).then(function(){return e.targets!==void 0?_y(i,e.targets,t):i})}var To=class extends vr{constructor(){super();let e=new ni;e.deleteAttribute("uv");let t=new Gt({side:ln}),n=new Gt,s=new jt(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new Te(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let o=new Te(e,n);o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),this.add(o);let a=new Te(e,n);a.position.set(-5.607,-.754,-.758),a.rotation.set(0,.994,0),a.scale.set(1.97,1.534,3.955),this.add(a);let c=new Te(e,n);c.position.set(6.167,.857,7.803),c.rotation.set(0,.561,0),c.scale.set(3.927,6.285,3.687),this.add(c);let l=new Te(e,n);l.position.set(-2.017,.018,6.124),l.rotation.set(0,.333,0),l.scale.set(2.002,4.566,2.064),this.add(l);let u=new Te(e,n);u.position.set(2.291,-.756,-2.621),u.rotation.set(0,-.286,0),u.scale.set(1.546,1.552,1.496),this.add(u);let h=new Te(e,n);h.position.set(-2.193,-.369,-5.547),h.rotation.set(0,.516,0),h.scale.set(3.875,3.487,2.986),this.add(h);let f=new Te(e,wr(50));f.position.set(-16.116,14.37,8.208),f.scale.set(.1,2.428,2.739),this.add(f);let p=new Te(e,wr(50));p.position.set(-16.109,18.021,-8.207),p.scale.set(.1,2.425,2.751),this.add(p);let g=new Te(e,wr(17));g.position.set(14.904,12.198,-1.832),g.scale.set(.15,4.265,6.331),this.add(g);let x=new Te(e,wr(43));x.position.set(-.462,8.89,14.52),x.scale.set(4.38,5.441,.088),this.add(x);let m=new Te(e,wr(20));m.position.set(3.235,11.486,-12.541),m.scale.set(2.5,2,.1),this.add(m);let d=new Te(e,wr(100));d.position.set(0,20,0),d.scale.set(1,.1,1),this.add(d)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function wr(i){let e=new It;return e.color.setScalar(i),e}var Ce={image:[4384,1872],tex:.9343065693430657,f:3535,cx:2110,cy:936,phi:.27986816800749803,camH:11.774928817533455,xoff:9.8,dmax:39.8,grille:{pas:.2,nx:125,ny:100,x0:-3,libre:"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP////////////////+AAAf////////////////8AAA/////////////////4AAB/////////////////wAAD/////////////////gAAH/////////////////AAAP////////////////+AAAf////////////////8AAA/////////////////4AAB/////////////////wAAD/////////////////gAAH/////////////////AAAP////////////////+AAA/////////////////8AAB/////////////////4AAD/////////////////wAAH/////////////////AAAP////////////////+AAAf////////////////8AAA/////////////////4AAB/////////////////wAAD/////////////////gAAH/////////////////AAAP////////////////+AAAf////////////////8AAA/////////////////4AAB/////////////////wAAD/////////////////gAAH/////////////////AAAP////////////////+AAAf////////////////8AAB/////////////////4AAD/////////////////wAAH/////////////////gAAP/////////////////AAAf////////////////+AAA/////////////////8AAB/////////////////4AAD/////////////////wAAH/////////////////gAAP/////////////////AAAf////////////////+AAA/////////////////8AAB/////////////////4AAD/////////////////wAAH/////////////////AAAP////////////////+AAAf////////////////8AAA/////////////////4AAB/////////////////wAAH/////////////////gAAP/////////////////AAAf////////////////+AAA/////////////////8AAB/////////////////4AAD/////////////////wAAH/////////////////gAAP/////////////////AAAf////////////////+AAA/////////////////8AAB/////////////////4AAD/////////////////wAAH/////////////////gAAP/////////////////AAAf////////////////+AAA/////////////////8AAB/////////////////4AAD/////////////////wAAP/////////////////gAAf/////////////////AAA/////////////////+AAB/////////////////8AAD/////////////////4AAH/////////////////wAAP//////////////+P/AAAf8H////////////wH+AAA/wH////////////gP8AAB/AH///////////+AP4AAD+AP///////////8AfwAAH8Af///////////4A/gAAP8B////////////4D/AAAf4D////////////4P+AAA/4P////////////9/8AAB/////////////////4AAD/////////////////wAAH/////////////////gAAf/////////////////AAA/////////////////+AAB/////////////////8AAD/////////////////4AAH/////////////////wAAP/////////////////gAAf/////////////////AAA/////////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",crevasse:"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAA/AAAAAAAAAAAAAAAP+AAB/AAAAAAAAAAAAAAAf8AAD+AAAAAAAAAAAAAAA/4AAH8AAAAAAAAAAAAAAB/4AAP8AAAAAAAAAAAAAAD/wAAf8AAAAAAAAAAAAAAf/gAA/4AAAAAAAAAAAAAB//AAB/wAAAAAAAAAAAAAD/+AAB/gAAAAAAAAAAAAAH/8AAD/AAAAAAAAAAAAAAP/wAAH+AAAAAAAAAAAAAAf/AAAP8AAAAAAAAAAAAAA/4AAA/4AAAAAAAAAAAAAB/wAAB/gAAAAAAAAAAAAAD/gAAf/AAAAAAAAAAAAAAH/AAA/+AAAAAAAAAAAAAAP+AAB/8AAAAAAAAAAAAAAP8AAD/4AAAAAAAAAAAAAAf4AAH/wAAAAAAAAAAAAAA/gAAP/gAAAAAAAAAAAAAD/AAAf/gAAAAAAAAAAAAAH+AAA//AAAAAAAAAAAAAAP+AAB/+AAAAAAAAAAAAAAf+AAD/8AAAAAAAAAAAAAA/8AAD/8AAAAAAAAAAAAAB/8AAD/8AAAAAAAAAAAAAH/4AAH//AAAAAAAAAAAAAP/wAAP/+AAAAAAAAAAAAAf/gAAP/8AAAAAAAAAAAAA//AAAf/4AAAAAAAAAAAAB/+AAAf/wAAAAAAAAAAAAf/4AAA//gAAAAAAAAAAAD//AAAB//AAAAAAAAAAAAP/+AAAD/4AAAAAAAAAAAA//8AAAH/wAAAAAAAAAAAB//4AAAP/gAAAAAAAAAAAD//wAAAf/AAAAAAAAAAAAH//gAAA//AAAAAAAAAAAAP//AAAB/+AAAAAAAAAAAAf/+AAAD/8AAAAAAAAAAAD//8AAAH/4AAAAAAAAAAAP//4AAAP/wAAAAAAAAAAA///wAAAf/gAAAAAAAAAAP///gAAA//AAAAAAAAAAAf///AAAD/+AAAAAAAAAAA///+AAAH/8AAAAAAAAAAB///8AAAf/gAAAAAAAAAAP///wAAA//AAAAAAAAAAAf///gAAB/8AAAAAAAAAAA///8AAAD/4AAAAAAAAAAB///4AAAH/wAAAAAAAAAAD///wAAB//gAAAAAAAAAAH///gAAD//AAAAAAAAAAAH///AAAH//AAAAAAAAAAAH//+AAAP/+AAAAAAAAAAAD//8AAAf/8AAAAAAAAAAAD//4AAA//4AAAAAAAAAAAA//wAAB//wAAAAAAAAAAAAf/gAAAH/gAAAAAAAAAAAA//AAAAH/AAAAAAAAAAAAB/+AAAAP/AAAAAAAAAAAAD/8AAAAf/AAAAAAAAAAAAH/4AAAA/+AAAAAAAAAAAAf/wAAAB/+AAAAAAAAAAAA//gAAAH/8AAAAAAAAAAAB//AAAAP/4AAAAAAAAAAAH/+AAAAf/4AAAAAAAAAAAP/8AAAA//4AAAAAAAAAAAf/4AAAD//4AAAAAAAAAAA//wAAAP//wAAAAAAAAAAB//gAAB///gAAAAAAAAAAD//wAAD///AAAAAAAAAAAH//gAAH//+AAAAAAAAAAAP//AAAP//8AAAAAAAAAAA//+AAAf/+AAAAAAAAAAAB//8AAA//wAAAAAAAAAAAH//4AAB//gAAAAAAAAAAAP//gAAD//AAAAAAAAAAAAf8AAAAH//AAAAAAAAAAAA/4AAAAP/+AAAAAAAAAAAB/wAAAAf/8AAAAAAAAAAAD/gAAAA//8AAAAAAAAAAAH/AAAAB//4AAAAAAAAAAAP+AAAAB//wAAAAAAAAAAA/8AAAAD//wAAAAAAAAAAD/4AAAAH//gAAAAAAAAAAH/wAAAAP//gAAAAAAAAAAP/wAAAAf//AAAAAAAAAAAf/gAAAA//+AAAAAAAAAAA//AAAAAD/+AAAAAAAAAAB/+AAAAAH/8AAAAAAAAAAD/8AAAAAP/4AAAAAAAAAAH/4AAAAAf/wAAAAAAAAAAP/wAAAAA//gAAAAAAAAAAf/gAAAAB//AAAAAAAAAAA/gAAAAAD/+AAAAAAAAAAB+AAAAAAH/8AAAAAAAAAAD8AAAAAAB/4AAAAAAAAAAAAAAAAAAAAAAAAAA"},piliers:[{nom:"g",x:-8.100683720421685,d:23.64800593670872,rect:[860,980,320,700],lanterne:3.0369328576313213,haut:4.431714147996532,gauche:-8.988438421541359,droite:-7.004073438862564},{nom:"d",x:8.496730085940312,d:23.729330416396014,rect:[3110,1010,320,670],lanterne:3.006660359091314,haut:4.413817176895913,gauche:7.408468396524,droite:9.376688358585602}],crev:[1097,933,2098,939],armure:{x:10.856690894654049,y:-5.973367061048528,z:2},porte:{x:10.49520716108876,y:-4.457163662500378,z:4},depart:{x:10.67,y:6.059999999999995}};var Xd=[{paire:0,pied:[1780,1290],x:6.85,y:10.29,haut:3.79,larg:3,sommet:881,rect:[1511,838,584,773],couleur:[.56,.754,1],eclat:{rect:[1306,606,993,1066],tuile:[496,533],cols:8,n:30,atlas:[3968,2132]}},{paire:0,pied:[2190,1030],x:10.68,y:2.59,haut:4.4,larg:2.11,sommet:638,rect:[2006,453,401,865],couleur:[.808,.604,1],eclat:{rect:[1865,250,682,1137],tuile:[341,568],cols:12,n:30,atlas:[4092,1704]}},{paire:0,pied:[2550,1130],x:14.26,y:5.94,haut:4.52,larg:1.77,sommet:692,rect:[2309,651,447,723],couleur:[.726,1,.8],eclat:{rect:[2152,434,760,997],tuile:[380,498],cols:10,n:30,atlas:[3800,1494]}},{paire:0,pied:[2700,1570],x:14.18,y:15.87,haut:2.98,larg:2.15,sommet:1192,rect:[2311,1150,631,675],couleur:[.547,.983,1],eclat:{rect:[2090,947,1072,925],tuile:[536,462],cols:7,n:30,atlas:[3752,2310]}},{paire:1,pied:[1800,1240],x:6.92,y:9.05,haut:5.98,larg:2.88,sommet:604,rect:[1511,568,644,1074],couleur:[.476,.753,1],eclat:{rect:[1285,250,1095,1477],tuile:[547,738],cols:7,n:30,atlas:[3829,3690]}},{paire:1,pied:[2760,1e3],x:17.17,y:1.46,haut:6.18,larg:2.56,sommet:456,rect:[2510,415,533,812],couleur:[.592,1,.979],eclat:{rect:[2323,250,906,1041],tuile:[453,520],cols:9,n:30,atlas:[4077,2080]}},{paire:1,pied:[2740,1700],x:14.14,y:17.87,haut:3.56,larg:.67,sommet:1214,rect:[2332,1139,737,733],couleur:[.816,.602,1],eclat:{rect:[2074,919,1252,953],tuile:[626,476],cols:6,n:30,atlas:[3756,2380]}},{paire:2,pied:[1400,1300],x:3.5,y:10.53,haut:2.5,larg:1.99,sommet:1031,rect:[1234,989,352,563],couleur:[.457,.797,1],eclat:{rect:[1110,820,599,777],tuile:[299,388],cols:13,n:30,atlas:[3887,1164]}},{paire:2,pied:[1650,1580],x:6.4,y:16.04,haut:1.55,larg:1.07,sommet:1385,rect:[1501,1344,292,432],couleur:[.721,.461,1],eclat:{rect:[1398,1214,497,596],tuile:[248,298],cols:16,n:30,atlas:[3968,596]}},{paire:2,pied:[2900,1340],x:16.62,y:11.45,haut:3.25,larg:1.97,sommet:979,rect:[2705,937,422,584],couleur:[.651,1,.926],eclat:{rect:[2557,761,717,806],tuile:[358,403],cols:11,n:30,atlas:[3938,1209]}},{paire:2,pied:[2620,1550],x:13.63,y:15.54,haut:1.71,larg:1.03,sommet:1339,rect:[2428,1174,392,492],couleur:[.507,1,.995],eclat:{rect:[2290,1026,667,679],tuile:[333,339],cols:12,n:30,atlas:[3996,1017]}},{paire:3,pied:[1680,1090],x:5.3,y:4.67,haut:5.31,larg:2.29,sommet:589,rect:[1509,547,402,805],couleur:[.439,.691,1],eclat:{rect:[1368,305,683,1111],tuile:[341,555],cols:12,n:30,atlas:[4092,1665]}},{paire:3,pied:[2200,1e3],x:10.82,y:1.46,haut:3.26,larg:1.49,sommet:719,rect:[2055,678,288,430],couleur:[.677,1,.783],eclat:{rect:[1954,549,489,593],tuile:[244,296],cols:16,n:30,atlas:[3904,592]}},{paire:3,pied:[2670,1100],x:15.61,y:5,haut:3.38,larg:1.32,sommet:783,rect:[2540,742,251,487],couleur:[.828,.596,1],eclat:{rect:[2452,595,426,672],tuile:[213,336],cols:19,n:30,atlas:[4047,672]}},{paire:3,pied:[1370,1420],x:3.76,y:13.14,haut:3.41,larg:1.53,sommet:1021,rect:[1233,980,453,654],couleur:[.687,.844,1],eclat:{rect:[1074,783,770,903],tuile:[385,451],cols:10,n:30,atlas:[3850,1353]}},{paire:3,pied:[2520,1580],x:12.83,y:16.04,haut:3.06,larg:1.24,sommet:1190,rect:[2323,1153,432,569],couleur:[.552,1,.983],eclat:{rect:[2171,982,735,785],tuile:[367,392],cols:11,n:30,atlas:[4037,1176]}},{paire:4,pied:[1580,1140],x:4.48,y:6.25,haut:3.5,larg:1.62,sommet:801,rect:[1394,759,425,571],couleur:[.459,.718,1],eclat:{rect:[1245,587,722,788],tuile:[361,394],cols:11,n:30,atlas:[3971,1182]}},{paire:4,pied:[2700,1100],x:15.93,y:5,haut:3.71,larg:1.7,sommet:751,rect:[2429,711,476,548],couleur:[.643,1,.74],eclat:{rect:[2262,546,809,756],tuile:[404,378],cols:10,n:30,atlas:[4040,1134]}},{paire:4,pied:[1690,1580],x:6.7,y:16.04,haut:2.16,larg:1.35,sommet:1307,rect:[1492,1190,512,633],couleur:[.799,.563,1],eclat:{rect:[1312,1e3,871,872],tuile:[435,436],cols:9,n:30,atlas:[3915,1744]}},{paire:4,pied:[2730,1500],x:14.61,y:14.66,haut:2.18,larg:1.36,sommet:1236,rect:[2409,1161,618,545],couleur:[.551,1,.99],eclat:{rect:[2192,997,1051,752],tuile:[525,376],cols:7,n:30,atlas:[3675,1880]}}];var Dt=window.QUI==="pisteur",Ye=!Dt,Li=40,Sh=Ye?.4:.62,fp=70,dp=250,rs=860,os=556,pp=Math.asin(.62),Ho=Ye?1:1/Math.cos(pp),ec={L:18,P:10.5,coin:3.4},Fe=Ye?{x:10.62,y:-9.45,z:2,r:1.6,zc:4.3,dy:0}:{x:9,y:1.25,r:1.6,zc:2.3,dy:.6},Ls={or:[1.2,5.6],rouge:[16.8,5.6]},mp=[[5.15,.75,2.6],[12.85,.75,2.6],[.42,3.85,2.3],[17.58,3.85,2.3]],rt=i=>document.getElementById(i),Mt=(i,e,t)=>i<e?e:i>t?t:i,Oo=rt("jeu"),En=new Da({canvas:Oo,antialias:!0,powerPreference:"high-performance"});En.setPixelRatio(Math.min(devicePixelRatio||1,2));En.outputColorSpace=Tt;En.toneMapping=fu;En.toneMappingExposure=1;En.shadowMap.enabled=!0;En.shadowMap.type=uu;En.autoClear=!0;En.setClearColor(197638,1);var Ri=860,si=410,Ci=0,Ii=0;function bh(){let i=innerWidth,e=innerHeight;si=Math.max(410,800*e/i)/(window.__zoom||1),Ri=si*i/e,En.setSize(i,e,!1)}addEventListener("resize",bh);bh();var tn=new vr,mt=Ye?new Bt(40,1,.5,400):new Ji(-1,1,1,-1,1,400),ls=Ye?Ce.phi:pp,qd=new w(0,Math.cos(ls),-Math.sin(ls)),Yd=new w(0,Math.sin(ls),Math.cos(ls)),Zd=new w((rs/2-fp)/Li,-(os/2-dp)/(Li*Sh),0);Ye?(mt.position.set(Ce.xoff,-Ce.dmax,Ce.camH),mt.up.copy(Yd),mt.lookAt(mt.position.clone().add(qd))):(mt.position.copy(Zd).addScaledVector(qd,-120),mt.up.copy(Yd),mt.lookAt(Zd));function Ty(){mt.left=(Ci-rs/2)/Li,mt.right=(Ci+Ri-rs/2)/Li,mt.top=(os/2-Ii)/Li,mt.bottom=(os/2-Ii-si)/Li,mt.updateProjectionMatrix()}var Pi=Ye?Ce.image[0]:1,Fo=Ye?Ce.image[1]:1,Le={x0:0,y0:0,x1:Pi,y1:Fo,bouge:0};function wy(){let i=mt.near,e=Ce.f;mt.projectionMatrix.makePerspective((Le.x0-Ce.cx)/e*i,(Le.x1-Ce.cx)/e*i,(Ce.cy-Le.y0)/e*i,(Ce.cy-Le.y1)/e*i,i,mt.far),mt.projectionMatrixInverse.copy(mt.projectionMatrix).invert()}function gp(i,e,t){let n=Math.sin(ls),s=Math.cos(ls),r=(t||0)-Ce.camH,o=Ce.cy-e,a=r*(Ce.f*s+o*n)/(o*s-Ce.f*n),c=a*s-r*n;return{x:(i-Ce.cx)*c/Ce.f+Ce.xoff,y:Ce.dmax-a}}function Nr(i,e,t){let n=Math.sin(ls),s=Math.cos(ls),r=i-Ce.xoff,o=Ce.dmax-e,a=(t||0)-Ce.camH,c=o*s-a*n,l=o*n+a*s;return{u:Ce.cx+Ce.f*r/c,v:Ce.cy-Ce.f*l/c}}var oe=new Lt;oe.scale.set(1,1,Ho);tn.add(oe);var de=(i,e,t)=>new w(i,-e,t||0),hh=i=>fp+i*Li,uc=(i,e)=>dp+i*Li*Sh-(e||0)*Li,Ns=new ws,is=(i,e,t)=>Ns.load(i,n=>{n.colorSpace=t?Tt:cn,n.anisotropy=4,n.needsUpdate=!0,cs(e)}),At,fh=null,Kd=null,Jd=null;if(Ye){fh=is("nuit/fond.jpg","fond",!0),Kd=is("nuit/crev.jpg","crev",!0),Jd=is("nuit/crev-a.png","crevA",!1);let i=is("nuit/feu.jpg","feu",!0);dh=is("nuit/coup-d.jpg","coupImgD",!0),xp=is("nuit/coup-g.jpg","coupImgG",!0);let e=is("nuit/arrivee.png","arrivee",!1);e.minFilter=e.magFilter=zt,e.generateMipmaps=!1,At=new Qt({uniforms:{fond:{value:fh},crev:{value:Kd},crevA:{value:Jd},fen:{value:new ze(0,0,Pi,Fo)},img:{value:new Ue(Pi,Fo)},rc:{value:new ze(...Ce.crev)},ouvre:{value:0},lueur:{value:0},feu:{value:i},arr:{value:e},vid:{value:i},camA:{value:new ze(Ce.f,Ce.cx,Ce.cy,Ce.phi)},camB:{value:new w(Ce.camH,Ce.xoff,Ce.dmax)},vague:{value:0},tw:{value:0},secours:{value:0},src:{value:new Ue(Fe.x,Fe.y)},temps:{value:0},cri:{value:[new ze,new ze,new ze]},vidC:{value:i},coup:{value:0},coupSec:{value:0},coupImg:{value:dh}},vertexShader:"varying vec2 vU; void main(){ vU = position.xy*0.5+0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:`uniform sampler2D fond; uniform sampler2D crev; uniform sampler2D crevA; uniform vec4 fen; uniform vec2 img; uniform vec4 rc; uniform float ouvre; uniform float lueur; varying vec2 vU;
      uniform sampler2D feu; uniform sampler2D arr; uniform sampler2D vid; uniform vec4 camA; uniform vec3 camB; uniform float vague; uniform float tw; uniform float secours; uniform vec2 src; uniform float temps; uniform vec4 cri[3];
      uniform sampler2D vidC; uniform float coup; uniform float coupSec; uniform sampler2D coupImg;
      float bruit(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      vec3 lin(vec3 c){ return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
      void main(){
        vec2 p = vec2(mix(fen.x, fen.z, vU.x), mix(fen.w, fen.y, vU.y));   // (en pixels de la peinture, y vers le bas)
        vec2 uv = clamp(p / img, vec2(0.0005), vec2(0.9995));
        vec3 c = texture2D(fond, vec2(uv.x, 1.0 - uv.y)).rgb;
        vec2 q = (p - rc.xy) / rc.zw;
        if (ouvre > 0.0 && q.x > 0.0 && q.x < 1.0 && q.y > 0.0 && q.y < 1.0) {
          float a = texture2D(crevA, vec2(q.x, 1.0 - q.y)).r;
          float front = ouvre * 1.35 - 0.12 * bruit(floor(p / 24.0));   // (elles partent du haut des marches et filent vers nous)
          a *= smoothstep(q.y, q.y + 0.12, front);
          vec3 k = texture2D(crev, vec2(q.x, 1.0 - q.y)).rgb;
          k += k * lueur * smoothstep(0.35, 0.9, max(k.b, k.r) - k.g) * 1.2;   // (le violet et le bleu-vert du fond qui pulsent)
          c = mix(c, k, a);
        }
        if (vague > 0.0) {   // la vague de feu : la vid\xE9o de Romain (recal\xE9e sur sa peinture, lignes 250 \xE0 1870) ; derri\xE8re chaque cristal, vu du temple, l'abri
          float abri = 0.0;
          float s = sin(camA.w), co = cos(camA.w), Zr = -camB.x, kk = camA.z - p.y, den = kk * co - camA.x * s;
          float D = Zr * (camA.x * co + kk * s) / den;
          if (den < 0.0 && D > 0.0) {
            float zc = D * co - Zr * s; vec2 g = vec2((p.x - camA.y) * zc / camA.x + camB.y, camB.z - D);
            if (g.y > -1.5 && g.y < 21.0 && g.x > -1.5 && g.x < 23.0)
              for (int i = 0; i < 3; i++) { vec4 C = cri[i]; if (C.w > 0.5) {
                vec2 c2 = C.xy - src; float L = length(c2); vec2 u = c2 / L; vec2 v = g - src;
                float al = dot(v, u) - L, pe = abs(v.x * u.y - v.y * u.x), r = C.z + max(al, 0.0) * 0.12;
                abri = max(abri, smoothstep(-0.3, 0.4, al) * (1.0 - smoothstep(4.2, 5.2, al)) * (1.0 - smoothstep(r * 0.75, r * 1.1, pe)));
              } }
          }
          vec3 f = c; float m = vague;
          if (secours < 0.5) {
            if (p.y > 250.0 && p.y < 1870.0) {
              f = lin(texture2D(vid, vec2(uv.x, 1.0 - (p.y - 250.0) / 1620.0)).rgb);
              if (tw > 5.0) f *= 1.0 + 0.12 * sin(temps * 7.0 + p.x * 0.013 + p.y * 0.021) * smoothstep(0.05, 0.4, max(f.r, f.g));   // (la derni\xE8re image : la lave vit encore)
            } else m = 0.0;
          } else {   // (la vid\xE9o ne d\xE9file pas : la place en feu peinte par Romain, l\xE0 o\xF9 le feu de la vid\xE9o serait d\xE9j\xE0 arriv\xE9)
            float a = texture2D(arr, vec2(uv.x, 1.0 - uv.y)).r * 255.0;
            float brule = a < 254.0 ? smoothstep(a / 24.0, a / 24.0 + 0.4, tw) : 0.0;
            vec3 lv = texture2D(feu, vec2(uv.x, 1.0 - uv.y)).rgb;
            lv *= 1.0 + 0.12 * sin(temps * 7.0 + p.x * 0.013 + p.y * 0.021) * smoothstep(0.05, 0.4, max(lv.r, lv.g));
            f = mix(c, lv, brule);
          }
          c = mix(c, f, m * (1.0 - abri));
        }
        if (coup > 0.0) {   // le coup de poing de Grosbec : la vid\xE9o de Romain (la zone dor\xE9e, puis la lumi\xE8re qui jaillit du sol), recal\xE9e, la place enti\xE8re
          vec3 f = coupSec > 0.5 ? texture2D(coupImg, vec2(uv.x, 1.0 - uv.y)).rgb : lin(texture2D(vidC, vec2(uv.x, 1.0 - uv.y)).rgb);
          c = mix(c, f, coup);
        }
        float hors = smoothstep(img.y - 110.0, img.y + 4.0, p.y) + smoothstep(-6.0, -150.0, p.x) + smoothstep(img.x + 6.0, img.x + 150.0, p.x);   // (au bord de la peinture : la nuit)
        c *= 1.0 - clamp(hors, 0.0, 1.0);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,depthTest:!1,depthWrite:!1,toneMapped:!1})}else{let i=Ns.load("fond.jpg",t=>{t.colorSpace=Tt,t.anisotropy=4,t.needsUpdate=!0,cs("fond")}),e=Ns.load("prof.png",t=>{t.colorSpace=cn,t.minFilter=t.magFilter=zt,t.generateMipmaps=!1,cs("prof")});At=new Qt({uniforms:{fond:{value:i},prof:{value:e},fen:{value:new ze(0,0,1,1)}},vertexShader:"varying vec2 vU; void main(){ vU = position.xy*0.5+0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:`uniform sampler2D fond; uniform sampler2D prof; uniform vec4 fen; varying vec2 vU;
      void main(){
        vec2 uv = vec2(mix(fen.x, fen.z, vU.x), 1.0 - mix(fen.w, fen.y, vU.y));
        vec4 c = texture2D(fond, uv);
        vec4 p = texture2D(prof, uv);
        float z = 90.0 + (p.r * 255.0 * 256.0 + p.g * 255.0) / 65535.0 * 60.0 + 0.12;
        gl_FragDepth = (z - 1.0) / 399.0;
        gl_FragColor = c;
        #include <colorspace_fragment>
      }`,depthTest:!0,depthFunc:oo,depthWrite:!0,toneMapped:!1})}var dh,xp,Eh=new Te(new Nt(2,2),At);Eh.frustumCulled=!1;Eh.renderOrder=-10;tn.add(Eh);var Ry=[];function wo(i,e,t,n,s,r){let o=new jt(i,s,r,1.6);return o.position.copy(de(e,t,n)),oe.add(o),Ry.push(o),o}var _p=[],ph=null,Ds=new Te(new Nt(30,30),new xo({opacity:.5}));Ds.receiveShadow=!0;oe.add(Ds);var Io={lanternes:[],cristaux:[],fissures:[],porte:null};if(Ye){tn.add(new vo(7109824,2761782,.75));{let e=new Ss(En);tn.environment=e.fromScene(new To,.04).texture,tn.environmentIntensity=.22}let i=new es(14674175,.8);i.position.copy(de(Ce.porte.x,Ce.porte.y,5)),i.target.position.copy(de(Ce.porte.x,12,0)),oe.add(i,i.target),Io.porte=i;for(let e of Ce.piliers){let t=e.x+Ce.xoff,n=Ce.dmax-e.d,s=new Rs(16757864,70,13,1.42,.8,1.5);s.position.copy(de(t,n+.05,e.lanterne)),s.target.position.copy(de(t,n+.05,0)),oe.add(s,s.target),s.castShadow=!0,s.shadow.mapSize.set(1024,1024),s.shadow.camera.near=.5,s.shadow.camera.far=30,s.shadow.bias=-8e-4,s.shadow.radius=3;let r=new jt(16756832,18,7,1.6);r.position.copy(de(t,n+.4,e.lanterne)),oe.add(r),Io.lanternes.push({l:s,pt:r,x:t,y:n,z:e.lanterne})}for(let[e,t,n,s,r]of[[1e3,1045,.9,10514687,14],[1400,955,.8,10514687,10],[3640,1005,.9,4253904,14],[2960,960,.8,8032511,8],[420,1560,.7,4253904,16],[3950,1450,.7,4253904,16],[260,1740,.6,10514687,14]]){let o=gp(e,t,n);Io.cristaux.push(wo(s,o.x,o.y,n+.6,r,7))}Ds.position.copy(de(Ce.xoff+1,10,.002)),Ds.material.onBeforeCompile=e=>{let t="shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;",n="{ vec2 qo = vSpotLightCoord[ i ].xy / vSpotLightCoord[ i ].w - 0.5; float fo = 1.0 - smoothstep( 0.16, 0.42, length( qo ) ); shadow *= receiveShadow ? mix( 1.0, getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ), fo ) : 1.0; }";e.fragmentShader=e.fragmentShader.replace("#include <shadowmask_pars_fragment>",Ve.shadowmask_pars_fragment.replace(t,n)),e.vertexShader=e.vertexShader.replace("void main() {",`varying float vYJeu;
void main() {`).replace("#include <worldpos_vertex>",`#include <worldpos_vertex>
  vYJeu = -( modelMatrix * vec4( transformed, 1.0 ) ).y;`),e.fragmentShader=e.fragmentShader.replace("void main() {",`varying float vYJeu;
void main() {`).replace("gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );","gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) * ( 1.0 - smoothstep( 18.2, 19.6, vYJeu ) ) );")}}else{tn.add(new vo(10137312,5914156,1.1));{let t=new Ss(En);tn.environment=t.fromScene(new To,.04).texture,tn.environmentIntensity=.35}_p=mp.map(t=>wo(16747066,t[0],t[1]+.3,t[2]+.5,40,10)),wo(16760928,Ls.or[0]+.5,Ls.or[1]+.35,2,30,8),wo(16726564,Ls.rouge[0]-.5,Ls.rouge[1]+.35,2,30,8),ph=wo(16754784,Fe.x,Fe.y+1.2,2.8,45,11);let i=new Rs(9416959,60,30,.42,.6,1.2);i.position.copy(de(7,3,16)),i.target.position.copy(de(8.4,6.6,0)),oe.add(i,i.target),i.castShadow=!0,i.shadow.mapSize.set(1024,1024),i.shadow.camera.near=5,i.shadow.camera.far=30,i.shadow.bias=-5e-4;let e=new es(14212351,1.3);e.position.copy(de(9,26,9)),e.target.position.copy(de(9,4,1)),oe.add(e,e.target),Ds.geometry=new Nt(30,20),Ds.position.copy(de(9,5,.002))}function gn(i,e,t){let n=document.createElement("canvas");n.width=i,n.height=e,t(n.getContext("2d"));let s=new Wa(n);return s.colorSpace=Tt,s}var Dn=i=>gn(64,64,e=>{let t=e.createRadialGradient(32,32,0,32,32,32);t.addColorStop(0,"rgba(255,255,255,1)"),t.addColorStop(.2,i),t.addColorStop(.5,i.replace(/[\d.]+\)$/,"0.35)")),t.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=t,e.fillRect(0,0,64,64)}),vp=gn(32,48,i=>{i.beginPath(),i.moveTo(16,2),i.bezierCurveTo(22,14,30,24,28,34),i.bezierCurveTo(26,44,6,44,4,34),i.bezierCurveTo(2,24,10,14,16,2);let e=i.createLinearGradient(0,44,0,2);e.addColorStop(0,"rgba(255,250,210,1)"),e.addColorStop(.3,"rgba(255,190,60,.95)"),e.addColorStop(.65,"rgba(255,90,20,.7)"),e.addColorStop(1,"rgba(180,20,10,0)"),i.fillStyle=e,i.fill()}),Xn=(i,e)=>gn(64,72,t=>{t.translate(32,40),t.lineCap="round",t.lineJoin="round";let n=()=>{t.beginPath(),e?(t.moveTo(-6,15),t.lineTo(-6,-26),t.lineTo(18,-34),t.lineTo(18,7),t.moveTo(-6,-16),t.lineTo(18,-24)):(t.moveTo(7,13),t.lineTo(7,-29),t.quadraticCurveTo(21,-19,19,-3))},s=()=>{t.beginPath(),e?(t.ellipse(-13,16,9,7,-.4,0,7),t.moveTo(20,8),t.ellipse(11,8,9,7,-.4,0,7)):t.ellipse(-2,16,10,8,-.4,0,7)};t.strokeStyle=i,t.lineWidth=6,n(),t.stroke(),t.fillStyle=i,s(),t.fill(),t.strokeStyle="rgba(255,255,255,.9)",t.lineWidth=2,n(),t.stroke()}),tc=(i,e,t)=>gn(128,128,n=>{n.translate(60,64),n.lineCap="round",n.lineJoin="round";let s=()=>{n.beginPath(),n.ellipse(-14,30,19,14,-.45,0,7),n.fill(),n.beginPath(),n.moveTo(1,26),n.lineTo(1,-46),n.stroke(),n.beginPath(),n.moveTo(1,-46),n.bezierCurveTo(22,-36,34,-22,30,-2),n.bezierCurveTo(28,-14,18,-22,3,-26),n.fill()};n.shadowColor=e,n.shadowBlur=20,n.fillStyle=e,n.strokeStyle=e,n.lineWidth=11,s(),n.shadowBlur=0,n.fillStyle=t,n.strokeStyle=t,n.lineWidth=9,s(),n.fillStyle=i,n.strokeStyle=i,n.lineWidth=4.5,n.save(),n.scale(.86,.86),s(),n.restore()}),ih=i=>{let e=gn(64,128,t=>{t.shadowColor=i,t.shadowBlur=10,t.strokeStyle=i,t.lineWidth=7;for(let n=0;n<5;n++){let s=14+n*25;t.beginPath(),t.moveTo(-10,s),t.lineTo(74,s),t.stroke()}t.shadowBlur=0,t.strokeStyle="rgba(255,255,255,.95)",t.lineWidth=2.5;for(let n=0;n<5;n++){let s=14+n*25;t.beginPath(),t.moveTo(-10,s),t.lineTo(74,s),t.stroke()}});return e.wrapS=ei,e},Cy=gn(48,48,i=>{i.translate(24,24),i.strokeStyle="rgba(235,250,255,1)",i.shadowColor="rgba(140,220,255,1)",i.shadowBlur=6,i.lineWidth=2.5,i.lineCap="round";for(let e=0;e<6;e++)i.save(),i.rotate(e*Math.PI/3),i.beginPath(),i.moveTo(0,0),i.lineTo(0,-18),i.moveTo(0,-10),i.lineTo(-5,-15),i.moveTo(0,-10),i.lineTo(5,-15),i.stroke(),i.restore()}),Iy=gn(32,48,i=>{i.beginPath(),i.moveTo(16,3),i.bezierCurveTo(20,14,27,22,27,31),i.arc(16,31,11,0,Math.PI),i.bezierCurveTo(5,22,12,14,16,3),i.shadowColor="rgba(190,255,40,1)",i.shadowBlur=8;let e=i.createLinearGradient(0,4,0,44);e.addColorStop(0,"rgba(240,255,170,1)"),e.addColorStop(1,"rgba(150,215,10,1)"),i.fillStyle=e,i.fill(),i.shadowBlur=0,i.fillStyle="rgba(255,255,255,.85)",i.beginPath(),i.ellipse(12,30,2.5,4,.3,0,7),i.fill()}),yp={glace:tc("#eefbff","rgba(120,210,255,1)","rgba(25,90,170,1)"),feu:tc("#fff3d6","rgba(255,140,40,1)","rgba(150,50,10,1)"),acide:tc("#f6ffc4","rgba(195,255,20,1)","rgba(70,105,0,1)"),soin:tc("#effff2","rgba(120,235,160,1)","rgba(35,130,75,1)")},Py={glace:ih("rgba(150,225,255,1)"),feu:ih("rgba(255,170,70,1)"),acide:ih("rgba(200,255,50,1)")},Ap={glace:[Xn("#e6f8ff",!1),Xn("#e6f8ff",!0)],feu:[Xn("#ffd9a0",!1),Xn("#ffd9a0",!0)],acide:[Xn("#eaff8a",!1),Xn("#eaff8a",!0)],soin:[Xn("#d2ffdc",!1),Xn("#d2ffdc",!0)],or:[Xn("#ffe7a6",!1),Xn("#ffe7a6",!0)]},Yt={or:Dn("rgba(255,200,90,.95)"),feu:Dn("rgba(255,120,40,.95)"),glace:Dn("rgba(140,220,255,.95)"),rouge:Dn("rgba(255,70,40,.95)"),poussiere:Dn("rgba(225,205,175,.55)"),acide:Dn("rgba(190,255,40,.95)"),fumee:Dn("rgba(215,240,150,.5)"),soin:Dn("rgba(130,240,165,.95)"),violet:Dn("rgba(175,110,255,.95)"),fumeeOmbre:Dn("rgba(70,30,120,.55)")},Fr={glace:{lum:8378623,I:22,dist:5,v:12,taille:1.2,sol:1.8,petite:"#d8f6ff",charge:9429247,boum:10479871,main:11069695},feu:{lum:16742954,I:40,dist:7,v:9,taille:1.45,sol:2.6,petite:"#ffc070",charge:16747066,boum:16747066,main:16752720},acide:{lum:12123952,I:26,dist:5.5,v:11,taille:1.2,sol:2,petite:"#e2ff7a",charge:12910400,boum:13172544,main:13696864},soin:{petite:"#c8ffd6",charge:9306032,main:10551232}};function gt(i,e,t){let n=new ho({map:i,transparent:!0,depthWrite:!1,blending:t?Wn:Zi,toneMapped:!1}),s=new Ua(n);return s.scale.set(e,e,1),s}var Mp=[];if(!Ye)for(let i of mp){let e=new Lt;e.position.copy(de(i[0],i[1],i[2]+.02)),oe.add(e);let t=gt(Yt.feu,1.6,!0);t.position.z=.25,t.material.opacity=.55,t.material.depthTest=!1,e.add(t);for(let n=0;n<3;n++){let s=gt(vp,.45,!0);s.center.set(.5,.05),s.material.depthTest=!1,e.add(s),Mp.push({f:s,i:n,b:i})}}if(!Ye)for(let i of["or","rouge"]){let e=gt(Yt[i],1.4,!0);e.position.copy(de(Ls[i][0],Ls[i][1],1.95)),e.material.opacity=.7,e.material.depthTest=!1,oe.add(e)}var xc=[];if(Ye)for(let i of Ce.piliers){let e=i.x+Ce.xoff,t=Ce.dmax-i.d,n=i.droite-i.gauche+1.4,s=i.haut+.6,r=is("nuit/pilier-"+i.nom+".png","pilier-"+i.nom,!1),o=new Qt({uniforms:{fond:{value:fh},masque:{value:r},fen:At.uniforms.fen,img:At.uniforms.img,ecran:{value:new Ue(1,1)},rect:{value:new ze(...i.rect)}},vertexShader:"void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform sampler2D fond; uniform sampler2D masque; uniform vec4 fen; uniform vec2 img; uniform vec2 ecran; uniform vec4 rect;
      void main(){
        vec2 e = gl_FragCoord.xy / ecran, p = vec2(mix(fen.x, fen.z, e.x), mix(fen.w, fen.y, e.y)), q = (p - rect.xy) / rect.zw;
        if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) discard;
        float a = texture2D(masque, vec2(q.x, 1.0 - q.y)).r;
        if (a < 0.08) discard;
        gl_FragColor = vec4(texture2D(fond, vec2(p.x / img.x, 1.0 - p.y / img.y)).rgb, smoothstep(0.08, 0.6, a));
        #include <colorspace_fragment>
      }`,transparent:!0,depthWrite:!0,toneMapped:!1,side:an}),a=new Te(new Nt(n,s),o);a.frustumCulled=!1,a.position.copy(de(e,t,s/2)),a.up.set(0,0,1),a.lookAt(new w(mt.position.x,mt.position.y,s/2)),oe.add(a);let c=gt(Yt.or,2.2,!0);c.position.copy(de(e,t+.1,i.lanterne)),c.material.opacity=.18,c.material.depthTest=!1,oe.add(c),xc.push({q:a,m:o,x:e,y:t,r:.85,halo:c})}var Us=new Lt;oe.add(Us);var Di=new Lt;Us.add(Di);var Bo=new Lt;Bo.rotation.x=Math.PI/2;Di.add(Bo);var Ly=gt(gn(64,64,i=>{let e=i.createRadialGradient(32,32,0,32,32,32);e.addColorStop(0,"rgba(0,0,0,.55)"),e.addColorStop(1,"rgba(0,0,0,0)"),i.fillStyle=e,i.fillRect(0,0,64,64)}),1,!1),Sp=new Te(new Nt(1.1,.8),new It({map:Ly.material.map,transparent:!0,depthWrite:!1,toneMapped:!1}));Sp.position.z=.004;Di.add(Sp);var y={x:Ye?Ce.depart.x:9,y:Ye?Ce.depart.y:7.6,a:-Math.PI/2,sort:null,sortT:0,sortD:0,luth:"dos",tl:0,garde:0},Ur=null,it={};var bp=new ja;bp.register(i=>(i.textureLoader=new ws(i.options.manager),{name:"images_par_img"}));function Po(i,e,t){fetch(i).then(n=>{if(!n.ok)throw new Error(i+" : "+n.status);return n.json()}).then(n=>{let s=atob(n.glb),r=new Uint8Array(s.length);for(let o=0;o<s.length;o++)r[o]=s.charCodeAt(o);bp.parse(r.buffer,"",e,t)}).catch(t)}var $d=window.ANIMS||{};Po(Dt?"pisteur.json":"barde.json",i=>{let e=i.scene;e.traverse(n=>{n.isMesh&&(n.castShadow=!0,n.receiveShadow=!1,n.frustumCulled=!1,n.material&&(n.material.metalness=0,n.material.envMapIntensity=.5))}),e.scale.setScalar(1.55/1.5),Bo.add(e),Ur=new Ao(e),Dt?rA(e):By(e),i.animations.length&&(it.garde=Ur.clipAction(i.animations[0]));let t=Object.keys($d).length;t||cs("barde");for(let[n,s]of Object.entries($d))Po(s,r=>{if(r.animations[0]){let o=Ur.clipAction(r.animations[0]);it[n]&&it[n]!==o&&it[n].stop(),it[n]=o,(n==="feu"||n==="glace")&&(o.setLoop(So),o.clampWhenFinished=!0)}--t===0&&cs("barde")},()=>{--t===0&&cs("barde")});it.garde&&it.garde.play()},i=>{rt("charge").textContent="\u26A0",console.error(i)});var Yn=Dt?{marche:{vitesse:.6,max:1},course:{vitesse:4.4},furtif:{vitesse:1.26,min:1,max:1.8}}:{marche:{vitesse:.6,max:1},course:{vitesse:4}},sh=Dt?["garde","marche","course","furtif","guet"]:["garde","marche","course"],Me={garde:1,marche:0,course:0,furtif:0,guet:0,v:0,allure:"garde",tm:1.619,tc:0,tf:0};function Dy(i,e,t){let n=Math.min(1,Math.hypot(e,t)),s=Math.atan2(t,e),r="garde";if(!y.sort&&n>.15&&(r=n>=.85||Me.allure==="course"&&n>=.75?"course":"marche"),Dt&&y.ombre){let a=n>.15?Yn.furtif.min+(Yn.furtif.max-Yn.furtif.min)*Mt((n-.15)/.7,0,1):0;if(Me.v+=Mt(a-Me.v,-10*i,8*i),n>.15&&(y.a=s),Me.allure=n>.15||Me.v>.1?"furtif":"guet",Me.v>.001){let c=y.x+Math.cos(y.a)*Me.v*i,l=y.y+Math.sin(y.a)*Me.v*i;Zn(c,y.y)&&(y.x=c),Zn(y.x,l)&&(y.y=l)}return}if(Dt&&(Me.allure==="furtif"||Me.allure==="guet")&&(Me.allure=Me.v>.05?"marche":"garde"),!y.derap&&r==="course"&&Me.allure==="course"&&Me.v>3.2&&Math.abs(Math.atan2(Math.sin(s-y.a),Math.cos(s-y.a)))>140*Math.PI/180){let l=Math.PI/2-s-Di.rotation.z;l=Math.atan2(Math.sin(l),Math.cos(l)),y.derap={t:0,rz0:Di.rotation.z,da:l,a1:s,aOld:y.a},Me.v*=.65,us(y.x,y.y,y.a)}let o=r==="garde"?0:r==="marche"?Yn.marche.vitesse+(Yn.marche.max-Yn.marche.vitesse)*Mt((n-.15)/.7,0,1):Yn.course.vitesse;if(Me.v+=Mt(o-Me.v,-14*i,10*i),r!=="garde"&&(y.a=s),Me.allure=r==="course"?"course":r==="marche"?Me.allure==="course"&&Me.v>1.6?"course":"marche":Me.v>1.6&&Me.allure==="course"?"course":Me.v>.05?Me.allure==="garde"?"marche":Me.allure:"garde",Me.v>.001&&!window.__surplace){let a=y.x+Math.cos(y.a)*Me.v*i,c=y.y+Math.sin(y.a)*Me.v*i;Zn(a,y.y)&&(y.x=a),Zn(y.x,c)&&(y.y=c)}}function Uy(i){let e=Math.min(1,i*10),t=0;for(let a of sh)Me[a]+=((Me.allure===a?1:0)-Me[a])*e,t+=Me[a];for(let a of sh)Me[a]/=t||1;Me.tm+=i*Mt(Me.v/Yn.marche.vitesse,.8,1.7),Me.tc+=i*Math.max(.85,Me.v/Yn.course.vitesse),Yn.furtif&&(Me.tf+=i*Mt(Me.v/Yn.furtif.vitesse,.8,1.7));let n=SA(),s=Dt?lA():0,r=_A(),o=Math.max(n,s,r);if(it.projete){let a=it.projete;if(!a.__lance){a.play(),a.__lance=!0;let c=a.getClip().tracks.find(l=>l.name==="Hips.position");if(c&&!c.__fixe){c.__fixe=!0;for(let l=3;l<c.values.length;l+=3)c.values[l]=c.values[0],c.values[l+2]=c.values[2]}}a.timeScale=0,a.setEffectiveWeight(r),a.time=y.proj?Math.min(as.debut+y.proj.t*as.vitesse,a.getClip().duration-.001):0}if(it.saut){let a=it.saut;a.__lance||(a.play(),a.__lance=!0),a.timeScale=0,a.setEffectiveWeight(n),a.time=y.saut?Math.min(dt.depart+y.saut.t*dt.vitesse,a.getClip().duration-.001):0}Dt&&uA(s);for(let a of sh){let c=it[a];if(!c||(c.__lance||(c.play(),c.__lance=!0),c.setEffectiveWeight(Me[a]*(1-o)),a==="garde"||a==="guet"))continue;c.timeScale=0;let l=c.getClip().duration;a==="marche"?c.time=Me.tm%l:a==="course"?c.time=Me.tc%l:a==="furtif"&&(c.time=Me.tf%l)}}var Wt={centre:new w(.035,.846,-.146),axe:new w(-.526,.85,.036).normalize(),face:new w(-.066,.001,-.998).normalize()},Ny={glace:1.5,feu:3,soin:2,acide:1.5},fn=null,Nn=null,en={},sc=new we,Ep=new we,Oy=new we,Tp=new we,Fy=new w,cM=new ot,rc=new w;function By(i){fn=i,i.updateMatrixWorld(!0);for(let h of["Spine","RightArm","RightForeArm","RightHand","LeftArm","LeftForeArm","LeftHand"])en[h]=i.getObjectByName(h);if(Nn=i.getObjectByName("luth"),!Nn)return;Nn.matrixAutoUpdate=!1,sc.copy(Th(en.Spine)).invert();let e=new w(.8,.5,.25).normalize(),t=new w(0,.3,1),n=t.sub(e.clone().multiplyScalar(t.dot(e))).normalize(),s=new w().crossVectors(e,n),r=new w().crossVectors(Wt.axe,Wt.face).normalize(),o=new w().crossVectors(r,Wt.axe).normalize(),a=new we().makeBasis(Wt.axe,o,r),l=new we().makeBasis(e,n,s).multiply(a.transpose()),u=new w(-.06,.86,.24);Ep.copy(new we().makeTranslation(u.x,u.y,u.z)).multiply(l).multiply(new we().makeTranslation(-Wt.centre.x,-Wt.centre.y,-Wt.centre.z))}function Th(i){return Oy.copy(Tp.copy(fn.matrixWorld).invert()).multiply(i.matrixWorld).clone()}function Ir(i,e){return(e||new w).setFromMatrixPosition(i.matrixWorld).applyMatrix4(Tp.copy(fn.matrixWorld).invert())}function hc(i){let e=new ot;return Th(i).decompose(Fy,e,rc),e}function mh(i,e){i.quaternion.copy(hc(i.parent).invert().multiply(e)),i.updateMatrixWorld(!0)}function jd(i,e,t,n,s,r){if(r<=.001)return;let o=Ir(i),a=Ir(e),c=Ir(t),l=c.clone().lerp(n,r),u=a.distanceTo(o),h=c.distanceTo(a),f=l.distanceTo(o);f=Mt(f,Math.abs(u-h)+1e-4,u+h-1e-4);let p=l.clone().sub(o).normalize(),g=Mt((u*u+f*f-h*h)/(2*u*f),-1,1),x=Math.sqrt(1-g*g),m=s.clone().sub(p.clone().multiplyScalar(s.dot(p)));m.lengthSq()<1e-8&&m.set(0,-1,0),m.normalize();let d=o.clone().addScaledVector(p,u*g).addScaledVector(m,u*x);mh(i,new ot().setFromUnitVectors(a.clone().sub(o).normalize(),d.clone().sub(o).normalize()).multiply(hc(i)));let E=Ir(e),b=Ir(t),v=o.clone().addScaledVector(p,f);mh(e,new ot().setFromUnitVectors(b.clone().sub(E).normalize(),v.clone().sub(E).normalize()).multiply(hc(e)))}var rh=new ot;function zy(){let i=fn&&fn.getObjectByName("Hips");if(!i||!it.garde)return;let e=it.garde.getEffectiveWeight();if(e<=0)return;let t=i.quaternion;rh.set(0,t.y,0,t.w).normalize();let n=rh.clone().invert().premultiply(t.clone());n.copy(t.clone().multiply(rh.clone().invert())),i.quaternion.slerp(n,e)}var Xt=i=>(i=Mt(i,0,1),i*i*(3-2*i));function wh(){let i=y.tl;return y.luth==="dos"?{wR:0,k:0,wL:0,sR:0}:y.luth==="main"?{wR:1,k:1,wL:1,sR:1}:y.luth==="sort"?{wR:Xt(i/.25),k:Xt((i-.25)/.4),wL:Xt((i-.5)/.2),sR:Xt((i-.55)/.25)}:{wR:1-Xt((i-.55)/.2),k:1-Xt((i-.15)/.4),wL:1-Xt(i/.2),sR:1-Xt(i/.2)}}var Hy=new w(-.34,1.12,.02),Is=new we,ky=new w,Vy=new w,Qd=new ot,ep=new ot,Ro=0;function Gy(i,e){if(!Nn||!fn)return;fn.updateMatrixWorld(!0);let t=wh(),n=Th(en.Spine),s=n.clone().multiply(sc),r=n.clone().multiply(sc).multiply(Ep);s.decompose(ky,Qd,rc),r.decompose(Vy,ep,rc);let o=Wt.centre.clone().applyMatrix4(s),a=Wt.centre.clone().applyMatrix4(r),c=t.k,l=o.clone().multiplyScalar((1-c)*(1-c)).addScaledVector(Hy.clone().applyMatrix4(n.clone().multiply(sc)),2*c*(1-c)).addScaledVector(a,c*c),u=Qd.clone().slerp(ep,c);Is.makeRotationFromQuaternion(u).scale(rc);let h=Wt.centre.clone().applyMatrix4(Is);if(Is.setPosition(l.clone().sub(h)),Nn.matrix.copy(Is),Nn.matrixWorldNeedsUpdate=!0,Nn.updateMatrixWorld(!0),t.wR<=.001&&t.wL<=.001)return;let f=(Q,V,ie)=>Wt.centre.clone().addScaledVector(Wt.axe,Q).addScaledVector(Wt.face,ie).addScaledVector(new w().crossVectors(Wt.axe,Wt.face).normalize(),V).applyMatrix4(Is),p=f(.36,0,0);Ro+=i*(y.sort&&y.luth==="main"||y.luth==="sort"&&y.sort?1:-1)*4,Ro=Mt(Ro,0,1);let g=y.sort?y.sortD-y.sortT:9,x=y.sort?Xt((.42-g)/.12):0;y.phaseG=(y.phaseG||0)+i*(4.5+8*x);let m=Math.sin(y.phaseG*2*Math.PI),d=Ro*(1+.7*x),E=f(.05+.015*m*d,.05*m*d,.05+.014*Math.abs(m)*d),b=Wt.axe.clone().transformDirection(Is),v=Wt.face.clone().transformDirection(Is),N=new w(0,1,0).sub(b.clone().multiplyScalar(b.y)).normalize(),R=f(.31+.012*Math.sin(e*9)*Ro,0,0),C=N.clone().multiplyScalar(.8).addScaledVector(v,.45).normalize(),I=v.clone().sub(C.clone().multiplyScalar(v.dot(C))).normalize(),S=R.clone().addScaledVector(I,-.032).addScaledVector(C,-nc.paume),A=N.clone().multiplyScalar(-.85).addScaledVector(b,-.35).normalize(),P=v.clone().negate().sub(A.clone().multiplyScalar(-v.dot(A))).normalize(),k=E.clone().addScaledVector(P,-.03).addScaledVector(A,-nc.paume),B=p.clone().lerp(k,t.sR),G=A,J=P;if(y.geste!==void 0&&y.geste<Rr.duree){let Q=y.geste<Rr.monte?Xt(y.geste/Rr.monte):1-Xt((y.geste-Rr.tient)/(Rr.duree-Rr.tient)),V=y.dernier==="soin",ie=Ir(en.RightArm),pe=ie.clone().add(V?new w(-.12,.44,.08):new w(-.2,.17,.24));B=B.lerp(pe,Q),G=A.clone().lerp(V?new w(-.15,1,.12).normalize():new w(-.35,.75,.55).normalize(),Q).normalize(),J=P.clone().lerp(new w(-.15,-.25,1).normalize(),Q),J.sub(G.clone().multiplyScalar(J.dot(G))).normalize(),y.geste>.05&&!y.eclair&&(y.eclair=!0,Wy())}let X=new w(-.6,.5,.2).lerp(new w(-.7,-.6,-.3),Mt(t.k*1.2,0,1));jd(en.RightArm,en.RightForeArm,en.RightHand,B,X,t.wR),tp(en.RightHand,G,J,nc.paumeD,t.wR*t.sR),jd(en.LeftArm,en.LeftForeArm,en.LeftHand,S,new w(.7,-.6,-.2),t.wL),tp(en.LeftHand,C,I,nc.paumeG,t.wL)}var Rr={monte:.07,tient:.2,duree:.38},oc=[];function Wy(){let i=y.dernier||"glace",e=new w;en.RightHand.getWorldPosition(e);let t={x:e.x,y:-e.y,z:e.z/Ho},n=gt(Yt[i],.3,!0);n.position.copy(de(t.x,t.y,t.z)),oe.add(n);let s=Oi(Fr[i].main,22,4);s&&s.position.copy(de(t.x,t.y,t.z)),oc.push({sp:n,l:s,t:0})}function Xy(i){for(let e=oc.length-1;e>=0;e--){let t=oc[e];t.t+=i;let n=t.t/.28;if(n>=1){oe.remove(t.sp),t.sp.material.dispose(),Br(t.l),oc.splice(e,1);continue}let s=.3+1.1*Math.sin(Math.min(1,n*2.2)*Math.PI/2);t.sp.scale.set(s,s,1),t.sp.material.opacity=1-n*n,t.l&&(t.l.intensity=22*(1-n))}}var nc={paume:.075,paumeG:new w(1,0,0),paumeD:new w(-1,0,0)};function tp(i,e,t,n,s){if(s<=.001)return;let r=new w(0,1,0),o=n,a=new w().crossVectors(r,o),c=new w().crossVectors(e,t),l=new we().makeBasis(e,t,c),u=new we().makeBasis(r,o,a),h=new ot().setFromRotationMatrix(l.multiply(u.transpose()));mh(i,hc(i).slerp(h,s))}function gh(i){let e=Wt.centre.clone().addScaledVector(Wt.face,.03+(i||0)).applyMatrix4(Nn.matrixWorld);return{x:e.x,y:-e.y,z:e.z/Ho}}var Lo=[],_n=[],Ni=[],wi=null;function Rh(){if(y.sort=null,y.sortT=0,Br(wi),wi=null,y.garde=0,y.geste=void 0,y.luth==="main")y.luth="range",y.tl=0;else if(y.luth==="sort"){let i=wh().k;y.luth="range",y.tl=Mt(.15+.4*(1-i),0,.55)}}function Ch(i){if(!(Dt||y.sort||y.saut||y.proj)){if(y.sort=i,y.sortT=0,y.sortD=Ny[i],y.luth==="dos")y.luth="sort",y.tl=0;else if(y.luth==="range"){let e=wh().k;y.luth="sort",y.tl=.25+.4*e}}}var wp=[];for(let i=0;i<5;i++){let e=new jt(16777215,0,7,1.6);e.libre=!0,oe.add(e),wp.push(e)}function Oi(i,e,t){let n=wp.find(s=>s.libre);return n?(n.libre=!1,n.color.setHex(i),n.intensity=e,n.distance=t,n):null}function Br(i){i&&(i.intensity=0,i.libre=!0)}function qy(i,e){let t=Fr[i],n=i==="feu",s=new Lt,r=e?de(e.x,e.y,e.z):de(y.x+Math.cos(y.a)*.4,y.y+Math.sin(y.a)*.4,1.1);s.position.copy(r),oe.add(s);let o=gt(Yt[i],1.1,!0);o.material.opacity=.45,o.renderOrder=3,s.add(o);let a=gt(yp[i],t.taille,!1);a.center.set(46/128,1-94/128),a.renderOrder=4,s.add(a);let c=30,l=new $t;l.setAttribute("position",new wt(new Float32Array(c*2*3),3)),l.setAttribute("color",new wt(new Float32Array(c*2*3),3));let u=new Float32Array(c*2*2);for(let x=0;x<c;x++)u[x*4]=x/(c-1)*3,u[x*4+1]=0,u[x*4+2]=x/(c-1)*3,u[x*4+3]=1;l.setAttribute("uv",new wt(u,2));let h=[];for(let x=0;x<c-1;x++){let m=x*2;h.push(m,m+1,m+2,m+1,m+3,m+2)}l.setIndex(h);let f=new Te(l,new It({map:Py[i],vertexColors:!0,transparent:!0,depthWrite:!1,blending:Wn,side:an,toneMapped:!1}));f.frustumCulled=!1,f.visible=!1,f.renderOrder=2,tn.add(f);let p=Oi(t.lum,t.I,t.dist);p&&p.position.copy(r);let g=new Te(new Nt(1,1),new It({map:Yt[i],transparent:!0,opacity:.45,depthWrite:!1,blending:Wn,toneMapped:!1}));oe.add(g),Lo.push({gr:s,n:a,l:p,sol:g,feu:n,q:i,ruban:f,hist:[],N:c,x:r.x,y:-r.y,z:e?e.z:1.1,t:0,petite:0,goutte:.05})}function Yy(i){for(let e=Lo.length-1;e>=0;e--){let t=Lo[e],n=Fr[t.q];t.t+=i;let s=Fe.x-t.x,r=Fe.y+Fe.dy-t.y,o=Math.hypot(s,r),a=n.v*(Ye?1.6:1);if(o<.5){Br(t.l),Jy(t),oe.remove(t.gr),oe.remove(t.sol),tn.remove(t.ruban),t.ruban.geometry.dispose(),t.ruban.material.dispose(),Lo.splice(e,1);continue}t.x+=s/o*a*i,t.y+=r/o*a*i,t.z+=(Fe.zc-t.z)*Math.min(1,i*2),t.gr.position.copy(de(t.x,t.y,t.z)),t.l&&t.l.position.copy(t.gr.position),t.n.material.rotation=Math.sin(t.t*8)*.2,Zy(t),t.petite-=i,t.petite<=0&&t.hist.length>6&&(t.petite=.06,Ky(t)),t.q==="acide"&&(t.goutte-=i,t.goutte<=0&&(t.goutte=.05+Math.random()*.05,Cp(t.x+(Math.random()-.5)*.2,t.y+(Math.random()-.5)*.15,t.z-.15))),t.sol.position.copy(de(t.x,t.y,.02)),t.sol.scale.set(n.sol,n.sol,1),Math.random()<i*40&&Rp(t.x,t.y,t.z,t.q)}}var fc=new w;function Zy(i){let e=new w;i.gr.getWorldPosition(e),i.hist.length<2||i.hist[1].distanceTo(e)>.04?(i.hist.unshift(e),i.hist.length>i.N&&i.hist.pop()):i.hist[0].copy(e);let t=i.hist,n=t.length;if(n<3)return;mt.getWorldDirection(fc);let s=i.ruban.geometry.attributes.position,r=i.ruban.geometry.attributes.color,o=.5;for(let a=0;a<i.N;a++){let c=Math.min(a,n-1),l=t[Math.max(0,c-1)],u=t[Math.min(n-1,c+1)],h=l.clone().sub(u);h.lengthSq()<1e-8&&h.set(1,0,0),h.normalize();let f=new w().crossVectors(h,fc).normalize(),p=.09*Math.sin(i.t*10-a*.45)*Math.min(1,a/5),g=t[c].clone().addScaledVector(f,p),x=(a>=n-1?0:1)*Math.pow(1-a/(i.N-1),1.2)*Math.min(1,.35+a/3);s.setXYZ(a*2,g.x+f.x*o/2,g.y+f.y*o/2,g.z+f.z*o/2),s.setXYZ(a*2+1,g.x-f.x*o/2,g.y-f.y*o/2,g.z-f.z*o/2),r.setXYZ(a*2,x,x,x),r.setXYZ(a*2+1,x,x,x)}s.needsUpdate=!0,r.needsUpdate=!0,i.ruban.visible=!0}function Ky(i){let e=i.hist,t=2+Math.floor(Math.random()*Math.min(8,e.length-3)),n=e[t-1],s=e[t+1],r=n.clone().sub(s).normalize();mt.getWorldDirection(fc);let o=new w().crossVectors(r,fc).normalize(),a=(Math.floor(Math.random()*5)-2)*.1,c=e[t].clone().addScaledVector(o,a),l={x:c.x,y:-c.y,z:c.z/Ho},u=gt(Ap[i.q][Math.random()<.5?0:1],.2+Math.random()*.06,!0);if(u.position.copy(de(l.x,l.y,l.z)),oe.add(u),Ni.push({sp:u,x:l.x,y:l.y,z:l.z,vx:0,vy:0,vz:.15,t:0,vie:.6}),i.q==="glace"&&Math.random()<.6){let h=gt(Cy,.13+Math.random()*.08,!0),f={x:l.x+(Math.random()-.5)*.4,y:l.y+(Math.random()-.5)*.3,z:l.z+(Math.random()-.5)*.3};h.position.copy(de(f.x,f.y,f.z)),oe.add(h),Ni.push({sp:h,...f,vx:0,vy:0,vz:-.2,t:0,vie:.7,tourne:(Math.random()-.5)*4})}}function Rp(i,e,t,n,s){let r=n==="feu",o=r?.3:n==="acide"?.16:.18,a=gt(r?vp:Yt[n],o,!0);a.position.copy(de(i,e,t)),oe.add(a);let c=Math.random()*6.28,l=(s||.6)*Math.random();_n.push({sp:a,vx:Math.cos(c)*l,vy:Math.sin(c)*l,vz:r?1+Math.random():Math.random()*.5-.2,vie:.5+Math.random()*.4,t:0,s0:o})}function Jy(i){let e=Fr[i.q],t=Oi(e.boum,i.feu?60:30,8);t&&(t.position.copy(de(i.x,i.y,i.z)),_n.push({lum:t,t:0,vie:.45,I:t.intensity}));for(let n=0;n<(i.feu?26:16);n++)Rp(i.x,i.y,i.z,i.q,3);if(i.q==="acide")for(let n=0;n<14;n++){let s=Math.random()*6.28,r=1+Math.random()*2;Cp(i.x,i.y,i.z,Math.cos(s)*r,Math.sin(s)*r,1+Math.random()*2)}}var Do=[];function Cp(i,e,t,n,s,r){let o=gt(Iy,.13+Math.random()*.05,!1);o.renderOrder=3,o.position.copy(de(i,e,t)),oe.add(o),Do.push({sp:o,x:i,y:e,z:t,vx:n||0,vy:s||0,vz:r||-.5,t:0})}function $y(i){for(let e=Do.length-1;e>=0;e--){let t=Do[e];if(t.t+=i,t.sp){t.vz-=9*i,t.x+=t.vx*i,t.y+=t.vy*i,t.z+=t.vz*i,t.sp.position.copy(de(t.x,t.y,t.z)),t.z<=.03&&(oe.remove(t.sp),t.sp.material.dispose(),t.sp=null,t.t=0,jy(t));continue}let n=t.t/t.vie;if(n>=1){t.flaque&&(oe.remove(t.flaque),t.flaque.material.dispose()),Do.splice(e,1);continue}if(t.flaque){t.flaque.material.opacity=.75*(1-n);let s=t.r0*(1+.3*n);t.flaque.scale.set(s,s*.8,1)}}}function jy(i){let e=new Te(new Nt(1,1),new It({map:Yt.acide,transparent:!0,opacity:.75,depthWrite:!1,blending:Wn,toneMapped:!1}));e.position.copy(de(i.x,i.y,.015)),oe.add(e),i.flaque=e,i.r0=.22+Math.random()*.12,i.vie=.9,Do.push(i);for(let t=0;t<2;t++){let n=gt(Yt.fumee,.18,!1);n.position.copy(de(i.x,i.y,.08)),oe.add(n),_n.push({sp:n,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.2,vz:.6+Math.random()*.5,vie:.55+Math.random()*.3,t:0,s0:.22,grossit:1})}for(let t=0;t<3;t++){let n=gt(Yt.acide,.06,!0);n.position.copy(de(i.x,i.y,.05)),oe.add(n);let s=Math.random()*6.28;_n.push({sp:n,vx:Math.cos(s)*.7,vy:Math.sin(s)*.5,vz:.8+Math.random(),vie:.25+Math.random()*.15,t:0,s0:.07})}}function Qy(i){if(!Nn)return;let e=gh(),t=gt(Xn(Fr[i].petite,Math.random()<.5),.2,!1);t.position.copy(de(e.x,e.y,e.z)),oe.add(t),Ni.push({sp:t,x:e.x,y:e.y,z:e.z,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.3,t:0})}function eA(i){for(let e=Ni.length-1;e>=0;e--){let t=Ni[e],n=t.vie||.9;if(t.t+=i,t.t>n){oe.remove(t.sp),t.sp.material.dispose(),t.halo&&(oe.remove(t.halo),t.halo.material.dispose()),Ni.splice(e,1);continue}if(t.g&&(t.vz-=t.g*i),t.suit?(t.ox+=t.vx*i,t.oy+=t.vy*i,t.z+=t.vz*i,t.x=y.x+t.ox,t.y=y.y+t.oy):(t.x+=t.vx*i,t.y+=t.vy*i,t.z+=(t.vz!==void 0?t.vz:.9)*i),t.sp.position.copy(de(t.x,t.y,t.z)),t.halo){let s=t.t/n,r=Math.sin(Math.PI*s),o=t.s0*(.85+.2*Math.sin(t.t*13+t.ph));t.sp.material.opacity=Math.min(1,r*1.6),t.sp.scale.set(o,o,1),t.halo.position.copy(t.sp.position),t.halo.material.opacity=.9*r*(.7+.3*Math.sin(t.t*17+t.ph)),t.halo.scale.set(o*2.1,o*2.1,1),t.sp.material.rotation=Math.sin(t.t*4+t.ph)*.25;continue}t.sp.material.opacity=1-t.t/n,t.sp.material.rotation=t.fixe?0:t.tourne?t.sp.material.rotation+t.tourne*i:Math.sin(t.t*9)*.3}}var ac=[];function tA(){let i=Oi(9306032,0,4.5),e=new Te(new Nt(1,1),new It({map:Yt.soin,transparent:!0,opacity:.7,depthWrite:!1,blending:Wn,toneMapped:!1}));oe.add(e);let t=gt(Yt.soin,2.4,!0);t.material.opacity=0,oe.add(t),ac.push({l:i,anneau:e,aura:t,t:0,nb:0})}function nA(){let i=Math.random()*6.28,e=.4+Math.random()*.6,t=Math.cos(i)*e,n=Math.sin(i)*e*.8,s=.1+Math.random()*1.7,r=.3+Math.random()*.16,o=gt(yp.soin,r,!1),a=gt(Yt.soin,r*1.6,!0);o.renderOrder=4,a.renderOrder=3,oe.add(a,o),Ni.push({sp:o,halo:a,s0:r,suit:!0,ox:t,oy:n,z:s,vx:-Math.sin(i)*.25,vy:Math.cos(i)*.2,vz:.35+Math.random()*.2,t:0,vie:1.1+Math.random()*.4,ph:Math.random()*6})}function iA(i){for(let e=ac.length-1;e>=0;e--){let t=ac[e];for(t.t+=i;t.nb<24&&t.t>t.nb*.04;)t.nb++,nA();let n=Math.min(1,t.t/.9);t.anneau.position.copy(de(y.x,y.y,.02));let s=.8+2.2*Math.sqrt(n);t.anneau.scale.set(s,s*.85,1),t.anneau.material.opacity=.7*(1-n),t.l&&(t.l.position.copy(de(y.x,y.y,1.1)),t.l.intensity=20*Math.sin(Math.PI*Math.min(1,t.t/1.5))),t.aura.position.copy(de(y.x,y.y,.9)),t.aura.material.opacity=.55*Math.sin(Math.PI*Math.min(1,t.t/1.5)),t.t>1.5&&(Br(t.l),oe.remove(t.anneau,t.aura),t.anneau.material.dispose(),t.aura.material.dispose(),ac.splice(e,1))}}var sA={dist:3,recharge:3,vitesse:1.2,depart:.05,air:[.08,.65],sortie:.66,fin:.8,elan:2.5,murets:!0},Ip={d1:{anim:"d1",a:.15,b:1.05,impact:.57,v:1.5,portee:1.35},d2:{anim:"d2",a:.3,b:1.25,impact:.82,v:1.5,portee:1.45},d3:{anim:"d3",a:.35,b:1.55,impact:1.07,v:1.4,portee:1.5,fort:!0},embuscade:{anim:"d3",a:.45,b:1.55,impact:1.07,v:1.7,portee:1.6,fort:!0,ombre:!0},assomme:{anim:"assomme",a:.1,b:1.25,impact:.58,v:1.4,portee:1.5,assomme:!0}},Pp=3,Ih=Dt?[{x:5.4,y:7,lx:2.6,ly:.45},{x:13,y:6.4,lx:.45,ly:2.6}]:[],Kn={x:9,y:4.9,r:.35},Un=null,Uo=null,Ph=[];function rA(i){fn=i,i.updateMatrixWorld(!0);for(let l of["Spine","RightArm","RightForeArm","RightHand","LeftArm","LeftForeArm","LeftHand","Head"])en[l]=i.getObjectByName(l);let e=new Lt,t=new Gt({color:14673646,metalness:.85,roughness:.25,emissive:2241348,emissiveIntensity:.3}),n=new Gt({color:4860952,roughness:.8}),s=new Gt({color:13213760,metalness:.7,roughness:.35}),r=new Te(new Ts(.2,2.1,26,4,1),t);r.scale.set(1,1,.28),r.rotation.x=Math.PI/2,r.position.z=17;let o=new Te(new ni(7,1.4,1.4),s);o.position.z=3.8,o.rotation.z=Math.PI/2;let a=new Te(new Ts(.85,.85,8,8),n);a.rotation.x=Math.PI/2;let c=new Te(new go(1.1,10,8),s);c.position.z=-4.3,e.add(r,o,a,c),e.position.set(-1.5,8,0),e.visible=!1,e.traverse(l=>{l.isMesh&&(l.castShadow=!0)}),en.RightHand&&en.RightHand.add(e),Un=e,e.userData.pointe=new w(0,0,30),e.userData.base=new w(0,0,5),i.traverse(l=>{if(l.isMesh&&l.material){let u=l.material,h=u.clone();h.color=(h.color||new Ee(1,1,1)).clone().multiplyScalar(.28),h.emissive=new Ee(5909160),h.emissiveIntensity=.55,h.transparent=!0,h.opacity=.62,Ph.push({o:l,a:u,b:h})}})}function oA(){return gn(256,128,i=>{i.fillStyle="#7d7468",i.fillRect(0,0,256,128);for(let e=0;e<4;e++)for(let t=-1;t<5;t++){let s=e%2*32+t*64,r=e*32,o=95+Math.random()*40,a=i.createLinearGradient(0,r,0,r+32);a.addColorStop(0,`rgb(${o+22},${o+18},${o+10})`),a.addColorStop(1,`rgb(${o-4},${o-7},${o-12})`),i.fillStyle=a,i.fillRect(s+2,r+2,60,28);for(let c=0;c<18;c++)i.fillStyle=`rgba(0,0,0,${Math.random()*.12})`,i.fillRect(s+2+Math.random()*58,r+3+Math.random()*24,3,2)}})}if(Dt){let i=oA();i.wrapS=i.wrapT=ei;for(let e of Ih){let n=new Gt({map:i,roughness:.92}),s=new Gt({map:i,color:13616046,roughness:.9}),r=new ni(e.lx,e.ly,.62),o=new Te(r,[n,n,n,n,s,n]);o.position.copy(de(e.x,e.y,.62/2)),o.castShadow=!0,o.receiveShadow=!0,oe.add(o);let a=r.attributes.uv,c=[[e.ly,.62],[e.ly,.62],[e.lx,.62],[e.lx,.62],[e.lx,e.ly],[e.lx,e.ly]];for(let l=0;l<a.count;l++){let u=c[Math.floor(l/4)];a.setXY(l,a.getX(l)*u[0]/1.3,a.getY(l)*u[1]/.65)}}}function Lp(i,e,t){t=t||.35;for(let n of Ih)if(Math.abs(i-n.x)<n.lx/2+t&&Math.abs(e-n.y)<n.ly/2+t)return!0;return!1}var Pr=null,at={ax:0,ay:0,vx:0,vy:0,sonne:0,etoiles:[],eclair:0};if(Dt){let i=new Lt,e=new Lt,t=new Gt({color:7031339,roughness:.85}),n=new Gt({color:13215066,roughness:.95,emissive:16777215,emissiveIntensity:0}),s=new Gt({color:12098154,roughness:.95,emissive:16777215,emissiveIntensity:0}),r=new Gt({color:5913116,roughness:.9}),o=(l,u,h,f,p)=>{let g=new Te(new Ts(l,u,h,14),f);return g.rotation.x=Math.PI/2,g.position.z=p,g.castShadow=!0,g};i.add(o(.32,.36,.08,t,.04)),e.add(o(.05,.06,.7,t,.4),o(.2,.24,.66,n,.98),o(.205,.205,.04,r,.8),o(.205,.205,.04,r,1.16));let a=new Te(new Ts(.035,.035,.9,8),t);a.rotation.z=Math.PI/2,a.position.z=1.18,a.castShadow=!0,e.add(a);let c=new Te(new go(.15,14,10),s);c.position.z=1.45,c.castShadow=!0,e.add(c),i.add(e),i.position.copy(de(Kn.x,Kn.y,0)),oe.add(i),Pr={gr:i,pivot:e,mats:[n,s]}}function aA(i,e){return Ye?zo(qt.libre,i,e)===1:Fp(i,e)}y.rang=1;y.coup=null;y.tampon=null;y.ombre=!1;y.ombreR=0;function Dp(){let i=Kn.x-y.x,e=Kn.y-y.y;return{d:Math.hypot(i,e),a:Math.atan2(e,i)}}function Or(i){if(!Dt||y.saut)return;if(y.coup){y.coup.tc>(y.coup.C.a+y.coup.C.impact)/2&&(y.tampon=i);return}let e=i==="assomme"?"assomme":y.ombre?"embuscade":"d"+y.rang,t=Ip[e];if(!it[t.anim])return;let n=Dp();n.d<2.4&&(y.a=n.a),y.coup={nom:e,C:t,t:0,tc:t.a,touche:!1,fait:!1,elan:n.d<2.4?Math.max(0,Math.min(.7,n.d-.95)):0,avance:0},Un&&(Un.visible=e!=="assomme"),(t.ombre||y.ombre&&e==="assomme")&&Up(),mA(e==="embuscade"?11697151:14676991)}function cA(){y.coup=null,y.tampon=null,Dh()}function lA(){let i=y.coup;if(!i)return 0;let e=i.C;return Math.min(Xt((i.tc-e.a)/(.06*e.v)),1-Xt((i.tc-(e.b-.16*e.v))/(.16*e.v)))}function uA(i){for(let e of["d1","d2","d3","assomme"]){let t=it[e];if(!t)continue;t.__lance||(t.play(),t.__lance=!0),t.timeScale=0;let n=y.coup&&y.coup.C.anim===e;t.setEffectiveWeight(n?i:0),n&&(t.time=Math.min(y.coup.tc,t.getClip().duration-.001))}}function hA(i){let e=y.coup;if(!e)return;let t=e.C;if(e.t+=i,e.tc=t.a+e.t*t.v,e.elan>e.avance&&e.tc<t.impact){let n=Math.min(e.elan-e.avance,i*4.5),s=y.x+Math.cos(y.a)*n,r=y.y+Math.sin(y.a)*n;Zn(s,r)&&(y.x=s,y.y=r),e.avance+=n}if(!e.fait&&e.tc>=t.impact){e.fait=!0;let n=Dp(),s=Math.abs(Math.atan2(Math.sin(n.a-y.a),Math.cos(n.a-y.a)));e.touche=n.d<=t.portee&&s<1.2,e.touche&&dA(t,n.a),e.nom.startsWith("d")&&(y.rang=e.touche?y.rang%3+1:1),e.nom==="embuscade"&&(y.rang=1),Lh()}if(e.tc>=t.b){y.coup=null,Dh(),y.cacheDague=.5;let n=y.tampon;y.tampon=null,n&&Or(n)}}function Lh(){let i=rt("pRang");i&&(i.textContent=y.ombre?"":String(y.rang));let e=rt("pDagueIc");e&&(e.textContent=y.ombre?"\u{1F480}":y.rang===3?"\u2694\uFE0F":"\u{1F5E1}\uFE0F")}var fA=gn(48,48,i=>{i.translate(24,24),i.beginPath();for(let e=0;e<10;e++){let t=e%2?8:20,n=e*Math.PI/5-Math.PI/2;i.lineTo(Math.cos(n)*t,Math.sin(n)*t)}i.closePath(),i.shadowColor="rgba(255,220,80,1)",i.shadowBlur=8,i.fillStyle="#ffe27a",i.fill(),i.lineWidth=2,i.strokeStyle="#a06a10",i.stroke()});function dA(i,e){let t=i.fort?1.9:i.assomme?1.4:1;at.vx+=Math.cos(e)*2.4*t,at.vy+=Math.sin(e)*2.4*t,at.eclair=1;let n=1.05,s=Kn.x-Math.cos(e)*.18,r=Kn.y-Math.sin(e)*.18;for(let a=0;a<(i.fort?22:12);a++){let c=gt(i.ombre?Yt.violet:Yt.or,.12,!0);c.position.copy(de(s,r,n)),oe.add(c);let l=e+Math.PI+(Math.random()-.5)*2.2,u=1.5+Math.random()*2.5*t;_n.push({sp:c,vx:Math.cos(l)*u,vy:Math.sin(l)*u,vz:Math.random()*2-.3,vie:.3+Math.random()*.25,t:0,s0:.12})}let o=Oi(i.ombre?11563263:16769184,i.fort?30:16,4);if(o&&(o.position.copy(de(s,r,n)),_n.push({lum:o,t:0,vie:.25,I:o.intensity})),i.assomme&&(at.sonne=2,!at.etoiles.length))for(let a=0;a<3;a++){let c=gt(fA,.2,!1);c.renderOrder=5,oe.add(c),at.etoiles.push(c)}if(i.ombre)for(let a=0;a<10;a++){let c=gt(Yt.violet,.4,!0);c.position.copy(de(s,r,.9+Math.random()*.5)),oe.add(c),_n.push({sp:c,vx:(Math.random()-.5)*1.5,vy:(Math.random()-.5)*1.5,vz:.6+Math.random(),vie:.6,t:0,s0:.4,grossit:1})}}function pA(i,e){if(!Pr)return;at.vx+=(-at.ax*60-at.vx*7)*i,at.vy+=(-at.ay*60-at.vy*7)*i,at.ax+=at.vx*i,at.ay+=at.vy*i;let t=Math.hypot(at.ax,at.ay),n=new w(-at.ay,-at.ax,0);t>1e-5?Pr.pivot.quaternion.setFromAxisAngle(n.normalize(),Math.min(.6,t)):Pr.pivot.quaternion.identity(),at.eclair=Math.max(0,at.eclair-i*5);for(let s of Pr.mats)s.emissiveIntensity=.45*at.eclair;if(at.sonne>0){at.sonne-=i;let s=new w(0,0,1.45).applyQuaternion(Pr.pivot.quaternion);at.etoiles.forEach((r,o)=>{let a=e*4+o*2.09;r.position.copy(de(Kn.x+s.x+Math.cos(a)*.26,Kn.y-s.y+Math.sin(a)*.14,s.z+.28)),r.material.opacity=Math.min(1,at.sonne*2),r.material.rotation=a}),at.sonne<=0&&(at.etoiles.forEach(r=>{oe.remove(r),r.material.dispose()}),at.etoiles=[])}}var np=new w,ip=new w;function mA(i){Dh();let e=16,t=new $t;t.setAttribute("position",new wt(new Float32Array(e*2*3),3)),t.setAttribute("color",new wt(new Float32Array(e*2*3),3));let n=[];for(let r=0;r<e-1;r++){let o=r*2;n.push(o,o+1,o+2,o+1,o+3,o+2)}t.setIndex(n);let s=new Te(t,new It({color:i,vertexColors:!0,transparent:!0,depthWrite:!1,blending:Wn,side:an,toneMapped:!1}));s.frustumCulled=!1,s.renderOrder=4,tn.add(s),Uo={m:s,N:e,hist:[]}}var cc=[];function Dh(){if(Uo){let i=Uo;i.fin=!0,i.vie=.18,cc.push(i),Uo=null}}function gA(i){for(let t=cc.length-1;t>=0;t--){let n=cc[t];n.vie-=i,n.vie<=0?(tn.remove(n.m),n.m.geometry.dispose(),n.m.material.dispose(),cc.splice(t,1)):sp(n)}let e=Uo;e&&(Un&&Un.visible&&y.coup&&y.coup.nom!=="assomme"&&(Un.updateMatrixWorld(!0),np.copy(Un.userData.base).applyMatrix4(Un.matrixWorld),ip.copy(Un.userData.pointe).applyMatrix4(Un.matrixWorld),e.hist.unshift([np.clone(),ip.clone()]),e.hist.length>e.N&&e.hist.pop()),sp(e))}function sp(i){let e=i.hist,t=i.m.geometry.attributes.position,n=i.m.geometry.attributes.color,s=i.fin?Math.max(0,i.vie/.18):1;for(let r=0;r<i.N;r++){let o=e[Math.min(r,e.length-1)];if(!o)continue;let a=(1-r/(i.N-1))*s*(r<e.length?1:0);t.setXYZ(r*2,o[0].x,o[0].y,o[0].z),t.setXYZ(r*2+1,o[1].x,o[1].y,o[1].z),n.setXYZ(r*2,a*.3,a*.3,a*.3),n.setXYZ(r*2+1,a,a,a)}t.needsUpdate=!0,n.needsUpdate=!0}function xA(){if(!(y.ombre||y.ombreR>0||y.coup)){y.ombre=!0,Np();for(let i of Ph)i.o.material=i.b;document.body.classList.add("ombre"),Lh()}}function Up(){if(y.ombre){y.ombre=!1,y.ombreR=Pp,Np();for(let i of Ph)i.o.material=i.a;document.body.classList.remove("ombre"),Lh()}}function Uh(){y.ombre?Up():xA()}function Np(){for(let i=0;i<14;i++){let e=gt(Yt.fumeeOmbre,.5,!1),t=Math.random()*6.28,n=Math.random()*.4,s=.2+Math.random()*1.2;e.position.copy(de(y.x+Math.cos(t)*n,y.y+Math.sin(t)*n*.8,s)),oe.add(e),_n.push({sp:e,vx:Math.cos(t)*.8,vy:Math.sin(t)*.6,vz:.3+Math.random()*.5,vie:.6+Math.random()*.3,t:0,s0:.5,grossit:1})}}function Co(i,e){y.ombreR=Math.max(0,y.ombreR-i),hA(i),gA(i),pA(i,e),Un&&!y.coup&&(y.cacheDague=(y.cacheDague||0)-i,y.cacheDague<=0&&(Un.visible=!1));let t=y.ombreR/Pp;t!==Co.r&&(Co.r=t,rt("pOmbre").style.setProperty("--r",t.toFixed(3)));let n=y.sautR/dt.recharge;n!==Co.rs&&(Co.rs=n,rt("pSaut").style.setProperty("--r",n.toFixed(3)))}var dt=Dt?sA:{dist:3,recharge:1.5,vitesse:1.2,depart:0,air:[0,.7],sortie:.7,fin:.82,elan:2.5};function _c(i,e){if(y.saut||y.sautR>0||!it.saut||y.proj)return;y.sort&&Rh();let t=Math.hypot(i||0,e||0)>.15?Math.atan2(e,i):y.a;y.saut={t:0,a:t,fait:0,pose:!1,dist:dt.dist},y.a=t,Ye&&Ft.ouvert&&(y.saut.dist=AA(t)),y.sautR=dt.recharge,y.derap=null,Us.quaternion.identity(),Dt&&(cA(),us(y.x,y.y,t+Math.PI))}var as={debut:.4,vitesse:1,air:[.05,.8],haut:.7};function Op(){Dt||!it.projete||y.proj||(y.sort&&Rh(),y.saut=null,y.derap=null,Us.quaternion.identity(),Me.v=0,y.proj={t:0,pose:!1},yh())}function _A(){if(!y.proj||!it.projete)return 0;let i=it.projete.getClip().duration-as.debut;return Math.min(Xt(y.proj.t/.08),1-Xt((y.proj.t-(i-.35))/.35))}function vA(i){let e=y.proj;e.t+=i,Me.v=0,Me.allure="garde";let t=Mt((e.t-as.air[0])/(as.air[1]-as.air[0]),0,1);Bo.position.z=as.haut*Math.sin(Math.PI*t),!e.pose&&t>=1&&(e.pose=!0,us(y.x,y.y,y.a),us(y.x,y.y,y.a+Math.PI),Le.bouge=Math.max(Le.bouge,.35)),e.t>=it.projete.getClip().duration-as.debut&&(y.proj=null,Bo.position.z=0)}var yA=1.5;function AA(i){let e=t=>Zn(y.x+Math.cos(i)*t,y.y+Math.sin(i)*t);if(e(dt.dist))return dt.dist;for(let t=.1;t<=yA+1e-6;t+=.1)if(e(dt.dist+t))return dt.dist+t+(e(dt.dist+t+.2)?.2:0);for(let t=dt.dist-.1;t>.05;t-=.1)if(e(t))return t;return 0}function MA(i){let e=y.saut;e.t+=i;let t=dt.depart+e.t*dt.vitesse,n=Mt((t-dt.air[0])/(dt.air[1]-dt.air[0]),0,1);dt.murets&&n>.7&&!e.allonge&&Lp(y.x+Math.cos(e.a)*(e.dist-e.fait),y.y+Math.sin(e.a)*(e.dist-e.fait))&&(e.dist+=1.2,e.allonge=!0);let s=e.dist*n;for(;e.fait<s-1e-6&&!e.bloque;){let r=Math.min(.05,s-e.fait),o=y.x+Math.cos(e.a)*r,a=y.y+Math.sin(e.a)*r;(dt.murets||Ye?aA(o,a):Zn(o,a))?(y.x=o,y.y=a,e.fait+=r):e.bloque=!0}return!e.pose&&t>=dt.air[1]&&(e.pose=!0,bA(),Ye&&!Zn(y.x,y.y)&&Bp(),Me.v=Math.max(Me.v,dt.elan),Me.allure="course",Me.course=1,Me.marche=0,Me.garde=0),t>=dt.fin&&(y.saut=null),!e.pose}function SA(){if(!y.saut)return 0;let i=dt.depart+y.saut.t*dt.vitesse;return Math.min(Xt((i-dt.depart)/.07),1-Xt((i-dt.sortie)/(dt.fin-dt.sortie)))}function bA(){if(us(y.x,y.y,y.a+Math.PI),Dt)return;for(let e=0;e<9;e++){let t=e/9*6.28+Math.random()*.4,n=gt(Ap.or[e%2],.2+Math.random()*.06,!0),s=y.x+Math.cos(t)*.2,r=y.y+Math.sin(t)*.15;n.position.copy(de(s,r,.15)),oe.add(n),Ni.push({sp:n,x:s,y:r,z:.15,vx:Math.cos(t)*1.3,vy:Math.sin(t)*1,vz:1.1+Math.random()*.5,g:4,t:0,vie:.55})}let i=Oi(16767120,14,3.5);i&&(i.position.copy(de(y.x,y.y,.4)),_n.push({lum:i,t:0,vie:.35,I:14}))}var lc=[];function us(i,e,t){for(let n=0;n<7;n++){let s=gt(Yt.poussiere,.25,!1),r=(Math.random()-.5)*.5,o=(Math.random()-.5)*.4;Ye&&s.material.color.setHex(9406102),s.position.copy(de(i+r,e+o,.12)),oe.add(s),lc.push({sp:s,x:i+r,y:e+o,vx:Math.cos(t)*(.8+Math.random())+(Math.random()-.5),vy:Math.sin(t)*(.8+Math.random())+(Math.random()-.5),t:0})}}function EA(i){for(let e=lc.length-1;e>=0;e--){let t=lc[e];t.t+=i;let n=t.t/.5;if(n>=1){oe.remove(t.sp),t.sp.material.dispose(),lc.splice(e,1);continue}t.x+=t.vx*i*(1-n),t.y+=t.vy*i*(1-n),t.sp.position.copy(de(t.x,t.y,.12+.25*n));let s=.25+.6*n;t.sp.scale.set(s,s,1),t.sp.material.opacity=.7*(1-n)}}function TA(i){for(let e=_n.length-1;e>=0;e--){let t=_n[e];t.t+=i;let n=t.t/t.vie;if(n>=1){t.sp&&oe.remove(t.sp),t.lum&&Br(t.lum),_n.splice(e,1);continue}if(t.lum){t.lum.intensity=t.I*(1-n)*(1-n);continue}t.sp.position.x+=t.vx*i,t.sp.position.y-=t.vy*i,t.sp.position.z+=t.vz*i,t.sp.material.opacity=1-n;let s=t.s0*(t.grossit?1+1.8*n:1-n*.6);t.sp.scale.set(s,s,1)}}var hn={id:null,bx:0,by:0,mx:0,my:0};Oo.addEventListener("pointerdown",i=>{if(i.clientX<innerWidth*.5&&hn.id===null){hn.id=i.pointerId,hn.bx=i.clientX,hn.by=i.clientY;try{Oo.setPointerCapture(i.pointerId)}catch{}}});Oo.addEventListener("pointermove",i=>{if(i.pointerId!==hn.id)return;let e=Math.max(40,innerHeight*.13),t=i.clientX-hn.bx,n=i.clientY-hn.by,s=Math.hypot(t,n),r=Math.min(1,s/e),o=t,a=n/Sh,c=Math.hypot(o,a)||1;hn.mx=o/c*r,hn.my=a/c*r;let l=rt("pouce");l.style.transform=`translate(${t/s*Math.min(s,e)||0}px,${n/s*Math.min(s,e)||0}px)`});var wA=i=>{i.pointerId===hn.id&&(hn.id=null,hn.mx=hn.my=0,rt("pouce").style.transform="")};["pointerup","pointercancel","lostpointercapture"].forEach(i=>Oo.addEventListener(i,wA));var bn={};addEventListener("keydown",i=>{bn[i.key.toLowerCase()]=1;let e={1:"glace",2:"feu",3:"acide",4:"soin"}[i.key];e&&Ch(e),i.key===" "&&_c(y.mx,y.my)});addEventListener("keyup",i=>{bn[i.key.toLowerCase()]=0});for(let[i,e]of[["bGlace","glace"],["bFeu","feu"],["bAcide","acide"],["bSoin","soin"]])rt(i).addEventListener("pointerdown",t=>{t.preventDefault(),Ch(e)});rt("bSaut").addEventListener("pointerdown",i=>{i.preventDefault(),_c(y.mx,y.my)});rt("bFissure")&&rt("bFissure").addEventListener("click",i=>{i.preventDefault(),Oh()});Ye&&addEventListener("keydown",i=>{(i.key==="f"||i.key==="F")&&Oh(),(i.key==="v"||i.key==="V")&&zh()});rt("bVague")&&rt("bVague").addEventListener("click",i=>{i.preventDefault(),zh()});rt("bCoup")&&rt("bCoup").addEventListener("click",i=>{i.preventDefault(),Wp()});rt("pSaut").addEventListener("pointerdown",i=>{i.preventDefault(),_c(y.mx,y.my)});rt("pDague").addEventListener("pointerdown",i=>{i.preventDefault(),Or("dague")});rt("pAssomme").addEventListener("pointerdown",i=>{i.preventDefault(),Or("assomme")});rt("pOmbre").addEventListener("pointerdown",i=>{i.preventDefault(),Uh()});Dt&&addEventListener("keydown",i=>{(i.key==="j"||i.key==="J")&&Or("dague"),(i.key==="k"||i.key==="K")&&Or("assomme"),(i.key==="l"||i.key==="L")&&Uh()});function Zn(i,e){return Ye?zo(qt.libre,i,e)===1&&!Nh(i,e,.25)&&!BA(i,e):Fp(i,e)&&!Lp(i,e)&&!(Dt&&Math.hypot(i-Kn.x,e-Kn.y)<Kn.r+.3)}function Fp(i,e){let n=ec.coin+.35*Math.SQRT2;if(i<.35||i>ec.L-.35||e<.35||e>ec.P-.35||i+e<n||ec.L-i+e<n||Math.hypot(i-Fe.x,e-Fe.y)<Fe.r+.35)return!1;for(let s of Object.values(Ls))if(Math.hypot(i-s[0],e-s[1])<.55+.35)return!1;return!0}var qt=Ye?(()=>{let i=Ce.grille,e=t=>{let n=atob(t),s=new Uint8Array(i.nx*i.ny);for(let r=0;r<s.length;r++)s[r]=n.charCodeAt(r>>3)>>7-(r&7)&1;return s};return{pas:i.pas,nx:i.nx,ny:i.ny,x0:i.x0||0,libre:e(i.libre),crev:e(i.crevasse)}})():null;function zo(i,e,t){let n=Math.floor((e-qt.x0)/qt.pas),s=Math.floor(t/qt.pas);return n>=0&&s>=0&&n<qt.nx&&s<qt.ny?i[s*qt.nx+n]:0}var Ft={ouvert:!1,t:-1,cases:[],lum:[]};function Nh(i,e,t){if(!Ft.ouvert)return!1;if(zo(qt.crev,i,e))return!0;if(t){for(let[n,s]of[[t,0],[-t,0],[0,t],[0,-t]])if(zo(qt.crev,i+n,e+s))return!0}return!1}if(Ye){let i=Ce.crev,e=[[],[],[],[]];for(let t=0;t<qt.ny;t++)for(let n=0;n<qt.nx;n++)if(qt.crev[t*qt.nx+n]){let s=qt.x0+(n+.5)*qt.pas,r=(t+.5)*qt.pas,o=Nr(s,r,0);Ft.cases.push({x:s,y:r,q:(o.v-i[1])/i[3]}),e[(s>Ce.xoff+.8?2:0)+(r>10?1:0)].push({x:s,y:r})}e.forEach((t,n)=>{if(!t.length)return;let s=t[Math.floor(t.length/2)],r=new jt(n%2?4646610:10511615,0,3.5,1.6);r.position.copy(de(s.x,s.y,-.4)),oe.add(r),Ft.lum.push(r)})}function Oh(){if(!Ye||Ft.t>=0)return;Ft.t=0,Ft.ouvert=!0,Zn(y.x,y.y)||Bp();let i=rt("bFissure");i&&i.classList.add("fait")}function Bp(){let i=null;for(let e=.2;e<4&&!i;e+=.2)for(let t=0;t<24;t++){let n=t/24*6.283,s=y.x+Math.cos(n)*e,r=y.y+Math.sin(n)*e;if(Zn(s,r)){i={x:s,y:r};break}}i&&(y.pousse={x:i.x,y:i.y},us(y.x,y.y,Math.atan2(i.y-y.y,i.x-y.x)))}function RA(i,e){if(y.pousse){let s=y.pousse.x-y.x,r=y.pousse.y-y.y,o=Math.hypot(s,r),a=7*i;o<=a?(y.x=y.pousse.x,y.y=y.pousse.y,y.pousse=null):(y.x+=s/o*a,y.y+=r/o*a)}if(Ft.t<0)return;Ft.t+=i;let t=Mt(Ft.t/1.3,0,1),n=t*1.35;if(At.uniforms.ouvre.value=t,At.uniforms.lueur.value=.3+.3*Math.sin(e*2.3),Ft.t<1.8&&(Le.bouge=Math.max(Le.bouge,1-Ft.t/1.8)),t<1&&(Ft.pouss=(Ft.pouss||0)-i,Ft.pouss<=0)){Ft.pouss=.07;let s=Ft.cases.filter(r=>Math.abs(r.q-n+.06)<.05);for(let r=0;r<1&&s.length;r++){let o=s[Math.floor(Math.random()*s.length)];us(o.x,o.y,Math.random()*6.28)}}Ft.lum.forEach((s,r)=>{s.intensity=t*(6+2.5*Math.sin(e*2.3+r*1.7))})}function xh(i){let e=innerWidth/innerHeight,t=Nr(y.x,y.y,0),n=Math.max(1150/(window.__zoom||1),(t.v+90-320)/.78),s=n*e;s>Pi*1.06&&(s=Pi*1.06,n=s/e);let r=Math.min(t.v+.22*n+90,Fo+.12*n),o=Mt(r-n,0,320),a=s>=Pi?(Pi-s)/2:Mt(t.u-s/2,0,Pi-s),c=xh.vu?Math.min(1,i*4):1;xh.vu=1,Le.cx=Le.cx===void 0?a:Le.cx+(a-Le.cx)*c,Le.cy=Le.cy===void 0?o:Le.cy+(o-Le.cy)*c,Le.H=Le.H===void 0?n:Le.H+(n-Le.H)*c,Le.bouge>0&&(Le.bouge=Math.max(0,Le.bouge-i*1.4));let l=Le.H*e,u=Le.bouge?(Math.random()-.5)*30*Le.bouge:0,h=Le.bouge?(Math.random()-.5)*22*Le.bouge:0;Le.x0=Le.cx+u,Le.y0=Le.cy+h,Le.x1=Le.x0+l,Le.y1=Le.y0+Le.H,wy(),At.uniforms.fen.value.set(Le.x0,Le.y0,Le.x1,Le.y1),En.getDrawingBufferSize(_h);for(let f of xc)f.m.uniforms.ecran.value.copy(_h)}var _h=new Ue,j={m:null,mix:null,lampes:[],halos:[],os:[],dec:[]};function CA(i){for(let e of i.tracks){let t=e.times.length-1,n=e.getValueSize(),s=e.values;if(!(t<6))for(let r=0;r<2;r++){let o=s.slice(0),a=(c,l)=>o[(c%t+t)%t*n+l];for(let c=0;c<t;c++)if(n===4){let l=[0,0,0,0];[[-2,1],[-1,4],[0,6],[1,4],[2,1]].forEach(([h,f])=>{let p=0;for(let x=0;x<4;x++)p+=a(c+h,x)*a(c,x);let g=p<0?-1:1;for(let x=0;x<4;x++)l[x]+=g*f*a(c+h,x)});let u=Math.hypot(...l);for(let h=0;h<4;h++)s[c*n+h]=l[h]/u}else for(let l=0;l<n;l++)s[c*n+l]=(a(c-2,l)+4*a(c-1,l)+6*a(c,l)+4*a(c+1,l)+a(c+2,l))/16;for(let c=0;c<n;c++)s[t*n+c]=s[c]}}}if(Ye){let i=new Lt;i.position.copy(de(Fe.x,Fe.y,Fe.z)),oe.add(i);let e=3.6,t=new Lt;t.rotation.x=Math.PI/2,i.add(t);let n=new Te(new Nt(1,1),new It({map:gn(128,128,a=>{let c=a.createRadialGradient(64,64,0,64,64,64);c.addColorStop(0,"rgba(255,190,90,.55)"),c.addColorStop(.45,"rgba(255,150,60,.18)"),c.addColorStop(1,"rgba(255,120,40,0)"),a.fillStyle=c,a.fillRect(0,0,128,128)}),transparent:!0,depthWrite:!1,blending:Wn,toneMapped:!1}));n.scale.set(5.5,3.4,1),n.position.copy(de(Fe.x,Fe.y+2,Fe.z+.02)),n.renderOrder=-8,oe.add(n),j.lueurSol=n;let s=new es(16777215,0);s.position.copy(de(Fe.x-.4,Fe.y-4,Fe.z+4.5)),s.target.position.copy(de(Fe.x,Fe.y+2.5,Fe.z)),oe.add(s,s.target);let r=new Te(new Nt(8,4.4),new xo({opacity:.64}));r.receiveShadow=!0,r.position.copy(de(Fe.x,-8.1,Fe.z+.003)),oe.add(r);let o=new Te(new Nt(1,1),new It({map:gn(128,128,a=>{let c=a.createRadialGradient(64,64,0,64,64,64);c.addColorStop(0,"rgba(0,0,0,.5)"),c.addColorStop(.5,"rgba(0,0,0,.25)"),c.addColorStop(1,"rgba(0,0,0,0)"),a.fillStyle=c,a.fillRect(0,0,128,128)}),transparent:!0,depthWrite:!1,toneMapped:!1}));o.scale.set(2.6,1.5,1),o.position.copy(de(Fe.x,Fe.y+.1,Fe.z+.006)),o.renderOrder=-7,oe.add(o),s.castShadow=!0,s.shadow.mapSize.set(1024,1024),Object.assign(s.shadow.camera,{left:-3.6,right:3.6,top:3.6,bottom:-3.6,near:1,far:9.3}),s.shadow.bias=-6e-4,s.shadow.radius=4,s.shadow.camera.updateProjectionMatrix(),Po("armure.json",a=>{let c=a.scene;j.m=c,c.traverse(x=>{x.isMesh&&(x.castShadow=!0,x.receiveShadow=!1,x.frustumCulled=!1,x.material&&(x.material.envMapIntensity=.5,x.material.color.multiplyScalar(.8),x.material.emissiveIntensity=1,x.material.onBeforeCompile=m=>{m.vertexShader=`varying vec3 vPosM;
`+m.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
  vPosM = position;`),m.fragmentShader=`varying vec3 vPosM;
`+m.fragmentShader.replace("#include <emissivemap_fragment>",["#include <emissivemap_fragment>","  vec3 E0 = totalEmissiveRadiance; float lumE = max(E0.r, E0.g);","  float verre = smoothstep(0.45, 0.85, lumE), epaule = smoothstep(2.1, 2.2, vPosM.y) * smoothstep(0.28, 0.34, abs(vPosM.x));","  vec3 Eblanc = vec3(1.0, 0.93, 0.8) * (2.5 + 8.0 * lumE);","  totalEmissiveRadiance = mix(E0 * (0.55 + 2.6 * verre), Eblanc, smoothstep(0.12, 0.45, lumE) * epaule);"].join(`
`))}))}),c.scale.setScalar(e/3),t.add(c),c.updateMatrixWorld(!0);let l=x=>c.getObjectByName(x),u=l("Spine"),h=l("LeftShoulder"),f=l("RightShoulder"),p=Math.sign(t.worldToLocal(l("LeftShoulder").getWorldPosition(new w)).x)||1,g=[[h,new w(.58*p,2.5,-.05),16769712,8,4.2],[f,new w(-.58*p,2.5,-.05),16769712,8,4.2],[u,new w(0,2.02,.42),16756816,6,3.2]];for(let[x,m,d,E,b]of g){let v=t.localToWorld(m.clone().multiplyScalar(e/3)),N=x.worldToLocal(v.clone()),R=new jt(d,E,b,1.6);R.userData.I=E,oe.add(R),j.lampes.push(R),j.os.push([x,N]);let C=j.halos.length<2,I=gt(Dn(C?"rgba(255,236,196,.9)":"rgba(255,200,110,.85)"),C?1.5:1,!0);I.userData.o=C?.5:.85,C&&(I.material.depthTest=!1,I.renderOrder=5),oe.add(I),j.halos.push(I)}if(a.animations.length){CA(a.animations[0]),j.mix=new Ao(c);let x=j.mix.clipAction(a.animations[0]);x.timeScale=.7,x.play(),j.attente=x;let m=a.animations[0].tracks.find(d=>d.name==="Hips.quaternion");if(m){let d=0,E=0;for(let b=0;b<m.values.length;b+=4)d+=m.values[b+1],E+=m.values[b+3];c.rotation.y=-2*Math.atan2(d,E)}j.lacet0=c.rotation.y,j.vise=0}{let x=[];c.traverse(d=>{d.isSkinnedMesh&&x.push(d)});let m=x[0];if(m){let d=m.geometry.attributes.position,E=m.geometry.attributes.skinWeight,b=m.geometry.attributes.skinIndex,v=m.skeleton.bones.map(I=>I.name),N={L:[],R:[]},R=1e9,C=-1e9;for(let I=0;I<d.count;I++){let S=d.getY(I);S<R&&(R=S),S>C&&(C=S)}for(let I=0;I<d.count;I++){if(d.getY(I)>R+(C-R)*.03)continue;let S=0,A=0;for(let P=0;P<4;P++)E.getComponent(I,P)>S&&(S=E.getComponent(I,P),A=b.getComponent(I,P));/^(Left|Right)(Foot|ToeBase)$/.test(v[A])&&N[v[A][0]].push(I)}j.peau=m,j.pieds=[["L","LeftFoot"],["R","RightFoot"]].map(([I,S])=>({os:c.getObjectByName(S),sommets:N[I],cible:null,brut:null})).filter(I=>I.os&&I.sommets.length)}}j.bras=[["LeftArm","LeftForeArm"],["RightArm","RightForeArm"]].map(([x,m])=>[c.getObjectByName(x),c.getObjectByName(m)]).filter(([x,m])=>x&&m),Po("armure-coup.json",x=>{if(x.animations[0]&&j.mix){let m=x.animations[0],d=R=>{let C=R.tracks.find(A=>A.name==="Hips.quaternion"),I=0,S=0;for(let A=0;A<C.values.length;A+=4)I+=C.values[A+1],S+=C.values[A+3];return 2*Math.atan2(I,S)},E=d(a.animations[0])-d(m),b=new ot().setFromAxisAngle(new w(0,1,0),E),v=new ot,N=new w;for(let R of m.tracks){if(R.name==="Hips.quaternion")for(let C=0;C<R.values.length;C+=4)v.fromArray(R.values,C).premultiply(b).toArray(R.values,C);if(R.name==="Hips.position")for(let C=0;C<R.values.length;C+=3)N.fromArray(R.values,C).applyQuaternion(b).toArray(R.values,C)}j.coup=j.mix.clipAction(m),j.coup.setLoop(So,1),j.coup.clampWhenFinished=!1,j.coup.timeScale=.85}},x=>console.error(x)),Po("armure-parle.json",x=>{if(x.animations[0]&&j.mix){let m=zd.subclip(x.animations[0],"parle",0,180,30);m.tracks=m.tracks.filter(d=>!d.name.startsWith("Hips.position")),j.parle=j.mix.clipAction(m),j.parle.setLoop(So,1),j.parle.clampWhenFinished=!1,j.parle.timeScale=.55}},x=>console.error(x)),cs("armure")},a=>{console.error(a),cs("armure")})}var IA=gn(128,128,i=>{let e=i.createRadialGradient(64,64,0,64,64,64);e.addColorStop(0,"rgba(0,0,0,.92)"),e.addColorStop(.45,"rgba(0,0,0,.7)"),e.addColorStop(.75,"rgba(0,0,0,.25)"),e.addColorStop(1,"rgba(0,0,0,0)"),i.fillStyle=e,i.fillRect(0,0,128,128)}),Ps=new w,ii=new w,Cr=new w,qn=new w,rp=new w,op=new w,oh=new w,ap=new w,PA=new w(0,0,-1),cp=new ot,lp=new ot,up=new ot;function zp(){!j.parle||re.t>=0||(j.retourDe=j.parle,j.parle.reset().setEffectiveWeight(1).fadeIn(.4).play(),j.attente.fadeOut(.4),j.retour=j.parle.getClip().duration/j.parle.timeScale-.6)}rt("bParle")&&rt("bParle").addEventListener("click",i=>{i.preventDefault(),zp()});function LA(i,e){if(!j.m)return;if(j.bras)for(let r of j.bras)r[2]&&r[0].quaternion.copy(r[2]);if(j.pieds)for(let r of j.pieds)r.brut&&r.os.position.copy(r.brut);if(j.retour!==void 0&&(j.retour-=i)<=0&&(j.retour=void 0,j.attente.reset().fadeIn(.6).play(),(j.retourDe||j.parle).fadeOut(.6)),j.mix&&j.mix.update(i),j.m.updateMatrixWorld(!0),j.bras)for(let r of j.bras)(r[2]||(r[2]=new ot)).copy(r[0].quaternion);let t=j.attente?j.attente.getEffectiveWeight():0;if(j.pieds)for(let r of j.pieds){(r.brut||(r.brut=new w)).copy(r.os.position);let o=1e9,a=0,c=0;for(let u of r.sommets)j.peau.getVertexPosition(u,Ps),j.peau.localToWorld(Ps),oe.worldToLocal(Ps),Ps.z<o&&(o=Ps.z),a+=Ps.x,c+=Ps.y;a/=r.sommets.length,c/=r.sommets.length,r.cible||(r.cible=new w(a,c,Fe.z),r.ombre=new Te(new Nt(1,1),new It({map:IA,transparent:!0,depthWrite:!1,toneMapped:!1})),r.ombre.scale.set(.95,.85,1),r.ombre.renderOrder=-6,oe.add(r.ombre));let l=r.cible.z-o;Cr.set((r.cible.x-a)*t,(r.cible.y-c)*t,l>0?l:l*t),Cr.length()>.25&&Cr.setLength(.25),r.os.getWorldPosition(qn),oe.worldToLocal(qn).add(Cr),oe.localToWorld(qn),r.os.parent.worldToLocal(qn),r.os.position.copy(qn),r.os.updateMatrixWorld(!0),r.ombre.position.set(a+Cr.x,c+Cr.y-.04,Fe.z+.008)}let n=j.coup?j.coup.getEffectiveWeight()*(j.coup.isRunning()?1:0):0,s=.4*t+.33*n;if(j.bras&&s>.001)for(let[r,o]of j.bras)r.getWorldPosition(rp),o.getWorldPosition(op),oh.subVectors(op,rp).normalize(),ap.copy(oh).lerp(PA,s).normalize(),cp.setFromUnitVectors(oh,ap),r.getWorldQuaternion(lp),r.parent.getWorldQuaternion(up),r.quaternion.copy(up.invert().multiply(cp.multiply(lp))),r.updateMatrixWorld(!0);j.os.forEach(([r,o],a)=>{r.localToWorld(qn.copy(o)),oe.worldToLocal(qn),j.lampes[a].position.copy(qn),j.halos[a].position.copy(qn);let c=.92+.08*Math.sin(e*(5.1+a)+a*2)*Math.sin(e*2.3+a);j.lampes[a].intensity=j.lampes[a].userData.I*c,j.halos[a].material.opacity=j.halos[a].userData.o*c}),j.lueurSol.material.opacity=.85+.15*Math.sin(e*2.3)}var Ui=Ye?Xd:[],Ie={t:-1,actifs:[],touche:0,pret:!1,tw:-1},Fh=[],Bh=[],No=[],vh=[],DA=Ui.length*2,ic=()=>{if(--DA===0){Ie.pret=!0;let i=rt("bVague");i&&i.classList.remove("fait")}};Ye&&Ui.forEach((i,e)=>{let t=String(e).padStart(2,"0");Fh[e]=Ns.load("nuit/cr/c"+t+".jpg",n=>{n.colorSpace=Tt,n.needsUpdate=!0,ic()},void 0,ic),Bh[e]=Ns.load("nuit/cr/m"+t+".png",n=>{n.colorSpace=cn,n.needsUpdate=!0,ic()},void 0,ic)});function UA(i){if(No[i])return;let e=String(i).padStart(2,"0");No[i]=Ns.load("nuit/cr/e"+e+".jpg",t=>{t.colorSpace=Tt,t.minFilter=Kt,t.generateMipmaps=!1,t.needsUpdate=!0,t.pret=!0}),vh[i]=Ns.load("nuit/cr/k"+e+".png",t=>{t.colorSpace=cn,t.needsUpdate=!0,t.pret=!0})}var ss=null;if(Ye){let i=new Image;i.onload=()=>{let e=document.createElement("canvas");e.width=i.width,e.height=i.height;let t=e.getContext("2d");t.drawImage(i,0,0),ss={w:i.width,h:i.height,d:t.getImageData(0,0,i.width,i.height).data}},i.src="nuit/arrivee.png"}function Lr(i,e){if(!ss)return 1/0;let t=Nr(i,e,0),n=Mt(Math.floor(t.u/Pi*ss.w),0,ss.w-1),s=Mt(Math.floor(t.v/Fo*ss.h),0,ss.h-1),r=ss.d[(s*ss.w+n)*4];return r>=254?1/0:r/24}var NA="uniform vec4 fen; uniform vec4 boite; varying vec2 vP; void main(){ vec2 p = boite.xy + (vec2(position.x, -position.y) + 0.5) * boite.zw; vP = p; gl_Position = vec4((p.x - fen.x) / (fen.z - fen.x) * 2.0 - 1.0, 1.0 - (p.y - fen.y) / (fen.w - fen.y) * 2.0, 0.0, 1.0); }",Hp=`uniform sampler2D cr; uniform sampler2D mk; uniform vec4 rect; uniform float rouge; uniform float piedV; uniform float hautV;
  vec3 couleur(vec2 q, float py){   // la couleur de sa peinture ; le rouge monte du pied en fondu
    vec3 c = texture2D(cr, vec2(q.x * 0.5, 1.0 - q.y)).rgb, r = texture2D(cr, vec2(0.5 + q.x * 0.5, 1.0 - q.y)).rgb;
    float h = (piedV - py) / max(1.0, piedV - hautV), m = clamp((rouge * 1.45 - h) / 0.45, 0.0, 1.0);
    return mix(c, r, m); }`;function OA(i){let e=Ui[i],t=e.eclat,n=Math.min(e.rect[0],t.rect[0]),s=Math.min(e.rect[1],t.rect[1]),r=Math.max(e.rect[0]+e.rect[2],t.rect[0]+t.rect[2]),o=Math.max(e.rect[1]+e.rect[3],t.rect[1]+t.rect[3]);return new Qt({uniforms:{fen:At.uniforms.fen,boite:{value:new ze(n,s,r-n,o-s)},cr:{value:Fh[i]},mk:{value:Bh[i]},at:{value:null},km:{value:null},rect:{value:new ze(...e.rect)},erect:{value:new ze(...t.rect)},tuile:{value:new ze(t.tuile[0],t.tuile[1],t.cols,t.n)},atl:{value:new Ue(...t.atlas)},rouge:{value:0},piedV:{value:e.pied[1]},hautV:{value:e.sommet},montre:{value:0},eclat:{value:-1},fondu:{value:1},fd:At.uniforms.fond,img:At.uniforms.img},vertexShader:NA,fragmentShader:Hp+`
      uniform sampler2D at; uniform sampler2D km; uniform vec4 erect; uniform vec4 tuile; uniform vec2 atl; uniform float montre; uniform float eclat; uniform float fondu; varying vec2 vP;
      uniform sampler2D fd; uniform vec2 img;
      float ecart(vec3 a, vec3 b){ vec3 d = abs(a - b); return max(d.r, max(d.g, d.b)); }
      vec3 tuileC(float i, vec2 q){ float c = mod(i, tuile.z), r = floor(i / tuile.z); q = clamp(q, 0.003, 0.997);
        return texture2D(at, vec2((c + q.x) * tuile.x / atl.x, 1.0 - (r + q.y) * tuile.y / atl.y)).rgb; }
      void main(){
        vec4 o = vec4(0.0);
        vec3 nu = texture2D(fd, vec2(vP.x / img.x, 1.0 - vP.y / img.y)).rgb;   // (la place nue \xE0 cet endroit : ce qui lui ressemble reste transparent, le feu passe dessous)
        vec2 q = (vP - rect.xy) / rect.zw;
        float wA = eclat < 0.0 ? 1.0 : 1.0 - smoothstep(0.0, 2.5, eclat);
        if (q.x > 0.0 && q.x < 1.0 && q.y > 0.0 && q.y < 1.0 && wA > 0.0) {   // le sol fendu et sa lueur (sans le corps : il est debout, en volume)
          vec4 m = texture2D(mk, vec2(q.x, 1.0 - q.y));
          vec3 cc = couleur(q, vP.y);
          o = vec4(cc, m.r * (1.0 - m.g) * montre * wA * smoothstep(0.025, 0.09, ecart(cc, nu)));
        }
        if (eclat >= 0.0) {   // l'\xE9clatement : sa vid\xE9o, autour de ce cristal seulement
          vec2 qe = (vP - erect.xy) / erect.zw;
          if (qe.x > 0.0 && qe.x < 1.0 && qe.y > 0.0 && qe.y < 1.0) {
            float i0 = min(floor(eclat), tuile.w - 1.0), i1 = min(i0 + 1.0, tuile.w - 1.0);
            vec3 c = mix(tuileC(i0, qe), tuileC(i1, qe), fract(eclat));
            float k = texture2D(km, vec2(qe.x, 1.0 - qe.y)).r * smoothstep(0.03, 0.11, ecart(c, nu));
            o = vec4(mix(o.rgb, c, k), max(o.a, k));
          }
        }
        o.a *= fondu; if (o.a < 0.004) discard;
        gl_FragColor = o;
        #include <colorspace_fragment>
      }`,transparent:!1,blending:hu,blendSrc:so,blendDst:ro,depthTest:!1,depthWrite:!1,toneMapped:!1})}function FA(i){let e=Ui[i];return new Qt({uniforms:{cr:{value:Fh[i]},mk:{value:Bh[i]},fen:At.uniforms.fen,ecran:{value:_h},rect:{value:new ze(...e.rect)},rouge:{value:0},piedV:{value:e.pied[1]},hautV:{value:e.sommet},dv:{value:0},eclair:{value:0}},vertexShader:"void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:Hp+`
      uniform vec4 fen; uniform vec2 ecran; uniform float dv; uniform float eclair;
      void main(){
        vec2 e = gl_FragCoord.xy / ecran, p = vec2(mix(fen.x, fen.z, e.x), mix(fen.w, fen.y, e.y)) + vec2(0.0, dv), q = (p - rect.xy) / rect.zw;
        if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) discard;
        float b = texture2D(mk, vec2(q.x, 1.0 - q.y)).g; if (b < 0.06) discard;
        vec3 c = couleur(q, p.y); c += eclair * vec3(1.0, 0.95, 0.9);
        gl_FragColor = vec4(c, smoothstep(0.06, 0.6, b));
        #include <colorspace_fragment>
      }`,transparent:!0,depthWrite:!0,toneMapped:!1,side:an})}function Dr(i){return Math.max(.5,Math.min(1.3,i.larg*.42))}var kp=i=>i.etat==="plante"||i.etat==="chauffe"||i.etat==="eclate"&&Ie.tw<Ti;function BA(i,e){for(let t of Ie.actifs)if(kp(t)&&Math.hypot(i-t.S.x,e-t.S.y)<Dr(t.S)+.2)return!0;return!1}function Vp(i,e){for(let t of Ie.actifs){if(!kp(t))continue;let n=t.S.x-Fe.x,s=t.S.y-Fe.y,r=Math.hypot(n,s),o=n/r,a=s/r,c=i-Fe.x,l=e-Fe.y,u=c*o+l*a-r,h=Math.abs(c*a-l*o),f=Dr(t.S)*1.05+Math.max(u,0)*.12;if(u>.15&&u<4.6&&h<f*.85)return!0}return!1}function zA(){if(window.__tirage)return window.__tirage;for(let i=0;i<400;i++){let e=Ui.map((n,s)=>s).sort(()=>Math.random()-.5),t=[];for(let n of e){let s=Ui[n];if(!(Math.hypot(s.x-y.x,s.y-y.y)<2.4||Math.hypot(s.x-Fe.x,s.y-Fe.y)<3.6||Ft.ouvert&&Nh(s.x,s.y,.8))&&!t.some(r=>Math.hypot(s.x-Ui[r].x,s.y-Ui[r].y)<4.6)&&(t.push(n),t.length===3))return t}}return[0,4,19]}var HA=gn(64,64,i=>{let e=i.createRadialGradient(32,32,0,32,32,32);e.addColorStop(0,"rgba(0,0,0,.7)"),e.addColorStop(1,"rgba(0,0,0,0)"),i.fillStyle=e,i.fillRect(0,0,64,64)}),kA=2.7,Ti=6.4;function zh(){if(!Ye||Ie.t>=0||!Ie.pret)return;for(let e of Ie.actifs)Xp(e);Ie.actifs=[],Ie.t=0,Ie.tw=-1,Ie.touche=0,Ie.passe=!1,Ie.secours=!1,Ie.tv=-1,Ie.tvT=0,zA().forEach((e,t)=>{let n=Ui[e];UA(e);let s=new Te(new Nt(1,1),OA(e));s.frustumCulled=!1,s.renderOrder=-9,tn.add(s);let r=Math.max(2.6,n.larg+2.2),o=n.haut+1.6,a=new Te(new Nt(r,o),FA(e));a.frustumCulled=!1,a.visible=!1,oe.add(a);let c=new Te(new Nt(1,1),new It({map:HA,transparent:!0,opacity:0,depthWrite:!1,toneMapped:!1}));c.position.copy(de(n.x,n.y,.01)),oe.add(c);let l=new Ee(...n.couleur),u=new jt(l,0,5.5,1.5);u.position.copy(de(n.x,n.y+.6,1.3)),oe.add(u);let h=gt(Yt.glace,1,!0);h.material.color.copy(l),h.visible=!1,oe.add(h),Ie.actifs.push({i:e,S:n,sol:s,corps:a,ombre:c,l:u,coul:l,trainee:h,larg:r,haut:o,etat:"attente",debut:.25+t*.4,z:15,vz:0,t:0})});let i=rt("bVague");if(i&&i.classList.add("fait"),ft)try{ft.pause(),ft.currentTime=0}catch{}}var ft=null,ah=null;if(Ye){ft=document.createElement("video"),ft.muted=!0,ft.loop=!1,ft.playsInline=!0,ft.setAttribute("playsinline",""),ft.preload="auto";let i=ft.canPlayType("video/mp4")?"nuit/vague.mp4":"nuit/vague.webm";fetch(i).then(e=>e.blob()).then(e=>{ft.src=URL.createObjectURL(e)}).catch(e=>console.error(e)),ah=new Mr(ft),ah.colorSpace=cn,At.uniforms.vid.value=ah,Ie.feuL=new jt(16742954,0,6,1.4),oe.add(Ie.feuL),Ie.charge=new jt(16734752,0,14,1.3),Ie.charge.position.copy(de(Fe.x,Fe.y+1,Fe.zc)),oe.add(Ie.charge)}var VA=1.82,re={t:-1,zones:null,Z:null,lance:!1,frappe:!1,touche:!1,eclat:null,cote:null};function GA(i){let e=document.createElement("video");e.muted=!0,e.loop=!1,e.playsInline=!0,e.setAttribute("playsinline",""),e.preload="auto",fetch(e.canPlayType("video/mp4")?"nuit/"+i+".mp4":"nuit/"+i+".webm").then(n=>n.blob()).then(n=>{e.src=URL.createObjectURL(n)}).catch(n=>console.error(n));let t=new Mr(e);return t.colorSpace=cn,{el:e,tex:t}}if(Ye){fetch("nuit/coup.json").then(n=>n.json()).then(n=>{let s={};for(let[r,o]of Object.entries(n.zones)){let a=atob(o.zone),c=new Uint8Array(qt.nx*qt.ny);for(let l=0;l<c.length;l++)c[l]=a.charCodeAt(l>>3)>>7-(l&7)&1;s[r]=Object.assign({},o,{cases:c,img:r==="gauche"?xp:dh,teinteC:new Ee(...o.teinte)},GA(o.video))}re.zones=s}).catch(n=>console.error(n)),re.lum=new jt(16762976,0,18,1.2),oe.add(re.lum),re.eclat=gt(Dn("rgba(255,214,120,.95)"),2.4,!0),re.eclat.material.opacity=0,oe.add(re.eclat),re.lumPoing=new jt(16765056,0,7,1.5),oe.add(re.lumPoing);let i=document.createElement("video");i.muted=!0,i.loop=!0,i.playsInline=!0,i.setAttribute("playsinline",""),i.preload="auto",fetch(i.canPlayType("video/mp4")?"nuit/eclairs.mp4":"nuit/eclairs.webm").then(n=>n.blob()).then(n=>{i.src=URL.createObjectURL(n)}).catch(n=>console.error(n));let e=new Mr(i);e.colorSpace=cn;let t=new Qt({uniforms:{t:{value:e},teinte:{value:new Ee(1,.82,.45)},force:{value:0}},transparent:!0,depthWrite:!1,depthTest:!1,blending:Wn,toneMapped:!1,vertexShader:"varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:"uniform sampler2D t; uniform vec3 teinte; uniform float force; varying vec2 vU; void main(){ float l = texture2D(t, vU).r; l = max(0.0, l - 0.06) / 0.94; l *= 1.0 - smoothstep(0.55, 0.98, length(vU - 0.5) * 2.0); vec3 c = teinte * l + vec3(1.0) * l * l * 0.8; gl_FragColor = vec4(c * force * 1.7, 1.0); }"});re.ecl={el:i,mesh:new Te(new Nt(1,1),t),tourne:0,quand:0},re.ecl.mesh.visible=!1,re.ecl.mesh.frustumCulled=!1,re.ecl.mesh.renderOrder=6,tn.add(re.ecl.mesh),re.lumGant=new jt(16765056,0,5,1.6),tn.add(re.lumGant)}var Gp=(i,e)=>!!(re.Z&&zo(re.Z.cases,i,e));function Wp(i){if(!Ye||re.t>=0||!j.coup||!re.zones)return;re.cote=i==="gauche"||i==="droite"?i:Math.random()<.5?"gauche":"droite";let e=re.Z=re.zones[re.cote];At.uniforms.vidC.value=e.tex,At.uniforms.coupImg.value=e.img,re.ecl.mesh.material.uniforms.teinte.value.copy(e.teinteC),re.lumGant.color.copy(e.teinteC),re.t=0,re.lance=!1,re.frappe=!1,re.touche=!1,re.tf=void 0,j.retourDe=j.coup,j.vise=1.6*Math.atan2(e.centre[0]-Fe.x,e.centre[1]-Fe.y),j.coup.reset().setEffectiveWeight(1).fadeIn(.3).play(),j.attente.fadeOut(.3),j.parle&&j.parle.isRunning()&&j.parle.fadeOut(.3),j.retour=j.coup.getClip().duration/j.coup.timeScale-.5;try{re.ecl.el.currentTime=0,window.__pilote||re.ecl.el.play().catch(()=>{})}catch{}let t=rt("bCoup");t&&t.classList.add("fait")}function WA(i){if(j.m&&j.lacet0!==void 0){let l=re.t>=0&&!(j.retour!==void 0&&j.retour<.3)?j.vise:0;j.viseC=(j.viseC||0)+(l-(j.viseC||0))*Math.min(1,i*3),j.m.rotation.y=j.lacet0+j.viseC}if(re.t<0)return;re.t+=i;let e=re.Z,t=VA/j.coup.timeScale,n=re.t-(t-e.fissures),s=re.ecl,r=j.m.getObjectByName("RightHand");if(r){r.getWorldPosition(ii),s.mesh.position.copy(ii),s.mesh.quaternion.copy(mt.quaternion),s.quand-=i,s.quand<=0&&(s.quand=.12+Math.random()*.12,s.tourne=Math.random()*6.283,s.taille=.9+Math.random()*.3),s.mesh.rotateZ(s.tourne);let l=Mt(re.t/t,0,1),u=re.t-t,h=u<0?(.25+.75*l*l)*(.8+.2*Math.random()):Math.max(0,1.4*Math.exp(-u*7));if(s.mesh.scale.setScalar((1.3+1.6*l)*s.taille*(u>0?1+u*2:1)),s.mesh.material.uniforms.force.value=h,s.mesh.visible=h>.01,re.lumGant.position.copy(ii),re.lumGant.intensity=14*h,window.__pilote&&s.el.readyState>=2)try{let f=s.el.duration||4,p=re.t%(f-.1);Math.abs(s.el.currentTime-p)>.05&&(s.el.currentTime=p)}catch{}}if(!re.frappe&&re.t>=t){re.frappe=!0,Le.bouge=Math.max(Le.bouge,1);let l=j.m,u=l.getObjectByName("LeftHand"),h=l.getObjectByName("RightHand");u.getWorldPosition(ii),h.getWorldPosition(qn),ii.add(qn).multiplyScalar(.5),oe.worldToLocal(ii),re.eclat.position.set(ii.x,ii.y,Fe.z+.3),re.eclat.material.color.copy(e.teinteC),re.lumPoing.position.set(ii.x,ii.y-.6,Fe.z+.8),re.lumPoing.color.copy(e.teinteC),re.tf=0}if(re.tf!==void 0){re.tf+=i;let l=Math.exp(-re.tf*4);re.eclat.material.opacity=l,re.eclat.scale.setScalar(2.4+re.tf*3),re.lumPoing.intensity=40*l}if(n>=0){if(!re.lance){re.lance=!0;try{e.el.currentTime=0,window.__pilote||e.el.play().catch(()=>{})}catch{}}if(window.__pilote)try{let l=Math.min(n,e.fin-.05);Math.abs(e.el.currentTime-l)>.03&&(e.el.currentTime=l)}catch{}}let o=(e.el.readyState>=2||e.el.seeking)&&e.el.currentTime>.03,a=n<0?0:Math.min(1,n/.25)*(1-Xt((n-(e.fin-.5))/.5));At.uniforms.coupSec.value=o?0:1,At.uniforms.coup.value=o?a:a*Mt(1-Math.abs(n-e.pic)/.9,0,1);let c=n-e.explosion;if(re.lum.color.copy(e.teinteC),re.lum.position.copy(de(e.centre[0],e.centre[1],1.6)),re.lum.intensity=c>0?90*Math.exp(-c*1.5)*Math.min(1,c/.25):n>0?10*Math.min(1,n/.6):0,c>0&&c<.5&&(Le.bouge=Math.max(Le.bouge,.45)),!re.touche&&c>=0&&c<.6&&Gp(y.x,y.y)&&(re.touche=!0,Op()),n>=e.fin){re.t=-1,re.tf=void 0,re.eclat.material.opacity=0,re.lumPoing.intensity=0,At.uniforms.coup.value=0,re.lum.intensity=0,re.ecl.mesh.visible=!1,re.lumGant.intensity=0;try{e.el.pause(),re.ecl.el.pause()}catch{}let l=rt("bCoup");l&&l.classList.remove("fait")}}function Xp(i){tn.remove(i.sol),oe.remove(i.corps,i.ombre,i.l,i.trainee),i.sol.material.dispose(),i.corps.material.dispose()}var ch={};function qp(i,e){ch[i]||(ch[i]=gn(256,64,n=>{n.font="bold 40px system-ui, sans-serif",n.textAlign="center",n.textBaseline="middle",n.lineWidth=7,n.strokeStyle="rgba(0,0,0,.85)",n.strokeText(i,128,34),n.fillStyle=e,n.fillText(i,128,34)}));let t=gt(ch[i],1.6,!1);t.scale.set(1.9,.48,1),t.material.depthTest=!1,t.renderOrder=10,oe.add(t),Ni.push({sp:t,x:y.x,y:y.y,z:2.2,vx:0,vy:0,vz:.5,t:0,vie:1.3,fixe:!0})}function yh(){if(Ie.touche>0)return;Ie.touche=1,qp("Touch\xE9 !","#ff6a4a");let i=rt("rouge");i&&(i.style.transition="none",i.style.opacity="1",requestAnimationFrame(()=>{i.style.transition="opacity .6s",i.style.opacity="0"}))}function XA(i,e){if(At.uniforms.temps.value=e,Ie.touche>0&&(Ie.touche-=i),Ie.t<0)return;Ie.t+=i;let t=Ie.t,n=t-kA;if(Ie.tw=n,At.uniforms.tw.value=Math.max(0,n),n>=0&&ft){if(!Ie.lance){Ie.lance=!0;try{ft.currentTime=0,window.__pilote||ft.play().catch(()=>{})}catch{}}if(window.__pilote)try{Math.abs(ft.currentTime-Math.min(n,5.1))>.03&&(ft.currentTime=Math.min(n,5.1))}catch{}else n<4.8&&(ft.currentTime!==Ie.tv&&(Ie.tv=ft.currentTime,Ie.tvT=n),n-Ie.tvT>.7&&(Ie.secours=!0))}let s=ft&&ft.readyState>=2&&ft.currentTime>.03;At.uniforms.secours.value=Ie.secours||!s?1:0,At.uniforms.vague.value=n<0?0:n<.3?n/.3:n<Ti?1:Math.max(0,1-(n-Ti)),Ie.charge.intensity=n>.2&&n<1.6?70*Math.sin(Math.PI*(n-.2)/1.4):0,n>.2&&n<1.2&&(Le.bouge=Math.max(Le.bouge,.15));let r=Lr(y.x,y.y),o=n>=r&&n<Ti,a=Vp(y.x,y.y);o&&!Ie.passe&&(Ie.passe=!0,a&&qp("\xC0 l\u2019abri !","#8dffb0")),o&&!a&&!y.saut&&yh(),Ie.feuL.position.copy(de(y.x,y.y+.3,.3)),Ie.feuL.intensity+=((o&&!a?30:n>0&&n<Ti&&Math.min(Lr(y.x+1.2,y.y),Lr(y.x-1.2,y.y),Lr(y.x,y.y-1.2))<=n?12:0)-Ie.feuL.intensity)*Math.min(1,i*6);let c=At.uniforms.cri.value;if(Ie.actifs.forEach((l,u)=>{let h=l.S,f=l.sol.material.uniforms,p=l.corps.material.uniforms;if(l.t+=i,l.etat==="attente"&&t>=l.debut&&(l.etat="chute",l.corps.visible=!0,l.trainee.visible=!0),l.etat==="attente"||l.etat==="chute"){let g=Mt((t-l.debut+.6)/1.4,0,1);l.ombre.material.opacity=.55*g;let x=(.6+1.4*g)*Math.max(1,h.larg*.6);l.ombre.scale.set(x,x*.7,1)}if(l.etat==="chute"){l.vz-=32*i,l.z=Math.max(0,l.z+l.vz*i);let g=Nr(h.x,h.y,0),x=Nr(h.x,h.y,l.z);if(p.dv.value=g.v-x.v,l.corps.position.copy(de(h.x,h.y,l.haut/2-.4+l.z)),l.corps.up.set(0,0,1),l.corps.lookAt(new w(mt.position.x,mt.position.y,l.haut/2-.4+l.z)),l.trainee.position.copy(de(h.x,h.y,l.z+l.haut*.85)),l.trainee.scale.set(1.2,3.2,1),l.trainee.material.opacity=.5,l.l.intensity=5,l.l.position.copy(de(h.x,h.y+.6,l.z+1.3)),l.z<=0){l.etat="plante",l.t=0,p.dv.value=0,l.trainee.visible=!1,l.ombre.visible=!1,Le.bouge=Math.max(Le.bouge,.6);for(let d=0;d<5;d++)us(h.x,h.y,d*1.26+Math.random());let m=Oi(16777215,40,7);if(m&&(m.color.copy(l.coul),m.position.copy(de(h.x,h.y,.8)),_n.push({lum:m,t:0,vie:.35,I:40})),Math.hypot(y.x-h.x,y.y-h.y)<Dr(h)+.4){yh();let d=Math.atan2(y.y-h.y,y.x-h.x);y.pousse={x:h.x+Math.cos(d)*(Dr(h)+.8),y:h.y+Math.sin(d)*(Dr(h)+.8)}}}}if((l.etat==="plante"||l.etat==="chauffe")&&(f.montre.value=Math.min(1,l.t/.15),p.eclair.value=Math.max(0,.35-l.t*1.5),c[u].set(h.x,h.y,Dr(h)*1.05,1),l.l.intensity=4+1*Math.sin(e*2+u),l.l.position.copy(de(h.x,h.y+.6,1.3)),l.etat==="plante"&&n>=Math.min(Lr(h.x,h.y-.3),Ti-2.2)&&(l.etat="chauffe",l.tc=0,l.ta=n),l.etat==="chauffe")){l.tc+=i;let g=l.ta,x=Ti-1+u*.15,m=Mt((n-g)/Math.max(1.2,x-g),0,1);f.rouge.value=m,p.rouge.value=m,l.l.color.copy(l.coul).lerp(new Ee(16723984),m),l.l.intensity=4+10*m,n>=x&&No[l.i]&&No[l.i].pret&&vh[l.i].pret?(l.etat="eclate",l.te=0,f.at.value=No[l.i],f.km.value=vh[l.i]):n>=x+1&&(l.etat="eclate",l.te=0)}if(l.etat==="eclate"){if(l.te+=i,l.corps.visible=l.te<.25&&!!f.at.value,c[u].w=n<Ti?1:0,!l.boum&&l.te>=1){l.boum=!0;let g=Oi(16728096,60,9);g&&(g.position.copy(de(h.x,h.y,1.5)),_n.push({lum:g,t:0,vie:.6,I:60}))}l.l.intensity=l.te<1?14:Math.max(0,14*(1-(l.te-1)/1.2)),f.at.value?(f.eclat.value=Math.min(29,l.te*10),f.fondu.value=l.te<2.6?1:Math.max(0,1-(l.te-2.6)/.5)):(f.fondu.value=Math.max(0,1-l.te/.4),l.corps.visible=l.te<.4),l.te>3.2&&(l.etat="fini",c[u].w=0,Xp(l))}}),n>Ti+1.1&&Ie.actifs.every(l=>l.etat==="fini")){Ie.t=-1,Ie.lance=!1,At.uniforms.vague.value=0,Ie.actifs=[],c.forEach(u=>u.set(0,0,0,0)),Ie.feuL.intensity=0;let l=rt("bVague");l&&l.classList.remove("fait"),ft&&ft.pause()}}var hp=new Set(Ye?["fond","crev","crevA","feu","arrivee","pilier-g","pilier-d","barde","armure"]:["fond","prof","barde"]),dc=!1;function cs(i){hp.delete(i),!hp.size&&!dc&&(dc=!0,rt("charge").style.display="none")}var Ah=performance.now(),Mh=60,lh=0,uh=Ah,pc=0;function mc(i){requestAnimationFrame(mc);let e=Math.min(.05,(i-Ah)/1e3);Ah=i,lh++,i-uh>1e3&&(Mh=Math.round(lh*1e3/(i-uh)),lh=0,uh=i,rt("ips").textContent=Mh),!window.__pilote&&dc&&(pc+=e,gc(e,pc)),En.render(tn,mt)}function qA(i){for(let e=0;e<Math.round(i*60);e++)pc+=1/60,gc(1/60,pc)}function gc(i,e){let t=hn.mx,n=hn.my,s=(bn.arrowright||bn.d?1:0)-(bn.arrowleft||bn.q||bn.a?1:0),r=(bn.arrowdown||bn.s?1:0)-(bn.arrowup||bn.z||bn.w?1:0);if(s||r){let g=Math.hypot(s,r),x=bn.shift?.25:1;t=s/g*x,n=r/g*x}y.sort&&Math.hypot(t,n)>.15&&Rh();let o=!y.sort&&Math.hypot(t,n)>.15;if(y.sautR=Math.max(0,(y.sautR||0)-i),y.mx=t,y.my=n,y.proj?vA(i):Dt&&y.coup?(Me.v=Math.max(0,Me.v-20*i),Me.v<.05&&(Me.allure=y.ombre?"guet":"garde")):(!y.saut||!MA(i))&&Dy(i,t,n),y.tl+=i,y.geste!==void 0&&(y.geste+=i),y.luth==="sort"&&y.tl>=.85&&(y.luth="main",y.tl=0),y.luth==="range"&&y.tl>=.8&&(y.luth="dos",y.tl=0),y.sort){if(y.sortT+=i,y.sort!=="soin"&&(y.a=window.__face!==void 0&&window.__face!==!1?typeof window.__face=="number"?window.__face:Math.PI/2:Math.atan2(Fe.y-y.y,Fe.x-y.x)),(y.luth==="main"||y.luth==="sort"&&y.tl>.6)&&Nn&&(y.petite=(y.petite||0)-i,y.petite<=0&&(Qy(y.sort),y.petite=y.sort==="soin"?.16:.22),wi||(wi=Oi(Fr[y.sort].charge,0,2.5)),wi)){let x=gh(.3);wi.position.copy(de(x.x,x.y,x.z)),wi.intensity=9*Xt(y.sortT/y.sortD)}y.sortT>=y.sortD&&(y.sort==="soin"?tA():qy(y.sort,Nn?gh():null),y.dernier=y.sort,y.sort=null,y.garde=.9,y.geste=0,y.eclair=!1,Br(wi),wi=null)}else y.luth==="main"&&(y.garde-=i,(o||y.garde<=0)&&(y.luth="range",y.tl=0));if(y.derap){let g=y.derap;g.t+=i;let x=Math.min(1,g.t/.22),m=1-Math.pow(1-x,3);Di.rotation.z=g.rz0+g.da*m;let d=.38*Math.sin(Math.min(1,g.t/.3)*Math.PI),E=new w(Math.cos(g.a1),-Math.sin(g.a1),0);Us.quaternion.setFromAxisAngle(new w(0,0,1).cross(E).normalize(),d),g.t>=.3&&(y.derap=null,Us.quaternion.identity())}else{let x=Math.PI/2-y.a-Di.rotation.z;x=Math.atan2(Math.sin(x),Math.cos(x)),Di.rotation.z+=x*Math.min(1,i*(y.saut||y.coup?30:12))}Us.position.copy(de(y.x,y.y,0));let a=y.sautR/dt.recharge;a!==gc.r&&(gc.r=a,rt("bSaut").style.setProperty("--r",a.toFixed(3))),Ur&&(Uy(i),Ur.update(i)),Ye&&LA(i,e),zy(),Di.updateMatrixWorld(!0),Gy(i,e),Ye&&(RA(i,e),XA(i,e),WA(i)),Yy(i),TA(i),eA(i),Xy(i),EA(i),$y(i),iA(i),Dt&&Co(i,e);for(let g of Mp){let x=.85+.15*Math.sin(e*11+g.b[0]+g.i*2)+.08*Math.sin(e*27+g.i),m=(.42-g.i*.09)*x;g.f.scale.set(m,m*1.6,1),g.f.position.x=Math.sin(e*7+g.i*2.1)*.04+(g.i-1)*.06}_p.forEach((g,x)=>{g.intensity=40*(.85+.12*Math.sin(e*9+x*3)+.06*Math.sin(e*23+x))}),ph&&(ph.intensity=45*(.9+.1*Math.sin(e*2.1)));for(let g of Io.lanternes){let x=.9+.07*Math.sin(e*9+g.x)+.04*Math.sin(e*23+g.y);g.l.intensity=70*x,g.pt.intensity=18*x,g.l.shadow.intensity=Mt(1.5-Math.hypot(y.x-g.x,y.y-g.y)/5,0,1)}for(let g of xc)g.halo.material.opacity=.16+.05*Math.sin(e*9+g.x)+.03*Math.sin(e*21);if(Ye){xh(i);return}let c=hh(y.x),l=uc(y.y,0),u=rs<=Ri?(rs-Ri)/2:Mt(c-Ri/2,0,rs-Ri),h=uc(Fe.y,4.9)-10,f=Math.max(h-30,l+50-si);f=os<=si?(os-si)/2:Mt(f,0,os-si),mc.vu||(Ci=u,Ii=f,mc.vu=1);let p=Math.min(1,i*5);Ci+=(u-Ci)*p,Ii+=(f-Ii)*p,Ty(),At.uniforms.fen.value.set(Ci/rs,Ii/os,(Ci+Ri)/rs,(Ii+si)/os)}requestAnimationFrame(mc);function YA(){let i={};if(!fn)return i;for(let e of["LeftToeBase","RightToeBase"]){let t=fn.getObjectByName(e);if(!t)continue;t.updateWorldMatrix(!0,!1);let n=new w().setFromMatrixPosition(t.matrixWorld);i[e]=[n.x,-n.y,n.z/Ho]}return i}function Yp(){let i={};for(let e of["LeftToeBase","Hips"]){let t=fn.getObjectByName(e);t.updateWorldMatrix(!0,!1);let n=new w().setFromMatrixPosition(t.matrixWorld);fn.worldToLocal(n),i[e]=[n.x,n.y,n.z]}return i.t=it.marche?it.marche.time:0,i.ts=it.marche?it.marche.getEffectiveTimeScale():0,i}function ZA(i,e){for(let n in it)it[n].play(),it[n].setEffectiveWeight(n===i?1:0),it[n].timeScale=0;it[i].time=e,Ur.update(0),fn.updateMatrixWorld(!0);let t=Yp();for(let n of["LeftUpLeg","LeftLeg","Hips"]){let s=fn.getObjectByName(n);t[n+"_q"]=s.quaternion.toArray(),t[n+"_p"]=s.position.toArray()}return t.pistes=it[i].getClip().tracks.slice(0,6).map(n=>n.name),t.nbPistes=it[i].getClip().tracks.length,t.duree=it[i].getClip().duration,t}window.__essai={armure:j,parleGrosbec:zp,coupDePoing:Wp,projeter:Op,dansZoneCoup:Gp,get CP(){return re},cam:mt,get fondU(){return At.uniforms},get proj(){return y.proj},solOmbre:Ds,osM:i=>{let e={};for(let t of i){let n=fn.getObjectByName(t);if(!n)continue;n.updateWorldMatrix(!0,!1);let s=new w().setFromMatrixPosition(n.matrixWorld);fn.worldToLocal(s),e[t]=[s.x,s.y,s.z]}return e},frapper:Or,basculerOmbre:Uh,mq:at,MURETS:Ih,COUPS:Ip,sauter:_c,SAUT:dt,get tirs(){return Lo.map(i=>({x:i.x,y:i.y,z:i.z,q:i.q}))},ecran:(i,e,t)=>{if(Ye){mt.updateMatrixWorld();let n=de(i,e,t).project(mt);return{x:(n.x+1)/2*innerWidth,y:(1-n.y)/2*innerHeight}}return{x:(hh(i)-Ci)*innerWidth/Ri,y:(uc(e,t)-Ii)*innerHeight/si}},fissurer:Oh,lancerVague:zh,get vague(){return Ie},video:()=>ft?[ft.currentSrc.split("/").pop(),ft.readyState,ft.paused,ft.currentTime]:null,cristaux:()=>Ie.actifs.map(i=>({i:i.i,x:i.S.x,y:i.S.y,etat:i.etat})),arriveFeu:Lr,abrite:()=>Vp(y.x,y.y),imgDe:Nr,solImg:gp,fen:Le,crev:Ft,NJ:Ce,libre:Zn,dansCrevasse:Nh,nuit:Io,piliers:xc,poser:ZA,piedsModele:Yp,pieds:YA,avancer:qA,taille:bh,joy:hn,loco:Me,h:y,get ips(){return Mh},lancer:Ch,OS:()=>en,LUTH:()=>Nn,get pret(){return dc},get vue(){return{camX:Ci,camY:Ii,Ws:Ri,Hs:si,hx:hh(y.x),hy:uc(y.y)}}};})();
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2024 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
