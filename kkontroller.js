$(function() {

    var delta = {
            38: 'top',
            40: 'bottom',
            37: 'left',
            39: 'right'
        };

    /**
     * @constructor
     */
    function kkontroller() {

        this.domElem = $('<div>');
        this.setCurrent(this.getActive());

        $(document).on('keydown', this._onKeyDown.bind(this));

    };

    $.extend(kkontroller.prototype, {

        __elem: 'control',

        __filter: {
            left: function(active, next) {
                return next.x <= active.left &&
                    next.y >= active.top &&
                    next.y <= active.bottom;
            },
            right: function(active, next) {
                return next.x >= active.right &&
                    next.y >= active.top &&
                    next.y <= active.bottom;
            },
            top: function(active, next) {
                return next.y <= active.top &&
                    next.x >= active.left &&
                    next.x <= active.right;
            },
            bottom: function(active, next) {
                return next.y >= active.bottom &&
                    next.x >= active.left &&
                    next.x <= active.right;
            }
        },

        __sort: function(direction, a, b) {
            switch(direction) {
                case 'left':
                    return b.left - a.left;
                break
                case 'right':
                    return a.right - b.right;
                break;
                case 'top':
                    return b.top - a.top;
                break;
                case 'bottom':
                    return a.bottom - b.bottom;
                break;
            }
        },

        _lastDirection: '',

        _onKeyDown: function(e) {
            var key = (e || window.event).keyCode;

            switch(key) {
                // Enter
                case 13:
                    this._onContainerChange('in');
                break;
                // Backspace
                case 8:
                    this._onContainerChange('out');
                    e.preventDefault();
                break;

                case 37:
                case 38:
                case 39:
                case 40:
                    this.move(delta[key]);
                break;
            }
        },

        _onContainerChange: function(direction) {
            this
                .setCurrent(direction)
                .domElem.trigger('out', { elem: this.item });
        },

        move: function(direction) {
            if(!direction) {
                console.log('Please, specify the direction');
                return false;
            }

            var nextItem = this.getNextElement(direction);

            // если найден элемент, на который можно
            // переместиться в заданном направлении
            if(nextItem) {
                this
                    .setCurrent(nextItem)
                    .domElem.trigger('move', {
                        direction: direction,
                        elem: this.item
                    });
            }
        },

        setCurrent: function(elem) {
            var _active = this.__elem + '_active',
                newItem;

            if(typeof elem === 'object') {
                newItem = elem;
            } else {
                var where = elem === 'in' ? 'children' : 'parent',
                    finded = this.item[where]('.' + this.__elem).eq(0);

                if(finded.length) {
                    newItem = finded;
                }
            }

            // переключаем активный элемент
            if(newItem) {
                this.item && this.item.removeClass(_active);
                this.item = newItem.addClass(_active);
            }

            return this;
        },

        getActive: function() {
            return $('.' + this.__elem + '_active');
        },

        getNextElement: function(direction) {
            var activeOffset = this._getMetrics(this.item),
                filter = this.__filter[direction].bind(this, activeOffset),
                nearElems = this._getOffsets().filter(filter);

            // TODO: если не найден по заданному направлению –
            // поискать по ассоциативному (left-top, right-bottom)
            return nearElems.length &&
                nearElems.sort(this.__sort.bind(this, direction)).shift(1).elem;
        },

        _getOffsets: function() {
            var that = this,
                selector = '.'+this.__elem+':not(.'+this.__elem+'_active)',
                items = this.item.parent('.'+this.__elem).children(selector);

            return Array.prototype.slice.call(items).map(function(_elem) {
                var elem = $(_elem);

                return $.extend(
                    { elem: elem },
                    that._getMetrics(elem)
                );
            });
        },

        _getMetrics: function(elem) {
            var offset = elem.offset(),
                h = elem.height(),
                w = elem.width(),
                data = {
                    left: Math.round(offset.left),
                    right: Math.round(offset.left + w),
                    top: Math.round(offset.top),
                    bottom: Math.round(offset.top + h)
                };

            data.x = data.left + w/2;
            data.y = data.top + h/2;

            return data;
        }

    });

    window.kkontroller = kkontroller;

});
