function initPage(){

	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
		var container, stats;
		var camera, scene, renderer, objects;
		var particleLight, pointLight;
		var dae;
		var clock = new THREE.Clock();
		var mixer;

		// Collada model
		var loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		loader.load( './assets/models/model.dae', 
			function ( collada ) {
				dae = collada.scene;
				dae.traverse( function ( child ) {
					if ( child instanceof THREE.SkinnedMesh ) {
						var animation = new THREE.Animation( child, child.geometry.animation );
						animation.play();
					}
				});

			dae.scale.x = dae.scale.y = dae.scale.z = 1;
			dae.position.x = -0.3;
			dae.position.y = -5.5;
			dae.rotation.y = -Math.PI / 2.5;
			dae.updateMatrix();

			init();
			
			render();
			controls();
		},

		// Function called when download progresses
		function ( xhr ) {
			//console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
			$('#text-loader').text(Math.round((xhr.loaded / xhr.total * 100)) + '%')
		}
	);


	function init() {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 2000 );
		camera.position.set( 2, 4, 5 );
		scene = new THREE.Scene();
		
		// Add the COLLADA
		scene.add( dae );
		// Lights
		scene.add( new THREE.AmbientLight(0xCCCCCC) );
		pointLight = new THREE.PointLight(0xff5500, 2.5, 50);
		pointLight.position.set(10, 3, 0);
		scene.add(pointLight);

		pointLight = new THREE.PointLight(0xff3300, 1, 70);
		pointLight.position.set(-10, -3, 0);
		scene.add(pointLight);
		// Renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild( renderer.domElement );
		// Events
		window.addEventListener( 'resize', onWindowResize, false );
	}
	
	function onWindowResize(e) {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}
	
	function render() {
		requestAnimationFrame(render);
		camera.lookAt(scene.position);
		renderer.render(scene, camera);
	}


	// controls
	function controls() {
		var controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.maxPolarAngle = Math.PI * 0.5;
		controls.minDistance = 1;
		controls.maxDistance = 75;
	}


};