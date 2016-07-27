
var MapView = BaseView.extend({
    el: '#main',
    template: $("#mapview_templ").html(),
    initialize: function (params) {
        this.url = params.url;
        this.photo = params.photo;
        BaseView.prototype.initialize.call(this);
    },
    render: function(){
        BaseView.prototype.render.call(this);
        
        this.map = L.map(
            'map', this.settings
        ).setView([0, 0],2);
        
        L.tileLayer(
            'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
        ).addTo(this.map);
        
        d3.json(this.url, this.load_layer.bind(this));
    },
    photo_selected: function(d) {
        var photo;
        if (d.src) {
            photo = d;
        } else {
            photo = this.photos[d];
        }
        $('#gallery-photo').attr('src',photo.src);
        this.map.setView([photo.lat, photo.lng]);
    },
    load_layer: function(d) {
        var map = this.map,
            photos = this.photos = {},
    	    display_layer = this.display_layer,
            default_style = {
                color: 'red',
                fillColor: 'blue',
                radius: 10,
                weight: 2,
                fillOpacity: 0.5,
            },
            self = this;

    	try {
            map.removeLayer(display_layer);
        } catch (e) {  }
		display_layer = L.layerGroup();

		d["result"].forEach(function(dd) {
            photos[dd.id] = dd;
			var mk = L.circleMarker([dd.lat, dd.lng], default_style)
                .addTo(display_layer);
			
            var self = this,
                img_src = dd.preview.images[0].resolutions[1].url
                label = '<a target="_blank" href="https://www.reddit.com' + dd.permalink + '"><h4>' + dd.title + '</h4></a>' + 
                    '<a target="_blank" href="' + dd.url + '"><img src="' + img_src + '" class="map_thumb"></img></a>';

            mk.bindPopup(
                    label, {
                        offset: L.point(0,-10),
                        className: 'custom-popup'
                    }
                )
				.on('mouseover', function show_tooltip () { this.openPopup(); })
				.on('click', function map_click (e) {
                    try {
                        self.last_marker.setStyle(default_style)
                    } catch (e) {}
                    e.target.setStyle({
                        color: 'orange',
                        fillColor: 'green',
                        radius: 15,
                        weight: 2,
                        fillOpacity: 0.5
                    });
                    self.last_marker = e.target;
				})
		})

		display_layer.addTo(map);
        this.display_layer = display_layer;
    }
});
