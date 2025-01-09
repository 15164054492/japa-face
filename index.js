const map = L.map("map", {
  center: [34.3930264249573, 135.33945463702156],
  zoom: 15,
});

const baseLayers = {
  OpenStreetMap: L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }),

  空中写真: L.tileLayer(
    "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
    {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>',
    }
  ),
};
map.addLayer(baseLayers["OpenStreetMap"]); 

const layersControl = L.control
  .layers(baseLayers, [], { collapsed: false })
  .addTo(map);

const grades = [
  { value: 4800, color: "#ca0000", label: "4800人以上" },
  { value: 3200, color: "#ff0000", label: "3200人-4800人" },
  { value: 2400, color: "#ff6464", label: "82400人-3200人" },
  { value: 1600, color: "#f08519", label: "1600人-2400人" },
  { value: 800, color: "#f7af67", label: "800人-1600人" },
  { value: 200, color: "#f3f37c", label: "200-800人" },
  { value: 0, color: "#ffffff", label: "0-200人" },
];

const legend = L.control({ position: "topleft" });

const getColor = (value) => {
  const grade = grades.find((g) => value > g.value);
  return grade ? grade.color : "#ffffff";
};

fetch("./P20-12_27.json")
  .then((res) => res.json())
  .then((json) => {
    const landAreaLayer = L.geoJSON(json, {
      pointToLayer: function (feature, latlng) {
        return L.circle(latlng, {
          radius: 300,
          color: "black",
          fillColor: getColor(feature.properties["P20_005"]),
          fillOpacity: 0.5,
          weight: 1,
        });
      },
    })
      .bindPopup(
        (layer) => `行政区域コード：${layer.feature.properties["P20_001"] }<br/>名称：${layer.feature.properties["P20_002"] }<br/>住所：${layer.feature.properties["P20_003"] }<br/>施設の種類：${layer.feature.properties["P20_004"] }<br/>収容人数：${layer.feature.properties["P20_005"] }<br/>`
      )
      .addTo(map);

    layersControl.addOverlay(landAreaLayer, "避難施設");
  });

L.Control.DataDisplay = L.Control.extend({
  onAdd: function (map) {
    const div = L.DomUtil.create("div", "data-display");
    div.innerHTML = "<h4>収容人数</h4>";
    grades.forEach((grade) => {
      div.innerHTML +=
        `<i style="background: ${grade.color};"></i>` + grade.label + "<br>";
    });
    return div;
  },
});

const dataDisplayControl = new L.Control.DataDisplay({ position: "topleft" });
dataDisplayControl.addTo(map);
