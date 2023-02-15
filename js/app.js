// Crear un mapa con Leaflet
var map = L.map('map', { zoomControl: false }).setView([-10.166, -74.940], 6);
// Agregar una capa de teselas del mapa base
var satelite = L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}',{
  attribution: 'Google Satellite'
}).addTo(map);
///



// agregar erp
// icon
var marker_erp = new L.Icon({
  iconSize: [21, 21],
  iconAnchor: [9, 21],
  popupAnchor:  [1, -24],
  iconUrl: 'img/point.png'
});

// Show
var ign = L.geoJson(erp, {
  pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {icon: marker_erp});
  }
}).addTo(map)


var ign = L.geoJson(erp, {
  className: 'CODIGO',
  onEachFeature: function (feature,layer) {
      layer.bindTooltip(feature.properties.CODIGO ,{
       permanent: true,
       direction: 'top',
       className: 'ign',
      })
},
  pointToLayer: function (feature, latlng) {
    return new L.CircleMarker(latlng, {
        radius: 12,
        fillOpacity: 0.7,
        color: '#ff7f00', 
        weight: 1
      });
  },
}).addTo(map);
// zoom
L.control.zoom({
  position:'topright'
}).addTo(map);
// search bar
var searchControl = new L.esri.Controls.Geosearch({position:'topright'}).addTo(map);
// Crear un formulario para ingresar las coordenadas
var form = document.createElement('form');
var inputLat = document.createElement('input');
var inputLng = document.createElement('input');
var button = document.createElement('button');

inputLat.type = 'text';
inputLat.placeholder = 'Latitud';
inputLng.type = 'text';
inputLng.placeholder = 'Longitud';
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

form.style.position = 'relative';
form.style.top = '20px';
form.style.left = '20px';




map.getContainer().appendChild(form);


/*
var lat  = -11.0785
var lng =  -77.3211
*/
// Crear un grupo de capas para los marcadores y la línea base
var markers = L.layerGroup().addTo(map);
// Agregar evento al formulario para agregar marcadores al mapa
form.addEventListener('submit', function(e) {
  e.preventDefault();
  var lat = parseFloat(inputLat.value);
  var lng = parseFloat(inputLng.value);
  // Crear un marcador en las coordenadas ingresadas por el usuario
  var marker = L.marker([lat, lng]).addTo(markers);
  // Calcular el punto más cercano en el archivo geoJSON `erp`
  var point = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: [lng, lat]
    }
  };

  // Encontrar el punto más cercano en el archivo geoJSON
  var nearest = turf.nearestPoint([lng, lat], erp);

  // Calcular la distancia más corta entre el marcador y el punto más cercano
  var distance = turf.distance([lng, lat], nearest.geometry.coordinates);

  // Calcular la altura necesaria para transmitir señal de radio
  var height = 0.000022 * Math.pow(distance, 3) - 0.007834 * Math.pow(distance, 2) + 2.660074 * distance + 8.346236;

  // Crear un arreglo con las coordenadas de la línea
  var lineCoords = [
    [lat, lng],
    [nearest.geometry.coordinates[1], nearest.geometry.coordinates[0]]
  ];

  // Crear una línea a partir de las coordenadas
  var line = L.polyline(lineCoords, {color: 'red'}).addTo(markers);

  // Agregar evento al marcador para mostrar la información de distancia y altura en un popup
  marker.addEventListener('click', function() {
    var popupContent = 'Distancia más corta: ' + distance.toFixed(2) + ' Km<br>Tiempo de Lectura minima: ' + Math.floor(height/60) + ' Horas con ' + (height%60).toFixed(0) +' Minutos';
    
    L.popup()
      .setLatLng(marker.getLatLng())
      .setContent(popupContent)
      .openOn(map);
  });

  // Crear un control personalizado de cuadro de diálogo
  var customControl = L.control({
    position: 'topleft'
  });
  /*

  customControl.onAdd = function (map) {
    var container = L.DomUtil.create('div', 'custom-control');

    // Agregar contenido al cuadro de diálogo
    
    container.innerHTML = '<h2>Optimización</h2><p>Distancia más corta: ' + distance.toFixed(2) + ' Km<br>Tiempo de Lectura minima: ' + Math.floor(height/60) + ' Horas con ' + (height%60).toFixed(0) +' Minutos</p>';

    // Agregar evento para cerrar el cuadro de diálogo
    container.addEventListener('click', function() {
      container.style.display = 'none';
    });

    return container;
  };

  // Agregar el control personalizado al mapa
  customControl.addTo(map);
  */
});


// Coordenadas
L.control.mousePosition({
  position:'bottomright',
  show: false
}).addTo(map);

// Medicion
L.control.polylineMeasure({
  position:'topright'
}).addTo(map);

// user
map.pm.addControls({

  position: 'topright',
  drawCircle: false,
  drawRectangle: false,
  drawCircleMarker: false,
  cutPolygon: false,
  dragMode: false,
  editMode:false,
  oneBlock:true,
  rotateMode: false

});



