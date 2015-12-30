
/* jshint globalstrict: true */
'use strict';

import Flounder from '../core/flounder.jsx';

( function( $ ) {

    $.fn.flounder = function( options )
    {
        let flounderDestroy = Flounder.prototype.destroy;
        let flounder = new Flounder( this, options );

        this.each( function( i, el )
        {
            let _f      = flounder[ i ];
            let $el     = $( el );
            $el.data( 'flounder', _f );

            _f.destroy  = function()
            {
                $el.data( 'flounder', false );
                flounderDestroy.call( _f );
            };
        } );

        return flounder;
    };

}( jQuery ) );
