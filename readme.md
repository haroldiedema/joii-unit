# JOII-unit

Development version. Not suitable for production use at this time.

Requires JOII & NodeJS to run.


```javascript
require("joii");
require("./dist/joii-unit.js");

var unit = new JOII.Unit({
    verbose: true,
    dependencies: [
        'test/dep.js'
    ],
    tests : [
        'test/OneTest.js',
        'test/TwoTest.js'
    ]
});
```


```javascript
// test/OneTest.js


```