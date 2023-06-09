/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoibW9vbnlkb2cxMiIsImEiOiJjbGlvaGRsc24wZ2Z2M2hveGk3emQ5ZGR1In0.3c2SLMP2KM67aF8sguW-rA';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/moonydog12/cliohsc7o008n01r17fne4b4e',
  scrollZoom: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((location) => {
  const element = document.createElement('div');
  element.className = 'marker';

  // 新增 marker
  new mapboxgl.Marker({
    element,
    anchor: 'bottom',
  })
    .setLngLat(location.coordinates)
    .addTo(map);

  // 新增 popup
  new mapboxgl.Popup({ offset: 30 })
    .setLngLat(location.coordinates)
    .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
    .addTo(map);

  // 延伸 map 邊界含括目前景點
  bounds.extend(location.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
