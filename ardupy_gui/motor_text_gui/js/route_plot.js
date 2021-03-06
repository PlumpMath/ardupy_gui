
var update_nodenumbers = function(){
    var n_nodes = $('.path_node').length;
    if(n_nodes == 0){ 
        $('#no_nodes').show();
    }else{
        var count = 1;
        $('.node_num').each(function(){
            $(this).html(count+'.');
            count++;
        });
        var count = 1;
        $('.path_node').each(function(){
            $(this).attr('num',count);
            count++;
        });
    }
    draw_path();
};

var coord_keydown = function(event){
   if(event.keyCode == 13)
       $(this).siblings('.wait').focus(); 

   if((event.key == ' ' && $(this).val().indexOf(' ') != -1) || 
      (event.key == ',' && $(this).val().indexOf(',') !=-1)){
       event.preventDefault();
       $(this).siblings('.wait').focus(); 
   } 
}

var wait_keydown = function(event){
  if(event.keyCode == 13 || event.key == ' ' ||
          (event.keyCode == 9 && !event.shiftKey)){
      event.preventDefault();
      var next_node = 1+Number($(this).siblings('.node_num').html());
      $('.node_num:contains("'+next_node+'")').siblings('.coord').focus();
      //check that the focus was moved off this
      if($(this).is(':focus')){
          append_node($(this).closest('.path_node'));
          var next_node = 1+Number($(this).siblings('.node_num').html());
          $('.node_num:contains("'+next_node+'")').siblings('.coord').focus();
      }
  }
};

var form_verify = function(form,regex){
    if(regex.test(form.val())){
        form.removeClass('alert-danger');
    } else {
        form.addClass('alert-danger');
    }
};

var append_node = function(idx,focus_new){
    console.log(idx);
    $('.path_node.active').removeClass('active');
    $('#no_nodes').hide();
    var n_nodes = $('.path_node').length+1;
    var coord_id = "coord_"+n_nodes;
    var wait_id = "wait_"+n_nodes;
    var new_node = $(`<li class="col-12 path_node active" num=${n_nodes}>
          <div class="row">
            <div class="col-12">
                <span>
                <span class="node_num">${n_nodes}.</span>
                Go to <input class="coord" id=${coord_id} placeholder="     ," type="text">,
                wait <input class="wait" id=${wait_id} placeholder="0" type="text">s
                </span>

                <span class='node_opts'>
                   <b class='node_add node-click'>+</b>
                   <span class='node_close node-click'>&#10006;</span>
                </span>
            </div>
           </div>
          </li>`);

    if(idx == undefined){
        $('#path_nodes').append(new_node);
        new_node.find('.coord').val("0, 0");
    }else{
        idx.after(new_node); 
        new_node.find('.coord').val(idx.find('.coord').val());
        new_node.find('.wait').val(idx.find('.wait').val());
    }
    //unbind previous function attachments so that things are
    //only called once
    $('.node_close, .node_add').unbind('click');

    $('.node_close').click(function(){
        $(this).closest('.path_node').remove();
        update_nodenumbers();
    });
    
    $('.node_add').click(function(){
        append_node($(this).closest('.path_node'));
    });

    //unbind previous function attachments so that things are
    //only called once
    $('.coord, .wait, .path_node')
        .unbind('keydown')
        .unbind('click')
        .unbind('change');

    $('.coord, .wait, .path_node').click(function(){
        $('.path_node.active').removeClass('active');
        $(this).closest('.path_node').addClass('active');
        draw_path();
    });
    $('.coord, .wait').focus(function(){
        $(this).trigger('click');
    });
    $('.coord').keydown(coord_keydown);
    $('.coord').change(function(){
        form_verify($(this),/^[\s*,*[0-9]+[,|\s]+[0-9]+\s*,*]?$/);
        draw_path();
    });
    $('.wait').keydown(wait_keydown);
    $('.wait').change(function(){
        form_verify($(this),/^[\s*,*[0-9]+\s*,*]?$/);
        draw_path();
    });
    update_nodenumbers();
    if(!focus_new) return;
    if(idx === undefined){
        var to_focus;
        $($('.coord').get().reverse()).each(function(){
            if(!$(this).val()){
                to_focus = $(this);
            }
        }); 
        to_focus.focus();
    } else {
        var next_n = Number(idx.attr('num'))+1;
        $('[num="'+next_n+'"]').find('.coord').focus();
    }
};



$(document).ready(function(){
    $('#path_nodes').sortable({update:update_nodenumbers});
    $('#add_node').click(function(){append_node()});
    $('#clear_nodes').click(function(){
        save_nodes();
        $('#path_nodes').empty();
        $('#no_nodes').show();
        draw_path();
        append_node();
    });
    $(window).bind("beforeunload", function(){
        save_nodes();
    });

    $('#send').click(function(){
        var tot_delay = 1;
        $('.coord').each(function(){
            var coord = $(this);
            setTimeout(function(){
                external.send_coords(coord.val());
            }, (tot_delay++)*500);
        });
    });
    //set the max height of the path-node div and make it scrollable
    $(window).resize(function(){
        var plot_end = $('#path_plot').offset().top+$('#path_plot').height();
        var max_node_height = plot_end - $('#path_nodes').offset().top;
        $('#path_nodes').css('max-height',max_node_height);

    }).trigger('resize');
    restore_nodes(append_node);
});
