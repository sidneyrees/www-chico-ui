var menu = $('#versions').accordion().select(1);



var map = {}

$.getJSON("/data/inheritanceMap.js", function(data){

    map = data;
    custom.populate();
    
    $("#components input, #utils input").change(function(e){
        
        var c = map[$(this).val()];
        
        custom.action = (!$(this).attr("checked")) ? custom.unCheckIt : custom.checkIt ;
        
        // Check the map
        custom.checkMap(c);
    
    });
});
var help = {
    
    _list: [],
    
    init: function() {
    
        var a = "<p><a href=\"#\">Turn off help layers.</a></p>";
        
    },
    
    add: function(o) {},
    
    on: function() {},
    
    off: function() {}
    
}
var custom = {
    
    components: [],
    
    utils: [],
    
    populate: function() {
        
        for (var c in map) {
            
            var value = c.toString();
            var type = (value == "Object") ? "abstract" : map[c].type ;
            var appendTo = (function() {
                
                switch ( type ) {
                    case "class": 
                        return "#components";
                    case "interface":
                        return "#components > li:last-child";
                    case "abstract":
                        return "#abstracts";
                    case "util":
                        return "#utils";
                    
                }
                                
            })(); 
                
            var className = type;

            // A disabled field wont be sending any information trough a post request.
            var disabled = (type == "abstract!!") ? "disabled=\"disabled\"" : "" ;
            
            map[c]["dom"] = $("<li class=\""+className+"\"><label><input type=\"checkbox\" value=\""+value+"\" name=\"" + type + "\" "+disabled+" checked=\"checked\"> <span>"+c+"</span></label>")
                .appendTo( appendTo );
                /*.tooltip("<p>" + map[c].description + "<br />Father class: " + map[c].augments + ( (map[c].requires)? "<br />Requires: " + map[c].requires : "" ) +"</p>")
                .position({ offset: "25 10" });*/
        }    
    },
    checkIt: function(c) {

        console.log( $("input[value="+c+"]") );

        $("input[value="+c+"]").attr("checked","checked");
    },
    
    unCheckIt: function(c) {
    
        if (custom.isShared(c)) { 
            return;
        }
    
        $("input[value="+c+"]").removeAttr("checked");
    },
    
    isShared: function(c) {
        
        var r = false;
        
        $("input:checked").each(function(event){
        
            var t = map[$(this).val()];
            
            if (!t) return;
            
            if (t.augments && c == t.augments) {
                r = true;    
            }
                    
            if (t.depends) {
                if (t.depends.join(",").indexOf(c) > -1) {
                    r = true;
                }
            }
    
        });
        
        return r;    
    },
    
    checkMap: function( c ) {
    
        if ( !c ) { return; }
        
        if (c.type === "interface") {

            $( c.dom ).parent().find("input").each(function(i,e) {
                custom.action( $(this).val() );
            });

        } else {
            
            if (c.augments) {
                custom.action( c.augments );
                custom.checkMap( map[c.augments] );
            }   

            if (c.requires) {
                
                $(c.requires).each(function(i,e){        
                    custom.action( e );
                    custom.checkMap( map[e] );
                });  
            }
        }
    }
};
        