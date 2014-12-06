# JOII-unit

Development version. Not suitable for production use at this time.

Requires JOII & NodeJS to run.


```javascript
// test.js
require("joii");
require("./dist/joii-unit.js");

var unit = new JOII.Unit({
    verbose      : true,
    dependencies : ['test/dep.js'],
    tests        : [
        'test/SimpleTest.js'
    ]
});
```

```javascript
// test/SimpleTest.js

JOII.Unit.TestCase('SimpleTest', {

    testSimpleAssertions : function()
    {
        this.assertEqual(1, true, 'true is non-strictly equal to 1');
        this.assertNotEqualStrict(1, true, 'true is strictly not equal to 1');
    },

    testSimpleBooleans : function()
    {
        this.assertTrue(true, 'This is true.');
        this.assertFalse(false, 'This is false.');
    },

    /**
     * @expectedException "I must be thrown in the next test."
     */
    testExceptionThrowing : function()
    {
        throw new Error('I must be thrown in the next test.');
    },

    /**
     * @dataProvider "dataProvider"
     */
    testDataProvider: function(bool, int, str)
    {
        this.assertTrue(typeof bool === 'boolean', 'bool is a boolean');
        this.assertTrue(typeof int === 'number', 'int is a number');
        this.assertTrue(typeof str === 'string', 'str is a string');
    },

    'public dataProvider' : function() {
        return [
            [true, 2, 'foo'],
            [false, 155, 'bar'],
            [true, 12345, 'I am a string'],
            [false, 'I am not a number', 'Hello World']
        ];
    }
});
```

![alt text](http://joii.harold.info/joii-unit.jpg "Result of the code above.")
