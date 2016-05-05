function initPage(){

	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
		var container, stats;
		var camera, scene, renderer, objects;
		var particleLight, pointLight;
		var dae;
		var object;
		var mixer;

		var geometry;
		var material;
		var sphere;
		var spheresArray = [], plane;

		var textureEquirec;
		
		var projector;
		var mouseVector;

		var containerWidth = window.innerWidth;
		var containerHeight = window.innerHeight;
		
		var obj;
		var objName;

		// Collada model
		var loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		loader.load('./assets/models/model.dae',
			function (collada) {
				dae = collada.scene;
				dae.traverse( function ( child ) {
					if (child instanceof THREE.SkinnedMesh) {
						var animation = new THREE.Animation(child, child.geometry.animation);
						animation.play();
					}
				});

			dae.scale.x = dae.scale.y = dae.scale.z = 1;
			dae.position.y = -5.5;
			dae.rotation.y = Math.PI * 0.5;

			dae.updateMatrix();

			init();
			
			render();
			controls();
		},

		// Function called when download progresses
		function ( xhr ) {
			$('#text-loader').text(Math.round((xhr.loaded / xhr.total * 100)) + '%')
		}
	);


	function init() {
		/*
		var texture = new THREE.Texture( generateTexture() );
			texture.needsUpdate = true;
		*/
		container = document.createElement('div');
		document.body.appendChild(container);
		camera = new THREE.PerspectiveCamera(50, containerWidth / containerHeight, 1, 2000);
		camera.position.set(2, 4, 5);
		scene = new THREE.Scene();

		// Add the COLLADA
		scene.add(dae);

		// Spheres
		geometry = new THREE.SphereGeometry(0.25, 32, 32);
		material = new THREE.MeshPhongMaterial({color: 0xff5500, specular: 0x009900, shininess: 30,  map: textureEquirec, transparent: true, opacity: 0.5});
		//new THREE.MeshBasicMaterial({color: 0xffaa00, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.5});
		sphere1 = new THREE.Mesh( geometry, material);
		sphere1.position.x = 0.5;
		sphere1.name = 'sphere-1';
		scene.add(sphere1);

		spheresArray.push(sphere1);

		material = new THREE.MeshBasicMaterial({color: 0xffaa00, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.5});
		sphere2 = new THREE.Mesh( geometry, material);
		sphere2.position.x = -0.7;
		sphere2.name = 'sphere-2';
		scene.add(sphere2);

		spheresArray.push(sphere2);
		/*
		var radius   = 1,
			segments = 60,
			material = new THREE.MeshLambertMaterial({color: 0xdddddd, shading: THREE.FlatShading });
			geometry = new THREE.CircleGeometry(radius, segments);
		var circle = new THREE.Line(geometry, material)
		
		geometry.vertices.shift();
		scene.add(circle);

		console.log(': ' + circle)
		*/

		// Lights
		scene.add(new THREE.AmbientLight(0xFFFFFF));
		pointLight = new THREE.PointLight(0xFF3300, 2.5, 50);
		pointLight.position.set(10, 3, 0);
		scene.add(pointLight);

		pointLight = new THREE.PointLight(0xFF5500, 1, 70);
		pointLight.position.set(-10, -3, 0);
		scene.add(pointLight);

		// ----------------- TEXTURE SKYBOX
		var textureLoader = new THREE.TextureLoader();
		textureEquirec = textureLoader.load('./assets/img/textures/field_pano_3.jpg');
		textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
		textureEquirec.magFilter = THREE.LinearFilter;
		textureEquirec.minFilter = THREE.LinearMipMapLinearFilter;

		var equirectShader = THREE.ShaderLib[ "equirect" ];
		var equirectMaterial = new THREE.ShaderMaterial( {
			fragmentShader: equirectShader.fragmentShader,
			vertexShader: equirectShader.vertexShader,
			uniforms: equirectShader.uniforms,
			depthWrite: false,
			side: THREE.BackSide
		});

		equirectMaterial.uniforms[ "tEquirect" ].value = textureEquirec;

		var geometry = new THREE.SphereGeometry( 400.0, 24, 24 );
		sphereMaterial = new THREE.MeshLambertMaterial( { envMap: textureEquirec } );
		sphereMesh = new THREE.Mesh( geometry, sphereMaterial );
		scene.add( sphereMesh );

		cubeMesh = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100 ), sphereMaterial );
		scene.add( cubeMesh );

		textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
		cubeMesh.material = equirectMaterial;
		cubeMesh.visible = true;
		sphereMaterial.envMap = textureEquirec;
		sphereMaterial.needsUpdate = true;
		
		// Renderer
		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(containerWidth, containerHeight);
		container.appendChild( renderer.domElement );

		// Mouse Vector
		projector = new THREE.Projector();
		mouseVector = new THREE.Vector3();

		// Set material dae[Collada]
		setMaterial(dae, new THREE.MeshLambertMaterial( { color: 0xFFF8D2, envMap: textureEquirec }));

		function setMaterial(node, material) {
			node.material = material;
			
			if (node.children) {
				for (var i = 0; i < node.children.length; i++) {
					setMaterial(node.children[i], material);
				}
			}
		}









		// Events
		window.addEventListener('resize', onWindowResize, false);
		//window.addEventListener('mousemove', onMouseMove, false);
		window.addEventListener('mousedown', onMouseDown, false);
	}
	/*
	function generateTexture() {
		var canvas = document.createElement('canvas');
		canvas.width = 256;
		canvas.height = 256;
		var context = canvas.getContext('2d');
		var image = context.getImageData(0, 0, 256, 256);
		var x = 0, y = 0;
		for (var i = 0, j = 0, l = image.data.length; i < l; i += 4, j ++) {
			x = j % 256;
			y = x == 0 ? y + 1 : y;
			image.data[ i ] = 255;
			image.data[ i + 1 ] = 255;
			image.data[ i + 2 ] = 255;
			image.data[ i + 3 ] = Math.floor( x ^ y );
		}
		context.putImageData( image, 0, 0 );
		return canvas;
	}
	*/
	
	function onWindowResize(e) {
		containerWidth = window.innerWidth;
		containerHeight = window.innerHeight;

		camera.aspect = containerWidth / containerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(containerWidth, containerHeight);
	}

	function onMouseMove(e) {
		var mouse3D = new THREE.Vector3( ( event.clientX / containerWidth ) * 2 - 1,   //x
											-( event.clientY / containerHeight ) * 2 + 1,  //y
											0.5 );                                        //z
		mouse3D.unproject(camera);
		mouse3D.sub(camera.position);                
		mouse3D.normalize();
		var raycaster = new THREE.Raycaster(camera.position, mouse3D);
		var intersects = raycaster.intersectObjects(spheresArray);
		
		for( var i = 0; i < intersects.length; i++ ) {
			var intersection = intersects[ i ],
			obj = intersection.object;
			objName = obj.name;

			switch (objName) {
				case 'sphere-1':
					TweenMax.to(sphere1.material, 1, {opacity: 1});
				break;
				case 'sphere-2':
					TweenMax.to(sphere2.material, 1, {opacity: 1});
				break;

				default:
					TweenMax.to(sphere1.material, 1, {opacity: 0.5});
					TweenMax.to(sphere2.material, 1, {opacity: 0.5});
				break;
			}			

		}

	}

	function onMouseDown( event ) {
		var mouse3D = new THREE.Vector3( ( event.clientX / containerWidth ) * 2 - 1,   //x
											-( event.clientY / containerHeight ) * 2 + 1,  //y
											0.5 );                                        //z
		mouse3D.unproject(camera);
		mouse3D.sub(camera.position);                
		mouse3D.normalize();

		var raycaster = new THREE.Raycaster(camera.position, mouse3D);
		var intersects = raycaster.intersectObjects(spheresArray);



		for( var i = 0; i < intersects.length; i++ ) {
			var intersection = intersects[ i ],
			obj = intersection.object;
			objName = obj.name;

			//var obj1 = scene.getObjectByName( obj.name );

			//TweenMax.to(sphere.material, 2, {opacity: 1});
			//TweenMax.to(dae.position, 1, {z:6, ease:Expo.easeOut});


		}
	}


	THREE.Vector3.prototype.pickingRay = function ( camera ) {
		var tan = Math.tan( 0.5 * THREE.Math.degToRad( camera.fov ) ) / camera.zoom;

		this.x *= tan * camera.aspect;
		this.y *= tan; 
		this.z = - 1;

		return this.transformDirection( camera.matrixWorld );
	};

	
	function render() {
		requestAnimationFrame(render);
		camera.lookAt(scene.position);
		renderer.render(scene, camera);
	}


	// controls
	function controls() {
		var controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.minPolarAngle = Math.PI * 0.5;
		controls.maxPolarAngle = Math.PI * 0.5;
		controls.minDistance = 2;
		controls.maxDistance = 20;
	}


};