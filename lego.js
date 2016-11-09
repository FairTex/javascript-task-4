'use strict';

exports.isStar = true;

var ASC = 'asc';

exports.query = function (collection) {
    var functions = [].slice.call(arguments, 1);
    functions.sort(sortByPriority);

    return functions.reduce(function (filteredCollection, func) {
        return func(filteredCollection);
    }, fullCopy(collection));
};

function sortByPriority(f1, f2) {
    var priority = ['or', 'and', 'filterIn', 'sortBy', 'select', 'format', 'limit'];

    return priority.indexOf(f1.name) > priority.indexOf(f2.name);
}

function fullCopy(arr) {

    return arr.reduce(function (copyArr, current) {
        return copyArr.concat([Object.keys(current).reduce(function (obj, key) {
            obj[key] = current[key];

            return obj;
        }, {})]);
    }, []);
}

exports.select = function () {
    var fields = [].slice.call(arguments);

    return function select(collection) {

        return collection.reduce(function (filteredCollection, entry) {
            return filteredCollection.concat([Object.keys(entry).reduce(function (obj, key) {
                if (fields.indexOf(key) !== -1) {
                    obj[key] = entry[key];
                }

                return obj;
            }, {})]);
        }, []);
    };
};

exports.filterIn = function (property, values) {

    return function filterIn(collection) {

        return collection.filter(function (entry) {
            return values.indexOf(entry[property]) !== -1;
        });
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

        return collection.map(function (entry) {
            if (entry.hasOwnProperty(property)) {
                entry[property] = formatter(entry[property]);
            }

            return entry;
        });
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

            return functions.reduce(function (filteredCollection, func) {
                return func(filteredCollection);
            }, collection);
        };
    };
}
