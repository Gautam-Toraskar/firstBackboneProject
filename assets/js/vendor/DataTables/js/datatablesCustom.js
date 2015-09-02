//for overriding default error messages of datatables and adding custom error messages based on status
$.fn.dataTable.defaults.ajax = {
  error: function(xhr, status, error) {
    if (xhr.status == "404") {
      // alert("issue in backend data source!!!");  
      bootbox.alert("An error occured while processing request. Please try again later!", function() {});
      xhr.abort();
    } else if (xhr.status == "500") {
      bootbox.alert("An error occured while processing request. Please try again later!", function() {});
      xhr.abort();
    }
  }
};

$(window).load(function(event) {
  var searchTerm = "";
  var searchbox;

});


function activateAfterInitProcedure(tableIdRaw, multiselect, selectedUserIds, showUserSelector) {
  // alert("hit after init functions");
  var dataTableLengthHtml, parentDataTableLengthHtml, dataTableInfoHtml, parentDataTableInfoHtml;
  var dataTableLength, tableId;
  var dataTableInfo, dataTableWrapper;
  var parentOfDataTable;
  var searchTerm;
  var selectAllSelectedFlag = false;
  // setting up the ids
  dataTableWrapper = "#" + tableIdRaw + "_wrapper";
  var main = this;
  this.selectedUserIds = selectedUserIds;
  this.multiselect = multiselect;
  this.tableInitComplete = true;
  // console.log("+++list:" + this.selectedUserIds.length);
  tableId = "#" + tableIdRaw;
  this.tableId = tableId;
  this.selectedFlag = false, this.rowId = "";
  dataTableLength = "#" + tableIdRaw + "_" + "length";
  dataTableInfo = "#" + tableIdRaw + "_" + "info";


  /*console.log("dataTablewrapper: " + dataTableWrapper);
		console.log("tableId: " + tableId);
		console.log("dataTableLength: " + dataTableLength);
		console.log("dataTableInfo: " + dataTableInfo);*/

  jQuery.fn.oHTML = function(s) {
    return s ? this.before(s).remove() : jQuery("<p>").append(this.eq(0).clone()).html();
  };

  // parents
  function returnArray() {
    return this.selectedArray;
  }

  // adding to initialisation function
  $(tableId).on("rowCallback")

  parentDataTableLengthHtml = $(dataTableLength).parent().addClass("dataTableInfoMod");
  parentDataTableInfoHtml = $(dataTableInfo).parent().addClass("dataTableLengthMod");
  parentOfDataTable = $(tableId).parent();

  dataTableLengthHtml = $(dataTableLength).find("select")[0].outerHTML;
  // dataTableLengthHtml = $(dataTableLength)[0].outerHTML;
  dataTableInfoHtml = $(dataTableInfo).html();

  $(parentDataTableLengthHtml).empty();
  $(parentDataTableInfoHtml).empty();

  // console.log(dataTableLengthHtml);

  if (multiselect) {
    $(dataTableWrapper).find(".dataTableInfoMod").append("<div class='checkbox'><label><input class='selectAll' type='checkbox'>select all</label></div>");
  }

  $(dataTableWrapper).find(".dataTableLengthMod").append("<span style='margin-right:5px;'>page size:</span>");


  $(dataTableWrapper).find(".dataTableLengthMod").append(dataTableLengthHtml);


  $(dataTableWrapper).find(".dataTableLengthMod").append('<button class="btn btn-default datatable-glys-btn btn-refresh"><i class="ion-ios7-refresh-empty datatable-glys"></i></button>');

  $(dataTableWrapper).find(".dataTableLengthMod select").on("change", function(event) {
    console.log($(this).val());
    $(tableId).DataTable().page.len($(this).val()).draw();
  });

  $(dataTableWrapper).find('button.btn-refresh').click(function(event) {
    $(tableId).DataTable().draw();
  });
  /**
   * initialising select dropdown for page size.
   */
  $(dataTableWrapper).find(".dataTableLengthMod select").selecter({
    callback: function() {
      $(dataTableWrapper).find(".selectAll").trigger("clearSelectAll");
    }
  });
  /**
   * initialising checkbox for select all
   */
  $(dataTableWrapper).find(".selectAll").iCheck({
    handle: 'checkbox',
    checkboxClass: 'icheckbox_flat',
    checkedClass: 'checked',
    cursor: true,
  });

  /*select all checkbox when checked*/
  $(dataTableWrapper).find(".selectAll").on('ifChecked', function(event) {
    selectAllSelectedFlag = true;

    $(tableId).find('tr').each(function() {
      var id = $(this).find("td").eq(0).text();
      var index = $.inArray(id, main.selectedUserIds);
      singleSelectionFlag = false;
      if (index === -1 && id != '') {
        if (main.selectedUserIds.length != 100) {
          main.selectedUserIds.push(id);
          // console.log("Ids main.selectedUserIds: " + main.selectedUserIds);
          $(this).addClass('success');
        } else {
          alert("Max 100 entries allowed!");
        }
      } else {
        // this.selectedUserIds.splice(index, 1);
        // $(this).removeClass('success');
      }
    });
    console.log("selected userids: "+main.selectedUserIds);
  });
  /*select all checkbox when unchecked*/
  $(dataTableWrapper).find(".selectAll").on('ifUnchecked', function(event) {

    if (selectAllSelectedFlag) {
      $(dataTableWrapper).find(".selectAll").trigger("clearSelectAll");
    }
    // console.info("unchecking select");
  });

  $(tableId).on("click", "tbody tr",function(event) {
    var id = $(this).find("td").eq(0).text();
    var countRows = $(tableId + " tbody tr").length;
    var selectedRows = $(tableId + " tbody tr.success").length;
    // console.log("rows are " + countRows + "\nSelected rows are: " + selectedRows);

    if (countRows == selectedRows) {
      // console.log("all are selected");
      $(".selectAll").iCheck('check');
    } else {
      $(".selectAll").iCheck('uncheck');
      // console.log("none or some are selected");
    }

    if (multiselect) {
      if ($(this).hasClass("success")) {
        // console.log("onclick unselected id"+id);
        $(dataTableWrapper).find(".selectAll").trigger("clearSelectedTr", [id]);
        $(this).removeClass('success');
      } else {
        if (main.selectedUserIds.length != 100) {
          main.selectedUserIds.push(id);
          // console.log("Ids main.selectedUserIds: " + main.selectedUserIds);
          $(this).addClass('success');
        } else {
          alert("Max 100 entries allowed!");
        }
      }
    } else {
      // console.log("multiselect is "+multiselect);
      if ($(this).hasClass('success')) {
        $(this).removeClass('success');
        this.selectedFlag = false;
        // console.log("deselecting the row");
      } else {
        $(this).find("td i.remove").addClass("active");
        $(this).find("td i.add").addClass("active");
        $(tableId).find('tr.success').removeClass('success');
        $(this).addClass('success');
        main.rowId = $(this).find('td').eq(0).text();
        main.selectedFlag = true;
        // console.log("Selecting the row: "+main.rowId);
      }
    }

  });
  /**
   * search functionality for data tables
   * @param  {[type]} event) {			searchbox [description]
   * @return {[type]}        [description]
   */
  $(tableId).on("init.dt", function(event) {

    searchbox = $(tableId).parent().find("input[type='search']");
    
    searchbox.unbind();

    parentOfDataTable.find(".dataTables_filter label").append("<i class='searchBtnIcon glyphicon glyphicon-search'></i>");
    searchbox.on("keyup", function(event) {
      var code = event.keyCode || event.which;
      if (code == 13) {
        // move to parent and then find search field n get value of it.
        searchTerm = $(this).val();
        console.log("hit keyup: " + searchTerm);
        console.log($(tableId).attr("id"));
        $(tableId).DataTable().search(searchTerm).draw();
        $(dataTableWrapper).find(".selectAll").trigger("clearSelectAll");
      }
    });

    parentOfDataTable.find("i.searchBtnIcon").on("click", function (event) {
    	searchTerm = parentOfDataTable.find('.dataTables_filter input').val();
    	console.log("hit click: " + searchTerm);
    	$(tableId).DataTable().search(searchTerm).draw();
    	$(dataTableWrapper).find(".selectAll").trigger("clearSelectAll");
    })
  });

  $(tableId).on('draw.dt', function() {
    var countRows = $(tableId + " tbody tr").length;
    var selectedRows = $(tableId + " tbody tr.success").length;
    if (countRows == selectedRows) {
      $(".selectAll").iCheck('check');
    } else {
      $(".selectAll").iCheck('uncheck');
    }

    if(multiselect){
      $(this).find("tbody tr").each(function() {
        if ($.inArray($(this).find('td').eq(0).text(), main.selectedUserIds) !== -1) {
          $(this).addClass('success');
          console.log("" + $(this).find('td').eq(0).text());
        }
      });  
    } else {
      $(this).find("tbody tr").each(function () {
        if($(this).find('td').eq(0).text() == main.rowId){
          $(this).addClass('success');
          console.log("" + $(this).find('td').eq(0).text());
          return false;
        }
      })
    }
  });

  $(dataTableWrapper).find(".selectAll").on("clearSelectAll", function(event) {
    // console.log("clearing select all");
    selectAllSelectedFlag = false;
    $(dataTableWrapper).find(".selectAll").iCheck('uncheck');
    $(tableId).find('tr').each(function() {
      var id = $(this).find("td").eq(0).text();
      var index = $.inArray(id, main.selectedUserIds);
      if (index > -1 && id != '') {
        main.selectedUserIds.splice(index, 1);
        $(this).removeClass('success');
      }
    });
    console.log("in trigger clear all: "+main.selectedUserIds);
  });

  $(dataTableWrapper).find(".selectAll").on("clearSelectedTr", function(event, unSelectedId) {
    selectAllSelectedFlag = false;
    var index = $.inArray(unSelectedId, main.selectedUserIds);
    if (index > -1 && unSelectedId != '') {
      $(dataTableWrapper).find(".selectAll").iCheck('uncheck');
      main.selectedUserIds.splice(index, 1);
    }
    console.log("main.selectedUserIds: "+main.selectedUserIds);
  });

  $(dataTableWrapper).find("button.btn-refresh").on("click", function(event) {
    $(dataTableWrapper).find(".selectAll").trigger("clearSelectAll");
  });
}

activateAfterInitProcedure.prototype.getSelectedUserIds = function() {  

  if(this.multiselect === true){
    console.log("calling getSelectedIds:" + this.selectedUserIds);
    return this.selectedUserIds;
  } else {
    console.log("rowId selected is:" + this.rowId);
    return {
      rowId:this.rowId,
      selectedFlag : this.selectedFlag
    };
  }

}

activateAfterInitProcedure.prototype.resetSelectedUserIds = function() {
  this.selectedUserIds.length = 0;
}

activateAfterInitProcedure.prototype.refresh = function() {
  console.log("drawing " + this.tableId);
  $(this.tableId).DataTable().draw();
}
