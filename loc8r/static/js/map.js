
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
        ).setView([33, -112],4);
        
        L.tileLayer(
            'https://otile1-s.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png'
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
		display_layer = L.markerClusterGroup();

		d["result"].forEach(function(dd) {
            photos[dd.id] = dd;
			var mk = L.circleMarker([dd.lat, dd.lng], default_style)
                .addTo(display_layer);
			
            var self = this,
                label = '<img src="' + dd.src + '" class="map_thumb"></img>';

            mk.bindPopup(
                    label, {
                        offset: L.point(0,-10),
                        className: 'custom-popup'
                    }
                )
				.on('mouseover', function show_tooltip () { this.openPopup(); })
				.on('mouseout', function hide_tooltip () { this.closePopup(); })
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
					router.navigate('photo/' + dd.id, true);
				})
		})

		display_layer.addTo(map);
        this.display_layer = display_layer;

        if (this.photo) {
            this.photo_selected(this.photo);
        } else {
            this.photo_selected(d.results[0])
        }
    }
});
