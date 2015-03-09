define(
    ['jquery', 'local/jquery-thr-deb'],
    function($) {

        var delta = {
                38: 'top',
                40: 'bottom',
                37: 'left',
                39: 'right'
            },
            __elem = 'control';

        /**
         * @constructor
         */
        function kkontroller(items) {

            this.domElem = $('<div>');
            this.setItems(items);

            $(document).on('keydown', $.throttle(this._onKeyDown, 100, this));

        };

        $.extend(kkontroller.prototype, {

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

            _onKeyDown: function(e) {
                var key = (e || window.event).keyCode;

                [37,38,39,40].indexOf(key) > -1 && this.move(delta[key]);
            },

            move: function(direction) {
                if(!direction) {
                    console.log('Please, specify the direction');
                    return false;
                }

                var nextItem = this.getNearElement(direction);

                // найден элемент, на который можно переместиться
                // в заданном направлении
                if(nextItem) {
                    this
                        .setActive(nextItem)
                        .domElem.trigger('move', {
                            direction: direction,
                            elem: this.item
                        });
                }
            },

            setItems: function(items, activeElem) {
                this.items = items;
                this.setActive(activeElem || items.eq(0));

                console.log('new items', items);
            },

            setActive: function(elem) {
                if(elem) {
                    var _active = __elem+'_active';
                    // переключаем активный элемент
                    this.item && this.item.removeClass(_active);
                    this.item = elem.addClass(_active).focus();
                }
                return this;
            },

            // нахождение ближайшего элемента в заданном направлении
            getNearElement: function(direction) {
                var activeOffset = this._getMetrics(this.item),
                    // выбираем алгоритм поиска
                    filter = this.__filter[direction].bind(this, activeOffset),
                    // ищем...
                    nearElems = this._getOffsets().filter(filter),
                    result;

                    switch(nearElems.length) {
                        case 1:
                            result = nearElems[0].elem;
                        break;
                        default:
                            var sortedList = nearElems
                                // сортируем по отдалённости
                                .sort(this.__sort.bind(this, direction));
                            result = sortedList.length && sortedList.shift(1).elem;
                        break;
                    }

                // TODO: если не найден по заданному направлению –
                // поискать по ассоциативному (left==top, right==bottom)
                return result;
            },

            // получение данных о позиционировании заданных элементов
            _getOffsets: function() {
                return Array.prototype.slice.call(this.items)
                    .map(function(_elem) {
                        var elem = $(_elem);

                        return $.extend(
                            { elem: elem },
                            this._getMetrics(elem)
                        );
                    }.bind(this));
            },

            // получение оффсетов заданного элемента
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

        return kkontroller;
    }
);
