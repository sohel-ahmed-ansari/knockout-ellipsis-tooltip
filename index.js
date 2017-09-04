//binding for showing tooltip only when the element text has ellipsis
(function( factory ) {
	"use strict";

	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'knockout', 'mario'], function ( $ ) {
			return factory( $, ko, mario);
		} );
	}
	else if ( typeof exports === 'object' ) {
		// CommonJS
		module.exports = function () {
            var jq = $;
            if(!jq) {
                jq = require('jquery');
            }
            var ko = require('knockout'),
                mario = require('mario');

			return factory( jq, ko, mario );
		};
	}
	else {
        // Browser
        if(!ko || !mario || !jQuery) {
            throw new Error('Dependencies not found. [jQuery, ko, mario] required as global variables if not using AMD');
        }
		factory( jQuery, ko, mario);
	}
}
(function ($, ko, mario) {
    ko.bindingHandlers.ellipsisTooltip = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var text = allBindingsAccessor().text,
                value = valueAccessor(),
                $element = $(element);

            if (value && isEllipsisPresent(element)) {
                $element.attr('title', $element.text());
            } else {
                $element.removeAttr('title');
            }

            //Make sure ellipsisTooltip is applied after text binding is updated in case its an observable
            if (ko.isObservable(text)) {
                text.subscribe(function (newValue) {
                    $element.ellipsisTooltip();
                    $element.trigger('ellipsisTooltip:updated');
                });
            }
        },
        update: function (element, valueAccessor) {
            var value = valueAccessor(),
                $element = $(element);

            if (value && isEllipsisPresent(element)) {
                $element.attr('title', $element.text());
            } else {
                $element.removeAttr('title');
            }
        }
    };

    function isEllipsisPresent(element) {
        if (mario.chrome || mario.safari) {
            return (element.offsetWidth < element.scrollWidth);
        }
        // In IE and FF in some cases element.offsetWidth and element.scrollWidth are same even though there is ellipsis.
        // So we make a clone div with same text and width = 'auto' and compare its width
        var $element = $(element),
            isEllipsisPresent = false,
            clone = document.createElement('div'),
            $clone = $(clone).text($element.text());

        clone.style.cssText = getComputedStyleCssText(element);
        $clone
            .css({
                position: 'absolute',
                top: '0px',
                left: '0px',
                visibility: 'hidden',
                width: 'auto'})
            .appendTo('body');

        if ($clone.width() > $element.width()) {
            isEllipsisPresent = true;
        }
        $clone.remove();

        return isEllipsisPresent;
    }

    function getComputedStyleCssText(element) {
        var style = window.getComputedStyle(element), cssText;

        if (style.cssText !== '') {
            return style.cssText;
        }

        cssText = '';
        for (var i = 0; i < style.length; i++) {
            cssText += style[i] + ': ' + style.getPropertyValue(style[i]) + '; ';
        }

        return cssText;
    }
}));

