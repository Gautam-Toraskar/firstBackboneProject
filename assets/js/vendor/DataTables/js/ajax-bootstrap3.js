'use strict';
var sortField="Id";
//alert("sortField");
$(document).ready(function() {
  $( "th" ).on( "click", function() {
    sortField=$( this).text();
  });
  var responsiveHelper = undefined;
  var breakpointDefinition = {
    tablet: 1024,
    phone: 480
  };
  var tableElement = $('#example');

  tableElement.dataTable({
    /*       processing: true,
		serverSide: true,*/
    pagingType: "input",
    autoWidth: false,
    ajax: {
      url: '2500.json',
      data: function ( d ) {
          d.sortField = sortField;
          //alert(d.sortField);
          //d.sortOrder = "myValue";;
          // etc
      }
    },
	    columns: [
        { data: 'id' },
        { data: 'firstname' },
        { data: 'middlename' },
        { data: 'lastname' },
		{ data: 'street' },
        { data: 'taluka' },
        { data: 'state' },
        { data: 'country' },
		{ data: 'pincode' },
        { data: 'landline' },
        { data: 'mobileno' },
        { data: 'education' },
		{ data: 'sex' },
        { data: 'status' }
    ],
    language: {
      paginate: {
        first: "<i class='glyphicon glyphicon-backward'></i>",
        previous: "<i class='glyphicon glyphicon-chevron-left'></i>",
        next: "<i class='glyphicon glyphicon-chevron-right'></i>",
        last: "<i class='glyphicon glyphicon-forward'></i>"
      },
    },

    preDrawCallback: function() {
      // Initialize the responsive datatables helper once.
      if (!responsiveHelper) {
        responsiveHelper = new ResponsiveDatatablesHelper(tableElement, breakpointDefinition);
      }
    },
    rowCallback: function(nRow) {
      responsiveHelper.createExpandIcon(nRow);
    },
    drawCallback: function(oSettings) {
      responsiveHelper.respond();
    }
  });

});

//To add entry into table
$(document).ready(function() {
  var t = $('#example').DataTable();
  var counter = 1;

  $('#addRow').on('click', function() {
    t.row.add([
      counter + '.1',
      counter + '.2',
      counter + '.3',
      counter + '.4',
      counter + '.5',
      counter + '.6',
      counter + '.7',
      counter + '.8',
      counter + '.9',
      counter + '.10',
      counter + '.11',
      counter + '.12',
      counter + '.13',
      counter + '.14'
    ]).draw();

    counter++;
  });
/*});
$(document).ready(function() {*/
  var table = $('#example').DataTable();

  /*    $('#example tbody').on( 'click', 'tr', function () {
		$(this).toggleClass('success');
	} );*/

  $('#example tbody').on('click', 'tr', function() {
    if ($(this).hasClass('success')) {
      $(this).removeClass('success');
    } else {
      table.$('tr.success').removeClass('success');
      $(this).addClass('success');
    }
  });

  $('#rowcount').click(function() {
    alert(table.rows('.success').data().length + ' row(s) selected');
  });

  $('#delete').click(function() {
    $('tr.success').each(function() {
      alert($(this).find('td').eq(0).text());
    });
    table.row('.success').remove().draw(false);
  });

  $( "th" ).on( "click", function() {
  var sortField=$( this).text();

  });
});