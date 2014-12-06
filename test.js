require("joii");
require("./dist/joii-unit.js");

var unit = new JOII.Unit({
    verbose      : true,
    dependencies : ['test/dep.js'],
    tests        : [
        'test/SimpleTest.js'
    ]
});
