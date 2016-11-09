'use strict';

exports.isStar = true;

var ASC = 'asc';
// var SELECTED_FIELDS;

exports.query = function (collection) {
    var filterCollection = fullCopy(collection);

    var functions = [].slice.call(arguments, 1);
    functions.sort(sortByPriority);

    filterCollection = functions.reduce(function (acc, func) {
        return func(acc);
    }, filterCollection);

    // SELECTED_FIELDS = undefined;

    return filterCollection;
};

function sortByPriority(f1, f2) {
    var priority = ['or', 'and', 'filterIn', 'sortBy', 'select', 'format', 'limit'];

    return priority.indexOf(f1.name) > priority.indexOf(f2.name);
}

function fullCopy(arr) {

    return arr.reduce(function (copyArr, current) {
        copyArr.push(Object.keys(current).reduce(function (obj, key) {
            obj[key] = current[key];

            return obj;
        }, {}));

        return copyArr;
    }, []);
}

/*

function intersec(arr1, arr2) {

    return arr2.filter(function (elem) {

        return arr1.indexOf(elem) !== -1;
    });
}
*/

exports.select = function () {
    var fields = [].slice.call(arguments);

    /*
    if (!SELECTED_FIELDS) {
        SELECTED_FIELDS = fields;
    } else {
        SELECTED_FIELDS = intersec(SELECTED_FIELDS, fields);
    }
    */

    return function select(collection) {
        var newCollection = [];

        collection.forEach(function (entry) {
            var obj = {};
            var keys = Object.keys(entry);
            keys.forEach(function (key) {
                if (fields.indexOf(key) !== -1) {
                    obj[key] = entry[key];
                }
            });

            newCollection.push(obj);
        });

        return newCollection;
    };
};

exports.filterIn = function (property, values) {

    return function filterIn(collection) {
        collection = collection.filter(function (entry) {

            return values.indexOf(entry[property]) !== -1;
        });

        return collection;
    };
};

exports.sortBy = function (property, order) {

    return function sortBy(collection) {
        collection.sort(function (el1, el2) {

            return order === ASC
                ? el1[property] > el2[property]
                : el1[property] < el2[property];
        });

        return collection;
    };
};

exports.format = function (property, formatter) {

    return function format(collection) {
        collection = collection.map(function (entry) {
            if (entry.hasOwnProperty(property)) {
                entry[property] = formatter(entry[property]);
            }

            return entry;
        });

        return collection;
    };
};

exports.limit = function (count) {

    return function limit(collection) {

        return collection.slice(0, count);
    };
};

if (exports.isStar) {

    exports.or = function () {
        var functions = [].slice.call(arguments, 0);

        return function or(collection) {
            // var filterCollection = fullCopy(collection);

            return collection.filter(function (entry) {
                return functions.some(function (func) {
                    return func([entry]).length > 0;
                });
            });
        };
    };

    exports.and = function () {
        var functions = [].slice.call(arguments);

        return function and(collection) {
            var filterCollection = fullCopy(collection);

            /*
            functions.forEach(function (func) {
                filterCollection = func(filterCollection);
            });
            */

            filterCollection = functions.reduce(function (acc, func) {
                return func(acc);
            }, filterCollection);

            return filterCollection;
        };
    };
}
