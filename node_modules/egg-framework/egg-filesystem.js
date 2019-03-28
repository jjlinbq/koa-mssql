'use strict';

function filesystem() {

}

filesystem.prototype.append = function (file, create_if_not_exists) {

    var can_create = false;

    if (typeof create_if_not_exists === boolean) {
        can_create = create_if_not_exists;
    }

};

module.exports = new filesystem;