//Definimos objetos importantes de canvas.
var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');

//Crear objeto de la nava.
var nave = {
	x: 100,
	y: canvas.height-100,
	width: 50,
	height: 50,
	contador: 0
};

var textRespuesta = {
	contador: -1,
	titulo: '',
	subtitulo: ''
};

//Eventos del teclado.
var teclado = {}; //json vacio.

//Estado del juego.
var juego = {
	estado: 'iniciando' //Condición del juego.
};

var disparos = []; //Array para los disparos.
var enemigos = []; //Cantidad de enemigos (almacena).
var disparosEnemigos = [];


//Definir variables para las imágenes.
var fondo, imgNave, imgEnemigo, imgDisparo, imgDisparoEnemigo;
var imagenes = ['img/espacio.jpg', 'img/enemigo.png', 'img/laserEnemigo.png', 'img/nave.png', 'img/laserNave.png']; //Arreglo almacena todas las imáganes a cargar.
var preloader; //Precargado.

//Definición de funciones.
function loadMedia(){
	/*fondo = new Image();
	fondo.src = 'espacio.jpg';
	fondo.onload = function(){
		var intervalo = window.setInterval(frameLoop, 1000/55); //1000/55 es el tiempo en que se ejecuta cada frame.
	};*/

	preloader = new PreloadJS(); //Crea un objeto de la clase preloadJS que biene en el archvio cargado 'preloadjs-0.1.0.min.js'.
	preloader.onProgress = progresoCarga; //progresoCarga es una función.
	cargar();
};

function cargar(){
	//Iteramos entre cada uno de los elementos y lo cargamos.
	while(imagenes.length > 0){
		var imagen = imagenes.shift(); //Shitf lo que hace es sacar el último elemento del arreglo y lo retornar en la variable.
		preloader.loadFile(imagen); //El método loadFile() carga un archivo.
	}
};

function progresoCarga(){
	console.log(parseInt(preloader.progress * 100) + "%"); //Imprimimos en la consola el progreso de la carga.
	if(preloader.progress == 1){ //Verificamos que ya se cargarón todas las imágenes para iniciar el juego.
		var interval = window.setInterval(frameLoop, 1000/33);
		//Imagen de fondo (espacio).
		fondo = new Image();
		fondo.src = 'img/espacio.jpg';
		//Imagen nave.
		imgNave = new Image();
		imgNave.src = 'img/nave.png';
		//Láser nave.
		imgDisparo = new Image();
		imgDisparo.src = 'img/laserNave.png';
		//Imagen enemigo.
		imgEnemigo = new Image();
		imgEnemigo.src = 'img/enemigo.png';
		//Láser nave enemigo.
		imgDisparoEnemigo = new Image();
		imgDisparoEnemigo.src = 'img/laserEnemigo.png';
	}
};

//Dibujar Enemigos.
function dibujarEnemigos(){
	for(var i in enemigos){
		var enemigo = enemigos[i];
		ctx.save();
		//Los enemigos van a tener un estado.
		if(enemigo.estado == 'vivo') ctx.fillStyle = 'red';
		if (enemigo.estado == 'muerto') ctx.fillStyle = 'black';
		//ctx.fillRect(enemigo.x, enemigo.y, enemigo.width, enemigo.height);
		ctx.drawImage(imgEnemigo, enemigo.x, enemigo.y, enemigo.width, enemigo.height);
		ctx.restore();
	}
};

function dibujarFondo() { //Dibuja el fondo.
	ctx.drawImage(fondo, 0, 0);
};

function dibujarNave(){
	ctx.save(); //Guardamos información actual del contexto.
	//ctx.fillStyle = 'white'; //Color de fondo de la imagen.
	//ctx.fillRect(nave.x, nave.y, nave.width, nave.height); //Dibujamos el rectángulo que simboliza la nave.
	ctx.drawImage(imgNave, nave.x, nave.y, nave.width, nave.height); //Dibujamos naves.
	ctx.restore();
}

function agregarEventoTeclado() {
	//Con esto conseguimos que mientras se tenga presionada la tecla el elemento se movera.
	agregarEvento(document, 'keydown', function(e){
		//Ponemos en true la tecla presionada.
		teclado[e.keyCode] = true; //keyCode identifica el código de cada una de las teclas.

		//console.log(e.keyCode); Muestra el código de la tecla presionada.
	});

	agregarEvento(document, 'keyup', function(e){
		//Ponemos en false la tecla que dejo de ser presionada.
		teclado[e.keyCode] = false; //KeyCode identifica el código de cada una de las teclas.
	});

	//Identifacamos que navegador se esta usuando.
	function agregarEvento(elemento, nombreEvento, funcion){
		if(elemento.addEventListener){
			//Para Opera, Mizilla, Chrome, Safari.
			elemento.addEventListener(nombreEvento, funcion, false);
		}
		else if(elemento.attachEvent){
			//Para Internet Explorer.
			elemento.attachEvent(nombreEvento, funcion);
		}
	}
};

function moverNave(){
	//Movimiento a la izquierda.
	if(teclado[37]){ //Al objeto teclado se le asigna el keyCode de la tecla a presionar (flecha izquierda).
		nave.x -=10; //Mueves la nave a la izquierda.
		if(nave.x < 0) nave.x = 0; //Se crea un tope a la izquierda para que no se salga del canvas.
	}

	//Movimiento a la derecha.
	if(teclado[39]){ //Al objeto teclado se le asigna el keyCode de la tecla a presionar (flecha derecha).
		var limite = canvas.width - nave.width;
		nave.x +=10; //Mueves la nave a la derecha. El valor numérico es la velocidad en que se va a desplazar el elemento.
		if(nave.x > limite) nave.x = limite; //Se crea un tope a la derecha para que no se salga del canvas.
	}

	//Mover disparos.
	if(teclado[32]){
		//Por cada vez que se presiona la tecla se genera un disparo.
		if(!teclado.fire){			
			fire(); //Crea el correspondiente disparo y lo agrega.
			teclado.fire = true
		}
	}
	else{
		teclado.fire = false;
	}

	if(nave.estado == 'hit'){
		nave.contador++;
		 if(nave.contador >= 20){ //Tiempo en que va a tardar en aparecer el mensaje despues del contacto del disparo con la nave.
			nave.contador = 0;
			//NOTA: Los contadores controlan el tiempo de acción de los elementos.
			nave.estado = 'muerto';
			juego.estado = 'perdido';
			textRespuesta.titulo = 'Game Over';
			textRespuesta.subtitulo = 'Presiona la tecla R para continuar'
			textRespuesta.contador = 0;
		}
	}
};

function moverDisparosEnemigos(){
	for(var i in disparosEnemigos){
		var disparo = disparosEnemigos[i];
		disparo.y += 3; //Velocidad a la cual se va a desplazar el disparo.
	}

	disparosEnemigos = disparosEnemigos.filter(function (disparo){
		return disparo.y < canvas.height; //Conserva el disparo o lo elimina dependiendo de su posición en el cambas con respecto al ancho de este.
	});
};

function dibujarDisparosEnemigos(){
	for(var i in disparosEnemigos){
		var disparo = disparosEnemigos[i];
		ctx.save();
		ctx.drawImage(imgDisparoEnemigo, disparo.x, disparo.y, disparo.width, disparo.height);
		//ctx.fillStyle = 'yellow';
		//ctx.fillRect(disparo.x, disparo.y, disparo.width, disparo.height);
		ctx.restore();		
	}
};

function actualizaEnemigos() {
	function agregarDisparosEnemigos(enemigo){
		return {
			x: enemigo.x,
			y: enemigo.y,
			width: 10,
			height: 33,
			contador: 0
		}
	};

	//Si el juego esta iniciado se agregan los enemigos.
	if(juego.estado == 'iniciando'){
		//Solo agregamos 10 enemigos.
		for(var i = 0; i < 10; i++ ){
			enemigos.push({
				x: 10 + (i*50), //Los enemigos se agregan sobre la coordenada x.
				y: 10,
				height: 40,
				width: 40,
				estado: 'vivo',
				contador: 0
			});			
		}
		juego.estado = 'jugando';
	}

	//Mover Enemigo.
	for(var i in enemigos){
		var enemigo = enemigos[i];
		if(!enemigo) continue; //Si por alguna razón no está el enemigo salta a la sigueinte función (en caso de que ya se haya hecho contacto bala-enemigo).
		if(enemigo && enemigo.estado == 'vivo'){
			enemigo.contador++;
			//Hacemos que el enemigo vaya de un lado al otro.
			enemigo.x += Math.sin(enemigo.contador * Math.PI / 90) * 5;

			//De esta forma se pueden generar bugs (Tal vez no dispare algún enemigo).
			if(aleatorio(0, enemigos.length * 10) == 4){ //4 para que no disparen tanto (entre menos enemigos más disparos se van a hacer).
				disparosEnemigos.push(agregarDisparosEnemigos(enemigo));
			}
		}
		//Hace que desaparescan los enemigos pero no instantaneamente.
		if(enemigo && enemigo.estado == 'hit'){
			enemigo.contador++;
			if(enemigo.contador >= 20){
				enemigo.estado = 'muerto';
				enemigo.contador = 0;
			}
		}
	}

	enemigos = enemigos.filter(function (enemigo) {
		if(enemigo && enemigo.estado != 'muerto') return true; //Conserva enemigo.
		return false; //Elimina enemigo.
	});
};

//Función encargada de mover los disparos.
function moverDisparos(){
	for(var i in disparos){
		var disparo = disparos[i];
		disparo.y -= 2; //Movemos los disparos hacia los enemigos (hacia arriba).
	}

	//Esta función elimina los disparos que llegan al tope del canvas.
	disparos = disparos.filter(function(disparo){
		return disparo.y > 0;
	});
};

//Función encargada de agregar los disparos.
function fire(){
	disparos.push({
		//Definimos desde que posición van a salir los disparos con respecto a la nave.
		x: nave.x + 20,
		y: nave.y - 10,
		//Tamaño de los disparos.
		width: 10,
		height: 30
	});
};

function dibujarDisparos(){
	ctx.save();
	ctx.fillStyle = 'white';
	for(var i in disparos){ //Dibujamos cada uno de los disparos.
		var disparo = disparos[i];
		ctx.drawImage(imgDisparo, disparo.x, disparo.y, disparo.width, disparo.height);
		//ctx.fillRect(disparo.x, disparo.y, disparo.width, disparo.height);
	}
	ctx.restore();
};

function dibujaTexto(){
	if(textRespuesta.contador == -1) return; //El jugador sigue jugando (no tiene que mandar texto alguno).
	var alpha = textRespuesta.contador/50.0; //Crea una ilución de como aparece el texto de trasparete a solido.
	if(alpha > 1){ //Cuando el enemigo gana eliminamos todos estos para mostrar el mensaje.
		for(var i in enemigos){
			delete enemigos[i];
		}
	}

	ctx.save();
	ctx.globalAlpha = alpha; //Trasnparecia del canvas.
	if(juego.estado == 'perdido'){
		ctx.fillStyle = 'white';
		ctx.font = 'Bold 40pt Arial'; //Negritas, Tamaño Letra, Tipografía.
		ctx.fillText(textRespuesta.titulo, 140, 200); //Texto a mostrar, coordenada en X, coordenada en Y.
		ctx.font = '14pt Arial';
		ctx.fillText(textRespuesta.subtitulo, 190, 250);
	}
	if(juego.estado == 'victoria'){
		ctx.fillStyle = 'white';
		ctx.font = 'Bold 40pt Arial',
		ctx.fillText(textRespuesta.titulo, 140, 200);
		ctx.font = '14pt Arial';
		ctx.fillText(textRespuesta.subtitulo, 190, 250);
	}
	ctx.restore();
};

function actualizarEstadoJuego(){
	if(juego.estado == 'jugando' && enemigos.length == 0){
		juego.estado = 'victoria';
		textRespuesta.titulo = 'Derrotaste a los enemigos';
		textRespuesta.subtitulo = 'Presiona la tecla R para reiniciar';
		textRespuesta.contador = 0;
	}

	if(textRespuesta.contador >= 0){ //Cuida el valor de alpha.
		textRespuesta.contador++;
	}

	//Reinicia el Juego.
	if((juego.estado == 'perdido' || juego.estado == 'victoria') && teclado[82]){
		juego.estado = 'iniciando';
		nave.estado = 'vivo'; //Para el caso de que haya perdido la nave.
		textRespuesta.contador = -1; //Regresamos el canal alfa a trasparente.
	}
};

function hit(a, b) {
	//Devuelve un valor booleano dependiendo de si hay colisión.
	var hit = false; //Valor por defecto (No hay colisión)
	
	if(b.x + b.width >= a.x && b.x < a.x + a.width){ //Colisión horizontal.
		if(b.y + b.height >= a.y && b.y < a.y + a.height){ //Colisión en vertical.
			//NOTA: Es indispensable verificar que la colisión está en vertical y horizontal (ambas).
			hit = true;
		}
	}
	if(b.x <= a.x && b.x + b.width >= a.x + a.width){
		if (b.y <= a.y && b.y + b.height >= a.y + a.height) {
			hit = true;
		}
	}
	if(a.x <= b.x && a.x + a.width >= b.x + b.width){
		if (a.y <= b.y && a.y + a.height >= b.y + b.height) {
			hit = true;
		}
	}
	return hit;
};

function verificarContacto() {
	//Contacto de disparo nave a enemigo.
	for(var i in disparos){
		var disparo = disparos[i];
		for(var j in enemigos){
			var enemigo = enemigos[j];
			if(hit(disparo, enemigo)){
				enemigo.estado = 'hit';
				enemigo.contador = 0;
				//console.log('contacto');
			}
		}
	}

	//Contacto de disparo enemigo a nave.
	if(nave.estado == 'hit' || nave.estado == 'muerto') return;
	for(var i in disparosEnemigos){
		var disparo = disparosEnemigos[i];
		if(hit(disparo, nave)){
			nave.estado = 'hit';
			//console.log('colision');
		}
	}
};

function aleatorio(inferior, superior){
	var posibilidades = superior - inferior;
	var a = Math.random() * posibilidades;
	a = Math.floor(a);
	return parseInt(inferior + a);
};

function frameLoop(){ //Actualiza todas las posiciones de los jugadores y dibujara cada uno de los elementos de juego para el movimiento.
	actualizarEstadoJuego();
	moverNave(); //Se coloca dentro de esta función para actualizar en todo momento la posición  de la nave.
	actualizaEnemigos();
	moverDisparos();
	moverDisparosEnemigos();
	dibujarFondo();
	verificarContacto();
	dibujarEnemigos();
	dibujarDisparosEnemigos();
	dibujarDisparos();
	dibujaTexto();
	dibujarNave();
};

window.addEventListener('load', init);
function init(){
	//Ejecución de funciones.
	loadMedia(); //Función encargade de cargar las imágenes.
	agregarEventoTeclado();
};