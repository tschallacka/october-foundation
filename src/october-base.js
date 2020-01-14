/*
 * Asset Manager
 *
 * Usage: assetManager.load({ css:[], js:[], img:[] }, onLoadedCallback)
 */

AssetManager = function() {
	
    var o = {
    	closureJSList : [],
    	closureCSSList : [],
    	closureIMGList : [],
    	
        load: function(collection, callback) {
            var jsList = (collection.js) ? collection.js : [],
                cssList = (collection.css) ? collection.css : [],
                imgList = (collection.img) ? collection.img : [];
            
            var loaded = this.closureJSList;
            
            jsList = $.grep(jsList, function(item){
            	if(item.indexOf('?') != -1) {
            		item = item.substring(0, item.indexOf('?'));
					
            	}
                return $('head script[src*="'+item+'"]').length == 0 && (loaded.filter(function(s) {return s.indexOf(item) > -1}).length == 0);
            });
            
            loaded = this.closureCSSList;
            
            cssList = $.grep(cssList, function(item){
            	if(item.indexOf('?') != -1) {
            		item = item.substring(0, item.indexOf('?'));
            	}
                return $('head link[href*="'+item+'"]').length == 0 && loaded.indexOf(item) == -1;
            });

            var cssCounter = 0,
                jsLoaded = false,
                imgLoaded = false;

            if (jsList.length === 0 && cssList.length === 0 && imgList.length === 0) {
                callback && callback();
                return;
            }

            o.loadJavaScript(jsList, function(){
                jsLoaded = true;
                checkLoaded();
            });
            
            $.each(cssList, function(index, source){
                o.loadStyleSheet(source, function(){
                    cssCounter++;
                    checkLoaded();
                })
            });

            o.loadImage(imgList, function(){
                imgLoaded = true;
                checkLoaded();
            });

            function checkLoaded() {
                if (!imgLoaded)
                    return false;

                if (!jsLoaded)
                    return false;

                if (cssCounter < cssList.length)
                    return false;

                callback && callback();
            }
        },

        /*
         * Loads StyleSheet files
         */
        loadStyleSheet: function(source, callback) {
        	
            var cssElement = document.createElement('link');

            cssElement.setAttribute('rel', 'stylesheet');
            cssElement.setAttribute('type', 'text/css');
            cssElement.setAttribute('href', source);
            cssElement.addEventListener('load', callback, false);

            if (typeof cssElement != 'undefined') {
                document.getElementsByTagName('head')[0].appendChild(cssElement);
            }

            return cssElement;
        },

        /*
         * Loads JavaScript files in sequence
         */
        loadJavaScript: function(sources, callback) {
            if (sources.length <= 0)
                return callback();

            var source = sources.shift(),
                jsElement = document.createElement('script');

            jsElement.setAttribute('type', 'text/javascript');
            jsElement.setAttribute('src', source);
            jsElement.async = true;
            jsElement.setAttribute('async', 'async');

            jsElement.addEventListener('load', function() {
                o.loadJavaScript(sources, callback);
            }, false);

            if (typeof jsElement != 'undefined') {
                document.getElementsByTagName('head')[0].appendChild(jsElement);
            }
        },

        /*
         * Loads Image files
         */
        loadImage: function(sources, callback) {
            if (sources.length <= 0)
                return callback()

            var loaded = 0
            $.each(sources, function(index, source){
                var img = new Image()
                img.onload = function() {
                    if (++loaded == sources.length && callback)
                        callback()
                }
                img.src = source
            })
        }

    };

    return o;
};

window.assetManager = new AssetManager();

+function ($) { "use strict";
    if ($.oc === undefined)
        $.oc = {}

    if ($.oc.foundation === undefined)
        $.oc.foundation = {}

    $.oc.foundation._proxyCounter = 0

    var Base = function() {
        this.proxiedMethods = {}
    }

    Base.prototype.dispose = function() {
        for (var key in this.proxiedMethods) {
            this.proxiedMethods[key] = null
        }

        this.proxiedMethods = null
    }

    /*
     * Creates a proxied method reference or returns an existing proxied method.
     */
    Base.prototype.proxy = function(method) {
        if (method.ocProxyId === undefined) {
            $.oc.foundation._proxyCounter++
            method.ocProxyId = $.oc.foundation._proxyCounter
        }

        if (this.proxiedMethods[method.ocProxyId] !== undefined)
            return this.proxiedMethods[method.ocProxyId]

        this.proxiedMethods[method.ocProxyId] = method.bind(this)
        return this.proxiedMethods[method.ocProxyId]
    }

    $.oc.foundation.base = Base;
}(window.jQuery);
+function ($) { "use strict";
if ($.oc === undefined)
    $.oc = {}

if ($.oc.foundation === undefined)
    $.oc.foundation = {}

var Event = {
    /*
     * Returns the event target element.
     * If the second argument is provided (string), the function
     * will try to find the first parent with the tag name matching
     * the argument value.
     */
    getTarget: function(ev, tag) {
        var target = ev.target ? ev.target : ev.srcElement

        if (tag === undefined)
            return target

        var tagName = target.tagName

        while (tagName != tag) {
            target = target.parentNode

            if (!target)
                return null

            tagName = target.tagName
        }

        return target
    },

    stop: function(ev) {
        if (ev.stopPropagation)
            ev.stopPropagation()
        else
            ev.cancelBubble = true

        if(ev.preventDefault)
            ev.preventDefault()
        else
            ev.returnValue = false
    },

    pageCoordinates: function(ev) {
        if (ev.pageX || ev.pageY) {
            return {
                x: ev.pageX,
                y: ev.pageY
            }
        }
        else if (ev.clientX || ev.clientY) {
            return {
                x: (ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft),
                y: (ev.clientY + document.body.scrollTop + document.documentElement.scrollTop)
            }
        }

        return {
            x: 0,
            y: 0
        }
    }
}

$.oc.foundation.event = Event;
}(window.jQuery);
+function ($) { "use strict";
if ($.oc === undefined)
    $.oc = {}

if ($.oc.foundation === undefined)
    $.oc.foundation = {}

var Element = {
    hasClass: function(el, className) {
        if (el.classList)
            return el.classList.contains(className);
        
        return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
    },

    addClass: function(el, className) {
        var classes = className.split(' ')

        for (var i = 0, len = classes.length; i < len; i++) {
            var currentClass = classes[i].trim()

            if (this.hasClass(el, currentClass))
                return

            if (el.classList)
                el.classList.add(currentClass);
            else
                el.className += ' ' + currentClass;
        }
    },

    removeClass: function(el, className) {
        if (el.classList)
            el.classList.remove(className);
        else
            el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    },

    toggleClass: function(el, className, add) {
        if (add === undefined) {
            if (this.hasClass(el, className)) {
                this.removeClass(el, className)
            }
            else {
                this.addClass(el, className)
            }
        }

        if (add && !this.hasClass(el, className)) {
            this.addClass(el, className)
            return
        }

        if (!add && this.hasClass(el, className)) {
            this.removeClass(el, className)
            return
        }
    },

    /*
     * Returns element absolution position.
     * If the second parameter value is false, the scrolling
     * won't be added to the result (which could improve the performance).
     */
    absolutePosition: function(element, ignoreScrolling) {
        var top = ignoreScrolling === true ? 0 : document.body.scrollTop,
            left = 0

        do {
            top += element.offsetTop || 0;

            if (ignoreScrolling !== true)
                top -= element.scrollTop || 0

            left += element.offsetLeft || 0
            element = element.offsetParent
        } while(element)

        return {
            top: top,
            left: left
        }
    },

    getCaretPosition: function(input) {
        if (document.selection) { 
           var selection = document.selection.createRange()

           selection.moveStart('character', -input.value.length)
           return selection.text.length
        }

        if (input.selectionStart !== undefined)
           return input.selectionStart

        return 0
    },

    setCaretPosition: function(input, position) {
        if (document.selection) { 
            var range = input.createTextRange()

            setTimeout(function() {
                // Asynchronous layout update, better performance
                range.collapse(true)
                range.moveStart("character", position)
                range.moveEnd("character", 0)
                range.select()
                range = null
                input = null
            }, 0)
        }

        if (input.selectionStart !== undefined) {
            setTimeout(function() {
                // Asynchronous layout update
                input.selectionStart = position
                input.selectionEnd = position
                input = null
            }, 0)
        }
    },

    elementContainsPoint: function(element, point) {
        var elementPosition = $.oc.foundation.element.absolutePosition(element),
            elementRight = elementPosition.left + element.offsetWidth,
            elementBottom = elementPosition.top + element.offsetHeight

        return point.x >= elementPosition.left && point.x <= elementRight 
                && point.y >= elementPosition.top && point.y <= elementBottom
    }
}

$.oc.foundation.element = Element;
}(window.jQuery);
+function ($) { "use strict";
if ($.oc === undefined)
    $.oc = {}

if ($.oc.foundation === undefined)
    $.oc.foundation = {}

var ControlUtils = {
    markDisposable: function(el) {
        el.setAttribute('data-disposable', '')
    },

    /*
     * Destroys all disposable controls in a container.
     * The disposable controls should watch the dispose-control 
     * event.
     */
    disposeControls: function(container) {
        var controls = container.querySelectorAll('[data-disposable]')

        for (var i=0, len=controls.length; i<len; i++)
            $(controls[i]).triggerHandler('dispose-control')

        if (container.hasAttribute('data-disposable'))
            $(container).triggerHandler('dispose-control')
    }
}

$.oc.foundation.controlUtils = ControlUtils;

$(document).on('ajaxBeforeReplace', function(ev){
    // Automatically dispose controls in an element
    // before the element contents is replaced.
    // The ajaxBeforeReplace event is triggered in 
    // framework.js

    $.oc.foundation.controlUtils.disposeControls(ev.target)
})
}(window.jQuery);
/* ========================================================================
 * OctoberCMS: front-end JavaScript framework
 * http://octobercms.com
 * ========================================================================
 * Copyright 2016 Alexey Bobkov, Samuel Georges
 * ======================================================================== */

if (window.jQuery === undefined)
    throw new Error('The jQuery library is not loaded. The OctoberCMS framework cannot be initialized.');

+function ($) { "use strict";

    var Request = function (element, handler, options) {
        var $el = this.$el = $(element);
        this.options = options || {};
        /*
         * Validate handler name
         */

        if (handler == undefined)
            throw new Error('The request handler name is not specified.')

        if (!handler.match(/^(?:\w+\:{2})?on*/))
            throw new Error('Invalid handler name. The correct handler name format is: "onEvent".')

        /*
         * Custom function, requests confirmation from the user
         */

        function handleConfirmMessage(message) {
            var _event = jQuery.Event('ajaxConfirmMessage')

            _event.promise = $.Deferred()
            if ($(window).triggerHandler(_event, [message]) !== undefined) {
                _event.promise.done(function() {
                    options.confirm = null
                    new Request(element, handler, options)
                })
                return false
            }

            if (_event.isDefaultPrevented()) return
            if (message) return confirm(message)
        }

        /*
         * Initiate request
         */

        if (options.confirm && !handleConfirmMessage(options.confirm))
            return

        /*
         * Prepare the options and execute the request
         */

        var
            $form = $el.closest('form'),
            $triggerEl = !!$form.length ? $form : $el,
            context = { handler: handler, options: options },
            loading = options.loading !== undefined && options.loading.length ? $(options.loading) : null,
            isRedirect = options.redirect !== undefined && options.redirect.length

        var _event = jQuery.Event('oc.beforeRequest')
        $triggerEl.trigger(_event, context)
        if (_event.isDefaultPrevented()) return

        var data = [$form.serialize()]

        $.each($el.parents('[data-request-data]').toArray().reverse(), function extendRequest() {
            data.push($.param(paramToObj('data-request-data', $(this).data('request-data'))))
        })

        if ($el.is(':input') && !$form.length) {
            var inputName = $el.attr('name')
            if (inputName !== undefined && options.data[inputName] === undefined)
                options.data[inputName] = $el.val()
        }

        if (options.data !== undefined && !$.isEmptyObject(options.data))
            data.push($.param(options.data))

        var requestHeaders = {
            'X-EXIT-REQUEST-HANDLER': handler,
            'X-EXIT-REQUEST-PARTIALS': this.extractPartials(options.update)
        }

        if (options.flash !== undefined) {
            requestHeaders['X-EXIT-REQUEST-FLASH'] = 1
        }
        var x = new Date();
        var randomPrefix = window.location.href.indexOf('?') === -1 ? '?':'&';
        var requestOptions = {
            url: window.location.href + randomPrefix +'random='+[x.getDate(),x.getMonth(),x.getYear(),x.getMilliseconds(),Math.floor(Math.random()*1000)+1].join(''),
            context: context,
            headers: requestHeaders,
            success: function(data, textStatus, jqXHR) {
                /*
                 * Halt here if beforeUpdate() or data-request-before-update returns false
                 */
                if (this.options.beforeUpdate.apply(this, [data, textStatus, jqXHR]) === false) return
                if (options.evalBeforeUpdate && eval('(function($el, context, data, textStatus, jqXHR) {'+options.evalBeforeUpdate+'}.call($el.get(0), $el, context, data, textStatus, jqXHR))') === false) return

                /*
                 * Trigger 'ajaxBeforeUpdate' on the form, halt if event.preventDefault() is called
                 */
                var _event = jQuery.Event('ajaxBeforeUpdate')
                $triggerEl.trigger(_event, [context, data, textStatus, jqXHR])
                if (_event.isDefaultPrevented()) return

                /*
                 * Proceed with the update process
                 */
                var updatePromise = requestOptions.handleUpdateResponse(data, textStatus, jqXHR)

                updatePromise.done(function() {
                    $triggerEl.trigger('ajaxSuccess', [context, data, textStatus, jqXHR])
                    options.evalSuccess && eval('(function($el, context, data, textStatus, jqXHR) {'+options.evalSuccess+'}.call($el.get(0), $el, context, data, textStatus, jqXHR))')
                })

                return updatePromise
            },
            error: function(jqXHR, textStatus, errorThrown) {
                var errorMsg,
                    updatePromise = $.Deferred()

                if ((window.ocUnloading !== undefined && window.ocUnloading) || errorThrown == 'abort')
                    return

                /*
                 * Disable redirects
                 */
                isRedirect = false
                options.redirect = null

                /*
                 * Error 406 is a "smart error" that returns response object that is
                 * processed in the same fashion as a successful response.
                 */
                if (jqXHR.status == 406 && jqXHR.responseJSON) {
                    errorMsg = jqXHR.responseJSON['X_OCTOBER_ERROR_MESSAGE']
                    updatePromise = requestOptions.handleUpdateResponse(jqXHR.responseJSON, textStatus, jqXHR)
                }
                /*
                 * Standard error with standard response text
                 */
                else {
                    errorMsg = jqXHR.responseText ? jqXHR.responseText : jqXHR.statusText
                    updatePromise.resolve()
                }

                updatePromise.done(function() {
                    $el.data('error-message', errorMsg)

                    /*
                     * Trigger 'ajaxError' on the form, halt if event.preventDefault() is called
                     */
                    var _event = jQuery.Event('ajaxError')
                    $triggerEl.trigger(_event, [context, errorMsg, textStatus, jqXHR])
                    if (_event.isDefaultPrevented()) return

                    /*
                     * Halt here if the data-request-error attribute returns false
                     */
                    if (options.evalError && eval('(function($el, context, errorMsg, textStatus, jqXHR) {'+options.evalError+'}.call($el.get(0), $el, context, errorMsg, textStatus, jqXHR))') === false)
                        return

                    requestOptions.handleErrorMessage(errorMsg)
                })

                return updatePromise
            },
            complete: function(data, textStatus, jqXHR) {
                $triggerEl.trigger('ajaxComplete', [context, data, textStatus, jqXHR])
                options.evalComplete && eval('(function($el, context, data, textStatus, jqXHR) {'+options.evalComplete+'}.call($el.get(0), $el, context, data, textStatus, jqXHR))')
            },

            /*
             * Custom function, display an error message to the user
             */
            handleErrorMessage: function(message) {
                var _event = jQuery.Event('ajaxErrorMessage')
                $(window).trigger(_event, [message])
                if (_event.isDefaultPrevented()) return
                if (message) alert(message)
            },

            /*
             * Custom function, handle any application specific response values
             * Using a promisary object here in case injected assets need time to load
             */
            handleUpdateResponse: function(data, textStatus, jqXHR) {
                /*
                 * Update partials and finish request
                 */
                var updatePromise = $.Deferred().done(function() {
                    for (var partial in data) {
                        /*
                         * If a partial has been supplied on the client side that matches the server supplied key, look up
                         * it's selector and use that. If not, we assume it is an explicit selector reference.
                         */
                        var selector = (options.update[partial]) ? options.update[partial] : partial
                        if (jQuery.type(selector) == 'string' && selector.charAt(0) == '@') {
                            $(selector.substring(1)).append(data[partial]).trigger('ajaxUpdate', [context, data, textStatus, jqXHR])
                        } else if (jQuery.type(selector) == 'string' && selector.charAt(0) == '^') {
                            $(selector.substring(1)).prepend(data[partial]).trigger('ajaxUpdate', [context, data, textStatus, jqXHR])
                        } else {
                            $(selector).trigger('ajaxBeforeReplace')
                            $(selector).html(data[partial]).trigger('ajaxUpdate', [context, data, textStatus, jqXHR])
                        }
                    }

                    /*
                     * Wait for .html() method to finish rendering from partial updates
                     */
                    setTimeout(function() {
                        $(window)
                            .trigger('ajaxUpdateComplete', [context, data, textStatus, jqXHR])
                            .trigger('resize')
                    }, 0)
                })

                /*
                 * Handle redirect
                 */
                if (data['X_OCTOBER_REDIRECT']) {
                    options.redirect = data['X_OCTOBER_REDIRECT']
                    isRedirect = true
                }

                if (isRedirect)
                    window.location.href = options.redirect

                /*
                 * Focus fields with errors
                 */
                if (data['X_OCTOBER_ERROR_FIELDS']) {
                    $triggerEl.trigger('ajaxValidation', [context, data['X_OCTOBER_ERROR_MESSAGE'], data['X_OCTOBER_ERROR_FIELDS']])

                    var isFirstInvalidField = true
                    $.each(data['X_OCTOBER_ERROR_FIELDS'], function focusErrorField(fieldName, fieldMessages) {
                        var fieldElement = $form.find('[name="'+fieldName+'"], [name="'+fieldName+'[]"], [name$="['+fieldName+']"], [name$="['+fieldName+'][]"]').filter(':enabled').first()
                        if (fieldElement.length > 0) {

                            var _event = jQuery.Event('ajaxInvalidField')
                            $(window).trigger(_event, [fieldElement.get(0), fieldName, fieldMessages, isFirstInvalidField])

                            if (isFirstInvalidField) {
                                if (!_event.isDefaultPrevented()) fieldElement.focus()
                                isFirstInvalidField = false
                            }
                        }
                    })
                }

                /*
                 * Handle asset injection
                 */
                 if (data['X_OCTOBER_ASSETS']) {
                    window.assetManager.load(data['X_OCTOBER_ASSETS'], $.proxy(updatePromise.resolve, updatePromise))
                 }
                 else {
                    updatePromise.resolve()
                }

                return updatePromise
            }
        }

        /*
         * Allow default business logic to be called from user functions
         */
        context.success = requestOptions.success
        context.error = requestOptions.error
        context.complete = requestOptions.complete
        requestOptions = $.extend(requestOptions, options)

        requestOptions.data = data.join('&');

        if (loading) loading.show()

        $(window).trigger('ajaxBeforeSend', [context])
        $el.trigger('ajaxPromise', [context])
        return $.ajax(requestOptions)
            .fail(function(jqXHR, textStatus, errorThrown) {
                if (!isRedirect) {
                    $el.trigger('ajaxFail', [context, textStatus, jqXHR])
                    if (loading) loading.hide()
                }
            })
            .done(function(data, textStatus, jqXHR) {
                if (!isRedirect) {
                    $el.trigger('ajaxDone', [context, data, textStatus, jqXHR])
                    if (loading) loading.hide()
                }
            })
            .always(function(dataOrXhr, textStatus, xhrOrError) {
                $el.trigger('ajaxAlways', [context, dataOrXhr, textStatus, xhrOrError])
            })
    }

    Request.DEFAULTS = {
        update: {},
        type : 'POST',
        beforeUpdate: function(data, textStatus, jqXHR) {},
        evalBeforeUpdate: null,
        evalSuccess: null,
        evalError: null,
        evalComplete: null,
    }

    /*
     * Internal function, build a string of partials and their update elements.
     */
    Request.prototype.extractPartials = function(update) {
        var result = []
        for (var partial in update)
            result.push(partial)

        return result.join('&')
    }

    // REQUEST PLUGIN DEFINITION
    // ============================

    var old = $.fn.request

    $.fn.request = function(handler, option) {
        var args = arguments

        var $this = $(this).first()
        var data  = {
            evalBeforeUpdate: $this.data('request-before-update'),
            evalSuccess: $this.data('request-success'),
            evalError: $this.data('request-error'),
            evalComplete: $this.data('request-complete'),
            confirm: $this.data('request-confirm'),
            redirect: $this.data('request-redirect'),
            loading: $this.data('request-loading'),
            flash: $this.data('request-flash'),
            update: paramToObj('data-request-update', $this.data('request-update')),
            data: paramToObj('data-request-data', $this.data('request-data'))
        }
        if (!handler) handler = $this.data('request')
        var options = $.extend(true, {}, Request.DEFAULTS, data, typeof option == 'object' && option)
        return new Request($this, handler, options)
    }

    $.fn.request.Constructor = Request

    $.request = function(handler, option) {
        return $('<form />').request(handler, option)
    }

    // REQUEST NO CONFLICT
    // =================

    $.fn.request.noConflict = function() {
        $.fn.request = old
        return this
    }

    // REQUEST DATA-API
    // ==============

    function paramToObj(name, value) {
        if (value === undefined) value = ''
        if (typeof value == 'object') return value

        try {
            return JSON.parse(JSON.stringify(eval("({" + value + "})")))
        }
        catch (e) {
            throw new Error('Error parsing the '+name+' attribute value. '+e)
        }
    }

    $(document).on('change', 'select[data-request], input[type=radio][data-request], input[type=checkbox][data-request]', function documentOnChange() {
        $(this).request()
    })

    $(document).on('click', 'a[data-request], button[data-request], input[type=button][data-request], input[type=submit][data-request]', function documentOnClick(e) {
        e.preventDefault()

        $(this).request()

        if ($(this).is('[type=submit]'))
            return false
    })

    $(document).on('keydown', 'input[type=text][data-request], input[type=submit][data-request], input[type=password][data-request]', function documentOnKeydown(e) {
        if (e.keyCode == 13) {
            if (this.dataTrackInputTimer !== undefined)
                window.clearTimeout(this.dataTrackInputTimer)

            $(this).request()
            return false
        }
    })

    $(document).on('keyup', 'input[data-request][data-track-input]', function documentOnKeyup(e) {
        var
            $el = $(this),
            lastValue = $el.data('oc.lastvalue')

        if (!$el.is('[type=email],[type=number],[type=password],[type=search],[type=text]'))
            return

        if (lastValue !== undefined && lastValue == this.value)
            return

        $el.data('oc.lastvalue', this.value)

        if (this.dataTrackInputTimer !== undefined)
            window.clearTimeout(this.dataTrackInputTimer)

        var interval = $(this).data('track-input')
        if (!interval)
            interval = 300

        var self = this
        this.dataTrackInputTimer = window.setTimeout(function() {
            $(self).request()
        }, interval)
    })

    $(document).on('submit', '[data-request]', function documentOnSubmit() {
        $(this).request()
        return false
    })

    $(window).on('beforeunload', function documentOnBeforeUnload() {
        window.ocUnloading = true
    })

    /*
     * Invent our own event that unifies document.ready with window.ajaxUpdateComplete
     *
     * $(document).render(function() { })
     * $(document).on('render', function() { })
     */

    $(document).ready(function triggerRenderOnReady() {
        $(document).trigger('render')
    })

    $(window).on('ajaxUpdateComplete', function triggerRenderOnAjaxUpdateComplete() {
        $(document).trigger('render')
    })

    $.fn.render = function(callback) {
        $(document).on('render', callback)
    }

}(window.jQuery);
