// Crear un mapa con Leaflet
var map = L.map('map', { zoomControl: false }).setView([-10.166, -74.940], 6);

// Agregar una capa de teselas del mapa base
var satelite = L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}',{
  attribution: 'Google Satellite'
}).addTo(map);

// ERP
var ign = L.geoJson(erp, {
  className: 'CODIGO',
  onEachFeature: function (feature, layer) {
    layer.bindTooltip(feature.properties.CODIGO, {
      permanent: true,
      direction: 'top',
      className: 'ign',
    })
  },
  pointToLayer: function (feature, latlng) {
    return new L.CircleMarker(latlng, {
      radius: 7,
      fillOpacity: 0.7,
      color: '#ff7f00', 
    });
  },
}).addTo(map);

// Zoom
L.control.zoom({
  position:'topright'
}).addTo(map);

// Search bar
var searchControl = new L.esri.Controls.Geosearch({position:'topright'}).addTo(map);

// Crear un formulario para ingresar las coordenadas
var form = document.createElement('form');
var inputLat = document.createElement('input');
var inputLng = document.createElement('input');
var button = document.createElement('button');

inputLat.type = 'number';
inputLat.placeholder = 'Latitud';
inputLat.step = 'any';
inputLat.min = -90;
inputLat.max = 90;
inputLat.required = true;

inputLng.type = 'number';
inputLng.placeholder = 'Longitud';
inputLng.step = 'any';
inputLng.min = -180;
inputLng.max = 180;
inputLng.required = true;

button.type = 'submit';
button.textContent = 'Agregar Marcador';
button.style.backgroundColor = 'blue';
button.style.borderRadius = '5px';
button.style.color = 'white';
button.style.padding = '10px 20px';
button.style.border = 'none';

form.appendChild(inputLat);
form.appendChild(inputLng);
form.appendChild(button);

form.style.zIndex = 1000;
form.style.position = 'absolute';
form.style.top = '10px';
form.style.left = '10px';

// Crear un div para el fondo del formulario
var divBackground = document.createElement('div');
divBackground.style.position = 'absolute';
divBackground.style.width = '300px';
divBackground.style.height = '70px';
divBackground.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
divBackground.style.zIndex = 999;
divBackground.style.borderRadius = '5px';

// Agregar el div de fondo y el formulario al contenedor del mapa
map.getContainer().appendChild(divBackground);
divBackground.appendChild(form);

divBackground.addEventListener('touchstart', function(event) {
  event.stopPropagation();
});

// Notificaciones
var modernNotifications = L.control.notifications({ className: 'modern' }).addTo(map);

// Bienvenida
modernNotifications.success('Bienvenido!!! 💙', 'Hola! ¿Quieres colaborar con nuestro proyecto? Simplemente envíanos la ubicación faltante (latitud, longitud, código) por WhatsApp.', {
  timeout: 12000,
  closable: false,
  dismissable: false,
});

// Crear un grupo de capas para los marcadores y la línea base
var markers = L.layerGroup().addTo(map);

// Agregar evento al formulario para agregar marcadores al mapa
form.addEventListener('submit', function(e) {
  e.preventDefault();
  var lat = parseFloat(inputLat.value);
  var lng = parseFloat(inputLng.value);

  // Verificar si las coordenadas son válidas
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    modernNotifications.error('Error', 'Por favor, ingrese coordenadas válidas.');
    return;
  }

  // Crear un marcador en las coordenadas ingresadas por el usuario
  var marker = L.marker([lat, lng]).addTo(markers);

  // Calcular el punto más cercano en el archivo geoJSON `erp`
  var point = turf.point([lng, lat]);

  // Encontrar el punto más cercano en el archivo geoJSON
  var nearest = turf.nearestPoint(point, turf.featureCollection(erp.features));

  // Calcular la distancia más corta entre el marcador y el punto más cercano
  var distance = turf.distance(point, nearest);

  // Calcular la altura necesaria para transmitir señal de radio
  var height = 0.000022 * Math.pow(distance, 3) - 0.007834 * Math.pow(distance, 2) + 2.660074 * distance + 8.346236;

  // Crear un arreglo con las coordenadas de la línea
  var lineCoords = [
    [lat, lng],
    [nearest.geometry.coordinates[1], nearest.geometry.coordinates[0]]
  ];

  // Crear una línea a partir de las coordenadas
  var line = L.polyline(lineCoords, {color: 'red'}).addTo(markers);

  // Centrar el mapa en la línea
  map.fitBounds(line.getBounds());

  // Agregar evento al marcador para mostrar la información de distancia y altura en un popup
  marker.bindPopup('Distancia más corta: ' + distance.toFixed(2) + ' Km<br>Tiempo de Lectura mínima: ' + Math.floor(height/60) + ' Horas con ' + (height%60).toFixed(0) +' Minutos').openPopup();

  // Mostrar notificación con los resultados
  modernNotifications.success('Cálculo completado', 'Distancia: ' + distance.toFixed(2) + ' Km<br>Tiempo de lectura: ' + Math.floor(height/60) + 'h ' + (height%60).toFixed(0) + 'm');
});

// Coordenadas
L.control.mousePosition({
  position:'bottomright',
  separator: ' | ',
  emptyString: 'Coordenadas no disponibles',
  lngFirst: false,
  numDigits: 5,
  lngFormatter: function(num) {
    return L.Util.formatNum(num, 5) + '° E';
  },
  latFormatter: function(num) {
    return L.Util.formatNum(num, 5) + '° N';
  }
}).addTo(map);

// Medición
L.control.polylineMeasure({
  position:'topright',
  unit: 'metres',
  showBearings: true,
  clearMeasurementsOnStop: false,
  showClearControl: true,
  showUnitControl: true
}).addTo(map);

// Controles de dibujo
map.pm.addControls({
  position: 'topright',
  drawMarker: true,
  drawPolyline: true,
  drawPolygon: true,
  editMode: true,
  dragMode: true,
  cutPolygon: false,
  removalMode: true,
});

// Botón de WhatsApp
var bar = L.controlCredits({
  image: "img/whatsapp.svg",
  link: "https://wa.me/51946648819?text=Hola%2C+esta+estacion+activa+falta+(latitud, longitud, código)",
  text: "<strong>Envíame la Estación para agregar</strong>",
}).addTo(map);
