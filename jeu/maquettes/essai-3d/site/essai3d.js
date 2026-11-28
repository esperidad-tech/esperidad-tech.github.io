(()=>{var Gp=0,Vh=1,Wp=2;var rd=1,ou=2,ui=3,Jn=0,nn=1,tn=2,Xi=0,qi=1,$n=2,Gh=3,Wh=4,au=5,ps=100,Xp=101,qp=102,Yp=103,Zp=104,Kp=200,Jp=201,$p=202,jp=203,eo=204,to=205,Qp=206,em=207,tm=208,nm=209,im=210,sm=211,rm=212,om=213,am=214,Kc=0,no=1,Jc=2,ir=3,$c=4,jc=5,Qc=6,el=7,od=0,cm=1,lm=2,Yi=0,um=1,hm=2,fm=3,cu=4,dm=5,pm=6,mm=7,Xh="attached",gm="detached",ad=300,sr=301,rr=302,tl=303,nl=304,ka=306,jn=1e3,fi=1001,io=1002,Bt=1003,lu=1004;var Js=1005;var qt=1006,Jr=1007;var Kn=1008;var mi=1009,cd=1010,ld=1011,so=1012,uu=1013,xs=1014,Hn=1015,_o=1016,hu=1017,fu=1018,or=1020,ud=35902,hd=1021,fd=1022,Rn=1023,dd=1024,pd=1025,er=1026,ar=1027,du=1028,pu=1029,md=1030,mu=1031;var gu=1033,ua=33776,ha=33777,fa=33778,da=33779,il=35840,sl=35841,rl=35842,ol=35843,al=36196,cl=37492,ll=37496,ul=37808,hl=37809,fl=37810,dl=37811,pl=37812,ml=37813,gl=37814,xl=37815,_l=37816,yl=37817,vl=37818,Al=37819,Ml=37820,Sl=37821,pa=36492,bl=36494,El=36495,gd=36283,Tl=36284,wl=36285,Rl=36286,Va=2200,xm=2201,_m=2202,cr=2300,lr=2301,gc=2302,$s=2400,js=2401,ma=2402,xu=2500,xd=2501,_d=0,Ga=1,yo=2,ym=3200,vm=3201;var yd=0,Am=1,gn="",St="srgb",rn="srgb-linear",Wa="linear",ht="srgb";var Ps=7680;var qh=519,Mm=512,Sm=513,bm=514,vd=515,Em=516,Tm=517,wm=518,Rm=519,Cl=35044;var Yh="300 es",di=2e3,ga=2001,gi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let s=this._listeners[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let n=this._listeners[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},jt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Zh=1234567,$r=Math.PI/180,ur=180/Math.PI;function kn(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(jt[i&255]+jt[i>>8&255]+jt[i>>16&255]+jt[i>>24&255]+"-"+jt[e&255]+jt[e>>8&255]+"-"+jt[e>>16&15|64]+jt[e>>24&255]+"-"+jt[t&63|128]+jt[t>>8&255]+"-"+jt[t>>16&255]+jt[t>>24&255]+jt[n&255]+jt[n>>8&255]+jt[n>>16&255]+jt[n>>24&255]).toLowerCase()}function en(i,e,t){return Math.max(e,Math.min(t,i))}function _u(i,e){return(i%e+e)%e}function Cm(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function Im(i,e,t){return i!==e?(t-i)/(e-i):0}function jr(i,e,t){return(1-t)*i+t*e}function Pm(i,e,t,n){return jr(i,e,1-Math.exp(-t*n))}function Lm(i,e=1){return e-Math.abs(_u(i,e*2)-e)}function Dm(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Nm(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Um(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Om(i,e){return i+Math.random()*(e-i)}function Fm(i){return i*(.5-Math.random())}function Bm(i){i!==void 0&&(Zh=i);let e=Zh+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function zm(i){return i*$r}function Hm(i){return i*ur}function km(i){return(i&i-1)===0&&i!==0}function Vm(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Gm(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Wm(i,e,t,n,s){let r=Math.cos,o=Math.sin,a=r(t/2),c=o(t/2),l=r((e+n)/2),u=o((e+n)/2),h=r((e-n)/2),f=o((e-n)/2),p=r((n-e)/2),g=o((n-e)/2);switch(s){case"XYX":i.set(a*u,c*h,c*f,a*l);break;case"YZY":i.set(c*f,a*u,c*h,a*l);break;case"ZXZ":i.set(c*h,c*f,a*u,a*l);break;case"XZX":i.set(a*u,c*g,c*p,a*l);break;case"YXY":i.set(c*p,a*u,c*g,a*l);break;case"ZYZ":i.set(c*g,c*p,a*u,a*l);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function zn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function at(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var Ad={DEG2RAD:$r,RAD2DEG:ur,generateUUID:kn,clamp:en,euclideanModulo:_u,mapLinear:Cm,inverseLerp:Im,lerp:jr,damp:Pm,pingpong:Lm,smoothstep:Dm,smootherstep:Nm,randInt:Um,randFloat:Om,randFloatSpread:Fm,seededRandom:Bm,degToRad:zm,radToDeg:Hm,isPowerOfTwo:km,ceilPowerOfTwo:Vm,floorPowerOfTwo:Gm,setQuaternionFromProperEuler:Wm,normalize:at,denormalize:zn},Le=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(en(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},We=class i{constructor(e,t,n,s,r,o,a,c,l){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,c,l)}set(e,t,n,s,r,o,a,c,l){let u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=c,u[6]=n,u[7]=o,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],u=n[4],h=n[7],f=n[2],p=n[5],g=n[8],x=s[0],m=s[3],d=s[6],E=s[1],b=s[4],y=s[7],U=s[2],R=s[5],C=s[8];return r[0]=o*x+a*E+c*U,r[3]=o*m+a*b+c*R,r[6]=o*d+a*y+c*C,r[1]=l*x+u*E+h*U,r[4]=l*m+u*b+h*R,r[7]=l*d+u*y+h*C,r[2]=f*x+p*E+g*U,r[5]=f*m+p*b+g*R,r[8]=f*d+p*y+g*C,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8];return t*o*u-t*a*l-n*r*u+n*a*c+s*r*l-s*o*c}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=u*o-a*l,f=a*c-u*r,p=l*r-o*c,g=t*h+n*f+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/g;return e[0]=h*x,e[1]=(s*l-u*n)*x,e[2]=(a*n-s*o)*x,e[3]=f*x,e[4]=(u*t-s*c)*x,e[5]=(s*r-a*t)*x,e[6]=p*x,e[7]=(n*c-l*t)*x,e[8]=(o*t-n*r)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){let c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*o+l*a)+o+e,-s*l,s*c,-s*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(xc.makeScale(e,t)),this}rotate(e){return this.premultiply(xc.makeRotation(-e)),this}translate(e,t){return this.premultiply(xc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},xc=new We;function Md(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function ro(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Xm(){let i=ro("canvas");return i.style.display="block",i}var Kh={};function Zr(i){i in Kh||(Kh[i]=!0,console.warn(i))}function qm(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}function Ym(i){let e=i.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Zm(i){let e=i.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}var Je={enabled:!0,workingColorSpace:rn,spaces:{},convert:function(i,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===ht&&(i.r=pi(i.r),i.g=pi(i.g),i.b=pi(i.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(i.applyMatrix3(this.spaces[e].toXYZ),i.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===ht&&(i.r=tr(i.r),i.g=tr(i.g),i.b=tr(i.b))),i},fromWorkingColorSpace:function(i,e){return this.convert(i,this.workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===gn?Wa:this.spaces[i].transfer},getLuminanceCoefficients:function(i,e=this.workingColorSpace){return i.fromArray(this.spaces[e].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,e,t){return i.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function pi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function tr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Jh=[.64,.33,.3,.6,.15,.06],$h=[.2126,.7152,.0722],jh=[.3127,.329],Qh=new We().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),ef=new We().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Je.define({[rn]:{primaries:Jh,whitePoint:jh,transfer:Wa,toXYZ:Qh,fromXYZ:ef,luminanceCoefficients:$h,workingColorSpaceConfig:{unpackColorSpace:St},outputColorSpaceConfig:{drawingBufferColorSpace:St}},[St]:{primaries:Jh,whitePoint:jh,transfer:ht,toXYZ:Qh,fromXYZ:ef,luminanceCoefficients:$h,outputColorSpaceConfig:{drawingBufferColorSpace:St}}});var Ls,Il=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Ls===void 0&&(Ls=ro("canvas")),Ls.width=e.width,Ls.height=e.height;let n=Ls.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Ls}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=ro("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=pi(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(pi(t[n]/255)*255):t[n]=pi(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Km=0,xa=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Km++}),this.uuid=kn(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(_c(s[o].image)):r.push(_c(s[o]))}else r=_c(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function _c(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Il.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Jm=0,zt=class i extends gi{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=fi,s=fi,r=qt,o=Kn,a=Rn,c=mi,l=i.DEFAULT_ANISOTROPY,u=gn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Jm++}),this.uuid=kn(),this.name="",this.source=new xa(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new Le(0,0),this.repeat=new Le(1,1),this.center=new Le(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new We,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==ad)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case jn:e.x=e.x-Math.floor(e.x);break;case fi:e.x=e.x<0?0:1;break;case io:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case jn:e.y=e.y-Math.floor(e.y);break;case fi:e.y=e.y<0?0:1;break;case io:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};zt.DEFAULT_IMAGE=null;zt.DEFAULT_MAPPING=ad;zt.DEFAULT_ANISOTROPY=1;var Oe=class i{constructor(e=0,t=0,n=0,s=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,c=e.elements,l=c[0],u=c[4],h=c[8],f=c[1],p=c[5],g=c[9],x=c[2],m=c[6],d=c[10];if(Math.abs(u-f)<.01&&Math.abs(h-x)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+f)<.1&&Math.abs(h+x)<.1&&Math.abs(g+m)<.1&&Math.abs(l+p+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let b=(l+1)/2,y=(p+1)/2,U=(d+1)/2,R=(u+f)/4,C=(h+x)/4,I=(g+m)/4;return b>y&&b>U?b<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(b),s=R/n,r=C/n):y>U?y<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),n=R/s,r=I/s):U<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(U),n=C/r,s=I/r),this.set(n,s,r,t),this}let E=Math.sqrt((m-g)*(m-g)+(h-x)*(h-x)+(f-u)*(f-u));return Math.abs(E)<.001&&(E=1),this.x=(m-g)/E,this.y=(h-x)/E,this.z=(f-u)/E,this.w=Math.acos((l+p+d-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Pl=class extends gi{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Oe(0,0,e,t),this.scissorTest=!1,this.viewport=new Oe(0,0,e,t);let s={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:qt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);let r=new zt(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];let o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,s=e.textures.length;n<s;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new xa(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},xi=class extends Pl{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},_a=class extends zt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Bt,this.minFilter=Bt,this.wrapR=fi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Ll=class extends zt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Bt,this.minFilter=Bt,this.wrapR=fi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ct=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let c=n[s+0],l=n[s+1],u=n[s+2],h=n[s+3],f=r[o+0],p=r[o+1],g=r[o+2],x=r[o+3];if(a===0){e[t+0]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=f,e[t+1]=p,e[t+2]=g,e[t+3]=x;return}if(h!==x||c!==f||l!==p||u!==g){let m=1-a,d=c*f+l*p+u*g+h*x,E=d>=0?1:-1,b=1-d*d;if(b>Number.EPSILON){let U=Math.sqrt(b),R=Math.atan2(U,d*E);m=Math.sin(m*R)/U,a=Math.sin(a*R)/U}let y=a*E;if(c=c*m+f*y,l=l*m+p*y,u=u*m+g*y,h=h*m+x*y,m===1-a){let U=1/Math.sqrt(c*c+l*l+u*u+h*h);c*=U,l*=U,u*=U,h*=U}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,s,r,o){let a=n[s],c=n[s+1],l=n[s+2],u=n[s+3],h=r[o],f=r[o+1],p=r[o+2],g=r[o+3];return e[t]=a*g+u*h+c*p-l*f,e[t+1]=c*g+u*f+l*h-a*p,e[t+2]=l*g+u*p+a*f-c*h,e[t+3]=u*g-a*h-c*f-l*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(n/2),u=a(s/2),h=a(r/2),f=c(n/2),p=c(s/2),g=c(r/2);switch(o){case"XYZ":this._x=f*u*h+l*p*g,this._y=l*p*h-f*u*g,this._z=l*u*g+f*p*h,this._w=l*u*h-f*p*g;break;case"YXZ":this._x=f*u*h+l*p*g,this._y=l*p*h-f*u*g,this._z=l*u*g-f*p*h,this._w=l*u*h+f*p*g;break;case"ZXY":this._x=f*u*h-l*p*g,this._y=l*p*h+f*u*g,this._z=l*u*g+f*p*h,this._w=l*u*h-f*p*g;break;case"ZYX":this._x=f*u*h-l*p*g,this._y=l*p*h+f*u*g,this._z=l*u*g-f*p*h,this._w=l*u*h+f*p*g;break;case"YZX":this._x=f*u*h+l*p*g,this._y=l*p*h+f*u*g,this._z=l*u*g-f*p*h,this._w=l*u*h-f*p*g;break;case"XZY":this._x=f*u*h-l*p*g,this._y=l*p*h-f*u*g,this._z=l*u*g+f*p*h,this._w=l*u*h+f*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],c=t[9],l=t[2],u=t[6],h=t[10],f=n+a+h;if(f>0){let p=.5/Math.sqrt(f+1);this._w=.25/p,this._x=(u-c)*p,this._y=(r-l)*p,this._z=(o-s)*p}else if(n>a&&n>h){let p=2*Math.sqrt(1+n-a-h);this._w=(u-c)/p,this._x=.25*p,this._y=(s+o)/p,this._z=(r+l)/p}else if(a>h){let p=2*Math.sqrt(1+a-n-h);this._w=(r-l)/p,this._x=(s+o)/p,this._y=.25*p,this._z=(c+u)/p}else{let p=2*Math.sqrt(1+h-n-a);this._w=(o-s)/p,this._x=(r+l)/p,this._y=(c+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(en(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,c=t._y,l=t._z,u=t._w;return this._x=n*u+o*a+s*l-r*c,this._y=s*u+o*c+r*a-n*l,this._z=r*u+o*l+n*c-s*a,this._w=o*u-n*a-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,s=this._y,r=this._z,o=this._w,a=o*e._w+n*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;let c=1-a*a;if(c<=Number.EPSILON){let p=1-t;return this._w=p*o+t*this._w,this._x=p*n+t*this._x,this._y=p*s+t*this._y,this._z=p*r+t*this._z,this.normalize(),this}let l=Math.sqrt(c),u=Math.atan2(l,a),h=Math.sin((1-t)*u)/l,f=Math.sin(t*u)/l;return this._w=o*h+this._w*f,this._x=n*h+this._x*f,this._y=s*h+this._y*f,this._z=r*h+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},w=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(tf.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(tf.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*s-a*n),u=2*(a*t-r*s),h=2*(r*n-o*t);return this.x=t+c*l+o*h-a*u,this.y=n+c*u+a*l-r*h,this.z=s+c*h+r*u-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,c=t.z;return this.x=s*c-r*a,this.y=r*o-n*c,this.z=n*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return yc.copy(this).projectOnVector(e),this.sub(yc)}reflect(e){return this.sub(yc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(en(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},yc=new w,tf=new ct,Cn=class{constructor(e=new w(1/0,1/0,1/0),t=new w(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(On.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(On.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=On.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,On):On.fromBufferAttribute(r,o),On.applyMatrix4(e.matrixWorld),this.expandByPoint(On);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Uo.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Uo.copy(n.boundingBox)),Uo.applyMatrix4(e.matrixWorld),this.union(Uo)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,On),On.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Fr),Oo.subVectors(this.max,Fr),Ds.subVectors(e.a,Fr),Ns.subVectors(e.b,Fr),Us.subVectors(e.c,Fr),Fi.subVectors(Ns,Ds),Bi.subVectors(Us,Ns),as.subVectors(Ds,Us);let t=[0,-Fi.z,Fi.y,0,-Bi.z,Bi.y,0,-as.z,as.y,Fi.z,0,-Fi.x,Bi.z,0,-Bi.x,as.z,0,-as.x,-Fi.y,Fi.x,0,-Bi.y,Bi.x,0,-as.y,as.x,0];return!vc(t,Ds,Ns,Us,Oo)||(t=[1,0,0,0,1,0,0,0,1],!vc(t,Ds,Ns,Us,Oo))?!1:(Fo.crossVectors(Fi,Bi),t=[Fo.x,Fo.y,Fo.z],vc(t,Ds,Ns,Us,Oo))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,On).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(On).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(si[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),si[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),si[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),si[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),si[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),si[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),si[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),si[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(si),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},si=[new w,new w,new w,new w,new w,new w,new w,new w],On=new w,Uo=new Cn,Ds=new w,Ns=new w,Us=new w,Fi=new w,Bi=new w,as=new w,Fr=new w,Oo=new w,Fo=new w,cs=new w;function vc(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){cs.fromArray(i,r);let a=s.x*Math.abs(cs.x)+s.y*Math.abs(cs.y)+s.z*Math.abs(cs.z),c=e.dot(cs),l=t.dot(cs),u=n.dot(cs);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>a)return!1}return!0}var $m=new Cn,Br=new w,Ac=new w,An=class{constructor(e=new w,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):$m.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Br.subVectors(e,this.center);let t=Br.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Br,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ac.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Br.copy(e.center).add(Ac)),this.expandByPoint(Br.copy(e.center).sub(Ac))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},ri=new w,Mc=new w,Bo=new w,zi=new w,Sc=new w,zo=new w,bc=new w,hr=class{constructor(e=new w,t=new w(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ri)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=ri.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ri.copy(this.origin).addScaledVector(this.direction,t),ri.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Mc.copy(e).add(t).multiplyScalar(.5),Bo.copy(t).sub(e).normalize(),zi.copy(this.origin).sub(Mc);let r=e.distanceTo(t)*.5,o=-this.direction.dot(Bo),a=zi.dot(this.direction),c=-zi.dot(Bo),l=zi.lengthSq(),u=Math.abs(1-o*o),h,f,p,g;if(u>0)if(h=o*c-a,f=o*a-c,g=r*u,h>=0)if(f>=-g)if(f<=g){let x=1/u;h*=x,f*=x,p=h*(h+o*f+2*a)+f*(o*h+f+2*c)+l}else f=r,h=Math.max(0,-(o*f+a)),p=-h*h+f*(f+2*c)+l;else f=-r,h=Math.max(0,-(o*f+a)),p=-h*h+f*(f+2*c)+l;else f<=-g?(h=Math.max(0,-(-o*r+a)),f=h>0?-r:Math.min(Math.max(-r,-c),r),p=-h*h+f*(f+2*c)+l):f<=g?(h=0,f=Math.min(Math.max(-r,-c),r),p=f*(f+2*c)+l):(h=Math.max(0,-(o*r+a)),f=h>0?r:Math.min(Math.max(-r,-c),r),p=-h*h+f*(f+2*c)+l);else f=o>0?-r:r,h=Math.max(0,-(o*f+a)),p=-h*h+f*(f+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(Mc).addScaledVector(Bo,f),p}intersectSphere(e,t){ri.subVectors(e.center,this.origin);let n=ri.dot(this.direction),s=ri.dot(ri)-n*n,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,c,l=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,f=this.origin;return l>=0?(n=(e.min.x-f.x)*l,s=(e.max.x-f.x)*l):(n=(e.max.x-f.x)*l,s=(e.min.x-f.x)*l),u>=0?(r=(e.min.y-f.y)*u,o=(e.max.y-f.y)*u):(r=(e.max.y-f.y)*u,o=(e.min.y-f.y)*u),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(e.min.z-f.z)*h,c=(e.max.z-f.z)*h):(a=(e.max.z-f.z)*h,c=(e.min.z-f.z)*h),n>c||a>s)||((a>n||n!==n)&&(n=a),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,ri)!==null}intersectTriangle(e,t,n,s,r){Sc.subVectors(t,e),zo.subVectors(n,e),bc.crossVectors(Sc,zo);let o=this.direction.dot(bc),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;zi.subVectors(this.origin,e);let c=a*this.direction.dot(zo.crossVectors(zi,zo));if(c<0)return null;let l=a*this.direction.dot(Sc.cross(zi));if(l<0||c+l>o)return null;let u=-a*zi.dot(bc);return u<0?null:this.at(u/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ee=class i{constructor(e,t,n,s,r,o,a,c,l,u,h,f,p,g,x,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,c,l,u,h,f,p,g,x,m)}set(e,t,n,s,r,o,a,c,l,u,h,f,p,g,x,m){let d=this.elements;return d[0]=e,d[4]=t,d[8]=n,d[12]=s,d[1]=r,d[5]=o,d[9]=a,d[13]=c,d[2]=l,d[6]=u,d[10]=h,d[14]=f,d[3]=p,d[7]=g,d[11]=x,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,s=1/Os.setFromMatrixColumn(e,0).length(),r=1/Os.setFromMatrixColumn(e,1).length(),o=1/Os.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(s),l=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){let f=o*u,p=o*h,g=a*u,x=a*h;t[0]=c*u,t[4]=-c*h,t[8]=l,t[1]=p+g*l,t[5]=f-x*l,t[9]=-a*c,t[2]=x-f*l,t[6]=g+p*l,t[10]=o*c}else if(e.order==="YXZ"){let f=c*u,p=c*h,g=l*u,x=l*h;t[0]=f+x*a,t[4]=g*a-p,t[8]=o*l,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=p*a-g,t[6]=x+f*a,t[10]=o*c}else if(e.order==="ZXY"){let f=c*u,p=c*h,g=l*u,x=l*h;t[0]=f-x*a,t[4]=-o*h,t[8]=g+p*a,t[1]=p+g*a,t[5]=o*u,t[9]=x-f*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){let f=o*u,p=o*h,g=a*u,x=a*h;t[0]=c*u,t[4]=g*l-p,t[8]=f*l+x,t[1]=c*h,t[5]=x*l+f,t[9]=p*l-g,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){let f=o*c,p=o*l,g=a*c,x=a*l;t[0]=c*u,t[4]=x-f*h,t[8]=g*h+p,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-l*u,t[6]=p*h+g,t[10]=f-x*h}else if(e.order==="XZY"){let f=o*c,p=o*l,g=a*c,x=a*l;t[0]=c*u,t[4]=-h,t[8]=l*u,t[1]=f*h+x,t[5]=o*u,t[9]=p*h-g,t[2]=g*h-p,t[6]=a*u,t[10]=x*h+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(jm,e,Qm)}lookAt(e,t,n){let s=this.elements;return yn.subVectors(e,t),yn.lengthSq()===0&&(yn.z=1),yn.normalize(),Hi.crossVectors(n,yn),Hi.lengthSq()===0&&(Math.abs(n.z)===1?yn.x+=1e-4:yn.z+=1e-4,yn.normalize(),Hi.crossVectors(n,yn)),Hi.normalize(),Ho.crossVectors(yn,Hi),s[0]=Hi.x,s[4]=Ho.x,s[8]=yn.x,s[1]=Hi.y,s[5]=Ho.y,s[9]=yn.y,s[2]=Hi.z,s[6]=Ho.z,s[10]=yn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],u=n[1],h=n[5],f=n[9],p=n[13],g=n[2],x=n[6],m=n[10],d=n[14],E=n[3],b=n[7],y=n[11],U=n[15],R=s[0],C=s[4],I=s[8],S=s[12],v=s[1],P=s[5],k=s[9],B=s[13],G=s[2],J=s[6],X=s[10],j=s[14],V=s[3],ne=s[7],fe=s[11],we=s[15];return r[0]=o*R+a*v+c*G+l*V,r[4]=o*C+a*P+c*J+l*ne,r[8]=o*I+a*k+c*X+l*fe,r[12]=o*S+a*B+c*j+l*we,r[1]=u*R+h*v+f*G+p*V,r[5]=u*C+h*P+f*J+p*ne,r[9]=u*I+h*k+f*X+p*fe,r[13]=u*S+h*B+f*j+p*we,r[2]=g*R+x*v+m*G+d*V,r[6]=g*C+x*P+m*J+d*ne,r[10]=g*I+x*k+m*X+d*fe,r[14]=g*S+x*B+m*j+d*we,r[3]=E*R+b*v+y*G+U*V,r[7]=E*C+b*P+y*J+U*ne,r[11]=E*I+b*k+y*X+U*fe,r[15]=E*S+b*B+y*j+U*we,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],c=e[9],l=e[13],u=e[2],h=e[6],f=e[10],p=e[14],g=e[3],x=e[7],m=e[11],d=e[15];return g*(+r*c*h-s*l*h-r*a*f+n*l*f+s*a*p-n*c*p)+x*(+t*c*p-t*l*f+r*o*f-s*o*p+s*l*u-r*c*u)+m*(+t*l*h-t*a*p-r*o*h+n*o*p+r*a*u-n*l*u)+d*(-s*a*u-t*c*h+t*a*f+s*o*h-n*o*f+n*c*u)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],h=e[9],f=e[10],p=e[11],g=e[12],x=e[13],m=e[14],d=e[15],E=h*m*l-x*f*l+x*c*p-a*m*p-h*c*d+a*f*d,b=g*f*l-u*m*l-g*c*p+o*m*p+u*c*d-o*f*d,y=u*x*l-g*h*l+g*a*p-o*x*p-u*a*d+o*h*d,U=g*h*c-u*x*c-g*a*f+o*x*f+u*a*m-o*h*m,R=t*E+n*b+s*y+r*U;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let C=1/R;return e[0]=E*C,e[1]=(x*f*r-h*m*r-x*s*p+n*m*p+h*s*d-n*f*d)*C,e[2]=(a*m*r-x*c*r+x*s*l-n*m*l-a*s*d+n*c*d)*C,e[3]=(h*c*r-a*f*r-h*s*l+n*f*l+a*s*p-n*c*p)*C,e[4]=b*C,e[5]=(u*m*r-g*f*r+g*s*p-t*m*p-u*s*d+t*f*d)*C,e[6]=(g*c*r-o*m*r-g*s*l+t*m*l+o*s*d-t*c*d)*C,e[7]=(o*f*r-u*c*r+u*s*l-t*f*l-o*s*p+t*c*p)*C,e[8]=y*C,e[9]=(g*h*r-u*x*r-g*n*p+t*x*p+u*n*d-t*h*d)*C,e[10]=(o*x*r-g*a*r+g*n*l-t*x*l-o*n*d+t*a*d)*C,e[11]=(u*a*r-o*h*r-u*n*l+t*h*l+o*n*p-t*a*p)*C,e[12]=U*C,e[13]=(u*x*s-g*h*s+g*n*f-t*x*f-u*n*m+t*h*m)*C,e[14]=(g*a*s-o*x*s-g*n*c+t*x*c+o*n*m-t*a*m)*C,e[15]=(o*h*s-u*a*s+u*n*c-t*h*c-o*n*f+t*a*f)*C,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,c=e.z,l=r*o,u=r*a;return this.set(l*o+n,l*a-s*c,l*c+s*a,0,l*a+s*c,u*a+n,u*c-s*o,0,l*c-s*a,u*c+s*o,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,o=t._y,a=t._z,c=t._w,l=r+r,u=o+o,h=a+a,f=r*l,p=r*u,g=r*h,x=o*u,m=o*h,d=a*h,E=c*l,b=c*u,y=c*h,U=n.x,R=n.y,C=n.z;return s[0]=(1-(x+d))*U,s[1]=(p+y)*U,s[2]=(g-b)*U,s[3]=0,s[4]=(p-y)*R,s[5]=(1-(f+d))*R,s[6]=(m+E)*R,s[7]=0,s[8]=(g+b)*C,s[9]=(m-E)*C,s[10]=(1-(f+x))*C,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements,r=Os.set(s[0],s[1],s[2]).length(),o=Os.set(s[4],s[5],s[6]).length(),a=Os.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],Fn.copy(this);let l=1/r,u=1/o,h=1/a;return Fn.elements[0]*=l,Fn.elements[1]*=l,Fn.elements[2]*=l,Fn.elements[4]*=u,Fn.elements[5]*=u,Fn.elements[6]*=u,Fn.elements[8]*=h,Fn.elements[9]*=h,Fn.elements[10]*=h,t.setFromRotationMatrix(Fn),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,s,r,o,a=di){let c=this.elements,l=2*r/(t-e),u=2*r/(n-s),h=(t+e)/(t-e),f=(n+s)/(n-s),p,g;if(a===di)p=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===ga)p=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=l,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=g,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=di){let c=this.elements,l=1/(t-e),u=1/(n-s),h=1/(o-r),f=(t+e)*l,p=(n+s)*u,g,x;if(a===di)g=(o+r)*h,x=-2*h;else if(a===ga)g=r*h,x=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=2*l,c[4]=0,c[8]=0,c[12]=-f,c[1]=0,c[5]=2*u,c[9]=0,c[13]=-p,c[2]=0,c[6]=0,c[10]=x,c[14]=-g,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Os=new w,Fn=new Ee,jm=new w(0,0,0),Qm=new w(1,1,1),Hi=new w,Ho=new w,yn=new w,nf=new Ee,sf=new ct,Qn=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],c=s[1],l=s[5],u=s[9],h=s[2],f=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(en(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(f,l),this._z=0);break;case"YXZ":this._x=Math.asin(-en(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(en(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,p),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-en(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(en(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-en(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return nf.makeRotationFromQuaternion(e),this.setFromRotationMatrix(nf,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return sf.setFromEuler(this),this.setFromQuaternion(sf,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Qn.DEFAULT_ORDER="XYZ";var ya=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},eg=0,rf=new w,Fs=new ct,oi=new Ee,ko=new w,zr=new w,tg=new w,ng=new ct,of=new w(1,0,0),af=new w(0,1,0),cf=new w(0,0,1),lf={type:"added"},ig={type:"removed"},Bs={type:"childadded",child:null},Ec={type:"childremoved",child:null},Et=class i extends gi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:eg++}),this.uuid=kn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new w,t=new Qn,n=new ct,s=new w(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Ee},normalMatrix:{value:new We}}),this.matrix=new Ee,this.matrixWorld=new Ee,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ya,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Fs.setFromAxisAngle(e,t),this.quaternion.multiply(Fs),this}rotateOnWorldAxis(e,t){return Fs.setFromAxisAngle(e,t),this.quaternion.premultiply(Fs),this}rotateX(e){return this.rotateOnAxis(of,e)}rotateY(e){return this.rotateOnAxis(af,e)}rotateZ(e){return this.rotateOnAxis(cf,e)}translateOnAxis(e,t){return rf.copy(e).applyQuaternion(this.quaternion),this.position.add(rf.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(of,e)}translateY(e){return this.translateOnAxis(af,e)}translateZ(e){return this.translateOnAxis(cf,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(oi.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?ko.copy(e):ko.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),zr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?oi.lookAt(zr,ko,this.up):oi.lookAt(ko,zr,this.up),this.quaternion.setFromRotationMatrix(oi),s&&(oi.extractRotation(s.matrixWorld),Fs.setFromRotationMatrix(oi),this.quaternion.premultiply(Fs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(lf),Bs.child=e,this.dispatchEvent(Bs),Bs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(ig),Ec.child=e,this.dispatchEvent(Ec),Ec.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),oi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),oi.multiply(e.parent.matrixWorld)),e.applyMatrix4(oi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(lf),Bs.child=e,this.dispatchEvent(Bs),Bs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(zr,e,tg),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(zr,ng,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let c=a.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){let h=c[l];r(e.shapes,h)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(e.materials,this.material[c]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let c=this.animations[a];s.animations.push(r(e.animations,c))}}if(t){let a=o(e.geometries),c=o(e.materials),l=o(e.textures),u=o(e.images),h=o(e.shapes),f=o(e.skeletons),p=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),f.length>0&&(n.skeletons=f),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){let c=[];for(let l in a){let u=a[l];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}};Et.DEFAULT_UP=new w(0,1,0);Et.DEFAULT_MATRIX_AUTO_UPDATE=!0;Et.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Bn=new w,ai=new w,Tc=new w,ci=new w,zs=new w,Hs=new w,uf=new w,wc=new w,Rc=new w,Cc=new w,Ic=new Oe,Pc=new Oe,Lc=new Oe,Gi=class i{constructor(e=new w,t=new w,n=new w){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Bn.subVectors(e,t),s.cross(Bn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Bn.subVectors(s,t),ai.subVectors(n,t),Tc.subVectors(e,t);let o=Bn.dot(Bn),a=Bn.dot(ai),c=Bn.dot(Tc),l=ai.dot(ai),u=ai.dot(Tc),h=o*l-a*a;if(h===0)return r.set(0,0,0),null;let f=1/h,p=(l*c-a*u)*f,g=(o*u-a*c)*f;return r.set(1-p-g,g,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,ci)===null?!1:ci.x>=0&&ci.y>=0&&ci.x+ci.y<=1}static getInterpolation(e,t,n,s,r,o,a,c){return this.getBarycoord(e,t,n,s,ci)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,ci.x),c.addScaledVector(o,ci.y),c.addScaledVector(a,ci.z),c)}static getInterpolatedAttribute(e,t,n,s,r,o){return Ic.setScalar(0),Pc.setScalar(0),Lc.setScalar(0),Ic.fromBufferAttribute(e,t),Pc.fromBufferAttribute(e,n),Lc.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Ic,r.x),o.addScaledVector(Pc,r.y),o.addScaledVector(Lc,r.z),o}static isFrontFacing(e,t,n,s){return Bn.subVectors(n,t),ai.subVectors(e,t),Bn.cross(ai).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Bn.subVectors(this.c,this.b),ai.subVectors(this.a,this.b),Bn.cross(ai).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,o,a;zs.subVectors(s,n),Hs.subVectors(r,n),wc.subVectors(e,n);let c=zs.dot(wc),l=Hs.dot(wc);if(c<=0&&l<=0)return t.copy(n);Rc.subVectors(e,s);let u=zs.dot(Rc),h=Hs.dot(Rc);if(u>=0&&h<=u)return t.copy(s);let f=c*h-u*l;if(f<=0&&c>=0&&u<=0)return o=c/(c-u),t.copy(n).addScaledVector(zs,o);Cc.subVectors(e,r);let p=zs.dot(Cc),g=Hs.dot(Cc);if(g>=0&&p<=g)return t.copy(r);let x=p*l-c*g;if(x<=0&&l>=0&&g<=0)return a=l/(l-g),t.copy(n).addScaledVector(Hs,a);let m=u*g-p*h;if(m<=0&&h-u>=0&&p-g>=0)return uf.subVectors(r,s),a=(h-u)/(h-u+(p-g)),t.copy(s).addScaledVector(uf,a);let d=1/(m+x+f);return o=x*d,a=f*d,t.copy(n).addScaledVector(zs,o).addScaledVector(Hs,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Sd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ki={h:0,s:0,l:0},Vo={h:0,s:0,l:0};function Dc(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var be=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=St){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Je.toWorkingColorSpace(this,t),this}setRGB(e,t,n,s=Je.workingColorSpace){return this.r=e,this.g=t,this.b=n,Je.toWorkingColorSpace(this,s),this}setHSL(e,t,n,s=Je.workingColorSpace){if(e=_u(e,1),t=en(t,0,1),n=en(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=Dc(o,r,e+1/3),this.g=Dc(o,r,e),this.b=Dc(o,r,e-1/3)}return Je.toWorkingColorSpace(this,s),this}setStyle(e,t=St){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=St){let n=Sd[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=pi(e.r),this.g=pi(e.g),this.b=pi(e.b),this}copyLinearToSRGB(e){return this.r=tr(e.r),this.g=tr(e.g),this.b=tr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=St){return Je.fromWorkingColorSpace(Qt.copy(this),e),Math.round(en(Qt.r*255,0,255))*65536+Math.round(en(Qt.g*255,0,255))*256+Math.round(en(Qt.b*255,0,255))}getHexString(e=St){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Je.workingColorSpace){Je.fromWorkingColorSpace(Qt.copy(this),t);let n=Qt.r,s=Qt.g,r=Qt.b,o=Math.max(n,s,r),a=Math.min(n,s,r),c,l,u=(a+o)/2;if(a===o)c=0,l=0;else{let h=o-a;switch(l=u<=.5?h/(o+a):h/(2-o-a),o){case n:c=(s-r)/h+(s<r?6:0);break;case s:c=(r-n)/h+2;break;case r:c=(n-s)/h+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=Je.workingColorSpace){return Je.fromWorkingColorSpace(Qt.copy(this),t),e.r=Qt.r,e.g=Qt.g,e.b=Qt.b,e}getStyle(e=St){Je.fromWorkingColorSpace(Qt.copy(this),e);let t=Qt.r,n=Qt.g,s=Qt.b;return e!==St?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(ki),this.setHSL(ki.h+e,ki.s+t,ki.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ki),e.getHSL(Vo);let n=jr(ki.h,Vo.h,t),s=jr(ki.s,Vo.s,t),r=jr(ki.l,Vo.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Qt=new be;be.NAMES=Sd;var sg=0,hn=class extends gi{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:sg++}),this.uuid=kn(),this.name="",this.blending=qi,this.side=Jn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=eo,this.blendDst=to,this.blendEquation=ps,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new be(0,0,0),this.blendAlpha=0,this.depthFunc=ir,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=qh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ps,this.stencilZFail=Ps,this.stencilZPass=Ps,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==qi&&(n.blending=this.blending),this.side!==Jn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==eo&&(n.blendSrc=this.blendSrc),this.blendDst!==to&&(n.blendDst=this.blendDst),this.blendEquation!==ps&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==ir&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==qh&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ps&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ps&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ps&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let c=r[a];delete c.metadata,o.push(c)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},wt=class extends hn{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new be(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Qn,this.combine=od,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var Dt=new w,Go=new Le,bt=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Cl,this.updateRanges=[],this.gpuType=Hn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Go.fromBufferAttribute(this,t),Go.applyMatrix3(e),this.setXY(t,Go.x,Go.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Dt.fromBufferAttribute(this,t),Dt.applyMatrix3(e),this.setXYZ(t,Dt.x,Dt.y,Dt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Dt.fromBufferAttribute(this,t),Dt.applyMatrix4(e),this.setXYZ(t,Dt.x,Dt.y,Dt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Dt.fromBufferAttribute(this,t),Dt.applyNormalMatrix(e),this.setXYZ(t,Dt.x,Dt.y,Dt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Dt.fromBufferAttribute(this,t),Dt.transformDirection(e),this.setXYZ(t,Dt.x,Dt.y,Dt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=zn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=at(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=zn(t,this.array)),t}setX(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=zn(t,this.array)),t}setY(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=zn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=zn(t,this.array)),t}setW(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=at(t,this.array),n=at(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=at(t,this.array),n=at(n,this.array),s=at(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=at(t,this.array),n=at(n,this.array),s=at(s,this.array),r=at(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Cl&&(e.usage=this.usage),e}};var va=class extends bt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Aa=class extends bt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Yt=class extends bt{constructor(e,t,n){super(new Float32Array(e),t,n)}},rg=0,wn=new Ee,Nc=new Et,ks=new w,vn=new Cn,Hr=new Cn,Xt=new w,Zt=class i extends gi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:rg++}),this.uuid=kn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Md(e)?Aa:va)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new We().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return wn.makeRotationFromQuaternion(e),this.applyMatrix4(wn),this}rotateX(e){return wn.makeRotationX(e),this.applyMatrix4(wn),this}rotateY(e){return wn.makeRotationY(e),this.applyMatrix4(wn),this}rotateZ(e){return wn.makeRotationZ(e),this.applyMatrix4(wn),this}translate(e,t,n){return wn.makeTranslation(e,t,n),this.applyMatrix4(wn),this}scale(e,t,n){return wn.makeScale(e,t,n),this.applyMatrix4(wn),this}lookAt(e){return Nc.lookAt(e),Nc.updateMatrix(),this.applyMatrix4(Nc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ks).negate(),this.translate(ks.x,ks.y,ks.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Yt(n,3))}else{for(let n=0,s=t.count;n<s;n++){let r=e[n];t.setXYZ(n,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Cn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new w(-1/0,-1/0,-1/0),new w(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];vn.setFromBufferAttribute(r),this.morphTargetsRelative?(Xt.addVectors(this.boundingBox.min,vn.min),this.boundingBox.expandByPoint(Xt),Xt.addVectors(this.boundingBox.max,vn.max),this.boundingBox.expandByPoint(Xt)):(this.boundingBox.expandByPoint(vn.min),this.boundingBox.expandByPoint(vn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new An);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new w,1/0);return}if(e){let n=this.boundingSphere.center;if(vn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];Hr.setFromBufferAttribute(a),this.morphTargetsRelative?(Xt.addVectors(vn.min,Hr.min),vn.expandByPoint(Xt),Xt.addVectors(vn.max,Hr.max),vn.expandByPoint(Xt)):(vn.expandByPoint(Hr.min),vn.expandByPoint(Hr.max))}vn.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)Xt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Xt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],c=this.morphTargetsRelative;for(let l=0,u=a.count;l<u;l++)Xt.fromBufferAttribute(a,l),c&&(ks.fromBufferAttribute(e,l),Xt.add(ks)),s=Math.max(s,n.distanceToSquared(Xt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new bt(new Float32Array(4*n.count),4));let o=this.getAttribute("tangent"),a=[],c=[];for(let I=0;I<n.count;I++)a[I]=new w,c[I]=new w;let l=new w,u=new w,h=new w,f=new Le,p=new Le,g=new Le,x=new w,m=new w;function d(I,S,v){l.fromBufferAttribute(n,I),u.fromBufferAttribute(n,S),h.fromBufferAttribute(n,v),f.fromBufferAttribute(r,I),p.fromBufferAttribute(r,S),g.fromBufferAttribute(r,v),u.sub(l),h.sub(l),p.sub(f),g.sub(f);let P=1/(p.x*g.y-g.x*p.y);isFinite(P)&&(x.copy(u).multiplyScalar(g.y).addScaledVector(h,-p.y).multiplyScalar(P),m.copy(h).multiplyScalar(p.x).addScaledVector(u,-g.x).multiplyScalar(P),a[I].add(x),a[S].add(x),a[v].add(x),c[I].add(m),c[S].add(m),c[v].add(m))}let E=this.groups;E.length===0&&(E=[{start:0,count:e.count}]);for(let I=0,S=E.length;I<S;++I){let v=E[I],P=v.start,k=v.count;for(let B=P,G=P+k;B<G;B+=3)d(e.getX(B+0),e.getX(B+1),e.getX(B+2))}let b=new w,y=new w,U=new w,R=new w;function C(I){U.fromBufferAttribute(s,I),R.copy(U);let S=a[I];b.copy(S),b.sub(U.multiplyScalar(U.dot(S))).normalize(),y.crossVectors(R,S);let P=y.dot(c[I])<0?-1:1;o.setXYZW(I,b.x,b.y,b.z,P)}for(let I=0,S=E.length;I<S;++I){let v=E[I],P=v.start,k=v.count;for(let B=P,G=P+k;B<G;B+=3)C(e.getX(B+0)),C(e.getX(B+1)),C(e.getX(B+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new bt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,p=n.count;f<p;f++)n.setXYZ(f,0,0,0);let s=new w,r=new w,o=new w,a=new w,c=new w,l=new w,u=new w,h=new w;if(e)for(let f=0,p=e.count;f<p;f+=3){let g=e.getX(f+0),x=e.getX(f+1),m=e.getX(f+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,x),o.fromBufferAttribute(t,m),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),a.fromBufferAttribute(n,g),c.fromBufferAttribute(n,x),l.fromBufferAttribute(n,m),a.add(u),c.add(u),l.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(x,c.x,c.y,c.z),n.setXYZ(m,l.x,l.y,l.z)}else for(let f=0,p=t.count;f<p;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),n.setXYZ(f+0,u.x,u.y,u.z),n.setXYZ(f+1,u.x,u.y,u.z),n.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Xt.fromBufferAttribute(e,t),Xt.normalize(),e.setXYZ(t,Xt.x,Xt.y,Xt.z)}toNonIndexed(){function e(a,c){let l=a.array,u=a.itemSize,h=a.normalized,f=new l.constructor(c.length*u),p=0,g=0;for(let x=0,m=c.length;x<m;x++){a.isInterleavedBufferAttribute?p=c[x]*a.data.stride+a.offset:p=c[x]*u;for(let d=0;d<u;d++)f[g++]=l[p++]}return new bt(f,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let a in s){let c=s[a],l=e(c,n);t.setAttribute(a,l)}let r=this.morphAttributes;for(let a in r){let c=[],l=r[a];for(let u=0,h=l.length;u<h;u++){let f=l[u],p=e(f,n);c.push(p)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,c=o.length;a<c;a++){let l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let c in n){let l=n[c];e.data.attributes[c]=l.toJSON(e.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],u=[];for(let h=0,f=l.length;h<f;h++){let p=l[h];u.push(p.toJSON(e.data))}u.length>0&&(s[c]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone(t));let s=e.attributes;for(let l in s){let u=s[l];this.setAttribute(l,u.clone(t))}let r=e.morphAttributes;for(let l in r){let u=[],h=r[l];for(let f=0,p=h.length;f<p;f++)u.push(h[f].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let l=0,u=o.length;l<u;l++){let h=o[l];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},hf=new Ee,ls=new hr,Wo=new An,ff=new w,Xo=new w,qo=new w,Yo=new w,Uc=new w,Zo=new w,df=new w,Ko=new w,Se=class extends Et{constructor(e=new Zt,t=new wt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){Zo.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let u=a[c],h=r[c];u!==0&&(Uc.fromBufferAttribute(h,e),o?Zo.addScaledVector(Uc,u):Zo.addScaledVector(Uc.sub(t),u))}t.add(Zo)}return t}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Wo.copy(n.boundingSphere),Wo.applyMatrix4(r),ls.copy(e.ray).recast(e.near),!(Wo.containsPoint(ls.origin)===!1&&(ls.intersectSphere(Wo,ff)===null||ls.origin.distanceToSquared(ff)>(e.far-e.near)**2))&&(hf.copy(r).invert(),ls.copy(e.ray).applyMatrix4(hf),!(n.boundingBox!==null&&ls.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ls)))}_computeIntersections(e,t,n){let s,r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,f=r.groups,p=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,x=f.length;g<x;g++){let m=f[g],d=o[m.materialIndex],E=Math.max(m.start,p.start),b=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let y=E,U=b;y<U;y+=3){let R=a.getX(y),C=a.getX(y+1),I=a.getX(y+2);s=Jo(this,d,e,n,l,u,h,R,C,I),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),x=Math.min(a.count,p.start+p.count);for(let m=g,d=x;m<d;m+=3){let E=a.getX(m),b=a.getX(m+1),y=a.getX(m+2);s=Jo(this,o,e,n,l,u,h,E,b,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,x=f.length;g<x;g++){let m=f[g],d=o[m.materialIndex],E=Math.max(m.start,p.start),b=Math.min(c.count,Math.min(m.start+m.count,p.start+p.count));for(let y=E,U=b;y<U;y+=3){let R=y,C=y+1,I=y+2;s=Jo(this,d,e,n,l,u,h,R,C,I),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),x=Math.min(c.count,p.start+p.count);for(let m=g,d=x;m<d;m+=3){let E=m,b=m+1,y=m+2;s=Jo(this,o,e,n,l,u,h,E,b,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function og(i,e,t,n,s,r,o,a){let c;if(e.side===nn?c=n.intersectTriangle(o,r,s,!0,a):c=n.intersectTriangle(s,r,o,e.side===Jn,a),c===null)return null;Ko.copy(a),Ko.applyMatrix4(i.matrixWorld);let l=t.ray.origin.distanceTo(Ko);return l<t.near||l>t.far?null:{distance:l,point:Ko.clone(),object:i}}function Jo(i,e,t,n,s,r,o,a,c,l){i.getVertexPosition(a,Xo),i.getVertexPosition(c,qo),i.getVertexPosition(l,Yo);let u=og(i,e,t,n,Xo,qo,Yo,df);if(u){let h=new w;Gi.getBarycoord(df,Xo,qo,Yo,h),s&&(u.uv=Gi.getInterpolatedAttribute(s,a,c,l,h,new Le)),r&&(u.uv1=Gi.getInterpolatedAttribute(r,a,c,l,h,new Le)),o&&(u.normal=Gi.getInterpolatedAttribute(o,a,c,l,h,new w),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let f={a,b:c,c:l,normal:new w,materialIndex:0};Gi.getNormal(Xo,qo,Yo,f.normal),u.face=f,u.barycoord=h}return u}var ei=class i extends Zt{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let c=[],l=[],u=[],h=[],f=0,p=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,s,o,2),g("x","z","y",1,-1,e,n,-t,s,o,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new Yt(l,3)),this.setAttribute("normal",new Yt(u,3)),this.setAttribute("uv",new Yt(h,2));function g(x,m,d,E,b,y,U,R,C,I,S){let v=y/C,P=U/I,k=y/2,B=U/2,G=R/2,J=C+1,X=I+1,j=0,V=0,ne=new w;for(let fe=0;fe<X;fe++){let we=fe*P-B;for(let qe=0;qe<J;qe++){let dt=qe*v-k;ne[x]=dt*E,ne[m]=we*b,ne[d]=G,l.push(ne.x,ne.y,ne.z),ne[x]=0,ne[m]=0,ne[d]=R>0?1:-1,u.push(ne.x,ne.y,ne.z),h.push(qe/C),h.push(1-fe/I),j+=1}}for(let fe=0;fe<I;fe++)for(let we=0;we<C;we++){let qe=f+we+J*fe,dt=f+we+J*(fe+1),Y=f+(we+1)+J*(fe+1),te=f+(we+1)+J*fe;c.push(qe,dt,te),c.push(dt,Y,te),V+=6}a.addGroup(p,V,S),p+=V,f+=j}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function fr(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function un(i){let e={};for(let t=0;t<i.length;t++){let n=fr(i[t]);for(let s in n)e[s]=n[s]}return e}function ag(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function bd(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Je.workingColorSpace}var cg={clone:fr,merge:un},lg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ug=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,sn=class extends hn{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=lg,this.fragmentShader=ug,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=fr(e.uniforms),this.uniformsGroups=ag(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},Ma=class extends Et{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ee,this.projectionMatrix=new Ee,this.projectionMatrixInverse=new Ee,this.coordinateSystem=di}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Vi=new w,pf=new Le,mf=new Le,Ft=class extends Ma{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=ur*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan($r*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ur*2*Math.atan(Math.tan($r*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Vi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Vi.x,Vi.y).multiplyScalar(-e/Vi.z),Vi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Vi.x,Vi.y).multiplyScalar(-e/Vi.z)}getViewSize(e,t){return this.getViewBounds(e,pf,mf),t.subVectors(mf,pf)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan($r*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*s/c,t-=o.offsetY*n/l,s*=o.width/c,n*=o.height/l}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Vs=-90,Gs=1,Dl=class extends Et{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Ft(Vs,Gs,e,t);s.layers=this.layers,this.add(s);let r=new Ft(Vs,Gs,e,t);r.layers=this.layers,this.add(r);let o=new Ft(Vs,Gs,e,t);o.layers=this.layers,this.add(o);let a=new Ft(Vs,Gs,e,t);a.layers=this.layers,this.add(a);let c=new Ft(Vs,Gs,e,t);c.layers=this.layers,this.add(c);let l=new Ft(Vs,Gs,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,c]=t;for(let l of t)this.remove(l);if(e===di)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===ga)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,c,l,u]=this.children,h=e.getRenderTarget(),f=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,o),e.setRenderTarget(n,2,s),e.render(t,a),e.setRenderTarget(n,3,s),e.render(t,c),e.setRenderTarget(n,4,s),e.render(t,l),n.texture.generateMipmaps=x,e.setRenderTarget(n,5,s),e.render(t,u),e.setRenderTarget(h,f,p),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},Sa=class extends zt{constructor(e,t,n,s,r,o,a,c,l,u){e=e!==void 0?e:[],t=t!==void 0?t:sr,super(e,t,n,s,r,o,a,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Nl=class extends xi{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Sa(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:qt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new ei(5,5,5),r=new sn({name:"CubemapFromEquirect",uniforms:fr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:nn,blending:Xi});r.uniforms.tEquirect.value=t;let o=new Se(s,r),a=t.minFilter;return t.minFilter===Kn&&(t.minFilter=qt),new Dl(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,s){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}},Oc=new w,hg=new w,fg=new We,hi=class{constructor(e=new w(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=Oc.subVectors(n,t).cross(hg.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Oc),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||fg.getNormalMatrix(e),s=this.coplanarPoint(Oc).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},us=new An,$o=new w,oo=class{constructor(e=new hi,t=new hi,n=new hi,s=new hi,r=new hi,o=new hi){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=di){let n=this.planes,s=e.elements,r=s[0],o=s[1],a=s[2],c=s[3],l=s[4],u=s[5],h=s[6],f=s[7],p=s[8],g=s[9],x=s[10],m=s[11],d=s[12],E=s[13],b=s[14],y=s[15];if(n[0].setComponents(c-r,f-l,m-p,y-d).normalize(),n[1].setComponents(c+r,f+l,m+p,y+d).normalize(),n[2].setComponents(c+o,f+u,m+g,y+E).normalize(),n[3].setComponents(c-o,f-u,m-g,y-E).normalize(),n[4].setComponents(c-a,f-h,m-x,y-b).normalize(),t===di)n[5].setComponents(c+a,f+h,m+x,y+b).normalize();else if(t===ga)n[5].setComponents(a,h,x,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),us.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),us.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(us)}intersectsSprite(e){return us.center.set(0,0,0),us.radius=.7071067811865476,us.applyMatrix4(e.matrixWorld),this.intersectsSphere(us)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if($o.x=s.normal.x>0?e.max.x:e.min.x,$o.y=s.normal.y>0?e.max.y:e.min.y,$o.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint($o)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function Ed(){let i=null,e=!1,t=null,n=null;function s(r,o){t(r,o),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function dg(i){let e=new WeakMap;function t(a,c){let l=a.array,u=a.usage,h=l.byteLength,f=i.createBuffer();i.bindBuffer(c,f),i.bufferData(c,l,u),a.onUploadCallback();let p;if(l instanceof Float32Array)p=i.FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)p=i.SHORT;else if(l instanceof Uint32Array)p=i.UNSIGNED_INT;else if(l instanceof Int32Array)p=i.INT;else if(l instanceof Int8Array)p=i.BYTE;else if(l instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:f,type:p,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:h}}function n(a,c,l){let u=c.array,h=c.updateRanges;if(i.bindBuffer(l,a),h.length===0)i.bufferSubData(l,0,u);else{h.sort((p,g)=>p.start-g.start);let f=0;for(let p=1;p<h.length;p++){let g=h[f],x=h[p];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++f,h[f]=x)}h.length=f+1;for(let p=0,g=h.length;p<g;p++){let x=h[p];i.bufferSubData(l,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let c=e.get(a);c&&(i.deleteBuffer(c.buffer),e.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,a,c),l.version=a.version}}return{get:s,remove:r,update:o}}var Nt=class i extends Zt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(n),c=Math.floor(s),l=a+1,u=c+1,h=e/a,f=t/c,p=[],g=[],x=[],m=[];for(let d=0;d<u;d++){let E=d*f-o;for(let b=0;b<l;b++){let y=b*h-r;g.push(y,-E,0),x.push(0,0,1),m.push(b/a),m.push(1-d/c)}}for(let d=0;d<c;d++)for(let E=0;E<a;E++){let b=E+l*d,y=E+l*(d+1),U=E+1+l*(d+1),R=E+1+l*d;p.push(b,y,R),p.push(y,U,R)}this.setIndex(p),this.setAttribute("position",new Yt(g,3)),this.setAttribute("normal",new Yt(x,3)),this.setAttribute("uv",new Yt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},pg=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,mg=`#ifdef USE_ALPHAHASH
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
#endif`,gg=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,xg=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,_g=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,yg=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,vg=`#ifdef USE_AOMAP
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
#endif`,Ag=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Mg=`#ifdef USE_BATCHING
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
#endif`,Sg=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,bg=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Eg=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Tg=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,wg=`#ifdef USE_IRIDESCENCE
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
#endif`,Rg=`#ifdef USE_BUMPMAP
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
#endif`,Cg=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Ig=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Pg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Lg=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Dg=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Ng=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Ug=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Og=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Fg=`#define PI 3.141592653589793
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
} // validated`,Bg=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,zg=`vec3 transformedNormal = objectNormal;
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
#endif`,Hg=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,kg=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Vg=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Gg=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Wg="gl_FragColor = linearToOutputTexel( gl_FragColor );",Xg=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,qg=`#ifdef USE_ENVMAP
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
#endif`,Yg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Zg=`#ifdef USE_ENVMAP
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
#endif`,Kg=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Jg=`#ifdef USE_ENVMAP
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
#endif`,$g=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,jg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Qg=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,e0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,t0=`#ifdef USE_GRADIENTMAP
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
}`,n0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,i0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,s0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,r0=`uniform bool receiveShadow;
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
#endif`,o0=`#ifdef USE_ENVMAP
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
#endif`,a0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,c0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,l0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,u0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,h0=`PhysicalMaterial material;
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
#endif`,f0=`struct PhysicalMaterial {
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
}`,d0=`
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
#endif`,p0=`#if defined( RE_IndirectDiffuse )
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
#endif`,m0=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,g0=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,x0=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,_0=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,y0=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,v0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,A0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,M0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,S0=`#if defined( USE_POINTS_UV )
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
#endif`,b0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,E0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,T0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,w0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,R0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,C0=`#ifdef USE_MORPHTARGETS
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
#endif`,I0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,P0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,L0=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,D0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,N0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,U0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,O0=`#ifdef USE_NORMALMAP
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
#endif`,F0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,B0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,z0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,H0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,k0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,V0=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,G0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,W0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,X0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,q0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Y0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Z0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,K0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,J0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,$0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,j0=`float getShadowMask() {
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
}`,Q0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,ex=`#ifdef USE_SKINNING
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
#endif`,tx=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,nx=`#ifdef USE_SKINNING
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
#endif`,ix=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,sx=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,rx=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,ox=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,ax=`#ifdef USE_TRANSMISSION
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
#endif`,cx=`#ifdef USE_TRANSMISSION
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
#endif`,lx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,ux=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,hx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,fx=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,dx=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,px=`uniform sampler2D t2D;
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
}`,mx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,gx=`#ifdef ENVMAP_TYPE_CUBE
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
}`,xx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,_x=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,yx=`#include <common>
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
}`,vx=`#if DEPTH_PACKING == 3200
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
}`,Ax=`#define DISTANCE
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
}`,Mx=`#define DISTANCE
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
}`,Sx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,bx=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ex=`uniform float scale;
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
}`,Tx=`uniform vec3 diffuse;
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
}`,wx=`#include <common>
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
}`,Rx=`uniform vec3 diffuse;
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
}`,Cx=`#define LAMBERT
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
}`,Ix=`#define LAMBERT
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
}`,Px=`#define MATCAP
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
}`,Lx=`#define MATCAP
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
}`,Dx=`#define NORMAL
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
}`,Nx=`#define NORMAL
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
}`,Ux=`#define PHONG
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
}`,Ox=`#define PHONG
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
}`,Fx=`#define STANDARD
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
}`,Bx=`#define STANDARD
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
}`,zx=`#define TOON
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
}`,Hx=`#define TOON
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
}`,kx=`uniform float size;
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
}`,Vx=`uniform vec3 diffuse;
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
}`,Gx=`#include <common>
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
}`,Wx=`uniform vec3 color;
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
}`,Xx=`uniform float rotation;
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
}`,qx=`uniform vec3 diffuse;
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
}`,He={alphahash_fragment:pg,alphahash_pars_fragment:mg,alphamap_fragment:gg,alphamap_pars_fragment:xg,alphatest_fragment:_g,alphatest_pars_fragment:yg,aomap_fragment:vg,aomap_pars_fragment:Ag,batching_pars_vertex:Mg,batching_vertex:Sg,begin_vertex:bg,beginnormal_vertex:Eg,bsdfs:Tg,iridescence_fragment:wg,bumpmap_pars_fragment:Rg,clipping_planes_fragment:Cg,clipping_planes_pars_fragment:Ig,clipping_planes_pars_vertex:Pg,clipping_planes_vertex:Lg,color_fragment:Dg,color_pars_fragment:Ng,color_pars_vertex:Ug,color_vertex:Og,common:Fg,cube_uv_reflection_fragment:Bg,defaultnormal_vertex:zg,displacementmap_pars_vertex:Hg,displacementmap_vertex:kg,emissivemap_fragment:Vg,emissivemap_pars_fragment:Gg,colorspace_fragment:Wg,colorspace_pars_fragment:Xg,envmap_fragment:qg,envmap_common_pars_fragment:Yg,envmap_pars_fragment:Zg,envmap_pars_vertex:Kg,envmap_physical_pars_fragment:o0,envmap_vertex:Jg,fog_vertex:$g,fog_pars_vertex:jg,fog_fragment:Qg,fog_pars_fragment:e0,gradientmap_pars_fragment:t0,lightmap_pars_fragment:n0,lights_lambert_fragment:i0,lights_lambert_pars_fragment:s0,lights_pars_begin:r0,lights_toon_fragment:a0,lights_toon_pars_fragment:c0,lights_phong_fragment:l0,lights_phong_pars_fragment:u0,lights_physical_fragment:h0,lights_physical_pars_fragment:f0,lights_fragment_begin:d0,lights_fragment_maps:p0,lights_fragment_end:m0,logdepthbuf_fragment:g0,logdepthbuf_pars_fragment:x0,logdepthbuf_pars_vertex:_0,logdepthbuf_vertex:y0,map_fragment:v0,map_pars_fragment:A0,map_particle_fragment:M0,map_particle_pars_fragment:S0,metalnessmap_fragment:b0,metalnessmap_pars_fragment:E0,morphinstance_vertex:T0,morphcolor_vertex:w0,morphnormal_vertex:R0,morphtarget_pars_vertex:C0,morphtarget_vertex:I0,normal_fragment_begin:P0,normal_fragment_maps:L0,normal_pars_fragment:D0,normal_pars_vertex:N0,normal_vertex:U0,normalmap_pars_fragment:O0,clearcoat_normal_fragment_begin:F0,clearcoat_normal_fragment_maps:B0,clearcoat_pars_fragment:z0,iridescence_pars_fragment:H0,opaque_fragment:k0,packing:V0,premultiplied_alpha_fragment:G0,project_vertex:W0,dithering_fragment:X0,dithering_pars_fragment:q0,roughnessmap_fragment:Y0,roughnessmap_pars_fragment:Z0,shadowmap_pars_fragment:K0,shadowmap_pars_vertex:J0,shadowmap_vertex:$0,shadowmask_pars_fragment:j0,skinbase_vertex:Q0,skinning_pars_vertex:ex,skinning_vertex:tx,skinnormal_vertex:nx,specularmap_fragment:ix,specularmap_pars_fragment:sx,tonemapping_fragment:rx,tonemapping_pars_fragment:ox,transmission_fragment:ax,transmission_pars_fragment:cx,uv_pars_fragment:lx,uv_pars_vertex:ux,uv_vertex:hx,worldpos_vertex:fx,background_vert:dx,background_frag:px,backgroundCube_vert:mx,backgroundCube_frag:gx,cube_vert:xx,cube_frag:_x,depth_vert:yx,depth_frag:vx,distanceRGBA_vert:Ax,distanceRGBA_frag:Mx,equirect_vert:Sx,equirect_frag:bx,linedashed_vert:Ex,linedashed_frag:Tx,meshbasic_vert:wx,meshbasic_frag:Rx,meshlambert_vert:Cx,meshlambert_frag:Ix,meshmatcap_vert:Px,meshmatcap_frag:Lx,meshnormal_vert:Dx,meshnormal_frag:Nx,meshphong_vert:Ux,meshphong_frag:Ox,meshphysical_vert:Fx,meshphysical_frag:Bx,meshtoon_vert:zx,meshtoon_frag:Hx,points_vert:kx,points_frag:Vx,shadow_vert:Gx,shadow_frag:Wx,sprite_vert:Xx,sprite_frag:qx},ie={common:{diffuse:{value:new be(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new We},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new We}},envmap:{envMap:{value:null},envMapRotation:{value:new We},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new We}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new We}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new We},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new We},normalScale:{value:new Le(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new We},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new We}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new We}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new We}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new be(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new be(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0},uvTransform:{value:new We}},sprite:{diffuse:{value:new be(16777215)},opacity:{value:1},center:{value:new Le(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new We},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0}}},Zn={basic:{uniforms:un([ie.common,ie.specularmap,ie.envmap,ie.aomap,ie.lightmap,ie.fog]),vertexShader:He.meshbasic_vert,fragmentShader:He.meshbasic_frag},lambert:{uniforms:un([ie.common,ie.specularmap,ie.envmap,ie.aomap,ie.lightmap,ie.emissivemap,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.fog,ie.lights,{emissive:{value:new be(0)}}]),vertexShader:He.meshlambert_vert,fragmentShader:He.meshlambert_frag},phong:{uniforms:un([ie.common,ie.specularmap,ie.envmap,ie.aomap,ie.lightmap,ie.emissivemap,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.fog,ie.lights,{emissive:{value:new be(0)},specular:{value:new be(1118481)},shininess:{value:30}}]),vertexShader:He.meshphong_vert,fragmentShader:He.meshphong_frag},standard:{uniforms:un([ie.common,ie.envmap,ie.aomap,ie.lightmap,ie.emissivemap,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.roughnessmap,ie.metalnessmap,ie.fog,ie.lights,{emissive:{value:new be(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag},toon:{uniforms:un([ie.common,ie.aomap,ie.lightmap,ie.emissivemap,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.gradientmap,ie.fog,ie.lights,{emissive:{value:new be(0)}}]),vertexShader:He.meshtoon_vert,fragmentShader:He.meshtoon_frag},matcap:{uniforms:un([ie.common,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.fog,{matcap:{value:null}}]),vertexShader:He.meshmatcap_vert,fragmentShader:He.meshmatcap_frag},points:{uniforms:un([ie.points,ie.fog]),vertexShader:He.points_vert,fragmentShader:He.points_frag},dashed:{uniforms:un([ie.common,ie.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:He.linedashed_vert,fragmentShader:He.linedashed_frag},depth:{uniforms:un([ie.common,ie.displacementmap]),vertexShader:He.depth_vert,fragmentShader:He.depth_frag},normal:{uniforms:un([ie.common,ie.bumpmap,ie.normalmap,ie.displacementmap,{opacity:{value:1}}]),vertexShader:He.meshnormal_vert,fragmentShader:He.meshnormal_frag},sprite:{uniforms:un([ie.sprite,ie.fog]),vertexShader:He.sprite_vert,fragmentShader:He.sprite_frag},background:{uniforms:{uvTransform:{value:new We},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:He.background_vert,fragmentShader:He.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new We}},vertexShader:He.backgroundCube_vert,fragmentShader:He.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:He.cube_vert,fragmentShader:He.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:He.equirect_vert,fragmentShader:He.equirect_frag},distanceRGBA:{uniforms:un([ie.common,ie.displacementmap,{referencePosition:{value:new w},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:He.distanceRGBA_vert,fragmentShader:He.distanceRGBA_frag},shadow:{uniforms:un([ie.lights,ie.fog,{color:{value:new be(0)},opacity:{value:1}}]),vertexShader:He.shadow_vert,fragmentShader:He.shadow_frag}};Zn.physical={uniforms:un([Zn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new We},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new We},clearcoatNormalScale:{value:new Le(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new We},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new We},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new We},sheen:{value:0},sheenColor:{value:new be(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new We},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new We},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new We},transmissionSamplerSize:{value:new Le},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new We},attenuationDistance:{value:0},attenuationColor:{value:new be(0)},specularColor:{value:new be(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new We},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new We},anisotropyVector:{value:new Le},anisotropyMap:{value:null},anisotropyMapTransform:{value:new We}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag};var jo={r:0,b:0,g:0},hs=new Qn,Yx=new Ee;function Zx(i,e,t,n,s,r,o){let a=new be(0),c=r===!0?0:1,l,u,h=null,f=0,p=null;function g(E){let b=E.isScene===!0?E.background:null;return b&&b.isTexture&&(b=(E.backgroundBlurriness>0?t:e).get(b)),b}function x(E){let b=!1,y=g(E);y===null?d(a,c):y&&y.isColor&&(d(y,1),b=!0);let U=i.xr.getEnvironmentBlendMode();U==="additive"?n.buffers.color.setClear(0,0,0,1,o):U==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||b)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(E,b){let y=g(b);y&&(y.isCubeTexture||y.mapping===ka)?(u===void 0&&(u=new Se(new ei(1,1,1),new sn({name:"BackgroundCubeMaterial",uniforms:fr(Zn.backgroundCube.uniforms),vertexShader:Zn.backgroundCube.vertexShader,fragmentShader:Zn.backgroundCube.fragmentShader,side:nn,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(U,R,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),hs.copy(b.backgroundRotation),hs.x*=-1,hs.y*=-1,hs.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(hs.y*=-1,hs.z*=-1),u.material.uniforms.envMap.value=y,u.material.uniforms.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Yx.makeRotationFromEuler(hs)),u.material.toneMapped=Je.getTransfer(y.colorSpace)!==ht,(h!==y||f!==y.version||p!==i.toneMapping)&&(u.material.needsUpdate=!0,h=y,f=y.version,p=i.toneMapping),u.layers.enableAll(),E.unshift(u,u.geometry,u.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new Se(new Nt(2,2),new sn({name:"BackgroundMaterial",uniforms:fr(Zn.background.uniforms),vertexShader:Zn.background.vertexShader,fragmentShader:Zn.background.fragmentShader,side:Jn,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,l.material.toneMapped=Je.getTransfer(y.colorSpace)!==ht,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(h!==y||f!==y.version||p!==i.toneMapping)&&(l.material.needsUpdate=!0,h=y,f=y.version,p=i.toneMapping),l.layers.enableAll(),E.unshift(l,l.geometry,l.material,0,0,null))}function d(E,b){E.getRGB(jo,bd(i)),n.buffers.color.setClear(jo.r,jo.g,jo.b,b,o)}return{getClearColor:function(){return a},setClearColor:function(E,b=1){a.set(E),c=b,d(a,c)},getClearAlpha:function(){return c},setClearAlpha:function(E){c=E,d(a,c)},render:x,addToRenderList:m}}function Kx(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null),r=s,o=!1;function a(v,P,k,B,G){let J=!1,X=h(B,k,P);r!==X&&(r=X,l(r.object)),J=p(v,B,k,G),J&&g(v,B,k,G),G!==null&&e.update(G,i.ELEMENT_ARRAY_BUFFER),(J||o)&&(o=!1,y(v,P,k,B),G!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(G).buffer))}function c(){return i.createVertexArray()}function l(v){return i.bindVertexArray(v)}function u(v){return i.deleteVertexArray(v)}function h(v,P,k){let B=k.wireframe===!0,G=n[v.id];G===void 0&&(G={},n[v.id]=G);let J=G[P.id];J===void 0&&(J={},G[P.id]=J);let X=J[B];return X===void 0&&(X=f(c()),J[B]=X),X}function f(v){let P=[],k=[],B=[];for(let G=0;G<t;G++)P[G]=0,k[G]=0,B[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:k,attributeDivisors:B,object:v,attributes:{},index:null}}function p(v,P,k,B){let G=r.attributes,J=P.attributes,X=0,j=k.getAttributes();for(let V in j)if(j[V].location>=0){let fe=G[V],we=J[V];if(we===void 0&&(V==="instanceMatrix"&&v.instanceMatrix&&(we=v.instanceMatrix),V==="instanceColor"&&v.instanceColor&&(we=v.instanceColor)),fe===void 0||fe.attribute!==we||we&&fe.data!==we.data)return!0;X++}return r.attributesNum!==X||r.index!==B}function g(v,P,k,B){let G={},J=P.attributes,X=0,j=k.getAttributes();for(let V in j)if(j[V].location>=0){let fe=J[V];fe===void 0&&(V==="instanceMatrix"&&v.instanceMatrix&&(fe=v.instanceMatrix),V==="instanceColor"&&v.instanceColor&&(fe=v.instanceColor));let we={};we.attribute=fe,fe&&fe.data&&(we.data=fe.data),G[V]=we,X++}r.attributes=G,r.attributesNum=X,r.index=B}function x(){let v=r.newAttributes;for(let P=0,k=v.length;P<k;P++)v[P]=0}function m(v){d(v,0)}function d(v,P){let k=r.newAttributes,B=r.enabledAttributes,G=r.attributeDivisors;k[v]=1,B[v]===0&&(i.enableVertexAttribArray(v),B[v]=1),G[v]!==P&&(i.vertexAttribDivisor(v,P),G[v]=P)}function E(){let v=r.newAttributes,P=r.enabledAttributes;for(let k=0,B=P.length;k<B;k++)P[k]!==v[k]&&(i.disableVertexAttribArray(k),P[k]=0)}function b(v,P,k,B,G,J,X){X===!0?i.vertexAttribIPointer(v,P,k,G,J):i.vertexAttribPointer(v,P,k,B,G,J)}function y(v,P,k,B){x();let G=B.attributes,J=k.getAttributes(),X=P.defaultAttributeValues;for(let j in J){let V=J[j];if(V.location>=0){let ne=G[j];if(ne===void 0&&(j==="instanceMatrix"&&v.instanceMatrix&&(ne=v.instanceMatrix),j==="instanceColor"&&v.instanceColor&&(ne=v.instanceColor)),ne!==void 0){let fe=ne.normalized,we=ne.itemSize,qe=e.get(ne);if(qe===void 0)continue;let dt=qe.buffer,Y=qe.type,te=qe.bytesPerElement,ye=Y===i.INT||Y===i.UNSIGNED_INT||ne.gpuType===uu;if(ne.isInterleavedBufferAttribute){let re=ne.data,Ne=re.stride,ze=ne.offset;if(re.isInstancedInterleavedBuffer){for(let Ye=0;Ye<V.locationSize;Ye++)d(V.location+Ye,re.meshPerAttribute);v.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=re.meshPerAttribute*re.count)}else for(let Ye=0;Ye<V.locationSize;Ye++)m(V.location+Ye);i.bindBuffer(i.ARRAY_BUFFER,dt);for(let Ye=0;Ye<V.locationSize;Ye++)b(V.location+Ye,we/V.locationSize,Y,fe,Ne*te,(ze+we/V.locationSize*Ye)*te,ye)}else{if(ne.isInstancedBufferAttribute){for(let re=0;re<V.locationSize;re++)d(V.location+re,ne.meshPerAttribute);v.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=ne.meshPerAttribute*ne.count)}else for(let re=0;re<V.locationSize;re++)m(V.location+re);i.bindBuffer(i.ARRAY_BUFFER,dt);for(let re=0;re<V.locationSize;re++)b(V.location+re,we/V.locationSize,Y,fe,we*te,we/V.locationSize*re*te,ye)}}else if(X!==void 0){let fe=X[j];if(fe!==void 0)switch(fe.length){case 2:i.vertexAttrib2fv(V.location,fe);break;case 3:i.vertexAttrib3fv(V.location,fe);break;case 4:i.vertexAttrib4fv(V.location,fe);break;default:i.vertexAttrib1fv(V.location,fe)}}}}E()}function U(){I();for(let v in n){let P=n[v];for(let k in P){let B=P[k];for(let G in B)u(B[G].object),delete B[G];delete P[k]}delete n[v]}}function R(v){if(n[v.id]===void 0)return;let P=n[v.id];for(let k in P){let B=P[k];for(let G in B)u(B[G].object),delete B[G];delete P[k]}delete n[v.id]}function C(v){for(let P in n){let k=n[P];if(k[v.id]===void 0)continue;let B=k[v.id];for(let G in B)u(B[G].object),delete B[G];delete k[v.id]}}function I(){S(),o=!0,r!==s&&(r=s,l(r.object))}function S(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:I,resetDefaultState:S,dispose:U,releaseStatesOfGeometry:R,releaseStatesOfProgram:C,initAttributes:x,enableAttribute:m,disableUnusedAttributes:E}}function Jx(i,e,t){let n;function s(l){n=l}function r(l,u){i.drawArrays(n,l,u),t.update(u,n,1)}function o(l,u,h){h!==0&&(i.drawArraysInstanced(n,l,u,h),t.update(u,n,h))}function a(l,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,u,0,h);let p=0;for(let g=0;g<h;g++)p+=u[g];t.update(p,n,1)}function c(l,u,h,f){if(h===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<l.length;g++)o(l[g],u[g],f[g]);else{p.multiDrawArraysInstancedWEBGL(n,l,0,u,0,f,0,h);let g=0;for(let x=0;x<h;x++)g+=u[x]*f[x];t.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=c}function $x(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let C=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(C){return!(C!==Rn&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(C){let I=C===_o&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(C!==mi&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==Hn&&!I)}function c(C){if(C==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",u=c(l);u!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);let h=t.logarithmicDepthBuffer===!0,f=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),E=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),b=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),U=g>0,R=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:h,reverseDepthBuffer:f,maxTextures:p,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:E,maxVaryings:b,maxFragmentUniforms:y,vertexTextures:U,maxSamples:R}}function jx(i){let e=this,t=null,n=0,s=!1,r=!1,o=new hi,a=new We,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){let p=h.length!==0||f||n!==0||s;return s=f,n=h.length,p},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,f){t=u(h,f,0)},this.setState=function(h,f,p){let g=h.clippingPlanes,x=h.clipIntersection,m=h.clipShadows,d=i.get(h);if(!s||g===null||g.length===0||r&&!m)r?u(null):l();else{let E=r?0:n,b=E*4,y=d.clippingState||null;c.value=y,y=u(g,f,b,p);for(let U=0;U!==b;++U)y[U]=t[U];d.clippingState=y,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=E}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,f,p,g){let x=h!==null?h.length:0,m=null;if(x!==0){if(m=c.value,g!==!0||m===null){let d=p+x*4,E=f.matrixWorldInverse;a.getNormalMatrix(E),(m===null||m.length<d)&&(m=new Float32Array(d));for(let b=0,y=p;b!==x;++b,y+=4)o.copy(h[b]).applyMatrix4(E,a),o.normal.toArray(m,y),m[y+3]=o.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}function Qx(i){let e=new WeakMap;function t(o,a){return a===tl?o.mapping=sr:a===nl&&(o.mapping=rr),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===tl||a===nl)if(e.has(o)){let c=e.get(o).texture;return t(c,o.mapping)}else{let c=o.image;if(c&&c.height>0){let l=new Nl(c.height);return l.fromEquirectangularTexture(i,o),e.set(o,l),o.addEventListener("dispose",s),t(l.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let c=e.get(a);c!==void 0&&(e.delete(a),c.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}var Zi=class extends Ma{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,o=n+e,a=s+t,c=s-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=u*this.view.offsetY,c=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Qs=4,gf=[.125,.215,.35,.446,.526,.582],ms=20,Fc=new Zi,xf=new be,Bc=null,zc=0,Hc=0,kc=!1,ds=(1+Math.sqrt(5))/2,Ws=1/ds,_f=[new w(-ds,Ws,0),new w(ds,Ws,0),new w(-Ws,0,ds),new w(Ws,0,ds),new w(0,ds,-Ws),new w(0,ds,Ws),new w(-1,1,-1),new w(1,1,-1),new w(-1,1,1),new w(1,1,1)],_s=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100){Bc=this._renderer.getRenderTarget(),zc=this._renderer.getActiveCubeFace(),Hc=this._renderer.getActiveMipmapLevel(),kc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,n,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Af(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=vf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Bc,zc,Hc),this._renderer.xr.enabled=kc,e.scissorTest=!1,Qo(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===sr||e.mapping===rr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Bc=this._renderer.getRenderTarget(),zc=this._renderer.getActiveCubeFace(),Hc=this._renderer.getActiveMipmapLevel(),kc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:qt,minFilter:qt,generateMipmaps:!1,type:_o,format:Rn,colorSpace:rn,depthBuffer:!1},s=yf(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=yf(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=e_(r)),this._blurMaterial=t_(r,e,t)}return s}_compileMaterial(e){let t=new Se(this._lodPlanes[0],e);this._renderer.compile(t,Fc)}_sceneToCubeUV(e,t,n,s){let a=new Ft(90,1,t,n),c=[1,-1,1,1,1,1],l=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,f=u.toneMapping;u.getClearColor(xf),u.toneMapping=Yi,u.autoClear=!1;let p=new wt({name:"PMREM.Background",side:nn,depthWrite:!1,depthTest:!1}),g=new Se(new ei,p),x=!1,m=e.background;m?m.isColor&&(p.color.copy(m),e.background=null,x=!0):(p.color.copy(xf),x=!0);for(let d=0;d<6;d++){let E=d%3;E===0?(a.up.set(0,c[d],0),a.lookAt(l[d],0,0)):E===1?(a.up.set(0,0,c[d]),a.lookAt(0,l[d],0)):(a.up.set(0,c[d],0),a.lookAt(0,0,l[d]));let b=this._cubeSize;Qo(s,E*b,d>2?b:0,b,b),u.setRenderTarget(s),x&&u.render(g,a),u.render(e,a)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=f,u.autoClear=h,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===sr||e.mapping===rr;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Af()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=vf());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new Se(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;let c=this._cubeSize;Qo(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(o,Fc)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=_f[(s-r-1)%_f.length];this._blur(e,r-1,r,o,a)}t.autoClear=n}_blur(e,t,n,s,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,s,"latitudinal",r),this._halfBlur(o,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,o,a){let c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new Se(this._lodPlanes[s],l),f=l.uniforms,p=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*ms-1),x=r/g,m=isFinite(r)?1+Math.floor(u*x):ms;m>ms&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ms}`);let d=[],E=0;for(let C=0;C<ms;++C){let I=C/x,S=Math.exp(-I*I/2);d.push(S),C===0?E+=S:C<m&&(E+=2*S)}for(let C=0;C<d.length;C++)d[C]=d[C]/E;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=d,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);let{_lodMax:b}=this;f.dTheta.value=g,f.mipInt.value=b-n;let y=this._sizeLods[s],U=3*y*(s>b-Qs?s-b+Qs:0),R=4*(this._cubeSize-y);Qo(t,U,R,3*y,2*y),c.setRenderTarget(t),c.render(h,Fc)}};function e_(i){let e=[],t=[],n=[],s=i,r=i-Qs+1+gf.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);t.push(a);let c=1/a;o>i-Qs?c=gf[o-i+Qs-1]:o===0&&(c=0),n.push(c);let l=1/(a-2),u=-l,h=1+l,f=[u,u,h,u,h,h,u,u,h,h,u,h],p=6,g=6,x=3,m=2,d=1,E=new Float32Array(x*g*p),b=new Float32Array(m*g*p),y=new Float32Array(d*g*p);for(let R=0;R<p;R++){let C=R%3*2/3-1,I=R>2?0:-1,S=[C,I,0,C+2/3,I,0,C+2/3,I+1,0,C,I,0,C+2/3,I+1,0,C,I+1,0];E.set(S,x*g*R),b.set(f,m*g*R);let v=[R,R,R,R,R,R];y.set(v,d*g*R)}let U=new Zt;U.setAttribute("position",new bt(E,x)),U.setAttribute("uv",new bt(b,m)),U.setAttribute("faceIndex",new bt(y,d)),e.push(U),s>Qs&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function yf(i,e,t){let n=new xi(i,e,t);return n.texture.mapping=ka,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Qo(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function t_(i,e,t){let n=new Float32Array(ms),s=new w(0,1,0);return new sn({name:"SphericalGaussianBlur",defines:{n:ms,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:yu(),fragmentShader:`

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
		`,blending:Xi,depthTest:!1,depthWrite:!1})}function vf(){return new sn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:yu(),fragmentShader:`

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
		`,blending:Xi,depthTest:!1,depthWrite:!1})}function Af(){return new sn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:yu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Xi,depthTest:!1,depthWrite:!1})}function yu(){return`

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
	`}function n_(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){let c=a.mapping,l=c===tl||c===nl,u=c===sr||c===rr;if(l||u){let h=e.get(a),f=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==f)return t===null&&(t=new _s(i)),h=l?t.fromEquirectangular(a,h):t.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),h.texture;if(h!==void 0)return h.texture;{let p=a.image;return l&&p&&p.height>0||u&&p&&s(p)?(t===null&&(t=new _s(i)),h=l?t.fromEquirectangular(a):t.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),a.addEventListener("dispose",r),h.texture):null}}}return a}function s(a){let c=0,l=6;for(let u=0;u<l;u++)a[u]!==void 0&&c++;return c===l}function r(a){let c=a.target;c.removeEventListener("dispose",r);let l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function i_(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&Zr("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function s_(i,e,t,n){let s={},r=new WeakMap;function o(h){let f=h.target;f.index!==null&&e.remove(f.index);for(let g in f.attributes)e.remove(f.attributes[g]);for(let g in f.morphAttributes){let x=f.morphAttributes[g];for(let m=0,d=x.length;m<d;m++)e.remove(x[m])}f.removeEventListener("dispose",o),delete s[f.id];let p=r.get(f);p&&(e.remove(p),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(h,f){return s[f.id]===!0||(f.addEventListener("dispose",o),s[f.id]=!0,t.memory.geometries++),f}function c(h){let f=h.attributes;for(let g in f)e.update(f[g],i.ARRAY_BUFFER);let p=h.morphAttributes;for(let g in p){let x=p[g];for(let m=0,d=x.length;m<d;m++)e.update(x[m],i.ARRAY_BUFFER)}}function l(h){let f=[],p=h.index,g=h.attributes.position,x=0;if(p!==null){let E=p.array;x=p.version;for(let b=0,y=E.length;b<y;b+=3){let U=E[b+0],R=E[b+1],C=E[b+2];f.push(U,R,R,C,C,U)}}else if(g!==void 0){let E=g.array;x=g.version;for(let b=0,y=E.length/3-1;b<y;b+=3){let U=b+0,R=b+1,C=b+2;f.push(U,R,R,C,C,U)}}else return;let m=new(Md(f)?Aa:va)(f,1);m.version=x;let d=r.get(h);d&&e.remove(d),r.set(h,m)}function u(h){let f=r.get(h);if(f){let p=h.index;p!==null&&f.version<p.version&&l(h)}else l(h);return r.get(h)}return{get:a,update:c,getWireframeAttribute:u}}function r_(i,e,t){let n;function s(f){n=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function c(f,p){i.drawElements(n,p,r,f*o),t.update(p,n,1)}function l(f,p,g){g!==0&&(i.drawElementsInstanced(n,p,r,f*o,g),t.update(p,n,g))}function u(f,p,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,f,0,g);let m=0;for(let d=0;d<g;d++)m+=p[d];t.update(m,n,1)}function h(f,p,g,x){if(g===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<f.length;d++)l(f[d]/o,p[d],x[d]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,r,f,0,x,0,g);let d=0;for(let E=0;E<g;E++)d+=p[E]*x[E];t.update(d,n,1)}}this.setMode=s,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function o_(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function a_(i,e,t){let n=new WeakMap,s=new Oe;function r(o,a,c){let l=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0,f=n.get(a);if(f===void 0||f.count!==h){let S=function(){C.dispose(),n.delete(a),a.removeEventListener("dispose",S)};f!==void 0&&f.texture.dispose();let p=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],d=a.morphAttributes.normal||[],E=a.morphAttributes.color||[],b=0;p===!0&&(b=1),g===!0&&(b=2),x===!0&&(b=3);let y=a.attributes.position.count*b,U=1;y>e.maxTextureSize&&(U=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let R=new Float32Array(y*U*4*h),C=new _a(R,y,U,h);C.type=Hn,C.needsUpdate=!0;let I=b*4;for(let v=0;v<h;v++){let P=m[v],k=d[v],B=E[v],G=y*U*4*v;for(let J=0;J<P.count;J++){let X=J*I;p===!0&&(s.fromBufferAttribute(P,J),R[G+X+0]=s.x,R[G+X+1]=s.y,R[G+X+2]=s.z,R[G+X+3]=0),g===!0&&(s.fromBufferAttribute(k,J),R[G+X+4]=s.x,R[G+X+5]=s.y,R[G+X+6]=s.z,R[G+X+7]=0),x===!0&&(s.fromBufferAttribute(B,J),R[G+X+8]=s.x,R[G+X+9]=s.y,R[G+X+10]=s.z,R[G+X+11]=B.itemSize===4?s.w:1)}}f={count:h,texture:C,size:new Le(y,U)},n.set(a,f),a.addEventListener("dispose",S)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let p=0;for(let x=0;x<l.length;x++)p+=l[x];let g=a.morphTargetsRelative?1:1-p;c.getUniforms().setValue(i,"morphTargetBaseInfluence",g),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",f.texture,t),c.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function c_(i,e,t,n){let s=new WeakMap;function r(c){let l=n.render.frame,u=c.geometry,h=e.get(c,u);if(s.get(h)!==l&&(e.update(h),s.set(h,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",a)===!1&&c.addEventListener("dispose",a),s.get(c)!==l&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),s.set(c,l))),c.isSkinnedMesh){let f=c.skeleton;s.get(f)!==l&&(f.update(),s.set(f,l))}return h}function o(){s=new WeakMap}function a(c){let l=c.target;l.removeEventListener("dispose",a),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:r,dispose:o}}var ba=class extends zt{constructor(e,t,n,s,r,o,a,c,l,u=er){if(u!==er&&u!==ar)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===er&&(n=xs),n===void 0&&u===ar&&(n=or),super(null,s,r,o,a,c,u,n,l),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:Bt,this.minFilter=c!==void 0?c:Bt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Td=new zt,Mf=new ba(1,1),wd=new _a,Rd=new Ll,Cd=new Sa,Sf=[],bf=[],Ef=new Float32Array(16),Tf=new Float32Array(9),wf=new Float32Array(4);function _r(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=Sf[s];if(r===void 0&&(r=new Float32Array(s),Sf[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function Ht(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function kt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Xa(i,e){let t=bf[e];t===void 0&&(t=new Int32Array(e),bf[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function l_(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function u_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ht(t,e))return;i.uniform2fv(this.addr,e),kt(t,e)}}function h_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Ht(t,e))return;i.uniform3fv(this.addr,e),kt(t,e)}}function f_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ht(t,e))return;i.uniform4fv(this.addr,e),kt(t,e)}}function d_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Ht(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),kt(t,e)}else{if(Ht(t,n))return;wf.set(n),i.uniformMatrix2fv(this.addr,!1,wf),kt(t,n)}}function p_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Ht(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),kt(t,e)}else{if(Ht(t,n))return;Tf.set(n),i.uniformMatrix3fv(this.addr,!1,Tf),kt(t,n)}}function m_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Ht(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),kt(t,e)}else{if(Ht(t,n))return;Ef.set(n),i.uniformMatrix4fv(this.addr,!1,Ef),kt(t,n)}}function g_(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function x_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ht(t,e))return;i.uniform2iv(this.addr,e),kt(t,e)}}function __(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ht(t,e))return;i.uniform3iv(this.addr,e),kt(t,e)}}function y_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ht(t,e))return;i.uniform4iv(this.addr,e),kt(t,e)}}function v_(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function A_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ht(t,e))return;i.uniform2uiv(this.addr,e),kt(t,e)}}function M_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ht(t,e))return;i.uniform3uiv(this.addr,e),kt(t,e)}}function S_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ht(t,e))return;i.uniform4uiv(this.addr,e),kt(t,e)}}function b_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Mf.compareFunction=vd,r=Mf):r=Td,t.setTexture2D(e||r,s)}function E_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Rd,s)}function T_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Cd,s)}function w_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||wd,s)}function R_(i){switch(i){case 5126:return l_;case 35664:return u_;case 35665:return h_;case 35666:return f_;case 35674:return d_;case 35675:return p_;case 35676:return m_;case 5124:case 35670:return g_;case 35667:case 35671:return x_;case 35668:case 35672:return __;case 35669:case 35673:return y_;case 5125:return v_;case 36294:return A_;case 36295:return M_;case 36296:return S_;case 35678:case 36198:case 36298:case 36306:case 35682:return b_;case 35679:case 36299:case 36307:return E_;case 35680:case 36300:case 36308:case 36293:return T_;case 36289:case 36303:case 36311:case 36292:return w_}}function C_(i,e){i.uniform1fv(this.addr,e)}function I_(i,e){let t=_r(e,this.size,2);i.uniform2fv(this.addr,t)}function P_(i,e){let t=_r(e,this.size,3);i.uniform3fv(this.addr,t)}function L_(i,e){let t=_r(e,this.size,4);i.uniform4fv(this.addr,t)}function D_(i,e){let t=_r(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function N_(i,e){let t=_r(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function U_(i,e){let t=_r(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function O_(i,e){i.uniform1iv(this.addr,e)}function F_(i,e){i.uniform2iv(this.addr,e)}function B_(i,e){i.uniform3iv(this.addr,e)}function z_(i,e){i.uniform4iv(this.addr,e)}function H_(i,e){i.uniform1uiv(this.addr,e)}function k_(i,e){i.uniform2uiv(this.addr,e)}function V_(i,e){i.uniform3uiv(this.addr,e)}function G_(i,e){i.uniform4uiv(this.addr,e)}function W_(i,e,t){let n=this.cache,s=e.length,r=Xa(t,s);Ht(n,r)||(i.uniform1iv(this.addr,r),kt(n,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||Td,r[o])}function X_(i,e,t){let n=this.cache,s=e.length,r=Xa(t,s);Ht(n,r)||(i.uniform1iv(this.addr,r),kt(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Rd,r[o])}function q_(i,e,t){let n=this.cache,s=e.length,r=Xa(t,s);Ht(n,r)||(i.uniform1iv(this.addr,r),kt(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||Cd,r[o])}function Y_(i,e,t){let n=this.cache,s=e.length,r=Xa(t,s);Ht(n,r)||(i.uniform1iv(this.addr,r),kt(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||wd,r[o])}function Z_(i){switch(i){case 5126:return C_;case 35664:return I_;case 35665:return P_;case 35666:return L_;case 35674:return D_;case 35675:return N_;case 35676:return U_;case 5124:case 35670:return O_;case 35667:case 35671:return F_;case 35668:case 35672:return B_;case 35669:case 35673:return z_;case 5125:return H_;case 36294:return k_;case 36295:return V_;case 36296:return G_;case 35678:case 36198:case 36298:case 36306:case 35682:return W_;case 35679:case 36299:case 36307:return X_;case 35680:case 36300:case 36308:case 36293:return q_;case 36289:case 36303:case 36311:case 36292:return Y_}}var Ul=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=R_(t.type)}},Ol=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Z_(t.type)}},Fl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],n)}}},Vc=/(\w+)(\])?(\[|\.)?/g;function Rf(i,e){i.seq.push(e),i.map[e.id]=e}function K_(i,e,t){let n=i.name,s=n.length;for(Vc.lastIndex=0;;){let r=Vc.exec(n),o=Vc.lastIndex,a=r[1],c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===s){Rf(t,l===void 0?new Ul(a,i,e):new Ol(a,i,e));break}else{let h=t.map[a];h===void 0&&(h=new Fl(a),Rf(t,h)),t=h}}}var nr=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);K_(r,o,this)}}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],c=n[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&n.push(o)}return n}};function Cf(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var J_=37297,$_=0;function j_(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var If=new We;function Q_(i){Je._getMatrix(If,Je.workingColorSpace,i);let e=`mat3( ${If.elements.map(t=>t.toFixed(4))} )`;switch(Je.getTransfer(i)){case Wa:return[e,"LinearTransferOETF"];case ht:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Pf(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),s=i.getShaderInfoLog(e).trim();if(n&&s==="")return"";let r=/ERROR: 0:(\d+)/.exec(s);if(r){let o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+j_(i.getShaderSource(e),o)}else return s}function ey(i,e){let t=Q_(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function ty(i,e){let t;switch(e){case um:t="Linear";break;case hm:t="Reinhard";break;case fm:t="Cineon";break;case cu:t="ACESFilmic";break;case pm:t="AgX";break;case mm:t="Neutral";break;case dm:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var ea=new w;function ny(){Je.getLuminanceCoefficients(ea);let i=ea.x.toFixed(4),e=ea.y.toFixed(4),t=ea.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function iy(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Kr).join(`
`)}function sy(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function ry(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function Kr(i){return i!==""}function Lf(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Df(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var oy=/^[ \t]*#include +<([\w\d./]+)>/gm;function Bl(i){return i.replace(oy,cy)}var ay=new Map;function cy(i,e){let t=He[e];if(t===void 0){let n=ay.get(e);if(n!==void 0)t=He[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Bl(t)}var ly=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Nf(i){return i.replace(ly,uy)}function uy(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Uf(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}function hy(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===rd?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===ou?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===ui&&(e="SHADOWMAP_TYPE_VSM"),e}function fy(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case sr:case rr:e="ENVMAP_TYPE_CUBE";break;case ka:e="ENVMAP_TYPE_CUBE_UV";break}return e}function dy(i){let e="ENVMAP_MODE_REFLECTION";return i.envMap&&i.envMapMode===rr&&(e="ENVMAP_MODE_REFRACTION"),e}function py(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case od:e="ENVMAP_BLENDING_MULTIPLY";break;case cm:e="ENVMAP_BLENDING_MIX";break;case lm:e="ENVMAP_BLENDING_ADD";break}return e}function my(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function gy(i,e,t,n){let s=i.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,c=hy(t),l=fy(t),u=dy(t),h=py(t),f=my(t),p=iy(t),g=sy(r),x=s.createProgram(),m,d,E=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Kr).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Kr).join(`
`),d.length>0&&(d+=`
`)):(m=[Uf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Kr).join(`
`),d=[Uf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Yi?"#define TONE_MAPPING":"",t.toneMapping!==Yi?He.tonemapping_pars_fragment:"",t.toneMapping!==Yi?ty("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",He.colorspace_pars_fragment,ey("linearToOutputTexel",t.outputColorSpace),ny(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Kr).join(`
`)),o=Bl(o),o=Lf(o,t),o=Df(o,t),a=Bl(a),a=Lf(a,t),a=Df(a,t),o=Nf(o),a=Nf(a),t.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",t.glslVersion===Yh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Yh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);let b=E+m+o,y=E+d+a,U=Cf(s,s.VERTEX_SHADER,b),R=Cf(s,s.FRAGMENT_SHADER,y);s.attachShader(x,U),s.attachShader(x,R),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function C(P){if(i.debug.checkShaderErrors){let k=s.getProgramInfoLog(x).trim(),B=s.getShaderInfoLog(U).trim(),G=s.getShaderInfoLog(R).trim(),J=!0,X=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(J=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,x,U,R);else{let j=Pf(s,U,"vertex"),V=Pf(s,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+k+`
`+j+`
`+V)}else k!==""?console.warn("THREE.WebGLProgram: Program Info Log:",k):(B===""||G==="")&&(X=!1);X&&(P.diagnostics={runnable:J,programLog:k,vertexShader:{log:B,prefix:m},fragmentShader:{log:G,prefix:d}})}s.deleteShader(U),s.deleteShader(R),I=new nr(s,x),S=ry(s,x)}let I;this.getUniforms=function(){return I===void 0&&C(this),I};let S;this.getAttributes=function(){return S===void 0&&C(this),S};let v=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return v===!1&&(v=s.getProgramParameter(x,J_)),v},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=$_++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=U,this.fragmentShader=R,this}var xy=0,zl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Hl(e),t.set(e,n)),n}},Hl=class{constructor(e){this.id=xy++,this.code=e,this.usedTimes=0}};function _y(i,e,t,n,s,r,o){let a=new ya,c=new zl,l=new Set,u=[],h=s.logarithmicDepthBuffer,f=s.vertexTextures,p=s.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(S){return l.add(S),S===0?"uv":`uv${S}`}function m(S,v,P,k,B){let G=k.fog,J=B.geometry,X=S.isMeshStandardMaterial?k.environment:null,j=(S.isMeshStandardMaterial?t:e).get(S.envMap||X),V=j&&j.mapping===ka?j.image.height:null,ne=g[S.type];S.precision!==null&&(p=s.getMaxPrecision(S.precision),p!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",p,"instead."));let fe=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,we=fe!==void 0?fe.length:0,qe=0;J.morphAttributes.position!==void 0&&(qe=1),J.morphAttributes.normal!==void 0&&(qe=2),J.morphAttributes.color!==void 0&&(qe=3);let dt,Y,te,ye;if(ne){let ot=Zn[ne];dt=ot.vertexShader,Y=ot.fragmentShader}else dt=S.vertexShader,Y=S.fragmentShader,c.update(S),te=c.getVertexShaderID(S),ye=c.getFragmentShaderID(S);let re=i.getRenderTarget(),Ne=i.state.buffers.depth.getReversed(),ze=B.isInstancedMesh===!0,Ye=B.isBatchedMesh===!0,Tt=!!S.map,et=!!S.matcap,Pt=!!j,O=!!S.aoMap,En=!!S.lightMap,$e=!!S.bumpMap,je=!!S.normalMap,Pe=!!S.displacementMap,vt=!!S.emissiveMap,Ie=!!S.metalnessMap,T=!!S.roughnessMap,_=S.anisotropy>0,F=S.clearcoat>0,Z=S.dispersion>0,$=S.iridescence>0,q=S.sheen>0,ve=S.transmission>0,oe=_&&!!S.anisotropyMap,de=F&&!!S.clearcoatMap,tt=F&&!!S.clearcoatNormalMap,Q=F&&!!S.clearcoatRoughnessMap,pe=$&&!!S.iridescenceMap,De=$&&!!S.iridescenceThicknessMap,Ue=q&&!!S.sheenColorMap,me=q&&!!S.sheenRoughnessMap,Qe=!!S.specularMap,Xe=!!S.specularColorMap,xt=!!S.specularIntensityMap,L=ve&&!!S.transmissionMap,se=ve&&!!S.thicknessMap,W=!!S.gradientMap,K=!!S.alphaMap,le=S.alphaTest>0,ae=!!S.alphaHash,Ve=!!S.extensions,Ct=Yi;S.toneMapped&&(re===null||re.isXRRenderTarget===!0)&&(Ct=i.toneMapping);let $t={shaderID:ne,shaderType:S.type,shaderName:S.name,vertexShader:dt,fragmentShader:Y,defines:S.defines,customVertexShaderID:te,customFragmentShaderID:ye,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:p,batching:Ye,batchingColor:Ye&&B._colorsTexture!==null,instancing:ze,instancingColor:ze&&B.instanceColor!==null,instancingMorph:ze&&B.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:re===null?i.outputColorSpace:re.isXRRenderTarget===!0?re.texture.colorSpace:rn,alphaToCoverage:!!S.alphaToCoverage,map:Tt,matcap:et,envMap:Pt,envMapMode:Pt&&j.mapping,envMapCubeUVHeight:V,aoMap:O,lightMap:En,bumpMap:$e,normalMap:je,displacementMap:f&&Pe,emissiveMap:vt,normalMapObjectSpace:je&&S.normalMapType===Am,normalMapTangentSpace:je&&S.normalMapType===yd,metalnessMap:Ie,roughnessMap:T,anisotropy:_,anisotropyMap:oe,clearcoat:F,clearcoatMap:de,clearcoatNormalMap:tt,clearcoatRoughnessMap:Q,dispersion:Z,iridescence:$,iridescenceMap:pe,iridescenceThicknessMap:De,sheen:q,sheenColorMap:Ue,sheenRoughnessMap:me,specularMap:Qe,specularColorMap:Xe,specularIntensityMap:xt,transmission:ve,transmissionMap:L,thicknessMap:se,gradientMap:W,opaque:S.transparent===!1&&S.blending===qi&&S.alphaToCoverage===!1,alphaMap:K,alphaTest:le,alphaHash:ae,combine:S.combine,mapUv:Tt&&x(S.map.channel),aoMapUv:O&&x(S.aoMap.channel),lightMapUv:En&&x(S.lightMap.channel),bumpMapUv:$e&&x(S.bumpMap.channel),normalMapUv:je&&x(S.normalMap.channel),displacementMapUv:Pe&&x(S.displacementMap.channel),emissiveMapUv:vt&&x(S.emissiveMap.channel),metalnessMapUv:Ie&&x(S.metalnessMap.channel),roughnessMapUv:T&&x(S.roughnessMap.channel),anisotropyMapUv:oe&&x(S.anisotropyMap.channel),clearcoatMapUv:de&&x(S.clearcoatMap.channel),clearcoatNormalMapUv:tt&&x(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Q&&x(S.clearcoatRoughnessMap.channel),iridescenceMapUv:pe&&x(S.iridescenceMap.channel),iridescenceThicknessMapUv:De&&x(S.iridescenceThicknessMap.channel),sheenColorMapUv:Ue&&x(S.sheenColorMap.channel),sheenRoughnessMapUv:me&&x(S.sheenRoughnessMap.channel),specularMapUv:Qe&&x(S.specularMap.channel),specularColorMapUv:Xe&&x(S.specularColorMap.channel),specularIntensityMapUv:xt&&x(S.specularIntensityMap.channel),transmissionMapUv:L&&x(S.transmissionMap.channel),thicknessMapUv:se&&x(S.thicknessMap.channel),alphaMapUv:K&&x(S.alphaMap.channel),vertexTangents:!!J.attributes.tangent&&(je||_),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!J.attributes.uv&&(Tt||K),fog:!!G,useFog:S.fog===!0,fogExp2:!!G&&G.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:Ne,skinning:B.isSkinnedMesh===!0,morphTargets:J.morphAttributes.position!==void 0,morphNormals:J.morphAttributes.normal!==void 0,morphColors:J.morphAttributes.color!==void 0,morphTargetsCount:we,morphTextureStride:qe,numDirLights:v.directional.length,numPointLights:v.point.length,numSpotLights:v.spot.length,numSpotLightMaps:v.spotLightMap.length,numRectAreaLights:v.rectArea.length,numHemiLights:v.hemi.length,numDirLightShadows:v.directionalShadowMap.length,numPointLightShadows:v.pointShadowMap.length,numSpotLightShadows:v.spotShadowMap.length,numSpotLightShadowsWithMaps:v.numSpotLightShadowsWithMaps,numLightProbes:v.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ct,decodeVideoTexture:Tt&&S.map.isVideoTexture===!0&&Je.getTransfer(S.map.colorSpace)===ht,decodeVideoTextureEmissive:vt&&S.emissiveMap.isVideoTexture===!0&&Je.getTransfer(S.emissiveMap.colorSpace)===ht,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===tn,flipSided:S.side===nn,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:Ve&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ve&&S.extensions.multiDraw===!0||Ye)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return $t.vertexUv1s=l.has(1),$t.vertexUv2s=l.has(2),$t.vertexUv3s=l.has(3),l.clear(),$t}function d(S){let v=[];if(S.shaderID?v.push(S.shaderID):(v.push(S.customVertexShaderID),v.push(S.customFragmentShaderID)),S.defines!==void 0)for(let P in S.defines)v.push(P),v.push(S.defines[P]);return S.isRawShaderMaterial===!1&&(E(v,S),b(v,S),v.push(i.outputColorSpace)),v.push(S.customProgramCacheKey),v.join()}function E(S,v){S.push(v.precision),S.push(v.outputColorSpace),S.push(v.envMapMode),S.push(v.envMapCubeUVHeight),S.push(v.mapUv),S.push(v.alphaMapUv),S.push(v.lightMapUv),S.push(v.aoMapUv),S.push(v.bumpMapUv),S.push(v.normalMapUv),S.push(v.displacementMapUv),S.push(v.emissiveMapUv),S.push(v.metalnessMapUv),S.push(v.roughnessMapUv),S.push(v.anisotropyMapUv),S.push(v.clearcoatMapUv),S.push(v.clearcoatNormalMapUv),S.push(v.clearcoatRoughnessMapUv),S.push(v.iridescenceMapUv),S.push(v.iridescenceThicknessMapUv),S.push(v.sheenColorMapUv),S.push(v.sheenRoughnessMapUv),S.push(v.specularMapUv),S.push(v.specularColorMapUv),S.push(v.specularIntensityMapUv),S.push(v.transmissionMapUv),S.push(v.thicknessMapUv),S.push(v.combine),S.push(v.fogExp2),S.push(v.sizeAttenuation),S.push(v.morphTargetsCount),S.push(v.morphAttributeCount),S.push(v.numDirLights),S.push(v.numPointLights),S.push(v.numSpotLights),S.push(v.numSpotLightMaps),S.push(v.numHemiLights),S.push(v.numRectAreaLights),S.push(v.numDirLightShadows),S.push(v.numPointLightShadows),S.push(v.numSpotLightShadows),S.push(v.numSpotLightShadowsWithMaps),S.push(v.numLightProbes),S.push(v.shadowMapType),S.push(v.toneMapping),S.push(v.numClippingPlanes),S.push(v.numClipIntersection),S.push(v.depthPacking)}function b(S,v){a.disableAll(),v.supportsVertexTextures&&a.enable(0),v.instancing&&a.enable(1),v.instancingColor&&a.enable(2),v.instancingMorph&&a.enable(3),v.matcap&&a.enable(4),v.envMap&&a.enable(5),v.normalMapObjectSpace&&a.enable(6),v.normalMapTangentSpace&&a.enable(7),v.clearcoat&&a.enable(8),v.iridescence&&a.enable(9),v.alphaTest&&a.enable(10),v.vertexColors&&a.enable(11),v.vertexAlphas&&a.enable(12),v.vertexUv1s&&a.enable(13),v.vertexUv2s&&a.enable(14),v.vertexUv3s&&a.enable(15),v.vertexTangents&&a.enable(16),v.anisotropy&&a.enable(17),v.alphaHash&&a.enable(18),v.batching&&a.enable(19),v.dispersion&&a.enable(20),v.batchingColor&&a.enable(21),S.push(a.mask),a.disableAll(),v.fog&&a.enable(0),v.useFog&&a.enable(1),v.flatShading&&a.enable(2),v.logarithmicDepthBuffer&&a.enable(3),v.reverseDepthBuffer&&a.enable(4),v.skinning&&a.enable(5),v.morphTargets&&a.enable(6),v.morphNormals&&a.enable(7),v.morphColors&&a.enable(8),v.premultipliedAlpha&&a.enable(9),v.shadowMapEnabled&&a.enable(10),v.doubleSided&&a.enable(11),v.flipSided&&a.enable(12),v.useDepthPacking&&a.enable(13),v.dithering&&a.enable(14),v.transmission&&a.enable(15),v.sheen&&a.enable(16),v.opaque&&a.enable(17),v.pointsUvs&&a.enable(18),v.decodeVideoTexture&&a.enable(19),v.decodeVideoTextureEmissive&&a.enable(20),v.alphaToCoverage&&a.enable(21),S.push(a.mask)}function y(S){let v=g[S.type],P;if(v){let k=Zn[v];P=cg.clone(k.uniforms)}else P=S.uniforms;return P}function U(S,v){let P;for(let k=0,B=u.length;k<B;k++){let G=u[k];if(G.cacheKey===v){P=G,++P.usedTimes;break}}return P===void 0&&(P=new gy(i,v,S,r),u.push(P)),P}function R(S){if(--S.usedTimes===0){let v=u.indexOf(S);u[v]=u[u.length-1],u.pop(),S.destroy()}}function C(S){c.remove(S)}function I(){c.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:y,acquireProgram:U,releaseProgram:R,releaseShaderCache:C,programs:u,dispose:I}}function yy(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,c){i.get(o)[a]=c}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function vy(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Of(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Ff(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(h,f,p,g,x,m){let d=i[e];return d===void 0?(d={id:h.id,object:h,geometry:f,material:p,groupOrder:g,renderOrder:h.renderOrder,z:x,group:m},i[e]=d):(d.id=h.id,d.object=h,d.geometry=f,d.material=p,d.groupOrder=g,d.renderOrder=h.renderOrder,d.z=x,d.group=m),e++,d}function a(h,f,p,g,x,m){let d=o(h,f,p,g,x,m);p.transmission>0?n.push(d):p.transparent===!0?s.push(d):t.push(d)}function c(h,f,p,g,x,m){let d=o(h,f,p,g,x,m);p.transmission>0?n.unshift(d):p.transparent===!0?s.unshift(d):t.unshift(d)}function l(h,f){t.length>1&&t.sort(h||vy),n.length>1&&n.sort(f||Of),s.length>1&&s.sort(f||Of)}function u(){for(let h=e,f=i.length;h<f;h++){let p=i[h];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:a,unshift:c,finish:u,sort:l}}function Ay(){let i=new WeakMap;function e(n,s){let r=i.get(n),o;return r===void 0?(o=new Ff,i.set(n,[o])):s>=r.length?(o=new Ff,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function My(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new w,color:new be};break;case"SpotLight":t={position:new w,direction:new w,color:new be,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new w,color:new be,distance:0,decay:0};break;case"HemisphereLight":t={direction:new w,skyColor:new be,groundColor:new be};break;case"RectAreaLight":t={color:new be,position:new w,halfWidth:new w,halfHeight:new w};break}return i[e.id]=t,t}}}function Sy(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Le};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Le};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Le,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var by=0;function Ey(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Ty(i){let e=new My,t=Sy(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new w);let s=new w,r=new Ee,o=new Ee;function a(l){let u=0,h=0,f=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let p=0,g=0,x=0,m=0,d=0,E=0,b=0,y=0,U=0,R=0,C=0;l.sort(Ey);for(let S=0,v=l.length;S<v;S++){let P=l[S],k=P.color,B=P.intensity,G=P.distance,J=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)u+=k.r*B,h+=k.g*B,f+=k.b*B;else if(P.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(P.sh.coefficients[X],B);C++}else if(P.isDirectionalLight){let X=e.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let j=P.shadow,V=t.get(P);V.shadowIntensity=j.intensity,V.shadowBias=j.bias,V.shadowNormalBias=j.normalBias,V.shadowRadius=j.radius,V.shadowMapSize=j.mapSize,n.directionalShadow[p]=V,n.directionalShadowMap[p]=J,n.directionalShadowMatrix[p]=P.shadow.matrix,E++}n.directional[p]=X,p++}else if(P.isSpotLight){let X=e.get(P);X.position.setFromMatrixPosition(P.matrixWorld),X.color.copy(k).multiplyScalar(B),X.distance=G,X.coneCos=Math.cos(P.angle),X.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),X.decay=P.decay,n.spot[x]=X;let j=P.shadow;if(P.map&&(n.spotLightMap[U]=P.map,U++,j.updateMatrices(P),P.castShadow&&R++),n.spotLightMatrix[x]=j.matrix,P.castShadow){let V=t.get(P);V.shadowIntensity=j.intensity,V.shadowBias=j.bias,V.shadowNormalBias=j.normalBias,V.shadowRadius=j.radius,V.shadowMapSize=j.mapSize,n.spotShadow[x]=V,n.spotShadowMap[x]=J,y++}x++}else if(P.isRectAreaLight){let X=e.get(P);X.color.copy(k).multiplyScalar(B),X.halfWidth.set(P.width*.5,0,0),X.halfHeight.set(0,P.height*.5,0),n.rectArea[m]=X,m++}else if(P.isPointLight){let X=e.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),X.distance=P.distance,X.decay=P.decay,P.castShadow){let j=P.shadow,V=t.get(P);V.shadowIntensity=j.intensity,V.shadowBias=j.bias,V.shadowNormalBias=j.normalBias,V.shadowRadius=j.radius,V.shadowMapSize=j.mapSize,V.shadowCameraNear=j.camera.near,V.shadowCameraFar=j.camera.far,n.pointShadow[g]=V,n.pointShadowMap[g]=J,n.pointShadowMatrix[g]=P.shadow.matrix,b++}n.point[g]=X,g++}else if(P.isHemisphereLight){let X=e.get(P);X.skyColor.copy(P.color).multiplyScalar(B),X.groundColor.copy(P.groundColor).multiplyScalar(B),n.hemi[d]=X,d++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ie.LTC_FLOAT_1,n.rectAreaLTC2=ie.LTC_FLOAT_2):(n.rectAreaLTC1=ie.LTC_HALF_1,n.rectAreaLTC2=ie.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=f;let I=n.hash;(I.directionalLength!==p||I.pointLength!==g||I.spotLength!==x||I.rectAreaLength!==m||I.hemiLength!==d||I.numDirectionalShadows!==E||I.numPointShadows!==b||I.numSpotShadows!==y||I.numSpotMaps!==U||I.numLightProbes!==C)&&(n.directional.length=p,n.spot.length=x,n.rectArea.length=m,n.point.length=g,n.hemi.length=d,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.pointShadow.length=b,n.pointShadowMap.length=b,n.spotShadow.length=y,n.spotShadowMap.length=y,n.directionalShadowMatrix.length=E,n.pointShadowMatrix.length=b,n.spotLightMatrix.length=y+U-R,n.spotLightMap.length=U,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=C,I.directionalLength=p,I.pointLength=g,I.spotLength=x,I.rectAreaLength=m,I.hemiLength=d,I.numDirectionalShadows=E,I.numPointShadows=b,I.numSpotShadows=y,I.numSpotMaps=U,I.numLightProbes=C,n.version=by++)}function c(l,u){let h=0,f=0,p=0,g=0,x=0,m=u.matrixWorldInverse;for(let d=0,E=l.length;d<E;d++){let b=l[d];if(b.isDirectionalLight){let y=n.directional[h];y.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),h++}else if(b.isSpotLight){let y=n.spot[p];y.position.setFromMatrixPosition(b.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),p++}else if(b.isRectAreaLight){let y=n.rectArea[g];y.position.setFromMatrixPosition(b.matrixWorld),y.position.applyMatrix4(m),o.identity(),r.copy(b.matrixWorld),r.premultiply(m),o.extractRotation(r),y.halfWidth.set(b.width*.5,0,0),y.halfHeight.set(0,b.height*.5,0),y.halfWidth.applyMatrix4(o),y.halfHeight.applyMatrix4(o),g++}else if(b.isPointLight){let y=n.point[f];y.position.setFromMatrixPosition(b.matrixWorld),y.position.applyMatrix4(m),f++}else if(b.isHemisphereLight){let y=n.hemi[x];y.direction.setFromMatrixPosition(b.matrixWorld),y.direction.transformDirection(m),x++}}}return{setup:a,setupView:c,state:n}}function Bf(i){let e=new Ty(i),t=[],n=[];function s(u){l.camera=u,t.length=0,n.length=0}function r(u){t.push(u)}function o(u){n.push(u)}function a(){e.setup(t)}function c(u){e.setupView(t,u)}let l={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:l,setupLights:a,setupLightsView:c,pushLight:r,pushShadow:o}}function wy(i){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new Bf(i),e.set(s,[a])):r>=o.length?(a=new Bf(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var kl=class extends hn{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=ym,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Vl=class extends hn{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},Ry=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Cy=`uniform sampler2D shadow_pass;
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
}`;function Iy(i,e,t){let n=new oo,s=new Le,r=new Le,o=new Oe,a=new kl({depthPacking:vm}),c=new Vl,l={},u=t.maxTextureSize,h={[Jn]:nn,[nn]:Jn,[tn]:tn},f=new sn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Le},radius:{value:4}},vertexShader:Ry,fragmentShader:Cy}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let g=new Zt;g.setAttribute("position",new bt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new Se(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=rd;let d=this.type;this.render=function(R,C,I){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||R.length===0)return;let S=i.getRenderTarget(),v=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),k=i.state;k.setBlending(Xi),k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);let B=d!==ui&&this.type===ui,G=d===ui&&this.type!==ui;for(let J=0,X=R.length;J<X;J++){let j=R[J],V=j.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",j,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);let ne=V.getFrameExtents();if(s.multiply(ne),r.copy(V.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/ne.x),s.x=r.x*ne.x,V.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/ne.y),s.y=r.y*ne.y,V.mapSize.y=r.y)),V.map===null||B===!0||G===!0){let we=this.type!==ui?{minFilter:Bt,magFilter:Bt}:{};V.map!==null&&V.map.dispose(),V.map=new xi(s.x,s.y,we),V.map.texture.name=j.name+".shadowMap",V.camera.updateProjectionMatrix()}i.setRenderTarget(V.map),i.clear();let fe=V.getViewportCount();for(let we=0;we<fe;we++){let qe=V.getViewport(we);o.set(r.x*qe.x,r.y*qe.y,r.x*qe.z,r.y*qe.w),k.viewport(o),V.updateMatrices(j,we),n=V.getFrustum(),y(C,I,V.camera,j,this.type)}V.isPointLightShadow!==!0&&this.type===ui&&E(V,I),V.needsUpdate=!1}d=this.type,m.needsUpdate=!1,i.setRenderTarget(S,v,P)};function E(R,C){let I=e.update(x);f.defines.VSM_SAMPLES!==R.blurSamples&&(f.defines.VSM_SAMPLES=R.blurSamples,p.defines.VSM_SAMPLES=R.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new xi(s.x,s.y)),f.uniforms.shadow_pass.value=R.map.texture,f.uniforms.resolution.value=R.mapSize,f.uniforms.radius.value=R.radius,i.setRenderTarget(R.mapPass),i.clear(),i.renderBufferDirect(C,null,I,f,x,null),p.uniforms.shadow_pass.value=R.mapPass.texture,p.uniforms.resolution.value=R.mapSize,p.uniforms.radius.value=R.radius,i.setRenderTarget(R.map),i.clear(),i.renderBufferDirect(C,null,I,p,x,null)}function b(R,C,I,S){let v=null,P=I.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(P!==void 0)v=P;else if(v=I.isPointLight===!0?c:a,i.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0){let k=v.uuid,B=C.uuid,G=l[k];G===void 0&&(G={},l[k]=G);let J=G[B];J===void 0&&(J=v.clone(),G[B]=J,C.addEventListener("dispose",U)),v=J}if(v.visible=C.visible,v.wireframe=C.wireframe,S===ui?v.side=C.shadowSide!==null?C.shadowSide:C.side:v.side=C.shadowSide!==null?C.shadowSide:h[C.side],v.alphaMap=C.alphaMap,v.alphaTest=C.alphaTest,v.map=C.map,v.clipShadows=C.clipShadows,v.clippingPlanes=C.clippingPlanes,v.clipIntersection=C.clipIntersection,v.displacementMap=C.displacementMap,v.displacementScale=C.displacementScale,v.displacementBias=C.displacementBias,v.wireframeLinewidth=C.wireframeLinewidth,v.linewidth=C.linewidth,I.isPointLight===!0&&v.isMeshDistanceMaterial===!0){let k=i.properties.get(v);k.light=I}return v}function y(R,C,I,S,v){if(R.visible===!1)return;if(R.layers.test(C.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&v===ui)&&(!R.frustumCulled||n.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,R.matrixWorld);let B=e.update(R),G=R.material;if(Array.isArray(G)){let J=B.groups;for(let X=0,j=J.length;X<j;X++){let V=J[X],ne=G[V.materialIndex];if(ne&&ne.visible){let fe=b(R,ne,S,v);R.onBeforeShadow(i,R,C,I,B,fe,V),i.renderBufferDirect(I,null,B,fe,R,V),R.onAfterShadow(i,R,C,I,B,fe,V)}}}else if(G.visible){let J=b(R,G,S,v);R.onBeforeShadow(i,R,C,I,B,J,null),i.renderBufferDirect(I,null,B,J,R,null),R.onAfterShadow(i,R,C,I,B,J,null)}}let k=R.children;for(let B=0,G=k.length;B<G;B++)y(k[B],C,I,S,v)}function U(R){R.target.removeEventListener("dispose",U);for(let I in l){let S=l[I],v=R.target.uuid;v in S&&(S[v].dispose(),delete S[v])}}}var Py={[Kc]:no,[Jc]:Qc,[$c]:el,[ir]:jc,[no]:Kc,[Qc]:Jc,[el]:$c,[jc]:ir};function Ly(i,e){function t(){let L=!1,se=new Oe,W=null,K=new Oe(0,0,0,0);return{setMask:function(le){W!==le&&!L&&(i.colorMask(le,le,le,le),W=le)},setLocked:function(le){L=le},setClear:function(le,ae,Ve,Ct,$t){$t===!0&&(le*=Ct,ae*=Ct,Ve*=Ct),se.set(le,ae,Ve,Ct),K.equals(se)===!1&&(i.clearColor(le,ae,Ve,Ct),K.copy(se))},reset:function(){L=!1,W=null,K.set(-1,0,0,0)}}}function n(){let L=!1,se=!1,W=null,K=null,le=null;return{setReversed:function(ae){if(se!==ae){let Ve=e.get("EXT_clip_control");se?Ve.clipControlEXT(Ve.LOWER_LEFT_EXT,Ve.ZERO_TO_ONE_EXT):Ve.clipControlEXT(Ve.LOWER_LEFT_EXT,Ve.NEGATIVE_ONE_TO_ONE_EXT);let Ct=le;le=null,this.setClear(Ct)}se=ae},getReversed:function(){return se},setTest:function(ae){ae?re(i.DEPTH_TEST):Ne(i.DEPTH_TEST)},setMask:function(ae){W!==ae&&!L&&(i.depthMask(ae),W=ae)},setFunc:function(ae){if(se&&(ae=Py[ae]),K!==ae){switch(ae){case Kc:i.depthFunc(i.NEVER);break;case no:i.depthFunc(i.ALWAYS);break;case Jc:i.depthFunc(i.LESS);break;case ir:i.depthFunc(i.LEQUAL);break;case $c:i.depthFunc(i.EQUAL);break;case jc:i.depthFunc(i.GEQUAL);break;case Qc:i.depthFunc(i.GREATER);break;case el:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}K=ae}},setLocked:function(ae){L=ae},setClear:function(ae){le!==ae&&(se&&(ae=1-ae),i.clearDepth(ae),le=ae)},reset:function(){L=!1,W=null,K=null,le=null,se=!1}}}function s(){let L=!1,se=null,W=null,K=null,le=null,ae=null,Ve=null,Ct=null,$t=null;return{setTest:function(ot){L||(ot?re(i.STENCIL_TEST):Ne(i.STENCIL_TEST))},setMask:function(ot){se!==ot&&!L&&(i.stencilMask(ot),se=ot)},setFunc:function(ot,Nn,ni){(W!==ot||K!==Nn||le!==ni)&&(i.stencilFunc(ot,Nn,ni),W=ot,K=Nn,le=ni)},setOp:function(ot,Nn,ni){(ae!==ot||Ve!==Nn||Ct!==ni)&&(i.stencilOp(ot,Nn,ni),ae=ot,Ve=Nn,Ct=ni)},setLocked:function(ot){L=ot},setClear:function(ot){$t!==ot&&(i.clearStencil(ot),$t=ot)},reset:function(){L=!1,se=null,W=null,K=null,le=null,ae=null,Ve=null,Ct=null,$t=null}}}let r=new t,o=new n,a=new s,c=new WeakMap,l=new WeakMap,u={},h={},f=new WeakMap,p=[],g=null,x=!1,m=null,d=null,E=null,b=null,y=null,U=null,R=null,C=new be(0,0,0),I=0,S=!1,v=null,P=null,k=null,B=null,G=null,J=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),X=!1,j=0,V=i.getParameter(i.VERSION);V.indexOf("WebGL")!==-1?(j=parseFloat(/^WebGL (\d)/.exec(V)[1]),X=j>=1):V.indexOf("OpenGL ES")!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),X=j>=2);let ne=null,fe={},we=i.getParameter(i.SCISSOR_BOX),qe=i.getParameter(i.VIEWPORT),dt=new Oe().fromArray(we),Y=new Oe().fromArray(qe);function te(L,se,W,K){let le=new Uint8Array(4),ae=i.createTexture();i.bindTexture(L,ae),i.texParameteri(L,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(L,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ve=0;Ve<W;Ve++)L===i.TEXTURE_3D||L===i.TEXTURE_2D_ARRAY?i.texImage3D(se,0,i.RGBA,1,1,K,0,i.RGBA,i.UNSIGNED_BYTE,le):i.texImage2D(se+Ve,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,le);return ae}let ye={};ye[i.TEXTURE_2D]=te(i.TEXTURE_2D,i.TEXTURE_2D,1),ye[i.TEXTURE_CUBE_MAP]=te(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),ye[i.TEXTURE_2D_ARRAY]=te(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),ye[i.TEXTURE_3D]=te(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),re(i.DEPTH_TEST),o.setFunc(ir),$e(!1),je(Vh),re(i.CULL_FACE),O(Xi);function re(L){u[L]!==!0&&(i.enable(L),u[L]=!0)}function Ne(L){u[L]!==!1&&(i.disable(L),u[L]=!1)}function ze(L,se){return h[L]!==se?(i.bindFramebuffer(L,se),h[L]=se,L===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=se),L===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=se),!0):!1}function Ye(L,se){let W=p,K=!1;if(L){W=f.get(se),W===void 0&&(W=[],f.set(se,W));let le=L.textures;if(W.length!==le.length||W[0]!==i.COLOR_ATTACHMENT0){for(let ae=0,Ve=le.length;ae<Ve;ae++)W[ae]=i.COLOR_ATTACHMENT0+ae;W.length=le.length,K=!0}}else W[0]!==i.BACK&&(W[0]=i.BACK,K=!0);K&&i.drawBuffers(W)}function Tt(L){return g!==L?(i.useProgram(L),g=L,!0):!1}let et={[ps]:i.FUNC_ADD,[Xp]:i.FUNC_SUBTRACT,[qp]:i.FUNC_REVERSE_SUBTRACT};et[Yp]=i.MIN,et[Zp]=i.MAX;let Pt={[Kp]:i.ZERO,[Jp]:i.ONE,[$p]:i.SRC_COLOR,[eo]:i.SRC_ALPHA,[im]:i.SRC_ALPHA_SATURATE,[tm]:i.DST_COLOR,[Qp]:i.DST_ALPHA,[jp]:i.ONE_MINUS_SRC_COLOR,[to]:i.ONE_MINUS_SRC_ALPHA,[nm]:i.ONE_MINUS_DST_COLOR,[em]:i.ONE_MINUS_DST_ALPHA,[sm]:i.CONSTANT_COLOR,[rm]:i.ONE_MINUS_CONSTANT_COLOR,[om]:i.CONSTANT_ALPHA,[am]:i.ONE_MINUS_CONSTANT_ALPHA};function O(L,se,W,K,le,ae,Ve,Ct,$t,ot){if(L===Xi){x===!0&&(Ne(i.BLEND),x=!1);return}if(x===!1&&(re(i.BLEND),x=!0),L!==au){if(L!==m||ot!==S){if((d!==ps||y!==ps)&&(i.blendEquation(i.FUNC_ADD),d=ps,y=ps),ot)switch(L){case qi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case $n:i.blendFunc(i.ONE,i.ONE);break;case Gh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Wh:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}else switch(L){case qi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case $n:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Gh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Wh:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}E=null,b=null,U=null,R=null,C.set(0,0,0),I=0,m=L,S=ot}return}le=le||se,ae=ae||W,Ve=Ve||K,(se!==d||le!==y)&&(i.blendEquationSeparate(et[se],et[le]),d=se,y=le),(W!==E||K!==b||ae!==U||Ve!==R)&&(i.blendFuncSeparate(Pt[W],Pt[K],Pt[ae],Pt[Ve]),E=W,b=K,U=ae,R=Ve),(Ct.equals(C)===!1||$t!==I)&&(i.blendColor(Ct.r,Ct.g,Ct.b,$t),C.copy(Ct),I=$t),m=L,S=!1}function En(L,se){L.side===tn?Ne(i.CULL_FACE):re(i.CULL_FACE);let W=L.side===nn;se&&(W=!W),$e(W),L.blending===qi&&L.transparent===!1?O(Xi):O(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),o.setFunc(L.depthFunc),o.setTest(L.depthTest),o.setMask(L.depthWrite),r.setMask(L.colorWrite);let K=L.stencilWrite;a.setTest(K),K&&(a.setMask(L.stencilWriteMask),a.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),a.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),vt(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?re(i.SAMPLE_ALPHA_TO_COVERAGE):Ne(i.SAMPLE_ALPHA_TO_COVERAGE)}function $e(L){v!==L&&(L?i.frontFace(i.CW):i.frontFace(i.CCW),v=L)}function je(L){L!==Gp?(re(i.CULL_FACE),L!==P&&(L===Vh?i.cullFace(i.BACK):L===Wp?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ne(i.CULL_FACE),P=L}function Pe(L){L!==k&&(X&&i.lineWidth(L),k=L)}function vt(L,se,W){L?(re(i.POLYGON_OFFSET_FILL),(B!==se||G!==W)&&(i.polygonOffset(se,W),B=se,G=W)):Ne(i.POLYGON_OFFSET_FILL)}function Ie(L){L?re(i.SCISSOR_TEST):Ne(i.SCISSOR_TEST)}function T(L){L===void 0&&(L=i.TEXTURE0+J-1),ne!==L&&(i.activeTexture(L),ne=L)}function _(L,se,W){W===void 0&&(ne===null?W=i.TEXTURE0+J-1:W=ne);let K=fe[W];K===void 0&&(K={type:void 0,texture:void 0},fe[W]=K),(K.type!==L||K.texture!==se)&&(ne!==W&&(i.activeTexture(W),ne=W),i.bindTexture(L,se||ye[L]),K.type=L,K.texture=se)}function F(){let L=fe[ne];L!==void 0&&L.type!==void 0&&(i.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function Z(){try{i.compressedTexImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function $(){try{i.compressedTexImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function q(){try{i.texSubImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ve(){try{i.texSubImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function oe(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function de(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function tt(){try{i.texStorage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Q(){try{i.texStorage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function pe(){try{i.texImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function De(){try{i.texImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ue(L){dt.equals(L)===!1&&(i.scissor(L.x,L.y,L.z,L.w),dt.copy(L))}function me(L){Y.equals(L)===!1&&(i.viewport(L.x,L.y,L.z,L.w),Y.copy(L))}function Qe(L,se){let W=l.get(se);W===void 0&&(W=new WeakMap,l.set(se,W));let K=W.get(L);K===void 0&&(K=i.getUniformBlockIndex(se,L.name),W.set(L,K))}function Xe(L,se){let K=l.get(se).get(L);c.get(se)!==K&&(i.uniformBlockBinding(se,K,L.__bindingPointIndex),c.set(se,K))}function xt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),u={},ne=null,fe={},h={},f=new WeakMap,p=[],g=null,x=!1,m=null,d=null,E=null,b=null,y=null,U=null,R=null,C=new be(0,0,0),I=0,S=!1,v=null,P=null,k=null,B=null,G=null,dt.set(0,0,i.canvas.width,i.canvas.height),Y.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:re,disable:Ne,bindFramebuffer:ze,drawBuffers:Ye,useProgram:Tt,setBlending:O,setMaterial:En,setFlipSided:$e,setCullFace:je,setLineWidth:Pe,setPolygonOffset:vt,setScissorTest:Ie,activeTexture:T,bindTexture:_,unbindTexture:F,compressedTexImage2D:Z,compressedTexImage3D:$,texImage2D:pe,texImage3D:De,updateUBOMapping:Qe,uniformBlockBinding:Xe,texStorage2D:tt,texStorage3D:Q,texSubImage2D:q,texSubImage3D:ve,compressedTexSubImage2D:oe,compressedTexSubImage3D:de,scissor:Ue,viewport:me,reset:xt}}function zf(i,e,t,n){let s=Dy(n);switch(t){case hd:return i*e;case dd:return i*e;case pd:return i*e*2;case du:return i*e/s.components*s.byteLength;case pu:return i*e/s.components*s.byteLength;case md:return i*e*2/s.components*s.byteLength;case mu:return i*e*2/s.components*s.byteLength;case fd:return i*e*3/s.components*s.byteLength;case Rn:return i*e*4/s.components*s.byteLength;case gu:return i*e*4/s.components*s.byteLength;case ua:case ha:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case fa:case da:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case sl:case ol:return Math.max(i,16)*Math.max(e,8)/4;case il:case rl:return Math.max(i,8)*Math.max(e,8)/2;case al:case cl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case ll:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ul:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case hl:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case fl:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case dl:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case pl:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case ml:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case gl:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case xl:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case _l:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case yl:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case vl:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Al:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Ml:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Sl:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case pa:case bl:case El:return Math.ceil(i/4)*Math.ceil(e/4)*16;case gd:case Tl:return Math.ceil(i/4)*Math.ceil(e/4)*8;case wl:case Rl:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Dy(i){switch(i){case mi:case cd:return{byteLength:1,components:1};case so:case ld:case _o:return{byteLength:2,components:1};case hu:case fu:return{byteLength:2,components:4};case xs:case uu:case Hn:return{byteLength:4,components:1};case ud:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function Ny(i,e,t,n,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Le,u=new WeakMap,h,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(T,_){return p?new OffscreenCanvas(T,_):ro("canvas")}function x(T,_,F){let Z=1,$=Ie(T);if(($.width>F||$.height>F)&&(Z=F/Math.max($.width,$.height)),Z<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){let q=Math.floor(Z*$.width),ve=Math.floor(Z*$.height);h===void 0&&(h=g(q,ve));let oe=_?g(q,ve):h;return oe.width=q,oe.height=ve,oe.getContext("2d").drawImage(T,0,0,q,ve),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+$.width+"x"+$.height+") to ("+q+"x"+ve+")."),oe}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+$.width+"x"+$.height+")."),T;return T}function m(T){return T.generateMipmaps}function d(T){i.generateMipmap(T)}function E(T){return T.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?i.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function b(T,_,F,Z,$=!1){if(T!==null){if(i[T]!==void 0)return i[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let q=_;if(_===i.RED&&(F===i.FLOAT&&(q=i.R32F),F===i.HALF_FLOAT&&(q=i.R16F),F===i.UNSIGNED_BYTE&&(q=i.R8)),_===i.RED_INTEGER&&(F===i.UNSIGNED_BYTE&&(q=i.R8UI),F===i.UNSIGNED_SHORT&&(q=i.R16UI),F===i.UNSIGNED_INT&&(q=i.R32UI),F===i.BYTE&&(q=i.R8I),F===i.SHORT&&(q=i.R16I),F===i.INT&&(q=i.R32I)),_===i.RG&&(F===i.FLOAT&&(q=i.RG32F),F===i.HALF_FLOAT&&(q=i.RG16F),F===i.UNSIGNED_BYTE&&(q=i.RG8)),_===i.RG_INTEGER&&(F===i.UNSIGNED_BYTE&&(q=i.RG8UI),F===i.UNSIGNED_SHORT&&(q=i.RG16UI),F===i.UNSIGNED_INT&&(q=i.RG32UI),F===i.BYTE&&(q=i.RG8I),F===i.SHORT&&(q=i.RG16I),F===i.INT&&(q=i.RG32I)),_===i.RGB_INTEGER&&(F===i.UNSIGNED_BYTE&&(q=i.RGB8UI),F===i.UNSIGNED_SHORT&&(q=i.RGB16UI),F===i.UNSIGNED_INT&&(q=i.RGB32UI),F===i.BYTE&&(q=i.RGB8I),F===i.SHORT&&(q=i.RGB16I),F===i.INT&&(q=i.RGB32I)),_===i.RGBA_INTEGER&&(F===i.UNSIGNED_BYTE&&(q=i.RGBA8UI),F===i.UNSIGNED_SHORT&&(q=i.RGBA16UI),F===i.UNSIGNED_INT&&(q=i.RGBA32UI),F===i.BYTE&&(q=i.RGBA8I),F===i.SHORT&&(q=i.RGBA16I),F===i.INT&&(q=i.RGBA32I)),_===i.RGB&&F===i.UNSIGNED_INT_5_9_9_9_REV&&(q=i.RGB9_E5),_===i.RGBA){let ve=$?Wa:Je.getTransfer(Z);F===i.FLOAT&&(q=i.RGBA32F),F===i.HALF_FLOAT&&(q=i.RGBA16F),F===i.UNSIGNED_BYTE&&(q=ve===ht?i.SRGB8_ALPHA8:i.RGBA8),F===i.UNSIGNED_SHORT_4_4_4_4&&(q=i.RGBA4),F===i.UNSIGNED_SHORT_5_5_5_1&&(q=i.RGB5_A1)}return(q===i.R16F||q===i.R32F||q===i.RG16F||q===i.RG32F||q===i.RGBA16F||q===i.RGBA32F)&&e.get("EXT_color_buffer_float"),q}function y(T,_){let F;return T?_===null||_===xs||_===or?F=i.DEPTH24_STENCIL8:_===Hn?F=i.DEPTH32F_STENCIL8:_===so&&(F=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===xs||_===or?F=i.DEPTH_COMPONENT24:_===Hn?F=i.DEPTH_COMPONENT32F:_===so&&(F=i.DEPTH_COMPONENT16),F}function U(T,_){return m(T)===!0||T.isFramebufferTexture&&T.minFilter!==Bt&&T.minFilter!==qt?Math.log2(Math.max(_.width,_.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?_.mipmaps.length:1}function R(T){let _=T.target;_.removeEventListener("dispose",R),I(_),_.isVideoTexture&&u.delete(_)}function C(T){let _=T.target;_.removeEventListener("dispose",C),v(_)}function I(T){let _=n.get(T);if(_.__webglInit===void 0)return;let F=T.source,Z=f.get(F);if(Z){let $=Z[_.__cacheKey];$.usedTimes--,$.usedTimes===0&&S(T),Object.keys(Z).length===0&&f.delete(F)}n.remove(T)}function S(T){let _=n.get(T);i.deleteTexture(_.__webglTexture);let F=T.source,Z=f.get(F);delete Z[_.__cacheKey],o.memory.textures--}function v(T){let _=n.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),n.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(_.__webglFramebuffer[Z]))for(let $=0;$<_.__webglFramebuffer[Z].length;$++)i.deleteFramebuffer(_.__webglFramebuffer[Z][$]);else i.deleteFramebuffer(_.__webglFramebuffer[Z]);_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer[Z])}else{if(Array.isArray(_.__webglFramebuffer))for(let Z=0;Z<_.__webglFramebuffer.length;Z++)i.deleteFramebuffer(_.__webglFramebuffer[Z]);else i.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&i.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let Z=0;Z<_.__webglColorRenderbuffer.length;Z++)_.__webglColorRenderbuffer[Z]&&i.deleteRenderbuffer(_.__webglColorRenderbuffer[Z]);_.__webglDepthRenderbuffer&&i.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let F=T.textures;for(let Z=0,$=F.length;Z<$;Z++){let q=n.get(F[Z]);q.__webglTexture&&(i.deleteTexture(q.__webglTexture),o.memory.textures--),n.remove(F[Z])}n.remove(T)}let P=0;function k(){P=0}function B(){let T=P;return T>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+s.maxTextures),P+=1,T}function G(T){let _=[];return _.push(T.wrapS),_.push(T.wrapT),_.push(T.wrapR||0),_.push(T.magFilter),_.push(T.minFilter),_.push(T.anisotropy),_.push(T.internalFormat),_.push(T.format),_.push(T.type),_.push(T.generateMipmaps),_.push(T.premultiplyAlpha),_.push(T.flipY),_.push(T.unpackAlignment),_.push(T.colorSpace),_.join()}function J(T,_){let F=n.get(T);if(T.isVideoTexture&&Pe(T),T.isRenderTargetTexture===!1&&T.version>0&&F.__version!==T.version){let Z=T.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(F,T,_);return}}t.bindTexture(i.TEXTURE_2D,F.__webglTexture,i.TEXTURE0+_)}function X(T,_){let F=n.get(T);if(T.version>0&&F.__version!==T.version){Y(F,T,_);return}t.bindTexture(i.TEXTURE_2D_ARRAY,F.__webglTexture,i.TEXTURE0+_)}function j(T,_){let F=n.get(T);if(T.version>0&&F.__version!==T.version){Y(F,T,_);return}t.bindTexture(i.TEXTURE_3D,F.__webglTexture,i.TEXTURE0+_)}function V(T,_){let F=n.get(T);if(T.version>0&&F.__version!==T.version){te(F,T,_);return}t.bindTexture(i.TEXTURE_CUBE_MAP,F.__webglTexture,i.TEXTURE0+_)}let ne={[jn]:i.REPEAT,[fi]:i.CLAMP_TO_EDGE,[io]:i.MIRRORED_REPEAT},fe={[Bt]:i.NEAREST,[lu]:i.NEAREST_MIPMAP_NEAREST,[Js]:i.NEAREST_MIPMAP_LINEAR,[qt]:i.LINEAR,[Jr]:i.LINEAR_MIPMAP_NEAREST,[Kn]:i.LINEAR_MIPMAP_LINEAR},we={[Mm]:i.NEVER,[Rm]:i.ALWAYS,[Sm]:i.LESS,[vd]:i.LEQUAL,[bm]:i.EQUAL,[wm]:i.GEQUAL,[Em]:i.GREATER,[Tm]:i.NOTEQUAL};function qe(T,_){if(_.type===Hn&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===qt||_.magFilter===Jr||_.magFilter===Js||_.magFilter===Kn||_.minFilter===qt||_.minFilter===Jr||_.minFilter===Js||_.minFilter===Kn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(T,i.TEXTURE_WRAP_S,ne[_.wrapS]),i.texParameteri(T,i.TEXTURE_WRAP_T,ne[_.wrapT]),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,ne[_.wrapR]),i.texParameteri(T,i.TEXTURE_MAG_FILTER,fe[_.magFilter]),i.texParameteri(T,i.TEXTURE_MIN_FILTER,fe[_.minFilter]),_.compareFunction&&(i.texParameteri(T,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(T,i.TEXTURE_COMPARE_FUNC,we[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===Bt||_.minFilter!==Js&&_.minFilter!==Kn||_.type===Hn&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||n.get(_).__currentAnisotropy){let F=e.get("EXT_texture_filter_anisotropic");i.texParameterf(T,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),n.get(_).__currentAnisotropy=_.anisotropy}}}function dt(T,_){let F=!1;T.__webglInit===void 0&&(T.__webglInit=!0,_.addEventListener("dispose",R));let Z=_.source,$=f.get(Z);$===void 0&&($={},f.set(Z,$));let q=G(_);if(q!==T.__cacheKey){$[q]===void 0&&($[q]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,F=!0),$[q].usedTimes++;let ve=$[T.__cacheKey];ve!==void 0&&($[T.__cacheKey].usedTimes--,ve.usedTimes===0&&S(_)),T.__cacheKey=q,T.__webglTexture=$[q].texture}return F}function Y(T,_,F){let Z=i.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(Z=i.TEXTURE_2D_ARRAY),_.isData3DTexture&&(Z=i.TEXTURE_3D);let $=dt(T,_),q=_.source;t.bindTexture(Z,T.__webglTexture,i.TEXTURE0+F);let ve=n.get(q);if(q.version!==ve.__version||$===!0){t.activeTexture(i.TEXTURE0+F);let oe=Je.getPrimaries(Je.workingColorSpace),de=_.colorSpace===gn?null:Je.getPrimaries(_.colorSpace),tt=_.colorSpace===gn||oe===de?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,tt);let Q=x(_.image,!1,s.maxTextureSize);Q=vt(_,Q);let pe=r.convert(_.format,_.colorSpace),De=r.convert(_.type),Ue=b(_.internalFormat,pe,De,_.colorSpace,_.isVideoTexture);qe(Z,_);let me,Qe=_.mipmaps,Xe=_.isVideoTexture!==!0,xt=ve.__version===void 0||$===!0,L=q.dataReady,se=U(_,Q);if(_.isDepthTexture)Ue=y(_.format===ar,_.type),xt&&(Xe?t.texStorage2D(i.TEXTURE_2D,1,Ue,Q.width,Q.height):t.texImage2D(i.TEXTURE_2D,0,Ue,Q.width,Q.height,0,pe,De,null));else if(_.isDataTexture)if(Qe.length>0){Xe&&xt&&t.texStorage2D(i.TEXTURE_2D,se,Ue,Qe[0].width,Qe[0].height);for(let W=0,K=Qe.length;W<K;W++)me=Qe[W],Xe?L&&t.texSubImage2D(i.TEXTURE_2D,W,0,0,me.width,me.height,pe,De,me.data):t.texImage2D(i.TEXTURE_2D,W,Ue,me.width,me.height,0,pe,De,me.data);_.generateMipmaps=!1}else Xe?(xt&&t.texStorage2D(i.TEXTURE_2D,se,Ue,Q.width,Q.height),L&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Q.width,Q.height,pe,De,Q.data)):t.texImage2D(i.TEXTURE_2D,0,Ue,Q.width,Q.height,0,pe,De,Q.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Xe&&xt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,se,Ue,Qe[0].width,Qe[0].height,Q.depth);for(let W=0,K=Qe.length;W<K;W++)if(me=Qe[W],_.format!==Rn)if(pe!==null)if(Xe){if(L)if(_.layerUpdates.size>0){let le=zf(me.width,me.height,_.format,_.type);for(let ae of _.layerUpdates){let Ve=me.data.subarray(ae*le/me.data.BYTES_PER_ELEMENT,(ae+1)*le/me.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,W,0,0,ae,me.width,me.height,1,pe,Ve)}_.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,W,0,0,0,me.width,me.height,Q.depth,pe,me.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,W,Ue,me.width,me.height,Q.depth,0,me.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Xe?L&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,W,0,0,0,me.width,me.height,Q.depth,pe,De,me.data):t.texImage3D(i.TEXTURE_2D_ARRAY,W,Ue,me.width,me.height,Q.depth,0,pe,De,me.data)}else{Xe&&xt&&t.texStorage2D(i.TEXTURE_2D,se,Ue,Qe[0].width,Qe[0].height);for(let W=0,K=Qe.length;W<K;W++)me=Qe[W],_.format!==Rn?pe!==null?Xe?L&&t.compressedTexSubImage2D(i.TEXTURE_2D,W,0,0,me.width,me.height,pe,me.data):t.compressedTexImage2D(i.TEXTURE_2D,W,Ue,me.width,me.height,0,me.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Xe?L&&t.texSubImage2D(i.TEXTURE_2D,W,0,0,me.width,me.height,pe,De,me.data):t.texImage2D(i.TEXTURE_2D,W,Ue,me.width,me.height,0,pe,De,me.data)}else if(_.isDataArrayTexture)if(Xe){if(xt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,se,Ue,Q.width,Q.height,Q.depth),L)if(_.layerUpdates.size>0){let W=zf(Q.width,Q.height,_.format,_.type);for(let K of _.layerUpdates){let le=Q.data.subarray(K*W/Q.data.BYTES_PER_ELEMENT,(K+1)*W/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,K,Q.width,Q.height,1,pe,De,le)}_.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,pe,De,Q.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Ue,Q.width,Q.height,Q.depth,0,pe,De,Q.data);else if(_.isData3DTexture)Xe?(xt&&t.texStorage3D(i.TEXTURE_3D,se,Ue,Q.width,Q.height,Q.depth),L&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,pe,De,Q.data)):t.texImage3D(i.TEXTURE_3D,0,Ue,Q.width,Q.height,Q.depth,0,pe,De,Q.data);else if(_.isFramebufferTexture){if(xt)if(Xe)t.texStorage2D(i.TEXTURE_2D,se,Ue,Q.width,Q.height);else{let W=Q.width,K=Q.height;for(let le=0;le<se;le++)t.texImage2D(i.TEXTURE_2D,le,Ue,W,K,0,pe,De,null),W>>=1,K>>=1}}else if(Qe.length>0){if(Xe&&xt){let W=Ie(Qe[0]);t.texStorage2D(i.TEXTURE_2D,se,Ue,W.width,W.height)}for(let W=0,K=Qe.length;W<K;W++)me=Qe[W],Xe?L&&t.texSubImage2D(i.TEXTURE_2D,W,0,0,pe,De,me):t.texImage2D(i.TEXTURE_2D,W,Ue,pe,De,me);_.generateMipmaps=!1}else if(Xe){if(xt){let W=Ie(Q);t.texStorage2D(i.TEXTURE_2D,se,Ue,W.width,W.height)}L&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,pe,De,Q)}else t.texImage2D(i.TEXTURE_2D,0,Ue,pe,De,Q);m(_)&&d(Z),ve.__version=q.version,_.onUpdate&&_.onUpdate(_)}T.__version=_.version}function te(T,_,F){if(_.image.length!==6)return;let Z=dt(T,_),$=_.source;t.bindTexture(i.TEXTURE_CUBE_MAP,T.__webglTexture,i.TEXTURE0+F);let q=n.get($);if($.version!==q.__version||Z===!0){t.activeTexture(i.TEXTURE0+F);let ve=Je.getPrimaries(Je.workingColorSpace),oe=_.colorSpace===gn?null:Je.getPrimaries(_.colorSpace),de=_.colorSpace===gn||ve===oe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,de);let tt=_.isCompressedTexture||_.image[0].isCompressedTexture,Q=_.image[0]&&_.image[0].isDataTexture,pe=[];for(let K=0;K<6;K++)!tt&&!Q?pe[K]=x(_.image[K],!0,s.maxCubemapSize):pe[K]=Q?_.image[K].image:_.image[K],pe[K]=vt(_,pe[K]);let De=pe[0],Ue=r.convert(_.format,_.colorSpace),me=r.convert(_.type),Qe=b(_.internalFormat,Ue,me,_.colorSpace),Xe=_.isVideoTexture!==!0,xt=q.__version===void 0||Z===!0,L=$.dataReady,se=U(_,De);qe(i.TEXTURE_CUBE_MAP,_);let W;if(tt){Xe&&xt&&t.texStorage2D(i.TEXTURE_CUBE_MAP,se,Qe,De.width,De.height);for(let K=0;K<6;K++){W=pe[K].mipmaps;for(let le=0;le<W.length;le++){let ae=W[le];_.format!==Rn?Ue!==null?Xe?L&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,le,0,0,ae.width,ae.height,Ue,ae.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,le,Qe,ae.width,ae.height,0,ae.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Xe?L&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,le,0,0,ae.width,ae.height,Ue,me,ae.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,le,Qe,ae.width,ae.height,0,Ue,me,ae.data)}}}else{if(W=_.mipmaps,Xe&&xt){W.length>0&&se++;let K=Ie(pe[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,se,Qe,K.width,K.height)}for(let K=0;K<6;K++)if(Q){Xe?L&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,pe[K].width,pe[K].height,Ue,me,pe[K].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Qe,pe[K].width,pe[K].height,0,Ue,me,pe[K].data);for(let le=0;le<W.length;le++){let Ve=W[le].image[K].image;Xe?L&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,le+1,0,0,Ve.width,Ve.height,Ue,me,Ve.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,le+1,Qe,Ve.width,Ve.height,0,Ue,me,Ve.data)}}else{Xe?L&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,Ue,me,pe[K]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Qe,Ue,me,pe[K]);for(let le=0;le<W.length;le++){let ae=W[le];Xe?L&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,le+1,0,0,Ue,me,ae.image[K]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,le+1,Qe,Ue,me,ae.image[K])}}}m(_)&&d(i.TEXTURE_CUBE_MAP),q.__version=$.version,_.onUpdate&&_.onUpdate(_)}T.__version=_.version}function ye(T,_,F,Z,$,q){let ve=r.convert(F.format,F.colorSpace),oe=r.convert(F.type),de=b(F.internalFormat,ve,oe,F.colorSpace),tt=n.get(_),Q=n.get(F);if(Q.__renderTarget=_,!tt.__hasExternalTextures){let pe=Math.max(1,_.width>>q),De=Math.max(1,_.height>>q);$===i.TEXTURE_3D||$===i.TEXTURE_2D_ARRAY?t.texImage3D($,q,de,pe,De,_.depth,0,ve,oe,null):t.texImage2D($,q,de,pe,De,0,ve,oe,null)}t.bindFramebuffer(i.FRAMEBUFFER,T),je(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Z,$,Q.__webglTexture,0,$e(_)):($===i.TEXTURE_2D||$>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,Z,$,Q.__webglTexture,q),t.bindFramebuffer(i.FRAMEBUFFER,null)}function re(T,_,F){if(i.bindRenderbuffer(i.RENDERBUFFER,T),_.depthBuffer){let Z=_.depthTexture,$=Z&&Z.isDepthTexture?Z.type:null,q=y(_.stencilBuffer,$),ve=_.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=$e(_);je(_)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,oe,q,_.width,_.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,oe,q,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,q,_.width,_.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ve,i.RENDERBUFFER,T)}else{let Z=_.textures;for(let $=0;$<Z.length;$++){let q=Z[$],ve=r.convert(q.format,q.colorSpace),oe=r.convert(q.type),de=b(q.internalFormat,ve,oe,q.colorSpace),tt=$e(_);F&&je(_)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,tt,de,_.width,_.height):je(_)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,tt,de,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,de,_.width,_.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ne(T,_){if(_&&_.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,T),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let Z=n.get(_.depthTexture);Z.__renderTarget=_,(!Z.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),J(_.depthTexture,0);let $=Z.__webglTexture,q=$e(_);if(_.depthTexture.format===er)je(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,$,0,q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,$,0);else if(_.depthTexture.format===ar)je(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,$,0,q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,$,0);else throw new Error("Unknown depthTexture format")}function ze(T){let _=n.get(T),F=T.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==T.depthTexture){let Z=T.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),Z){let $=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,Z.removeEventListener("dispose",$)};Z.addEventListener("dispose",$),_.__depthDisposeCallback=$}_.__boundDepthTexture=Z}if(T.depthTexture&&!_.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");Ne(_.__webglFramebuffer,T)}else if(F){_.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[Z]),_.__webglDepthbuffer[Z]===void 0)_.__webglDepthbuffer[Z]=i.createRenderbuffer(),re(_.__webglDepthbuffer[Z],T,!1);else{let $=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,q=_.__webglDepthbuffer[Z];i.bindRenderbuffer(i.RENDERBUFFER,q),i.framebufferRenderbuffer(i.FRAMEBUFFER,$,i.RENDERBUFFER,q)}}else if(t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=i.createRenderbuffer(),re(_.__webglDepthbuffer,T,!1);else{let Z=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,$=_.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,$),i.framebufferRenderbuffer(i.FRAMEBUFFER,Z,i.RENDERBUFFER,$)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ye(T,_,F){let Z=n.get(T);_!==void 0&&ye(Z.__webglFramebuffer,T,T.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),F!==void 0&&ze(T)}function Tt(T){let _=T.texture,F=n.get(T),Z=n.get(_);T.addEventListener("dispose",C);let $=T.textures,q=T.isWebGLCubeRenderTarget===!0,ve=$.length>1;if(ve||(Z.__webglTexture===void 0&&(Z.__webglTexture=i.createTexture()),Z.__version=_.version,o.memory.textures++),q){F.__webglFramebuffer=[];for(let oe=0;oe<6;oe++)if(_.mipmaps&&_.mipmaps.length>0){F.__webglFramebuffer[oe]=[];for(let de=0;de<_.mipmaps.length;de++)F.__webglFramebuffer[oe][de]=i.createFramebuffer()}else F.__webglFramebuffer[oe]=i.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){F.__webglFramebuffer=[];for(let oe=0;oe<_.mipmaps.length;oe++)F.__webglFramebuffer[oe]=i.createFramebuffer()}else F.__webglFramebuffer=i.createFramebuffer();if(ve)for(let oe=0,de=$.length;oe<de;oe++){let tt=n.get($[oe]);tt.__webglTexture===void 0&&(tt.__webglTexture=i.createTexture(),o.memory.textures++)}if(T.samples>0&&je(T)===!1){F.__webglMultisampledFramebuffer=i.createFramebuffer(),F.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let oe=0;oe<$.length;oe++){let de=$[oe];F.__webglColorRenderbuffer[oe]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,F.__webglColorRenderbuffer[oe]);let tt=r.convert(de.format,de.colorSpace),Q=r.convert(de.type),pe=b(de.internalFormat,tt,Q,de.colorSpace,T.isXRRenderTarget===!0),De=$e(T);i.renderbufferStorageMultisample(i.RENDERBUFFER,De,pe,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+oe,i.RENDERBUFFER,F.__webglColorRenderbuffer[oe])}i.bindRenderbuffer(i.RENDERBUFFER,null),T.depthBuffer&&(F.__webglDepthRenderbuffer=i.createRenderbuffer(),re(F.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(q){t.bindTexture(i.TEXTURE_CUBE_MAP,Z.__webglTexture),qe(i.TEXTURE_CUBE_MAP,_);for(let oe=0;oe<6;oe++)if(_.mipmaps&&_.mipmaps.length>0)for(let de=0;de<_.mipmaps.length;de++)ye(F.__webglFramebuffer[oe][de],T,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,de);else ye(F.__webglFramebuffer[oe],T,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0);m(_)&&d(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ve){for(let oe=0,de=$.length;oe<de;oe++){let tt=$[oe],Q=n.get(tt);t.bindTexture(i.TEXTURE_2D,Q.__webglTexture),qe(i.TEXTURE_2D,tt),ye(F.__webglFramebuffer,T,tt,i.COLOR_ATTACHMENT0+oe,i.TEXTURE_2D,0),m(tt)&&d(i.TEXTURE_2D)}t.unbindTexture()}else{let oe=i.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(oe=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(oe,Z.__webglTexture),qe(oe,_),_.mipmaps&&_.mipmaps.length>0)for(let de=0;de<_.mipmaps.length;de++)ye(F.__webglFramebuffer[de],T,_,i.COLOR_ATTACHMENT0,oe,de);else ye(F.__webglFramebuffer,T,_,i.COLOR_ATTACHMENT0,oe,0);m(_)&&d(oe),t.unbindTexture()}T.depthBuffer&&ze(T)}function et(T){let _=T.textures;for(let F=0,Z=_.length;F<Z;F++){let $=_[F];if(m($)){let q=E(T),ve=n.get($).__webglTexture;t.bindTexture(q,ve),d(q),t.unbindTexture()}}}let Pt=[],O=[];function En(T){if(T.samples>0){if(je(T)===!1){let _=T.textures,F=T.width,Z=T.height,$=i.COLOR_BUFFER_BIT,q=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ve=n.get(T),oe=_.length>1;if(oe)for(let de=0;de<_.length;de++)t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+de,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+de,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ve.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ve.__webglFramebuffer);for(let de=0;de<_.length;de++){if(T.resolveDepthBuffer&&(T.depthBuffer&&($|=i.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&($|=i.STENCIL_BUFFER_BIT)),oe){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ve.__webglColorRenderbuffer[de]);let tt=n.get(_[de]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,tt,0)}i.blitFramebuffer(0,0,F,Z,0,0,F,Z,$,i.NEAREST),c===!0&&(Pt.length=0,O.length=0,Pt.push(i.COLOR_ATTACHMENT0+de),T.depthBuffer&&T.resolveDepthBuffer===!1&&(Pt.push(q),O.push(q),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,O)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Pt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),oe)for(let de=0;de<_.length;de++){t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+de,i.RENDERBUFFER,ve.__webglColorRenderbuffer[de]);let tt=n.get(_[de]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+de,i.TEXTURE_2D,tt,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ve.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&c){let _=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[_])}}}function $e(T){return Math.min(s.maxSamples,T.samples)}function je(T){let _=n.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function Pe(T){let _=o.render.frame;u.get(T)!==_&&(u.set(T,_),T.update())}function vt(T,_){let F=T.colorSpace,Z=T.format,$=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||F!==rn&&F!==gn&&(Je.getTransfer(F)===ht?(Z!==Rn||$!==mi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",F)),_}function Ie(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(l.width=T.naturalWidth||T.width,l.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(l.width=T.displayWidth,l.height=T.displayHeight):(l.width=T.width,l.height=T.height),l}this.allocateTextureUnit=B,this.resetTextureUnits=k,this.setTexture2D=J,this.setTexture2DArray=X,this.setTexture3D=j,this.setTextureCube=V,this.rebindTextures=Ye,this.setupRenderTarget=Tt,this.updateRenderTargetMipmap=et,this.updateMultisampleRenderTarget=En,this.setupDepthRenderbuffer=ze,this.setupFrameBufferTexture=ye,this.useMultisampledRTT=je}function Uy(i,e){function t(n,s=gn){let r,o=Je.getTransfer(s);if(n===mi)return i.UNSIGNED_BYTE;if(n===hu)return i.UNSIGNED_SHORT_4_4_4_4;if(n===fu)return i.UNSIGNED_SHORT_5_5_5_1;if(n===ud)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===cd)return i.BYTE;if(n===ld)return i.SHORT;if(n===so)return i.UNSIGNED_SHORT;if(n===uu)return i.INT;if(n===xs)return i.UNSIGNED_INT;if(n===Hn)return i.FLOAT;if(n===_o)return i.HALF_FLOAT;if(n===hd)return i.ALPHA;if(n===fd)return i.RGB;if(n===Rn)return i.RGBA;if(n===dd)return i.LUMINANCE;if(n===pd)return i.LUMINANCE_ALPHA;if(n===er)return i.DEPTH_COMPONENT;if(n===ar)return i.DEPTH_STENCIL;if(n===du)return i.RED;if(n===pu)return i.RED_INTEGER;if(n===md)return i.RG;if(n===mu)return i.RG_INTEGER;if(n===gu)return i.RGBA_INTEGER;if(n===ua||n===ha||n===fa||n===da)if(o===ht)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===ua)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===ha)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===fa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===da)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===ua)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===ha)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===fa)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===da)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===il||n===sl||n===rl||n===ol)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===il)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===sl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===rl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ol)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===al||n===cl||n===ll)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===al||n===cl)return o===ht?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===ll)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===ul||n===hl||n===fl||n===dl||n===pl||n===ml||n===gl||n===xl||n===_l||n===yl||n===vl||n===Al||n===Ml||n===Sl)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===ul)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===hl)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===fl)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===dl)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===pl)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ml)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===gl)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===xl)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===_l)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===yl)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===vl)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Al)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Ml)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Sl)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===pa||n===bl||n===El)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===pa)return o===ht?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===bl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===El)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===gd||n===Tl||n===wl||n===Rl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===pa)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Tl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===wl)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Rl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===or?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var Gl=class extends Ft{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},It=class extends Et{constructor(){super(),this.isGroup=!0,this.type="Group"}},Oy={type:"move"},Qr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new It,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new It,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new w,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new w),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new It,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new w,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new w),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null,a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(let x of e.hand.values()){let m=t.getJointPose(x,n),d=this._getHandJoint(l,x);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}let u=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],f=u.position.distanceTo(h.position),p=.02,g=.005;l.inputState.pinching&&f>p+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&f<=p-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Oy)))}return a!==null&&(a.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new It;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Fy=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,By=`
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

}`,Wl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){let s=new zt,r=e.properties.get(s);r.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new sn({vertexShader:Fy,fragmentShader:By,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Se(new Nt(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Xl=class extends gi{constructor(e,t){super();let n=this,s=null,r=1,o=null,a="local-floor",c=1,l=null,u=null,h=null,f=null,p=null,g=null,x=new Wl,m=t.getContextAttributes(),d=null,E=null,b=[],y=[],U=new Le,R=null,C=new Ft;C.viewport=new Oe;let I=new Ft;I.viewport=new Oe;let S=[C,I],v=new Gl,P=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let te=b[Y];return te===void 0&&(te=new Qr,b[Y]=te),te.getTargetRaySpace()},this.getControllerGrip=function(Y){let te=b[Y];return te===void 0&&(te=new Qr,b[Y]=te),te.getGripSpace()},this.getHand=function(Y){let te=b[Y];return te===void 0&&(te=new Qr,b[Y]=te),te.getHandSpace()};function B(Y){let te=y.indexOf(Y.inputSource);if(te===-1)return;let ye=b[te];ye!==void 0&&(ye.update(Y.inputSource,Y.frame,l||o),ye.dispatchEvent({type:Y.type,data:Y.inputSource}))}function G(){s.removeEventListener("select",B),s.removeEventListener("selectstart",B),s.removeEventListener("selectend",B),s.removeEventListener("squeeze",B),s.removeEventListener("squeezestart",B),s.removeEventListener("squeezeend",B),s.removeEventListener("end",G),s.removeEventListener("inputsourceschange",J);for(let Y=0;Y<b.length;Y++){let te=y[Y];te!==null&&(y[Y]=null,b[Y].disconnect(te))}P=null,k=null,x.reset(),e.setRenderTarget(d),p=null,f=null,h=null,s=null,E=null,dt.stop(),n.isPresenting=!1,e.setPixelRatio(R),e.setSize(U.width,U.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){a=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(Y){l=Y},this.getBaseLayer=function(){return f!==null?f:p},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(d=e.getRenderTarget(),s.addEventListener("select",B),s.addEventListener("selectstart",B),s.addEventListener("selectend",B),s.addEventListener("squeeze",B),s.addEventListener("squeezestart",B),s.addEventListener("squeezeend",B),s.addEventListener("end",G),s.addEventListener("inputsourceschange",J),m.xrCompatible!==!0&&await t.makeXRCompatible(),R=e.getPixelRatio(),e.getSize(U),s.renderState.layers===void 0){let te={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,te),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),E=new xi(p.framebufferWidth,p.framebufferHeight,{format:Rn,type:mi,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let te=null,ye=null,re=null;m.depth&&(re=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,te=m.stencil?ar:er,ye=m.stencil?or:xs);let Ne={colorFormat:t.RGBA8,depthFormat:re,scaleFactor:r};h=new XRWebGLBinding(s,t),f=h.createProjectionLayer(Ne),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),E=new xi(f.textureWidth,f.textureHeight,{format:Rn,type:mi,depthTexture:new ba(f.textureWidth,f.textureHeight,ye,void 0,void 0,void 0,void 0,void 0,void 0,te),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}E.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await s.requestReferenceSpace(a),dt.setContext(s),dt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function J(Y){for(let te=0;te<Y.removed.length;te++){let ye=Y.removed[te],re=y.indexOf(ye);re>=0&&(y[re]=null,b[re].disconnect(ye))}for(let te=0;te<Y.added.length;te++){let ye=Y.added[te],re=y.indexOf(ye);if(re===-1){for(let ze=0;ze<b.length;ze++)if(ze>=y.length){y.push(ye),re=ze;break}else if(y[ze]===null){y[ze]=ye,re=ze;break}if(re===-1)break}let Ne=b[re];Ne&&Ne.connect(ye)}}let X=new w,j=new w;function V(Y,te,ye){X.setFromMatrixPosition(te.matrixWorld),j.setFromMatrixPosition(ye.matrixWorld);let re=X.distanceTo(j),Ne=te.projectionMatrix.elements,ze=ye.projectionMatrix.elements,Ye=Ne[14]/(Ne[10]-1),Tt=Ne[14]/(Ne[10]+1),et=(Ne[9]+1)/Ne[5],Pt=(Ne[9]-1)/Ne[5],O=(Ne[8]-1)/Ne[0],En=(ze[8]+1)/ze[0],$e=Ye*O,je=Ye*En,Pe=re/(-O+En),vt=Pe*-O;if(te.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(vt),Y.translateZ(Pe),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),Ne[10]===-1)Y.projectionMatrix.copy(te.projectionMatrix),Y.projectionMatrixInverse.copy(te.projectionMatrixInverse);else{let Ie=Ye+Pe,T=Tt+Pe,_=$e-vt,F=je+(re-vt),Z=et*Tt/T*Ie,$=Pt*Tt/T*Ie;Y.projectionMatrix.makePerspective(_,F,Z,$,Ie,T),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function ne(Y,te){te===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(te.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let te=Y.near,ye=Y.far;x.texture!==null&&(x.depthNear>0&&(te=x.depthNear),x.depthFar>0&&(ye=x.depthFar)),v.near=I.near=C.near=te,v.far=I.far=C.far=ye,(P!==v.near||k!==v.far)&&(s.updateRenderState({depthNear:v.near,depthFar:v.far}),P=v.near,k=v.far),C.layers.mask=Y.layers.mask|2,I.layers.mask=Y.layers.mask|4,v.layers.mask=C.layers.mask|I.layers.mask;let re=Y.parent,Ne=v.cameras;ne(v,re);for(let ze=0;ze<Ne.length;ze++)ne(Ne[ze],re);Ne.length===2?V(v,C,I):v.projectionMatrix.copy(C.projectionMatrix),fe(Y,v,re)};function fe(Y,te,ye){ye===null?Y.matrix.copy(te.matrixWorld):(Y.matrix.copy(ye.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(te.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(te.projectionMatrix),Y.projectionMatrixInverse.copy(te.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=ur*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return v},this.getFoveation=function(){if(!(f===null&&p===null))return c},this.setFoveation=function(Y){c=Y,f!==null&&(f.fixedFoveation=Y),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Y)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(v)};let we=null;function qe(Y,te){if(u=te.getViewerPose(l||o),g=te,u!==null){let ye=u.views;p!==null&&(e.setRenderTargetFramebuffer(E,p.framebuffer),e.setRenderTarget(E));let re=!1;ye.length!==v.cameras.length&&(v.cameras.length=0,re=!0);for(let ze=0;ze<ye.length;ze++){let Ye=ye[ze],Tt=null;if(p!==null)Tt=p.getViewport(Ye);else{let Pt=h.getViewSubImage(f,Ye);Tt=Pt.viewport,ze===0&&(e.setRenderTargetTextures(E,Pt.colorTexture,f.ignoreDepthValues?void 0:Pt.depthStencilTexture),e.setRenderTarget(E))}let et=S[ze];et===void 0&&(et=new Ft,et.layers.enable(ze),et.viewport=new Oe,S[ze]=et),et.matrix.fromArray(Ye.transform.matrix),et.matrix.decompose(et.position,et.quaternion,et.scale),et.projectionMatrix.fromArray(Ye.projectionMatrix),et.projectionMatrixInverse.copy(et.projectionMatrix).invert(),et.viewport.set(Tt.x,Tt.y,Tt.width,Tt.height),ze===0&&(v.matrix.copy(et.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale)),re===!0&&v.cameras.push(et)}let Ne=s.enabledFeatures;if(Ne&&Ne.includes("depth-sensing")){let ze=h.getDepthInformation(ye[0]);ze&&ze.isValid&&ze.texture&&x.init(e,ze,s.renderState)}}for(let ye=0;ye<b.length;ye++){let re=y[ye],Ne=b[ye];re!==null&&Ne!==void 0&&Ne.update(re,te,l||o)}we&&we(Y,te),te.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:te}),g=null}let dt=new Ed;dt.setAnimationLoop(qe),this.setAnimationLoop=function(Y){we=Y},this.dispose=function(){}}},fs=new Qn,zy=new Ee;function Hy(i,e){function t(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function n(m,d){d.color.getRGB(m.fogColor.value,bd(i)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function s(m,d,E,b,y){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(m,d):d.isMeshToonMaterial?(r(m,d),h(m,d)):d.isMeshPhongMaterial?(r(m,d),u(m,d)):d.isMeshStandardMaterial?(r(m,d),f(m,d),d.isMeshPhysicalMaterial&&p(m,d,y)):d.isMeshMatcapMaterial?(r(m,d),g(m,d)):d.isMeshDepthMaterial?r(m,d):d.isMeshDistanceMaterial?(r(m,d),x(m,d)):d.isMeshNormalMaterial?r(m,d):d.isLineBasicMaterial?(o(m,d),d.isLineDashedMaterial&&a(m,d)):d.isPointsMaterial?c(m,d,E,b):d.isSpriteMaterial?l(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,t(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===nn&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,t(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===nn&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,t(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,t(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);let E=e.get(d),b=E.envMap,y=E.envMapRotation;b&&(m.envMap.value=b,fs.copy(y),fs.x*=-1,fs.y*=-1,fs.z*=-1,b.isCubeTexture&&b.isRenderTargetTexture===!1&&(fs.y*=-1,fs.z*=-1),m.envMapRotation.value.setFromMatrix4(zy.makeRotationFromEuler(fs)),m.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,m.aoMapTransform))}function o(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform))}function a(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function c(m,d,E,b){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*E,m.scale.value=b*.5,d.map&&(m.map.value=d.map,t(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function l(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function u(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function h(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function f(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function p(m,d,E){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===nn&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=E.texture,m.transmissionSamplerSize.value.set(E.width,E.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,d){d.matcap&&(m.matcap.value=d.matcap)}function x(m,d){let E=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(E.matrixWorld),m.nearDistance.value=E.shadow.camera.near,m.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function ky(i,e,t,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(E,b){let y=b.program;n.uniformBlockBinding(E,y)}function l(E,b){let y=s[E.id];y===void 0&&(g(E),y=u(E),s[E.id]=y,E.addEventListener("dispose",m));let U=b.program;n.updateUBOMapping(E,U);let R=e.render.frame;r[E.id]!==R&&(f(E),r[E.id]=R)}function u(E){let b=h();E.__bindingPointIndex=b;let y=i.createBuffer(),U=E.__size,R=E.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,U,R),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,b,y),y}function h(){for(let E=0;E<a;E++)if(o.indexOf(E)===-1)return o.push(E),E;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(E){let b=s[E.id],y=E.uniforms,U=E.__cache;i.bindBuffer(i.UNIFORM_BUFFER,b);for(let R=0,C=y.length;R<C;R++){let I=Array.isArray(y[R])?y[R]:[y[R]];for(let S=0,v=I.length;S<v;S++){let P=I[S];if(p(P,R,S,U)===!0){let k=P.__offset,B=Array.isArray(P.value)?P.value:[P.value],G=0;for(let J=0;J<B.length;J++){let X=B[J],j=x(X);typeof X=="number"||typeof X=="boolean"?(P.__data[0]=X,i.bufferSubData(i.UNIFORM_BUFFER,k+G,P.__data)):X.isMatrix3?(P.__data[0]=X.elements[0],P.__data[1]=X.elements[1],P.__data[2]=X.elements[2],P.__data[3]=0,P.__data[4]=X.elements[3],P.__data[5]=X.elements[4],P.__data[6]=X.elements[5],P.__data[7]=0,P.__data[8]=X.elements[6],P.__data[9]=X.elements[7],P.__data[10]=X.elements[8],P.__data[11]=0):(X.toArray(P.__data,G),G+=j.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,k,P.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(E,b,y,U){let R=E.value,C=b+"_"+y;if(U[C]===void 0)return typeof R=="number"||typeof R=="boolean"?U[C]=R:U[C]=R.clone(),!0;{let I=U[C];if(typeof R=="number"||typeof R=="boolean"){if(I!==R)return U[C]=R,!0}else if(I.equals(R)===!1)return I.copy(R),!0}return!1}function g(E){let b=E.uniforms,y=0,U=16;for(let C=0,I=b.length;C<I;C++){let S=Array.isArray(b[C])?b[C]:[b[C]];for(let v=0,P=S.length;v<P;v++){let k=S[v],B=Array.isArray(k.value)?k.value:[k.value];for(let G=0,J=B.length;G<J;G++){let X=B[G],j=x(X),V=y%U,ne=V%j.boundary,fe=V+ne;y+=ne,fe!==0&&U-fe<j.storage&&(y+=U-fe),k.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),k.__offset=y,y+=j.storage}}}let R=y%U;return R>0&&(y+=U-R),E.__size=y,E.__cache={},this}function x(E){let b={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(b.boundary=4,b.storage=4):E.isVector2?(b.boundary=8,b.storage=8):E.isVector3||E.isColor?(b.boundary=16,b.storage=12):E.isVector4?(b.boundary=16,b.storage=16):E.isMatrix3?(b.boundary=48,b.storage=48):E.isMatrix4?(b.boundary=64,b.storage=64):E.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",E),b}function m(E){let b=E.target;b.removeEventListener("dispose",m);let y=o.indexOf(b.__bindingPointIndex);o.splice(y,1),i.deleteBuffer(s[b.id]),delete s[b.id],delete r[b.id]}function d(){for(let E in s)i.deleteBuffer(s[E]);o=[],s={},r={}}return{bind:c,update:l,dispose:d}}var Ea=class{constructor(e={}){let{canvas:t=Xm(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reverseDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=o;let g=new Uint32Array(4),x=new Int32Array(4),m=null,d=null,E=[],b=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=St,this.toneMapping=Yi,this.toneMappingExposure=1;let y=this,U=!1,R=0,C=0,I=null,S=-1,v=null,P=new Oe,k=new Oe,B=null,G=new be(0),J=0,X=t.width,j=t.height,V=1,ne=null,fe=null,we=new Oe(0,0,X,j),qe=new Oe(0,0,X,j),dt=!1,Y=new oo,te=!1,ye=!1,re=new Ee,Ne=new Ee,ze=new w,Ye=new Oe,Tt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},et=!1;function Pt(){return I===null?V:1}let O=n;function En(A,D){return t.getContext(A,D)}try{let A={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r170"),t.addEventListener("webglcontextlost",K,!1),t.addEventListener("webglcontextrestored",le,!1),t.addEventListener("webglcontextcreationerror",ae,!1),O===null){let D="webgl2";if(O=En(D,A),O===null)throw En(D)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(A){throw console.error("THREE.WebGLRenderer: "+A.message),A}let $e,je,Pe,vt,Ie,T,_,F,Z,$,q,ve,oe,de,tt,Q,pe,De,Ue,me,Qe,Xe,xt,L;function se(){$e=new i_(O),$e.init(),Xe=new Uy(O,$e),je=new $x(O,$e,e,Xe),Pe=new Ly(O,$e),je.reverseDepthBuffer&&f&&Pe.buffers.depth.setReversed(!0),vt=new o_(O),Ie=new yy,T=new Ny(O,$e,Pe,Ie,je,Xe,vt),_=new Qx(y),F=new n_(y),Z=new dg(O),xt=new Kx(O,Z),$=new s_(O,Z,vt,xt),q=new c_(O,$,Z,vt),Ue=new a_(O,je,T),Q=new jx(Ie),ve=new _y(y,_,F,$e,je,xt,Q),oe=new Hy(y,Ie),de=new Ay,tt=new wy($e),De=new Zx(y,_,F,Pe,q,p,c),pe=new Iy(y,q,je),L=new ky(O,vt,je,Pe),me=new Jx(O,$e,vt),Qe=new r_(O,$e,vt),vt.programs=ve.programs,y.capabilities=je,y.extensions=$e,y.properties=Ie,y.renderLists=de,y.shadowMap=pe,y.state=Pe,y.info=vt}se();let W=new Xl(y,O);this.xr=W,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){let A=$e.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){let A=$e.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return V},this.setPixelRatio=function(A){A!==void 0&&(V=A,this.setSize(X,j,!1))},this.getSize=function(A){return A.set(X,j)},this.setSize=function(A,D,z=!0){if(W.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}X=A,j=D,t.width=Math.floor(A*V),t.height=Math.floor(D*V),z===!0&&(t.style.width=A+"px",t.style.height=D+"px"),this.setViewport(0,0,A,D)},this.getDrawingBufferSize=function(A){return A.set(X*V,j*V).floor()},this.setDrawingBufferSize=function(A,D,z){X=A,j=D,V=z,t.width=Math.floor(A*z),t.height=Math.floor(D*z),this.setViewport(0,0,A,D)},this.getCurrentViewport=function(A){return A.copy(P)},this.getViewport=function(A){return A.copy(we)},this.setViewport=function(A,D,z,H){A.isVector4?we.set(A.x,A.y,A.z,A.w):we.set(A,D,z,H),Pe.viewport(P.copy(we).multiplyScalar(V).round())},this.getScissor=function(A){return A.copy(qe)},this.setScissor=function(A,D,z,H){A.isVector4?qe.set(A.x,A.y,A.z,A.w):qe.set(A,D,z,H),Pe.scissor(k.copy(qe).multiplyScalar(V).round())},this.getScissorTest=function(){return dt},this.setScissorTest=function(A){Pe.setScissorTest(dt=A)},this.setOpaqueSort=function(A){ne=A},this.setTransparentSort=function(A){fe=A},this.getClearColor=function(A){return A.copy(De.getClearColor())},this.setClearColor=function(){De.setClearColor.apply(De,arguments)},this.getClearAlpha=function(){return De.getClearAlpha()},this.setClearAlpha=function(){De.setClearAlpha.apply(De,arguments)},this.clear=function(A=!0,D=!0,z=!0){let H=0;if(A){let N=!1;if(I!==null){let ee=I.texture.format;N=ee===gu||ee===mu||ee===pu}if(N){let ee=I.texture.type,ce=ee===mi||ee===xs||ee===so||ee===or||ee===hu||ee===fu,ge=De.getClearColor(),xe=De.getClearAlpha(),Fe=ge.r,Ge=ge.g,_e=ge.b;ce?(g[0]=Fe,g[1]=Ge,g[2]=_e,g[3]=xe,O.clearBufferuiv(O.COLOR,0,g)):(x[0]=Fe,x[1]=Ge,x[2]=_e,x[3]=xe,O.clearBufferiv(O.COLOR,0,x))}else H|=O.COLOR_BUFFER_BIT}D&&(H|=O.DEPTH_BUFFER_BIT),z&&(H|=O.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),O.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",K,!1),t.removeEventListener("webglcontextrestored",le,!1),t.removeEventListener("webglcontextcreationerror",ae,!1),de.dispose(),tt.dispose(),Ie.dispose(),_.dispose(),F.dispose(),q.dispose(),xt.dispose(),L.dispose(),ve.dispose(),W.dispose(),W.removeEventListener("sessionstart",Nh),W.removeEventListener("sessionend",Uh),os.stop()};function K(A){A.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),U=!0}function le(){console.log("THREE.WebGLRenderer: Context Restored."),U=!1;let A=vt.autoReset,D=pe.enabled,z=pe.autoUpdate,H=pe.needsUpdate,N=pe.type;se(),vt.autoReset=A,pe.enabled=D,pe.autoUpdate=z,pe.needsUpdate=H,pe.type=N}function ae(A){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function Ve(A){let D=A.target;D.removeEventListener("dispose",Ve),Ct(D)}function Ct(A){$t(A),Ie.remove(A)}function $t(A){let D=Ie.get(A).programs;D!==void 0&&(D.forEach(function(z){ve.releaseProgram(z)}),A.isShaderMaterial&&ve.releaseShaderCache(A))}this.renderBufferDirect=function(A,D,z,H,N,ee){D===null&&(D=Tt);let ce=N.isMesh&&N.matrixWorld.determinant()<0,ge=Hp(A,D,z,H,N);Pe.setMaterial(H,ce);let xe=z.index,Fe=1;if(H.wireframe===!0){if(xe=$.getWireframeAttribute(z),xe===void 0)return;Fe=2}let Ge=z.drawRange,_e=z.attributes.position,nt=Ge.start*Fe,_t=(Ge.start+Ge.count)*Fe;ee!==null&&(nt=Math.max(nt,ee.start*Fe),_t=Math.min(_t,(ee.start+ee.count)*Fe)),xe!==null?(nt=Math.max(nt,0),_t=Math.min(_t,xe.count)):_e!=null&&(nt=Math.max(nt,0),_t=Math.min(_t,_e.count));let At=_t-nt;if(At<0||At===1/0)return;xt.setup(N,H,ge,z,xe);let mn,st=me;if(xe!==null&&(mn=Z.get(xe),st=Qe,st.setIndex(mn)),N.isMesh)H.wireframe===!0?(Pe.setLineWidth(H.wireframeLinewidth*Pt()),st.setMode(O.LINES)):st.setMode(O.TRIANGLES);else if(N.isLine){let Ae=H.linewidth;Ae===void 0&&(Ae=1),Pe.setLineWidth(Ae*Pt()),N.isLineSegments?st.setMode(O.LINES):N.isLineLoop?st.setMode(O.LINE_LOOP):st.setMode(O.LINE_STRIP)}else N.isPoints?st.setMode(O.POINTS):N.isSprite&&st.setMode(O.TRIANGLES);if(N.isBatchedMesh)if(N._multiDrawInstances!==null)st.renderMultiDrawInstances(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount,N._multiDrawInstances);else if($e.get("WEBGL_multi_draw"))st.renderMultiDraw(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount);else{let Ae=N._multiDrawStarts,ii=N._multiDrawCounts,rt=N._multiDrawCount,Un=xe?Z.get(xe).bytesPerElement:1,Is=Ie.get(H).currentProgram.getUniforms();for(let _n=0;_n<rt;_n++)Is.setValue(O,"_gl_DrawID",_n),st.render(Ae[_n]/Un,ii[_n])}else if(N.isInstancedMesh)st.renderInstances(nt,At,N.count);else if(z.isInstancedBufferGeometry){let Ae=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,ii=Math.min(z.instanceCount,Ae);st.renderInstances(nt,At,ii)}else st.render(nt,At)};function ot(A,D,z){A.transparent===!0&&A.side===tn&&A.forceSinglePass===!1?(A.side=nn,A.needsUpdate=!0,No(A,D,z),A.side=Jn,A.needsUpdate=!0,No(A,D,z),A.side=tn):No(A,D,z)}this.compile=function(A,D,z=null){z===null&&(z=A),d=tt.get(z),d.init(D),b.push(d),z.traverseVisible(function(N){N.isLight&&N.layers.test(D.layers)&&(d.pushLight(N),N.castShadow&&d.pushShadow(N))}),A!==z&&A.traverseVisible(function(N){N.isLight&&N.layers.test(D.layers)&&(d.pushLight(N),N.castShadow&&d.pushShadow(N))}),d.setupLights();let H=new Set;return A.traverse(function(N){if(!(N.isMesh||N.isPoints||N.isLine||N.isSprite))return;let ee=N.material;if(ee)if(Array.isArray(ee))for(let ce=0;ce<ee.length;ce++){let ge=ee[ce];ot(ge,z,N),H.add(ge)}else ot(ee,z,N),H.add(ee)}),b.pop(),d=null,H},this.compileAsync=function(A,D,z=null){let H=this.compile(A,D,z);return new Promise(N=>{function ee(){if(H.forEach(function(ce){Ie.get(ce).currentProgram.isReady()&&H.delete(ce)}),H.size===0){N(A);return}setTimeout(ee,10)}$e.get("KHR_parallel_shader_compile")!==null?ee():setTimeout(ee,10)})};let Nn=null;function ni(A){Nn&&Nn(A)}function Nh(){os.stop()}function Uh(){os.start()}let os=new Ed;os.setAnimationLoop(ni),typeof self<"u"&&os.setContext(self),this.setAnimationLoop=function(A){Nn=A,W.setAnimationLoop(A),A===null?os.stop():os.start()},W.addEventListener("sessionstart",Nh),W.addEventListener("sessionend",Uh),this.render=function(A,D){if(D!==void 0&&D.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(U===!0)return;if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),W.enabled===!0&&W.isPresenting===!0&&(W.cameraAutoUpdate===!0&&W.updateCamera(D),D=W.getCamera()),A.isScene===!0&&A.onBeforeRender(y,A,D,I),d=tt.get(A,b.length),d.init(D),b.push(d),Ne.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),Y.setFromProjectionMatrix(Ne),ye=this.localClippingEnabled,te=Q.init(this.clippingPlanes,ye),m=de.get(A,E.length),m.init(),E.push(m),W.enabled===!0&&W.isPresenting===!0){let ee=y.xr.getDepthSensingMesh();ee!==null&&mc(ee,D,-1/0,y.sortObjects)}mc(A,D,0,y.sortObjects),m.finish(),y.sortObjects===!0&&m.sort(ne,fe),et=W.enabled===!1||W.isPresenting===!1||W.hasDepthSensing()===!1,et&&De.addToRenderList(m,A),this.info.render.frame++,te===!0&&Q.beginShadows();let z=d.state.shadowsArray;pe.render(z,A,D),te===!0&&Q.endShadows(),this.info.autoReset===!0&&this.info.reset();let H=m.opaque,N=m.transmissive;if(d.setupLights(),D.isArrayCamera){let ee=D.cameras;if(N.length>0)for(let ce=0,ge=ee.length;ce<ge;ce++){let xe=ee[ce];Fh(H,N,A,xe)}et&&De.render(A);for(let ce=0,ge=ee.length;ce<ge;ce++){let xe=ee[ce];Oh(m,A,xe,xe.viewport)}}else N.length>0&&Fh(H,N,A,D),et&&De.render(A),Oh(m,A,D);I!==null&&(T.updateMultisampleRenderTarget(I),T.updateRenderTargetMipmap(I)),A.isScene===!0&&A.onAfterRender(y,A,D),xt.resetDefaultState(),S=-1,v=null,b.pop(),b.length>0?(d=b[b.length-1],te===!0&&Q.setGlobalState(y.clippingPlanes,d.state.camera)):d=null,E.pop(),E.length>0?m=E[E.length-1]:m=null};function mc(A,D,z,H){if(A.visible===!1)return;if(A.layers.test(D.layers)){if(A.isGroup)z=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(D);else if(A.isLight)d.pushLight(A),A.castShadow&&d.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||Y.intersectsSprite(A)){H&&Ye.setFromMatrixPosition(A.matrixWorld).applyMatrix4(Ne);let ce=q.update(A),ge=A.material;ge.visible&&m.push(A,ce,ge,z,Ye.z,null)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||Y.intersectsObject(A))){let ce=q.update(A),ge=A.material;if(H&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),Ye.copy(A.boundingSphere.center)):(ce.boundingSphere===null&&ce.computeBoundingSphere(),Ye.copy(ce.boundingSphere.center)),Ye.applyMatrix4(A.matrixWorld).applyMatrix4(Ne)),Array.isArray(ge)){let xe=ce.groups;for(let Fe=0,Ge=xe.length;Fe<Ge;Fe++){let _e=xe[Fe],nt=ge[_e.materialIndex];nt&&nt.visible&&m.push(A,ce,nt,z,Ye.z,_e)}}else ge.visible&&m.push(A,ce,ge,z,Ye.z,null)}}let ee=A.children;for(let ce=0,ge=ee.length;ce<ge;ce++)mc(ee[ce],D,z,H)}function Oh(A,D,z,H){let N=A.opaque,ee=A.transmissive,ce=A.transparent;d.setupLightsView(z),te===!0&&Q.setGlobalState(y.clippingPlanes,z),H&&Pe.viewport(P.copy(H)),N.length>0&&Do(N,D,z),ee.length>0&&Do(ee,D,z),ce.length>0&&Do(ce,D,z),Pe.buffers.depth.setTest(!0),Pe.buffers.depth.setMask(!0),Pe.buffers.color.setMask(!0),Pe.setPolygonOffset(!1)}function Fh(A,D,z,H){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[H.id]===void 0&&(d.state.transmissionRenderTarget[H.id]=new xi(1,1,{generateMipmaps:!0,type:$e.has("EXT_color_buffer_half_float")||$e.has("EXT_color_buffer_float")?_o:mi,minFilter:Kn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Je.workingColorSpace}));let ee=d.state.transmissionRenderTarget[H.id],ce=H.viewport||P;ee.setSize(ce.z,ce.w);let ge=y.getRenderTarget();y.setRenderTarget(ee),y.getClearColor(G),J=y.getClearAlpha(),J<1&&y.setClearColor(16777215,.5),y.clear(),et&&De.render(z);let xe=y.toneMapping;y.toneMapping=Yi;let Fe=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),d.setupLightsView(H),te===!0&&Q.setGlobalState(y.clippingPlanes,H),Do(A,z,H),T.updateMultisampleRenderTarget(ee),T.updateRenderTargetMipmap(ee),$e.has("WEBGL_multisampled_render_to_texture")===!1){let Ge=!1;for(let _e=0,nt=D.length;_e<nt;_e++){let _t=D[_e],At=_t.object,mn=_t.geometry,st=_t.material,Ae=_t.group;if(st.side===tn&&At.layers.test(H.layers)){let ii=st.side;st.side=nn,st.needsUpdate=!0,Bh(At,z,H,mn,st,Ae),st.side=ii,st.needsUpdate=!0,Ge=!0}}Ge===!0&&(T.updateMultisampleRenderTarget(ee),T.updateRenderTargetMipmap(ee))}y.setRenderTarget(ge),y.setClearColor(G,J),Fe!==void 0&&(H.viewport=Fe),y.toneMapping=xe}function Do(A,D,z){let H=D.isScene===!0?D.overrideMaterial:null;for(let N=0,ee=A.length;N<ee;N++){let ce=A[N],ge=ce.object,xe=ce.geometry,Fe=H===null?ce.material:H,Ge=ce.group;ge.layers.test(z.layers)&&Bh(ge,D,z,xe,Fe,Ge)}}function Bh(A,D,z,H,N,ee){A.onBeforeRender(y,D,z,H,N,ee),A.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),N.onBeforeRender(y,D,z,H,A,ee),N.transparent===!0&&N.side===tn&&N.forceSinglePass===!1?(N.side=nn,N.needsUpdate=!0,y.renderBufferDirect(z,D,H,N,A,ee),N.side=Jn,N.needsUpdate=!0,y.renderBufferDirect(z,D,H,N,A,ee),N.side=tn):y.renderBufferDirect(z,D,H,N,A,ee),A.onAfterRender(y,D,z,H,N,ee)}function No(A,D,z){D.isScene!==!0&&(D=Tt);let H=Ie.get(A),N=d.state.lights,ee=d.state.shadowsArray,ce=N.state.version,ge=ve.getParameters(A,N.state,ee,D,z),xe=ve.getProgramCacheKey(ge),Fe=H.programs;H.environment=A.isMeshStandardMaterial?D.environment:null,H.fog=D.fog,H.envMap=(A.isMeshStandardMaterial?F:_).get(A.envMap||H.environment),H.envMapRotation=H.environment!==null&&A.envMap===null?D.environmentRotation:A.envMapRotation,Fe===void 0&&(A.addEventListener("dispose",Ve),Fe=new Map,H.programs=Fe);let Ge=Fe.get(xe);if(Ge!==void 0){if(H.currentProgram===Ge&&H.lightsStateVersion===ce)return Hh(A,ge),Ge}else ge.uniforms=ve.getUniforms(A),A.onBeforeCompile(ge,y),Ge=ve.acquireProgram(ge,xe),Fe.set(xe,Ge),H.uniforms=ge.uniforms;let _e=H.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(_e.clippingPlanes=Q.uniform),Hh(A,ge),H.needsLights=Vp(A),H.lightsStateVersion=ce,H.needsLights&&(_e.ambientLightColor.value=N.state.ambient,_e.lightProbe.value=N.state.probe,_e.directionalLights.value=N.state.directional,_e.directionalLightShadows.value=N.state.directionalShadow,_e.spotLights.value=N.state.spot,_e.spotLightShadows.value=N.state.spotShadow,_e.rectAreaLights.value=N.state.rectArea,_e.ltc_1.value=N.state.rectAreaLTC1,_e.ltc_2.value=N.state.rectAreaLTC2,_e.pointLights.value=N.state.point,_e.pointLightShadows.value=N.state.pointShadow,_e.hemisphereLights.value=N.state.hemi,_e.directionalShadowMap.value=N.state.directionalShadowMap,_e.directionalShadowMatrix.value=N.state.directionalShadowMatrix,_e.spotShadowMap.value=N.state.spotShadowMap,_e.spotLightMatrix.value=N.state.spotLightMatrix,_e.spotLightMap.value=N.state.spotLightMap,_e.pointShadowMap.value=N.state.pointShadowMap,_e.pointShadowMatrix.value=N.state.pointShadowMatrix),H.currentProgram=Ge,H.uniformsList=null,Ge}function zh(A){if(A.uniformsList===null){let D=A.currentProgram.getUniforms();A.uniformsList=nr.seqWithValue(D.seq,A.uniforms)}return A.uniformsList}function Hh(A,D){let z=Ie.get(A);z.outputColorSpace=D.outputColorSpace,z.batching=D.batching,z.batchingColor=D.batchingColor,z.instancing=D.instancing,z.instancingColor=D.instancingColor,z.instancingMorph=D.instancingMorph,z.skinning=D.skinning,z.morphTargets=D.morphTargets,z.morphNormals=D.morphNormals,z.morphColors=D.morphColors,z.morphTargetsCount=D.morphTargetsCount,z.numClippingPlanes=D.numClippingPlanes,z.numIntersection=D.numClipIntersection,z.vertexAlphas=D.vertexAlphas,z.vertexTangents=D.vertexTangents,z.toneMapping=D.toneMapping}function Hp(A,D,z,H,N){D.isScene!==!0&&(D=Tt),T.resetTextureUnits();let ee=D.fog,ce=H.isMeshStandardMaterial?D.environment:null,ge=I===null?y.outputColorSpace:I.isXRRenderTarget===!0?I.texture.colorSpace:rn,xe=(H.isMeshStandardMaterial?F:_).get(H.envMap||ce),Fe=H.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,Ge=!!z.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),_e=!!z.morphAttributes.position,nt=!!z.morphAttributes.normal,_t=!!z.morphAttributes.color,At=Yi;H.toneMapped&&(I===null||I.isXRRenderTarget===!0)&&(At=y.toneMapping);let mn=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,st=mn!==void 0?mn.length:0,Ae=Ie.get(H),ii=d.state.lights;if(te===!0&&(ye===!0||A!==v)){let Tn=A===v&&H.id===S;Q.setState(H,A,Tn)}let rt=!1;H.version===Ae.__version?(Ae.needsLights&&Ae.lightsStateVersion!==ii.state.version||Ae.outputColorSpace!==ge||N.isBatchedMesh&&Ae.batching===!1||!N.isBatchedMesh&&Ae.batching===!0||N.isBatchedMesh&&Ae.batchingColor===!0&&N.colorTexture===null||N.isBatchedMesh&&Ae.batchingColor===!1&&N.colorTexture!==null||N.isInstancedMesh&&Ae.instancing===!1||!N.isInstancedMesh&&Ae.instancing===!0||N.isSkinnedMesh&&Ae.skinning===!1||!N.isSkinnedMesh&&Ae.skinning===!0||N.isInstancedMesh&&Ae.instancingColor===!0&&N.instanceColor===null||N.isInstancedMesh&&Ae.instancingColor===!1&&N.instanceColor!==null||N.isInstancedMesh&&Ae.instancingMorph===!0&&N.morphTexture===null||N.isInstancedMesh&&Ae.instancingMorph===!1&&N.morphTexture!==null||Ae.envMap!==xe||H.fog===!0&&Ae.fog!==ee||Ae.numClippingPlanes!==void 0&&(Ae.numClippingPlanes!==Q.numPlanes||Ae.numIntersection!==Q.numIntersection)||Ae.vertexAlphas!==Fe||Ae.vertexTangents!==Ge||Ae.morphTargets!==_e||Ae.morphNormals!==nt||Ae.morphColors!==_t||Ae.toneMapping!==At||Ae.morphTargetsCount!==st)&&(rt=!0):(rt=!0,Ae.__version=H.version);let Un=Ae.currentProgram;rt===!0&&(Un=No(H,D,N));let Is=!1,_n=!1,Ur=!1,Mt=Un.getUniforms(),Yn=Ae.uniforms;if(Pe.useProgram(Un.program)&&(Is=!0,_n=!0,Ur=!0),H.id!==S&&(S=H.id,_n=!0),Is||v!==A){Pe.buffers.depth.getReversed()?(re.copy(A.projectionMatrix),Ym(re),Zm(re),Mt.setValue(O,"projectionMatrix",re)):Mt.setValue(O,"projectionMatrix",A.projectionMatrix),Mt.setValue(O,"viewMatrix",A.matrixWorldInverse);let Ui=Mt.map.cameraPosition;Ui!==void 0&&Ui.setValue(O,ze.setFromMatrixPosition(A.matrixWorld)),je.logarithmicDepthBuffer&&Mt.setValue(O,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&Mt.setValue(O,"isOrthographic",A.isOrthographicCamera===!0),v!==A&&(v=A,_n=!0,Ur=!0)}if(N.isSkinnedMesh){Mt.setOptional(O,N,"bindMatrix"),Mt.setOptional(O,N,"bindMatrixInverse");let Tn=N.skeleton;Tn&&(Tn.boneTexture===null&&Tn.computeBoneTexture(),Mt.setValue(O,"boneTexture",Tn.boneTexture,T))}N.isBatchedMesh&&(Mt.setOptional(O,N,"batchingTexture"),Mt.setValue(O,"batchingTexture",N._matricesTexture,T),Mt.setOptional(O,N,"batchingIdTexture"),Mt.setValue(O,"batchingIdTexture",N._indirectTexture,T),Mt.setOptional(O,N,"batchingColorTexture"),N._colorsTexture!==null&&Mt.setValue(O,"batchingColorTexture",N._colorsTexture,T));let Or=z.morphAttributes;if((Or.position!==void 0||Or.normal!==void 0||Or.color!==void 0)&&Ue.update(N,z,Un),(_n||Ae.receiveShadow!==N.receiveShadow)&&(Ae.receiveShadow=N.receiveShadow,Mt.setValue(O,"receiveShadow",N.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(Yn.envMap.value=xe,Yn.flipEnvMap.value=xe.isCubeTexture&&xe.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&D.environment!==null&&(Yn.envMapIntensity.value=D.environmentIntensity),_n&&(Mt.setValue(O,"toneMappingExposure",y.toneMappingExposure),Ae.needsLights&&kp(Yn,Ur),ee&&H.fog===!0&&oe.refreshFogUniforms(Yn,ee),oe.refreshMaterialUniforms(Yn,H,V,j,d.state.transmissionRenderTarget[A.id]),nr.upload(O,zh(Ae),Yn,T)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(nr.upload(O,zh(Ae),Yn,T),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&Mt.setValue(O,"center",N.center),Mt.setValue(O,"modelViewMatrix",N.modelViewMatrix),Mt.setValue(O,"normalMatrix",N.normalMatrix),Mt.setValue(O,"modelMatrix",N.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){let Tn=H.uniformsGroups;for(let Ui=0,Oi=Tn.length;Ui<Oi;Ui++){let kh=Tn[Ui];L.update(kh,Un),L.bind(kh,Un)}}return Un}function kp(A,D){A.ambientLightColor.needsUpdate=D,A.lightProbe.needsUpdate=D,A.directionalLights.needsUpdate=D,A.directionalLightShadows.needsUpdate=D,A.pointLights.needsUpdate=D,A.pointLightShadows.needsUpdate=D,A.spotLights.needsUpdate=D,A.spotLightShadows.needsUpdate=D,A.rectAreaLights.needsUpdate=D,A.hemisphereLights.needsUpdate=D}function Vp(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return I},this.setRenderTargetTextures=function(A,D,z){Ie.get(A.texture).__webglTexture=D,Ie.get(A.depthTexture).__webglTexture=z;let H=Ie.get(A);H.__hasExternalTextures=!0,H.__autoAllocateDepthBuffer=z===void 0,H.__autoAllocateDepthBuffer||$e.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(A,D){let z=Ie.get(A);z.__webglFramebuffer=D,z.__useDefaultFramebuffer=D===void 0},this.setRenderTarget=function(A,D=0,z=0){I=A,R=D,C=z;let H=!0,N=null,ee=!1,ce=!1;if(A){let xe=Ie.get(A);if(xe.__useDefaultFramebuffer!==void 0)Pe.bindFramebuffer(O.FRAMEBUFFER,null),H=!1;else if(xe.__webglFramebuffer===void 0)T.setupRenderTarget(A);else if(xe.__hasExternalTextures)T.rebindTextures(A,Ie.get(A.texture).__webglTexture,Ie.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){let _e=A.depthTexture;if(xe.__boundDepthTexture!==_e){if(_e!==null&&Ie.has(_e)&&(A.width!==_e.image.width||A.height!==_e.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");T.setupDepthRenderbuffer(A)}}let Fe=A.texture;(Fe.isData3DTexture||Fe.isDataArrayTexture||Fe.isCompressedArrayTexture)&&(ce=!0);let Ge=Ie.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(Ge[D])?N=Ge[D][z]:N=Ge[D],ee=!0):A.samples>0&&T.useMultisampledRTT(A)===!1?N=Ie.get(A).__webglMultisampledFramebuffer:Array.isArray(Ge)?N=Ge[z]:N=Ge,P.copy(A.viewport),k.copy(A.scissor),B=A.scissorTest}else P.copy(we).multiplyScalar(V).floor(),k.copy(qe).multiplyScalar(V).floor(),B=dt;if(Pe.bindFramebuffer(O.FRAMEBUFFER,N)&&H&&Pe.drawBuffers(A,N),Pe.viewport(P),Pe.scissor(k),Pe.setScissorTest(B),ee){let xe=Ie.get(A.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+D,xe.__webglTexture,z)}else if(ce){let xe=Ie.get(A.texture),Fe=D||0;O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,xe.__webglTexture,z||0,Fe)}S=-1},this.readRenderTargetPixels=function(A,D,z,H,N,ee,ce){if(!(A&&A.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ge=Ie.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&ce!==void 0&&(ge=ge[ce]),ge){Pe.bindFramebuffer(O.FRAMEBUFFER,ge);try{let xe=A.texture,Fe=xe.format,Ge=xe.type;if(!je.textureFormatReadable(Fe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!je.textureTypeReadable(Ge)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=A.width-H&&z>=0&&z<=A.height-N&&O.readPixels(D,z,H,N,Xe.convert(Fe),Xe.convert(Ge),ee)}finally{let xe=I!==null?Ie.get(I).__webglFramebuffer:null;Pe.bindFramebuffer(O.FRAMEBUFFER,xe)}}},this.readRenderTargetPixelsAsync=async function(A,D,z,H,N,ee,ce){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ge=Ie.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&ce!==void 0&&(ge=ge[ce]),ge){let xe=A.texture,Fe=xe.format,Ge=xe.type;if(!je.textureFormatReadable(Fe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!je.textureTypeReadable(Ge))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(D>=0&&D<=A.width-H&&z>=0&&z<=A.height-N){Pe.bindFramebuffer(O.FRAMEBUFFER,ge);let _e=O.createBuffer();O.bindBuffer(O.PIXEL_PACK_BUFFER,_e),O.bufferData(O.PIXEL_PACK_BUFFER,ee.byteLength,O.STREAM_READ),O.readPixels(D,z,H,N,Xe.convert(Fe),Xe.convert(Ge),0);let nt=I!==null?Ie.get(I).__webglFramebuffer:null;Pe.bindFramebuffer(O.FRAMEBUFFER,nt);let _t=O.fenceSync(O.SYNC_GPU_COMMANDS_COMPLETE,0);return O.flush(),await qm(O,_t,4),O.bindBuffer(O.PIXEL_PACK_BUFFER,_e),O.getBufferSubData(O.PIXEL_PACK_BUFFER,0,ee),O.deleteBuffer(_e),O.deleteSync(_t),ee}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(A,D=null,z=0){A.isTexture!==!0&&(Zr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),D=arguments[0]||null,A=arguments[1]);let H=Math.pow(2,-z),N=Math.floor(A.image.width*H),ee=Math.floor(A.image.height*H),ce=D!==null?D.x:0,ge=D!==null?D.y:0;T.setTexture2D(A,0),O.copyTexSubImage2D(O.TEXTURE_2D,z,0,0,ce,ge,N,ee),Pe.unbindTexture()},this.copyTextureToTexture=function(A,D,z=null,H=null,N=0){A.isTexture!==!0&&(Zr("WebGLRenderer: copyTextureToTexture function signature has changed."),H=arguments[0]||null,A=arguments[1],D=arguments[2],N=arguments[3]||0,z=null);let ee,ce,ge,xe,Fe,Ge,_e,nt,_t,At=A.isCompressedTexture?A.mipmaps[N]:A.image;z!==null?(ee=z.max.x-z.min.x,ce=z.max.y-z.min.y,ge=z.isBox3?z.max.z-z.min.z:1,xe=z.min.x,Fe=z.min.y,Ge=z.isBox3?z.min.z:0):(ee=At.width,ce=At.height,ge=At.depth||1,xe=0,Fe=0,Ge=0),H!==null?(_e=H.x,nt=H.y,_t=H.z):(_e=0,nt=0,_t=0);let mn=Xe.convert(D.format),st=Xe.convert(D.type),Ae;D.isData3DTexture?(T.setTexture3D(D,0),Ae=O.TEXTURE_3D):D.isDataArrayTexture||D.isCompressedArrayTexture?(T.setTexture2DArray(D,0),Ae=O.TEXTURE_2D_ARRAY):(T.setTexture2D(D,0),Ae=O.TEXTURE_2D),O.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,D.flipY),O.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),O.pixelStorei(O.UNPACK_ALIGNMENT,D.unpackAlignment);let ii=O.getParameter(O.UNPACK_ROW_LENGTH),rt=O.getParameter(O.UNPACK_IMAGE_HEIGHT),Un=O.getParameter(O.UNPACK_SKIP_PIXELS),Is=O.getParameter(O.UNPACK_SKIP_ROWS),_n=O.getParameter(O.UNPACK_SKIP_IMAGES);O.pixelStorei(O.UNPACK_ROW_LENGTH,At.width),O.pixelStorei(O.UNPACK_IMAGE_HEIGHT,At.height),O.pixelStorei(O.UNPACK_SKIP_PIXELS,xe),O.pixelStorei(O.UNPACK_SKIP_ROWS,Fe),O.pixelStorei(O.UNPACK_SKIP_IMAGES,Ge);let Ur=A.isDataArrayTexture||A.isData3DTexture,Mt=D.isDataArrayTexture||D.isData3DTexture;if(A.isRenderTargetTexture||A.isDepthTexture){let Yn=Ie.get(A),Or=Ie.get(D),Tn=Ie.get(Yn.__renderTarget),Ui=Ie.get(Or.__renderTarget);Pe.bindFramebuffer(O.READ_FRAMEBUFFER,Tn.__webglFramebuffer),Pe.bindFramebuffer(O.DRAW_FRAMEBUFFER,Ui.__webglFramebuffer);for(let Oi=0;Oi<ge;Oi++)Ur&&O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Ie.get(A).__webglTexture,N,Ge+Oi),A.isDepthTexture?(Mt&&O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Ie.get(D).__webglTexture,N,_t+Oi),O.blitFramebuffer(xe,Fe,ee,ce,_e,nt,ee,ce,O.DEPTH_BUFFER_BIT,O.NEAREST)):Mt?O.copyTexSubImage3D(Ae,N,_e,nt,_t+Oi,xe,Fe,ee,ce):O.copyTexSubImage2D(Ae,N,_e,nt,_t+Oi,xe,Fe,ee,ce);Pe.bindFramebuffer(O.READ_FRAMEBUFFER,null),Pe.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else Mt?A.isDataTexture||A.isData3DTexture?O.texSubImage3D(Ae,N,_e,nt,_t,ee,ce,ge,mn,st,At.data):D.isCompressedArrayTexture?O.compressedTexSubImage3D(Ae,N,_e,nt,_t,ee,ce,ge,mn,At.data):O.texSubImage3D(Ae,N,_e,nt,_t,ee,ce,ge,mn,st,At):A.isDataTexture?O.texSubImage2D(O.TEXTURE_2D,N,_e,nt,ee,ce,mn,st,At.data):A.isCompressedTexture?O.compressedTexSubImage2D(O.TEXTURE_2D,N,_e,nt,At.width,At.height,mn,At.data):O.texSubImage2D(O.TEXTURE_2D,N,_e,nt,ee,ce,mn,st,At);O.pixelStorei(O.UNPACK_ROW_LENGTH,ii),O.pixelStorei(O.UNPACK_IMAGE_HEIGHT,rt),O.pixelStorei(O.UNPACK_SKIP_PIXELS,Un),O.pixelStorei(O.UNPACK_SKIP_ROWS,Is),O.pixelStorei(O.UNPACK_SKIP_IMAGES,_n),N===0&&D.generateMipmaps&&O.generateMipmap(Ae),Pe.unbindTexture()},this.copyTextureToTexture3D=function(A,D,z=null,H=null,N=0){return A.isTexture!==!0&&(Zr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),z=arguments[0]||null,H=arguments[1]||null,A=arguments[2],D=arguments[3],N=arguments[4]||0),Zr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(A,D,z,H,N)},this.initRenderTarget=function(A){Ie.get(A).__webglFramebuffer===void 0&&T.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?T.setTextureCube(A,0):A.isData3DTexture?T.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?T.setTexture2DArray(A,0):T.setTexture2D(A,0),Pe.unbindTexture()},this.resetState=function(){R=0,C=0,I=null,Pe.reset(),xt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return di}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorspace=Je._getDrawingBufferColorSpace(e),t.unpackColorSpace=Je._getUnpackColorSpace()}};var dr=class extends Et{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Qn,this.environmentIntensity=1,this.environmentRotation=new Qn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},pr=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Cl,this.updateRanges=[],this.version=0,this.uuid=kn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=kn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=kn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},ln=new w,ys=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)ln.fromBufferAttribute(this,t),ln.applyMatrix4(e),this.setXYZ(t,ln.x,ln.y,ln.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ln.fromBufferAttribute(this,t),ln.applyNormalMatrix(e),this.setXYZ(t,ln.x,ln.y,ln.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ln.fromBufferAttribute(this,t),ln.transformDirection(e),this.setXYZ(t,ln.x,ln.y,ln.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=zn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=at(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=zn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=zn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=zn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=zn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=at(t,this.array),n=at(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=at(t,this.array),n=at(n,this.array),s=at(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=at(t,this.array),n=at(n,this.array),s=at(s,this.array),r=at(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new bt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},ao=class extends hn{static get type(){return"SpriteMaterial"}constructor(e){super(),this.isSpriteMaterial=!0,this.color=new be(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Xs,kr=new w,qs=new w,Ys=new w,Zs=new Le,Vr=new Le,Id=new Ee,ta=new w,Gr=new w,na=new w,Hf=new Le,Gc=new Le,kf=new Le,Ta=class extends Et{constructor(e=new ao){if(super(),this.isSprite=!0,this.type="Sprite",Xs===void 0){Xs=new Zt;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new pr(t,5);Xs.setIndex([0,1,2,0,2,3]),Xs.setAttribute("position",new ys(n,3,0,!1)),Xs.setAttribute("uv",new ys(n,2,3,!1))}this.geometry=Xs,this.material=e,this.center=new Le(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),qs.setFromMatrixScale(this.matrixWorld),Id.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Ys.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&qs.multiplyScalar(-Ys.z);let n=this.material.rotation,s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));let o=this.center;ia(ta.set(-.5,-.5,0),Ys,o,qs,s,r),ia(Gr.set(.5,-.5,0),Ys,o,qs,s,r),ia(na.set(.5,.5,0),Ys,o,qs,s,r),Hf.set(0,0),Gc.set(1,0),kf.set(1,1);let a=e.ray.intersectTriangle(ta,Gr,na,!1,kr);if(a===null&&(ia(Gr.set(-.5,.5,0),Ys,o,qs,s,r),Gc.set(0,1),a=e.ray.intersectTriangle(ta,na,Gr,!1,kr),a===null))return;let c=e.ray.origin.distanceTo(kr);c<e.near||c>e.far||t.push({distance:c,point:kr.clone(),uv:Gi.getInterpolation(kr,ta,Gr,na,Hf,Gc,kf,new Le),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function ia(i,e,t,n,s,r){Zs.subVectors(i,t).addScalar(.5).multiply(n),s!==void 0?(Vr.x=r*Zs.x-s*Zs.y,Vr.y=s*Zs.x+r*Zs.y):Vr.copy(Zs),i.copy(e),i.x+=Vr.x,i.y+=Vr.y,i.applyMatrix4(Id)}var Vf=new w,Gf=new Oe,Wf=new Oe,Vy=new w,Xf=new Ee,sa=new w,Wc=new An,qf=new Ee,Xc=new hr,wa=class extends Se{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Xh,this.bindMatrix=new Ee,this.bindMatrixInverse=new Ee,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Cn),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,sa),this.boundingBox.expandByPoint(sa)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new An),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,sa),this.boundingSphere.expandByPoint(sa)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Wc.copy(this.boundingSphere),Wc.applyMatrix4(s),e.ray.intersectsSphere(Wc)!==!1&&(qf.copy(s).invert(),Xc.copy(e.ray).applyMatrix4(qf),!(this.boundingBox!==null&&Xc.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Xc)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new Oe,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Xh?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===gm?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,s=this.geometry;Gf.fromBufferAttribute(s.attributes.skinIndex,e),Wf.fromBufferAttribute(s.attributes.skinWeight,e),Vf.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){let o=Wf.getComponent(r);if(o!==0){let a=Gf.getComponent(r);Xf.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(Vy.copy(Vf).applyMatrix4(Xf),o)}}return t.applyMatrix4(this.bindMatrixInverse)}},co=class extends Et{constructor(){super(),this.isBone=!0,this.type="Bone"}},Ra=class extends zt{constructor(e=null,t=1,n=1,s,r,o,a,c,l=Bt,u=Bt,h,f){super(null,o,a,c,l,u,s,r,h,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Yf=new Ee,Gy=new Ee,Ca=class i{constructor(e=[],t=[]){this.uuid=kn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new Ee)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new Ee;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){let a=e[r]?e[r].matrixWorld:Gy;Yf.multiplyMatrices(a,t[r]),Yf.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new Ra(t,e,e,Rn,Hn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){let r=e.bones[n],o=t[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new co),this.bones.push(o),this.boneInverses.push(new Ee().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let o=t[s];e.bones.push(o.uuid);let a=n[s];e.boneInverses.push(a.toArray())}return e}},vs=class extends bt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Ks=new Ee,Zf=new Ee,ra=[],Kf=new Cn,Wy=new Ee,Wr=new Se,Xr=new An,Ia=class extends Se{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new vs(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Wy)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Cn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ks),Kf.copy(e.boundingBox).applyMatrix4(Ks),this.boundingBox.union(Kf)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new An),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ks),Xr.copy(e.boundingSphere).applyMatrix4(Ks),this.boundingSphere.union(Xr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(Wr.geometry=this.geometry,Wr.material=this.material,Wr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Xr.copy(this.boundingSphere),Xr.applyMatrix4(n),e.ray.intersectsSphere(Xr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ks),Zf.multiplyMatrices(n,Ks),Wr.matrixWorld=Zf,Wr.raycast(e,ra);for(let o=0,a=ra.length;o<a;o++){let c=ra[o];c.instanceId=r,c.object=this,t.push(c)}ra.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new vs(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Ra(new Float32Array(s*this.count),s,this.count,du,Hn));let r=this.morphTexture.source.data.data,o=0;for(let l=0;l<n.length;l++)o+=n[l];let a=this.geometry.morphTargetsRelative?1:1-o,c=s*e;r[c]=a,r.set(n,c+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}};var lo=class extends hn{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new be(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Pa=new w,La=new w,Jf=new Ee,qr=new hr,oa=new An,qc=new w,$f=new w,mr=class extends Et{constructor(e=new Zt,t=new lo){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)Pa.fromBufferAttribute(t,s-1),La.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=Pa.distanceTo(La);e.setAttribute("lineDistance",new Yt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),oa.copy(n.boundingSphere),oa.applyMatrix4(s),oa.radius+=r,e.ray.intersectsSphere(oa)===!1)return;Jf.copy(s).invert(),qr.copy(e.ray).applyMatrix4(Jf);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,u=n.index,f=n.attributes.position;if(u!==null){let p=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let x=p,m=g-1;x<m;x+=l){let d=u.getX(x),E=u.getX(x+1),b=aa(this,e,qr,c,d,E);b&&t.push(b)}if(this.isLineLoop){let x=u.getX(g-1),m=u.getX(p),d=aa(this,e,qr,c,x,m);d&&t.push(d)}}else{let p=Math.max(0,o.start),g=Math.min(f.count,o.start+o.count);for(let x=p,m=g-1;x<m;x+=l){let d=aa(this,e,qr,c,x,x+1);d&&t.push(d)}if(this.isLineLoop){let x=aa(this,e,qr,c,g-1,p);x&&t.push(x)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function aa(i,e,t,n,s,r){let o=i.geometry.attributes.position;if(Pa.fromBufferAttribute(o,s),La.fromBufferAttribute(o,r),t.distanceSqToSegment(Pa,La,qc,$f)>n)return;qc.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(qc);if(!(c<e.near||c>e.far))return{distance:c,point:$f.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:i}}var jf=new w,Qf=new w,Da=class extends mr{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)jf.fromBufferAttribute(t,s),Qf.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+jf.distanceTo(Qf);e.setAttribute("lineDistance",new Yt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},Na=class extends mr{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},uo=class extends hn{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new be(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},ed=new Ee,ql=new hr,ca=new An,la=new w,Ua=class extends Et{constructor(e=new Zt,t=new uo){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ca.copy(n.boundingSphere),ca.applyMatrix4(s),ca.radius+=r,e.ray.intersectsSphere(ca)===!1)return;ed.copy(s).invert(),ql.copy(e.ray).applyMatrix4(ed);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=n.index,h=n.attributes.position;if(l!==null){let f=Math.max(0,o.start),p=Math.min(l.count,o.start+o.count);for(let g=f,x=p;g<x;g++){let m=l.getX(g);la.fromBufferAttribute(h,m),td(la,m,c,s,e,t,this)}}else{let f=Math.max(0,o.start),p=Math.min(h.count,o.start+o.count);for(let g=f,x=p;g<x;g++)la.fromBufferAttribute(h,g),td(la,g,c,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function td(i,e,t,n,s,r,o){let a=ql.distanceSqToPoint(i);if(a<t){let c=new w;ql.closestPointToPoint(i,c),c.applyMatrix4(n);let l=s.ray.origin.distanceTo(c);if(l<s.near||l>s.far)return;r.push({distance:l,distanceToRay:Math.sqrt(a),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}var Oa=class extends zt{constructor(e,t,n,s,r,o,a,c,l){super(e,t,n,s,r,o,a,c,l),this.isVideoTexture=!0,this.minFilter=o!==void 0?o:qt,this.magFilter=r!==void 0?r:qt,this.generateMipmaps=!1;let u=this;function h(){u.needsUpdate=!0,e.requestVideoFrameCallback(h)}"requestVideoFrameCallback"in e&&e.requestVideoFrameCallback(h)}clone(){return new this.constructor(this.image).copy(this)}update(){let e=this.image;"requestVideoFrameCallback"in e===!1&&e.readyState>=e.HAVE_CURRENT_DATA&&(this.needsUpdate=!0)}};var Fa=class extends zt{constructor(e,t,n,s,r,o,a,c,l){super(e,t,n,s,r,o,a,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}};var As=class i extends Zt{constructor(e=1,t=1,n=1,s=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};let l=this;s=Math.floor(s),r=Math.floor(r);let u=[],h=[],f=[],p=[],g=0,x=[],m=n/2,d=0;E(),o===!1&&(e>0&&b(!0),t>0&&b(!1)),this.setIndex(u),this.setAttribute("position",new Yt(h,3)),this.setAttribute("normal",new Yt(f,3)),this.setAttribute("uv",new Yt(p,2));function E(){let y=new w,U=new w,R=0,C=(t-e)/n;for(let I=0;I<=r;I++){let S=[],v=I/r,P=v*(t-e)+e;for(let k=0;k<=s;k++){let B=k/s,G=B*c+a,J=Math.sin(G),X=Math.cos(G);U.x=P*J,U.y=-v*n+m,U.z=P*X,h.push(U.x,U.y,U.z),y.set(J,C,X).normalize(),f.push(y.x,y.y,y.z),p.push(B,1-v),S.push(g++)}x.push(S)}for(let I=0;I<s;I++)for(let S=0;S<r;S++){let v=x[S][I],P=x[S+1][I],k=x[S+1][I+1],B=x[S][I+1];(e>0||S!==0)&&(u.push(v,P,B),R+=3),(t>0||S!==r-1)&&(u.push(P,k,B),R+=3)}l.addGroup(d,R,0),d+=R}function b(y){let U=g,R=new Le,C=new w,I=0,S=y===!0?e:t,v=y===!0?1:-1;for(let k=1;k<=s;k++)h.push(0,m*v,0),f.push(0,v,0),p.push(.5,.5),g++;let P=g;for(let k=0;k<=s;k++){let G=k/s*c+a,J=Math.cos(G),X=Math.sin(G);C.x=S*X,C.y=m*v,C.z=S*J,h.push(C.x,C.y,C.z),f.push(0,v,0),R.x=J*.5+.5,R.y=X*.5*v+.5,p.push(R.x,R.y),g++}for(let k=0;k<s;k++){let B=U+k,G=P+k;y===!0?u.push(G,G+1,B):u.push(G+1,G,B),I+=3}l.addGroup(d,I,y===!0?1:2),d+=I}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var ho=class i extends Zt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let c=Math.min(o+a,Math.PI),l=0,u=[],h=new w,f=new w,p=[],g=[],x=[],m=[];for(let d=0;d<=n;d++){let E=[],b=d/n,y=0;d===0&&o===0?y=.5/t:d===n&&c===Math.PI&&(y=-.5/t);for(let U=0;U<=t;U++){let R=U/t;h.x=-e*Math.cos(s+R*r)*Math.sin(o+b*a),h.y=e*Math.cos(o+b*a),h.z=e*Math.sin(s+R*r)*Math.sin(o+b*a),g.push(h.x,h.y,h.z),f.copy(h).normalize(),x.push(f.x,f.y,f.z),m.push(R+y,1-b),E.push(l++)}u.push(E)}for(let d=0;d<n;d++)for(let E=0;E<t;E++){let b=u[d][E+1],y=u[d][E],U=u[d+1][E],R=u[d+1][E+1];(d!==0||o>0)&&p.push(b,y,R),(d!==n-1||c<Math.PI)&&p.push(y,U,R)}this.setIndex(p),this.setAttribute("position",new Yt(g,3)),this.setAttribute("normal",new Yt(x,3)),this.setAttribute("uv",new Yt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var fo=class extends hn{static get type(){return"ShadowMaterial"}constructor(e){super(),this.isShadowMaterial=!0,this.color=new be(0),this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.fog=e.fog,this}};var Vt=class extends hn{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new be(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new be(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=yd,this.normalScale=new Le(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Qn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Mn=class extends Vt{static get type(){return"MeshPhysicalMaterial"}constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Le(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return en(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new be(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new be(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new be(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};function gs(i,e,t){return!i||!t&&i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Pd(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Ld(i){function e(s,r){return i[s]-i[r]}let t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function Yl(i,e,t){let n=i.length,s=new i.constructor(n);for(let r=0,o=0;o!==n;++r){let a=t[r]*e;for(let c=0;c!==e;++c)s[o++]=i[a+c]}return s}function vu(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push.apply(t,o)),r=i[s++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=i[s++];while(r!==void 0)}function Xy(i,e,t,n,s=30){let r=i.clone();r.name=e;let o=[];for(let c=0;c<r.tracks.length;++c){let l=r.tracks[c],u=l.getValueSize(),h=[],f=[];for(let p=0;p<l.times.length;++p){let g=l.times[p]*s;if(!(g<t||g>=n)){h.push(l.times[p]);for(let x=0;x<u;++x)f.push(l.values[p*u+x])}}h.length!==0&&(l.times=gs(h,l.times.constructor),l.values=gs(f,l.values.constructor),o.push(l))}r.tracks=o;let a=1/0;for(let c=0;c<r.tracks.length;++c)a>r.tracks[c].times[0]&&(a=r.tracks[c].times[0]);for(let c=0;c<r.tracks.length;++c)r.tracks[c].shift(-1*a);return r.resetDuration(),r}function qy(i,e=0,t=i,n=30){n<=0&&(n=30);let s=t.tracks.length,r=e/n;for(let o=0;o<s;++o){let a=t.tracks[o],c=a.ValueTypeName;if(c==="bool"||c==="string")continue;let l=i.tracks.find(function(d){return d.name===a.name&&d.ValueTypeName===c});if(l===void 0)continue;let u=0,h=a.getValueSize();a.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(u=h/3);let f=0,p=l.getValueSize();l.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline&&(f=p/3);let g=a.times.length-1,x;if(r<=a.times[0]){let d=u,E=h-u;x=a.values.slice(d,E)}else if(r>=a.times[g]){let d=g*h+u,E=d+h-u;x=a.values.slice(d,E)}else{let d=a.createInterpolant(),E=u,b=h-u;d.evaluate(r),x=d.resultBuffer.slice(E,b)}c==="quaternion"&&new ct().fromArray(x).normalize().conjugate().toArray(x);let m=l.times.length;for(let d=0;d<m;++d){let E=d*p+f;if(c==="quaternion")ct.multiplyQuaternionsFlat(l.values,E,x,0,l.values,E);else{let b=p-f*2;for(let y=0;y<b;++y)l.values[E+y]-=x[y]}}}return i.blendMode=xd,i}var Dd={convertArray:gs,isTypedArray:Pd,getKeyframeOrder:Ld,sortedArray:Yl,flattenJSON:vu,subclip:Xy,makeClipAdditive:qy},Ki=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];e:{t:{let o;n:{i:if(!(e<s)){for(let a=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=t[++n],e<s)break t}o=t.length;break n}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=t[--n-1],e>=r)break t}o=n,n=0;break n}break e}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Zl=class extends Ki{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:$s,endingEnd:$s}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],c=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case js:r=e,a=2*t-n;break;case ma:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=n}if(c===void 0)switch(this.getSettings_().endingEnd){case js:o=e,c=2*n-t;break;case ma:o=1,c=n+s[1]-s[0];break;default:o=e-1,c=t}let l=(n-t)*.5,u=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(c-n),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=this._offsetPrev,h=this._offsetNext,f=this._weightPrev,p=this._weightNext,g=(n-t)/(s-t),x=g*g,m=x*g,d=-f*m+2*f*x-f*g,E=(1+f)*m+(-1.5-2*f)*x+(-.5+f)*g+1,b=(-1-p)*m+(1.5+p)*x+.5*g,y=p*m-p*x;for(let U=0;U!==a;++U)r[U]=d*o[u+U]+E*o[l+U]+b*o[c+U]+y*o[h+U];return r}},Ba=class extends Ki{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=(n-t)/(s-t),h=1-u;for(let f=0;f!==a;++f)r[f]=o[l+f]*h+o[c+f]*u;return r}},Kl=class extends Ki{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},In=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=gs(t,this.TimeBufferType),this.values=gs(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:gs(e.times,Array),values:gs(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Kl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ba(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Zl(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case cr:t=this.InterpolantFactoryMethodDiscrete;break;case lr:t=this.InterpolantFactoryMethodLinear;break;case gc:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return cr;case this.InterpolantFactoryMethodLinear:return lr;case this.InterpolantFactoryMethodSmooth:return gc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let c=n[a];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,c),e=!1;break}if(o!==null&&o>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,c,o),e=!1;break}o=c}if(s!==void 0&&Pd(s))for(let a=0,c=s.length;a!==c;++a){let l=s[a];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===gc,r=e.length-1,o=1;for(let a=1;a<r;++a){let c=!1,l=e[a],u=e[a+1];if(l!==u&&(a!==1||l!==e[0]))if(s)c=!0;else{let h=a*n,f=h-n,p=h+n;for(let g=0;g!==n;++g){let x=t[h+g];if(x!==t[f+g]||x!==t[p+g]){c=!0;break}}}if(c){if(a!==o){e[o]=e[a];let h=a*n,f=o*n;for(let p=0;p!==n;++p)t[f+p]=t[h+p]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,c=o*n,l=0;l!==n;++l)t[c+l]=t[a+l];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};In.prototype.TimeBufferType=Float32Array;In.prototype.ValueBufferType=Float32Array;In.prototype.DefaultInterpolation=lr;var Ji=class extends In{constructor(e,t,n){super(e,t,n)}};Ji.prototype.ValueTypeName="bool";Ji.prototype.ValueBufferType=Array;Ji.prototype.DefaultInterpolation=cr;Ji.prototype.InterpolantFactoryMethodLinear=void 0;Ji.prototype.InterpolantFactoryMethodSmooth=void 0;var za=class extends In{};za.prototype.ValueTypeName="color";var _i=class extends In{};_i.prototype.ValueTypeName="number";var Jl=class extends Ki{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(n-t)/(s-t),l=e*a;for(let u=l+a;l!==u;l+=4)ct.slerpFlat(r,0,o,l-a,o,l,c);return r}},yi=class extends In{InterpolantFactoryMethodLinear(e){return new Jl(this.times,this.values,this.getValueSize(),e)}};yi.prototype.ValueTypeName="quaternion";yi.prototype.InterpolantFactoryMethodSmooth=void 0;var $i=class extends In{constructor(e,t,n){super(e,t,n)}};$i.prototype.ValueTypeName="string";$i.prototype.ValueBufferType=Array;$i.prototype.DefaultInterpolation=cr;$i.prototype.InterpolantFactoryMethodLinear=void 0;$i.prototype.InterpolantFactoryMethodSmooth=void 0;var vi=class extends In{};vi.prototype.ValueTypeName="vector";var gr=class{constructor(e="",t=-1,n=[],s=xu){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=kn(),this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,s=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(Zy(n[o]).scale(s));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r}static toJSON(e){let t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let r=0,o=n.length;r!==o;++r)t.push(In.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){let r=t.length,o=[];for(let a=0;a<r;a++){let c=[],l=[];c.push((a+r-1)%r,a,(a+1)%r),l.push(0,1,0);let u=Ld(c);c=Yl(c,1,u),l=Yl(l,1,u),!s&&c[0]===0&&(c.push(r),l.push(l[0])),o.push(new _i(".morphTargetInfluences["+t[a].name+"]",c,l).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let s={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,c=e.length;a<c;a++){let l=e[a],u=l.name.match(r);if(u&&u.length>1){let h=u[1],f=s[h];f||(s[h]=f=[]),f.push(l)}}let o=[];for(let a in s)o.push(this.CreateFromMorphTargetSequence(a,s[a],t,n));return o}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;let n=function(h,f,p,g,x){if(p.length!==0){let m=[],d=[];vu(p,m,d,g),m.length!==0&&x.push(new h(f,m,d))}},s=[],r=e.name||"default",o=e.fps||30,a=e.blendMode,c=e.length||-1,l=e.hierarchy||[];for(let h=0;h<l.length;h++){let f=l[h].keys;if(!(!f||f.length===0))if(f[0].morphTargets){let p={},g;for(g=0;g<f.length;g++)if(f[g].morphTargets)for(let x=0;x<f[g].morphTargets.length;x++)p[f[g].morphTargets[x]]=-1;for(let x in p){let m=[],d=[];for(let E=0;E!==f[g].morphTargets.length;++E){let b=f[g];m.push(b.time),d.push(b.morphTarget===x?1:0)}s.push(new _i(".morphTargetInfluence["+x+"]",m,d))}c=p.length*o}else{let p=".bones["+t[h].name+"]";n(vi,p+".position",f,"pos",s),n(yi,p+".quaternion",f,"rot",s),n(vi,p+".scale",f,"scl",s)}}return s.length===0?null:new this(r,c,s,a)}resetDuration(){let e=this.tracks,t=0;for(let n=0,s=e.length;n!==s;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}};function Yy(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return _i;case"vector":case"vector2":case"vector3":case"vector4":return vi;case"color":return za;case"quaternion":return yi;case"bool":case"boolean":return Ji;case"string":return $i}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function Zy(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=Yy(i.type);if(i.times===void 0){let t=[],n=[];vu(i.keys,t,n,"value"),i.times=t,i.values=n}return e.parse!==void 0?e.parse(i):new e(i.name,i.times,i.values,i.interpolation)}var Wi={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(this.files[i]=e)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}},$l=class{constructor(e,t,n){let s=this,r=!1,o=0,a=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(u){a++,r===!1&&s.onStart!==void 0&&s.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,s.onProgress!==void 0&&s.onProgress(u,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,h){return l.push(u,h),this},this.removeHandler=function(u){let h=l.indexOf(u);return h!==-1&&l.splice(h,2),this},this.getHandler=function(u){for(let h=0,f=l.length;h<f;h+=2){let p=l[h],g=l[h+1];if(p.global&&(p.lastIndex=0),p.test(u))return g}return null}}},Ky=new $l,Ai=class{constructor(e){this.manager=e!==void 0?e:Ky,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};Ai.DEFAULT_MATERIAL_NAME="__DEFAULT";var li={},jl=class extends Error{constructor(e,t){super(e),this.response=t}},po=class extends Ai{constructor(e){super(e)}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=Wi.get(e);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(li[e]!==void 0){li[e].push({onLoad:t,onProgress:n,onError:s});return}li[e]=[],li[e].push({onLoad:t,onProgress:n,onError:s});let o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,c=this.responseType;fetch(o).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;let u=li[e],h=l.body.getReader(),f=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),p=f?parseInt(f):0,g=p!==0,x=0,m=new ReadableStream({start(d){E();function E(){h.read().then(({done:b,value:y})=>{if(b)d.close();else{x+=y.byteLength;let U=new ProgressEvent("progress",{lengthComputable:g,loaded:x,total:p});for(let R=0,C=u.length;R<C;R++){let I=u[R];I.onProgress&&I.onProgress(U)}d.enqueue(y),E()}},b=>{d.error(b)})}}});return new Response(m)}else throw new jl(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(u=>new DOMParser().parseFromString(u,a));case"json":return l.json();default:if(a===void 0)return l.text();{let h=/charset="?([^;"\s]*)"?/i.exec(a),f=h&&h[1]?h[1].toLowerCase():void 0,p=new TextDecoder(f);return l.arrayBuffer().then(g=>p.decode(g))}}}).then(l=>{Wi.add(e,l);let u=li[e];delete li[e];for(let h=0,f=u.length;h<f;h++){let p=u[h];p.onLoad&&p.onLoad(l)}}).catch(l=>{let u=li[e];if(u===void 0)throw this.manager.itemError(e),l;delete li[e];for(let h=0,f=u.length;h<f;h++){let p=u[h];p.onError&&p.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}};var Ql=class extends Ai{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=Wi.get(e);if(o!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o;let a=ro("img");function c(){u(),Wi.add(e,this),t&&t(this),r.manager.itemEnd(e)}function l(h){u(),s&&s(h),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){a.removeEventListener("load",c,!1),a.removeEventListener("error",l,!1)}return a.addEventListener("load",c,!1),a.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),r.manager.itemStart(e),a.src=e,a}};var Ms=class extends Ai{constructor(e){super(e)}load(e,t,n,s){let r=new zt,o=new Ql(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},xr=class extends Et{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new be(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},mo=class extends xr{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Et.DEFAULT_UP),this.updateMatrix(),this.groundColor=new be(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Yc=new Ee,nd=new w,id=new w,go=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Le(512,512),this.map=null,this.mapPass=null,this.matrix=new Ee,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new oo,this._frameExtents=new Le(1,1),this._viewportCount=1,this._viewports=[new Oe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;nd.setFromMatrixPosition(e.matrixWorld),t.position.copy(nd),id.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(id),t.updateMatrixWorld(),Yc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Yc),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Yc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},eu=class extends go{constructor(){super(new Ft(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){let t=this.camera,n=ur*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},Ss=class extends xr{constructor(e,t,n=0,s=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Et.DEFAULT_UP),this.updateMatrix(),this.target=new Et,this.distance=n,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new eu}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},sd=new Ee,Yr=new w,Zc=new w,tu=class extends go{constructor(){super(new Ft(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Le(4,2),this._viewportCount=6,this._viewports=[new Oe(2,1,1,1),new Oe(0,1,1,1),new Oe(3,1,1,1),new Oe(1,1,1,1),new Oe(3,0,1,1),new Oe(1,0,1,1)],this._cubeDirections=[new w(1,0,0),new w(-1,0,0),new w(0,0,1),new w(0,0,-1),new w(0,1,0),new w(0,-1,0)],this._cubeUps=[new w(0,1,0),new w(0,1,0),new w(0,1,0),new w(0,1,0),new w(0,0,1),new w(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),Yr.setFromMatrixPosition(e.matrixWorld),n.position.copy(Yr),Zc.copy(n.position),Zc.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Zc),n.updateMatrixWorld(),s.makeTranslation(-Yr.x,-Yr.y,-Yr.z),sd.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(sd)}},fn=class extends xr{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new tu}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},nu=class extends go{constructor(){super(new Zi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},ji=class extends xr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Et.DEFAULT_UP),this.updateMatrix(),this.target=new Et,this.shadow=new nu}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var Qi=class{static decodeText(e){if(console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."),typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let n=0,s=e.length;n<s;n++)t+=String.fromCharCode(e[n]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var Ha=class extends Ai{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=Wi.get(e);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(l=>{t&&t(l),r.manager.itemEnd(e)}).catch(l=>{s&&s(l)});return}return setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o}let a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader;let c=fetch(e,a).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(l){return Wi.add(e,l),t&&t(l),r.manager.itemEnd(e),l}).catch(function(l){s&&s(l),Wi.remove(e),r.manager.itemError(e),r.manager.itemEnd(e)});Wi.add(e,c),r.manager.itemStart(e)}};var iu=class{constructor(e,t,n){this.binding=e,this.valueSize=n;let s,r,o;switch(t){case"quaternion":s=this._slerp,r=this._slerpAdditive,o=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":s=this._select,r=this._select,o=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:s=this._lerp,r=this._lerpAdditive,o=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=s,this._mixBufferRegionAdditive=r,this._setIdentity=o,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){let n=this.buffer,s=this.valueSize,r=e*s+s,o=this.cumulativeWeight;if(o===0){for(let a=0;a!==s;++a)n[r+a]=n[a];o=t}else{o+=t;let a=t/o;this._mixBufferRegion(n,r,0,a,s)}this.cumulativeWeight=o}accumulateAdditive(e){let t=this.buffer,n=this.valueSize,s=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,s,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){let t=this.valueSize,n=this.buffer,s=e*t+t,r=this.cumulativeWeight,o=this.cumulativeWeightAdditive,a=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){let c=t*this._origIndex;this._mixBufferRegion(n,s,c,1-r,t)}o>0&&this._mixBufferRegionAdditive(n,s,this._addIndex*t,1,t);for(let c=t,l=t+t;c!==l;++c)if(n[c]!==n[c+t]){a.setValue(n,s);break}}saveOriginalState(){let e=this.binding,t=this.buffer,n=this.valueSize,s=n*this._origIndex;e.getValue(t,s);for(let r=n,o=s;r!==o;++r)t[r]=t[s+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){let e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,s,r){if(s>=.5)for(let o=0;o!==r;++o)e[t+o]=e[n+o]}_slerp(e,t,n,s){ct.slerpFlat(e,t,e,t,e,n,s)}_slerpAdditive(e,t,n,s,r){let o=this._workIndex*r;ct.multiplyQuaternionsFlat(e,o,e,t,e,n),ct.slerpFlat(e,t,e,t,e,o,s)}_lerp(e,t,n,s,r){let o=1-s;for(let a=0;a!==r;++a){let c=t+a;e[c]=e[c]*o+e[n+a]*s}}_lerpAdditive(e,t,n,s,r){for(let o=0;o!==r;++o){let a=t+o;e[a]=e[a]+e[n+o]*s}}},Au="\\[\\]\\.:\\/",Jy=new RegExp("["+Au+"]","g"),Mu="[^"+Au+"]",$y="[^"+Au.replace("\\.","")+"]",jy=/((?:WC+[\/:])*)/.source.replace("WC",Mu),Qy=/(WCOD+)?/.source.replace("WCOD",$y),ev=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Mu),tv=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Mu),nv=new RegExp("^"+jy+Qy+ev+tv+"$"),iv=["material","materials","bones","map"],su=class{constructor(e,t,n){let s=n||pt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},pt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Jy,"")}static parseTrackName(e){let t=nv.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);iv.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let c=n(a.children);if(c)return c}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===l){l=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let o=e[s];if(o===void 0){let l=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};pt.Composite=su;pt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};pt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};pt.prototype.GetterByBindingType=[pt.prototype._getValue_direct,pt.prototype._getValue_array,pt.prototype._getValue_arrayElement,pt.prototype._getValue_toArray];pt.prototype.SetterByBindingTypeAndVersioning=[[pt.prototype._setValue_direct,pt.prototype._setValue_direct_setNeedsUpdate,pt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[pt.prototype._setValue_array,pt.prototype._setValue_array_setNeedsUpdate,pt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[pt.prototype._setValue_arrayElement,pt.prototype._setValue_arrayElement_setNeedsUpdate,pt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[pt.prototype._setValue_fromArray,pt.prototype._setValue_fromArray_setNeedsUpdate,pt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var ru=class{constructor(e,t,n=null,s=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=s;let r=t.tracks,o=r.length,a=new Array(o),c={endingStart:$s,endingEnd:$s};for(let l=0;l!==o;++l){let u=r[l].createInterpolant(null);a[l]=u,u.settings=c}this._interpolantSettings=c,this._interpolants=a,this._propertyBindings=new Array(o),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=xm,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n){if(e.fadeOut(t),this.fadeIn(t),n){let s=this._clip.duration,r=e._clip.duration,o=r/s,a=s/r;e.warp(1,o,t),this.warp(a,1,t)}return this}crossFadeTo(e,t,n){return e.crossFadeFrom(this,t,n)}stopFading(){let e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){let s=this._mixer,r=s.time,o=this.timeScale,a=this._timeScaleInterpolant;a===null&&(a=s._lendControlInterpolant(),this._timeScaleInterpolant=a);let c=a.parameterPositions,l=a.sampleValues;return c[0]=r,c[1]=r+n,l[0]=e/o,l[1]=t/o,this}stopWarping(){let e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,s){if(!this.enabled){this._updateWeight(e);return}let r=this._startTime;if(r!==null){let c=(e-r)*n;c<0||n===0?t=0:(this._startTime=null,t=n*c)}t*=this._updateTimeScale(e);let o=this._updateTime(t),a=this._updateWeight(e);if(a>0){let c=this._interpolants,l=this._propertyBindings;switch(this.blendMode){case xd:for(let u=0,h=c.length;u!==h;++u)c[u].evaluate(o),l[u].accumulateAdditive(a);break;case xu:default:for(let u=0,h=c.length;u!==h;++u)c[u].evaluate(o),l[u].accumulate(s,a)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;let n=this._weightInterpolant;if(n!==null){let s=n.evaluate(e)[0];t*=s,e>n.parameterPositions[1]&&(this.stopFading(),s===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;let n=this._timeScaleInterpolant;if(n!==null){let s=n.evaluate(e)[0];t*=s,e>n.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t)}}return this._effectiveTimeScale=t,t}_updateTime(e){let t=this._clip.duration,n=this.loop,s=this.time+e,r=this._loopCount,o=n===_m;if(e===0)return r===-1?s:o&&(r&1)===1?t-s:s;if(n===Va){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(s>=t)s=t;else if(s<0)s=0;else{this.time=s;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=s,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,o)):this._setEndings(this.repetitions===0,!0,o)),s>=t||s<0){let a=Math.floor(s/t);s-=t*a,r+=Math.abs(a);let c=this.repetitions-r;if(c<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,s=e>0?t:0,this.time=s,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(c===1){let l=e<0;this._setEndings(l,!l,o)}else this._setEndings(!1,!1,o);this._loopCount=r,this.time=s,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:a})}}else this.time=s;if(o&&(r&1)===1)return t-s}return s}_setEndings(e,t,n){let s=this._interpolantSettings;n?(s.endingStart=js,s.endingEnd=js):(e?s.endingStart=this.zeroSlopeAtStart?js:$s:s.endingStart=ma,t?s.endingEnd=this.zeroSlopeAtEnd?js:$s:s.endingEnd=ma)}_scheduleFading(e,t,n){let s=this._mixer,r=s.time,o=this._weightInterpolant;o===null&&(o=s._lendControlInterpolant(),this._weightInterpolant=o);let a=o.parameterPositions,c=o.sampleValues;return a[0]=r,c[0]=t,a[1]=r+e,c[1]=n,this}},sv=new Float32Array(1),xo=class extends gi{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){let n=e._localRoot||this._root,s=e._clip.tracks,r=s.length,o=e._propertyBindings,a=e._interpolants,c=n.uuid,l=this._bindingsByRootAndName,u=l[c];u===void 0&&(u={},l[c]=u);for(let h=0;h!==r;++h){let f=s[h],p=f.name,g=u[p];if(g!==void 0)++g.referenceCount,o[h]=g;else{if(g=o[h],g!==void 0){g._cacheIndex===null&&(++g.referenceCount,this._addInactiveBinding(g,c,p));continue}let x=t&&t._propertyBindings[h].binding.parsedPath;g=new iu(pt.create(n,p,x),f.ValueTypeName,f.getValueSize()),++g.referenceCount,this._addInactiveBinding(g,c,p),o[h]=g}a[h].resultBuffer=g.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){let n=(e._localRoot||this._root).uuid,s=e._clip.uuid,r=this._actionsByClip[s];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,s,n)}let t=e._propertyBindings;for(let n=0,s=t.length;n!==s;++n){let r=t[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){let t=e._propertyBindings;for(let n=0,s=t.length;n!==s;++n){let r=t[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){let t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){let s=this._actions,r=this._actionsByClip,o=r[t];if(o===void 0)o={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=o;else{let a=o.knownActions;e._byClipCacheIndex=a.length,a.push(e)}e._cacheIndex=s.length,s.push(e),o.actionByRoot[n]=e}_removeInactiveAction(e){let t=this._actions,n=t[t.length-1],s=e._cacheIndex;n._cacheIndex=s,t[s]=n,t.pop(),e._cacheIndex=null;let r=e._clip.uuid,o=this._actionsByClip,a=o[r],c=a.knownActions,l=c[c.length-1],u=e._byClipCacheIndex;l._byClipCacheIndex=u,c[u]=l,c.pop(),e._byClipCacheIndex=null;let h=a.actionByRoot,f=(e._localRoot||this._root).uuid;delete h[f],c.length===0&&delete o[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){let t=e._propertyBindings;for(let n=0,s=t.length;n!==s;++n){let r=t[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){let t=this._actions,n=e._cacheIndex,s=this._nActiveActions++,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){let t=this._actions,n=e._cacheIndex,s=--this._nActiveActions,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){let s=this._bindingsByRootAndName,r=this._bindings,o=s[t];o===void 0&&(o={},s[t]=o),o[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){let t=this._bindings,n=e.binding,s=n.rootNode.uuid,r=n.path,o=this._bindingsByRootAndName,a=o[s],c=t[t.length-1],l=e._cacheIndex;c._cacheIndex=l,t[l]=c,t.pop(),delete a[r],Object.keys(a).length===0&&delete o[s]}_lendBinding(e){let t=this._bindings,n=e._cacheIndex,s=this._nActiveBindings++,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){let t=this._bindings,n=e._cacheIndex,s=--this._nActiveBindings,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){let e=this._controlInterpolants,t=this._nActiveControlInterpolants++,n=e[t];return n===void 0&&(n=new Ba(new Float32Array(2),new Float32Array(2),1,sv),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){let t=this._controlInterpolants,n=e.__cacheIndex,s=--this._nActiveControlInterpolants,r=t[s];e.__cacheIndex=s,t[s]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){let s=t||this._root,r=s.uuid,o=typeof e=="string"?gr.findByName(s,e):e,a=o!==null?o.uuid:e,c=this._actionsByClip[a],l=null;if(n===void 0&&(o!==null?n=o.blendMode:n=xu),c!==void 0){let h=c.actionByRoot[r];if(h!==void 0&&h.blendMode===n)return h;l=c.knownActions[0],o===null&&(o=l._clip)}if(o===null)return null;let u=new ru(this,o,t,n);return this._bindAction(u,l),this._addInactiveAction(u,a,r),u}existingAction(e,t){let n=t||this._root,s=n.uuid,r=typeof e=="string"?gr.findByName(n,e):e,o=r?r.uuid:e,a=this._actionsByClip[o];return a!==void 0&&a.actionByRoot[s]||null}stopAllAction(){let e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;let t=this._actions,n=this._nActiveActions,s=this.time+=e,r=Math.sign(e),o=this._accuIndex^=1;for(let l=0;l!==n;++l)t[l]._update(s,e,r,o);let a=this._bindings,c=this._nActiveBindings;for(let l=0;l!==c;++l)a[l].apply(o);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){let t=this._actions,n=e.uuid,s=this._actionsByClip,r=s[n];if(r!==void 0){let o=r.knownActions;for(let a=0,c=o.length;a!==c;++a){let l=o[a];this._deactivateAction(l);let u=l._cacheIndex,h=t[t.length-1];l._cacheIndex=null,l._byClipCacheIndex=null,h._cacheIndex=u,t[u]=h,t.pop(),this._removeInactiveBindingsForAction(l)}delete s[n]}}uncacheRoot(e){let t=e.uuid,n=this._actionsByClip;for(let o in n){let a=n[o].actionByRoot,c=a[t];c!==void 0&&(this._deactivateAction(c),this._removeInactiveAction(c))}let s=this._bindingsByRootAndName,r=s[t];if(r!==void 0)for(let o in r){let a=r[o];a.restoreOriginalState(),this._removeInactiveBinding(a)}}uncacheAction(e,t){let n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"170"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="170");function Su(i,e){if(e===_d)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===yo||e===Ga){let t=i.getIndex();if(t===null){let o=[],a=i.getAttribute("position");if(a!==void 0){for(let c=0;c<a.count;c++)o.push(c);i.setIndex(o),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}let n=t.count-2,s=[];if(e===yo)for(let o=1;o<=n;o++)s.push(t.getX(0)),s.push(t.getX(o)),s.push(t.getX(o+1));else for(let o=0;o<n;o++)o%2===0?(s.push(t.getX(o)),s.push(t.getX(o+1)),s.push(t.getX(o+2))):(s.push(t.getX(o+2)),s.push(t.getX(o+1)),s.push(t.getX(o)));s.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let r=i.clone();return r.setIndex(s),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}var qa=class extends Ai{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Iu(t)}),this.register(function(t){return new Pu(t)}),this.register(function(t){return new Hu(t)}),this.register(function(t){return new ku(t)}),this.register(function(t){return new Vu(t)}),this.register(function(t){return new Du(t)}),this.register(function(t){return new Nu(t)}),this.register(function(t){return new Uu(t)}),this.register(function(t){return new Ou(t)}),this.register(function(t){return new Cu(t)}),this.register(function(t){return new Fu(t)}),this.register(function(t){return new Lu(t)}),this.register(function(t){return new zu(t)}),this.register(function(t){return new Bu(t)}),this.register(function(t){return new wu(t)}),this.register(function(t){return new Gu(t)}),this.register(function(t){return new Wu(t)})}load(e,t,n,s){let r=this,o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){let l=Qi.extractUrlBase(e);o=Qi.resolveURL(l,this.path)}else o=Qi.extractUrlBase(e);this.manager.itemStart(e);let a=function(l){s?s(l):console.error(l),r.manager.itemError(e),r.manager.itemEnd(e)},c=new po(this.manager);c.setPath(this.path),c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(l){try{r.parse(l,o,function(u){t(u),r.manager.itemEnd(e)},a)}catch(u){a(u)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,s){let r,o={},a={},c=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(c.decode(new Uint8Array(e,0,4))===Bd){try{o[Ze.KHR_BINARY_GLTF]=new Xu(e)}catch(h){s&&s(h);return}r=JSON.parse(o[Ze.KHR_BINARY_GLTF].content)}else r=JSON.parse(c.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){s&&s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let l=new ju(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){let h=this.pluginCallbacks[u](l);h.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[h.name]=h,o[h.name]=!0}if(r.extensionsUsed)for(let u=0;u<r.extensionsUsed.length;++u){let h=r.extensionsUsed[u],f=r.extensionsRequired||[];switch(h){case Ze.KHR_MATERIALS_UNLIT:o[h]=new Ru;break;case Ze.KHR_DRACO_MESH_COMPRESSION:o[h]=new qu(r,this.dracoLoader);break;case Ze.KHR_TEXTURE_TRANSFORM:o[h]=new Yu;break;case Ze.KHR_MESH_QUANTIZATION:o[h]=new Zu;break;default:f.indexOf(h)>=0&&a[h]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+h+'".')}}l.setExtensions(o),l.setPlugins(a),l.parse(n,s)}parseAsync(e,t){let n=this;return new Promise(function(s,r){n.parse(e,t,s,r)})}};function ov(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}var Ze={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},wu=class{constructor(e){this.parser=e,this.name=Ze.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,s=t.length;n<s;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,s=t.cache.get(n);if(s)return s;let r=t.json,c=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],l,u=new be(16777215);c.color!==void 0&&u.setRGB(c.color[0],c.color[1],c.color[2],rn);let h=c.range!==void 0?c.range:0;switch(c.type){case"directional":l=new ji(u),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new fn(u),l.distance=h;break;case"spot":l=new Ss(u),l.distance=h,c.spot=c.spot||{},c.spot.innerConeAngle=c.spot.innerConeAngle!==void 0?c.spot.innerConeAngle:0,c.spot.outerConeAngle=c.spot.outerConeAngle!==void 0?c.spot.outerConeAngle:Math.PI/4,l.angle=c.spot.outerConeAngle,l.penumbra=1-c.spot.innerConeAngle/c.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+c.type)}return l.position.set(0,0,0),l.decay=2,Mi(l,c),c.intensity!==void 0&&(l.intensity=c.intensity),l.name=t.createUniqueName(c.name||"light_"+e),s=Promise.resolve(l),t.cache.add(n,s),s}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(c){return n._getNodeRef(t.cache,a,c)})}},Ru=class{constructor(){this.name=Ze.KHR_MATERIALS_UNLIT}getMaterialType(){return wt}extendParams(e,t,n){let s=[];e.color=new be(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],rn),e.opacity=o[3]}r.baseColorTexture!==void 0&&s.push(n.assignTexture(e,"map",r.baseColorTexture,St))}return Promise.all(s)}},Cu=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}},Iu=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){let a=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new Le(a,a)}return Promise.all(r)}},Pu=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_DISPERSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}},Lu=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(r)}},Du=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_SHEEN}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[];t.sheenColor=new be(0,0,0),t.sheenRoughness=0,t.sheen=1;let o=s.extensions[this.name];if(o.sheenColorFactor!==void 0){let a=o.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],rn)}return o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",o.sheenColorTexture,St)),o.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(r)}},Nu=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(r)}},Uu=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_VOLUME}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;let a=o.attenuationColor||[1,1,1];return t.attenuationColor=new be().setRGB(a[0],a[1],a[2],rn),Promise.all(r)}},Ou=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_IOR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){let s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=s.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}},Fu=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_SPECULAR}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",o.specularTexture));let a=o.specularColorFactor||[1,1,1];return t.specularColor=new be().setRGB(a[0],a[1],a[2],rn),o.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",o.specularColorTexture,St)),Promise.all(r)}},Bu=class{constructor(e){this.parser=e,this.name=Ze.EXT_MATERIALS_BUMP}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return t.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",o.bumpTexture)),Promise.all(r)}},zu=class{constructor(e){this.parser=e,this.name=Ze.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Mn}extendMaterialParams(e,t){let n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();let r=[],o=s.extensions[this.name];return o.anisotropyStrength!==void 0&&(t.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(t.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",o.anisotropyTexture)),Promise.all(r)}},Hu=class{constructor(e){this.parser=e,this.name=Ze.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,s=n.textures[e];if(!s.extensions||!s.extensions[this.name])return null;let r=s.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}},ku=class{constructor(e){this.parser=e,this.name=Ze.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=s.images[o.source],c=n.textureLoader;if(a.uri){let l=n.options.manager.getHandler(a.uri);l!==null&&(c=l)}return this.detectSupport().then(function(l){if(l)return n.loadTextureImage(e,o.source,c);if(s.extensionsRequired&&s.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){let t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}},Vu=class{constructor(e){this.parser=e,this.name=Ze.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=s.images[o.source],c=n.textureLoader;if(a.uri){let l=n.options.manager.getHandler(a.uri);l!==null&&(c=l)}return this.detectSupport().then(function(l){if(l)return n.loadTextureImage(e,o.source,c);if(s.extensionsRequired&&s.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){let t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}},Gu=class{constructor(e){this.name=Ze.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let s=n.extensions[this.name],r=this.parser.getDependency("buffer",s.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){let c=s.byteOffset||0,l=s.byteLength||0,u=s.count,h=s.byteStride,f=new Uint8Array(a,c,l);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(u,h,f,s.mode,s.filter).then(function(p){return p.buffer}):o.ready.then(function(){let p=new ArrayBuffer(u*h);return o.decodeGltfBuffer(new Uint8Array(p),u,h,f,s.mode,s.filter),p})})}else return null}},Wu=class{constructor(e){this.name=Ze.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let s=t.meshes[n.mesh];for(let l of s.primitives)if(l.mode!==Pn.TRIANGLES&&l.mode!==Pn.TRIANGLE_STRIP&&l.mode!==Pn.TRIANGLE_FAN&&l.mode!==void 0)return null;let o=n.extensions[this.name].attributes,a=[],c={};for(let l in o)a.push(this.parser.getDependency("accessor",o[l]).then(u=>(c[l]=u,c[l])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(l=>{let u=l.pop(),h=u.isGroup?u.children:[u],f=l[0].count,p=[];for(let g of h){let x=new Ee,m=new w,d=new ct,E=new w(1,1,1),b=new Ia(g.geometry,g.material,f);for(let y=0;y<f;y++)c.TRANSLATION&&m.fromBufferAttribute(c.TRANSLATION,y),c.ROTATION&&d.fromBufferAttribute(c.ROTATION,y),c.SCALE&&E.fromBufferAttribute(c.SCALE,y),b.setMatrixAt(y,x.compose(m,d,E));for(let y in c)if(y==="_COLOR_0"){let U=c[y];b.instanceColor=new vs(U.array,U.itemSize,U.normalized)}else y!=="TRANSLATION"&&y!=="ROTATION"&&y!=="SCALE"&&g.geometry.setAttribute(y,c[y]);Et.prototype.copy.call(b,g),this.parser.assignFinalMaterial(b),p.push(b)}return u.isGroup?(u.clear(),u.add(...p),u):p[0]}))}},Bd="glTF",vo=12,Nd={JSON:1313821514,BIN:5130562},Xu=class{constructor(e){this.name=Ze.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,vo),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Bd)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let s=this.header.length-vo,r=new DataView(e,vo),o=0;for(;o<s;){let a=r.getUint32(o,!0);o+=4;let c=r.getUint32(o,!0);if(o+=4,c===Nd.JSON){let l=new Uint8Array(e,vo+o,a);this.content=n.decode(l)}else if(c===Nd.BIN){let l=vo+o;this.body=e.slice(l,l+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},qu=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=Ze.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,s=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},c={},l={};for(let u in o){let h=Ju[u]||u.toLowerCase();a[h]=o[u]}for(let u in e.attributes){let h=Ju[u]||u.toLowerCase();if(o[u]!==void 0){let f=n.accessors[e.attributes[u]],p=yr[f.componentType];l[h]=p.name,c[h]=f.normalized===!0}}return t.getDependency("bufferView",r).then(function(u){return new Promise(function(h,f){s.decodeDracoFile(u,function(p){for(let g in p.attributes){let x=p.attributes[g],m=c[g];m!==void 0&&(x.normalized=m)}h(p)},a,l,rn,f)})})}},Yu=class{constructor(){this.name=Ze.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}},Zu=class{constructor(){this.name=Ze.KHR_MESH_QUANTIZATION}},Ya=class extends Ki{constructor(e,t,n,s){super(e,t,n,s)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s*3+s;for(let o=0;o!==s;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=a*2,l=a*3,u=s-t,h=(n-t)/u,f=h*h,p=f*h,g=e*l,x=g-l,m=-2*p+3*f,d=p-f,E=1-m,b=d-f+h;for(let y=0;y!==a;y++){let U=o[x+y+a],R=o[x+y+c]*u,C=o[g+y+a],I=o[g+y]*u;r[y]=E*U+b*R+m*C+d*I}return r}},av=new ct,Ku=class extends Ya{interpolate_(e,t,n,s){let r=super.interpolate_(e,t,n,s);return av.fromArray(r).normalize().toArray(r),r}},Pn={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},yr={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Ud={9728:Bt,9729:qt,9984:lu,9985:Jr,9986:Js,9987:Kn},Od={33071:fi,33648:io,10497:jn},bu={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Ju={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},es={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},cv={CUBICSPLINE:void 0,LINEAR:lr,STEP:cr},Eu={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function lv(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new Vt({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Jn})),i.DefaultMaterial}function bs(i,e,t){for(let n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function Mi(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function uv(i,e,t){let n=!1,s=!1,r=!1;for(let l=0,u=e.length;l<u;l++){let h=e[l];if(h.POSITION!==void 0&&(n=!0),h.NORMAL!==void 0&&(s=!0),h.COLOR_0!==void 0&&(r=!0),n&&s&&r)break}if(!n&&!s&&!r)return Promise.resolve(i);let o=[],a=[],c=[];for(let l=0,u=e.length;l<u;l++){let h=e[l];if(n){let f=h.POSITION!==void 0?t.getDependency("accessor",h.POSITION):i.attributes.position;o.push(f)}if(s){let f=h.NORMAL!==void 0?t.getDependency("accessor",h.NORMAL):i.attributes.normal;a.push(f)}if(r){let f=h.COLOR_0!==void 0?t.getDependency("accessor",h.COLOR_0):i.attributes.color;c.push(f)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(c)]).then(function(l){let u=l[0],h=l[1],f=l[2];return n&&(i.morphAttributes.position=u),s&&(i.morphAttributes.normal=h),r&&(i.morphAttributes.color=f),i.morphTargetsRelative=!0,i})}function hv(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,s=t.length;n<s;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function fv(i){let e,t=i.extensions&&i.extensions[Ze.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Tu(t.attributes):e=i.indices+":"+Tu(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,s=i.targets.length;n<s;n++)e+=":"+Tu(i.targets[n]);return e}function Tu(i){let e="",t=Object.keys(i).sort();for(let n=0,s=t.length;n<s;n++)e+=t[n]+":"+i[t[n]]+";";return e}function $u(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function dv(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var pv=new Ee,ju=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new ov,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,s=-1,r=!1,o=-1;if(typeof navigator<"u"){let a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;let c=a.match(/Version\/(\d+)/);s=n&&c?parseInt(c[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&s<17||r&&o<98?this.textureLoader=new Ms(this.options.manager):this.textureLoader=new Ha(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new po(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,s=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){let a={scene:o[0][s.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:s.asset,parser:n,userData:{}};return bs(r,a,s),Mi(a,s),Promise.all(n._invokeAll(function(c){return c.afterRoot&&c.afterRoot(a)})).then(function(){for(let c of a.scenes)c.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){let o=t[s].joints;for(let a=0,c=o.length;a<c;a++)e[o[a]].isBone=!0}for(let s=0,r=e.length;s<r;s++){let o=e[s];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let s=n.clone(),r=(o,a)=>{let c=this.associations.get(o);c!=null&&this.associations.set(a,c);for(let[l,u]of o.children.entries())r(u,a.children[l])};return r(n,s),s.name+="_instance_"+e.uses[t]++,s}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let s=e(t[n]);if(s)return s}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let s=0;s<t.length;s++){let r=e(t[s]);r&&n.push(r)}return n}getDependency(e,t){let n=e+":"+t,s=this.cache.get(n);if(!s){switch(e){case"scene":s=this.loadScene(t);break;case"node":s=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":s=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":s=this.loadAccessor(t);break;case"bufferView":s=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":s=this.loadBuffer(t);break;case"material":s=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":s=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":s=this.loadSkin(t);break;case"animation":s=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":s=this.loadCamera(t);break;default:if(s=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!s)throw new Error("Unknown type: "+e);break}this.cache.add(n,s)}return s}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,s=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(s.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Ze.KHR_BINARY_GLTF].body);let s=this.options;return new Promise(function(r,o){n.load(Qi.resolveURL(t.uri,s.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let s=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+s)})}loadAccessor(e){let t=this,n=this.json,s=this.json.accessors[e];if(s.bufferView===void 0&&s.sparse===void 0){let o=bu[s.type],a=yr[s.componentType],c=s.normalized===!0,l=new a(s.count*o);return Promise.resolve(new bt(l,o,c))}let r=[];return s.bufferView!==void 0?r.push(this.getDependency("bufferView",s.bufferView)):r.push(null),s.sparse!==void 0&&(r.push(this.getDependency("bufferView",s.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",s.sparse.values.bufferView))),Promise.all(r).then(function(o){let a=o[0],c=bu[s.type],l=yr[s.componentType],u=l.BYTES_PER_ELEMENT,h=u*c,f=s.byteOffset||0,p=s.bufferView!==void 0?n.bufferViews[s.bufferView].byteStride:void 0,g=s.normalized===!0,x,m;if(p&&p!==h){let d=Math.floor(f/p),E="InterleavedBuffer:"+s.bufferView+":"+s.componentType+":"+d+":"+s.count,b=t.cache.get(E);b||(x=new l(a,d*p,s.count*p/u),b=new pr(x,p/u),t.cache.add(E,b)),m=new ys(b,c,f%p/u,g)}else a===null?x=new l(s.count*c):x=new l(a,f,s.count*c),m=new bt(x,c,g);if(s.sparse!==void 0){let d=bu.SCALAR,E=yr[s.sparse.indices.componentType],b=s.sparse.indices.byteOffset||0,y=s.sparse.values.byteOffset||0,U=new E(o[1],b,s.sparse.count*d),R=new l(o[2],y,s.sparse.count*c);a!==null&&(m=new bt(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let C=0,I=U.length;C<I;C++){let S=U[C];if(m.setX(S,R[C*c]),c>=2&&m.setY(S,R[C*c+1]),c>=3&&m.setZ(S,R[C*c+2]),c>=4&&m.setW(S,R[C*c+3]),c>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=g}return m})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r],a=this.textureLoader;if(o.uri){let c=n.manager.getHandler(o.uri);c!==null&&(a=c)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){let s=this,r=this.json,o=r.textures[e],a=r.images[t],c=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[c])return this.textureCache[c];let l=this.loadImageSource(t,n).then(function(u){u.flipY=!1,u.name=o.name||a.name||"",u.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(u.name=a.uri);let f=(r.samplers||{})[o.sampler]||{};return u.magFilter=Ud[f.magFilter]||qt,u.minFilter=Ud[f.minFilter]||Kn,u.wrapS=Od[f.wrapS]||jn,u.wrapT=Od[f.wrapT]||jn,u.generateMipmaps=!u.isCompressedTexture&&u.minFilter!==Bt&&u.minFilter!==qt,s.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[c]=l,l}loadImageSource(e,t){let n=this,s=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());let o=s.images[e],a=self.URL||self.webkitURL,c=o.uri||"",l=!1;if(o.bufferView!==void 0)c=n.getDependency("bufferView",o.bufferView).then(function(h){l=!0;let f=new Blob([h],{type:o.mimeType});return c=a.createObjectURL(f),c});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let u=Promise.resolve(c).then(function(h){return new Promise(function(f,p){let g=f;t.isImageBitmapLoader===!0&&(g=function(x){let m=new zt(x);m.needsUpdate=!0,f(m)}),t.load(Qi.resolveURL(h,r.path),g,void 0,p)})}).then(function(h){return l===!0&&a.revokeObjectURL(c),Mi(h,o),h.userData.mimeType=o.mimeType||dv(o.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",c),h});return this.sourceCache[e]=u,u}assignTexture(e,t,n,s){let r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[Ze.KHR_TEXTURE_TRANSFORM]){let a=n.extensions!==void 0?n.extensions[Ze.KHR_TEXTURE_TRANSFORM]:void 0;if(a){let c=r.associations.get(o);o=r.extensions[Ze.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,c)}}return s!==void 0&&(o.colorSpace=s),e[t]=o,o})}assignFinalMaterial(e){let t=e.geometry,n=e.material,s=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){let a="PointsMaterial:"+n.uuid,c=this.cache.get(a);c||(c=new uo,hn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,c.sizeAttenuation=!1,this.cache.add(a,c)),n=c}else if(e.isLine){let a="LineBasicMaterial:"+n.uuid,c=this.cache.get(a);c||(c=new lo,hn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,this.cache.add(a,c)),n=c}if(s||r||o){let a="ClonedMaterial:"+n.uuid+":";s&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let c=this.cache.get(a);c||(c=n.clone(),r&&(c.vertexColors=!0),o&&(c.flatShading=!0),s&&(c.normalScale&&(c.normalScale.y*=-1),c.clearcoatNormalScale&&(c.clearcoatNormalScale.y*=-1)),this.cache.add(a,c),this.associations.set(c,this.associations.get(n))),n=c}e.material=n}getMaterialType(){return Vt}loadMaterial(e){let t=this,n=this.json,s=this.extensions,r=n.materials[e],o,a={},c=r.extensions||{},l=[];if(c[Ze.KHR_MATERIALS_UNLIT]){let h=s[Ze.KHR_MATERIALS_UNLIT];o=h.getMaterialType(),l.push(h.extendParams(a,r,t))}else{let h=r.pbrMetallicRoughness||{};if(a.color=new be(1,1,1),a.opacity=1,Array.isArray(h.baseColorFactor)){let f=h.baseColorFactor;a.color.setRGB(f[0],f[1],f[2],rn),a.opacity=f[3]}h.baseColorTexture!==void 0&&l.push(t.assignTexture(a,"map",h.baseColorTexture,St)),a.metalness=h.metallicFactor!==void 0?h.metallicFactor:1,a.roughness=h.roughnessFactor!==void 0?h.roughnessFactor:1,h.metallicRoughnessTexture!==void 0&&(l.push(t.assignTexture(a,"metalnessMap",h.metallicRoughnessTexture)),l.push(t.assignTexture(a,"roughnessMap",h.metallicRoughnessTexture))),o=this._invokeOne(function(f){return f.getMaterialType&&f.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(f){return f.extendMaterialParams&&f.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=tn);let u=r.alphaMode||Eu.OPAQUE;if(u===Eu.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,u===Eu.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==wt&&(l.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new Le(1,1),r.normalTexture.scale!==void 0)){let h=r.normalTexture.scale;a.normalScale.set(h,h)}if(r.occlusionTexture!==void 0&&o!==wt&&(l.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==wt){let h=r.emissiveFactor;a.emissive=new be().setRGB(h[0],h[1],h[2],rn)}return r.emissiveTexture!==void 0&&o!==wt&&l.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,St)),Promise.all(l).then(function(){let h=new o(a);return r.name&&(h.name=r.name),Mi(h,r),t.associations.set(h,{materials:e}),r.extensions&&bs(s,h,r),h})}createUniqueName(e){let t=pt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,s=this.primitiveCache;function r(a){return n[Ze.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(c){return Fd(c,a,t)})}let o=[];for(let a=0,c=e.length;a<c;a++){let l=e[a],u=fv(l),h=s[u];if(h)o.push(h.promise);else{let f;l.extensions&&l.extensions[Ze.KHR_DRACO_MESH_COMPRESSION]?f=r(l):f=Fd(new Zt,l,t),s[u]={primitive:l,promise:f},o.push(f)}}return Promise.all(o)}loadMesh(e){let t=this,n=this.json,s=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let c=0,l=o.length;c<l;c++){let u=o[c].material===void 0?lv(this.cache):this.getDependency("material",o[c].material);a.push(u)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(c){let l=c.slice(0,c.length-1),u=c[c.length-1],h=[];for(let p=0,g=u.length;p<g;p++){let x=u[p],m=o[p],d,E=l[p];if(m.mode===Pn.TRIANGLES||m.mode===Pn.TRIANGLE_STRIP||m.mode===Pn.TRIANGLE_FAN||m.mode===void 0)d=r.isSkinnedMesh===!0?new wa(x,E):new Se(x,E),d.isSkinnedMesh===!0&&d.normalizeSkinWeights(),m.mode===Pn.TRIANGLE_STRIP?d.geometry=Su(d.geometry,Ga):m.mode===Pn.TRIANGLE_FAN&&(d.geometry=Su(d.geometry,yo));else if(m.mode===Pn.LINES)d=new Da(x,E);else if(m.mode===Pn.LINE_STRIP)d=new mr(x,E);else if(m.mode===Pn.LINE_LOOP)d=new Na(x,E);else if(m.mode===Pn.POINTS)d=new Ua(x,E);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(d.geometry.morphAttributes).length>0&&hv(d,r),d.name=t.createUniqueName(r.name||"mesh_"+e),Mi(d,r),m.extensions&&bs(s,d,m),t.assignFinalMaterial(d),h.push(d)}for(let p=0,g=h.length;p<g;p++)t.associations.set(h[p],{meshes:e,primitives:p});if(h.length===1)return r.extensions&&bs(s,h[0],r),h[0];let f=new It;r.extensions&&bs(s,f,r),t.associations.set(f,{meshes:e});for(let p=0,g=h.length;p<g;p++)f.add(h[p]);return f})}loadCamera(e){let t,n=this.json.cameras[e],s=n[n.type];if(!s){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Ft(Ad.radToDeg(s.yfov),s.aspectRatio||1,s.znear||1,s.zfar||2e6):n.type==="orthographic"&&(t=new Zi(-s.xmag,s.xmag,s.ymag,-s.ymag,s.znear,s.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Mi(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let s=0,r=t.joints.length;s<r;s++)n.push(this._loadNodeShallow(t.joints[s]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(s){let r=s.pop(),o=s,a=[],c=[];for(let l=0,u=o.length;l<u;l++){let h=o[l];if(h){a.push(h);let f=new Ee;r!==null&&f.fromArray(r.array,l*16),c.push(f)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new Ca(a,c)})}loadAnimation(e){let t=this.json,n=this,s=t.animations[e],r=s.name?s.name:"animation_"+e,o=[],a=[],c=[],l=[],u=[];for(let h=0,f=s.channels.length;h<f;h++){let p=s.channels[h],g=s.samplers[p.sampler],x=p.target,m=x.node,d=s.parameters!==void 0?s.parameters[g.input]:g.input,E=s.parameters!==void 0?s.parameters[g.output]:g.output;x.node!==void 0&&(o.push(this.getDependency("node",m)),a.push(this.getDependency("accessor",d)),c.push(this.getDependency("accessor",E)),l.push(g),u.push(x))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(c),Promise.all(l),Promise.all(u)]).then(function(h){let f=h[0],p=h[1],g=h[2],x=h[3],m=h[4],d=[];for(let E=0,b=f.length;E<b;E++){let y=f[E],U=p[E],R=g[E],C=x[E],I=m[E];if(y===void 0)continue;y.updateMatrix&&y.updateMatrix();let S=n._createAnimationTracks(y,U,R,C,I);if(S)for(let v=0;v<S.length;v++)d.push(S[v])}return new gr(r,void 0,d)})}createNodeMesh(e){let t=this.json,n=this,s=t.nodes[e];return s.mesh===void 0?null:n.getDependency("mesh",s.mesh).then(function(r){let o=n._getNodeRef(n.meshCache,s.mesh,r);return s.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let c=0,l=s.weights.length;c<l;c++)a.morphTargetInfluences[c]=s.weights[c]}),o})}loadNode(e){let t=this.json,n=this,s=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=s.children||[];for(let l=0,u=a.length;l<u;l++)o.push(n.getDependency("node",a[l]));let c=s.skin===void 0?Promise.resolve(null):n.getDependency("skin",s.skin);return Promise.all([r,Promise.all(o),c]).then(function(l){let u=l[0],h=l[1],f=l[2];f!==null&&u.traverse(function(p){p.isSkinnedMesh&&p.bind(f,pv)});for(let p=0,g=h.length;p<g;p++)u.add(h[p]);return u})}_loadNodeShallow(e){let t=this.json,n=this.extensions,s=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],o=r.name?s.createUniqueName(r.name):"",a=[],c=s._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});return c&&a.push(c),r.camera!==void 0&&a.push(s.getDependency("camera",r.camera).then(function(l){return s._getNodeRef(s.cameraCache,r.camera,l)})),s._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){a.push(l)}),this.nodeCache[e]=Promise.all(a).then(function(l){let u;if(r.isBone===!0?u=new co:l.length>1?u=new It:l.length===1?u=l[0]:u=new Et,u!==l[0])for(let h=0,f=l.length;h<f;h++)u.add(l[h]);if(r.name&&(u.userData.name=r.name,u.name=o),Mi(u,r),r.extensions&&bs(n,u,r),r.matrix!==void 0){let h=new Ee;h.fromArray(r.matrix),u.applyMatrix4(h)}else r.translation!==void 0&&u.position.fromArray(r.translation),r.rotation!==void 0&&u.quaternion.fromArray(r.rotation),r.scale!==void 0&&u.scale.fromArray(r.scale);return s.associations.has(u)||s.associations.set(u,{}),s.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],s=this,r=new It;n.name&&(r.name=s.createUniqueName(n.name)),Mi(r,n),n.extensions&&bs(t,r,n);let o=n.nodes||[],a=[];for(let c=0,l=o.length;c<l;c++)a.push(s.getDependency("node",o[c]));return Promise.all(a).then(function(c){for(let u=0,h=c.length;u<h;u++)r.add(c[u]);let l=u=>{let h=new Map;for(let[f,p]of s.associations)(f instanceof hn||f instanceof zt)&&h.set(f,p);return u.traverse(f=>{let p=s.associations.get(f);p!=null&&h.set(f,p)}),h};return s.associations=l(r),r})}_createAnimationTracks(e,t,n,s,r){let o=[],a=e.name?e.name:e.uuid,c=[];es[r.path]===es.weights?e.traverse(function(f){f.morphTargetInfluences&&c.push(f.name?f.name:f.uuid)}):c.push(a);let l;switch(es[r.path]){case es.weights:l=_i;break;case es.rotation:l=yi;break;case es.position:case es.scale:l=vi;break;default:n.itemSize===1?l=_i:l=vi;break}let u=s.interpolation!==void 0?cv[s.interpolation]:lr,h=this._getArrayFromAccessor(n);for(let f=0,p=c.length;f<p;f++){let g=new l(c[f]+"."+es[r.path],t.array,h,u);s.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(g),o.push(g)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=$u(t.constructor),s=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)s[r]=t[r]*n;t=s}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let s=this instanceof yi?Ku:Ya;return new s(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function mv(i,e,t){let n=e.attributes,s=new Cn;if(n.POSITION!==void 0){let a=t.json.accessors[n.POSITION],c=a.min,l=a.max;if(c!==void 0&&l!==void 0){if(s.set(new w(c[0],c[1],c[2]),new w(l[0],l[1],l[2])),a.normalized){let u=$u(yr[a.componentType]);s.min.multiplyScalar(u),s.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let a=new w,c=new w;for(let l=0,u=r.length;l<u;l++){let h=r[l];if(h.POSITION!==void 0){let f=t.json.accessors[h.POSITION],p=f.min,g=f.max;if(p!==void 0&&g!==void 0){if(c.setX(Math.max(Math.abs(p[0]),Math.abs(g[0]))),c.setY(Math.max(Math.abs(p[1]),Math.abs(g[1]))),c.setZ(Math.max(Math.abs(p[2]),Math.abs(g[2]))),f.normalized){let x=$u(yr[f.componentType]);c.multiplyScalar(x)}a.max(c)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(a)}i.boundingBox=s;let o=new An;s.getCenter(o.center),o.radius=s.min.distanceTo(s.max)/2,i.boundingSphere=o}function Fd(i,e,t){let n=e.attributes,s=[];function r(o,a){return t.getDependency("accessor",o).then(function(c){i.setAttribute(a,c)})}for(let o in n){let a=Ju[o]||o.toLowerCase();a in i.attributes||s.push(r(n[o],a))}if(e.indices!==void 0&&!i.index){let o=t.getDependency("accessor",e.indices).then(function(a){i.setIndex(a)});s.push(o)}return Je.workingColorSpace!==rn&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Je.workingColorSpace}" not supported.`),Mi(i,e),mv(i,e,t),Promise.all(s).then(function(){return e.targets!==void 0?uv(i,e.targets,t):i})}var Ao=class extends dr{constructor(){super();let e=new ei;e.deleteAttribute("uv");let t=new Vt({side:nn}),n=new Vt,s=new fn(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new Se(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let o=new Se(e,n);o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),this.add(o);let a=new Se(e,n);a.position.set(-5.607,-.754,-.758),a.rotation.set(0,.994,0),a.scale.set(1.97,1.534,3.955),this.add(a);let c=new Se(e,n);c.position.set(6.167,.857,7.803),c.rotation.set(0,.561,0),c.scale.set(3.927,6.285,3.687),this.add(c);let l=new Se(e,n);l.position.set(-2.017,.018,6.124),l.rotation.set(0,.333,0),l.scale.set(2.002,4.566,2.064),this.add(l);let u=new Se(e,n);u.position.set(2.291,-.756,-2.621),u.rotation.set(0,-.286,0),u.scale.set(1.546,1.552,1.496),this.add(u);let h=new Se(e,n);h.position.set(-2.193,-.369,-5.547),h.rotation.set(0,.516,0),h.scale.set(3.875,3.487,2.986),this.add(h);let f=new Se(e,vr(50));f.position.set(-16.116,14.37,8.208),f.scale.set(.1,2.428,2.739),this.add(f);let p=new Se(e,vr(50));p.position.set(-16.109,18.021,-8.207),p.scale.set(.1,2.425,2.751),this.add(p);let g=new Se(e,vr(17));g.position.set(14.904,12.198,-1.832),g.scale.set(.15,4.265,6.331),this.add(g);let x=new Se(e,vr(43));x.position.set(-.462,8.89,14.52),x.scale.set(4.38,5.441,.088),this.add(x);let m=new Se(e,vr(20));m.position.set(3.235,11.486,-12.541),m.scale.set(2.5,2,.1),this.add(m);let d=new Se(e,vr(100));d.position.set(0,20,0),d.scale.set(1,.1,1),this.add(d)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function vr(i){let e=new wt;return e.color.setScalar(i),e}var Re={image:[4384,1872],tex:.9343065693430657,f:3535,cx:2110,cy:936,phi:.27986816800749803,camH:11.774928817533455,xoff:9.8,dmax:39.8,grille:{pas:.2,nx:125,ny:100,x0:-3,libre:"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP////////////////+AAAf////////////////8AAA/////////////////4AAB/////////////////wAAD/////////////////gAAH/////////////////AAAP////////////////+AAAf////////////////8AAA/////////////////4AAB/////////////////wAAD/////////////////gAAH/////////////////AAAP////////////////+AAA/////////////////8AAB/////////////////4AAD/////////////////wAAH/////////////////AAAP////////////////+AAAf////////////////8AAA/////////////////4AAB/////////////////wAAD/////////////////gAAH/////////////////AAAP////////////////+AAAf////////////////8AAA/////////////////4AAB/////////////////wAAD/////////////////gAAH/////////////////AAAP////////////////+AAAf////////////////8AAB/////////////////4AAD/////////////////wAAH/////////////////gAAP/////////////////AAAf////////////////+AAA/////////////////8AAB/////////////////4AAD/////////////////wAAH/////////////////gAAP/////////////////AAAf////////////////+AAA/////////////////8AAB/////////////////4AAD/////////////////wAAH/////////////////AAAP////////////////+AAAf////////////////8AAA/////////////////4AAB/////////////////wAAH/////////////////gAAP/////////////////AAAf////////////////+AAA/////////////////8AAB/////////////////4AAD/////////////////wAAH/////////////////gAAP/////////////////AAAf////////////////+AAA/////////////////8AAB/////////////////4AAD/////////////////wAAH/////////////////gAAP/////////////////AAAf////////////////+AAA/////////////////8AAB/////////////////4AAD/////////////////wAAP/////////////////gAAf/////////////////AAA/////////////////+AAB/////////////////8AAD/////////////////4AAH/////////////////wAAP//////////////+P/AAAf8H////////////wH+AAA/wH////////////gP8AAB/AH///////////+AP4AAD+AP///////////8AfwAAH8Af///////////4A/gAAP8B////////////4D/AAAf4D////////////4P+AAA/4P////////////9/8AAB/////////////////4AAD/////////////////wAAH/////////////////gAAf/////////////////AAA/////////////////+AAB/////////////////8AAD/////////////////4AAH/////////////////wAAP/////////////////gAAf/////////////////AAA/////////////////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",crevasse:"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAA/AAAAAAAAAAAAAAAP+AAB/AAAAAAAAAAAAAAAf8AAD+AAAAAAAAAAAAAAA/4AAH8AAAAAAAAAAAAAAB/4AAP8AAAAAAAAAAAAAAD/wAAf8AAAAAAAAAAAAAAf/gAA/4AAAAAAAAAAAAAB//AAB/wAAAAAAAAAAAAAD/+AAB/gAAAAAAAAAAAAAH/8AAD/AAAAAAAAAAAAAAP/wAAH+AAAAAAAAAAAAAAf/AAAP8AAAAAAAAAAAAAA/4AAA/4AAAAAAAAAAAAAB/wAAB/gAAAAAAAAAAAAAD/gAAf/AAAAAAAAAAAAAAH/AAA/+AAAAAAAAAAAAAAP+AAB/8AAAAAAAAAAAAAAP8AAD/4AAAAAAAAAAAAAAf4AAH/wAAAAAAAAAAAAAA/gAAP/gAAAAAAAAAAAAAD/AAAf/gAAAAAAAAAAAAAH+AAA//AAAAAAAAAAAAAAP+AAB/+AAAAAAAAAAAAAAf+AAD/8AAAAAAAAAAAAAA/8AAD/8AAAAAAAAAAAAAB/8AAD/8AAAAAAAAAAAAAH/4AAH//AAAAAAAAAAAAAP/wAAP/+AAAAAAAAAAAAAf/gAAP/8AAAAAAAAAAAAA//AAAf/4AAAAAAAAAAAAB/+AAAf/wAAAAAAAAAAAAf/4AAA//gAAAAAAAAAAAD//AAAB//AAAAAAAAAAAAP/+AAAD/4AAAAAAAAAAAA//8AAAH/wAAAAAAAAAAAB//4AAAP/gAAAAAAAAAAAD//wAAAf/AAAAAAAAAAAAH//gAAA//AAAAAAAAAAAAP//AAAB/+AAAAAAAAAAAAf/+AAAD/8AAAAAAAAAAAD//8AAAH/4AAAAAAAAAAAP//4AAAP/wAAAAAAAAAAA///wAAAf/gAAAAAAAAAAP///gAAA//AAAAAAAAAAAf///AAAD/+AAAAAAAAAAA///+AAAH/8AAAAAAAAAAB///8AAAf/gAAAAAAAAAAP///wAAA//AAAAAAAAAAAf///gAAB/8AAAAAAAAAAA///8AAAD/4AAAAAAAAAAB///4AAAH/wAAAAAAAAAAD///wAAB//gAAAAAAAAAAH///gAAD//AAAAAAAAAAAH///AAAH//AAAAAAAAAAAH//+AAAP/+AAAAAAAAAAAD//8AAAf/8AAAAAAAAAAAD//4AAA//4AAAAAAAAAAAA//wAAB//wAAAAAAAAAAAAf/gAAAH/gAAAAAAAAAAAA//AAAAH/AAAAAAAAAAAAB/+AAAAP/AAAAAAAAAAAAD/8AAAAf/AAAAAAAAAAAAH/4AAAA/+AAAAAAAAAAAAf/wAAAB/+AAAAAAAAAAAA//gAAAH/8AAAAAAAAAAAB//AAAAP/4AAAAAAAAAAAH/+AAAAf/4AAAAAAAAAAAP/8AAAA//4AAAAAAAAAAAf/4AAAD//4AAAAAAAAAAA//wAAAP//wAAAAAAAAAAB//gAAB///gAAAAAAAAAAD//wAAD///AAAAAAAAAAAH//gAAH//+AAAAAAAAAAAP//AAAP//8AAAAAAAAAAA//+AAAf/+AAAAAAAAAAAB//8AAA//wAAAAAAAAAAAH//4AAB//gAAAAAAAAAAAP//gAAD//AAAAAAAAAAAAf8AAAAH//AAAAAAAAAAAA/4AAAAP/+AAAAAAAAAAAB/wAAAAf/8AAAAAAAAAAAD/gAAAA//8AAAAAAAAAAAH/AAAAB//4AAAAAAAAAAAP+AAAAB//wAAAAAAAAAAA/8AAAAD//wAAAAAAAAAAD/4AAAAH//gAAAAAAAAAAH/wAAAAP//gAAAAAAAAAAP/wAAAAf//AAAAAAAAAAAf/gAAAA//+AAAAAAAAAAA//AAAAAD/+AAAAAAAAAAB/+AAAAAH/8AAAAAAAAAAD/8AAAAAP/4AAAAAAAAAAH/4AAAAAf/wAAAAAAAAAAP/wAAAAA//gAAAAAAAAAAf/gAAAAB//AAAAAAAAAAA/gAAAAAD/+AAAAAAAAAAB+AAAAAAH/8AAAAAAAAAAD8AAAAAAB/4AAAAAAAAAAAAAAAAAAAAAAAAAA"},piliers:[{nom:"g",x:-8.100683720421685,d:23.64800593670872,rect:[860,980,320,700],lanterne:3.0369328576313213,haut:4.431714147996532,gauche:-8.988438421541359,droite:-7.004073438862564},{nom:"d",x:8.496730085940312,d:23.729330416396014,rect:[3110,1010,320,670],lanterne:3.006660359091314,haut:4.413817176895913,gauche:7.408468396524,droite:9.376688358585602}],crev:[1097,933,2098,939],armure:{x:10.856690894654049,y:-5.973367061048528,z:2},porte:{x:10.49520716108876,y:-4.457163662500378,z:4},depart:{x:10.67,y:6.059999999999995}};var zd=[{paire:0,pied:[1780,1290],x:6.85,y:10.29,haut:3.79,larg:3,sommet:881,rect:[1511,838,584,773],couleur:[.56,.754,1],eclat:{rect:[1306,606,993,1066],tuile:[496,533],cols:8,n:30,atlas:[3968,2132]}},{paire:0,pied:[2190,1030],x:10.68,y:2.59,haut:4.4,larg:2.11,sommet:638,rect:[2006,453,401,865],couleur:[.808,.604,1],eclat:{rect:[1865,250,682,1137],tuile:[341,568],cols:12,n:30,atlas:[4092,1704]}},{paire:0,pied:[2550,1130],x:14.26,y:5.94,haut:4.52,larg:1.77,sommet:692,rect:[2309,651,447,723],couleur:[.726,1,.8],eclat:{rect:[2152,434,760,997],tuile:[380,498],cols:10,n:30,atlas:[3800,1494]}},{paire:0,pied:[2700,1570],x:14.18,y:15.87,haut:2.98,larg:2.15,sommet:1192,rect:[2311,1150,631,675],couleur:[.547,.983,1],eclat:{rect:[2090,947,1072,925],tuile:[536,462],cols:7,n:30,atlas:[3752,2310]}},{paire:1,pied:[1800,1240],x:6.92,y:9.05,haut:5.98,larg:2.88,sommet:604,rect:[1511,568,644,1074],couleur:[.476,.753,1],eclat:{rect:[1285,250,1095,1477],tuile:[547,738],cols:7,n:30,atlas:[3829,3690]}},{paire:1,pied:[2760,1e3],x:17.17,y:1.46,haut:6.18,larg:2.56,sommet:456,rect:[2510,415,533,812],couleur:[.592,1,.979],eclat:{rect:[2323,250,906,1041],tuile:[453,520],cols:9,n:30,atlas:[4077,2080]}},{paire:1,pied:[2740,1700],x:14.14,y:17.87,haut:3.56,larg:.67,sommet:1214,rect:[2332,1139,737,733],couleur:[.816,.602,1],eclat:{rect:[2074,919,1252,953],tuile:[626,476],cols:6,n:30,atlas:[3756,2380]}},{paire:2,pied:[1400,1300],x:3.5,y:10.53,haut:2.5,larg:1.99,sommet:1031,rect:[1234,989,352,563],couleur:[.457,.797,1],eclat:{rect:[1110,820,599,777],tuile:[299,388],cols:13,n:30,atlas:[3887,1164]}},{paire:2,pied:[1650,1580],x:6.4,y:16.04,haut:1.55,larg:1.07,sommet:1385,rect:[1501,1344,292,432],couleur:[.721,.461,1],eclat:{rect:[1398,1214,497,596],tuile:[248,298],cols:16,n:30,atlas:[3968,596]}},{paire:2,pied:[2900,1340],x:16.62,y:11.45,haut:3.25,larg:1.97,sommet:979,rect:[2705,937,422,584],couleur:[.651,1,.926],eclat:{rect:[2557,761,717,806],tuile:[358,403],cols:11,n:30,atlas:[3938,1209]}},{paire:2,pied:[2620,1550],x:13.63,y:15.54,haut:1.71,larg:1.03,sommet:1339,rect:[2428,1174,392,492],couleur:[.507,1,.995],eclat:{rect:[2290,1026,667,679],tuile:[333,339],cols:12,n:30,atlas:[3996,1017]}},{paire:3,pied:[1680,1090],x:5.3,y:4.67,haut:5.31,larg:2.29,sommet:589,rect:[1509,547,402,805],couleur:[.439,.691,1],eclat:{rect:[1368,305,683,1111],tuile:[341,555],cols:12,n:30,atlas:[4092,1665]}},{paire:3,pied:[2200,1e3],x:10.82,y:1.46,haut:3.26,larg:1.49,sommet:719,rect:[2055,678,288,430],couleur:[.677,1,.783],eclat:{rect:[1954,549,489,593],tuile:[244,296],cols:16,n:30,atlas:[3904,592]}},{paire:3,pied:[2670,1100],x:15.61,y:5,haut:3.38,larg:1.32,sommet:783,rect:[2540,742,251,487],couleur:[.828,.596,1],eclat:{rect:[2452,595,426,672],tuile:[213,336],cols:19,n:30,atlas:[4047,672]}},{paire:3,pied:[1370,1420],x:3.76,y:13.14,haut:3.41,larg:1.53,sommet:1021,rect:[1233,980,453,654],couleur:[.687,.844,1],eclat:{rect:[1074,783,770,903],tuile:[385,451],cols:10,n:30,atlas:[3850,1353]}},{paire:3,pied:[2520,1580],x:12.83,y:16.04,haut:3.06,larg:1.24,sommet:1190,rect:[2323,1153,432,569],couleur:[.552,1,.983],eclat:{rect:[2171,982,735,785],tuile:[367,392],cols:11,n:30,atlas:[4037,1176]}},{paire:4,pied:[1580,1140],x:4.48,y:6.25,haut:3.5,larg:1.62,sommet:801,rect:[1394,759,425,571],couleur:[.459,.718,1],eclat:{rect:[1245,587,722,788],tuile:[361,394],cols:11,n:30,atlas:[3971,1182]}},{paire:4,pied:[2700,1100],x:15.93,y:5,haut:3.71,larg:1.7,sommet:751,rect:[2429,711,476,548],couleur:[.643,1,.74],eclat:{rect:[2262,546,809,756],tuile:[404,378],cols:10,n:30,atlas:[4040,1134]}},{paire:4,pied:[1690,1580],x:6.7,y:16.04,haut:2.16,larg:1.35,sommet:1307,rect:[1492,1190,512,633],couleur:[.799,.563,1],eclat:{rect:[1312,1e3,871,872],tuile:[435,436],cols:9,n:30,atlas:[3915,1744]}},{paire:4,pied:[2730,1500],x:14.61,y:14.66,haut:2.18,larg:1.36,sommet:1236,rect:[2409,1161,618,545],couleur:[.551,1,.99],eclat:{rect:[2192,997,1051,752],tuile:[525,376],cols:7,n:30,atlas:[3675,1880]}}];var Lt=window.QUI==="pisteur",Ke=!Lt,Ii=40,xh=Ke?.4:.62,ap=70,cp=250,ns=860,is=556,lp=Math.asin(.62),Lo=Ke?1:1/Math.cos(lp),Za={L:18,P:10.5,coin:3.4},ke=Ke?{x:10.62,y:-9.45,z:2,r:1.6,zc:4.3,dy:0}:{x:9,y:1.25,r:1.6,zc:2.3,dy:.6},ws={or:[1.2,5.6],rouge:[16.8,5.6]},up=[[5.15,.75,2.6],[12.85,.75,2.6],[.42,3.85,2.3],[17.58,3.85,2.3]],ft=i=>document.getElementById(i),Rt=(i,e,t)=>i<e?e:i>t?t:i,Io=ft("jeu"),bn=new Ea({canvas:Io,antialias:!0,powerPreference:"high-performance"});bn.setPixelRatio(Math.min(devicePixelRatio||1,2));bn.outputColorSpace=St;bn.toneMapping=cu;bn.toneMappingExposure=1;bn.shadowMap.enabled=!0;bn.shadowMap.type=ou;bn.autoClear=!0;bn.setClearColor(197638,1);var Ti=860,ti=410,wi=0,Ri=0;function _h(){let i=innerWidth,e=innerHeight;ti=Math.max(410,800*e/i)/(window.__zoom||1),Ti=ti*i/e,bn.setSize(i,e,!1)}addEventListener("resize",_h);_h();var dn=new dr,yt=Ke?new Ft(40,1,.5,400):new Zi(-1,1,1,-1,1,400),rs=Ke?Re.phi:lp,Hd=new w(0,Math.cos(rs),-Math.sin(rs)),kd=new w(0,Math.sin(rs),Math.cos(rs)),Vd=new w((ns/2-ap)/Ii,-(is/2-cp)/(Ii*xh),0);Ke?(yt.position.set(Re.xoff,-Re.dmax,Re.camH),yt.up.copy(kd),yt.lookAt(yt.position.clone().add(Hd))):(yt.position.copy(Vd).addScaledVector(Hd,-120),yt.up.copy(kd),yt.lookAt(Vd));function _v(){yt.left=(wi-ns/2)/Ii,yt.right=(wi+Ti-ns/2)/Ii,yt.top=(is/2-Ri)/Ii,yt.bottom=(is/2-Ri-ti)/Ii,yt.updateProjectionMatrix()}var Ci=Ke?Re.image[0]:1,Po=Ke?Re.image[1]:1,Be={x0:0,y0:0,x1:Ci,y1:Po,bouge:0};function yv(){let i=yt.near,e=Re.f;yt.projectionMatrix.makePerspective((Be.x0-Re.cx)/e*i,(Be.x1-Re.cx)/e*i,(Re.cy-Be.y0)/e*i,(Re.cy-Be.y1)/e*i,i,yt.far),yt.projectionMatrixInverse.copy(yt.projectionMatrix).invert()}function hp(i,e,t){let n=Math.sin(rs),s=Math.cos(rs),r=(t||0)-Re.camH,o=Re.cy-e,a=r*(Re.f*s+o*n)/(o*s-Re.f*n),c=a*s-r*n;return{x:(i-Re.cx)*c/Re.f+Re.xoff,y:Re.dmax-a}}function Ir(i,e,t){let n=Math.sin(rs),s=Math.cos(rs),r=i-Re.xoff,o=Re.dmax-e,a=(t||0)-Re.camH,c=o*s-a*n,l=o*n+a*s;return{u:Re.cx+Re.f*r/c,v:Re.cy-Re.f*l/c}}var ue=new It;ue.scale.set(1,1,Lo);dn.add(ue);var he=(i,e,t)=>new w(i,-e,t||0),ah=i=>ap+i*Ii,sc=(i,e)=>cp+i*Ii*xh-(e||0)*Ii,Cs=new Ms,Sr=(i,e,t)=>Cs.load(i,n=>{n.colorSpace=t?St:gn,n.anisotropy=4,n.needsUpdate=!0,ss(e)}),Ot,ch=null,Gd=null,Wd=null;if(Ke){ch=Sr("nuit/fond.jpg","fond",!0),Gd=Sr("nuit/crev.jpg","crev",!0),Wd=Sr("nuit/crev-a.png","crevA",!1);let i=Sr("nuit/feu.jpg","feu",!0),e=Sr("nuit/arrivee.png","arrivee",!1);e.minFilter=e.magFilter=Bt,e.generateMipmaps=!1,Ot=new sn({uniforms:{fond:{value:ch},crev:{value:Gd},crevA:{value:Wd},fen:{value:new Oe(0,0,Ci,Po)},img:{value:new Le(Ci,Po)},rc:{value:new Oe(...Re.crev)},ouvre:{value:0},lueur:{value:0},feu:{value:i},arr:{value:e},vid:{value:i},camA:{value:new Oe(Re.f,Re.cx,Re.cy,Re.phi)},camB:{value:new w(Re.camH,Re.xoff,Re.dmax)},vague:{value:0},tw:{value:0},secours:{value:0},src:{value:new Le(ke.x,ke.y)},temps:{value:0},cri:{value:[new Oe,new Oe,new Oe]}},vertexShader:"varying vec2 vU; void main(){ vU = position.xy*0.5+0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:`uniform sampler2D fond; uniform sampler2D crev; uniform sampler2D crevA; uniform vec4 fen; uniform vec2 img; uniform vec4 rc; uniform float ouvre; uniform float lueur; varying vec2 vU;
      uniform sampler2D feu; uniform sampler2D arr; uniform sampler2D vid; uniform vec4 camA; uniform vec3 camB; uniform float vague; uniform float tw; uniform float secours; uniform vec2 src; uniform float temps; uniform vec4 cri[3];
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
        float hors = smoothstep(img.y - 110.0, img.y + 4.0, p.y) + smoothstep(-6.0, -150.0, p.x) + smoothstep(img.x + 6.0, img.x + 150.0, p.x);   // (au bord de la peinture : la nuit)
        c *= 1.0 - clamp(hors, 0.0, 1.0);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,depthTest:!1,depthWrite:!1,toneMapped:!1})}else{let i=Cs.load("fond.jpg",t=>{t.colorSpace=St,t.anisotropy=4,t.needsUpdate=!0,ss("fond")}),e=Cs.load("prof.png",t=>{t.colorSpace=gn,t.minFilter=t.magFilter=Bt,t.generateMipmaps=!1,ss("prof")});Ot=new sn({uniforms:{fond:{value:i},prof:{value:e},fen:{value:new Oe(0,0,1,1)}},vertexShader:"varying vec2 vU; void main(){ vU = position.xy*0.5+0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:`uniform sampler2D fond; uniform sampler2D prof; uniform vec4 fen; varying vec2 vU;
      void main(){
        vec2 uv = vec2(mix(fen.x, fen.z, vU.x), 1.0 - mix(fen.w, fen.y, vU.y));
        vec4 c = texture2D(fond, uv);
        vec4 p = texture2D(prof, uv);
        float z = 90.0 + (p.r * 255.0 * 256.0 + p.g * 255.0) / 65535.0 * 60.0 + 0.12;
        gl_FragDepth = (z - 1.0) / 399.0;
        gl_FragColor = c;
        #include <colorspace_fragment>
      }`,depthTest:!0,depthFunc:no,depthWrite:!0,toneMapped:!1})}var yh=new Se(new Nt(2,2),Ot);yh.frustumCulled=!1;yh.renderOrder=-10;dn.add(yh);var vv=[];function Mo(i,e,t,n,s,r){let o=new fn(i,s,r,1.6);return o.position.copy(he(e,t,n)),ue.add(o),vv.push(o),o}var fp=[],lh=null,Rs=new Se(new Nt(30,30),new fo({opacity:.5}));Rs.receiveShadow=!0;ue.add(Rs);var Eo={lanternes:[],cristaux:[],fissures:[],porte:null};if(Ke){dn.add(new mo(7109824,2761782,.75));{let e=new _s(bn);dn.environment=e.fromScene(new Ao,.04).texture,dn.environmentIntensity=.22}let i=new ji(14674175,.8);i.position.copy(he(Re.porte.x,Re.porte.y,5)),i.target.position.copy(he(Re.porte.x,12,0)),ue.add(i,i.target),Eo.porte=i;for(let e of Re.piliers){let t=e.x+Re.xoff,n=Re.dmax-e.d,s=new Ss(16757864,70,13,1.42,.8,1.5);s.position.copy(he(t,n+.05,e.lanterne)),s.target.position.copy(he(t,n+.05,0)),ue.add(s,s.target),s.castShadow=!0,s.shadow.mapSize.set(1024,1024),s.shadow.camera.near=.5,s.shadow.camera.far=30,s.shadow.bias=-8e-4,s.shadow.radius=3;let r=new fn(16756832,18,7,1.6);r.position.copy(he(t,n+.4,e.lanterne)),ue.add(r),Eo.lanternes.push({l:s,pt:r,x:t,y:n,z:e.lanterne})}for(let[e,t,n,s,r]of[[1e3,1045,.9,10514687,14],[1400,955,.8,10514687,10],[3640,1005,.9,4253904,14],[2960,960,.8,8032511,8],[420,1560,.7,4253904,16],[3950,1450,.7,4253904,16],[260,1740,.6,10514687,14]]){let o=hp(e,t,n);Eo.cristaux.push(Mo(s,o.x,o.y,n+.6,r,7))}Rs.position.copy(he(Re.xoff+1,10,.002)),Rs.material.onBeforeCompile=e=>{let t="shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;",n="{ vec2 qo = vSpotLightCoord[ i ].xy / vSpotLightCoord[ i ].w - 0.5; float fo = 1.0 - smoothstep( 0.16, 0.42, length( qo ) ); shadow *= receiveShadow ? mix( 1.0, getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ), fo ) : 1.0; }";e.fragmentShader=e.fragmentShader.replace("#include <shadowmask_pars_fragment>",He.shadowmask_pars_fragment.replace(t,n)),e.vertexShader=e.vertexShader.replace("void main() {",`varying float vYJeu;
void main() {`).replace("#include <worldpos_vertex>",`#include <worldpos_vertex>
  vYJeu = -( modelMatrix * vec4( transformed, 1.0 ) ).y;`),e.fragmentShader=e.fragmentShader.replace("void main() {",`varying float vYJeu;
void main() {`).replace("gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );","gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) * ( 1.0 - smoothstep( 18.2, 19.6, vYJeu ) ) );")}}else{dn.add(new mo(10137312,5914156,1.1));{let t=new _s(bn);dn.environment=t.fromScene(new Ao,.04).texture,dn.environmentIntensity=.35}fp=up.map(t=>Mo(16747066,t[0],t[1]+.3,t[2]+.5,40,10)),Mo(16760928,ws.or[0]+.5,ws.or[1]+.35,2,30,8),Mo(16726564,ws.rouge[0]-.5,ws.rouge[1]+.35,2,30,8),lh=Mo(16754784,ke.x,ke.y+1.2,2.8,45,11);let i=new Ss(9416959,60,30,.42,.6,1.2);i.position.copy(he(7,3,16)),i.target.position.copy(he(8.4,6.6,0)),ue.add(i,i.target),i.castShadow=!0,i.shadow.mapSize.set(1024,1024),i.shadow.camera.near=5,i.shadow.camera.far=30,i.shadow.bias=-5e-4;let e=new ji(14212351,1.3);e.position.copy(he(9,26,9)),e.target.position.copy(he(9,4,1)),ue.add(e,e.target),Rs.geometry=new Nt(30,20),Rs.position.copy(he(9,5,.002))}function pn(i,e,t){let n=document.createElement("canvas");n.width=i,n.height=e,t(n.getContext("2d"));let s=new Fa(n);return s.colorSpace=St,s}var Vn=i=>pn(64,64,e=>{let t=e.createRadialGradient(32,32,0,32,32,32);t.addColorStop(0,"rgba(255,255,255,1)"),t.addColorStop(.2,i),t.addColorStop(.5,i.replace(/[\d.]+\)$/,"0.35)")),t.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=t,e.fillRect(0,0,64,64)}),dp=pn(32,48,i=>{i.beginPath(),i.moveTo(16,2),i.bezierCurveTo(22,14,30,24,28,34),i.bezierCurveTo(26,44,6,44,4,34),i.bezierCurveTo(2,24,10,14,16,2);let e=i.createLinearGradient(0,44,0,2);e.addColorStop(0,"rgba(255,250,210,1)"),e.addColorStop(.3,"rgba(255,190,60,.95)"),e.addColorStop(.65,"rgba(255,90,20,.7)"),e.addColorStop(1,"rgba(180,20,10,0)"),i.fillStyle=e,i.fill()}),Gn=(i,e)=>pn(64,72,t=>{t.translate(32,40),t.lineCap="round",t.lineJoin="round";let n=()=>{t.beginPath(),e?(t.moveTo(-6,15),t.lineTo(-6,-26),t.lineTo(18,-34),t.lineTo(18,7),t.moveTo(-6,-16),t.lineTo(18,-24)):(t.moveTo(7,13),t.lineTo(7,-29),t.quadraticCurveTo(21,-19,19,-3))},s=()=>{t.beginPath(),e?(t.ellipse(-13,16,9,7,-.4,0,7),t.moveTo(20,8),t.ellipse(11,8,9,7,-.4,0,7)):t.ellipse(-2,16,10,8,-.4,0,7)};t.strokeStyle=i,t.lineWidth=6,n(),t.stroke(),t.fillStyle=i,s(),t.fill(),t.strokeStyle="rgba(255,255,255,.9)",t.lineWidth=2,n(),t.stroke()}),Ka=(i,e,t)=>pn(128,128,n=>{n.translate(60,64),n.lineCap="round",n.lineJoin="round";let s=()=>{n.beginPath(),n.ellipse(-14,30,19,14,-.45,0,7),n.fill(),n.beginPath(),n.moveTo(1,26),n.lineTo(1,-46),n.stroke(),n.beginPath(),n.moveTo(1,-46),n.bezierCurveTo(22,-36,34,-22,30,-2),n.bezierCurveTo(28,-14,18,-22,3,-26),n.fill()};n.shadowColor=e,n.shadowBlur=20,n.fillStyle=e,n.strokeStyle=e,n.lineWidth=11,s(),n.shadowBlur=0,n.fillStyle=t,n.strokeStyle=t,n.lineWidth=9,s(),n.fillStyle=i,n.strokeStyle=i,n.lineWidth=4.5,n.save(),n.scale(.86,.86),s(),n.restore()}),Qu=i=>{let e=pn(64,128,t=>{t.shadowColor=i,t.shadowBlur=10,t.strokeStyle=i,t.lineWidth=7;for(let n=0;n<5;n++){let s=14+n*25;t.beginPath(),t.moveTo(-10,s),t.lineTo(74,s),t.stroke()}t.shadowBlur=0,t.strokeStyle="rgba(255,255,255,.95)",t.lineWidth=2.5;for(let n=0;n<5;n++){let s=14+n*25;t.beginPath(),t.moveTo(-10,s),t.lineTo(74,s),t.stroke()}});return e.wrapS=jn,e},Av=pn(48,48,i=>{i.translate(24,24),i.strokeStyle="rgba(235,250,255,1)",i.shadowColor="rgba(140,220,255,1)",i.shadowBlur=6,i.lineWidth=2.5,i.lineCap="round";for(let e=0;e<6;e++)i.save(),i.rotate(e*Math.PI/3),i.beginPath(),i.moveTo(0,0),i.lineTo(0,-18),i.moveTo(0,-10),i.lineTo(-5,-15),i.moveTo(0,-10),i.lineTo(5,-15),i.stroke(),i.restore()}),Mv=pn(32,48,i=>{i.beginPath(),i.moveTo(16,3),i.bezierCurveTo(20,14,27,22,27,31),i.arc(16,31,11,0,Math.PI),i.bezierCurveTo(5,22,12,14,16,3),i.shadowColor="rgba(190,255,40,1)",i.shadowBlur=8;let e=i.createLinearGradient(0,4,0,44);e.addColorStop(0,"rgba(240,255,170,1)"),e.addColorStop(1,"rgba(150,215,10,1)"),i.fillStyle=e,i.fill(),i.shadowBlur=0,i.fillStyle="rgba(255,255,255,.85)",i.beginPath(),i.ellipse(12,30,2.5,4,.3,0,7),i.fill()}),pp={glace:Ka("#eefbff","rgba(120,210,255,1)","rgba(25,90,170,1)"),feu:Ka("#fff3d6","rgba(255,140,40,1)","rgba(150,50,10,1)"),acide:Ka("#f6ffc4","rgba(195,255,20,1)","rgba(70,105,0,1)"),soin:Ka("#effff2","rgba(120,235,160,1)","rgba(35,130,75,1)")},Sv={glace:Qu("rgba(150,225,255,1)"),feu:Qu("rgba(255,170,70,1)"),acide:Qu("rgba(200,255,50,1)")},mp={glace:[Gn("#e6f8ff",!1),Gn("#e6f8ff",!0)],feu:[Gn("#ffd9a0",!1),Gn("#ffd9a0",!0)],acide:[Gn("#eaff8a",!1),Gn("#eaff8a",!0)],soin:[Gn("#d2ffdc",!1),Gn("#d2ffdc",!0)],or:[Gn("#ffe7a6",!1),Gn("#ffe7a6",!0)]},Wt={or:Vn("rgba(255,200,90,.95)"),feu:Vn("rgba(255,120,40,.95)"),glace:Vn("rgba(140,220,255,.95)"),rouge:Vn("rgba(255,70,40,.95)"),poussiere:Vn("rgba(225,205,175,.55)"),acide:Vn("rgba(190,255,40,.95)"),fumee:Vn("rgba(215,240,150,.5)"),soin:Vn("rgba(130,240,165,.95)"),violet:Vn("rgba(175,110,255,.95)"),fumeeOmbre:Vn("rgba(70,30,120,.55)")},Lr={glace:{lum:8378623,I:22,dist:5,v:12,taille:1.2,sol:1.8,petite:"#d8f6ff",charge:9429247,boum:10479871,main:11069695},feu:{lum:16742954,I:40,dist:7,v:9,taille:1.45,sol:2.6,petite:"#ffc070",charge:16747066,boum:16747066,main:16752720},acide:{lum:12123952,I:26,dist:5.5,v:11,taille:1.2,sol:2,petite:"#e2ff7a",charge:12910400,boum:13172544,main:13696864},soin:{petite:"#c8ffd6",charge:9306032,main:10551232}};function gt(i,e,t){let n=new ao({map:i,transparent:!0,depthWrite:!1,blending:t?$n:qi,toneMapped:!1}),s=new Ta(n);return s.scale.set(e,e,1),s}var gp=[];if(!Ke)for(let i of up){let e=new It;e.position.copy(he(i[0],i[1],i[2]+.02)),ue.add(e);let t=gt(Wt.feu,1.6,!0);t.position.z=.25,t.material.opacity=.55,t.material.depthTest=!1,e.add(t);for(let n=0;n<3;n++){let s=gt(dp,.45,!0);s.center.set(.5,.05),s.material.depthTest=!1,e.add(s),gp.push({f:s,i:n,b:i})}}if(!Ke)for(let i of["or","rouge"]){let e=gt(Wt[i],1.4,!0);e.position.copy(he(ws[i][0],ws[i][1],1.95)),e.material.opacity=.7,e.material.depthTest=!1,ue.add(e)}var dc=[];if(Ke)for(let i of Re.piliers){let e=i.x+Re.xoff,t=Re.dmax-i.d,n=i.droite-i.gauche+1.4,s=i.haut+.6,r=Sr("nuit/pilier-"+i.nom+".png","pilier-"+i.nom,!1),o=new sn({uniforms:{fond:{value:ch},masque:{value:r},fen:Ot.uniforms.fen,img:Ot.uniforms.img,ecran:{value:new Le(1,1)},rect:{value:new Oe(...i.rect)}},vertexShader:"void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform sampler2D fond; uniform sampler2D masque; uniform vec4 fen; uniform vec2 img; uniform vec2 ecran; uniform vec4 rect;
      void main(){
        vec2 e = gl_FragCoord.xy / ecran, p = vec2(mix(fen.x, fen.z, e.x), mix(fen.w, fen.y, e.y)), q = (p - rect.xy) / rect.zw;
        if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) discard;
        float a = texture2D(masque, vec2(q.x, 1.0 - q.y)).r;
        if (a < 0.08) discard;
        gl_FragColor = vec4(texture2D(fond, vec2(p.x / img.x, 1.0 - p.y / img.y)).rgb, smoothstep(0.08, 0.6, a));
        #include <colorspace_fragment>
      }`,transparent:!0,depthWrite:!0,toneMapped:!1,side:tn}),a=new Se(new Nt(n,s),o);a.frustumCulled=!1,a.position.copy(he(e,t,s/2)),a.up.set(0,0,1),a.lookAt(new w(yt.position.x,yt.position.y,s/2)),ue.add(a);let c=gt(Wt.or,2.2,!0);c.position.copy(he(e,t+.1,i.lanterne)),c.material.opacity=.18,c.material.depthTest=!1,ue.add(c),dc.push({q:a,m:o,x:e,y:t,r:.85,halo:c})}var Rr=new It;ue.add(Rr);var Pi=new It;Rr.add(Pi);var vh=new It;vh.rotation.x=Math.PI/2;Pi.add(vh);var bv=gt(pn(64,64,i=>{let e=i.createRadialGradient(32,32,0,32,32,32);e.addColorStop(0,"rgba(0,0,0,.55)"),e.addColorStop(1,"rgba(0,0,0,0)"),i.fillStyle=e,i.fillRect(0,0,64,64)}),1,!1),xp=new Se(new Nt(1.1,.8),new wt({map:bv.material.map,transparent:!0,depthWrite:!1,toneMapped:!1}));xp.position.z=.004;Pi.add(xp);var M={x:Ke?Re.depart.x:9,y:Ke?Re.depart.y:7.6,a:-Math.PI/2,sort:null,sortT:0,sortD:0,luth:"dos",tl:0,garde:0},Cr=null,mt={};var _p=new qa;_p.register(i=>(i.textureLoader=new Ms(i.options.manager),{name:"images_par_img"}));function rc(i,e,t){fetch(i).then(n=>{if(!n.ok)throw new Error(i+" : "+n.status);return n.json()}).then(n=>{let s=atob(n.glb),r=new Uint8Array(s.length);for(let o=0;o<s.length;o++)r[o]=s.charCodeAt(o);_p.parse(r.buffer,"",e,t)}).catch(t)}var Xd=window.ANIMS||{};rc(Lt?"pisteur.json":"barde.json",i=>{let e=i.scene;e.traverse(n=>{n.isMesh&&(n.castShadow=!0,n.receiveShadow=!1,n.frustumCulled=!1,n.material&&(n.material.metalness=0,n.material.envMapIntensity=.5))}),e.scale.setScalar(1.55/1.5),vh.add(e),Cr=new xo(e),Lt?$v(e):Iv(e),i.animations.length&&(mt.garde=Cr.clipAction(i.animations[0]));let t=Object.keys(Xd).length;t||ss("barde");for(let[n,s]of Object.entries(Xd))rc(s,r=>{if(r.animations[0]){let o=Cr.clipAction(r.animations[0]);mt[n]&&mt[n]!==o&&mt[n].stop(),mt[n]=o,(n==="feu"||n==="glace")&&(o.setLoop(Va),o.clampWhenFinished=!0)}--t===0&&ss("barde")},()=>{--t===0&&ss("barde")});mt.garde&&mt.garde.play()},i=>{ft("charge").textContent="\u26A0",console.error(i)});var Wn=Lt?{marche:{vitesse:.6,max:1},course:{vitesse:4.4},furtif:{vitesse:1.26,min:1,max:1.8}}:{marche:{vitesse:.6,max:1},course:{vitesse:4}},eh=Lt?["garde","marche","course","furtif","guet"]:["garde","marche","course"],Te={garde:1,marche:0,course:0,furtif:0,guet:0,v:0,allure:"garde",tm:1.619,tc:0,tf:0};function Ev(i,e,t){let n=Math.min(1,Math.hypot(e,t)),s=Math.atan2(t,e),r="garde";if(!M.sort&&n>.15&&(r=n>=.85||Te.allure==="course"&&n>=.75?"course":"marche"),Lt&&M.ombre){let a=n>.15?Wn.furtif.min+(Wn.furtif.max-Wn.furtif.min)*Rt((n-.15)/.7,0,1):0;if(Te.v+=Rt(a-Te.v,-10*i,8*i),n>.15&&(M.a=s),Te.allure=n>.15||Te.v>.1?"furtif":"guet",Te.v>.001){let c=M.x+Math.cos(M.a)*Te.v*i,l=M.y+Math.sin(M.a)*Te.v*i;Xn(c,M.y)&&(M.x=c),Xn(M.x,l)&&(M.y=l)}return}if(Lt&&(Te.allure==="furtif"||Te.allure==="guet")&&(Te.allure=Te.v>.05?"marche":"garde"),!M.derap&&r==="course"&&Te.allure==="course"&&Te.v>3.2&&Math.abs(Math.atan2(Math.sin(s-M.a),Math.cos(s-M.a)))>140*Math.PI/180){let l=Math.PI/2-s-Pi.rotation.z;l=Math.atan2(Math.sin(l),Math.cos(l)),M.derap={t:0,rz0:Pi.rotation.z,da:l,a1:s,aOld:M.a},Te.v*=.65,Nr(M.x,M.y,M.a)}let o=r==="garde"?0:r==="marche"?Wn.marche.vitesse+(Wn.marche.max-Wn.marche.vitesse)*Rt((n-.15)/.7,0,1):Wn.course.vitesse;if(Te.v+=Rt(o-Te.v,-14*i,10*i),r!=="garde"&&(M.a=s),Te.allure=r==="course"?"course":r==="marche"?Te.allure==="course"&&Te.v>1.6?"course":"marche":Te.v>1.6&&Te.allure==="course"?"course":Te.v>.05?Te.allure==="garde"?"marche":Te.allure:"garde",Te.v>.001&&!window.__surplace){let a=M.x+Math.cos(M.a)*Te.v*i,c=M.y+Math.sin(M.a)*Te.v*i;Xn(a,M.y)&&(M.x=a),Xn(M.x,c)&&(M.y=c)}}function Tv(i){let e=Math.min(1,i*10),t=0;for(let o of eh)Te[o]+=((Te.allure===o?1:0)-Te[o])*e,t+=Te[o];for(let o of eh)Te[o]/=t||1;Te.tm+=i*Rt(Te.v/Wn.marche.vitesse,.8,1.7),Te.tc+=i*Math.max(.85,Te.v/Wn.course.vitesse),Wn.furtif&&(Te.tf+=i*Rt(Te.v/Wn.furtif.vitesse,.8,1.7));let n=dA(),s=Lt?tA():0,r=Math.max(n,s);if(mt.saut){let o=mt.saut;o.__lance||(o.play(),o.__lance=!0),o.timeScale=0,o.setEffectiveWeight(n),o.time=M.saut?Math.min(ut.depart+M.saut.t*ut.vitesse,o.getClip().duration-.001):0}Lt&&nA(s);for(let o of eh){let a=mt[o];if(!a||(a.__lance||(a.play(),a.__lance=!0),a.setEffectiveWeight(Te[o]*(1-r)),o==="garde"||o==="guet"))continue;a.timeScale=0;let c=a.getClip().duration;o==="marche"?a.time=Te.tm%c:o==="course"?a.time=Te.tc%c:o==="furtif"&&(a.time=Te.tf%c)}}var Gt={centre:new w(.035,.846,-.146),axe:new w(-.526,.85,.036).normalize(),face:new w(-.066,.001,-.998).normalize()},wv={glace:1.5,feu:3,soin:2,acide:1.5},cn=null,Dn=null,Kt={},ja=new Ee,yp=new Ee,Rv=new Ee,vp=new Ee,Cv=new w,KA=new ct,Qa=new w;function Iv(i){cn=i,i.updateMatrixWorld(!0);for(let h of["Spine","RightArm","RightForeArm","RightHand","LeftArm","LeftForeArm","LeftHand"])Kt[h]=i.getObjectByName(h);if(Dn=i.getObjectByName("luth"),!Dn)return;Dn.matrixAutoUpdate=!1,ja.copy(Ah(Kt.Spine)).invert();let e=new w(.8,.5,.25).normalize(),t=new w(0,.3,1),n=t.sub(e.clone().multiplyScalar(t.dot(e))).normalize(),s=new w().crossVectors(e,n),r=new w().crossVectors(Gt.axe,Gt.face).normalize(),o=new w().crossVectors(r,Gt.axe).normalize(),a=new Ee().makeBasis(Gt.axe,o,r),l=new Ee().makeBasis(e,n,s).multiply(a.transpose()),u=new w(-.06,.86,.24);yp.copy(new Ee().makeTranslation(u.x,u.y,u.z)).multiply(l).multiply(new Ee().makeTranslation(-Gt.centre.x,-Gt.centre.y,-Gt.centre.z))}function Ah(i){return Rv.copy(vp.copy(cn.matrixWorld).invert()).multiply(i.matrixWorld).clone()}function br(i,e){return(e||new w).setFromMatrixPosition(i.matrixWorld).applyMatrix4(vp.copy(cn.matrixWorld).invert())}function oc(i){let e=new ct;return Ah(i).decompose(Cv,e,Qa),e}function uh(i,e){i.quaternion.copy(oc(i.parent).invert().multiply(e)),i.updateMatrixWorld(!0)}function qd(i,e,t,n,s,r){if(r<=.001)return;let o=br(i),a=br(e),c=br(t),l=c.clone().lerp(n,r),u=a.distanceTo(o),h=c.distanceTo(a),f=l.distanceTo(o);f=Rt(f,Math.abs(u-h)+1e-4,u+h-1e-4);let p=l.clone().sub(o).normalize(),g=Rt((u*u+f*f-h*h)/(2*u*f),-1,1),x=Math.sqrt(1-g*g),m=s.clone().sub(p.clone().multiplyScalar(s.dot(p)));m.lengthSq()<1e-8&&m.set(0,-1,0),m.normalize();let d=o.clone().addScaledVector(p,u*g).addScaledVector(m,u*x);uh(i,new ct().setFromUnitVectors(a.clone().sub(o).normalize(),d.clone().sub(o).normalize()).multiply(oc(i)));let E=br(e),b=br(t),y=o.clone().addScaledVector(p,f);uh(e,new ct().setFromUnitVectors(b.clone().sub(E).normalize(),y.clone().sub(E).normalize()).multiply(oc(e)))}var th=new ct;function Pv(){let i=cn&&cn.getObjectByName("Hips");if(!i||!mt.garde)return;let e=mt.garde.getEffectiveWeight();if(e<=0)return;let t=i.quaternion;th.set(0,t.y,0,t.w).normalize();let n=th.clone().invert().premultiply(t.clone());n.copy(t.clone().multiply(th.clone().invert())),i.quaternion.slerp(n,e)}var on=i=>(i=Rt(i,0,1),i*i*(3-2*i));function Mh(){let i=M.tl;return M.luth==="dos"?{wR:0,k:0,wL:0,sR:0}:M.luth==="main"?{wR:1,k:1,wL:1,sR:1}:M.luth==="sort"?{wR:on(i/.25),k:on((i-.25)/.4),wL:on((i-.5)/.2),sR:on((i-.55)/.25)}:{wR:1-on((i-.55)/.2),k:1-on((i-.15)/.4),wL:1-on(i/.2),sR:1-on(i/.2)}}var Lv=new w(-.34,1.12,.02),Es=new Ee,Dv=new w,Nv=new w,Yd=new ct,Zd=new ct,So=0;function Uv(i,e){if(!Dn||!cn)return;cn.updateMatrixWorld(!0);let t=Mh(),n=Ah(Kt.Spine),s=n.clone().multiply(ja),r=n.clone().multiply(ja).multiply(yp);s.decompose(Dv,Yd,Qa),r.decompose(Nv,Zd,Qa);let o=Gt.centre.clone().applyMatrix4(s),a=Gt.centre.clone().applyMatrix4(r),c=t.k,l=o.clone().multiplyScalar((1-c)*(1-c)).addScaledVector(Lv.clone().applyMatrix4(n.clone().multiply(ja)),2*c*(1-c)).addScaledVector(a,c*c),u=Yd.clone().slerp(Zd,c);Es.makeRotationFromQuaternion(u).scale(Qa);let h=Gt.centre.clone().applyMatrix4(Es);if(Es.setPosition(l.clone().sub(h)),Dn.matrix.copy(Es),Dn.matrixWorldNeedsUpdate=!0,Dn.updateMatrixWorld(!0),t.wR<=.001&&t.wL<=.001)return;let f=(j,V,ne)=>Gt.centre.clone().addScaledVector(Gt.axe,j).addScaledVector(Gt.face,ne).addScaledVector(new w().crossVectors(Gt.axe,Gt.face).normalize(),V).applyMatrix4(Es),p=f(.36,0,0);So+=i*(M.sort&&M.luth==="main"||M.luth==="sort"&&M.sort?1:-1)*4,So=Rt(So,0,1);let g=M.sort?M.sortD-M.sortT:9,x=M.sort?on((.42-g)/.12):0;M.phaseG=(M.phaseG||0)+i*(4.5+8*x);let m=Math.sin(M.phaseG*2*Math.PI),d=So*(1+.7*x),E=f(.05+.015*m*d,.05*m*d,.05+.014*Math.abs(m)*d),b=Gt.axe.clone().transformDirection(Es),y=Gt.face.clone().transformDirection(Es),U=new w(0,1,0).sub(b.clone().multiplyScalar(b.y)).normalize(),R=f(.31+.012*Math.sin(e*9)*So,0,0),C=U.clone().multiplyScalar(.8).addScaledVector(y,.45).normalize(),I=y.clone().sub(C.clone().multiplyScalar(y.dot(C))).normalize(),S=R.clone().addScaledVector(I,-.032).addScaledVector(C,-Ja.paume),v=U.clone().multiplyScalar(-.85).addScaledVector(b,-.35).normalize(),P=y.clone().negate().sub(v.clone().multiplyScalar(-y.dot(v))).normalize(),k=E.clone().addScaledVector(P,-.03).addScaledVector(v,-Ja.paume),B=p.clone().lerp(k,t.sR),G=v,J=P;if(M.geste!==void 0&&M.geste<Ar.duree){let j=M.geste<Ar.monte?on(M.geste/Ar.monte):1-on((M.geste-Ar.tient)/(Ar.duree-Ar.tient)),V=M.dernier==="soin",ne=br(Kt.RightArm),fe=ne.clone().add(V?new w(-.12,.44,.08):new w(-.2,.17,.24));B=B.lerp(fe,j),G=v.clone().lerp(V?new w(-.15,1,.12).normalize():new w(-.35,.75,.55).normalize(),j).normalize(),J=P.clone().lerp(new w(-.15,-.25,1).normalize(),j),J.sub(G.clone().multiplyScalar(J.dot(G))).normalize(),M.geste>.05&&!M.eclair&&(M.eclair=!0,Ov())}let X=new w(-.6,.5,.2).lerp(new w(-.7,-.6,-.3),Rt(t.k*1.2,0,1));qd(Kt.RightArm,Kt.RightForeArm,Kt.RightHand,B,X,t.wR),Kd(Kt.RightHand,G,J,Ja.paumeD,t.wR*t.sR),qd(Kt.LeftArm,Kt.LeftForeArm,Kt.LeftHand,S,new w(.7,-.6,-.2),t.wL),Kd(Kt.LeftHand,C,I,Ja.paumeG,t.wL)}var Ar={monte:.07,tient:.2,duree:.38},ec=[];function Ov(){let i=M.dernier||"glace",e=new w;Kt.RightHand.getWorldPosition(e);let t={x:e.x,y:-e.y,z:e.z/Lo},n=gt(Wt[i],.3,!0);n.position.copy(he(t.x,t.y,t.z)),ue.add(n);let s=Ni(Lr[i].main,22,4);s&&s.position.copy(he(t.x,t.y,t.z)),ec.push({sp:n,l:s,t:0})}function Fv(i){for(let e=ec.length-1;e>=0;e--){let t=ec[e];t.t+=i;let n=t.t/.28;if(n>=1){ue.remove(t.sp),t.sp.material.dispose(),Dr(t.l),ec.splice(e,1);continue}let s=.3+1.1*Math.sin(Math.min(1,n*2.2)*Math.PI/2);t.sp.scale.set(s,s,1),t.sp.material.opacity=1-n*n,t.l&&(t.l.intensity=22*(1-n))}}var Ja={paume:.075,paumeG:new w(1,0,0),paumeD:new w(-1,0,0)};function Kd(i,e,t,n,s){if(s<=.001)return;let r=new w(0,1,0),o=n,a=new w().crossVectors(r,o),c=new w().crossVectors(e,t),l=new Ee().makeBasis(e,t,c),u=new Ee().makeBasis(r,o,a),h=new ct().setFromRotationMatrix(l.multiply(u.transpose()));uh(i,oc(i).slerp(h,s))}function hh(i){let e=Gt.centre.clone().addScaledVector(Gt.face,.03+(i||0)).applyMatrix4(Dn.matrixWorld);return{x:e.x,y:-e.y,z:e.z/Lo}}var To=[],xn=[],Di=[],Ei=null;function Ap(){if(M.sort=null,M.sortT=0,Dr(Ei),Ei=null,M.garde=0,M.geste=void 0,M.luth==="main")M.luth="range",M.tl=0;else if(M.luth==="sort"){let i=Mh().k;M.luth="range",M.tl=Rt(.15+.4*(1-i),0,.55)}}function Sh(i){if(!(Lt||M.sort||M.saut)){if(M.sort=i,M.sortT=0,M.sortD=wv[i],M.luth==="dos")M.luth="sort",M.tl=0;else if(M.luth==="range"){let e=Mh().k;M.luth="sort",M.tl=.25+.4*e}}}var Mp=[];for(let i=0;i<5;i++){let e=new fn(16777215,0,7,1.6);e.libre=!0,ue.add(e),Mp.push(e)}function Ni(i,e,t){let n=Mp.find(s=>s.libre);return n?(n.libre=!1,n.color.setHex(i),n.intensity=e,n.distance=t,n):null}function Dr(i){i&&(i.intensity=0,i.libre=!0)}function Bv(i,e){let t=Lr[i],n=i==="feu",s=new It,r=e?he(e.x,e.y,e.z):he(M.x+Math.cos(M.a)*.4,M.y+Math.sin(M.a)*.4,1.1);s.position.copy(r),ue.add(s);let o=gt(Wt[i],1.1,!0);o.material.opacity=.45,o.renderOrder=3,s.add(o);let a=gt(pp[i],t.taille,!1);a.center.set(46/128,1-94/128),a.renderOrder=4,s.add(a);let c=30,l=new Zt;l.setAttribute("position",new bt(new Float32Array(c*2*3),3)),l.setAttribute("color",new bt(new Float32Array(c*2*3),3));let u=new Float32Array(c*2*2);for(let x=0;x<c;x++)u[x*4]=x/(c-1)*3,u[x*4+1]=0,u[x*4+2]=x/(c-1)*3,u[x*4+3]=1;l.setAttribute("uv",new bt(u,2));let h=[];for(let x=0;x<c-1;x++){let m=x*2;h.push(m,m+1,m+2,m+1,m+3,m+2)}l.setIndex(h);let f=new Se(l,new wt({map:Sv[i],vertexColors:!0,transparent:!0,depthWrite:!1,blending:$n,side:tn,toneMapped:!1}));f.frustumCulled=!1,f.visible=!1,f.renderOrder=2,dn.add(f);let p=Ni(t.lum,t.I,t.dist);p&&p.position.copy(r);let g=new Se(new Nt(1,1),new wt({map:Wt[i],transparent:!0,opacity:.45,depthWrite:!1,blending:$n,toneMapped:!1}));ue.add(g),To.push({gr:s,n:a,l:p,sol:g,feu:n,q:i,ruban:f,hist:[],N:c,x:r.x,y:-r.y,z:e?e.z:1.1,t:0,petite:0,goutte:.05})}function zv(i){for(let e=To.length-1;e>=0;e--){let t=To[e],n=Lr[t.q];t.t+=i;let s=ke.x-t.x,r=ke.y+ke.dy-t.y,o=Math.hypot(s,r),a=n.v*(Ke?1.6:1);if(o<.5){Dr(t.l),Vv(t),ue.remove(t.gr),ue.remove(t.sol),dn.remove(t.ruban),t.ruban.geometry.dispose(),t.ruban.material.dispose(),To.splice(e,1);continue}t.x+=s/o*a*i,t.y+=r/o*a*i,t.z+=(ke.zc-t.z)*Math.min(1,i*2),t.gr.position.copy(he(t.x,t.y,t.z)),t.l&&t.l.position.copy(t.gr.position),t.n.material.rotation=Math.sin(t.t*8)*.2,Hv(t),t.petite-=i,t.petite<=0&&t.hist.length>6&&(t.petite=.06,kv(t)),t.q==="acide"&&(t.goutte-=i,t.goutte<=0&&(t.goutte=.05+Math.random()*.05,bp(t.x+(Math.random()-.5)*.2,t.y+(Math.random()-.5)*.15,t.z-.15))),t.sol.position.copy(he(t.x,t.y,.02)),t.sol.scale.set(n.sol,n.sol,1),Math.random()<i*40&&Sp(t.x,t.y,t.z,t.q)}}var ac=new w;function Hv(i){let e=new w;i.gr.getWorldPosition(e),i.hist.length<2||i.hist[1].distanceTo(e)>.04?(i.hist.unshift(e),i.hist.length>i.N&&i.hist.pop()):i.hist[0].copy(e);let t=i.hist,n=t.length;if(n<3)return;yt.getWorldDirection(ac);let s=i.ruban.geometry.attributes.position,r=i.ruban.geometry.attributes.color,o=.5;for(let a=0;a<i.N;a++){let c=Math.min(a,n-1),l=t[Math.max(0,c-1)],u=t[Math.min(n-1,c+1)],h=l.clone().sub(u);h.lengthSq()<1e-8&&h.set(1,0,0),h.normalize();let f=new w().crossVectors(h,ac).normalize(),p=.09*Math.sin(i.t*10-a*.45)*Math.min(1,a/5),g=t[c].clone().addScaledVector(f,p),x=(a>=n-1?0:1)*Math.pow(1-a/(i.N-1),1.2)*Math.min(1,.35+a/3);s.setXYZ(a*2,g.x+f.x*o/2,g.y+f.y*o/2,g.z+f.z*o/2),s.setXYZ(a*2+1,g.x-f.x*o/2,g.y-f.y*o/2,g.z-f.z*o/2),r.setXYZ(a*2,x,x,x),r.setXYZ(a*2+1,x,x,x)}s.needsUpdate=!0,r.needsUpdate=!0,i.ruban.visible=!0}function kv(i){let e=i.hist,t=2+Math.floor(Math.random()*Math.min(8,e.length-3)),n=e[t-1],s=e[t+1],r=n.clone().sub(s).normalize();yt.getWorldDirection(ac);let o=new w().crossVectors(r,ac).normalize(),a=(Math.floor(Math.random()*5)-2)*.1,c=e[t].clone().addScaledVector(o,a),l={x:c.x,y:-c.y,z:c.z/Lo},u=gt(mp[i.q][Math.random()<.5?0:1],.2+Math.random()*.06,!0);if(u.position.copy(he(l.x,l.y,l.z)),ue.add(u),Di.push({sp:u,x:l.x,y:l.y,z:l.z,vx:0,vy:0,vz:.15,t:0,vie:.6}),i.q==="glace"&&Math.random()<.6){let h=gt(Av,.13+Math.random()*.08,!0),f={x:l.x+(Math.random()-.5)*.4,y:l.y+(Math.random()-.5)*.3,z:l.z+(Math.random()-.5)*.3};h.position.copy(he(f.x,f.y,f.z)),ue.add(h),Di.push({sp:h,...f,vx:0,vy:0,vz:-.2,t:0,vie:.7,tourne:(Math.random()-.5)*4})}}function Sp(i,e,t,n,s){let r=n==="feu",o=r?.3:n==="acide"?.16:.18,a=gt(r?dp:Wt[n],o,!0);a.position.copy(he(i,e,t)),ue.add(a);let c=Math.random()*6.28,l=(s||.6)*Math.random();xn.push({sp:a,vx:Math.cos(c)*l,vy:Math.sin(c)*l,vz:r?1+Math.random():Math.random()*.5-.2,vie:.5+Math.random()*.4,t:0,s0:o})}function Vv(i){let e=Lr[i.q],t=Ni(e.boum,i.feu?60:30,8);t&&(t.position.copy(he(i.x,i.y,i.z)),xn.push({lum:t,t:0,vie:.45,I:t.intensity}));for(let n=0;n<(i.feu?26:16);n++)Sp(i.x,i.y,i.z,i.q,3);if(i.q==="acide")for(let n=0;n<14;n++){let s=Math.random()*6.28,r=1+Math.random()*2;bp(i.x,i.y,i.z,Math.cos(s)*r,Math.sin(s)*r,1+Math.random()*2)}}var wo=[];function bp(i,e,t,n,s,r){let o=gt(Mv,.13+Math.random()*.05,!1);o.renderOrder=3,o.position.copy(he(i,e,t)),ue.add(o),wo.push({sp:o,x:i,y:e,z:t,vx:n||0,vy:s||0,vz:r||-.5,t:0})}function Gv(i){for(let e=wo.length-1;e>=0;e--){let t=wo[e];if(t.t+=i,t.sp){t.vz-=9*i,t.x+=t.vx*i,t.y+=t.vy*i,t.z+=t.vz*i,t.sp.position.copy(he(t.x,t.y,t.z)),t.z<=.03&&(ue.remove(t.sp),t.sp.material.dispose(),t.sp=null,t.t=0,Wv(t));continue}let n=t.t/t.vie;if(n>=1){t.flaque&&(ue.remove(t.flaque),t.flaque.material.dispose()),wo.splice(e,1);continue}if(t.flaque){t.flaque.material.opacity=.75*(1-n);let s=t.r0*(1+.3*n);t.flaque.scale.set(s,s*.8,1)}}}function Wv(i){let e=new Se(new Nt(1,1),new wt({map:Wt.acide,transparent:!0,opacity:.75,depthWrite:!1,blending:$n,toneMapped:!1}));e.position.copy(he(i.x,i.y,.015)),ue.add(e),i.flaque=e,i.r0=.22+Math.random()*.12,i.vie=.9,wo.push(i);for(let t=0;t<2;t++){let n=gt(Wt.fumee,.18,!1);n.position.copy(he(i.x,i.y,.08)),ue.add(n),xn.push({sp:n,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.2,vz:.6+Math.random()*.5,vie:.55+Math.random()*.3,t:0,s0:.22,grossit:1})}for(let t=0;t<3;t++){let n=gt(Wt.acide,.06,!0);n.position.copy(he(i.x,i.y,.05)),ue.add(n);let s=Math.random()*6.28;xn.push({sp:n,vx:Math.cos(s)*.7,vy:Math.sin(s)*.5,vz:.8+Math.random(),vie:.25+Math.random()*.15,t:0,s0:.07})}}function Xv(i){if(!Dn)return;let e=hh(),t=gt(Gn(Lr[i].petite,Math.random()<.5),.2,!1);t.position.copy(he(e.x,e.y,e.z)),ue.add(t),Di.push({sp:t,x:e.x,y:e.y,z:e.z,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.3,t:0})}function qv(i){for(let e=Di.length-1;e>=0;e--){let t=Di[e],n=t.vie||.9;if(t.t+=i,t.t>n){ue.remove(t.sp),t.sp.material.dispose(),t.halo&&(ue.remove(t.halo),t.halo.material.dispose()),Di.splice(e,1);continue}if(t.g&&(t.vz-=t.g*i),t.suit?(t.ox+=t.vx*i,t.oy+=t.vy*i,t.z+=t.vz*i,t.x=M.x+t.ox,t.y=M.y+t.oy):(t.x+=t.vx*i,t.y+=t.vy*i,t.z+=(t.vz!==void 0?t.vz:.9)*i),t.sp.position.copy(he(t.x,t.y,t.z)),t.halo){let s=t.t/n,r=Math.sin(Math.PI*s),o=t.s0*(.85+.2*Math.sin(t.t*13+t.ph));t.sp.material.opacity=Math.min(1,r*1.6),t.sp.scale.set(o,o,1),t.halo.position.copy(t.sp.position),t.halo.material.opacity=.9*r*(.7+.3*Math.sin(t.t*17+t.ph)),t.halo.scale.set(o*2.1,o*2.1,1),t.sp.material.rotation=Math.sin(t.t*4+t.ph)*.25;continue}t.sp.material.opacity=1-t.t/n,t.sp.material.rotation=t.fixe?0:t.tourne?t.sp.material.rotation+t.tourne*i:Math.sin(t.t*9)*.3}}var tc=[];function Yv(){let i=Ni(9306032,0,4.5),e=new Se(new Nt(1,1),new wt({map:Wt.soin,transparent:!0,opacity:.7,depthWrite:!1,blending:$n,toneMapped:!1}));ue.add(e);let t=gt(Wt.soin,2.4,!0);t.material.opacity=0,ue.add(t),tc.push({l:i,anneau:e,aura:t,t:0,nb:0})}function Zv(){let i=Math.random()*6.28,e=.4+Math.random()*.6,t=Math.cos(i)*e,n=Math.sin(i)*e*.8,s=.1+Math.random()*1.7,r=.3+Math.random()*.16,o=gt(pp.soin,r,!1),a=gt(Wt.soin,r*1.6,!0);o.renderOrder=4,a.renderOrder=3,ue.add(a,o),Di.push({sp:o,halo:a,s0:r,suit:!0,ox:t,oy:n,z:s,vx:-Math.sin(i)*.25,vy:Math.cos(i)*.2,vz:.35+Math.random()*.2,t:0,vie:1.1+Math.random()*.4,ph:Math.random()*6})}function Kv(i){for(let e=tc.length-1;e>=0;e--){let t=tc[e];for(t.t+=i;t.nb<24&&t.t>t.nb*.04;)t.nb++,Zv();let n=Math.min(1,t.t/.9);t.anneau.position.copy(he(M.x,M.y,.02));let s=.8+2.2*Math.sqrt(n);t.anneau.scale.set(s,s*.85,1),t.anneau.material.opacity=.7*(1-n),t.l&&(t.l.position.copy(he(M.x,M.y,1.1)),t.l.intensity=20*Math.sin(Math.PI*Math.min(1,t.t/1.5))),t.aura.position.copy(he(M.x,M.y,.9)),t.aura.material.opacity=.55*Math.sin(Math.PI*Math.min(1,t.t/1.5)),t.t>1.5&&(Dr(t.l),ue.remove(t.anneau,t.aura),t.anneau.material.dispose(),t.aura.material.dispose(),tc.splice(e,1))}}var Jv={dist:3,recharge:3,vitesse:1.2,depart:.05,air:[.08,.65],sortie:.66,fin:.8,elan:2.5,murets:!0},Ep={d1:{anim:"d1",a:.15,b:1.05,impact:.57,v:1.5,portee:1.35},d2:{anim:"d2",a:.3,b:1.25,impact:.82,v:1.5,portee:1.45},d3:{anim:"d3",a:.35,b:1.55,impact:1.07,v:1.4,portee:1.5,fort:!0},embuscade:{anim:"d3",a:.45,b:1.55,impact:1.07,v:1.7,portee:1.6,fort:!0,ombre:!0},assomme:{anim:"assomme",a:.1,b:1.25,impact:.58,v:1.4,portee:1.5,assomme:!0}},Tp=3,bh=Lt?[{x:5.4,y:7,lx:2.6,ly:.45},{x:13,y:6.4,lx:.45,ly:2.6}]:[],qn={x:9,y:4.9,r:.35},Ln=null,Ro=null,Eh=[];function $v(i){cn=i,i.updateMatrixWorld(!0);for(let l of["Spine","RightArm","RightForeArm","RightHand","LeftArm","LeftForeArm","LeftHand","Head"])Kt[l]=i.getObjectByName(l);let e=new It,t=new Vt({color:14673646,metalness:.85,roughness:.25,emissive:2241348,emissiveIntensity:.3}),n=new Vt({color:4860952,roughness:.8}),s=new Vt({color:13213760,metalness:.7,roughness:.35}),r=new Se(new As(.2,2.1,26,4,1),t);r.scale.set(1,1,.28),r.rotation.x=Math.PI/2,r.position.z=17;let o=new Se(new ei(7,1.4,1.4),s);o.position.z=3.8,o.rotation.z=Math.PI/2;let a=new Se(new As(.85,.85,8,8),n);a.rotation.x=Math.PI/2;let c=new Se(new ho(1.1,10,8),s);c.position.z=-4.3,e.add(r,o,a,c),e.position.set(-1.5,8,0),e.visible=!1,e.traverse(l=>{l.isMesh&&(l.castShadow=!0)}),Kt.RightHand&&Kt.RightHand.add(e),Ln=e,e.userData.pointe=new w(0,0,30),e.userData.base=new w(0,0,5),i.traverse(l=>{if(l.isMesh&&l.material){let u=l.material,h=u.clone();h.color=(h.color||new be(1,1,1)).clone().multiplyScalar(.28),h.emissive=new be(5909160),h.emissiveIntensity=.55,h.transparent=!0,h.opacity=.62,Eh.push({o:l,a:u,b:h})}})}function jv(){return pn(256,128,i=>{i.fillStyle="#7d7468",i.fillRect(0,0,256,128);for(let e=0;e<4;e++)for(let t=-1;t<5;t++){let s=e%2*32+t*64,r=e*32,o=95+Math.random()*40,a=i.createLinearGradient(0,r,0,r+32);a.addColorStop(0,`rgb(${o+22},${o+18},${o+10})`),a.addColorStop(1,`rgb(${o-4},${o-7},${o-12})`),i.fillStyle=a,i.fillRect(s+2,r+2,60,28);for(let c=0;c<18;c++)i.fillStyle=`rgba(0,0,0,${Math.random()*.12})`,i.fillRect(s+2+Math.random()*58,r+3+Math.random()*24,3,2)}})}if(Lt){let i=jv();i.wrapS=i.wrapT=jn;for(let e of bh){let n=new Vt({map:i,roughness:.92}),s=new Vt({map:i,color:13616046,roughness:.9}),r=new ei(e.lx,e.ly,.62),o=new Se(r,[n,n,n,n,s,n]);o.position.copy(he(e.x,e.y,.62/2)),o.castShadow=!0,o.receiveShadow=!0,ue.add(o);let a=r.attributes.uv,c=[[e.ly,.62],[e.ly,.62],[e.lx,.62],[e.lx,.62],[e.lx,e.ly],[e.lx,e.ly]];for(let l=0;l<a.count;l++){let u=c[Math.floor(l/4)];a.setXY(l,a.getX(l)*u[0]/1.3,a.getY(l)*u[1]/.65)}}}function wp(i,e,t){t=t||.35;for(let n of bh)if(Math.abs(i-n.x)<n.lx/2+t&&Math.abs(e-n.y)<n.ly/2+t)return!0;return!1}var Er=null,it={ax:0,ay:0,vx:0,vy:0,sonne:0,etoiles:[],eclair:0};if(Lt){let i=new It,e=new It,t=new Vt({color:7031339,roughness:.85}),n=new Vt({color:13215066,roughness:.95,emissive:16777215,emissiveIntensity:0}),s=new Vt({color:12098154,roughness:.95,emissive:16777215,emissiveIntensity:0}),r=new Vt({color:5913116,roughness:.9}),o=(l,u,h,f,p)=>{let g=new Se(new As(l,u,h,14),f);return g.rotation.x=Math.PI/2,g.position.z=p,g.castShadow=!0,g};i.add(o(.32,.36,.08,t,.04)),e.add(o(.05,.06,.7,t,.4),o(.2,.24,.66,n,.98),o(.205,.205,.04,r,.8),o(.205,.205,.04,r,1.16));let a=new Se(new As(.035,.035,.9,8),t);a.rotation.z=Math.PI/2,a.position.z=1.18,a.castShadow=!0,e.add(a);let c=new Se(new ho(.15,14,10),s);c.position.z=1.45,c.castShadow=!0,e.add(c),i.add(e),i.position.copy(he(qn.x,qn.y,0)),ue.add(i),Er={gr:i,pivot:e,mats:[n,s]}}function Qv(i,e){return Ke?cc(Jt.libre,i,e)===1:Pp(i,e)}M.rang=1;M.coup=null;M.tampon=null;M.ombre=!1;M.ombreR=0;function Rp(){let i=qn.x-M.x,e=qn.y-M.y;return{d:Math.hypot(i,e),a:Math.atan2(e,i)}}function Pr(i){if(!Lt||M.saut)return;if(M.coup){M.coup.tc>(M.coup.C.a+M.coup.C.impact)/2&&(M.tampon=i);return}let e=i==="assomme"?"assomme":M.ombre?"embuscade":"d"+M.rang,t=Ep[e];if(!mt[t.anim])return;let n=Rp();n.d<2.4&&(M.a=n.a),M.coup={nom:e,C:t,t:0,tc:t.a,touche:!1,fait:!1,elan:n.d<2.4?Math.max(0,Math.min(.7,n.d-.95)):0,avance:0},Ln&&(Ln.visible=e!=="assomme"),(t.ombre||M.ombre&&e==="assomme")&&Cp(),aA(e==="embuscade"?11697151:14676991)}function eA(){M.coup=null,M.tampon=null,wh()}function tA(){let i=M.coup;if(!i)return 0;let e=i.C;return Math.min(on((i.tc-e.a)/(.06*e.v)),1-on((i.tc-(e.b-.16*e.v))/(.16*e.v)))}function nA(i){for(let e of["d1","d2","d3","assomme"]){let t=mt[e];if(!t)continue;t.__lance||(t.play(),t.__lance=!0),t.timeScale=0;let n=M.coup&&M.coup.C.anim===e;t.setEffectiveWeight(n?i:0),n&&(t.time=Math.min(M.coup.tc,t.getClip().duration-.001))}}function iA(i){let e=M.coup;if(!e)return;let t=e.C;if(e.t+=i,e.tc=t.a+e.t*t.v,e.elan>e.avance&&e.tc<t.impact){let n=Math.min(e.elan-e.avance,i*4.5),s=M.x+Math.cos(M.a)*n,r=M.y+Math.sin(M.a)*n;Xn(s,r)&&(M.x=s,M.y=r),e.avance+=n}if(!e.fait&&e.tc>=t.impact){e.fait=!0;let n=Rp(),s=Math.abs(Math.atan2(Math.sin(n.a-M.a),Math.cos(n.a-M.a)));e.touche=n.d<=t.portee&&s<1.2,e.touche&&rA(t,n.a),e.nom.startsWith("d")&&(M.rang=e.touche?M.rang%3+1:1),e.nom==="embuscade"&&(M.rang=1),Th()}if(e.tc>=t.b){M.coup=null,wh(),M.cacheDague=.5;let n=M.tampon;M.tampon=null,n&&Pr(n)}}function Th(){let i=ft("pRang");i&&(i.textContent=M.ombre?"":String(M.rang));let e=ft("pDagueIc");e&&(e.textContent=M.ombre?"\u{1F480}":M.rang===3?"\u2694\uFE0F":"\u{1F5E1}\uFE0F")}var sA=pn(48,48,i=>{i.translate(24,24),i.beginPath();for(let e=0;e<10;e++){let t=e%2?8:20,n=e*Math.PI/5-Math.PI/2;i.lineTo(Math.cos(n)*t,Math.sin(n)*t)}i.closePath(),i.shadowColor="rgba(255,220,80,1)",i.shadowBlur=8,i.fillStyle="#ffe27a",i.fill(),i.lineWidth=2,i.strokeStyle="#a06a10",i.stroke()});function rA(i,e){let t=i.fort?1.9:i.assomme?1.4:1;it.vx+=Math.cos(e)*2.4*t,it.vy+=Math.sin(e)*2.4*t,it.eclair=1;let n=1.05,s=qn.x-Math.cos(e)*.18,r=qn.y-Math.sin(e)*.18;for(let a=0;a<(i.fort?22:12);a++){let c=gt(i.ombre?Wt.violet:Wt.or,.12,!0);c.position.copy(he(s,r,n)),ue.add(c);let l=e+Math.PI+(Math.random()-.5)*2.2,u=1.5+Math.random()*2.5*t;xn.push({sp:c,vx:Math.cos(l)*u,vy:Math.sin(l)*u,vz:Math.random()*2-.3,vie:.3+Math.random()*.25,t:0,s0:.12})}let o=Ni(i.ombre?11563263:16769184,i.fort?30:16,4);if(o&&(o.position.copy(he(s,r,n)),xn.push({lum:o,t:0,vie:.25,I:o.intensity})),i.assomme&&(it.sonne=2,!it.etoiles.length))for(let a=0;a<3;a++){let c=gt(sA,.2,!1);c.renderOrder=5,ue.add(c),it.etoiles.push(c)}if(i.ombre)for(let a=0;a<10;a++){let c=gt(Wt.violet,.4,!0);c.position.copy(he(s,r,.9+Math.random()*.5)),ue.add(c),xn.push({sp:c,vx:(Math.random()-.5)*1.5,vy:(Math.random()-.5)*1.5,vz:.6+Math.random(),vie:.6,t:0,s0:.4,grossit:1})}}function oA(i,e){if(!Er)return;it.vx+=(-it.ax*60-it.vx*7)*i,it.vy+=(-it.ay*60-it.vy*7)*i,it.ax+=it.vx*i,it.ay+=it.vy*i;let t=Math.hypot(it.ax,it.ay),n=new w(-it.ay,-it.ax,0);t>1e-5?Er.pivot.quaternion.setFromAxisAngle(n.normalize(),Math.min(.6,t)):Er.pivot.quaternion.identity(),it.eclair=Math.max(0,it.eclair-i*5);for(let s of Er.mats)s.emissiveIntensity=.45*it.eclair;if(it.sonne>0){it.sonne-=i;let s=new w(0,0,1.45).applyQuaternion(Er.pivot.quaternion);it.etoiles.forEach((r,o)=>{let a=e*4+o*2.09;r.position.copy(he(qn.x+s.x+Math.cos(a)*.26,qn.y-s.y+Math.sin(a)*.14,s.z+.28)),r.material.opacity=Math.min(1,it.sonne*2),r.material.rotation=a}),it.sonne<=0&&(it.etoiles.forEach(r=>{ue.remove(r),r.material.dispose()}),it.etoiles=[])}}var Jd=new w,$d=new w;function aA(i){wh();let e=16,t=new Zt;t.setAttribute("position",new bt(new Float32Array(e*2*3),3)),t.setAttribute("color",new bt(new Float32Array(e*2*3),3));let n=[];for(let r=0;r<e-1;r++){let o=r*2;n.push(o,o+1,o+2,o+1,o+3,o+2)}t.setIndex(n);let s=new Se(t,new wt({color:i,vertexColors:!0,transparent:!0,depthWrite:!1,blending:$n,side:tn,toneMapped:!1}));s.frustumCulled=!1,s.renderOrder=4,dn.add(s),Ro={m:s,N:e,hist:[]}}var nc=[];function wh(){if(Ro){let i=Ro;i.fin=!0,i.vie=.18,nc.push(i),Ro=null}}function cA(i){for(let t=nc.length-1;t>=0;t--){let n=nc[t];n.vie-=i,n.vie<=0?(dn.remove(n.m),n.m.geometry.dispose(),n.m.material.dispose(),nc.splice(t,1)):jd(n)}let e=Ro;e&&(Ln&&Ln.visible&&M.coup&&M.coup.nom!=="assomme"&&(Ln.updateMatrixWorld(!0),Jd.copy(Ln.userData.base).applyMatrix4(Ln.matrixWorld),$d.copy(Ln.userData.pointe).applyMatrix4(Ln.matrixWorld),e.hist.unshift([Jd.clone(),$d.clone()]),e.hist.length>e.N&&e.hist.pop()),jd(e))}function jd(i){let e=i.hist,t=i.m.geometry.attributes.position,n=i.m.geometry.attributes.color,s=i.fin?Math.max(0,i.vie/.18):1;for(let r=0;r<i.N;r++){let o=e[Math.min(r,e.length-1)];if(!o)continue;let a=(1-r/(i.N-1))*s*(r<e.length?1:0);t.setXYZ(r*2,o[0].x,o[0].y,o[0].z),t.setXYZ(r*2+1,o[1].x,o[1].y,o[1].z),n.setXYZ(r*2,a*.3,a*.3,a*.3),n.setXYZ(r*2+1,a,a,a)}t.needsUpdate=!0,n.needsUpdate=!0}function lA(){if(!(M.ombre||M.ombreR>0||M.coup)){M.ombre=!0,Ip();for(let i of Eh)i.o.material=i.b;document.body.classList.add("ombre"),Th()}}function Cp(){if(M.ombre){M.ombre=!1,M.ombreR=Tp,Ip();for(let i of Eh)i.o.material=i.a;document.body.classList.remove("ombre"),Th()}}function Rh(){M.ombre?Cp():lA()}function Ip(){for(let i=0;i<14;i++){let e=gt(Wt.fumeeOmbre,.5,!1),t=Math.random()*6.28,n=Math.random()*.4,s=.2+Math.random()*1.2;e.position.copy(he(M.x+Math.cos(t)*n,M.y+Math.sin(t)*n*.8,s)),ue.add(e),xn.push({sp:e,vx:Math.cos(t)*.8,vy:Math.sin(t)*.6,vz:.3+Math.random()*.5,vie:.6+Math.random()*.3,t:0,s0:.5,grossit:1})}}function bo(i,e){M.ombreR=Math.max(0,M.ombreR-i),iA(i),cA(i),oA(i,e),Ln&&!M.coup&&(M.cacheDague=(M.cacheDague||0)-i,M.cacheDague<=0&&(Ln.visible=!1));let t=M.ombreR/Tp;t!==bo.r&&(bo.r=t,ft("pOmbre").style.setProperty("--r",t.toFixed(3)));let n=M.sautR/ut.recharge;n!==bo.rs&&(bo.rs=n,ft("pSaut").style.setProperty("--r",n.toFixed(3)))}var ut=Lt?Jv:{dist:3,recharge:1.5,vitesse:1.2,depart:0,air:[0,.7],sortie:.7,fin:.82,elan:2.5};function pc(i,e){if(M.saut||M.sautR>0||!mt.saut)return;M.sort&&Ap();let t=Math.hypot(i||0,e||0)>.15?Math.atan2(e,i):M.a;M.saut={t:0,a:t,fait:0,pose:!1,dist:ut.dist},M.a=t,Ke&&Ut.ouvert&&(M.saut.dist=hA(t)),M.sautR=ut.recharge,M.derap=null,Rr.quaternion.identity(),Lt&&(eA(),Nr(M.x,M.y,t+Math.PI))}var uA=1.5;function hA(i){let e=t=>Xn(M.x+Math.cos(i)*t,M.y+Math.sin(i)*t);if(e(ut.dist))return ut.dist;for(let t=.1;t<=uA+1e-6;t+=.1)if(e(ut.dist+t))return ut.dist+t+(e(ut.dist+t+.2)?.2:0);for(let t=ut.dist-.1;t>.05;t-=.1)if(e(t))return t;return 0}function fA(i){let e=M.saut;e.t+=i;let t=ut.depart+e.t*ut.vitesse,n=Rt((t-ut.air[0])/(ut.air[1]-ut.air[0]),0,1);ut.murets&&n>.7&&!e.allonge&&wp(M.x+Math.cos(e.a)*(e.dist-e.fait),M.y+Math.sin(e.a)*(e.dist-e.fait))&&(e.dist+=1.2,e.allonge=!0);let s=e.dist*n;for(;e.fait<s-1e-6&&!e.bloque;){let r=Math.min(.05,s-e.fait),o=M.x+Math.cos(e.a)*r,a=M.y+Math.sin(e.a)*r;(ut.murets||Ke?Qv(o,a):Xn(o,a))?(M.x=o,M.y=a,e.fait+=r):e.bloque=!0}return!e.pose&&t>=ut.air[1]&&(e.pose=!0,pA(),Ke&&!Xn(M.x,M.y)&&Lp(),Te.v=Math.max(Te.v,ut.elan),Te.allure="course",Te.course=1,Te.marche=0,Te.garde=0),t>=ut.fin&&(M.saut=null),!e.pose}function dA(){if(!M.saut)return 0;let i=ut.depart+M.saut.t*ut.vitesse;return Math.min(on((i-ut.depart)/.07),1-on((i-ut.sortie)/(ut.fin-ut.sortie)))}function pA(){if(Nr(M.x,M.y,M.a+Math.PI),Lt)return;for(let e=0;e<9;e++){let t=e/9*6.28+Math.random()*.4,n=gt(mp.or[e%2],.2+Math.random()*.06,!0),s=M.x+Math.cos(t)*.2,r=M.y+Math.sin(t)*.15;n.position.copy(he(s,r,.15)),ue.add(n),Di.push({sp:n,x:s,y:r,z:.15,vx:Math.cos(t)*1.3,vy:Math.sin(t)*1,vz:1.1+Math.random()*.5,g:4,t:0,vie:.55})}let i=Ni(16767120,14,3.5);i&&(i.position.copy(he(M.x,M.y,.4)),xn.push({lum:i,t:0,vie:.35,I:14}))}var ic=[];function Nr(i,e,t){for(let n=0;n<7;n++){let s=gt(Wt.poussiere,.25,!1),r=(Math.random()-.5)*.5,o=(Math.random()-.5)*.4;Ke&&s.material.color.setHex(9406102),s.position.copy(he(i+r,e+o,.12)),ue.add(s),ic.push({sp:s,x:i+r,y:e+o,vx:Math.cos(t)*(.8+Math.random())+(Math.random()-.5),vy:Math.sin(t)*(.8+Math.random())+(Math.random()-.5),t:0})}}function mA(i){for(let e=ic.length-1;e>=0;e--){let t=ic[e];t.t+=i;let n=t.t/.5;if(n>=1){ue.remove(t.sp),t.sp.material.dispose(),ic.splice(e,1);continue}t.x+=t.vx*i*(1-n),t.y+=t.vy*i*(1-n),t.sp.position.copy(he(t.x,t.y,.12+.25*n));let s=.25+.6*n;t.sp.scale.set(s,s,1),t.sp.material.opacity=.7*(1-n)}}function gA(i){for(let e=xn.length-1;e>=0;e--){let t=xn[e];t.t+=i;let n=t.t/t.vie;if(n>=1){t.sp&&ue.remove(t.sp),t.lum&&Dr(t.lum),xn.splice(e,1);continue}if(t.lum){t.lum.intensity=t.I*(1-n)*(1-n);continue}t.sp.position.x+=t.vx*i,t.sp.position.y-=t.vy*i,t.sp.position.z+=t.vz*i,t.sp.material.opacity=1-n;let s=t.s0*(t.grossit?1+1.8*n:1-n*.6);t.sp.scale.set(s,s,1)}}var an={id:null,bx:0,by:0,mx:0,my:0};Io.addEventListener("pointerdown",i=>{if(i.clientX<innerWidth*.5&&an.id===null){an.id=i.pointerId,an.bx=i.clientX,an.by=i.clientY;try{Io.setPointerCapture(i.pointerId)}catch{}}});Io.addEventListener("pointermove",i=>{if(i.pointerId!==an.id)return;let e=Math.max(40,innerHeight*.13),t=i.clientX-an.bx,n=i.clientY-an.by,s=Math.hypot(t,n),r=Math.min(1,s/e),o=t,a=n/xh,c=Math.hypot(o,a)||1;an.mx=o/c*r,an.my=a/c*r;let l=ft("pouce");l.style.transform=`translate(${t/s*Math.min(s,e)||0}px,${n/s*Math.min(s,e)||0}px)`});var xA=i=>{i.pointerId===an.id&&(an.id=null,an.mx=an.my=0,ft("pouce").style.transform="")};["pointerup","pointercancel","lostpointercapture"].forEach(i=>Io.addEventListener(i,xA));var Sn={};addEventListener("keydown",i=>{Sn[i.key.toLowerCase()]=1;let e={1:"glace",2:"feu",3:"acide",4:"soin"}[i.key];e&&Sh(e),i.key===" "&&pc(M.mx,M.my)});addEventListener("keyup",i=>{Sn[i.key.toLowerCase()]=0});for(let[i,e]of[["bGlace","glace"],["bFeu","feu"],["bAcide","acide"],["bSoin","soin"]])ft(i).addEventListener("pointerdown",t=>{t.preventDefault(),Sh(e)});ft("bSaut").addEventListener("pointerdown",i=>{i.preventDefault(),pc(M.mx,M.my)});ft("bFissure")&&ft("bFissure").addEventListener("click",i=>{i.preventDefault(),Ih()});Ke&&addEventListener("keydown",i=>{(i.key==="f"||i.key==="F")&&Ih(),(i.key==="v"||i.key==="V")&&Dh()});ft("bVague")&&ft("bVague").addEventListener("click",i=>{i.preventDefault(),Dh()});ft("pSaut").addEventListener("pointerdown",i=>{i.preventDefault(),pc(M.mx,M.my)});ft("pDague").addEventListener("pointerdown",i=>{i.preventDefault(),Pr("dague")});ft("pAssomme").addEventListener("pointerdown",i=>{i.preventDefault(),Pr("assomme")});ft("pOmbre").addEventListener("pointerdown",i=>{i.preventDefault(),Rh()});Lt&&addEventListener("keydown",i=>{(i.key==="j"||i.key==="J")&&Pr("dague"),(i.key==="k"||i.key==="K")&&Pr("assomme"),(i.key==="l"||i.key==="L")&&Rh()});function Xn(i,e){return Ke?cc(Jt.libre,i,e)===1&&!Ch(i,e,.25)&&!RA(i,e):Pp(i,e)&&!wp(i,e)&&!(Lt&&Math.hypot(i-qn.x,e-qn.y)<qn.r+.3)}function Pp(i,e){let n=Za.coin+.35*Math.SQRT2;if(i<.35||i>Za.L-.35||e<.35||e>Za.P-.35||i+e<n||Za.L-i+e<n||Math.hypot(i-ke.x,e-ke.y)<ke.r+.35)return!1;for(let s of Object.values(ws))if(Math.hypot(i-s[0],e-s[1])<.55+.35)return!1;return!0}var Jt=Ke?(()=>{let i=Re.grille,e=t=>{let n=atob(t),s=new Uint8Array(i.nx*i.ny);for(let r=0;r<s.length;r++)s[r]=n.charCodeAt(r>>3)>>7-(r&7)&1;return s};return{pas:i.pas,nx:i.nx,ny:i.ny,x0:i.x0||0,libre:e(i.libre),crev:e(i.crevasse)}})():null;function cc(i,e,t){let n=Math.floor((e-Jt.x0)/Jt.pas),s=Math.floor(t/Jt.pas);return n>=0&&s>=0&&n<Jt.nx&&s<Jt.ny?i[s*Jt.nx+n]:0}var Ut={ouvert:!1,t:-1,cases:[],lum:[]};function Ch(i,e,t){if(!Ut.ouvert)return!1;if(cc(Jt.crev,i,e))return!0;if(t){for(let[n,s]of[[t,0],[-t,0],[0,t],[0,-t]])if(cc(Jt.crev,i+n,e+s))return!0}return!1}if(Ke){let i=Re.crev,e=[[],[],[],[]];for(let t=0;t<Jt.ny;t++)for(let n=0;n<Jt.nx;n++)if(Jt.crev[t*Jt.nx+n]){let s=Jt.x0+(n+.5)*Jt.pas,r=(t+.5)*Jt.pas,o=Ir(s,r,0);Ut.cases.push({x:s,y:r,q:(o.v-i[1])/i[3]}),e[(s>Re.xoff+.8?2:0)+(r>10?1:0)].push({x:s,y:r})}e.forEach((t,n)=>{if(!t.length)return;let s=t[Math.floor(t.length/2)],r=new fn(n%2?4646610:10511615,0,3.5,1.6);r.position.copy(he(s.x,s.y,-.4)),ue.add(r),Ut.lum.push(r)})}function Ih(){if(!Ke||Ut.t>=0)return;Ut.t=0,Ut.ouvert=!0,Xn(M.x,M.y)||Lp();let i=ft("bFissure");i&&i.classList.add("fait")}function Lp(){let i=null;for(let e=.2;e<4&&!i;e+=.2)for(let t=0;t<24;t++){let n=t/24*6.283,s=M.x+Math.cos(n)*e,r=M.y+Math.sin(n)*e;if(Xn(s,r)){i={x:s,y:r};break}}i&&(M.pousse={x:i.x,y:i.y},Nr(M.x,M.y,Math.atan2(i.y-M.y,i.x-M.x)))}function _A(i,e){if(M.pousse){let s=M.pousse.x-M.x,r=M.pousse.y-M.y,o=Math.hypot(s,r),a=7*i;o<=a?(M.x=M.pousse.x,M.y=M.pousse.y,M.pousse=null):(M.x+=s/o*a,M.y+=r/o*a)}if(Ut.t<0)return;Ut.t+=i;let t=Rt(Ut.t/1.3,0,1),n=t*1.35;if(Ot.uniforms.ouvre.value=t,Ot.uniforms.lueur.value=.3+.3*Math.sin(e*2.3),Ut.t<1.8&&(Be.bouge=Math.max(Be.bouge,1-Ut.t/1.8)),t<1&&(Ut.pouss=(Ut.pouss||0)-i,Ut.pouss<=0)){Ut.pouss=.07;let s=Ut.cases.filter(r=>Math.abs(r.q-n+.06)<.05);for(let r=0;r<1&&s.length;r++){let o=s[Math.floor(Math.random()*s.length)];Nr(o.x,o.y,Math.random()*6.28)}}Ut.lum.forEach((s,r)=>{s.intensity=t*(6+2.5*Math.sin(e*2.3+r*1.7))})}function fh(i){let e=innerWidth/innerHeight,t=Ir(M.x,M.y,0),n=Math.max(1150/(window.__zoom||1),(t.v+90-320)/.78),s=n*e;s>Ci*1.06&&(s=Ci*1.06,n=s/e);let r=Math.min(t.v+.22*n+90,Po+.12*n),o=Rt(r-n,0,320),a=s>=Ci?(Ci-s)/2:Rt(t.u-s/2,0,Ci-s),c=fh.vu?Math.min(1,i*4):1;fh.vu=1,Be.cx=Be.cx===void 0?a:Be.cx+(a-Be.cx)*c,Be.cy=Be.cy===void 0?o:Be.cy+(o-Be.cy)*c,Be.H=Be.H===void 0?n:Be.H+(n-Be.H)*c,Be.bouge>0&&(Be.bouge=Math.max(0,Be.bouge-i*1.4));let l=Be.H*e,u=Be.bouge?(Math.random()-.5)*30*Be.bouge:0,h=Be.bouge?(Math.random()-.5)*22*Be.bouge:0;Be.x0=Be.cx+u,Be.y0=Be.cy+h,Be.x1=Be.x0+l,Be.y1=Be.y0+Be.H,yv(),Ot.uniforms.fen.value.set(Be.x0,Be.y0,Be.x1,Be.y1),bn.getDrawingBufferSize(dh);for(let f of dc)f.m.uniforms.ecran.value.copy(dh)}var dh=new Le,Me={m:null,mix:null,lampes:[],halos:[],os:[],dec:[]};function yA(i){for(let e of i.tracks){let t=e.times.length-1,n=e.getValueSize(),s=e.values;if(!(t<6))for(let r=0;r<2;r++){let o=s.slice(0),a=(c,l)=>o[(c%t+t)%t*n+l];for(let c=0;c<t;c++)if(n===4){let l=[0,0,0,0];[[-2,1],[-1,4],[0,6],[1,4],[2,1]].forEach(([h,f])=>{let p=0;for(let x=0;x<4;x++)p+=a(c+h,x)*a(c,x);let g=p<0?-1:1;for(let x=0;x<4;x++)l[x]+=g*f*a(c+h,x)});let u=Math.hypot(...l);for(let h=0;h<4;h++)s[c*n+h]=l[h]/u}else for(let l=0;l<n;l++)s[c*n+l]=(a(c-2,l)+4*a(c-1,l)+6*a(c,l)+4*a(c+1,l)+a(c+2,l))/16;for(let c=0;c<n;c++)s[t*n+c]=s[c]}}}if(Ke){let i=new It;i.position.copy(he(ke.x,ke.y,ke.z)),ue.add(i);let e=3.6,t=new It;t.rotation.x=Math.PI/2,i.add(t);let n=new Se(new Nt(1,1),new wt({map:pn(128,128,a=>{let c=a.createRadialGradient(64,64,0,64,64,64);c.addColorStop(0,"rgba(255,190,90,.55)"),c.addColorStop(.45,"rgba(255,150,60,.18)"),c.addColorStop(1,"rgba(255,120,40,0)"),a.fillStyle=c,a.fillRect(0,0,128,128)}),transparent:!0,depthWrite:!1,blending:$n,toneMapped:!1}));n.scale.set(5.5,3.4,1),n.position.copy(he(ke.x,ke.y+2,ke.z+.02)),n.renderOrder=-8,ue.add(n),Me.lueurSol=n;let s=new ji(16777215,0);s.position.copy(he(ke.x-.4,ke.y-4,ke.z+4.5)),s.target.position.copy(he(ke.x,ke.y+2.5,ke.z)),ue.add(s,s.target);let r=new Se(new Nt(8,4.4),new fo({opacity:.64}));r.receiveShadow=!0,r.position.copy(he(ke.x,-8.1,ke.z+.003)),ue.add(r);let o=new Se(new Nt(1,1),new wt({map:pn(128,128,a=>{let c=a.createRadialGradient(64,64,0,64,64,64);c.addColorStop(0,"rgba(0,0,0,.5)"),c.addColorStop(.5,"rgba(0,0,0,.25)"),c.addColorStop(1,"rgba(0,0,0,0)"),a.fillStyle=c,a.fillRect(0,0,128,128)}),transparent:!0,depthWrite:!1,toneMapped:!1}));o.scale.set(2.6,1.5,1),o.position.copy(he(ke.x,ke.y+.1,ke.z+.006)),o.renderOrder=-7,ue.add(o),s.castShadow=!0,s.shadow.mapSize.set(1024,1024),Object.assign(s.shadow.camera,{left:-3.6,right:3.6,top:3.6,bottom:-3.6,near:1,far:9.3}),s.shadow.bias=-6e-4,s.shadow.radius=4,s.shadow.camera.updateProjectionMatrix(),rc("armure.json",a=>{let c=a.scene;Me.m=c,c.traverse(x=>{x.isMesh&&(x.castShadow=!0,x.receiveShadow=!1,x.frustumCulled=!1,x.material&&(x.material.envMapIntensity=.5,x.material.color.multiplyScalar(.8),x.material.emissiveIntensity=1,x.material.onBeforeCompile=m=>{m.vertexShader=`varying vec3 vPosM;
`+m.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
  vPosM = position;`),m.fragmentShader=`varying vec3 vPosM;
`+m.fragmentShader.replace("#include <emissivemap_fragment>",["#include <emissivemap_fragment>","  vec3 E0 = totalEmissiveRadiance; float lumE = max(E0.r, E0.g);","  float verre = smoothstep(0.45, 0.85, lumE), epaule = smoothstep(2.1, 2.2, vPosM.y) * smoothstep(0.28, 0.34, abs(vPosM.x));","  vec3 Eblanc = vec3(1.0, 0.93, 0.8) * (5.0 + 16.0 * lumE);","  totalEmissiveRadiance = mix(E0 * (0.55 + 2.6 * verre), Eblanc, smoothstep(0.12, 0.45, lumE) * epaule);"].join(`
`))}))}),c.scale.setScalar(e/3),t.add(c),c.updateMatrixWorld(!0);let l=x=>c.getObjectByName(x),u=l("Spine"),h=u,f=u,p=Math.sign(t.worldToLocal(l("LeftShoulder").getWorldPosition(new w)).x)||1,g=[[h,new w(.58*p,2.5,-.05),16769712,16,4.2],[f,new w(-.58*p,2.5,-.05),16769712,16,4.2],[u,new w(0,2.02,.42),16756816,6,3.2]];for(let[x,m,d,E,b]of g){let y=t.localToWorld(m.clone().multiplyScalar(e/3)),U=x.worldToLocal(y.clone()),R=new fn(d,E,b,1.6);R.userData.I=E,ue.add(R),Me.lampes.push(R),Me.os.push([x,U]);let C=Me.halos.length<2,I=gt(Vn(C?"rgba(255,236,196,.9)":"rgba(255,200,110,.85)"),C?1.5:1,!0);I.userData.o=C?1:.85,C&&(I.material.depthTest=!1,I.renderOrder=5),ue.add(I),Me.halos.push(I)}if(a.animations.length){yA(a.animations[0]),Me.mix=new xo(c);let x=Me.mix.clipAction(a.animations[0]);x.timeScale=.7,x.play(),Me.attente=x;let m=a.animations[0].tracks.find(d=>d.name==="Hips.quaternion");if(m){let d=0,E=0;for(let b=0;b<m.values.length;b+=4)d+=m.values[b+1],E+=m.values[b+3];c.rotation.y=-2*Math.atan2(d,E)}}{let x=[];c.traverse(d=>{d.isSkinnedMesh&&x.push(d)});let m=x[0];if(m){let d=m.geometry.attributes.position,E=m.geometry.attributes.skinWeight,b=m.geometry.attributes.skinIndex,y=m.skeleton.bones.map(I=>I.name),U={L:[],R:[]},R=1e9,C=-1e9;for(let I=0;I<d.count;I++){let S=d.getY(I);S<R&&(R=S),S>C&&(C=S)}for(let I=0;I<d.count;I++){if(d.getY(I)>R+(C-R)*.03)continue;let S=0,v=0;for(let P=0;P<4;P++)E.getComponent(I,P)>S&&(S=E.getComponent(I,P),v=b.getComponent(I,P));/^(Left|Right)(Foot|ToeBase)$/.test(y[v])&&U[y[v][0]].push(I)}Me.peau=m,Me.pieds=[["L","LeftFoot"],["R","RightFoot"]].map(([I,S])=>({os:c.getObjectByName(S),sommets:U[I],cible:null,brut:null})).filter(I=>I.os&&I.sommets.length)}}Me.bras=[["LeftArm","LeftForeArm"],["RightArm","RightForeArm"]].map(([x,m])=>[c.getObjectByName(x),c.getObjectByName(m)]).filter(([x,m])=>x&&m),rc("armure-parle.json",x=>{if(x.animations[0]&&Me.mix){let m=Dd.subclip(x.animations[0],"parle",0,180,30);m.tracks=m.tracks.filter(d=>!d.name.startsWith("Hips.position")),Me.parle=Me.mix.clipAction(m),Me.parle.setLoop(Va,1),Me.parle.clampWhenFinished=!1,Me.parle.timeScale=.55}},x=>console.error(x)),ss("armure")},a=>{console.error(a),ss("armure")})}var vA=pn(128,128,i=>{let e=i.createRadialGradient(64,64,0,64,64,64);e.addColorStop(0,"rgba(0,0,0,.92)"),e.addColorStop(.45,"rgba(0,0,0,.7)"),e.addColorStop(.75,"rgba(0,0,0,.25)"),e.addColorStop(1,"rgba(0,0,0,0)"),i.fillStyle=e,i.fillRect(0,0,128,128)}),Ts=new w,Mr=new w,Si=new w,Qd=new w,ep=new w,nh=new w,tp=new w,AA=new w(0,0,-1),np=new ct,ip=new ct,sp=new ct;function Dp(){Me.parle&&(Me.parle.reset().setEffectiveWeight(1).fadeIn(.4).play(),Me.attente.fadeOut(.4),Me.retour=Me.parle.getClip().duration/Me.parle.timeScale-.6)}ft("bParle")&&ft("bParle").addEventListener("click",i=>{i.preventDefault(),Dp()});function MA(i,e){if(!Me.m)return;if(Me.bras)for(let n of Me.bras)n[2]&&n[0].quaternion.copy(n[2]);if(Me.pieds)for(let n of Me.pieds)n.brut&&n.os.position.copy(n.brut);if(Me.retour!==void 0&&(Me.retour-=i)<=0&&(Me.retour=void 0,Me.attente.reset().fadeIn(.6).play(),Me.parle.fadeOut(.6)),Me.mix&&Me.mix.update(i),Me.m.updateMatrixWorld(!0),Me.bras)for(let n of Me.bras)(n[2]||(n[2]=new ct)).copy(n[0].quaternion);let t=Me.attente?Me.attente.getEffectiveWeight():0;if(Me.pieds)for(let n of Me.pieds){(n.brut||(n.brut=new w)).copy(n.os.position);let s=1e9,r=0,o=0;for(let a of n.sommets)Me.peau.getVertexPosition(a,Ts),Me.peau.localToWorld(Ts),ue.worldToLocal(Ts),Ts.z<s&&(s=Ts.z),r+=Ts.x,o+=Ts.y;r/=n.sommets.length,o/=n.sommets.length,n.cible||(n.cible=new w(r,o,ke.z),n.ombre=new Se(new Nt(1,1),new wt({map:vA,transparent:!0,depthWrite:!1,toneMapped:!1})),n.ombre.scale.set(.95,.85,1),n.ombre.renderOrder=-6,ue.add(n.ombre)),Mr.set((n.cible.x-r)*t,(n.cible.y-o)*t,n.cible.z-s),Mr.length()>.25&&Mr.setLength(.25),n.os.getWorldPosition(Si),ue.worldToLocal(Si).add(Mr),ue.localToWorld(Si),n.os.parent.worldToLocal(Si),n.os.position.copy(Si),n.os.updateMatrixWorld(!0),n.ombre.position.set(r+Mr.x,o+Mr.y-.04,ke.z+.008)}if(Me.bras&&t>.001)for(let[n,s]of Me.bras)n.getWorldPosition(Qd),s.getWorldPosition(ep),nh.subVectors(ep,Qd).normalize(),tp.copy(nh).lerp(AA,.4*t).normalize(),np.setFromUnitVectors(nh,tp),n.getWorldQuaternion(ip),n.parent.getWorldQuaternion(sp),n.quaternion.copy(sp.invert().multiply(np.multiply(ip))),n.updateMatrixWorld(!0);Me.os.forEach(([n,s],r)=>{n.localToWorld(Si.copy(s)),ue.worldToLocal(Si),Me.lampes[r].position.copy(Si),Me.halos[r].position.copy(Si);let o=.92+.08*Math.sin(e*(5.1+r)+r*2)*Math.sin(e*2.3+r);Me.lampes[r].intensity=Me.lampes[r].userData.I*o,Me.halos[r].material.opacity=Me.halos[r].userData.o*o}),Me.lueurSol.material.opacity=.85+.15*Math.sin(e*2.3)}var Li=Ke?zd:[],Ce={t:-1,actifs:[],touche:0,pret:!1,tw:-1},Ph=[],Lh=[],Co=[],ph=[],SA=Li.length*2,$a=()=>{if(--SA===0){Ce.pret=!0;let i=ft("bVague");i&&i.classList.remove("fait")}};Ke&&Li.forEach((i,e)=>{let t=String(e).padStart(2,"0");Ph[e]=Cs.load("nuit/cr/c"+t+".jpg",n=>{n.colorSpace=St,n.needsUpdate=!0,$a()},void 0,$a),Lh[e]=Cs.load("nuit/cr/m"+t+".png",n=>{n.colorSpace=gn,n.needsUpdate=!0,$a()},void 0,$a)});function bA(i){if(Co[i])return;let e=String(i).padStart(2,"0");Co[i]=Cs.load("nuit/cr/e"+e+".jpg",t=>{t.colorSpace=St,t.minFilter=qt,t.generateMipmaps=!1,t.needsUpdate=!0,t.pret=!0}),ph[i]=Cs.load("nuit/cr/k"+e+".png",t=>{t.colorSpace=gn,t.needsUpdate=!0,t.pret=!0})}var ts=null;if(Ke){let i=new Image;i.onload=()=>{let e=document.createElement("canvas");e.width=i.width,e.height=i.height;let t=e.getContext("2d");t.drawImage(i,0,0),ts={w:i.width,h:i.height,d:t.getImageData(0,0,i.width,i.height).data}},i.src="nuit/arrivee.png"}function Tr(i,e){if(!ts)return 1/0;let t=Ir(i,e,0),n=Rt(Math.floor(t.u/Ci*ts.w),0,ts.w-1),s=Rt(Math.floor(t.v/Po*ts.h),0,ts.h-1),r=ts.d[(s*ts.w+n)*4];return r>=254?1/0:r/24}var EA="uniform vec4 fen; uniform vec4 boite; varying vec2 vP; void main(){ vec2 p = boite.xy + (vec2(position.x, -position.y) + 0.5) * boite.zw; vP = p; gl_Position = vec4((p.x - fen.x) / (fen.z - fen.x) * 2.0 - 1.0, 1.0 - (p.y - fen.y) / (fen.w - fen.y) * 2.0, 0.0, 1.0); }",Np=`uniform sampler2D cr; uniform sampler2D mk; uniform vec4 rect; uniform float rouge; uniform float piedV; uniform float hautV;
  vec3 couleur(vec2 q, float py){   // la couleur de sa peinture ; le rouge monte du pied en fondu
    vec3 c = texture2D(cr, vec2(q.x * 0.5, 1.0 - q.y)).rgb, r = texture2D(cr, vec2(0.5 + q.x * 0.5, 1.0 - q.y)).rgb;
    float h = (piedV - py) / max(1.0, piedV - hautV), m = clamp((rouge * 1.45 - h) / 0.45, 0.0, 1.0);
    return mix(c, r, m); }`;function TA(i){let e=Li[i],t=e.eclat,n=Math.min(e.rect[0],t.rect[0]),s=Math.min(e.rect[1],t.rect[1]),r=Math.max(e.rect[0]+e.rect[2],t.rect[0]+t.rect[2]),o=Math.max(e.rect[1]+e.rect[3],t.rect[1]+t.rect[3]);return new sn({uniforms:{fen:Ot.uniforms.fen,boite:{value:new Oe(n,s,r-n,o-s)},cr:{value:Ph[i]},mk:{value:Lh[i]},at:{value:null},km:{value:null},rect:{value:new Oe(...e.rect)},erect:{value:new Oe(...t.rect)},tuile:{value:new Oe(t.tuile[0],t.tuile[1],t.cols,t.n)},atl:{value:new Le(...t.atlas)},rouge:{value:0},piedV:{value:e.pied[1]},hautV:{value:e.sommet},montre:{value:0},eclat:{value:-1},fondu:{value:1},fd:Ot.uniforms.fond,img:Ot.uniforms.img},vertexShader:EA,fragmentShader:Np+`
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
      }`,transparent:!1,blending:au,blendSrc:eo,blendDst:to,depthTest:!1,depthWrite:!1,toneMapped:!1})}function wA(i){let e=Li[i];return new sn({uniforms:{cr:{value:Ph[i]},mk:{value:Lh[i]},fen:Ot.uniforms.fen,ecran:{value:dh},rect:{value:new Oe(...e.rect)},rouge:{value:0},piedV:{value:e.pied[1]},hautV:{value:e.sommet},dv:{value:0},eclair:{value:0}},vertexShader:"void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:Np+`
      uniform vec4 fen; uniform vec2 ecran; uniform float dv; uniform float eclair;
      void main(){
        vec2 e = gl_FragCoord.xy / ecran, p = vec2(mix(fen.x, fen.z, e.x), mix(fen.w, fen.y, e.y)) + vec2(0.0, dv), q = (p - rect.xy) / rect.zw;
        if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) discard;
        float b = texture2D(mk, vec2(q.x, 1.0 - q.y)).g; if (b < 0.06) discard;
        vec3 c = couleur(q, p.y); c += eclair * vec3(1.0, 0.95, 0.9);
        gl_FragColor = vec4(c, smoothstep(0.06, 0.6, b));
        #include <colorspace_fragment>
      }`,transparent:!0,depthWrite:!0,toneMapped:!1,side:tn})}function wr(i){return Math.max(.5,Math.min(1.3,i.larg*.42))}var Up=i=>i.etat==="plante"||i.etat==="chauffe"||i.etat==="eclate"&&Ce.tw<bi;function RA(i,e){for(let t of Ce.actifs)if(Up(t)&&Math.hypot(i-t.S.x,e-t.S.y)<wr(t.S)+.2)return!0;return!1}function Op(i,e){for(let t of Ce.actifs){if(!Up(t))continue;let n=t.S.x-ke.x,s=t.S.y-ke.y,r=Math.hypot(n,s),o=n/r,a=s/r,c=i-ke.x,l=e-ke.y,u=c*o+l*a-r,h=Math.abs(c*a-l*o),f=wr(t.S)*1.05+Math.max(u,0)*.12;if(u>.15&&u<4.6&&h<f*.85)return!0}return!1}function CA(){if(window.__tirage)return window.__tirage;for(let i=0;i<400;i++){let e=Li.map((n,s)=>s).sort(()=>Math.random()-.5),t=[];for(let n of e){let s=Li[n];if(!(Math.hypot(s.x-M.x,s.y-M.y)<2.4||Math.hypot(s.x-ke.x,s.y-ke.y)<3.6||Ut.ouvert&&Ch(s.x,s.y,.8))&&!t.some(r=>Math.hypot(s.x-Li[r].x,s.y-Li[r].y)<4.6)&&(t.push(n),t.length===3))return t}}return[0,4,19]}var IA=pn(64,64,i=>{let e=i.createRadialGradient(32,32,0,32,32,32);e.addColorStop(0,"rgba(0,0,0,.7)"),e.addColorStop(1,"rgba(0,0,0,0)"),i.fillStyle=e,i.fillRect(0,0,64,64)}),PA=2.7,bi=6.4;function Dh(){if(!Ke||Ce.t>=0||!Ce.pret)return;for(let e of Ce.actifs)Fp(e);Ce.actifs=[],Ce.t=0,Ce.tw=-1,Ce.touche=0,Ce.passe=!1,Ce.secours=!1,Ce.tv=-1,Ce.tvT=0,CA().forEach((e,t)=>{let n=Li[e];bA(e);let s=new Se(new Nt(1,1),TA(e));s.frustumCulled=!1,s.renderOrder=-9,dn.add(s);let r=Math.max(2.6,n.larg+2.2),o=n.haut+1.6,a=new Se(new Nt(r,o),wA(e));a.frustumCulled=!1,a.visible=!1,ue.add(a);let c=new Se(new Nt(1,1),new wt({map:IA,transparent:!0,opacity:0,depthWrite:!1,toneMapped:!1}));c.position.copy(he(n.x,n.y,.01)),ue.add(c);let l=new be(...n.couleur),u=new fn(l,0,5.5,1.5);u.position.copy(he(n.x,n.y+.6,1.3)),ue.add(u);let h=gt(Wt.glace,1,!0);h.material.color.copy(l),h.visible=!1,ue.add(h),Ce.actifs.push({i:e,S:n,sol:s,corps:a,ombre:c,l:u,coul:l,trainee:h,larg:r,haut:o,etat:"attente",debut:.25+t*.4,z:15,vz:0,t:0})});let i=ft("bVague");if(i&&i.classList.add("fait"),lt)try{lt.pause(),lt.currentTime=0}catch{}}var lt=null,ih=null;if(Ke){lt=document.createElement("video"),lt.muted=!0,lt.loop=!1,lt.playsInline=!0,lt.setAttribute("playsinline",""),lt.preload="auto";let i=lt.canPlayType("video/mp4")?"nuit/vague.mp4":"nuit/vague.webm";fetch(i).then(e=>e.blob()).then(e=>{lt.src=URL.createObjectURL(e)}).catch(e=>console.error(e)),ih=new Oa(lt),ih.colorSpace=gn,Ot.uniforms.vid.value=ih,Ce.feuL=new fn(16742954,0,6,1.4),ue.add(Ce.feuL),Ce.charge=new fn(16734752,0,14,1.3),Ce.charge.position.copy(he(ke.x,ke.y+1,ke.zc)),ue.add(Ce.charge)}function Fp(i){dn.remove(i.sol),ue.remove(i.corps,i.ombre,i.l,i.trainee),i.sol.material.dispose(),i.corps.material.dispose()}var sh={};function Bp(i,e){sh[i]||(sh[i]=pn(256,64,n=>{n.font="bold 40px system-ui, sans-serif",n.textAlign="center",n.textBaseline="middle",n.lineWidth=7,n.strokeStyle="rgba(0,0,0,.85)",n.strokeText(i,128,34),n.fillStyle=e,n.fillText(i,128,34)}));let t=gt(sh[i],1.6,!1);t.scale.set(1.9,.48,1),t.material.depthTest=!1,t.renderOrder=10,ue.add(t),Di.push({sp:t,x:M.x,y:M.y,z:2.2,vx:0,vy:0,vz:.5,t:0,vie:1.3,fixe:!0})}function rp(){if(Ce.touche>0)return;Ce.touche=1,Bp("Touch\xE9 !","#ff6a4a");let i=ft("rouge");i&&(i.style.transition="none",i.style.opacity="1",requestAnimationFrame(()=>{i.style.transition="opacity .6s",i.style.opacity="0"}))}function LA(i,e){if(Ot.uniforms.temps.value=e,Ce.touche>0&&(Ce.touche-=i),Ce.t<0)return;Ce.t+=i;let t=Ce.t,n=t-PA;if(Ce.tw=n,Ot.uniforms.tw.value=Math.max(0,n),n>=0&&lt){if(!Ce.lance){Ce.lance=!0;try{lt.currentTime=0,window.__pilote||lt.play().catch(()=>{})}catch{}}if(window.__pilote)try{Math.abs(lt.currentTime-Math.min(n,5.1))>.03&&(lt.currentTime=Math.min(n,5.1))}catch{}else n<4.8&&(lt.currentTime!==Ce.tv&&(Ce.tv=lt.currentTime,Ce.tvT=n),n-Ce.tvT>.7&&(Ce.secours=!0))}let s=lt&&lt.readyState>=2&&lt.currentTime>.03;Ot.uniforms.secours.value=Ce.secours||!s?1:0,Ot.uniforms.vague.value=n<0?0:n<.3?n/.3:n<bi?1:Math.max(0,1-(n-bi)),Ce.charge.intensity=n>.2&&n<1.6?70*Math.sin(Math.PI*(n-.2)/1.4):0,n>.2&&n<1.2&&(Be.bouge=Math.max(Be.bouge,.15));let r=Tr(M.x,M.y),o=n>=r&&n<bi,a=Op(M.x,M.y);o&&!Ce.passe&&(Ce.passe=!0,a&&Bp("\xC0 l\u2019abri !","#8dffb0")),o&&!a&&!M.saut&&rp(),Ce.feuL.position.copy(he(M.x,M.y+.3,.3)),Ce.feuL.intensity+=((o&&!a?30:n>0&&n<bi&&Math.min(Tr(M.x+1.2,M.y),Tr(M.x-1.2,M.y),Tr(M.x,M.y-1.2))<=n?12:0)-Ce.feuL.intensity)*Math.min(1,i*6);let c=Ot.uniforms.cri.value;if(Ce.actifs.forEach((l,u)=>{let h=l.S,f=l.sol.material.uniforms,p=l.corps.material.uniforms;if(l.t+=i,l.etat==="attente"&&t>=l.debut&&(l.etat="chute",l.corps.visible=!0,l.trainee.visible=!0),l.etat==="attente"||l.etat==="chute"){let g=Rt((t-l.debut+.6)/1.4,0,1);l.ombre.material.opacity=.55*g;let x=(.6+1.4*g)*Math.max(1,h.larg*.6);l.ombre.scale.set(x,x*.7,1)}if(l.etat==="chute"){l.vz-=32*i,l.z=Math.max(0,l.z+l.vz*i);let g=Ir(h.x,h.y,0),x=Ir(h.x,h.y,l.z);if(p.dv.value=g.v-x.v,l.corps.position.copy(he(h.x,h.y,l.haut/2-.4+l.z)),l.corps.up.set(0,0,1),l.corps.lookAt(new w(yt.position.x,yt.position.y,l.haut/2-.4+l.z)),l.trainee.position.copy(he(h.x,h.y,l.z+l.haut*.85)),l.trainee.scale.set(1.2,3.2,1),l.trainee.material.opacity=.5,l.l.intensity=5,l.l.position.copy(he(h.x,h.y+.6,l.z+1.3)),l.z<=0){l.etat="plante",l.t=0,p.dv.value=0,l.trainee.visible=!1,l.ombre.visible=!1,Be.bouge=Math.max(Be.bouge,.6);for(let d=0;d<5;d++)Nr(h.x,h.y,d*1.26+Math.random());let m=Ni(16777215,40,7);if(m&&(m.color.copy(l.coul),m.position.copy(he(h.x,h.y,.8)),xn.push({lum:m,t:0,vie:.35,I:40})),Math.hypot(M.x-h.x,M.y-h.y)<wr(h)+.4){rp();let d=Math.atan2(M.y-h.y,M.x-h.x);M.pousse={x:h.x+Math.cos(d)*(wr(h)+.8),y:h.y+Math.sin(d)*(wr(h)+.8)}}}}if((l.etat==="plante"||l.etat==="chauffe")&&(f.montre.value=Math.min(1,l.t/.15),p.eclair.value=Math.max(0,.35-l.t*1.5),c[u].set(h.x,h.y,wr(h)*1.05,1),l.l.intensity=4+1*Math.sin(e*2+u),l.l.position.copy(he(h.x,h.y+.6,1.3)),l.etat==="plante"&&n>=Math.min(Tr(h.x,h.y-.3),bi-2.2)&&(l.etat="chauffe",l.tc=0,l.ta=n),l.etat==="chauffe")){l.tc+=i;let g=l.ta,x=bi-1+u*.15,m=Rt((n-g)/Math.max(1.2,x-g),0,1);f.rouge.value=m,p.rouge.value=m,l.l.color.copy(l.coul).lerp(new be(16723984),m),l.l.intensity=4+10*m,n>=x&&Co[l.i]&&Co[l.i].pret&&ph[l.i].pret?(l.etat="eclate",l.te=0,f.at.value=Co[l.i],f.km.value=ph[l.i]):n>=x+1&&(l.etat="eclate",l.te=0)}if(l.etat==="eclate"){if(l.te+=i,l.corps.visible=l.te<.25&&!!f.at.value,c[u].w=n<bi?1:0,!l.boum&&l.te>=1){l.boum=!0;let g=Ni(16728096,60,9);g&&(g.position.copy(he(h.x,h.y,1.5)),xn.push({lum:g,t:0,vie:.6,I:60}))}l.l.intensity=l.te<1?14:Math.max(0,14*(1-(l.te-1)/1.2)),f.at.value?(f.eclat.value=Math.min(29,l.te*10),f.fondu.value=l.te<2.6?1:Math.max(0,1-(l.te-2.6)/.5)):(f.fondu.value=Math.max(0,1-l.te/.4),l.corps.visible=l.te<.4),l.te>3.2&&(l.etat="fini",c[u].w=0,Fp(l))}}),n>bi+1.1&&Ce.actifs.every(l=>l.etat==="fini")){Ce.t=-1,Ce.lance=!1,Ot.uniforms.vague.value=0,Ce.actifs=[],c.forEach(u=>u.set(0,0,0,0)),Ce.feuL.intensity=0;let l=ft("bVague");l&&l.classList.remove("fait"),lt&&lt.pause()}}var op=new Set(Ke?["fond","crev","crevA","feu","arrivee","pilier-g","pilier-d","barde","armure"]:["fond","prof","barde"]),lc=!1;function ss(i){op.delete(i),!op.size&&!lc&&(lc=!0,ft("charge").style.display="none")}var mh=performance.now(),gh=60,rh=0,oh=mh,uc=0;function hc(i){requestAnimationFrame(hc);let e=Math.min(.05,(i-mh)/1e3);mh=i,rh++,i-oh>1e3&&(gh=Math.round(rh*1e3/(i-oh)),rh=0,oh=i,ft("ips").textContent=gh),!window.__pilote&&lc&&(uc+=e,fc(e,uc)),bn.render(dn,yt)}function DA(i){for(let e=0;e<Math.round(i*60);e++)uc+=1/60,fc(1/60,uc)}function fc(i,e){let t=an.mx,n=an.my,s=(Sn.arrowright||Sn.d?1:0)-(Sn.arrowleft||Sn.q||Sn.a?1:0),r=(Sn.arrowdown||Sn.s?1:0)-(Sn.arrowup||Sn.z||Sn.w?1:0);if(s||r){let g=Math.hypot(s,r),x=Sn.shift?.25:1;t=s/g*x,n=r/g*x}M.sort&&Math.hypot(t,n)>.15&&Ap();let o=!M.sort&&Math.hypot(t,n)>.15;if(M.sautR=Math.max(0,(M.sautR||0)-i),M.mx=t,M.my=n,Lt&&M.coup?(Te.v=Math.max(0,Te.v-20*i),Te.v<.05&&(Te.allure=M.ombre?"guet":"garde")):(!M.saut||!fA(i))&&Ev(i,t,n),M.tl+=i,M.geste!==void 0&&(M.geste+=i),M.luth==="sort"&&M.tl>=.85&&(M.luth="main",M.tl=0),M.luth==="range"&&M.tl>=.8&&(M.luth="dos",M.tl=0),M.sort){if(M.sortT+=i,M.sort!=="soin"&&(M.a=window.__face!==void 0&&window.__face!==!1?typeof window.__face=="number"?window.__face:Math.PI/2:Math.atan2(ke.y-M.y,ke.x-M.x)),(M.luth==="main"||M.luth==="sort"&&M.tl>.6)&&Dn&&(M.petite=(M.petite||0)-i,M.petite<=0&&(Xv(M.sort),M.petite=M.sort==="soin"?.16:.22),Ei||(Ei=Ni(Lr[M.sort].charge,0,2.5)),Ei)){let x=hh(.3);Ei.position.copy(he(x.x,x.y,x.z)),Ei.intensity=9*on(M.sortT/M.sortD)}M.sortT>=M.sortD&&(M.sort==="soin"?Yv():Bv(M.sort,Dn?hh():null),M.dernier=M.sort,M.sort=null,M.garde=.9,M.geste=0,M.eclair=!1,Dr(Ei),Ei=null)}else M.luth==="main"&&(M.garde-=i,(o||M.garde<=0)&&(M.luth="range",M.tl=0));if(M.derap){let g=M.derap;g.t+=i;let x=Math.min(1,g.t/.22),m=1-Math.pow(1-x,3);Pi.rotation.z=g.rz0+g.da*m;let d=.38*Math.sin(Math.min(1,g.t/.3)*Math.PI),E=new w(Math.cos(g.a1),-Math.sin(g.a1),0);Rr.quaternion.setFromAxisAngle(new w(0,0,1).cross(E).normalize(),d),g.t>=.3&&(M.derap=null,Rr.quaternion.identity())}else{let x=Math.PI/2-M.a-Pi.rotation.z;x=Math.atan2(Math.sin(x),Math.cos(x)),Pi.rotation.z+=x*Math.min(1,i*(M.saut||M.coup?30:12))}Rr.position.copy(he(M.x,M.y,0));let a=M.sautR/ut.recharge;a!==fc.r&&(fc.r=a,ft("bSaut").style.setProperty("--r",a.toFixed(3))),Cr&&(Tv(i),Cr.update(i)),Ke&&MA(i,e),Pv(),Pi.updateMatrixWorld(!0),Uv(i,e),Ke&&(_A(i,e),LA(i,e)),zv(i),gA(i),qv(i),Fv(i),mA(i),Gv(i),Kv(i),Lt&&bo(i,e);for(let g of gp){let x=.85+.15*Math.sin(e*11+g.b[0]+g.i*2)+.08*Math.sin(e*27+g.i),m=(.42-g.i*.09)*x;g.f.scale.set(m,m*1.6,1),g.f.position.x=Math.sin(e*7+g.i*2.1)*.04+(g.i-1)*.06}fp.forEach((g,x)=>{g.intensity=40*(.85+.12*Math.sin(e*9+x*3)+.06*Math.sin(e*23+x))}),lh&&(lh.intensity=45*(.9+.1*Math.sin(e*2.1)));for(let g of Eo.lanternes){let x=.9+.07*Math.sin(e*9+g.x)+.04*Math.sin(e*23+g.y);g.l.intensity=70*x,g.pt.intensity=18*x,g.l.shadow.intensity=Rt(1.5-Math.hypot(M.x-g.x,M.y-g.y)/5,0,1)}for(let g of dc)g.halo.material.opacity=.16+.05*Math.sin(e*9+g.x)+.03*Math.sin(e*21);if(Ke){fh(i);return}let c=ah(M.x),l=sc(M.y,0),u=ns<=Ti?(ns-Ti)/2:Rt(c-Ti/2,0,ns-Ti),h=sc(ke.y,4.9)-10,f=Math.max(h-30,l+50-ti);f=is<=ti?(is-ti)/2:Rt(f,0,is-ti),hc.vu||(wi=u,Ri=f,hc.vu=1);let p=Math.min(1,i*5);wi+=(u-wi)*p,Ri+=(f-Ri)*p,_v(),Ot.uniforms.fen.value.set(wi/ns,Ri/is,(wi+Ti)/ns,(Ri+ti)/is)}requestAnimationFrame(hc);function NA(){let i={};if(!cn)return i;for(let e of["LeftToeBase","RightToeBase"]){let t=cn.getObjectByName(e);if(!t)continue;t.updateWorldMatrix(!0,!1);let n=new w().setFromMatrixPosition(t.matrixWorld);i[e]=[n.x,-n.y,n.z/Lo]}return i}function zp(){let i={};for(let e of["LeftToeBase","Hips"]){let t=cn.getObjectByName(e);t.updateWorldMatrix(!0,!1);let n=new w().setFromMatrixPosition(t.matrixWorld);cn.worldToLocal(n),i[e]=[n.x,n.y,n.z]}return i.t=mt.marche?mt.marche.time:0,i.ts=mt.marche?mt.marche.getEffectiveTimeScale():0,i}function UA(i,e){for(let n in mt)mt[n].play(),mt[n].setEffectiveWeight(n===i?1:0),mt[n].timeScale=0;mt[i].time=e,Cr.update(0),cn.updateMatrixWorld(!0);let t=zp();for(let n of["LeftUpLeg","LeftLeg","Hips"]){let s=cn.getObjectByName(n);t[n+"_q"]=s.quaternion.toArray(),t[n+"_p"]=s.position.toArray()}return t.pistes=mt[i].getClip().tracks.slice(0,6).map(n=>n.name),t.nbPistes=mt[i].getClip().tracks.length,t.duree=mt[i].getClip().duration,t}window.__essai={armure:Me,parleGrosbec:Dp,solOmbre:Rs,osM:i=>{let e={};for(let t of i){let n=cn.getObjectByName(t);if(!n)continue;n.updateWorldMatrix(!0,!1);let s=new w().setFromMatrixPosition(n.matrixWorld);cn.worldToLocal(s),e[t]=[s.x,s.y,s.z]}return e},frapper:Pr,basculerOmbre:Rh,mq:it,MURETS:bh,COUPS:Ep,sauter:pc,SAUT:ut,get tirs(){return To.map(i=>({x:i.x,y:i.y,z:i.z,q:i.q}))},ecran:(i,e,t)=>{if(Ke){yt.updateMatrixWorld();let n=he(i,e,t).project(yt);return{x:(n.x+1)/2*innerWidth,y:(1-n.y)/2*innerHeight}}return{x:(ah(i)-wi)*innerWidth/Ti,y:(sc(e,t)-Ri)*innerHeight/ti}},fissurer:Ih,lancerVague:Dh,get vague(){return Ce},video:()=>lt?[lt.currentSrc.split("/").pop(),lt.readyState,lt.paused,lt.currentTime]:null,cristaux:()=>Ce.actifs.map(i=>({i:i.i,x:i.S.x,y:i.S.y,etat:i.etat})),arriveFeu:Tr,abrite:()=>Op(M.x,M.y),imgDe:Ir,solImg:hp,fen:Be,crev:Ut,NJ:Re,libre:Xn,dansCrevasse:Ch,nuit:Eo,piliers:dc,poser:UA,piedsModele:zp,pieds:NA,avancer:DA,taille:_h,joy:an,loco:Te,h:M,get ips(){return gh},lancer:Sh,OS:()=>Kt,LUTH:()=>Dn,get pret(){return lc},get vue(){return{camX:wi,camY:Ri,Ws:Ti,Hs:ti,hx:ah(M.x),hy:sc(M.y)}}};})();
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2024 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
