THREE.OrbitControls = function ( object, domElement ) {
	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	this.enabled = true;
	this.target = new THREE.Vector3();
	this.minDistance = 0;
	this.maxDistance = Infinity;
	this.minZoom = 0;
	this.maxZoom = Infinity;
	this.minPolarAngle = 0;
	this.maxPolarAngle = Math.PI;
	this.minAzimuthAngle = - Infinity;
	this.maxAzimuthAngle = Infinity;
	this.enableDamping = false;
	this.dampingFactor = 0.05;
	this.enableZoom = true;
	this.zoomSpeed = 1.0;
	this.enableRotate = true;
	this.rotateSpeed = 1.0;
	this.enablePan = true;
	this.panSpeed = 1.0;
	this.screenSpacePanning = false;
	this.keyPanSpeed = 7.0;
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0;
	this.enableKeys = true;
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
	this.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
	this.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

	var scope = this;
	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };
	var STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_PAN: 4, TOUCH_DOLLY_PAN: 5, TOUCH_DOLLY_ROTATE: 6 };
	var state = STATE.NONE;
	var EPS = 0.000001;

	var spherical = new THREE.Spherical();
	var sphericalDelta = new THREE.Spherical();
	var scale = 1;
	var panOffset = new THREE.Vector3();
	var zoomChanged = false;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	function getAutoRotationAngle() {
		return ( scope.autoRotateSpeed / 60 ) * Math.PI / 180;
	}

	function getZoomScale() {
		return Math.pow( 0.95, scope.zoomSpeed );
	}

	function rotateLeft( angle ) {
		sphericalDelta.theta -= angle;
	}

	function rotateUp( angle ) {
		sphericalDelta.phi -= angle;
	}

	var panLeft = function () {
		var v = new THREE.Vector3();
		return function panLeft( distance, objectMatrix ) {
			v.setFromMatrixColumn( objectMatrix, 0 );
			v.multiplyScalar( - distance );
			panOffset.add( v );
		};
	}();

	var panUp = function () {
		var v = new THREE.Vector3();
		return function panUp( distance, objectMatrix ) {
			if ( scope.screenSpacePanning === true ) {
				v.setFromMatrixColumn( objectMatrix, 1 );
			} else {
				v.setFromMatrixColumn( objectMatrix, 0 );
				v.crossVectors( scope.object.up, v );
			}
			v.multiplyScalar( distance );
			panOffset.add( v );
		};
	}();

	var pan = function () {
		var offset = new THREE.Vector3();
		return function pan( deltaX, deltaY ) {
			var element = scope.domElement;
			if ( scope.object.isPerspectiveCamera ) {
				var position = scope.object.position;
				offset.copy( position ).sub( scope.target );
				var targetDistance = offset.length();
				targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );
				panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
				panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );
			} else if ( scope.object.isOrthographicCamera ) {
				panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix );
				panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );
			}
		};
	}();

	this.update = function () {
		var position = scope.object.position;
		var offset = new THREE.Vector3().copy( position ).sub( scope.target );
		spherical.setFromVector3( offset );

		if ( scope.autoRotate && state === STATE.NONE ) {
			rotateLeft( getAutoRotationAngle() );
		}

		if ( scope.enableDamping ) {
			spherical.theta += sphericalDelta.theta * scope.dampingFactor;
			spherical.phi += sphericalDelta.phi * scope.dampingFactor;
		} else {
			spherical.theta += sphericalDelta.theta;
			spherical.phi += sphericalDelta.phi;
		}

		spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );
		spherical.makeSafe();

		spherical.radius *= scale;
		spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );

		if ( scope.enableDamping === true ) {
			scope.target.addScaledVector( panOffset, scope.dampingFactor );
		} else {
			scope.target.add( panOffset );
		}

		offset.setFromSpherical( spherical );

		position.copy( scope.target ).add( offset );

		scope.object.lookAt( scope.target );

		if ( scope.enableDamping === true ) {
			sphericalDelta.theta *= ( 1 - scope.dampingFactor );
			sphericalDelta.phi *= ( 1 - scope.dampingFactor );
			panOffset.multiplyScalar( 1 - scope.dampingFactor );
		} else {
			sphericalDelta.set( 0, 0, 0 );
			panOffset.set( 0, 0, 0 );
		}

		scale = 1;

		if ( zoomChanged || Math.abs( sphericalDelta.theta ) > EPS || Math.abs( sphericalDelta.phi ) > EPS || panOffset.lengthSq() > EPS ) {
			scope.dispatchEvent( changeEvent );
			zoomChanged = false;
			return true;
		}
		return false;
	};

	function onPointerDown( event ) {
		if ( scope.enabled === false ) return;
		switch ( event.pointerType ) {
			case 'mouse':
			case 'pen':
				onMouseDown( event );
				break;
		}
	}

	function onMouseDown( event ) {
		if ( scope.enabled === false ) return;
		event.preventDefault();
		switch ( event.button ) {
			case 0:
				if ( scope.enableRotate === false ) return;
				handleMouseDownRotate( event );
				state = STATE.ROTATE;
				break;
		}
		if ( state !== STATE.NONE ) {
			scope.domElement.ownerDocument.addEventListener( 'mousemove', onMouseMove, false );
			scope.domElement.ownerDocument.addEventListener( 'mouseup', onMouseUp, false );
			scope.dispatchEvent( startEvent );
		}
	}

	function handleMouseDownRotate( event ) {
		rotateStart.set( event.clientX, event.clientY );
	}

	function onMouseMove( event ) {
		if ( scope.enabled === false ) return;
		event.preventDefault();
		if ( state === STATE.ROTATE ) {
			if ( scope.enableRotate === false ) return;
			handleMouseMoveRotate( event );
		}
	}

	function handleMouseMoveRotate( event ) {
		rotateEnd.set( event.clientX, event.clientY );
		rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );
		var element = scope.domElement;
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight );
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );
		rotateStart.copy( rotateEnd );
		scope.update();
	}

	function onMouseUp() {
		if ( scope.enabled === false ) return;
		scope.domElement.ownerDocument.removeEventListener( 'mousemove', onMouseMove, false );
		scope.domElement.ownerDocument.removeEventListener( 'mouseup', onMouseUp, false );
		scope.dispatchEvent( endEvent );
		state = STATE.NONE;
	}

	function onTouchStart( event ) {
		if ( scope.enabled === false ) return;
		switch ( event.touches.length ) {
			case 1:
				if ( scope.enableRotate === false ) return;
				handleTouchStartRotate( event );
				state = STATE.TOUCH_ROTATE;
				break;
			case 2:
				handleTouchStartDollyPan( event );
				state = STATE.TOUCH_DOLLY_PAN;
				break;
		}
		if ( state !== STATE.NONE ) {
			scope.dispatchEvent( startEvent );
		}
	}

	function handleTouchStartRotate( event ) {
		rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
	}

	function handleTouchStartDollyPan( event ) {
		if ( scope.enableZoom ) {
			var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
			var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
			var distance = Math.sqrt( dx * dx + dy * dy );
			dollyStart.set( 0, distance );
		}
		if ( scope.enablePan ) {
			var x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
			var y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );
			panStart.set( x, y );
		}
	}

	function onTouchMove( event ) {
		if ( scope.enabled === false ) return;
		event.preventDefault();
		event.stopPropagation();
		switch ( event.touches.length ) {
			case 1:
				if ( scope.enableRotate === false ) return;
				if ( state !== STATE.TOUCH_ROTATE ) return;
				handleTouchMoveRotate( event );
				break;
			case 2:
				if ( state !== STATE.TOUCH_DOLLY_PAN ) return;
				handleTouchMoveDollyPan( event );
				break;
		}
	}

	function handleTouchMoveRotate( event ) {
		rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );
		var element = scope.domElement;
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight );
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );
		rotateStart.copy( rotateEnd );
		scope.update();
	}

	function handleTouchMoveDollyPan( event ) {
		if ( scope.enableZoom ) {
			var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
			var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
			var distance = Math.sqrt( dx * dx + dy * dy );
			dollyEnd.set( 0, distance );
			dollyDelta.set( 0, Math.pow( dollyEnd.y / dollyStart.y, scope.zoomSpeed ) );
			scale *= dollyDelta.y;
			dollyStart.copy( dollyEnd );
		}
		if ( scope.enablePan ) {
			var x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
			var y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );
			panEnd.set( x, y );
			panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );
			pan( panDelta.x, panDelta.y );
			panStart.copy( panEnd );
		}
		scope.update();
	}

	function onTouchEnd() {
		if ( scope.enabled === false ) return;
		scope.dispatchEvent( endEvent );
		state = STATE.NONE;
	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'touchstart', onTouchStart, { passive: false } );
	this.domElement.addEventListener( 'touchend', onTouchEnd, false );
	this.domElement.addEventListener( 'touchmove', onTouchMove, { passive: false } );

	this.update();
};
THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

