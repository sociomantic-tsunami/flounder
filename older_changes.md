Older changes
=============

This is truncated from the readme file to keep down the size


0.2.4
-----

+ updated default defaults
+ added better error message for 0 length targets
+ now allows for native selection by letter
+ flounder leaves references to itself on .flounder and the original target
+ destroy cleans up references
+ selection after a search clears the search field
+ defaults are correctly determined inside header based flounders
+ removeClass fix
+ search opens properly with keypresses
+ hidden search options no longer appear on keypress
+ search input now clears on up/down navigation
+ space in a search field no longer closes the field
+ selected field gets out of the way on search


0.2.3
-----

+ simplified how keypresses are handled
+ fixed first keypress bug (#23)
+ updated examples and example pics
+ updated default css
+ added additional package keywords
+ updates to readme
+ fixed a bug based on select tags NOT being arrays
+ fixed a bug that stopped data from being passed from the config object
+ brought back _slice and the constructor position


0.2.2
-----

+ improvements in defaults
+ react improvements
+ debug mode added to demo page
+ added better aria support
+ programmatically setting value or index no longer triggers onSelect
+ changed rebuildOptions to rebuildSelect for clarity
+ changed this.options to this.data for clarity
+ added the ability to build sections with headers
+ refactored some build functions


0.2.1
-----

+ added setValue to API
+ added disable classes to the css
+ internal fixes
+ added hasClass
+ changed setValueClick
+ added disable to API
+ added classes config object
+ broke up the main flounder file
+ readme updates


0.2.0
-----

+ user callbacks now keep their name internally for dynamic changes
+ some users callback now give the array of selected values (see examples)
+ _default is now defaultValue
+ the constructor now accepts µ and $ objects and returns an array of flounders
+ a call to the constructor without and arguments now returns the constructor
+ added getSelectedValues() to API
+ added the ability to give options unique classes
+ added wrapper to the class options
+ changed the flounder class option from container to flounder
+ restructured folders and files


0.1.5
-----

+ added rebuildOption and getOptions
+ added dynamic options
+ added getSelected
+ fixes in keypress handlers
+ added support for AMD loaders
+ added a jquery plugin wrapper
+ added a microbe plugin wrapper
+ fixed multi-select with dynamic options


0.1.4
-----

+ flounder now detroys itself properly


0.1.3
-----

+ fresh opening a menu now scrolls to selected (non-multiple)
+ events in setValue are now normalized


0.1.0
-----

+ all callback functions all start with `on` for clarity (`init` becomes `onInit`)