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
