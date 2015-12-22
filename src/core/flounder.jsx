
/* jshint globalstrict: true */
'use strict';

import defaultOptions   from './defaults';
import classes          from './classes';
import utils            from './utils';
import api              from './api';

const nativeSlice = Array.prototype.slice;

class Flounder
{
    /**
     * ## addOptionDescription
     *
     * adds a description to the option
     *
     * @param {DOMElement} el option leement to add description to
     * @param {String} text description
     *
     * @return _Void_
     */
    addOptionDescription( el, text )
    {
        let div         = document.createElement( 'div' );
        div.innerHTML   = text;
        div.className   = classes.DESCRIPTION;
        el.appendChild( div );
    }


    /**
     * ## addOptionsListeners
     *
     * adds listeners to the options
     *
     * @return _Void_
     */
    addOptionsListeners()
    {
        this.refs.data.forEach( ( dataObj, i ) =>
        {
            if ( dataObj.tagName === 'DIV' )
            {
                dataObj.addEventListener( 'click', this.clickSet );
            }
        } );
    }


    /**
     * ## addSearch
     *
     * checks if a search box is required and attaches it or not
     *
     * @param {Object} flounder main element reference
     *
     * @return _Mixed_ search node or false
     */
    addSearch( flounder )
    {
        if ( this.props.search )
        {
            let search = this.constructElement( {
                                    tagname     : 'input',
                                    type        : 'text',
                                    className   : classes.SEARCH
                                } );
            flounder.appendChild( search );

            return search;
        }

        return false;
    };


    /**
     * ## addSelectKeyListener
     *
     * adds a listener to the selectbox to allow for seeking through the native
     * selectbox on keypress
     *
     * @return _Void_
     */
    addSelectKeyListener()
    {
        let select = this.refs.select;
        select.addEventListener( 'keyup', this.setSelectValue );
        select.addEventListener( 'keydown', this.setKeypress );
        select.focus();
    }


    /**
     * ## arrayOfFlounders
     *
     * called when a jquery object, microbe, or array is fed into flounder
     * as a target
     *
     * @param {DOMElement} target flounder mount point
     * @param {Object} props passed options
     *
     * @return {Array} array of flounders
     */
    arrayOfFlounders( targets, props )
    {
        targets = nativeSlice.call( targets );

        return targets.map( ( el, i ) => new this.constructor( el, props ) );
    }


    /**
     * ## bindThis
     *
     * binds this to whatever functions need it.  Arrow functions cannot be used
     * here due to the react extension needing them as well;
     *
     * @return _Void_
     */
    bindThis()
    {
        this.addClass               = this.addClass.bind( this );
        this.attachAttributes       = this.attachAttributes.bind( this );
        this.catchBodyClick         = this.catchBodyClick.bind( this );
        this.checkClickTarget       = this.checkClickTarget.bind( this );
        this.checkFlounderKeypress  = this.checkFlounderKeypress.bind( this );
        this.checkPlaceholder       = this.checkPlaceholder.bind( this );
        this.clickSet               = this.clickSet.bind( this );
        this.displayMultipleTags    = this.displayMultipleTags.bind( this );
        this.fuzzySearch            = this.fuzzySearch.bind( this );
        this.removeMultiTag         = this.removeMultiTag.bind( this );
        this.setIndex               = this.setIndex.bind( this );
        this.setKeypress            = this.setKeypress.bind( this );
        this.setSelectValue         = this.setSelectValue.bind( this );
        this.setValue               = this.setValue.bind( this );
        this.toggleClass            = this.toggleClass.bind( this );
        this.toggleList             = this.toggleList.bind( this );
    }


    /**
     * ## buildDom
     *
     * builds flounder
     *
     * @return _Void_
     */
    buildDom()
    {
        this.refs               = {};

        let constructElement    = this.constructElement;

        let wrapperClass        = classes.MAIN_WRAPPER;
        let wrapper             = this.constructElement( { className : this.wrapperClass ?
                                    wrapperClass + ' ' + this.wrapperClass : wrapperClass } );
        let flounderClass       = classes.MAIN;
        let flounder            = constructElement( { className : this.flounderClass ?
                                    flounderClass + '  ' + this.flounderClass : flounderClass } );

        flounder.setAttribute( 'aria-hidden', true );
        flounder.tabIndex       = 0;
        wrapper.appendChild( flounder );

        let select              = this.initSelectBox( wrapper );
        select.tabIndex         = -1;

        if ( this.multiple === true )
        {
            select.setAttribute( 'multiple', '' );
        }

        let data                = this.data;

        let defaultValue        = this._default = this.setDefaultOption( this.props, data );

        let selected            = constructElement( { className : classes.SELECTED_DISPLAYED,
                                        'data-value' : defaultValue.value, 'data-index' : defaultValue.index || -1  } );
            selected.innerHTML  = defaultValue.text;

        let multiTagWrapper     = this.props.multiple ? constructElement( { className : classes.MULTI_TAG_LIST } ) : null;

        if ( multiTagWrapper )
        {
            multiTagWrapper.style.textIndent = this.defaultTextIndent + 'px';
        }

        let arrow               = constructElement( { className : classes.ARROW } );
        let optionsListWrapper  = constructElement( { className : classes.OPTIONS_WRAPPER + '  ' + classes.HIDDEN } );
        let optionsList         = constructElement( { className : classes.LIST } );
        optionsListWrapper.appendChild( optionsList );

        [ selected, multiTagWrapper, arrow, optionsListWrapper ].forEach( el =>
        {
            if ( el )
            {
                flounder.appendChild( el );
            }
        } );

        let search = this.addSearch( flounder );
        let selectOptions;
        [ data, selectOptions ] = this.buildData( defaultValue, data, optionsList, select );

        this.target.appendChild( wrapper );

        this.refs = { wrapper, flounder, selected, arrow, optionsListWrapper,
                    search, multiTagWrapper, optionsList, select, data, selectOptions };
    }


    /**
     * ## buildData
     *
     * builds both the div and select based options. will skip the select box
     * if it already exists
     *
     * @param {Mixed} defaultValue default entry (string or number)
     * @param {Array} data array with optino information
     * @param {Object} optionsList reference to the div option wrapper
     * @param {Object} select reference to the select box
     *
     * @return _Array_ refs to both container elements
     */
    buildData( defaultValue, originalData, optionsList, select )
    {
        originalData                = originalData || [];
        let index                   = 0;
        let data                    = [];
        let selectOptions           = [];
        let constructElement        = this.constructElement;
        let addOptionDescription    = this.addOptionDescription;
        let selectedClass           = this.selectedClass;
        let escapeHTML              = this.escapeHTML;
        let addClass                = this.addClass;
        let selectRef               = this.refs.select;

        /**
         * ## buildDiv
         *
         * builds an individual div tag for a flounder dropdown
         *
         * @param {Object} dataObj [description]
         * @param {Number} i index
         *
         * @return {DOMElement}
         */
        let buildDiv = function( dataObj, i )
        {
            if ( typeof dataObj !== 'object' )
            {
                dataObj = {
                    text    : dataObj,
                    value   : dataObj
                };
            }
            dataObj.index   = i;

            let extraClass  = i === defaultValue.index ? '  ' + selectedClass : '';

            let res = {
                className       : classes.OPTION + extraClass,
                'data-index'    : i
            };

            for ( let o in dataObj )
            {
                if ( o !== 'text' && o !== 'description' )
                {
                    res[ o ] = dataObj[ o ];
                }
            }

            let data        = constructElement( res );
            let escapedText = escapeHTML( dataObj.text );
            data.innerHTML  = escapedText;

            if ( dataObj.description )
            {
                addOptionDescription( data, dataObj.description );
            }

            data.className += dataObj.extraClass ? '  ' + dataObj.extraClass : '';

            return data;
        };


        /**
         * ## buildOption
         *
         * builds an individual option tag for a flounder dropdown
         *
         * @param {Object} dataObj [description]
         * @param {Number} i index
         *
         * @return {DOMElement}
         */
        let buildOption = function( dataObj, i )
        {
            let selectOption;

            if ( !selectRef )
            {
                selectOption            = constructElement( { tagname : 'option',
                                            className   : classes.OPTION_TAG,
                                            value       : dataObj.value } );
                let escapedText         = escapeHTML( dataObj.text );
                selectOption.innerHTML  = escapedText;
                select.appendChild( selectOption );
            }
            else
            {
                let selectChild     = select.children[ i ];
                selectOption        = selectChild;
                selectChild.setAttribute( 'value', selectChild.value );
            }

            if ( i === defaultValue.index )
            {
                selectOption.selected = true;
            }

            if ( selectOption.getAttribute( 'disabled' ) )
            {
                addClass( data[ i ], classes.DISABLED_OPTION );
            }

            return selectOption;
        };



        originalData.forEach( ( dataObj ) =>
        {
            if ( dataObj.header )
            {
                let section = constructElement( { tagname   : 'div',
                                                className   : classes.SECTION } );
                let header = constructElement( { tagname    : 'div',
                                                className   : classes.HEADER } );
                header.textContent = dataObj.header;
                section.appendChild( header );
                optionsList.appendChild( section );

                dataObj.data.forEach( ( d ) =>
                {
                    data[ index ]           = buildDiv( d, index );
                    section.appendChild( data[ index ] );
                    selectOptions[ index ]  = buildOption( d, index );
                    index++;
                } );
            }
            else
            {
                data[ index ]           = buildDiv( dataObj, index );
                optionsList.appendChild( data[ index ] );
                selectOptions[ index ]  = buildOption( dataObj, index );
                index++;
            }
        } );

        return  [ data, selectOptions ];
    }


    /**
     * ## catchBodyClick
     *
     * checks if a click is on the menu and, if it isnt, closes the menu
     *
     * @param  {Object} e event object
     *
     * @return _Void_
     */
    catchBodyClick( e )
    {
        if ( ! this.checkClickTarget( e ) )
        {
            this.toggleList( e );
        }
    }


    /**
     * ## checkClickTarget
     *
     * checks whether the target of a click is the menu or not
     *
     * @param  {Object} e event object
     * @param  {DOMElement} target click target
     *
     * @return _Boolean_
     */
    checkClickTarget( e, target )
    {
        target = target || this.refs.data[ e.target.getAttribute( 'data-index' ) ] || e.target;

        if ( target === document )
        {
            return false;
        }
        else if ( target === this.refs.flounder )
        {
            return true;
        }


        return this.checkClickTarget( e, target.parentNode );
    }


    /**
     * ## checkFlounderKeypress
     *
     * checks flounder focused keypresses and filters all but space and enter
     *
     * @return _Void_
     */
    checkFlounderKeypress( e )
    {
        if ( e.keyCode === 13 || e.keyCode === 32 )
        {
            e.preventDefault();
            this.toggleList( e );
        }
    }


    /**
     * ## checkPlaceholder
     *
     * clears or readds the placeholder
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    checkPlaceholder( e )
    {
        let type = e.type;
        let refs = this.refs;

        if ( type === 'focus' )
        {
            refs.selected.innerHTML = '';
        }
        else
        {
            if ( refs.multiTagWrapper &&
                    refs.multiTagWrapper.children.length === 0 )
            {
                this.refs.selected.innerHTML = this._default.text;
            }
        }
    }


    /**
     * ## clickSet
     *
     * when a flounder option is clicked on it needs to set the option as selected
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    clickSet( e )
    {
        this.setSelectValue( {}, e );

        if ( !this.multiple || !e[ this.multiSelect ] )
        {
            this.toggleList( e );
        }
    }


    /**
     * ## componentWillUnmount
     *
     * on unmount, removes events
     *
     * @return _Void_
     */
    componentWillUnmount()
    {
        let props       = this.props;
        let refs        = this.refs;

        let events      = props.events;
        let div         = refs.flounder;

        for ( let event in events )
        {
            div.removeEventListener( event, events[ event ] );
        }

        this.removeOptionsListeners();

        refs.selected.removeEventListener( 'click', this.toggleList );

        if ( props.search )
        {
            let search = refs.search;
            search.removeEventListener( 'click', this.toggleList );
            search.removeEventListener( 'keyup', this.fuzzySearch );
        }
    }


    /**
     * ## constructor
     *
     * main constuctor
     *
     * @param {DOMElement} target flounder mount point
     * @param {Object} props passed options
     *
     * @return _Object_ new flounder object
     */
    constructor( target, props )
    {
        if ( !target && !props )
        {
            return this.constructor;
        }

        if ( target.length && typeof target !== 'string' && target.tagName !== 'SELECT' )
        {
            return this.arrayOfFlounders( target, props );
        }
        else if ( target.length === 0 )
        {
            throw ': target length cannot equal 0. Flounder cannot continue';
        }

        this.props = props;
        this.setTarget( target );
        this.bindThis();
        this.initialzeOptions();
        this.onInit();
        this.buildDom();
        this.setPlatform();
        this.onRender();
        this.onComponentDidMount();

        return this.refs.flounder.flounder = this.originalTarget.flounder = this;
    }


    /**
     * ## displayMultipleTags
     *
     * handles the display and management of multiple choice tage
     *
     * @param  {Array} selectedOptions currently selected options
     * @param  {DOMElement} selected div to display currently selected options
     *
     * @return _Void_
     */
    displayMultipleTags( selectedOptions, multiTagWrapper )
    {
        let span, a;

        let removeMultiTag = this.removeMultiTag

        nativeSlice.call( multiTagWrapper.children ).forEach( function( el )
        {
            el.firstChild.removeEventListener( 'click', removeMultiTag );
        } );

        multiTagWrapper.innerHTML = '';

        selectedOptions.forEach( function( option )
        {
            if ( option.value !== '' )
            {
                span           = document.createElement( 'span' )
                span.className = classes.MULTIPLE_SELECT_TAG;

                a              = document.createElement( 'a' )
                a.className    = classes.MULTIPLE_TAG_CLOSE;
                a.setAttribute( 'data-index', option.index );

                span.appendChild( a );

                span.innerHTML += option.innerHTML;

                multiTagWrapper.appendChild( span );
            }
            else
            {
                option.selected = false;
            }
        } );

        this.setTextMultiTagIndent();

        nativeSlice.call( multiTagWrapper.children ).forEach( function( el )
        {
            el.firstChild.addEventListener( 'click', removeMultiTag );
        } );
    }


    /**
     * ## displaySelected
     *
     * formats and displays the chosen options
     *
     * @param {DOMElement} selected display area for the selected option(s)
     * @param {Object} refs element references

     */
    displaySelected( selected, refs )
    {
        let value = [];
        let index = -1;

        let selectedOption  = this.getSelectedOptions();

        let selectedLength  = selectedOption.length;

        if ( !this.multiple || ( !this.multipleTags && selectedLength ===  1 ) )
        {
            index               = selectedOption[0].index;
            selected.innerHTML  = selectedOption[0].innerHTML;
            value               = selectedOption[0].value;
        }
        else if ( selectedLength === 0 )
        {
            let defaultValue = this._default;

            index               = defaultValue.index || -1;
            selected.innerHTML  = defaultValue.text;
            value               = defaultValue.value;
        }
        else
        {
            if ( this.multipleTags )
            {
                selected.innerHTML  = '';
                this.displayMultipleTags( selectedOption, this.refs.multiTagWrapper );
            }
            else
            {
                selected.innerHTML  = this.multipleMessage;
            }

            index = selectedOption.map( function( option )
            {
                return option.index;
            } );

            value = selectedOption.map( function( option )
            {
                return option.value;
            } );
        }

        selected.setAttribute( 'data-value', value );
        selected.setAttribute( 'data-index', index );
    }


    /**
     * ## fuzzySearch
     *
     * searches each option element to see whether it contains a string
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    fuzzySearch( e ) // disclaimer: not actually fuzzy
    {
        e.preventDefault();
        let keyCode = e.keyCode;

        if ( keyCode !== 38 && keyCode !== 40 &&
                keyCode !== 13 && keyCode !== 27 )
        {
            let term        = e.target.value.toLowerCase();

            this.refs.data.forEach( dataObj =>
            {
                let text    = dataObj.innerHTML.toLowerCase();

                if ( term !== '' && text.indexOf( term ) === -1 )
                {
                    this.addClass( dataObj, classes.SEARCH_HIDDEN );
                }
                else
                {
                    this.removeClass( dataObj, classes.SEARCH_HIDDEN );
                }
            } );
        }
        else
        {
            this.setKeypress( e );
            this.setSelectValue( e );
        }
    }


    /**
     * ## fuzzySearchReset
     *
     * resets all options to visible
     *
     * @return _Void_
     */
    fuzzySearchReset()
    {
        let refs = this.refs;

        refs.data.forEach( dataObj =>
        {
            this.removeClass( dataObj, classes.SEARCH_HIDDEN );
        } );

        refs.search.value = '';
    }


    /**
     * ## getActualWidth
     *
     * gets the width adjusted for margins
     *
     * @param {DOMElement} el target element
     *
     * @return _Integer_ adjusted width
     */
    getActualWidth( el )
    {
        let style = getComputedStyle( el );

        if ( el.offsetWidth === 0 )
        {
            if ( this.__checkWidthAgain !== true )
            {
                setTimeout( this.setTextMultiTagIndent.bind( this ), 1500 );
                this.__checkWidthAgain === true;
            }
        }
        else
        {
            this.__checkWidthAgain !== false
        }

        return el.offsetWidth + parseInt( style[ 'margin-left' ] ) +
                                parseInt( style[ 'margin-right' ] );
    }


    /**
     * hideElement
     *
     * hides an element offscreen
     *
     * @param {Object} el element to hide
     *
     * @return _Void_
     */
    hideElement( el )
    {
        this.addClass( el, classes.HIDDEN );
    }


    /**
     * ## initialzeOptions
     *
     * inserts the initial options into the flounder object, setting defaults when necessary
     *
     * @return _Void_
     */
    initialzeOptions()
    {
        this.props                  = this.props || {};
        let props                   = this.props;

        for ( var opt in defaultOptions )
        {
            if ( defaultOptions.hasOwnProperty( opt ) && opt !== 'classes' )
            {
                this[ opt ] = props[ opt ] !== undefined ? props[ opt ] : defaultOptions[ opt ];
            }
            else if ( opt === 'classes' )
            {
                let classes         = defaultOptions[ opt ];
                let propsClasses    = props.classes;

                for ( var clss in classes )
                {
                    this[ clss + 'Class' ] = propsClasses && propsClasses[ clss ] !== undefined ? propsClasses[ clss ] : classes[ clss ];
                }
            }
        }

        if ( !this.multiple )
        {
            this.multipleTags = false;
        }

        if ( this.multipleTags )
        {
            this.selectedClass += '  ' + classes.SELECTED_HIDDEN;
        }
    }


    /**
     * ## initSelectBox
     *
     * builds the initial select box.  if the given wrapper element is a select
     * box, this instead scrapes that, thus allowing php fed elements
     *
     * @param {DOMElement} wrapper main wrapper element
     *
     * @return _DOMElement_ select box
     */
    initSelectBox( wrapper )
    {
        let target = this.target;
        let select;

        if ( target.tagName === 'SELECT' )
        {
            this.addClass( target, classes.SELECT_TAG );
            this.addClass( target, classes.HIDDEN );
            this.refs.select    = target;

            let data = [], selectOptions = [];

            nativeSlice.apply( target.children ).forEach( function( optionEl )
            {
                selectOptions.push( optionEl );
                data.push( {
                    text    : optionEl.innerHTML,
                    value   : optionEl.value
                } );
            } );

            this.data               = data;
            this.target             = target.parentNode;
            this.refs.selectOptions = selectOptions;

            select = this.refs.select;
            this.addClass( select, classes.HIDDEN );
        }
        else
        {
            select = this.constructElement( { tagname : 'select', className : classes.SELECT_TAG + '  ' + classes.HIDDEN } );
            wrapper.appendChild( select );
        }

        return select;
    }


    /**
     * ## onRender
     *
     * attaches necessary events to the built DOM
     *
     * @return _Void_
     */
    onRender()
    {
        let props   = this.props;
        let refs    = this.refs;
        let data    = refs.data;

        if ( !!this.isIos && ( !this.multipleTags || !this.multiple )  )
        {
            let sel     = refs.select;
            this.removeClass( sel, classes.HIDDEN );
            this.addClass( sel, classes.HIDDEN_IOS );
        }


        let self    = this;
        let divertTarget = function( e )
        {
            let index   = this.selectedIndex;

            let _e      = {
                target          : data[ index ]
            };

            if ( self.multipleTags )
            {
                e.preventDefault();
                e.stopPropagation();
            }

            self.setSelectValue( _e );

            if ( !self.multiple )
            {
                self.toggleList( e, 'close' );
            }
        };


        refs.select.addEventListener( 'change', divertTarget  );

        this.addOptionsListeners();

        refs.flounder.addEventListener( 'keydown', this.checkFlounderKeypress );
        refs.selected.addEventListener( 'click', this.toggleList );

        if ( props.search )
        {
            let search = refs.search;
            search.addEventListener( 'click', this.toggleList );
            search.addEventListener( 'keyup', this.fuzzySearch );
            search.addEventListener( 'focus', this.checkPlaceholder );
            search.addEventListener( 'blur', this.checkPlaceholder );
        }
    }


    /**
     * ## removeOptionsListeners
     *
     * removes event listeners on the data divs
     *
     * @return _Void_
     */
    removeOptionsListeners()
    {
        this.refs.data.forEach( dataObj =>
        {
            if ( dataObj.tagName === 'DIV' )
            {
                dataObj.removeEventListener( 'click', this.clickSet );
            }
        } );
    }


    /**
     * ## removeMultiTag
     *
     * removes a multi selection tag on click; fixes all references to value and state
     *
     * @param  {Object} e event object
     *
     * @return _Void_
     */
    removeMultiTag( e )
    {
        e.preventDefault();
        e.stopPropagation();

        let value;
        let index;
        let refs            = this.refs;
        let select          = refs.select;
        let selected        = refs.selected;
        let target          = e.target;
        let defaultValue    = this._default;
        let data            = this.refs.data;
        let targetIndex     = target.getAttribute( 'data-index' );
        select[ targetIndex ].selected = false;

        let selectedOptions = this.getSelectedOptions();

        this.removeClass( data[ targetIndex ], classes.SELECTED_HIDDEN );
        this.removeClass( data[ targetIndex ], classes.SELECTED );

        let span = target.parentNode;
        span.parentNode.removeChild( span );

        if ( selectedOptions.length === 0 )
        {
            index               = defaultValue.index || -1;
            selected.innerHTML  = defaultValue.text;
            value               = defaultValue.value;
        }
        else
        {
            value = selectedOptions.map( function( option )
            {
                return option.value;
            } );

            index = selectedOptions.map( function( option )
            {
                return option.index;
            } );
        }

        this.setTextMultiTagIndent();

        selected.setAttribute( 'data-value', value );
        selected.setAttribute( 'data-index', index );

        this.onSelect( e, this.getSelectedValues() );
    }


    /**
     * ## removeSelectKeyListener
     *
     * disables the event listener on the native select box
     *
     * @return _Void_
     */
    removeSelectKeyListener()
    {
        let select = this.refs.select;
        select.removeEventListener( 'keyup', this.setSelectValue );
    }


    /**
     * ## removeSelectedClass
     *
     * removes the [[this.selectedClass]] from all data
     *
     * @return _Void_
     */
    removeSelectedClass( data )
    {
        data = data || this.refs.data;

        data.forEach( ( dataObj, i ) =>
        {
            this.removeClass( dataObj, this.selectedClass );
        } );
    }


    /**
     * ## removeSelectedValue
     *
     * sets the selected property to false for all data
     *
     * @return _Void_
     */
    removeSelectedValue( data )
    {
        data = data || this.refs.data;

        data.forEach( ( d, i ) =>
        {
            this.refs.select[ i ].selected = false;
        } );
    }


    /**
     * ## setDefaultOption
     *
     * sets the initial default value
     *
     * @param {String or Number}    defaultProp         default passed from this.props
     * @param {Object}              data                this.props.data
     *
     * @return _Void_
     */
    setDefaultOption( configObj, data )
    {
        let defaultObj;
        let self        = this;
        let _data;  // internally reorganized data options

        /**
         * ## setIndexDefault
         *
         * sets a specified indexas the default option. This only works correctly
         * if it is a valid index, otherwise it returns null
         *
         * @return {Object} default settings
         */
        let setIndexDefault = function( _data, index )
        {
            let defaultIndex        = index || index === 0 ? index : configObj.defaultIndex;
            let defaultOption       = _data[ defaultIndex ];

            if ( defaultOption )
            {
                defaultOption.index   = defaultIndex;
                return defaultOption;
            }

            return null;
        };


        /**
         * ## setPlaceholderDefault
         *
         * sets a placeholder as the default option.  This inserts an empty
         * option first and sets that as default
         *
         * @return {Object} default settings
         */
        let setPlaceholderDefault = function( _data )
        {
            let refs        = self.refs;
            let select      = refs.select;

            let _default    = {
                text        : configObj.placeholder,
                value       : '',
                index       : 0,
                extraClass  : classes.HIDDEN
            };

            if ( select )
            {
                let escapedText     = self.escapeHTML( _default.text );
                let defaultOption   = self.constructElement( { tagname : 'option',
                                            className   : classes.OPTION_TAG,
                                            value       :  _default.value } );
                defaultOption.innerHTML = escapedText;

                select.insertBefore( defaultOption, select[0] );
                self.refs.selectOptions.unshift( defaultOption );
            }

            data.unshift( _default );

            return _default;
        };


        /**
         * ## setValueDefault
         *
         * sets a specified index as the default. This only works correctly if
         * it is a valid value, otherwise it returns null
         *
         * @return {Object} default settings
         */
        let setValueDefault = function( _data )
        {
            let defaultProp = configObj.defaultValue + '';
            let index;

            _data.forEach( function( dataObj, i )
            {
                if ( dataObj.value === defaultProp )
                {
                    index = i;
                }
            } );

            let defaultValue = index ? data[ index ] : null;

            if ( defaultValue )
            {
                defaultValue.index = index;
                return defaultValue;
            }

            return null;
        };


        /**
         * ## detectHeaders
         *
         * checks the data object for header options, and sorts it accordingly
         *
         * @return _Boolean_ hasHeaders
         */
        let sortData = function( data, res = [], i = 0 )
        {
            data.forEach( function( d )
            {
                if ( d.header )
                {
                    res = sortData( d.data, res, i );
                }
                else
                {
                    d.index = i;
                    res.push( d );
                    i++;
                }
            } );

            return res;
        };

        _data = sortData( data );

        if ( configObj.placeholder )
        {
            defaultObj =  setPlaceholderDefault( _data );
        }
        else if ( configObj.defaultIndex )
        {
            defaultObj =  setIndexDefault( _data );
        }
        else if ( configObj.defaultValue )
        {
            defaultObj =  setValueDefault( _data );
        }

        return defaultObj || setIndexDefault( _data, 0 ) || setPlaceholderDefault();
    }


    /**
     * ## setKeypress
     *
     * handles arrow key selection
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    setKeypress( e )
    {
        let increment   = 0;
        let keyCode     = e.keyCode;

        if ( this.multipleTags )
        {
            e.preventDefault();
            return false;
        }

        if ( keyCode === 13 || keyCode === 27 || keyCode === 32 ) // space enter escape
        {
            this.toggleList( e );
            return false;
        }
        else if ( !window.sidebar && keyCode === 38 || keyCode === 40 ) // up and down
        {
            e.preventDefault();
            increment = keyCode - 39;
        }
        else if ( ( keyCode >= 48 && keyCode <= 57 ) ||
                ( keyCode >= 65 && keyCode <= 90 ) ) // letters - allows native behavior
        {
            return true;
        }

        let refs                = this.refs;
        let selectTag           = refs.select;
        let data                = refs.data;
        let dataMaxIndex        = data.length - 1;
        let index               = selectTag.selectedIndex + increment;

        if ( index > dataMaxIndex )
        {
            index = 0;
        }
        else if ( index < 0 )
        {
            index = dataMaxIndex;
        }

        selectTag.selectedIndex = index;
        let hasClass            = this.hasClass;
        let dataAtIndex         = data[ index ];

        if ( hasClass( dataAtIndex, classes.HIDDEN ) ||
             hasClass( dataAtIndex, classes.SELECTED_HIDDEN ) ||
             hasClass( dataAtIndex, classes.DISABLED ) )
        {
            this.setKeypress( e );
        }
    }


    /**
     * ## setSelectValue
     *
     * sets the selected value in flounder.  when activated by a click, the event
     * object is moved to the second variable.  this gives us the ability to
     * discern between triggered events (keyup) and processed events (click)
     * for the sake of choosing our targets
     *
     * @param {Object} obj possible event object
     * @param {Object} e event object
     *
     * @return _Void_
     */
    setSelectValue( obj, e )
    {
        let refs        = this.refs;
        let keyCode;

        if ( e ) // click
        {
            this.setSelectValueClick( e );
        }
        else // keypress
        {
            keyCode = obj.keyCode;
            this.setSelectValueButton( obj );
        }

        this.displaySelected( refs.selected, refs );

        if ( !this.___programmaticClick )
        {
            // tab, shift, ctrl, alt, caps, cmd
            let nonKeys = [ 9, 16, 17, 18, 20, 91 ];

            if ( e || ( keyCode && nonKeys.indexOf( keyCode ) === -1 ) )
            {
                if ( this.toggleList.justOpened && !e )
                {
                    this.toggleList.justOpened = false;
                }
                else
                {
                    this.onSelect( e, this.getSelectedValues() );
                }
            }
        }

        this.___programmaticClick = false;
    }


    /**
     * ## setSelectValueButton
     *
     * processes the setting of a value after a keypress event
     *
     * @return _Void_
     */
    setSelectValueButton()
    {
        let refs            = this.refs;
        let data            = refs.data;
        let select          = refs.select;
        let selectedClass   = this.selectedClass;

        let selectedOption;

        this.removeSelectedClass( data );

        let dataArray       = this.getSelectedOptions();
        let baseOption      = dataArray[ 0 ];

        if ( baseOption )
        {
            selectedOption  = data[ baseOption.index ];

            this.addClass( selectedOption, selectedClass );

            this.scrollTo( selectedOption );
        }
    }


    /**
     * ## setSelectValueClick
     *
     * processes the setting of a value after a click event
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    setSelectValueClick( e )
    {
        let _multiple       = this.multiple;
        let refs            = this.refs;
        let selectedClass   = this.selectedClass;
        let index, selectedOption;

        if ( ( !_multiple ||  _multiple && !this.multipleTags && !e[ this.multiSelect ] ) && !this.___forceMultiple )
        {
            this.deselectAll();
        }

        this.___forceMultiple   = false;
        let target              = e.target;

        this.toggleClass( target, selectedClass );
        index                   = target.getAttribute( 'data-index' );

        selectedOption          = refs.selectOptions[ index ];

        selectedOption.selected = selectedOption.selected === true ? false : true;
    }


    /**
     * ## Set Target
     *
     * sets the target related
     *
     * @param {DOMElement} target  the actual to-be-flounderized element
     *
     * @return _Void_
     */
    setTarget( target )
    {
        target      = target.nodeType === 1 ? target : document.querySelector( target );

        this.originalTarget = target;
        target.flounder     = this;

        if ( target.tagName === 'INPUT' )
        {
            this.addClass( target, classes.HIDDEN );
            target.setAttribute( 'aria-hidden', true );
            target.tabIndex = -1;
            target          = target.parentNode;
        }

        this.target = target;
    }


    /**
     * ## setTextMultiTagIndent
     *
     * sets the text-indent on the search field to go around selected tags
     *
     * @return _Void_
     */
    setTextMultiTagIndent()
    {
        let search = this.refs.search;
        let offset = this.defaultTextIndent;

        if ( search )
        {
            let _els = document.getElementsByClassName( classes.MULTIPLE_SELECT_TAG );
            _els.each( ( i, e ) =>
            {
                offset += this.getActualWidth( e );
            } );

            search.style.textIndent = offset + 'px';
        }
    }


    /**
     * ## showElement
     *
     * remove classes.HIDDEN from a given element
     *
     * @param {Object} _el element to show
     *
     * @return _Void_
     */
    showElement( _el )
    {
        this.removeClass( _el, classes.HIDDEN );
    }


    /**
     * ## toggleList
     *
     * on click of flounder--selected, this shows or hides the options list
     *
     * @param {String} force toggle can be forced by passing 'open' or 'close'
     *
     * @return _Void_
     */
    toggleList( e, force )
    {
        let refs        = this.refs;
        let optionsList = refs.optionsListWrapper;
        let wrapper     = refs.wrapper;
        let hasClass    = this.hasClass;

        if ( force === 'open' || force !== 'close' && hasClass( optionsList, classes.HIDDEN ) )
        {
            if ( e.type === 'keydown' )
            {
                this.toggleList.justOpened = true;
            }

            this.toggleOpen( e, optionsList, refs, wrapper );
        }
        else if ( force === 'close' || !hasClass( optionsList, classes.HIDDEN ) )
        {
            this.toggleList.justOpened = false;
            this.toggleClosed( e, optionsList, refs, wrapper );
        }
    }


    /**
     * ## toggleOpen
     *
     * post toggleList, this runs it the list should be opened
     *
     * @param {Object} e event object
     * @param {DOMElement} optionsList the options list
     * @param {Object} refs contains the references of the elements in flounder
     * @param {DOMElement} wrapper wrapper of flounder
     *
     * @return _Void_
     */
    toggleOpen( e, optionsList, refs, wrapper )
    {
        this.addSelectKeyListener();

        if ( !this.isIos || ( this.multipleTags === true && this.multiple === true ) )
        {
            this.showElement( optionsList );
            this.addClass( wrapper, 'open' );

            let qsHTML = document.querySelector( 'html' );

            qsHTML.addEventListener( 'click', this.catchBodyClick );
            qsHTML.addEventListener( 'touchend', this.catchBodyClick );
        }


        if ( !this.multiple )
        {
            let index       = refs.select.selectedIndex;
            let selectedDiv = refs.data[ index ];

            if ( selectedDiv )
            {
                this.scrollTo( selectedDiv  );
            }
        }

        if ( this.props.search )
        {
            refs.search.focus();
        }

        this.onOpen( e, this.getSelectedValues() );
    }


    /**
     * ## toggleClosed
     *
     * post toggleList, this runs it the list should be closed
     *
     * @param {Object} e event object
     * @param {DOMElement} optionsList the options list
     * @param {Object} refs contains the references of the elements in flounder
     * @param {DOMElement} wrapper wrapper of flounder
     *
     * @return _Void_
     */
    toggleClosed( e, optionsList, refs, wrapper )
    {
        this.hideElement( optionsList );
        this.removeSelectKeyListener();
        this.removeClass( wrapper, 'open' );

        let qsHTML = document.querySelector( 'html' );
        qsHTML.removeEventListener( 'click', this.catchBodyClick );
        qsHTML.removeEventListener( 'touchend', this.catchBodyClick );

        if ( this.props.search )
        {
            this.fuzzySearchReset();
        }

        refs.flounder.focus();

        this.onClose( e, this.getSelectedValues() );
    }
}

utils.extendClass( Flounder, utils, api );

export default Flounder;

