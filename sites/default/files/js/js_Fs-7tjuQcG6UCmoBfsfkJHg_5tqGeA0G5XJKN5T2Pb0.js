/**
 * @file
 * Defines the behavior of the Simple hierarchical select module.
 */

(function ($, Drupal, drupalSettings) {

  'use strict';

  /**
   * @todo: add description
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches the SHS rendering functionality to matching elements.
   */
  Drupal.behaviors.shs = {
    attach: function (context) {
      var settingsDefault = {
        display: {
          animationSpeed: 400,
          labelsOnEveryLevel: false
        },
        labels: []
      };

      $(context).find('select.shs-enabled:not([disabled])').not('.shs-processed').addClass('shs-processed').each(function () {
        var field = this;
        var field_name = $(field).attr('data-shs-selector');
        if (!drupalSettings.hasOwnProperty('shs') || !drupalSettings.shs.hasOwnProperty(field_name)) {
          return;
        }

        var config = $.extend({}, settingsDefault, drupalSettings.shs[field_name], {
          fieldName: field_name
        });
        if (drupalSettings.shs[field_name].hasOwnProperty('display')) {
          config.display = $.extend(true, {}, settingsDefault.display, drupalSettings.shs[field_name].display);
        }
        // Initialize model and view classes for the field.
        Drupal.behaviors.shs.initClasses(config.fieldName, config.classes);

        if (!Drupal.shs.classes[config.fieldName].hasOwnProperty('models')) {
          return;
        }

        // Initialize application model.
        var app_model = new Drupal.shs.classes[config.fieldName].models.app({
          config: config
        });

        // Initialize application view.
        var app_view = new Drupal.shs.classes[config.fieldName].views.app({
          el: field,
          model: app_model
        });
        app_view.render();

        // Broadcast model changes to other modules.
//        widget_model.on('change:items', function (model) {
//          $(document).trigger('shsWidgetItemsChange');
//        });
      });
    },
    /**
     * Initialize model and widget classes.
     *
     * Using the class storage instead of directly calling (i.e.)
     * <code>new Drupal.shs.WidgetView()</code> allows other modules to
     * override every part of the widget generation.
     *
     * @see hook_shs_class_definitions_alter()
     * @see hook_shs_FIELDNAME_class_definitions_alter()
     *
     * @param {string} fieldName
     *   Name of field to initialize the classes for.
     * @param {object} definitions
     *   List of class names.
     */
    initClasses: function (fieldName, definitions) {
      Drupal.shs.classes[fieldName] = Drupal.shs.classes[fieldName] || {
        models: {},
        views: {}
      };
      $.each(definitions.models, function (modelKey, modelClass) {
        Drupal.shs.classes[fieldName].models[modelKey] = Drupal.shs.getClass(modelClass);
      });
      $.each(definitions.views, function (viewKey, viewClass) {
        Drupal.shs.classes[fieldName].views[viewKey] = Drupal.shs.getClass(viewClass);
      });
    }
  };

  /**
   * SHS methods of Backbone objects.
   *
   * @namespace
   */
  Drupal.shs = {

    /**
     * A hash of model and view classes for each field.
     *
     * @type {object}
     */
    classes: {},

    /**
     * Get view/model class from name. Allows overriding every class within shs.
     *
     * @param {string} classname
     *   Name of class to load.
     * @returns {object}
     *   Instantiable class.
     */
    getClass: function (classname) {
      var parts = classname.split('.');

      var fn = (window || this);
      for (var i = 0, len = parts.length; i < len; i++) {
        fn = fn[parts[i]];
      }

      if (typeof fn !== 'function') {
        throw new Error('Class/function not found: [' + classname + ']');
      }

      return fn;
    }

  };

}(jQuery, Drupal, drupalSettings));
;
/**
 * @file
 *   Javascript for the geolocation module.
 */

/**
 * @param {Object} drupalSettings.geolocation
 * @param {String} drupalSettings.geolocation.google_map_url
 */

/**
 * @name GoogleMapSettings
 * @property {String} info_auto_display
 * @property {String} marker_icon_path
 * @property {String} height
 * @property {String} width
 * @property {Number} zoom
 * @property {Number} maxZoom
 * @property {Number} minZoom
 * @property {String} type
 * @property {Boolean} scrollwheel
 * @property {Boolean} preferScrollingToZooming
 * @property {String} gestureHandling
 * @property {Boolean} panControl
 * @property {Boolean} mapTypeControl
 * @property {Boolean} scaleControl
 * @property {Boolean} streetViewControl
 * @property {Boolean} overviewMapControl
 * @property {Boolean} zoomControl
 * @property {Boolean} rotateControl
 * @property {Boolean} fullscreenControl
 * @property {Object} zoomControlOptions
 * @property {String} mapTypeId
 * @property {String} info_text
 */

/**
 * @typedef {Object} GoogleMapBounds
 * @property {function():GoogleMapLatLng} getNorthEast
 * @property {function():GoogleMapLatLng} getSouthWest
 */

/**
 * @typedef {Object} GoogleMapLatLng
 * @property {function():float} lat
 * @property {function():float} lng
 */

/**
 * @typedef {Object} GoogleMapPoint
 * @property {function():float} x
 * @property {function():float} y
 */

/**
 * @typedef {Object} AddressComponent
 * @property {String} long_name - Long component name
 * @property {String} short_name - Short component name
 * @property {String[]} types - Component type
 * @property {GoogleGeometry} geometry
 */

/**
 * @typedef {Object} GoogleAddress
 * @property {AddressComponent[]} address_components - Components
 * @property {String} formatted_address - Formatted address
 * @property {GoogleGeometry} geometry - Geometry
 */

/**
 * @typedef {Object} GoogleGeometry
 * @property {GoogleMapLatLng} location - Location
 * @property {String} location_type - Location type
 * @property {GoogleMapBounds} viewport - Viewport
 * @property {GoogleMapBounds} bounds - Bounds (optionally)
 */

/**
 * @typedef {Object} GoogleMapProjection
 * @property {function(GoogleMapLatLng):GoogleMapPoint} fromLatLngToPoint
 */

/**
 * @typedef {Object} GoogleMarkerSettings
 *
 * Settings from https://developers.google.com/maps/documentation/javascript/3.exp/reference#MarkerOptions:
 * @property {GoogleMapLatLng} position
 * @property {GoogleMap} map
 * @property {string} title
 * @property {string} [icon]
 * @property {string} [label]
 *
 * Settings from Geolocation module:
 * @property {string} [infoWindowContent]
 * @property {boolean} [infoWindowSolitary]
 */

/**
 * @typedef {Object} GoogleMarker
 * @property {Function} setPosition
 * @property {Function} setMap
 * @property {Function} setIcon
 * @property {Function} setTitle
 * @property {Function} setLabel
 * @property {Function} addListener
 */

/**
 * @typedef {Object} GoogleInfoWindow
 * @property {Function} open
 * @property {Function} close
 */

/**
 * @typedef {Object} GoogleCircle
 * @property {function():GoogleMapBounds} Circle.getBounds()
 */

/**
 * @typedef {Object} GoogleMap
 * @property {Object} ZoomControlStyle
 * @property {String} ZoomControlStyle.LARGE
 *
 * @property {Object} ControlPosition
 * @property {String} ControlPosition.LEFT_TOP
 * @property {String} ControlPosition.TOP_LEFT
 * @property {String} ControlPosition.RIGHT_BOTTOM
 * @property {String} ControlPosition.RIGHT_CENTER
 *
 * @property {Object} MapTypeId
 * @property {String} MapTypeId.ROADMAP
 *
 * @property {Function} LatLngBounds
 *
 * @function
 * @property Map
 *
 * @function
 * @property InfoWindow
 *
 * @function
 * @property {function({GoogleMarkerSettings}):GoogleMarker} Marker
 *
 * @function
 * @property {function({}):GoogleInfoWindow} InfoWindow
 *
 * @function
 * @property {function(string|number|float, string|number|float):GoogleMapLatLng} LatLng
 *
 * @function
 * @property {function(string|number|float, string|number|float):GoogleMapPoint} Point
 *
 * @property {function(Object):GoogleCircle} Circle
 *
 * @property {function():GoogleMapProjection} getProjection
 *
 * @property {Function} fitBounds
 *
 * @property {Function} setCenter
 * @property {Function} setZoom
 * @property {Function} getZoom
 * @property {Function} setOptions
 *
 * @property {function():GoogleMapBounds} getBounds
 * @property {function():GoogleMapLatLng} getCenter
 */

/**
 * @typedef {Object} google
 * @property {GoogleMap} maps
 * @property {Object} event
 * @property {Function} addListener
 * @property {Function} addDomListener
 * @property {Function} addListenerOnce
 * @property {Function} addDomListenerOnce
 */

/**
 * @typedef {Object} GeolocationMap
 * @property {string} id
 * @property {Object} settings
 * @property {GoogleMapSettings} settings.google_map_settings
 * @property {GoogleMap} googleMap
 * @property {Number} lat
 * @property {Number} lng
 * @property {jQuery} container
 * @property {GoogleMarker[]} mapMarkers
 * @property {GoogleInfoWindow} infoWindow
 */

/**
 * Callback when map fully loaded.
 *
 * @callback geolocationMapLoadedCallback
 * @param {GeolocationMap} map - Google map.
 */

(function ($, _, Drupal, drupalSettings) {
  'use strict';

  /* global google */

  /**
   * JSLint handing.
   *
   *  @callback geolocationCallback
   */

  /**
   * @namespace
   */
  Drupal.geolocation = Drupal.geolocation || {};

  Drupal.geolocation.maps = Drupal.geolocation.maps || [];

  // Google Maps are loaded lazily. In some situations load_google() is called twice, which results in
  // "You have included the Google Maps API multiple times on this page. This may cause unexpected errors." errors.
  // This flag will prevent repeat $.getScript() calls.
  Drupal.geolocation.maps_api_loading = false;

  /** {GoogleMapSettings} **/
  Drupal.geolocation.defaultMapSettings = {
    scrollwheel: false,
    panControl: false,
    mapTypeControl: true,
    scaleControl: false,
    streetViewControl: false,
    overviewMapControl: false,
    rotateControl: false,
    fullscreenControl: false,
    zoomControl: true,
    mapTypeId: 'roadmap',
    zoom: 2,
    maxZoom: 0,
    minZoom: 18,
    style: [],
    gestureHandling: 'auto'
  };

  /**
   * Provides the callback that is called when maps loads.
   */
  Drupal.geolocation.googleCallback = function () {
    // Ensure callbacks array;
    Drupal.geolocation.googleCallbacks = Drupal.geolocation.googleCallbacks || [];

    // Wait until the window load event to try to use the maps library.
    $(document).ready(function (e) {
      _.invoke(Drupal.geolocation.googleCallbacks, 'callback');
      Drupal.geolocation.googleCallbacks = [];
    });
  };

  /**
   * Adds a callback that will be called once the maps library is loaded.
   *
   * @param {geolocationCallback} callback - The callback
   */
  Drupal.geolocation.addCallback = function (callback) {
    Drupal.geolocation.googleCallbacks = Drupal.geolocation.googleCallbacks || [];
    Drupal.geolocation.googleCallbacks.push({callback: callback});
  };

  /**
   * Load Google Maps and set a callback to run when it's ready.
   *
   * @param {geolocationCallback} callback - The callback
   */
  Drupal.geolocation.loadGoogle = function (callback) {
    // Add the callback.
    Drupal.geolocation.addCallback(callback);

    // Check for Google Maps.
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
      if (Drupal.geolocation.maps_api_loading === true) {
        return;
      }

      Drupal.geolocation.maps_api_loading = true;
      // Google Maps isn't loaded so lazy load Google Maps.

      if (typeof drupalSettings.geolocation.google_map_url !== 'undefined') {
        $.getScript(drupalSettings.geolocation.google_map_url)
          .done(function () {
            Drupal.geolocation.maps_api_loading = false;
          });
      }
      else {
        console.error('Geolocation - Google map url not set.'); // eslint-disable-line no-console
      }
    }
    else {
      // Google Maps loaded. Run callback.
      Drupal.geolocation.googleCallback();
    }
  };

  /**
   * Load Google Maps and set a callback to run when it's ready.
   *
   * @param {GeolocationMap} map - Container of settings and ID.
   *
   * @return {object} - The Google Map object.
   */
  Drupal.geolocation.addMap = function (map) {

    if (typeof map.id === 'undefined') {
      map.id = 'map' + Math.floor(Math.random() * 10000);
    }

    map.mapMarkers = map.mapMarkers || [];

    // Set the container size.
    map.container.css({
      height: map.settings.google_map_settings.height,
      width: map.settings.google_map_settings.width
    });

    // Get the center point.
    var center = new google.maps.LatLng(map.lat, map.lng);

    // Add any missing settings.
    map.settings.google_map_settings = $.extend(Drupal.geolocation.defaultMapSettings, map.settings.google_map_settings);

    map.settings.google_map_settings.zoom = parseInt(map.settings.google_map_settings.zoom) || Drupal.geolocation.defaultMapSettings.zoom;
    map.settings.google_map_settings.maxZoom = parseInt(map.settings.google_map_settings.maxZoom) || Drupal.geolocation.defaultMapSettings.maxZoom;
    map.settings.google_map_settings.minZoom = parseInt(map.settings.google_map_settings.minZoom) || Drupal.geolocation.defaultMapSettings.minZoom;

     /**
     * Create the map object and assign it to the map.
     *
     * @type {GoogleMap} map.googleMap
     */
    map.googleMap = new google.maps.Map(map.container.get(0), {
      zoom: map.settings.google_map_settings.zoom,
      maxZoom: map.settings.google_map_settings.maxZoom,
      minZoom: map.settings.google_map_settings.minZoom,
      center: center,
      mapTypeId: google.maps.MapTypeId[map.settings.google_map_settings.type],
      mapTypeControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
      },
      rotateControl: map.settings.google_map_settings.rotateControl,
      fullscreenControl: map.settings.google_map_settings.fullscreenControl,
      zoomControl: map.settings.google_map_settings.zoomControl,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.LARGE,
        position: google.maps.ControlPosition.RIGHT_CENTER
      },
      streetViewControl: map.settings.google_map_settings.streetViewControl,
      streetViewControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER
      },
      mapTypeControl: map.settings.google_map_settings.mapTypeControl,
      scrollwheel: map.settings.google_map_settings.scrollwheel,
      disableDoubleClickZoom: map.settings.google_map_settings.disableDoubleClickZoom,
      draggable: map.settings.google_map_settings.draggable,
      styles: map.settings.google_map_settings.style,
      gestureHandling: map.settings.google_map_settings.gestureHandling
    });

    if (map.settings.google_map_settings.scrollwheel && map.settings.google_map_settings.preferScrollingToZooming) {
      map.googleMap.setOptions({scrollwheel: false});
      map.googleMap.addListener('click', function () {
        map.googleMap.setOptions({scrollwheel: true});
      });
    }

    Drupal.geolocation.maps.push(map);

    google.maps.event.addListenerOnce(map.googleMap, 'tilesloaded', function () {
      Drupal.geolocation.mapLoadedCallback(map, map.id);
    });

    return map.googleMap;
  };

  /**
   * Set/Update a marker on a map
   *
   * @param {GeolocationMap} map - The settings object that contains all of the necessary metadata for this map.
   * @param {GoogleMarkerSettings} markerSettings - Marker settings.
   * @param {Boolean} [skipInfoWindow=false] - Skip attaching InfoWindow.
   * @return {GoogleMarker} - Created marker.
   */
  Drupal.geolocation.setMapMarker = function (map, markerSettings, skipInfoWindow) {
    map.mapMarkers = map.mapMarkers || [];
    skipInfoWindow = skipInfoWindow || false;

    if (typeof map.settings.google_map_settings.marker_icon_path === 'string') {
      if (typeof markerSettings.icon === 'undefined') {
        markerSettings.icon = map.settings.google_map_settings.marker_icon_path;
      }
    }

    // Add the marker to the map.
    /** @type {GoogleMarker} */
    var currentMarker = new google.maps.Marker(markerSettings);

    if (skipInfoWindow !== true) {

      // Set the info popup text.
      var currentInfoWindow = new google.maps.InfoWindow({
        content: markerSettings.infoWindowContent,
        disableAutoPan: map.settings.google_map_settings.disableAutoPan
      });

      currentMarker.addListener('click', function () {
        if (markerSettings.infoWindowSolitary) {
          if (typeof map.infoWindow !== 'undefined') {
            map.infoWindow.close();
          }
          map.infoWindow = currentInfoWindow;
        }
        currentInfoWindow.open(map.googleMap, currentMarker);
      });

      if (map.settings.google_map_settings.info_auto_display) {
        google.maps.event.addListenerOnce(map.googleMap, 'tilesloaded', function () {
          google.maps.event.trigger(currentMarker, 'click');
        });
      }
    }

    map.mapMarkers.push(currentMarker);

    return currentMarker;
  };

  /**
   * Remove marker(s) from map.
   *
   * @param {GeolocationMap} map - The settings object that contains all of the necessary metadata for this map.
   */
  Drupal.geolocation.removeMapMarker = function (map) {
    map.mapMarkers = map.mapMarkers || [];

    $.each(
      map.mapMarkers,

      /**
       * @param {integer} index - Current index.
       * @param {GoogleMarker} item - Current marker.
       */
      function (index, item) {
        item.setMap(null);
      }
    );
    map.mapMarkers = [];
  };

  /**
   * Draw a circle indicating accuracy and slowly fade it out.
   *
   * @param {GoogleMapLatLng} location - A location (latLng) object from Google Maps API.
   * @param {int} accuracy - Accuracy in meter.
   * @param {GoogleMap} map - Map to draw on.
   */
  Drupal.geolocation.drawAccuracyIndicator = function (location, accuracy, map) {

    // Draw a circle representing the accuracy radius of HTML5 geolocation.
    var circle = new google.maps.Circle({
      center: location,
      radius: accuracy,
      map: map,
      fillColor: '#4285F4',
      fillOpacity: 0.5,
      strokeColor: '#4285F4',
      strokeOpacity: 1,
      clickable: false
    });

    // Set the zoom level to the accuracy circle's size.
    map.fitBounds(circle.getBounds());

    // Fade circle away.
    setInterval(fadeCityCircles, 100);

    function fadeCityCircles() {
      var fillOpacity = circle.get('fillOpacity');
      fillOpacity -= 0.02;

      var strokeOpacity = circle.get('strokeOpacity');
      strokeOpacity -= 0.04;

      if (
        strokeOpacity > 0
        && fillOpacity > 0
      ) {
        circle.setOptions({fillOpacity: fillOpacity, strokeOpacity: strokeOpacity});
      }
      else {
        circle.setMap(null);
      }
    }
  };

  /**
   * Provides the callback that is called when map is fully loaded.
   *
   * @param {GeolocationMap} map - fully loaded map
   * @param {string} mapId - Source ID.
   */
  Drupal.geolocation.mapLoadedCallback = function (map, mapId) {
    Drupal.geolocation.mapLoadedCallbacks = Drupal.geolocation.mapLoadedCallbacks || [];
    $.each(Drupal.geolocation.mapLoadedCallbacks, function (index, callbackContainer) {
      if (callbackContainer.mapId === mapId) {
        callbackContainer.callback(map);
      }
    });
  };

  /**
   * Adds a callback that will be called when map is fully loaded.
   *
   * @param {geolocationMapLoadedCallback} callback - The callback
   * @param {string} mapId - Map ID.
   */
  Drupal.geolocation.addMapLoadedCallback = function (callback, mapId) {
    if (typeof mapId === 'undefined') {
      return;
    }
    Drupal.geolocation.mapLoadedCallbacks = Drupal.geolocation.mapLoadedCallbacks || [];
    Drupal.geolocation.mapLoadedCallbacks.push({callback: callback, mapId: mapId});
  };

  /**
   * Remove a callback that will be called when map is fully loaded.
   *
   * @param {string} mapId - Identify the source
   */
  Drupal.geolocation.removeMapLoadedCallback = function (mapId) {
    Drupal.geolocation.mapLoadedCallbacks = Drupal.geolocation.geocoder.resultCallbacks || [];
    $.each(Drupal.geolocation.mapLoadedCallbacks, function (index, callback) {
      if (callback.mapId === mapId) {
        Drupal.geolocation.mapLoadedCallbacks.splice(index, 1);
      }
    });
  };

})(jQuery, _, Drupal, drupalSettings);
;
/**
 * @file
 * Handle the common map.
 */

/**
 * @name CommonMapUpdateSettings
 * @property {String} enable
 * @property {String} hide_form
 * @property {number} views_refresh_delay
 * @property {String} update_view_id
 * @property {String} update_view_display_id
 * @property {String} boundary_filter
 * @property {String} parameter_identifier
 */

/**
 * @name CommonMapSettings
 * @property {Object} settings
 * @property {GoogleMapSettings} settings.google_map_settings
 * @property {CommonMapUpdateSettings} dynamic_map
 * @property {String} client_location.enable
 * @property {String} client_location.update_map
 * @property {Boolean} showRawLocations
 * @property {Boolean} markerScrollToResult
 * @property {String} markerClusterer.enable
 * @property {String} markerClusterer.imagePath
 * @property {Object} markerClusterer.styles
 * @property {String} contextPopupContent.enable
 * @property {String} contextPopupContent.content
 */

/**
 * @property {CommonMapSettings[]} drupalSettings.geolocation.commonMap
 */

/**
 * @property {function(CommonMapUpdateSettings)} GeolocationMap.updateDrupalView
 * @property {Object} GeolocationMap.markerClusterer
 */

(function ($, window, Drupal, drupalSettings) {
  'use strict';

  /* global google */

  var skipMapIdleEventHandler = false; // Setting to true will skip the next triggered map related viewsRefresh.

  /**
   * @namespace
   */
  Drupal.geolocation = Drupal.geolocation || {};

  /**
   * Attach common map style functionality.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches common map style functionality to relevant elements.
   */
  Drupal.behaviors.geolocationCommonMap = {
    attach: function (context, drupalSettings) {
      if (typeof Drupal.geolocation.loadGoogle === 'function') {
        // First load the library from google.
        Drupal.geolocation.loadGoogle(function () {
          initialize(drupalSettings.geolocation, context);
        });
      }
    }
  };

  function initialize(settings, context) {

    $.each(
      settings.commonMap,

      /**
       * @param {String} mapId - canvasId of current map
       * @param {CommonMapSettings} commonMapSettings - settings for current map
       */
      function (mapId, commonMapSettings) {

        /*
         * Hide form if requested.
         */
        if (
          typeof commonMapSettings.dynamic_map !== 'undefined'
          && commonMapSettings.dynamic_map.enable
          && commonMapSettings.dynamic_map.hide_form
          && typeof commonMapSettings.dynamic_map.parameter_identifier !== 'undefined'
        ) {
          var exposedForm = $('form#views-exposed-form-' + commonMapSettings.dynamic_map.update_view_id.replace(/_/g, '-') + '-' + commonMapSettings.dynamic_map.update_view_display_id.replace(/_/g, '-'));

          if (exposedForm.length === 1) {
            exposedForm.find('input[name^="' + commonMapSettings.dynamic_map.parameter_identifier + '"]').each(function (index, item) {
              $(item).parent().hide();
            });

            // Hide entire form if it's empty now, except form-submit.
            if (exposedForm.find('input:visible:not(.form-submit), select:visible').length === 0) {
              exposedForm.hide();
            }
          }
        }

        // The DOM-node the map and everything else resides in.
        /** @type {jQuery} */
        var mapWrapper = $('#' + mapId, context);

        // If the map is not present, we can go to the next entry.
        if (!mapWrapper.length) {
          return;
        }

        // Hide the graceful-fallback HTML list; map will propably work now.
        // Map-container is not hidden by default in case of graceful-fallback.
        if (typeof commonMapSettings.showRawLocations === 'undefined') {
          mapWrapper.find('.geolocation-common-map-locations').hide();
        }
        else if (!commonMapSettings.showRawLocations) {
          mapWrapper.find('.geolocation-common-map-locations').hide();
        }

        /**
         * @type {GeolocationMap}
         */
        var geolocationMap = {};

        geolocationMap.id = mapId;

        /*
         * Check for map already created (i.e. after AJAX)
         */
        if (typeof Drupal.geolocation.maps !== 'undefined') {
          $.each(Drupal.geolocation.maps, function (index, map) {
            if (typeof map.container !== 'undefined') {
              if (map.container.is(mapWrapper.find('.geolocation-common-map-container'))) {
                geolocationMap = map;
              }
            }
          });
        }

        /*
         * Update existing map, depending on present data-attribute settings.
         */
        if (typeof geolocationMap.googleMap !== 'undefined') {
          if (mapWrapper.data('centre-lat') && mapWrapper.data('centre-lng')) {
            var newCenter = new google.maps.LatLng(
              mapWrapper.data('centre-lat'),
              mapWrapper.data('centre-lng')
            );

            if (!geolocationMap.googleMap.getCenter().equals(newCenter)) {
              skipMapIdleEventHandler = true;
              geolocationMap.googleMap.setCenter(newCenter);
            }
          }
          else if (
            mapWrapper.data('centre-lat-north-east')
            && mapWrapper.data('centre-lng-north-east')
            && mapWrapper.data('centre-lat-south-west')
            && mapWrapper.data('centre-lng-south-west')
          ) {
            var newBounds = {
              north: mapWrapper.data('centre-lat-north-east'),
              east: mapWrapper.data('centre-lng-north-east'),
              south: mapWrapper.data('centre-lat-south-west'),
              west: mapWrapper.data('centre-lng-south-west')
            };

            if (!geolocationMap.googleMap.getBounds().equals(newBounds)) {
              skipMapIdleEventHandler = true;
              geolocationMap.googleMap.fitBounds(newBounds);
            }
          }
        }

        /*
         * Instantiate new map.
         */
        else {
          geolocationMap.settings = {};
          geolocationMap.settings.google_map_settings = commonMapSettings.settings.google_map_settings;

          geolocationMap.container = mapWrapper.find('.geolocation-common-map-container').first();
          geolocationMap.container.show();

          if (
            mapWrapper.data('centre-lat')
            && mapWrapper.data('centre-lng')
          ) {
            geolocationMap.lat = mapWrapper.data('centre-lat');
            geolocationMap.lng = mapWrapper.data('centre-lng');

            skipMapIdleEventHandler = true;
            geolocationMap.googleMap = Drupal.geolocation.addMap(geolocationMap);
          }
          else if (
            mapWrapper.data('centre-lat-north-east')
            && mapWrapper.data('centre-lng-north-east')
            && mapWrapper.data('centre-lat-south-west')
            && mapWrapper.data('centre-lng-south-west')
          ) {
            var centerBounds = {
              north: mapWrapper.data('centre-lat-north-east'),
              east: mapWrapper.data('centre-lng-north-east'),
              south: mapWrapper.data('centre-lat-south-west'),
              west: mapWrapper.data('centre-lng-south-west')
            };

            geolocationMap.lat = geolocationMap.lng = 0;
            skipMapIdleEventHandler = true;
            geolocationMap.googleMap = Drupal.geolocation.addMap(geolocationMap);

            skipMapIdleEventHandler = true;
            geolocationMap.googleMap.fitBounds(centerBounds);
          }
          else {
            geolocationMap.lat = geolocationMap.lng = 0;

            skipMapIdleEventHandler = true;
            geolocationMap.googleMap = Drupal.geolocation.addMap(geolocationMap);
          }
        }

        /**
         * Dynamic map handling aka "AirBnB mode".
         */
        if (
          typeof commonMapSettings.dynamic_map !== 'undefined'
          && commonMapSettings.dynamic_map.enable
        ) {

          /**
           * Update the view depending on dynamic map settings and capability.
           *
           * One of several states might occur now. Possible state depends on whether:
           * - view using AJAX is enabled
           * - map view is the containing (page) view or an attachment
           * - the exposed form is present and contains the boundary filter
           * - map settings are consistent
           *
           * Given these factors, map boundary changes can be handled in one of three ways:
           * - trigger the views AJAX "RefreshView" command
           * - trigger the exposed form causing a regular POST reload
           * - fully reload the website
           *
           * These possibilities are ordered by UX preference.
           *
           * @param {CommonMapUpdateSettings} dynamic_map_settings
           *   The dynamic map settings to update the map.
           */
          if (typeof geolocationMap.updateDrupalView === 'undefined') {
            geolocationMap.updateDrupalView = function (dynamic_map_settings) {
              // Make sure to load current form DOM element, which will change after every AJAX operation.
              var exposedForm = $('form#views-exposed-form-' + dynamic_map_settings.update_view_id.replace(/_/g, '-') + '-' + dynamic_map_settings.update_view_display_id.replace(/_/g, '-'));

              var currentBounds = geolocationMap.googleMap.getBounds();
              var update_path = '';

              if (
                typeof dynamic_map_settings.boundary_filter !== 'undefined'
              ) {
                if (exposedForm.length) {
                  exposedForm.find('input[name="' + dynamic_map_settings.parameter_identifier + '[lat_north_east]"]').val(currentBounds.getNorthEast().lat());
                  exposedForm.find('input[name="' + dynamic_map_settings.parameter_identifier + '[lng_north_east]"]').val(currentBounds.getNorthEast().lng());
                  exposedForm.find('input[name="' + dynamic_map_settings.parameter_identifier + '[lat_south_west]"]').val(currentBounds.getSouthWest().lat());
                  exposedForm.find('input[name="' + dynamic_map_settings.parameter_identifier + '[lng_south_west]"]').val(currentBounds.getSouthWest().lng());

                  $('input[type=submit], input[type=image], button[type=submit]', exposedForm).not('[data-drupal-selector=edit-reset]').trigger('click');
                }
                // No AJAX, no form, just enforce a page reload with GET parameters set.
                else {
                  if (window.location.search.length) {
                    update_path = window.location.search + '&';
                  }
                  else {
                    update_path = '?';
                  }
                  update_path += dynamic_map_settings.parameter_identifier + '[lat_north_east]=' + currentBounds.getNorthEast().lat();
                  update_path += '&' + dynamic_map_settings.parameter_identifier + '[lng_north_east]=' + currentBounds.getNorthEast().lng();
                  update_path += '&' + dynamic_map_settings.parameter_identifier + '[lat_south_west]=' + currentBounds.getSouthWest().lat();
                  update_path += '&' + dynamic_map_settings.parameter_identifier + '[lng_south_west]=' + currentBounds.getSouthWest().lng();

                  window.location = update_path;
                }
              }
            };
          }

          if (mapWrapper.data('geolocationAjaxProcessed') !== 1) {
            var geolocationMapIdleTimer;
            geolocationMap.googleMap.addListener('idle', function () {
              if (skipMapIdleEventHandler === true) {
                skipMapIdleEventHandler = false;
                return;
              }
              clearTimeout(geolocationMapIdleTimer);
              geolocationMapIdleTimer = setTimeout(function () {
                geolocationMap.updateDrupalView(commonMapSettings.dynamic_map);
              }, commonMapSettings.dynamic_map.views_refresh_delay);
            });
          }
        }

        /**
         * Client location handling.
         */
        if (typeof mapWrapper.data('clientlocation') !== 'undefined' && !mapWrapper.hasClass('clientlocation-processed')) {
          mapWrapper.addClass('clientlocation-processed');
          if (
            mapWrapper.data('geolocationAjaxProcessed') !== 1
            && navigator.geolocation
            && typeof commonMapSettings.client_location !== 'undefined'
            && commonMapSettings.client_location.enable === true
          ) {
            navigator.geolocation.getCurrentPosition(function (position) {
              mapWrapper.data('centre-lat', position.coords.latitude);
              mapWrapper.data('centre-lng', position.coords.longitude);

              var newLocation = new google.maps.LatLng(parseFloat(position.coords.latitude), parseFloat(position.coords.longitude));

              skipMapIdleEventHandler = true;
              geolocationMap.googleMap.setCenter(newLocation);
              if (skipMapIdleEventHandler !== true) {
                skipMapIdleEventHandler = true;
              }

              geolocationMap.googleMap.setZoom(geolocationMap.settings.google_map_settings.zoom);

              Drupal.geolocation.drawAccuracyIndicator(newLocation, parseInt(position.coords.accuracy), geolocationMap.googleMap);

              if (
                typeof commonMapSettings.client_location.update_map !== 'undefined'
                && commonMapSettings.client_location.update_map === true
                && typeof commonMapSettings.dynamic_map !== 'undefined'
              ) {
                skipMapIdleEventHandler = true;
                geolocationMap.updateDrupalView(commonMapSettings.dynamic_map);
              }
            });
          }
        }

        /**
         * Result handling.
         */
        // A Google Maps API tool to re-center the map on its content.
        var bounds = new google.maps.LatLngBounds();
        Drupal.geolocation.removeMapMarker(geolocationMap);

        /*
         * Add the locations to the map.
         */
        mapWrapper.find('.geolocation-common-map-locations .geolocation').each(function (key, location) {

          /** @type {jQuery} */
          location = $(location);
          var position = new google.maps.LatLng(parseFloat(location.data('lat')), parseFloat(location.data('lng')));

          bounds.extend(position);

          /**
           * @type {GoogleMarkerSettings}
           */
          var markerConfig = {
            position: position,
            map: geolocationMap.googleMap,
            title: location.children('.location-title').html(),
            infoWindowContent: location.html(),
            infoWindowSolitary: true
          };

          if (typeof location.data('icon') !== 'undefined') {
            markerConfig.icon = location.data('icon');
          }

          if (typeof location.data('markerLabel') !== 'undefined') {
            markerConfig.label = location.data('markerLabel').toString();
          }

          var skipInfoWindow = false;
          if (commonMapSettings.markerScrollToResult === true) {
            skipInfoWindow = true;
          }

          var marker = Drupal.geolocation.setMapMarker(geolocationMap, markerConfig, skipInfoWindow);

          marker.addListener('click', function () {
            if (commonMapSettings.markerScrollToResult === true) {
              var target = $('[data-location-id="' + location.data('location-id') + '"]:visible').first();

              // Alternatively select by class.
              if (target.length === 0) {
                target = $('.geolocation-location-id-' + location.data('location-id') + ':visible').first();
              }

              if (target.length === 1) {
                $('html, body').animate({
                  scrollTop: target.offset().top
                }, 'slow');
              }
            }
          });
        });

        /**
         * Context popup handling.
         */
        if (
          typeof commonMapSettings.contextPopupContent !== 'undefined'
          && commonMapSettings.contextPopupContent.enable
        ) {

          /** @type {jQuery} */
          var contextContainer = jQuery('<div class="geolocation-context-popup"></div>');
          contextContainer.hide();
          contextContainer.appendTo(geolocationMap.container);

          /**
           * Gets the default settings for the Google Map.
           *
           * @param {GoogleMapLatLng} latLng - Coordinates.
           * @return {GoogleMapPoint} - Pixel offset against top left corner of map container.
           */
          geolocationMap.googleMap.fromLatLngToPixel = function (latLng) {
            var numTiles = 1 << geolocationMap.googleMap.getZoom();
            var projection = geolocationMap.googleMap.getProjection();
            var worldCoordinate = projection.fromLatLngToPoint(latLng);
            var pixelCoordinate = new google.maps.Point(
              worldCoordinate.x * numTiles,
              worldCoordinate.y * numTiles);

            var topLeft = new google.maps.LatLng(
              geolocationMap.googleMap.getBounds().getNorthEast().lat(),
              geolocationMap.googleMap.getBounds().getSouthWest().lng()
            );

            var topLeftWorldCoordinate = projection.fromLatLngToPoint(topLeft);
            var topLeftPixelCoordinate = new google.maps.Point(
              topLeftWorldCoordinate.x * numTiles,
              topLeftWorldCoordinate.y * numTiles);

            return new google.maps.Point(
              pixelCoordinate.x - topLeftPixelCoordinate.x,
              pixelCoordinate.y - topLeftPixelCoordinate.y
            );
          };

          google.maps.event.addListener(geolocationMap.googleMap, 'rightclick', function (event) {
            var content = Drupal.formatString(commonMapSettings.contextPopupContent.content, {
              '@lat': event.latLng.lat(),
              '@lng': event.latLng.lng()
            });

            contextContainer.html(content);

            if (content.length > 0) {
              var pos = geolocationMap.googleMap.fromLatLngToPixel(event.latLng);
              contextContainer.show();
              contextContainer.css('left', pos.x);
              contextContainer.css('top', pos.y);
            }
          });

          google.maps.event.addListener(geolocationMap.googleMap, 'click', function (event) {
            if (typeof contextContainer !== 'undefined') {
              contextContainer.hide();
            }
          });
        }

        /**
         * MarkerClusterer handling.
         */
        if (
          typeof commonMapSettings.markerClusterer !== 'undefined'
          && commonMapSettings.markerClusterer.enable
          && typeof MarkerClusterer !== 'undefined'
        ) {

          /* global MarkerClusterer */

          var imagePath = '';
          if (commonMapSettings.markerClusterer.imagePath) {
            imagePath = commonMapSettings.markerClusterer.imagePath;
          }
          else {
            imagePath = 'https://cdn.rawgit.com/googlemaps/js-marker-clusterer/gh-pages/images/m';
          }

          var markerClustererStyles = '';
          if (typeof commonMapSettings.markerClusterer.styles !== 'undefined') {
            markerClustererStyles = commonMapSettings.markerClusterer.styles;
          }

          geolocationMap.markerClusterer = new MarkerClusterer(
            geolocationMap.googleMap,
            geolocationMap.mapMarkers,
            {
              imagePath: imagePath,
              styles: markerClustererStyles
            }
          );
        }

        if (mapWrapper.data('fitbounds') === 1) {
          // Fit map center and zoom to all currently loaded markers.
          skipMapIdleEventHandler = true;
          geolocationMap.googleMap.fitBounds(bounds);
        }
      }
    );
  }

  /**
   * Insert updated map contents into the document.
   *
   * ATTENTION: This is a straight ripoff from misc/ajax.js ~line 1017 insert() function.
   * Please read all code commentary there first!
   *
   * @param {Drupal.Ajax} ajax
   *   {@link Drupal.Ajax} object created by {@link Drupal.ajax}.
   * @param {object} response
   *   The response from the Ajax request.
   * @param {string} response.data
   *   The data to use with the jQuery method.
   * @param {string} [response.method]
   *   The jQuery DOM manipulation method to be used.
   * @param {string} [response.selector]
   *   A optional jQuery selector string.
   * @param {object} [response.settings]
   *   An optional array of settings that will be used.
   * @param {number} [status]
   *   The XMLHttpRequest status.
   */
  Drupal.AjaxCommands.prototype.geolocationCommonMapsUpdate = function (ajax, response, status) {
    // See function comment for code origin first before any changes!
    var $wrapper = response.selector ? $(response.selector) : $(ajax.wrapper);
    var settings = response.settings || ajax.settings || drupalSettings;

    var $new_content_wrapped = $('<div></div>').html(response.data);
    var $new_content = $new_content_wrapped.contents();

    if ($new_content.length !== 1 || $new_content.get(0).nodeType !== 1) {
      $new_content = $new_content.parent();
    }

    Drupal.detachBehaviors($wrapper.get(0), settings);

    // Retain existing map if possible, to avoid jumping and improve UX.
    if (
      $new_content.find('.geolocation-common-map-container').length > 0
      && $wrapper.find('.geolocation-common-map-container').length > 0
    ) {
      var detachedMap = $wrapper.find('.geolocation-common-map-container').first().detach();
      $new_content.find('.geolocation-common-map-container').first().replaceWith(detachedMap);
      $new_content.find('.geolocation-common-map').data('geolocation-ajax-processed', 1);
    }

    $wrapper.replaceWith($new_content);

    // Attach all JavaScript behaviors to the new content, if it was
    // successfully added to the page, this if statement allows
    // `#ajax['wrapper']` to be optional.
    if ($new_content.parents('html').length > 0) {
      // Apply any settings from the returned JSON if available.
      Drupal.attachBehaviors($new_content.get(0), settings);
    }
  };

})(jQuery, window, Drupal, drupalSettings);
;
/**
 * @file
 * A Backbone Model for the state of the Simple hierarchical select widget.
 *
 * @see Drupal.shs.AppView
 */

(function (Backbone, Drupal) {

  'use strict';

  /**
   * @constructor
   *
   * @augments Backbone.Model
   */
  Drupal.shs.AppModel = Backbone.Model.extend(/** @lends Drupal.shs.AppModel# */{

    /**
     * @type {object}
     *
     */
    defaults: /** @lends Drupal.shs.AppModel# */{

      /**
       * The field configuration.
       *
       * @type {object}
       */
      config: {}
    }

  });

}(Backbone, Drupal));
;
/**
 * @file
 * A Backbone Model for a single container of the Simple hierarchical select
 * widget.
 *
 * @see Drupal.shs.ContainerView
 */

(function (Backbone, Drupal) {

  'use strict';

  /**
   * @constructor
   *
   * @augments Backbone.Model
   */
  Drupal.shs.ContainerModel = Backbone.Model.extend(/** @lends Drupal.shs.ContainerModel# */{

    /**
     * @type {object}
     *
     */
    defaults: /** @lends Drupal.shs.ContainerModel# */{

      /**
       * The container delta (position).
       *
       * @type {integer}
       */
      delta: 0,

      /**
       * List of parent items.
       *
       * @type {array}
       */
      parents: [],

      /**
       * The current value within the container.
       */
      value: null

    }

  });

}(Backbone, Drupal));
;
/**
 * @file
 * A Backbone Model for a single widget in SHS.
 */

(function ($, Backbone, Drupal) {

  'use strict';


  /**
   * Backbone model for a single widget in SHS.
   *
   * @constructor
   *
   * @augments Backbone.Model
   */
  Drupal.shs.WidgetModel = Backbone.Model.extend(/** @lends Drupal.shs.WidgetModel# */{

    /**
     * @type {object}
     *
     * @prop {object} items
     */
    defaults: /** @lends Drupal.shs.WidgetModel# */{

      /**
       * Default value of widget.
       *
       * @type {string}
       */
      defaultValue: '_none',

      /**
       * Position of widget in app.
       *
       * @type {integer}
       */
      level: 0,

      /**
       * Collection of items in widget (options).
       *
       * @type {Drupal.shs.WidgetItemCollection}
       */
      itemCollection: null,

      /**
       * Indicator whether data for this model has been loaded already.
       *
       * @type {boolean}
       */
      dataLoaded: false
    },

    /**
     * {@inheritdoc}
     */
    initialize: function (options) {
      // Set internal id.
      this.set('id', options.id);
    }
  });

}(jQuery, Backbone, Drupal));
;
/**
 * @file
 * A Backbone Model for widget items in SHS.
 */

(function (Backbone, Drupal) {

  'use strict';


  /**
   * Backbone model for widget items in SHS.
   *
   * @constructor
   *
   * @augments Backbone.Model
   */
  Drupal.shs.WidgetItemModel = Backbone.Model.extend(/** @lends Drupal.shs.WidgetItemModel# */{
    /**
     * @type {object}
     *
     * @prop {integer} tid
     * @prop {string} langcode
     * @prop {string} name
     * @prop {string} description
     */
    defaults: /** @lends Drupal.shs.WidgetItemModel# */{

      /**
       * Represents the term Id.
       *
       * @type {integer}
       */
      tid: null,

      /**
       * Language code of the term.
       *
       * @type {string}
       */
      langcode: null,

      /**
       * Name (label) of the term.
       *
       * @type {string}
       */
      name: '',

      /**
       * Description of the term.
       *
       * @type {string}
       */
      description: '',

      /**
       * Indicator whether the item has children.
       *
       * @type {boolean}
       */
      hasChildren: false,

      /**
       * Attribute to use as Id.
       *
       * @type {string}
       */
      idAttribute: 'tid'
    },

    /**
     * {@inheritdoc}
     */
    initialize: function () {
      // Set internal id to termId.
      this.set('id', this.get('tid'));
    },

    /**
     * {@inheritdoc}
     */
    parse: function (response, options) {
      return {
        tid: response.tid,
        name: response.name,
        description: response.description__value,
        langcode: response.langcode,
        hasChildren: response.hasChildren
      };
    }
  });

}(Backbone, Drupal));
;
/**
 * @file
 * A Backbone Model for widget item options in SHS.
 */

(function (Backbone, Drupal) {

  'use strict';


  /**
   * Backbone model for widget item options in SHS.
   *
   * @constructor
   *
   * @augments Backbone.Model
   */
  Drupal.shs.WidgetItemOptionModel = Backbone.Model.extend(/** @lends Drupal.shs.WidgetItemOptionModel# */{

    /**
     * @type {object}
     *
     * @prop {string} label
     * @prop {string} value
     * @prop {boolean} hasChildren
     */
    defaults: /** @lends Drupal.shs.WidgetItemOptionModel# */{

      /**
       * Represents the option label.
       *
       * @type {string}
       */
      label: '',

      /**
       * The option value.
       *
       * @type {string}
       */
      value: undefined,

      /**
       * Indicator whether the item has children.
       *
       * @type {boolean}
       */
      hasChildren: false
    },

    /**
     * {@inheritdoc}
     */
    initialize: function () {}
  });

}(Backbone, Drupal));
;
/**
 * @file
 * A Backbone View that controls the overall Simple hierarchical select widgets.
 *
 * @see Drupal.shs.AppModel
 */

(function ($, _, Backbone, Drupal) {

  'use strict';

  Drupal.shs.AppView = Backbone.View.extend(/** @lends Drupal.shs.AppView# */{
    /**
     * Container element for SHS widgets.
     */
    container: null,
    /**
     * Field configuration.
     *
     * @type {object}
     */
    config: {},
    /**
     * @constructs
     *
     * @augments Backbone.View
     *
     * @param {object} options
     *   An object with the following keys:
     * @param {Drupal.shs.AppModel} options.model
     *   The application state model.
     */
    initialize: function (options) {
      // Track app state.
      this.config = this.model.get('config');

      // Initialize collection.
      this.collection = new Drupal.shs.ContainerCollection();
      this.collection.reset();

      // Initialize event listeners.
      this.listenTo(this.collection, 'initialize:shs', this.renderWidgets);

      this.$el.once('shs').addClass('hidden');
    },
    /**
     * Main render function of Simple hierarchical select.
     *
     * @return {Drupal.shs.AppView}
     *   Returns AppView for chaining.
     */
    render: function () {
      var app = this;

      // Create application container.
      app.container = $('<div>')
              .addClass('shs-container')
              .html('')
              .insertBefore(app.$el);

      // Generate widget containers.
      $.each(app.getConfig('parents'), function (delta, parents) {
        app.collection.add(new Drupal.shs.classes[app.getConfig('fieldName')].models.container({
          delta: delta,
          parents: parents
        }));
      });
//      $.each(app.getConfig('parents'), function (index, item) {
//        // Add WidgetModel for each parent.
//      });

      app.collection.trigger('initialize:shs');

      return app;
    },
    /**
     * Renders the select widgets of Simple hierarchical select.
     *
     * @return {Drupal.shs.AppView}
     *   Returns AppView for chaining.
     */
    renderWidgets: function () {
      var app = this;
      var fieldName = app.getConfig('fieldName');
      // Create widget containers.
      app.collection.each(function (containerModel) {
        var container = new Drupal.shs.classes[fieldName].views.container({
          app: app,
          model: containerModel
        });

        app.container.append(container.render().$el);
      });
      // Create button for "Add new".
      new Drupal.shs.classes[fieldName].views.addNew({
        app: app
      });

      app.collection.trigger('widgetsRendered:shs');
      return app;
    },
    /**
     * Update the value of the original element.
     *
     * @param {string} value
     *   New value of element.
     * @param {Drupal.shs.ContainerView} container
     *   Updated container.
     * @param {Drupal.shs.WidgetModel} widgetModel
     *   The changed model.
     */
    updateElementValue: function(value, container, widgetModel) {
      var app = this;

      if (app.getSetting('multiple')) {
        value = [];
        app.collection.each(function (model) {
          var modelValue = model.get('value');
          if (typeof modelValue == undefined || null == modelValue || modelValue === app.getSetting('anyValue')) {
            return;
          }
          value.push(modelValue);
        });
      }
      else {
        if (value === app.getSetting('anyValue') && widgetModel.get('level') > 0) {
          // Use value of parent widget (which is the id of the model ;)).
          value = widgetModel.get('id');
        }
      }
      // Set the updated value.
      app.$el.val(value).trigger({
        type: 'change',
        shsContainer: container,
        shsWidgetModel: widgetModel
      });
      return app;
    },
    /**
     * Check if original widget reports an error.
     *
     * @returns {boolean}
     *   Whether there is something wrong with the original widget.
     */
    hasError: function () {
      return this.$el.hasClass('error');
    },
    /**
     * Get a configuration value for shs.
     *
     * @param {string} name
     *   Name of the configuration to get. To get the value of a nested
     *   configuration the names are concatted by a dot (i.e.
     *   "display.animationSpeed").
     *
     * @returns {mixed}
     *   The value of the configuration or the complete configuration object if
     *   the name is empty.
     */
    getConfig: function (name) {
      if (typeof name == undefined || name == null) {
        return this.config || {};
      }

      var parts = name.split('.');
      var conf = this.config || {};
      for (var i = 0, len = parts.length; i < len; i++) {
        conf = conf[parts[i]];
      }
      if (typeof conf === undefined) {
        return;
      }
      return conf;
    },
    /**
     * Shortcut function for <code>getConfig('settings.*');</code>.
     *
     * @param {string} name
     *   Name of a setting to get. If empty, the entire settings will be
     *   returned.
     *
     * @returns {mixed}
     *   The value of the setting.
     */
    getSetting: function (name) {
      if (typeof name == undefined || name == null) {
        name = 'settings';
      }
      else {
        name = 'settings.' + name;
      }
      return this.getConfig(name);
    }
  });

  /**
   * @constructor
   *
   * @augments Backbone.Collection
   */
  Drupal.shs.ContainerCollection = Backbone.Collection.extend(/** @lends Drupal.shs.ContainerCollection */{
    /**
     * @type {Drupal.shs.ContainerModel}
     */
    model: Drupal.shs.ContainerModel
  });

}(jQuery, _, Backbone, Drupal));
;
/**
 * @file
 * A Backbone View that adds "Add new item" functionality to widget containers.
 *
 * @see Drupal.shs.ContainerView
 */

(function ($, Backbone, Drupal) {

  'use strict';

  Drupal.shs.AddNewView = Backbone.View.extend(/** @lends Drupal.shs.AddNewView# */{
    /**
     * The main application.
     *
     * @type {Drupal.shs.AppView}
     */
    app: null,
    /**
     * Default tagname of this view.
     *
     * @type {string}
     */
    tagName: 'div',
    /**
     * @constructs
     *
     * @augments Backbone.View
     *
     * @param {object} options
     *   An object with the following keys:
     * @param {Drupal.shs.AppView} options.app
     *   The application state view.
     */
    initialize: function (options) {
      this.app = options.app;
      // Listen to collection updates.
      this.listenTo(this.app.collection, 'widgetsRendered:shs', this.addButton);
    },
    /**
     * Add button to application if needed.
     *
     * @return {Drupal.shs.AddNewView}
     *   Returns AddNewView for chaining.
     */
    addButton: function () {
      var element = this;

      // Remove buttons created earlier.
      $('.shs-addnew-container', element.app.container).remove();

      // Set default classes and clear content.
      element.$el.addClass('shs-addnew-container')
              .html('');

      // Does the setting allow us to add more items?
      var cardinality = this.app.getConfig('cardinality');
      var itemCount = this.app.collection.length;

      if ((cardinality === 1) || (cardinality === itemCount)) {
        // Only 1 item is allowed or we reached the maximum number of items.
        return;
      }

      // Create "button".
      var $button = $('<a>')
              .addClass('button')
              .addClass('add-another')
              .text(this.app.getSetting('addNewLabel'));

      $button.on('click', {app: this.app, button: this}, this.triggerContainerRefresh);
      $button.appendTo(element.$el);

      // Add element to application container.
      element.$el.appendTo(element.app.container);

      // Return self for chaining.
      return element;
    },
    /**
     * Trigger a refresh of the application container.
     *
     * @param {object} event
     *   The event object containing the following event.data:
     * @param {object} event.data.button
     *   The current view.
     * @param {object} event.data.app
     *   Reference to the main application.
     */
    triggerContainerRefresh: function (event) {
      var element = event.data.button;
      var app = event.data.app;
      element.$el.addClass('is-disabled');
      app.collection.add(new Drupal.shs.classes[app.getConfig('fieldName')].models.container({
        delta: app.collection.length,
        parents: [{
          defaultValue: app.getSetting('anyValue'),
          parent: 0
        }]
      }));
      element.$el.removeClass('is-disabled');
      app.container.html('');
      app.collection.trigger('initialize:shs');
    }
  });

}(jQuery, Backbone, Drupal));
;
/**
 * @file
 * A Backbone View that controls a Simple hierarchical select widget container.
 *
 * @see Drupal.shs.ContainerModel
 */

(function ($, _, Backbone, Drupal) {

  'use strict';

  Drupal.shs.ContainerView = Backbone.View.extend(/** @lends Drupal.shs.ContainerView# */{
    /**
     * The main application.
     *
     * @type {Drupal.shs.AppView}
     */
    app: null,
    /**
     * Default tagname of this view.
     *
     * @type {string}
     */
    tagName: 'div',
    /**
     * @constructs
     *
     * @augments Backbone.View
     *
     * @param {object} options
     *   An object with the following keys:
     * @param {Drupal.shs.AppView} options.app
     *   The application state view.
     */
    initialize: function (options) {
      this.app = options.app;

      // Set default value.
      var defaultValue = this.app.getConfig('defaultValue');
      if (null !== defaultValue && defaultValue.hasOwnProperty(this.model.get('delta'))) {
        this.model.set('value', this.app.getConfig('defaultValue')[this.model.get('delta')]);
      }

      this.collection = new Drupal.shs.WidgetCollection({
        url: Drupal.url(this.app.getConfig('baseUrl') + '/' + this.app.getConfig('fieldName') + '/' + this.app.getConfig('bundle'))
      });
      this.collection.reset();

      this.listenTo(this.collection, 'initialize:shs-container', this.renderWidgets);
      this.listenTo(this.collection, 'update:selection', this.selectionUpdate);
      this.listenTo(this.collection, 'update:value', this.broadcastUpdate);
    },
    /**
     * Main render function for a widget container.
     *
     * @return {Drupal.shs.ContainerView}
     *   Returns ContainerView for chaining.
     */
    render: function () {
      var container = this;

      // Set default classes and clear content.
      container.$el.addClass('shs-field-container')
              .attr('data-shs-delta', container.model.get('delta'))
              .html('');

      $.each(container.model.get('parents'), function (index, item) {
        // Add WidgetModel for each parent.
        container.collection.add(new Drupal.shs.classes[container.app.getConfig('fieldName')].models.widget({
          id: item.parent,
          defaultValue: item.defaultValue,
          level: index
        }));
      });

      // Trigger events.
      container.collection.trigger('initialize:shs-container');

      return container;
    },
    /**
     * Renders the select widgets of Simple hierarchical select.
     *
     * @return {Drupal.shs.ContainerView}
     *   Returns ContainerView for chaining.
     */
    renderWidgets: function () {
      var container = this;
      container.$el.html('');
      container.collection.each(function (widgetModel) {
        // Create container for widget.
        container.$el.append($('<div>').addClass('shs-widget-container').attr('data-shs-level', widgetModel.get('level')));
        // Create widget.
        new Drupal.shs.classes[container.app.getConfig('fieldName')].views.widget({
          container: container,
          model: widgetModel
        });
      });

      return container;
    },
    /**
     * Rebuild widgets based on changed selection.
     *
     * @param {Drupal.shs.WidgetModel} widgetModel
     *   The changed model.
     * @param {string} value
     *   New value of WidgetView
     * @param {Drupal.shs.WidgetView} widgetView
     *   View displaying the model.
     */
    selectionUpdate: function (widgetModel, value, widgetView) {
      var container = this;
      // Find all WidgetModels with a higher level than the changed model.
      var models = _.filter(this.collection.models, function (model) {
        return model.get('level') > widgetModel.get('level');
      });
      // Remove the found models from the collection.
      container.collection.remove(models);

      var anyValue = container.app.getSetting('anyValue');
      if (value !== anyValue) {
        // Add new model with current selection.
        container.collection.add(new Drupal.shs.classes[container.app.getConfig('fieldName')].models.widget({
          id: value,
          level: widgetModel.get('level') + 1
        }));
      }
      if (value === anyValue && widgetModel.get('level') > 0) {
        // Use value of parent widget (which is the id of the model ;)).
        value = widgetModel.get('id');
      }

      // Update parents.
      var parents = [];
      var previousParent = 0;
      container.collection.each(function (widgetModel) {
        parents.push({
          defaultValue: widgetModel.get('defaultValue'),
          parent: previousParent
        });
        previousParent = widgetModel.get('defaultValue');
      });
      container.model.set('parents', parents);
      container.model.set('value', value);
      // Trigger value update.
      container.collection.trigger('update:value', widgetModel, value);

      // Trigger rerender of widgets.
      container.collection.trigger('initialize:shs-container');
    },
    /**
     * Broadcast value update to application.
     *
     * @param {Drupal.shs.WidgetModel} widgetModel
     *   The changed model.
     * @param {string} value
     *   New value of element.
     */
    broadcastUpdate: function (widgetModel, value) {
      var app = this.app;
      if (value === app.getSetting('anyValue') && widgetModel.get('level') > 0) {
        // Use value of parent widget (which is the id of the model ;)).
        value = widgetModel.get('id');
      }
      // Send updated value to application.
      app.updateElementValue(value, this, widgetModel);
    }
  });

  /**
   * @constructor
   *
   * @augments Backbone.Collection
   */
  Drupal.shs.WidgetCollection = Backbone.Collection.extend(/** @lends Drupal.shs.WidgetCollection */{
    /**
     * @type {Drupal.shs.WidgetModel}
     */
    model: Drupal.shs.WidgetModel,
    /**
     * {@inheritdoc}
     */
    initialize: function (options) {
      this.url = options.url;
    }
  });

}(jQuery, _, Backbone, Drupal));
;
/**
 * @file
 * A Backbone view for a shs widget.
 */

(function ($, Drupal, drupalSettings, Backbone) {

  'use strict';

  Drupal.shs.WidgetView = Backbone.View.extend(/** @lends Drupal.shs.WidgetView# */{

    /**
     * The enclosing container.
     *
     * @type {Drupal.shs.ContainerView}
     */
    container: null,
    /**
     * Default tagname of this view.
     *
     * @type {string}
     */
    tagName: 'select',
    /**
     * List of custom events.
     */
    events: {
      'change': 'selectionChange'
    },
    /**
     * Backbone View for shs widgets.
     *
     * @constructs
     *
     * @augments Backbone.View
     */
    initialize: function (options) {
      this.container = options.container;

      if (!this.model.get('dataLoaded')) {
        // Create new item collection.
        this.model.itemCollection = new Drupal.shs.WidgetItemCollection({
          url: Drupal.url(this.container.app.getConfig('baseUrl') + '/' + this.container.app.getConfig('fieldName') + '/' + this.container.app.getConfig('bundle') + '/' + this.model.get('id'))
        });
      }

      this.listenTo(this, 'widget:rerender', this.render);
      this.listenTo(this.model.itemCollection, 'update', this.render);

      if (this.model.get('dataLoaded')) {
        // Re-render widget without fetching.
        this.trigger('widget:rerender');
      }
      else {
        // Fetch collection items.
        this.model.itemCollection.fetch();
      }
    },
    /**
     * @inheritdoc
     */
    render: function () {
      var widget = this;
      widget.$el.prop('id', widget.container.app.$el.prop('id') + '-shs-' + widget.container.model.get('delta') + '-' + widget.model.get('level'))
              .addClass('shs-select')
              // Add core class to apply default styles to the element.
              .addClass('form-select')
              .hide();
      if (widget.model.get('dataLoaded')) {
        widget.$el.show();
      }
      if (widget.container.app.getSetting('required')) {
        widget.$el.addClass('required');
        // Add HTML5 required attributes to first level.
        if (widget.model.get('level') === 0) {
          widget.$el.attr('required', 'required');
          widget.$el.attr('aria-required', 'true');

          // Remove attributes from original element!
          widget.container.app.$el.removeAttr('required');
          widget.container.app.$el.removeAttr('aria-required');
        }
      }
      if (widget.container.app.hasError()) {
        widget.$el.addClass('error');
      }

      // Remove all existing options.
      $('option', widget.$el).remove();

      // Add "any" option.
      widget.$el.append($('<option>').text(widget.container.app.getSetting('anyLabel')).val(widget.container.app.getSetting('anyValue')));

      // Create options from collection.
      widget.model.itemCollection.each(function (item) {
        if (!item.get('tid')) {
          return;
        }
        var optionModel = new Drupal.shs.classes[widget.container.app.getConfig('fieldName')].models.widgetItemOption({
          label: item.get('name'),
          value: item.get('tid'),
          hasChildren: item.get('hasChildren')
        });
        var option = new Drupal.shs.classes[widget.container.app.getConfig('fieldName')].views.widgetItem({
          model: optionModel
        });
        widget.$el.append(option.render().$el);
      });

      var $container = $('.shs-widget-container[data-shs-level="' + widget.model.get('level') + '"]', widget.container.$el);
      if (widget.model.itemCollection.length === 0 && !widget.container.app.getSetting('create_new_levels')) {
        // Do not create the widget.
        $container.remove();
        return widget;
      }

      // Create label if necessary.
      if ((widget.container.model.get('delta') === 0) || widget.container.app.getConfig('display.labelsOnEveryLevel')) {
        var labels = widget.container.app.getConfig('labels') || [];
        var label = false;
        if (labels.hasOwnProperty(widget.model.get('level')) && (label = labels[widget.model.get('level')]) !== false) {
          $('<label>')
                  .prop('for', widget.$el.prop('id'))
                  .text(label)
                  .appendTo($container);
        }
      }

      // Set default value of widget.
      widget.$el.val(widget.model.get('defaultValue'));

      // Add widget to container.
      if (widget.model.get('dataLoaded')) {
        // Add element without using any effect.
        $container.append(widget.$el);
      }
      else {
        $container.append(widget.$el.fadeIn(widget.container.app.getConfig('display.animationSpeed')));
      }

      widget.model.set('dataLoaded', true);
      // Return self for chaining.
      return widget;
    },
    /**
     * React to selection changes within the element.
     */
    selectionChange: function () {
      var value = $(this.el).val();
      // Update default value of attached model.
      this.model.set('defaultValue', value);
      // Fire events.
      this.container.collection.trigger('update:selection', this.model, value, this);
    }

  });

  /**
   * @constructor
   *
   * @augments Backbone.Collection
   */
  Drupal.shs.WidgetItemCollection = Backbone.Collection.extend(/** @lends Drupal.shs.WidgetItemCollection */{
    /**
     * @type {Drupal.shs.WidgetItemModel}
     */
    model: Drupal.shs.WidgetItemModel,
    /**
     * {@inheritdoc}
     */
    initialize: function (options) {
      this.url = options.url;
    }
  });

}(jQuery, Drupal, drupalSettings, Backbone));
;
/**
 * @file
 * A Backbone view for a shs widget items.
 */

(function ($, Drupal, drupalSettings, Backbone) {

  'use strict';

  Drupal.shs.WidgetItemView = Backbone.View.extend(/** @lends Drupal.shs.WidgetItemView# */{

    /**
     * Default tagname of this view.
     *
     * @type {string}
     */
    tagName: 'option',

    /**
     * Backbone View for a single shs widget item.
     *
     * @constructs
     *
     * @augments Backbone.View
     */
    initialize: function () {},

    /**
     * @inheritdoc
     */
    render: function () {
      if ((typeof this.model.get('value') === undefined) || (this.model.get('value') === null)) {
        // Do not render item.
        return;
      }

      // Set label and value of the option.
      this.$el.text(this.model.get('label'))
              .val(this.model.get('value'));

      if (this.model.get('hasChildren')) {
        // Add special class.
        this.$el.addClass('has-children');
      }

      // Return self for chaining.
      return this;
    }

  });

}(jQuery, Drupal, drupalSettings, Backbone));
;
