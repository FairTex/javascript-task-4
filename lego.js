'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

var SELECTED_FIELDS;

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    var filterCollection = fullCopy(collection);

    var functions = [].slice.call(arguments, 1);
    functions.sort(sortByPriority);
    for (var i = 0; i < functions.length; i++) {
        filterCollection = functions[i](filterCollection);
    }

    SELECTED_FIELDS = undefined;

    return filterCollection;
};

function sortByPriority(f1, f2) {
    var priority = ['or', 'and', 'filterIn', 'sortBy', 'select', 'format', 'limit'];

    return priority.indexOf(f1.name) > priority.indexOf(f2.name);
}

function fullCopy(arr) {
    var copy = [];

    arr.forEach(function (obj) {
        var keys = Object.keys(obj);
        var copyObj = {};
        keys.forEach(function (key) {
            copyObj[key] = obj[key];
        });
        copy.push(copyObj);
    });

    return copy;
}

function intersec(arr1, arr2) {
    var idx = 0;
    var arr3 = [];

    for (var i = 0; i < arr2.length; i++) {
        idx = arr1.indexOf(arr2[i]);
        if (idx >= 0) {
            arr3.push(arr2[i]);
        }
    }

    return arr3;
}

exports.select = function () {
    var fields = [].slice.call(arguments);
    if (!SELECTED_FIELDS) {
        SELECTED_FIELDS = fields;
    } else {
        SELECTED_FIELDS = intersec(SELECTED_FIELDS, fields);
    }

    var select = function (collection) {
        collection.map(function (entry) {
            var keys = Object.keys(entry);
            keys.forEach(function (key) {
                if (SELECTED_FIELDS.indexOf(key) === -1) {
                    if (entry.hasOwnProperty(key)) {
                        delete entry[key];
                    }
                }
            });

            return entry;
        });

        return collection;
    };

    return select;
};

exports.filterIn = function (property, values) {
    var filterIn = function (collection) {
        collection = collection.filter(function (entry) {
            if (entry.hasOwnProperty(property)) {

                return values.indexOf(entry[property]) !== -1;
            }

            return 0;
        });

        return collection;
    };

    return filterIn;
};

exports.sortBy = function (property, order) {
    var sortBy = function (collection) {
        collection.sort(function (el1, el2) {
            if (order === 'asc') {

                return el1[property] > el2[property];
            } else if (order === 'desc') {

                return el1[property] < el2[property];
            }

            return 1;
        });

        return collection;
    };

    return sortBy;
};

exports.format = function (property, formatter) {
    var format = function (collection) {
        collection = collection.map(function (entry) {
            if (entry.hasOwnProperty(property)) {
                entry[property] = formatter(entry[property]);
            }

            return entry;
        });

        return collection;
    };

    return format;
};

exports.limit = function (count) {
    var limit = function (collection) {

        return collection.slice(0, count);
    };

    return limit;
};

if (exports.isStar) {

    exports.or = function () {
        var functions = [].slice.call(arguments, 0);

        var or = function (collection) {
            collection = fullCopy(collection);
            var result = [];
            for (var i = 0; i < functions.length; i++) {
                result = result.concat(functions[i](collection));
            }

            return result;
        };

        return or;
    };

    exports.and = function () {
        var functions = [].slice.call(arguments);

        var and = function (collection) {
            var filterCollection = fullCopy(collection);
            for (var i = 0; i < functions.length; i++) {
                filterCollection = functions[i](filterCollection);
            }

            return filterCollection;
        };

        return and;
    };
}
